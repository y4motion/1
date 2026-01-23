"""
Social Core API Tests - Network Feed and Consensus Ideas
Tests for /api/network/* and /api/consensus/* endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNetworkFeedAPI:
    """Tests for Network Feed endpoints"""
    
    def test_get_feed_success(self):
        """Test GET /api/network/feed returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/network/feed")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "posts" in data
        assert "page" in data
        assert "limit" in data
        assert "has_more" in data
        
        # Verify types
        assert isinstance(data["posts"], list)
        assert isinstance(data["page"], int)
        assert isinstance(data["limit"], int)
        assert isinstance(data["has_more"], bool)
    
    def test_get_feed_with_pagination(self):
        """Test GET /api/network/feed with pagination params"""
        response = requests.get(f"{BASE_URL}/api/network/feed?page=1&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 10
    
    def test_get_feed_with_category_filter(self):
        """Test GET /api/network/feed with category filter"""
        categories = ['hardware', 'software', 'battlestations', 'guides']
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/network/feed?category={category}")
            assert response.status_code == 200
            data = response.json()
            assert "posts" in data
    
    def test_get_feed_with_sort_options(self):
        """Test GET /api/network/feed with different sort options"""
        sort_options = ['hot', 'new', 'top']
        
        for sort in sort_options:
            response = requests.get(f"{BASE_URL}/api/network/feed?sort={sort}")
            assert response.status_code == 200
            data = response.json()
            assert "posts" in data
    
    def test_get_feed_invalid_category(self):
        """Test GET /api/network/feed with invalid category still returns 200"""
        response = requests.get(f"{BASE_URL}/api/network/feed?category=invalid_category")
        
        # Should still return 200 but ignore invalid category
        assert response.status_code == 200
        data = response.json()
        assert "posts" in data


class TestConsensusIdeasAPI:
    """Tests for Consensus Ideas endpoints"""
    
    def test_get_ideas_success(self):
        """Test GET /api/consensus/ideas returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/consensus/ideas")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "ideas" in data
        assert "page" in data
        assert "limit" in data
        assert "has_more" in data
        assert "user_rp" in data
        assert "vote_cost" in data
        
        # Verify types
        assert isinstance(data["ideas"], list)
        assert isinstance(data["page"], int)
        assert isinstance(data["limit"], int)
        assert isinstance(data["has_more"], bool)
        assert isinstance(data["user_rp"], int)
        assert isinstance(data["vote_cost"], int)
    
    def test_get_ideas_with_pagination(self):
        """Test GET /api/consensus/ideas with pagination params"""
        response = requests.get(f"{BASE_URL}/api/consensus/ideas?page=1&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 10
    
    def test_get_ideas_with_category_filter(self):
        """Test GET /api/consensus/ideas with category filter"""
        categories = ['site', 'products', 'software', 'community']
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/consensus/ideas?category={category}")
            assert response.status_code == 200
            data = response.json()
            assert "ideas" in data
    
    def test_get_ideas_with_sort_options(self):
        """Test GET /api/consensus/ideas with different sort options"""
        sort_options = ['score', 'new', 'trending']
        
        for sort in sort_options:
            response = requests.get(f"{BASE_URL}/api/consensus/ideas?sort={sort}")
            assert response.status_code == 200
            data = response.json()
            assert "ideas" in data
    
    def test_get_ideas_vote_cost_value(self):
        """Test that vote_cost is 50 RP as per RP_COSTS config"""
        response = requests.get(f"{BASE_URL}/api/consensus/ideas")
        
        assert response.status_code == 200
        data = response.json()
        
        # Vote cost should be 50 RP
        assert data["vote_cost"] == 50


class TestConsensusInfoAPI:
    """Tests for Consensus Info endpoint"""
    
    def test_get_info_success(self):
        """Test GET /api/consensus/info returns 200 with correct structure"""
        response = requests.get(f"{BASE_URL}/api/consensus/info")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "costs" in data
        assert "requirements" in data
        assert "user" in data
        assert "rewards" in data
    
    def test_get_info_costs_structure(self):
        """Test that costs contain expected fields"""
        response = requests.get(f"{BASE_URL}/api/consensus/info")
        
        assert response.status_code == 200
        data = response.json()
        
        costs = data["costs"]
        assert "create_idea" in costs
        assert "vote_idea" in costs
        assert "create_post" in costs
        assert "feature_post" in costs
        
        # Verify expected values
        assert costs["create_idea"] == 500
        assert costs["vote_idea"] == 50
        assert costs["create_post"] == 0
        assert costs["feature_post"] == 100
    
    def test_get_info_requirements_structure(self):
        """Test that requirements contain expected fields"""
        response = requests.get(f"{BASE_URL}/api/consensus/info")
        
        assert response.status_code == 200
        data = response.json()
        
        requirements = data["requirements"]
        assert "create_idea_level" in requirements
        assert "vote_level" in requirements
        
        # Verify expected values
        assert requirements["create_idea_level"] == 10
        assert requirements["vote_level"] == 5
    
    def test_get_info_user_structure(self):
        """Test that user info contains expected fields (unauthenticated)"""
        response = requests.get(f"{BASE_URL}/api/consensus/info")
        
        assert response.status_code == 200
        data = response.json()
        
        user = data["user"]
        assert "rp_balance" in user
        assert "level" in user
        assert "can_create_idea" in user
        assert "can_vote" in user
        
        # Unauthenticated user should have default values
        assert user["rp_balance"] == 0
        assert user["level"] == 1
        assert user["can_create_idea"] == False
        assert user["can_vote"] == False
    
    def test_get_info_rewards_structure(self):
        """Test that rewards contain expected fields"""
        response = requests.get(f"{BASE_URL}/api/consensus/info")
        
        assert response.status_code == 200
        data = response.json()
        
        rewards = data["rewards"]
        assert "idea_implemented_refund" in rewards
        assert "idea_implemented_bonus" in rewards
        assert "idea_implemented_xp" in rewards


class TestAuthenticatedEndpoints:
    """Tests for endpoints that require authentication"""
    
    def test_create_post_requires_auth(self):
        """Test POST /api/network/post requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/network/post",
            json={"title": "Test", "content": "Test content"}
        )
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422]
    
    def test_like_post_requires_auth(self):
        """Test POST /api/network/post/{id}/like requires authentication"""
        response = requests.post(f"{BASE_URL}/api/network/post/test-id/like")
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]
    
    def test_create_idea_requires_auth(self):
        """Test POST /api/consensus/idea requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/consensus/idea",
            json={"title": "Test Idea", "description": "Test description"}
        )
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 422]
    
    def test_vote_on_idea_requires_auth(self):
        """Test POST /api/consensus/idea/{id}/vote requires authentication"""
        response = requests.post(f"{BASE_URL}/api/consensus/idea/test-id/vote")
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403]


class TestEdgeCases:
    """Tests for edge cases and error handling"""
    
    def test_get_nonexistent_post(self):
        """Test GET /api/network/post/{id} with non-existent ID"""
        response = requests.get(f"{BASE_URL}/api/network/post/nonexistent-id-12345")
        
        assert response.status_code == 404
    
    def test_get_nonexistent_idea(self):
        """Test GET /api/consensus/idea/{id} with non-existent ID"""
        response = requests.get(f"{BASE_URL}/api/consensus/idea/nonexistent-id-12345")
        
        assert response.status_code == 404
    
    def test_pagination_limits(self):
        """Test that pagination respects limits"""
        # Test max limit
        response = requests.get(f"{BASE_URL}/api/network/feed?limit=100")
        assert response.status_code == 200
        data = response.json()
        # Should cap at 50
        assert data["limit"] <= 50
        
        # Test min limit
        response = requests.get(f"{BASE_URL}/api/network/feed?limit=1")
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] >= 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
