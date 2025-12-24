from typing import List, Dict
from collections import defaultdict
from database import get_database
from datetime import datetime, timezone, timedelta


class RecommendationEngine:
    """AI-powered recommendation engine with collaborative and content-based filtering"""
    
    def __init__(self):
        self.user_product_matrix = defaultdict(dict)
    
    async def calculate_product_similarity(self, product_id: str) -> Dict[str, float]:
        """Calculate similarity between products based on attributes"""
        db = await get_database()
        
        product = await db.products.find_one({'id': product_id})
        if not product:
            return {}
        
        # Get products in same category
        similar_products = await db.products.find({
            'category_id': product.get('category_id'),
            'id': {'$ne': product_id},
            'status': 'approved'
        }).limit(100).to_list(length=100)
        
        similarities = {}
        
        for sim_prod in similar_products:
            score = 0
            
            # Same subcategory: +0.3
            if sim_prod.get('sub_category_id') == product.get('sub_category_id'):
                score += 0.3
            
            # Same persona: +0.2
            if sim_prod.get('persona_id') == product.get('persona_id'):
                score += 0.2
            
            # Price similarity: +0.2 (within 20%)
            if product.get('price') and sim_prod.get('price'):
                price_diff = abs(product['price'] - sim_prod['price']) / product['price']
                if price_diff < 0.2:
                    score += 0.2
            
            # Rating similarity: +0.1
            if product.get('rating') and sim_prod.get('rating'):
                rating_diff = abs(product['rating'] - sim_prod['rating'])
                if rating_diff < 1.0:
                    score += 0.1
            
            # Tag overlap: +0.2
            product_tags = set(product.get('tags', []))
            similar_tags = set(sim_prod.get('tags', []))
            tag_overlap = len(product_tags & similar_tags)
            if tag_overlap > 0:
                score += min(0.2, tag_overlap * 0.05)
            
            if score > 0:
                similarities[sim_prod['id']] = score
        
        return similarities
    
    async def get_content_based_recommendations(
        self,
        product_id: str,
        limit: int = 10
    ) -> List[str]:
        """Content-based: similar products"""
        similarities = await self.calculate_product_similarity(product_id)
        
        sorted_similar = sorted(
            similarities.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [pid for pid, _ in sorted_similar[:limit]]
    
    async def get_trending_products(self, limit: int = 10) -> List[dict]:
        """Get trending products based on recent activity"""
        db = await get_database()
        
        # Get products sorted by views and rating
        products = await db.products.find({
            'status': 'approved'
        }).sort([
            ('view_count', -1),
            ('rating', -1)
        ]).limit(limit).to_list(length=limit)
        
        return products
    
    async def get_hybrid_recommendations(
        self,
        user_id: str,
        current_product_id: str = None,
        limit: int = 10
    ) -> List[dict]:
        """Hybrid recommendations: trending + content-based"""
        db = await get_database()
        
        recommendations = {}
        
        # 1. Get user's wishlist for personalization
        user = await db.users.find_one({'id': user_id})
        wishlist_ids = user.get('wishlist', []) if user else []
        
        # 2. Content-based if viewing a product
        if current_product_id and current_product_id not in wishlist_ids:
            content_recs = await self.get_content_based_recommendations(
                current_product_id, 
                limit * 2
            )
            for i, pid in enumerate(content_recs):
                if pid not in wishlist_ids:  # Don't recommend what's already in wishlist
                    score = (len(content_recs) - i) / len(content_recs)
                    recommendations[pid] = recommendations.get(pid, 0) + score
        
        # 3. Add trending products
        trending = await self.get_trending_products(limit * 2)
        for i, prod in enumerate(trending):
            pid = prod['id']
            if pid not in wishlist_ids and pid != current_product_id:
                score = (len(trending) - i) / len(trending) * 0.5
                recommendations[pid] = recommendations.get(pid, 0) + score
        
        # Sort by combined score
        sorted_recs = sorted(
            recommendations.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Fetch product details
        product_ids = [pid for pid, _ in sorted_recs[:limit]]
        if not product_ids:
            # Fallback to trending
            return trending[:limit]
        
        products = await db.products.find({
            'id': {'$in': product_ids},
            'status': 'approved'
        }).to_list(length=limit)
        
        # Maintain sort order
        product_map = {p['id']: p for p in products}
        sorted_products = [
            product_map[pid] 
            for pid, _ in sorted_recs[:limit] 
            if pid in product_map
        ]
        
        return sorted_products


# Global instance
recommendation_engine = RecommendationEngine()
