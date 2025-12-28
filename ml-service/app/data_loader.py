"""
Data Loader
Fetches user interaction data from PostgreSQL for ML training
"""

import os
import psycopg2
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DataLoader:
    """Handles data extraction from PostgreSQL"""
    
    def __init__(self):
        """Initialize database connection"""
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL not found in environment variables")
    
    def get_connection(self):
        """Create database connection"""
        return psycopg2.connect(self.db_url)
    
    def fetch_interactions(self):
        """
        Fetch all user interactions from database
        
        Returns:
            DataFrame with columns: user_id, content_id, event_type, value, created_at
        """
        query = """
            SELECT 
                user_id,
                content_id,
                event_type,
                value,
                created_at
            FROM interactions
            ORDER BY created_at DESC
        """
        
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        
        print(f"✓ Loaded {len(df)} interactions from database")
        return df
    
    def fetch_users(self):
        """
        Fetch all users
        
        Returns:
            DataFrame with user information
        """
        query = "SELECT id, created_at, metadata FROM users"
        
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        
        print(f"✓ Loaded {len(df)} users from database")
        return df
    
    def fetch_content(self):
        """
        Fetch all content items
        
        Returns:
            DataFrame with content information
        """
        query = "SELECT id, title, category, tags, created_at FROM content"
        
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        
        print(f"✓ Loaded {len(df)} content items from database")
        return df
    
    def get_interaction_stats(self):
        """
        Get statistics about interactions
        
        Returns:
            Dictionary with interaction statistics
        """
        query = """
            SELECT 
                event_type,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT content_id) as unique_content
            FROM interactions
            GROUP BY event_type
        """
        
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
        
        stats = df.to_dict('records')
        return stats


# Test the data loader
if __name__ == "__main__":
    print("🧪 Testing Data Loader...\n")
    
    loader = DataLoader()
    
    # Fetch interactions
    interactions = loader.fetch_interactions()
    print(f"\nInteractions shape: {interactions.shape}")
    print(f"Columns: {list(interactions.columns)}")
    print(f"\nSample data:")
    print(interactions.head())
    
    # Get stats
    print("\n📊 Interaction Statistics:")
    stats = loader.get_interaction_stats()
    for stat in stats:
        print(f"  {stat['event_type']}: {stat['count']} total, {stat['unique_users']} users, {stat['unique_content']} content")
    
    print("\n✅ Data Loader test complete!")
