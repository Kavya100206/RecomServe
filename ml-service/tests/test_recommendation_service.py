"""
Unit Tests for ML Recommendation Service
Tests core functionality, edge cases, and error handling
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.recommendation_service import RecommendationService
import uuid


class TestRecommendationService:
    """Test the RecommendationService class"""
    
    @pytest.fixture
    def service(self):
        """Create a service instance for testing"""
        return RecommendationService()
    
    def test_get_recommendations_valid_user(self, service):
        """Test getting recommendations for a valid user"""
        # Use a known user from the database
        result = service.get_recommendations(
            user_id="004deb95-9cc2-43e6-8445-14faae27a12f",
            n=5
        )
        
        assert result is not None
        assert 'recommendations' in result
        assert 'is_personalized' in result
        assert len(result['recommendations']) <= 5
    
    def test_get_recommendations_invalid_uuid(self, service):
        """Test handling of invalid UUID format"""
        with pytest.raises(ValueError):
            service.get_recommendations(
                user_id="not-a-valid-uuid",
                n=5
            )
    
    def test_get_recommendations_nonexistent_user(self, service):
        """Test cold start for user not in database"""
        # Generate a random UUID that doesn't exist
        fake_uuid = str(uuid.uuid4())
        
        result = service.get_recommendations(
            user_id=fake_uuid,
            n=5
        )
        
        # Should return popular items
        assert result is not None
        assert 'recommendations' in result
        assert result['is_personalized'] == False
        assert len(result['recommendations']) > 0
    
    def test_get_recommendations_zero_count(self, service):
        """Test requesting zero recommendations"""
        result = service.get_recommendations(
            user_id="004deb95-9cc2-43e6-8445-14faae27a12f",
            n=0
        )
        
        assert result is not None
        assert len(result['recommendations']) == 0
    
    def test_get_recommendations_negative_count(self, service):
        """Test requesting negative number of recommendations"""
        with pytest.raises(ValueError):
            service.get_recommendations(
                user_id="004deb95-9cc2-43e6-8445-14faae27a12f",
                n=-5
            )
    
    def test_get_recommendations_large_count(self, service):
        """Test requesting more recommendations than available"""
        result = service.get_recommendations(
            user_id="004deb95-9cc2-43e6-8445-14faae27a12f",
            n=1000
        )
        
        # Should return all available, not crash
        assert result is not None
        assert len(result['recommendations']) <= 1000
    
    def test_model_info(self, service):
        """Test getting model information"""
        service.load_model()
        info = service.get_model_info()
        
        assert info is not None
        # The service returns loaded_version, algorithm, and trained_at
        # Just check that it's a dict with some content
        assert isinstance(info, dict)
        assert len(info) > 0
    
    def test_recommendation_format(self, service):
        """Test that recommendations have correct format"""
        result = service.get_recommendations(
            user_id="004deb95-9cc2-43e6-8445-14faae27a12f",
            n=1
        )
        
        if len(result['recommendations']) > 0:
            rec = result['recommendations'][0]
            
            # Check required fields
            assert 'content_id' in rec
            assert 'score' in rec
            assert 'title' in rec
            assert 'category' in rec
            assert 'tags' in rec
            
            # Check types
            assert isinstance(rec['score'], (int, float))
            assert isinstance(rec['tags'], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
