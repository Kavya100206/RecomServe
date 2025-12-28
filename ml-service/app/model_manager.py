"""
Model Manager
Handles model versioning, loading, and management
Lightweight implementation for student-level production system
"""

import os
import pickle
import json
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

load_dotenv()


class ModelManager:
    """Manages ML model versions and loading"""
    
    def __init__(self, model_dir='models'):
        """
        Initialize model manager
        
        Args:
            model_dir: Directory where models are stored
        """
        self.model_dir = model_dir
        self.db_url = os.getenv('DATABASE_URL')
        self.loaded_model = None
        self.loaded_version = None
    
    def load_model(self, version=None):
        """
        Load a specific model version or the active model
        
        Args:
            version: Model version to load (e.g., 'v1.0'). If None, loads active model
            
        Returns:
            dict: Model data including model, mappers, and predictions
        """
        if version is None:
            # Load active model
            version = self.get_active_version()
            if not version:
                raise ValueError("No active model found in database")
        
        model_path = os.path.join(self.model_dir, f'nmf_model_{version}.pkl')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        print(f"📦 Loading model {version} from {model_path}...")
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.loaded_model = model_data
        self.loaded_version = version
        
        print(f"✅ Model {version} loaded successfully!")
        return model_data
    
    def get_active_version(self):
        """
        Get the currently active model version from database
        
        Returns:
            str: Active model version or None
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT version FROM models 
                WHERE is_active = true 
                ORDER BY trained_at DESC 
                LIMIT 1
            """)
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            return result[0] if result else None
            
        except Exception as e:
            print(f"⚠️  Database error: {e}")
            return None
    
    def list_models(self):
        """
        List all available models from database
        
        Returns:
            list: List of model metadata dictionaries
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT version, algorithm, is_active, trained_at, metrics, hyperparameters
                FROM models
                ORDER BY trained_at DESC
            """)
            
            columns = ['version', 'algorithm', 'is_active', 'trained_at', 'metrics', 'hyperparameters']
            models = []
            
            for row in cursor.fetchall():
                model_info = dict(zip(columns, row))
                # Convert trained_at to string
                model_info['trained_at'] = model_info['trained_at'].isoformat() if model_info['trained_at'] else None
                models.append(model_info)
            
            cursor.close()
            conn.close()
            
            return models
            
        except Exception as e:
            print(f"⚠️  Database error: {e}")
            return []
    
    def set_active_model(self, version):
        """
        Set a specific model version as active
        
        Args:
            version: Model version to activate
            
        Returns:
            bool: True if successful
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            # Deactivate all models
            cursor.execute("UPDATE models SET is_active = false")
            
            # Activate specified version
            cursor.execute("""
                UPDATE models 
                SET is_active = true 
                WHERE version = %s
            """, (version,))
            
            if cursor.rowcount == 0:
                print(f"⚠️  Model version {version} not found in database")
                conn.rollback()
                return False
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Model {version} set as active")
            return True
            
        except Exception as e:
            print(f"❌ Failed to set active model: {e}")
            return False
    
    def get_model_info(self, version):
        """
        Get detailed information about a specific model
        
        Args:
            version: Model version
            
        Returns:
            dict: Model metadata
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT version, algorithm, is_active, trained_at, metrics, hyperparameters
                FROM models
                WHERE version = %s
            """, (version,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not result:
                return None
            
            columns = ['version', 'algorithm', 'is_active', 'trained_at', 'metrics', 'hyperparameters']
            model_info = dict(zip(columns, result))
            model_info['trained_at'] = model_info['trained_at'].isoformat() if model_info['trained_at'] else None
            
            return model_info
            
        except Exception as e:
            print(f"⚠️  Database error: {e}")
            return None
    
    def get_recommendations(self, user_id, n=10):
        """
        Get recommendations using loaded model
        
        Args:
            user_id: User UUID
            n: Number of recommendations
            
        Returns:
            list: Recommended content IDs with scores
        """
        if self.loaded_model is None:
            self.load_model()  # Load active model
        
        user_mapper = self.loaded_model['user_mapper']
        predictions = self.loaded_model['predictions']
        reverse_content_mapper = self.loaded_model['reverse_content_mapper']
        
        # Check if user exists
        if user_id not in user_mapper:
            print(f"⚠️  User {user_id} not found in training data (cold start)")
            return []
        
        # Get user's predicted ratings
        user_idx = user_mapper[user_id]
        user_ratings = predictions[user_idx]
        
        # Get top N
        top_indices = user_ratings.argsort()[::-1][:n]
        
        # Convert to content IDs
        recommendations = [
            {
                'content_id': reverse_content_mapper[idx],
                'score': float(user_ratings[idx])
            }
            for idx in top_indices
        ]
        
        return recommendations


# Test the model manager
if __name__ == "__main__":
    print("="*80)
    print("🧪 Testing Model Manager")
    print("="*80)
    
    manager = ModelManager()
    
    # Test 1: List all models
    print("\n1️⃣ Listing all models:")
    models = manager.list_models()
    for model in models:
        active = "✅ ACTIVE" if model['is_active'] else ""
        print(f"  {model['version']} ({model['algorithm']}) - {model['trained_at']} {active}")
        if model['metrics']:
            print(f"    Metrics: {model['metrics']}")
    
    # Test 2: Get active version
    print("\n2️⃣ Getting active model version:")
    active_version = manager.get_active_version()
    print(f"  Active: {active_version}")
    
    # Test 3: Load active model
    print("\n3️⃣ Loading active model:")
    model_data = manager.load_model()
    print(f"  Model loaded: {manager.loaded_version}")
    print(f"  Users in model: {len(model_data['user_mapper'])}")
    print(f"  Content in model: {len(model_data['content_mapper'])}")
    
    # Test 4: Get recommendations for a sample user
    print("\n4️⃣ Testing recommendations:")
    sample_users = list(model_data['user_mapper'].keys())[:2]
    for user_id in sample_users:
        print(f"\n  User: {user_id[:8]}...")
        recs = manager.get_recommendations(user_id, n=5)
        print("  Top 5 recommendations:")
        for i, rec in enumerate(recs, 1):
            print(f"    {i}. {rec['content_id'][:8]}... (score: {rec['score']:.2f})")
    
    print("\n" + "="*80)
    print("✅ Model Manager test complete!")
    print("="*80)
