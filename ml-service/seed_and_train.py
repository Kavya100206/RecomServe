"""
Deployment script for Render - Seeds database and trains model
No external downloads required
"""
import os
import sys
import psycopg2
from pathlib import Path

def init_schema():
    """Initialize database schema"""
    print("=" * 80)
    print("🗄️  INITIALIZING DATABASE SCHEMA")
    print("=" * 80)
    
    try:
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            print("❌ DATABASE_URL not set")
            return False
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Read and execute schema
        schema_file = Path(__file__).parent.parent / 'database' / 'schema.sql'
        
        if not schema_file.exists():
            print(f"❌ Schema file not found: {schema_file}")
            return False
            
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
            
        cursor.execute(schema_sql)
        conn.commit()
        
        print(f"✅ Database schema created successfully!")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"⚠️  Schema initialization: {e}")
        print("   (This is OK if schema already exists)")
        return True  # Continue anyway

def seed_database():
    """Load seed data into database"""
    print("\n" + "=" * 80)
    print("🌱 SEEDING DATABASE")
    print("=" * 80)
    
    try:
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            print("❌ DATABASE_URL not set")
            return False
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Read and execute seed data
        seed_file = Path(__file__).parent.parent / 'database' / 'seed_data.sql'
        
        if not seed_file.exists():
            print(f"❌ Seed file not found: {seed_file}")
            return False
            
        with open(seed_file, 'r') as f:
            seed_sql = f.read()
            
        cursor.execute(seed_sql)
        conn.commit()
        
        # Check data
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM content")
        content_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM interactions")
        interaction_count = cursor.fetchone()[0]
        
        print(f"✅ Database seeded successfully!")
        print(f"   Users: {user_count}")
        print(f"   Content: {content_count}")
        print(f"   Interactions: {interaction_count}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        return False

def train_model():
    """Train the ML model"""
    print("\n" + "=" * 80)
    print("🎓 TRAINING MODEL")
    print("=" * 80)
    
    try:
        # Add app directory to path for imports
        app_dir = Path(__file__).parent / 'app'
        sys.path.insert(0, str(app_dir))
        
        # Import and run training
        from train import ModelTrainer
        
        trainer = ModelTrainer()
        user_item_matrix, ratings_df = trainer.prepare_data()
        trainer.train_model(user_item_matrix)
        metrics = trainer.evaluate_model(user_item_matrix, ratings_df)
        model_path = trainer.save_model(version='v1.0')
        
        print(f"\n✅ Model trained successfully!")
        print(f"   RMSE: {metrics['rmse']}")
        print(f"   MAE: {metrics['mae']}")
        print(f"   Saved to: {model_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error training model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("🚀 RENDER DEPLOYMENT SETUP")
    print("=" * 80)
    
    # Step 1: Initialize schema
    init_schema()
    
    # Step 2: Seed database
    seed_success = seed_database()
    
    if not seed_success:
        print("\n⚠️  Database seeding failed, but continuing...")
        print("   Model will work with existing data if any")
    
    # Step 3: Train model
    train_success = train_model()
    
    if not train_success:
        print("\n❌ Model training failed")
        sys.exit(1)
    
    print("\n" + "=" * 80)
    print("✅ DEPLOYMENT SETUP COMPLETE!")
    print("=" * 80)
