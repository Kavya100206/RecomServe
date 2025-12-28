"""
Recommendation Service
Core business logic for generating personalized recommendations
"""

import psycopg2
import sys
import os
import uuid as uuid_lib
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from model_manager import ModelManager


class RecommendationService:
    """Handles recommendation generation and content enrichment"""
    
    def __init__(self):
        """Initialize service with model manager"""
        self.model_manager = ModelManager()
        self.model_loaded = False
    
    def load_model(self):
        """Load the active model into memory"""
        if not self.model_loaded:
            print("📦 Loading model for inference...")
            self.model_manager.load_model()  # Loads active model
            self.model_loaded = True
            print(f"✅ Model {self.model_manager.loaded_version} ready for inference")
    
    def get_recommendations(self, user_id, n=10, include_details=True):
        """
        Get personalized recommendations for a user
        
        Args:
            user_id: User UUID (string format)
            n: Number of recommendations to return (must be >= 0)
            include_details: Whether to fetch content details from DB
            
        Returns:
            dict: Recommendations with metadata
            
        Raises:
            ValueError: If user_id is not a valid UUID or n is negative
        """
        # Input validation
        try:
            uuid_lib.UUID(user_id)
        except (ValueError, AttributeError, TypeError):
            raise ValueError(f"Invalid UUID format: {user_id}")
        
        if not isinstance(n, int) or n < 0:
            raise ValueError(f"Number of recommendations must be a non-negative integer, got: {n}")
        
        if n == 0:
            return {
                'user_id': user_id,
                'recommendations': [],
                'model_version': self.model_manager.loaded_version if self.model_loaded else 'unknown',
                'count': 0,
                'is_personalized': False
            }
        
        # Ensure model is loaded
        if not self.model_loaded:
            self.load_model()
        
        # Check if user exists in training data
        user_mapper = self.model_manager.loaded_model['user_mapper']
        
        if user_id not in user_mapper:
            # Cold start - return popular content
            return self._get_popular_content(n, include_details)
        
        # Generate personalized recommendations
        recs = self.model_manager.get_recommendations(user_id, n)
        print(f"📊 Got {len(recs)} recommendations from model")
        
        # Enrich with content details if requested
        if include_details and recs:
            print(f"🔧 Calling enrichment (include_details={include_details})...")
            recs = self._enrich_with_content_details(recs)
        else:
            print(f"⚠️  Skipping enrichment (include_details={include_details}, recs={len(recs)})")
        
        return {
            'user_id': user_id,
            'recommendations': recs,
            'model_version': self.model_manager.loaded_version,
            'count': len(recs),
            'is_personalized': True
        }
    
    def _get_popular_content(self, n=10, include_details=True):
        """
        Get popular content for cold start users
        
        Args:
            n: Number of items to return
            include_details: Whether to fetch content details
            
        Returns:
            dict: Popular content recommendations
        """
        print("⚠️  Cold start detected - returning popular content")
        
        try:
            # Query most interacted content
            from data_loader import DataLoader
            loader = DataLoader()
            
            with loader.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get content with most interactions
                cursor.execute("""
                    SELECT 
                        content_id,
                        COUNT(*) as interaction_count,
                        AVG(CASE WHEN event_type = 'rating' THEN value ELSE NULL END) as avg_rating
                    FROM interactions
                    GROUP BY content_id
                    ORDER BY interaction_count DESC, avg_rating DESC
                    LIMIT %s
                """, (n,))
                
                popular = cursor.fetchall()
                cursor.close()
            
            # Format as recommendations
            recs = [
                {
                    'content_id': row[0],
                    'score': float(row[1]),  # Use interaction count as score
                    'popularity_rank': i + 1
                }
                for i, row in enumerate(popular)
            ]
            
            # Enrich if needed
            if include_details and recs:
                recs = self._enrich_with_content_details(recs)
            
            return {
                'user_id': None,
                'recommendations': recs,
                'model_version': self.model_manager.loaded_version,
                'count': len(recs),
                'is_personalized': False,
                'reason': 'cold_start'
            }
            
        except Exception as e:
            print(f"❌ Error getting popular content: {e}")
            return {
                'user_id': None,
                'recommendations': [],
                'count': 0,
                'is_personalized': False,
                'error': str(e)
            }
    
    def _enrich_with_content_details(self, recommendations):
        """
        Fetch content details (title, category) from database
        
        Args:
            recommendations: List of recommendation dicts with content_id
            
        Returns:
            list: Enriched recommendations with content details
        """
        try:
            content_ids = [rec['content_id'] for rec in recommendations]
            print(f"🔍 Enriching {len(content_ids)} content items...")
            
            # Fetch content details
            from data_loader import DataLoader
            loader = DataLoader()
            
            with loader.get_connection() as conn:
                cursor = conn.cursor()
                
                # Use parameterized query with UUID casting
                # Build placeholders for each content_id
                placeholders = ','.join(['%s' for _ in content_ids])
                query = f"""
                    SELECT id, title, category, tags
                    FROM content
                    WHERE id::text IN ({placeholders})
                """
                
                cursor.execute(query, content_ids)
                content_data = cursor.fetchall()
                print(f"✓ Found {len(content_data)} content items in database")
                cursor.close()
            
            # Create lookup dict
            content_lookup = {
                row[0]: {
                    'title': row[1],
                    'category': row[2],
                    'tags': row[3]
                }
                for row in content_data
            }
            
            # Enrich recommendations
            enriched = []
            for rec in recommendations:
                content_id = rec['content_id']
                if content_id in content_lookup:
                    enriched.append({
                        **rec,
                        **content_lookup[content_id]
                    })
                else:
                    print(f"⚠️  Content not found: {content_id}")
                    # Content not found, keep original
                    enriched.append(rec)
            
            print(f"✓ Enrichment complete: {len([r for r in enriched if r.get('title')])} with titles")
            return enriched
            
        except Exception as e:
            print(f"⚠️  Failed to enrich content: {e}")
            import traceback
            traceback.print_exc()
            # Return original recommendations
            return recommendations
    
    def get_model_info(self):
        """
        Get information about the loaded model
        
        Returns:
            dict: Model metadata
        """
        if not self.model_loaded:
            return {'loaded': False}
        
        return {
            'loaded': True,
            'version': self.model_manager.loaded_version,
            'users_count': len(self.model_manager.loaded_model['user_mapper']),
            'content_count': len(self.model_manager.loaded_model['content_mapper'])
        }


