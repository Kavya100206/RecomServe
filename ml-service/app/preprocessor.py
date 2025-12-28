"""
Preprocessor
Converts raw interaction events into ratings for ML training
"""

import pandas as pd
import numpy as np


class Preprocessor:
    """Converts interaction events to ratings for collaborative filtering"""
    
    # Event weights - how much each event type is worth
    EVENT_WEIGHTS = {
        'view': 1.0,      # Just viewed - weak signal
        'like': 3.0,      # Liked - strong positive signal
        'click': 2.0,     # Clicked through - medium signal
        'rating': None    # Use actual rating value (1-5)
    }
    
    def __init__(self):
        """Initialize preprocessor"""
        pass
    
    def convert_events_to_ratings(self, interactions_df):
        """
        Convert interaction events to ratings
        
        Args:
            interactions_df: DataFrame with columns [user_id, content_id, event_type, value]
            
        Returns:
            DataFrame with columns [user_id, content_id, rating]
        """
        print("🔄 Converting events to ratings...")
        
        # Create a copy to avoid modifying original
        df = interactions_df.copy()
        
        # Convert each event type to a rating
        df['rating'] = df.apply(self._event_to_rating, axis=1)
        
        # Group by user-content pair and sum ratings
        # (If user viewed AND liked same content, combine scores)
        ratings_df = df.groupby(['user_id', 'content_id'], as_index=False)['rating'].sum()
        
        # Cap ratings at 5.0 (maximum rating)
        ratings_df['rating'] = ratings_df['rating'].clip(upper=5.0)
        
        print(f"✓ Converted {len(interactions_df)} events → {len(ratings_df)} unique user-content ratings")
        print(f"  Rating range: {ratings_df['rating'].min():.2f} - {ratings_df['rating'].max():.2f}")
        print(f"  Average rating: {ratings_df['rating'].mean():.2f}")
        
        return ratings_df
    
    def _event_to_rating(self, row):
        """
        Convert a single event to a rating value
        
        Args:
            row: DataFrame row with event_type and value
            
        Returns:
            float: Rating value
        """
        event_type = row['event_type']
        value = row['value']
        
        # For explicit ratings, use the actual value
        if event_type == 'rating' and pd.notna(value):
            return float(value)
        
        # For other events, use predefined weights
        if event_type in self.EVENT_WEIGHTS:
            weight = self.EVENT_WEIGHTS[event_type]
            return weight if weight is not None else 0.0
        
        # Unknown event type - return 0
        return 0.0
    
    def get_user_item_matrix(self, ratings_df):
        """
        Create user-item matrix (sparse)
        
        Args:
            ratings_df: DataFrame with [user_id, content_id, rating]
            
        Returns:
            Pivot table with users as rows, content as columns
        """
        matrix = ratings_df.pivot_table(
            index='user_id',
            columns='content_id',
            values='rating',
            fill_value=0
        )
        
        print(f"\n📊 User-Item Matrix:")
        print(f"  Shape: {matrix.shape} ({matrix.shape[0]} users × {matrix.shape[1]} items)")
        
        # Calculate sparsity
        total_cells = matrix.shape[0] * matrix.shape[1]
        non_zero_cells = (matrix != 0).sum().sum()
        sparsity = (1 - non_zero_cells / total_cells) * 100
        print(f"  Sparsity: {sparsity:.1f}% (cells with no rating)")
        
        return matrix
    
    def prepare_for_surprise(self, ratings_df):
        """
        Prepare data in format needed by Surprise library
        
        Args:
            ratings_df: DataFrame with [user_id, content_id, rating]
            
        Returns:
            DataFrame ready for Surprise (same format, just validated)
        """
        # Ensure correct data types
        df = ratings_df.copy()
        df['user_id'] = df['user_id'].astype(str)
        df['content_id'] = df['content_id'].astype(str)
        df['rating'] = df['rating'].astype(float)
        
        # Remove any invalid ratings
        df = df[df['rating'] > 0]
        
        print(f"✓ Prepared {len(df)} ratings for ML training")
        
        return df[['user_id', 'content_id', 'rating']]


# Test the preprocessor
if __name__ == "__main__":
    from data_loader import DataLoader
    
    print("🧪 Testing Preprocessor...\n")
    
    # Load data
    loader = DataLoader()
    interactions = loader.fetch_interactions()
    
    print(f"\n📥 Raw interactions: {len(interactions)}")
    print(f"Event types: {interactions['event_type'].value_counts().to_dict()}\n")
    
    # Preprocess
    preprocessor = Preprocessor()
    ratings = preprocessor.convert_events_to_ratings(interactions)
    
    print(f"\n📊 Sample ratings:")
    print(ratings.head(10))
    
    # Show statistics
    print(f"\n📈 Rating distribution:")
    print(ratings['rating'].describe())
    
    # Create user-item matrix
    print("\n" + "="*50)
    matrix = preprocessor.get_user_item_matrix(ratings)
    
    # Prepare for Surprise
    print("\n" + "="*50)
    surprise_data = preprocessor.prepare_for_surprise(ratings)
    
    print("\n✅ Preprocessor test complete!")
