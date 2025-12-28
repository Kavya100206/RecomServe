"""
Model Training (sklearn version)
Trains collaborative filtering model using NMF (Non-negative Matrix Factorization)
Similar to SVD but uses sklearn instead of Surprise
"""

import os
import pickle
import json
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.decomposition import NMF
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import psycopg2

from data_loader import DataLoader
from preprocessor import Preprocessor


class ModelTrainer:
    """Handles ML model training and evaluation using sklearn"""
    
    def __init__(self):
        """Initialize trainer"""
        self.model = None
        self.user_mapper = {}  # Maps UUIDs to indices
        self.content_mapper = {}  # Maps UUIDs to indices
        self.reverse_user_mapper = {}
        self.reverse_content_mapper = {}
        self.metrics = {}
        
    def prepare_data(self):
        """
        Load and prepare data for training
        
        Returns:
            tuple: (user-item matrix, ratings_df)
        """
        print("📥 Loading data from database...")
        
        # Load interactions
        loader = DataLoader()
        interactions = loader.fetch_interactions()
        
        # Preprocess to ratings
        preprocessor = Preprocessor()
        ratings_df = preprocessor.convert_events_to_ratings(interactions)
        
        # Create user-item matrix
        matrix = preprocessor.get_user_item_matrix(ratings_df)
        
        # Create ID mappers (UUID → integer index)
        self.user_mapper = {uid: idx for idx, uid in enumerate(matrix.index)}
        self.content_mapper = {cid: idx for idx, cid in enumerate(matrix.columns)}
        self.reverse_user_mapper = {idx: uid for uid, idx in self.user_mapper.items()}
        self.reverse_content_mapper = {idx: cid for cid, idx in self.content_mapper.items()}
        
        print(f"✓ Dataset ready:")
        print(f"  Users: {len(self.user_mapper)}")
        print(f"  Content: {len(self.content_mapper)}")
        print(f"  Ratings: {(matrix > 0).sum().sum()}")
        
        return matrix.values, ratings_df
    
    def create_model(self, n_components=50, max_iter=200):
        """
        Create NMF model
        
        Args:
            n_components: Number of latent factors (like n_factors in SVD)
            max_iter: Maximum iterations
            
        Returns:
            NMF model instance
        """
        model = NMF(
            n_components=n_components,
            init='random',
            random_state=42,
            max_iter=max_iter,
            verbose=1
        )
        
        print(f"\n🤖 Created NMF model:")
        print(f"  Latent factors: {n_components}")
        print(f"  Max iterations: {max_iter}")
        
        return model
    
    def train_model(self, user_item_matrix):
        """
        Train the model
        
        Args:
            user_item_matrix: numpy array of ratings
        """
        print("\n🎓 Training model...")
        
        # Create model
        self.model = self.create_model(n_components=50)
        
        # Train (factorize matrix into W and H)
        # user_item_matrix ≈ W × H
        # W = user features, H = item features
        self.W = self.model.fit_transform(user_item_matrix)
        self.H = self.model.components_
        
        # Reconstruction (predicted ratings)
        self.predictions = np.dot(self.W, self.H)
        
        print("✓ Model training complete!")
    
    def evaluate_model(self, user_item_matrix, ratings_df):
        """
        Evaluate model performance
        
        Args:
            user_item_matrix: Original ratings matrix
            ratings_df: DataFrame with ratings
        """
        print("\n📊 Evaluating model...")
        
        # Get non-zero entries (actual ratings)
        mask = user_item_matrix > 0
        actual_ratings = user_item_matrix[mask]
        predicted_ratings = self.predictions[mask]
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(actual_ratings, predicted_ratings))
        mae = mean_absolute_error(actual_ratings, predicted_ratings)
        
        self.metrics = {
            'rmse': round(float(rmse), 4),
            'mae': round(float(mae), 4),
            'num_ratings': int(mask.sum()),
            'reconstruction_error': round(float(self.model.reconstruction_err_), 4)
        }
        
        print(f"\n✅ Evaluation Results:")
        print(f"  RMSE: {self.metrics['rmse']}")
        print(f"  MAE:  {self.metrics['mae']}")
        print(f"  Reconstruction Error: {self.metrics['reconstruction_error']}")
        
        # Interpret results
        if rmse < 1.0:
            print("  📈 Excellent! RMSE < 1.0")
        elif rmse < 1.5:
            print("  👍 Good! RMSE < 1.5")
        else:
            print("  ⚠️  Could be better. Model is learning but has room for improvement.")
        
        return self.metrics
    
    def get_top_n_recommendations(self, user_id, n=10):
        """
        Get top N recommendations for a user
        
        Args:
            user_id: User UUID
            n: Number of recommendations
            
        Returns:
            list: Content IDs ranked by predicted rating
        """
        if user_id not in self.user_mapper:
            return []
        
        user_idx = self.user_mapper[user_id]
        user_ratings = self.predictions[user_idx]
        
        # Get top N indices
        top_indices = np.argsort(user_ratings)[::-1][:n]
        
        # Convert back to content IDs
        recommendations = [
            (self.reverse_content_mapper[idx], float(user_ratings[idx]))
            for idx in top_indices
        ]
        
        return recommendations
    
    def test_predictions(self, num_users=3):
        """
        Test predictions for sample users
        
        Args:
            num_users: Number of users to test
        """
        print(f"\n🧪 Testing recommendations for {num_users} sample users...\n")
        
        sample_users = list(self.user_mapper.keys())[:num_users]
        
        for user_id in sample_users:
            recs = self.get_top_n_recommendations(user_id, n=5)
            print(f"User: {user_id[:8]}...")
            print("Top 5 Recommendations:")
            for i, (content_id, score) in enumerate(recs, 1):
                print(f"  {i}. Content {content_id[:8]}... (score: {score:.2f})")
            print()
    
    def save_model(self, version='v1.0', model_dir='models'):
        """
        Save trained model and mappers
        
        Args:
            version: Model version
            model_dir: Directory to save files
        """
        os.makedirs(model_dir, exist_ok=True)
        
        # Save model
        model_data = {
            'nmf_model': self.model,
            'W': self.W,
            'H': self.H,
            'predictions': self.predictions,
            'user_mapper': self.user_mapper,
            'content_mapper': self.content_mapper,
            'reverse_user_mapper': self.reverse_user_mapper,
            'reverse_content_mapper': self.reverse_content_mapper
        }
        
        model_path = os.path.join(model_dir, f'nmf_model_{version}.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"\n💾 Model saved: {model_path}")
        
        # Save metadata to database
        self.save_metadata_to_db(version)
        
        return model_path
    
    def save_metadata_to_db(self, version):
        """Save model metadata to PostgreSQL"""
        try:
            db_url = os.getenv('DATABASE_URL')
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO models (version, algorithm, is_active, trained_at, metrics, hyperparameters)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (version) DO UPDATE
                SET is_active = EXCLUDED.is_active,
                    trained_at = EXCLUDED.trained_at,
                    metrics = EXCLUDED.metrics
            """, (
                version,
                'NMF',
                True,
                datetime.now(),
                json.dumps(self.metrics),
                json.dumps({'n_components': 50, 'max_iter': 200})
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"📋 Metadata saved to database")
        except Exception as e:
            print(f"⚠️  Failed to save metadata to DB: {e}")


# Main training script
if __name__ == "__main__":
    print("="*80)
    print("🚀 ML RECOMMENDATION MODEL TRAINING")
    print("="*80)
    
    trainer = ModelTrainer()
    
    # Step 1: Prepare data
    user_item_matrix, ratings_df = trainer.prepare_data()
    
    # Step 2: Train model
    trainer.train_model(user_item_matrix)
    
    # Step 3: Evaluate
    metrics = trainer.evaluate_model(user_item_matrix, ratings_df)
    
    # Step 4: Test recommendations
    trainer.test_predictions(num_users=3)
    
    # Step 5: Save model
    model_path = trainer.save_model(version='v1.0')
    
    print("\n" + "="*80)
    print("✅ TRAINING COMPLETE!")
    print("="*80)
    print(f"\n📊 Final Metrics:")
    print(f"  RMSE: {metrics['rmse']}")
    print(f"  MAE:  {metrics['mae']}")
    print(f"\n💾 Model saved to: {model_path}")
    print(f"\n🎯 Next: Build recommendation API to serve predictions!")