# Singleton instance
recommendation_service = RecommendationService()


# Test the service
if __name__ == "__main__":
    print("🧪 Testing Recommendation Service...\n")
    
    service = RecommendationService()
    
    # Test 1: Load model
    print("1️⃣ Loading model:")
    service.load_model()
    
    # Test 2: Get model info
    print("\n2️⃣ Model info:")
    info = service.get_model_info()
    print(f"  {info}")
    
    # Test 3: Get recommendations for existing user
    print("\n3️⃣ Getting recommendations for existing user:")
    user_ids = list(service.model_manager.loaded_model['user_mapper'].keys())[:1]
    if user_ids:
        user_id = user_ids[0]
        result = service.get_recommendations(user_id, n=5)
        print(f"  User: {user_id[:8]}...")
        print(f"  Personalized: {result['is_personalized']}")
        print(f"  Count: {result['count']}")
        print("  Top recommendations:")
        for i, rec in enumerate(result['recommendations'][:3], 1):
            print(f"    {i}. {rec.get('title', rec['content_id'][:8])} (score: {rec['score']:.2f})")
    
    # Test 4: Cold start user
    print("\n4️⃣ Testing cold start (new user):")
    fake_user_id = "00000000-0000-0000-0000-000000000000"
    result = service.get_recommendations(fake_user_id, n=5)
    print(f"  Personalized: {result['is_personalized']}")
    print(f"  Reason: {result.get('reason', 'N/A')}")
    print(f"  Count: {result['count']}")
    
    print("\n✅ Service test complete!")
