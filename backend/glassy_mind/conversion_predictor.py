"""
Glassy Mind - Conversion Prediction Model
ML-модель для предсказания вероятности конверсии пользователя.
"""

import logging
import math
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ConversionPrediction:
    """Результат предсказания конверсии"""
    probability: float  # 0.0 - 1.0
    confidence: str  # "low", "medium", "high"
    factors: List[Dict]  # Факторы, влияющие на предсказание
    recommendation: str  # Рекомендация по действию
    segment: str  # Сегмент пользователя


class ConversionPredictor:
    """
    ML-модель для предсказания конверсии.
    
    Использует rule-based scoring с весами факторов.
    В будущем можно заменить на обученную модель.
    """
    
    def __init__(self):
        self._db = None
        
        # Feature weights (можно настраивать)
        self.weights = {
            "views_count": 0.15,
            "cart_adds": 0.25,
            "dwell_time": 0.20,
            "return_visits": 0.15,
            "high_value_views": 0.10,
            "category_focus": 0.10,
            "recency": 0.05
        }
        
        # Thresholds for scoring
        self.thresholds = {
            "views_high": 10,
            "views_medium": 5,
            "cart_optimal": 2,
            "dwell_engaged": 120,  # seconds
            "dwell_interested": 60,
            "high_value_price": 500
        }
        
        logger.info("🔮 ConversionPredictor initialized")
    
    async def _ensure_db(self):
        """Lazy init database"""
        if self._db is None:
            try:
                from database import db
                self._db = db
            except:
                pass
    
    def _calculate_view_score(self, total_views: int) -> float:
        """Score based on number of product views"""
        if total_views >= self.thresholds["views_high"]:
            return 1.0
        elif total_views >= self.thresholds["views_medium"]:
            return 0.7
        elif total_views >= 2:
            return 0.4
        elif total_views >= 1:
            return 0.2
        return 0.0
    
    def _calculate_cart_score(self, cart_adds: int) -> float:
        """Score based on cart activity"""
        if cart_adds >= self.thresholds["cart_optimal"]:
            return 1.0
        elif cart_adds == 1:
            return 0.6
        return 0.0
    
    def _calculate_dwell_score(self, avg_dwell_time: float) -> float:
        """Score based on average dwell time"""
        if avg_dwell_time >= self.thresholds["dwell_engaged"]:
            return 1.0
        elif avg_dwell_time >= self.thresholds["dwell_interested"]:
            return 0.7
        elif avg_dwell_time >= 30:
            return 0.4
        return 0.1
    
    def _calculate_value_score(self, viewed_prices: List[float]) -> float:
        """Score based on price range of viewed products"""
        if not viewed_prices:
            return 0.3
        
        max_price = max(viewed_prices)
        avg_price = sum(viewed_prices) / len(viewed_prices)
        
        if max_price >= self.thresholds["high_value_price"]:
            return 1.0
        elif avg_price >= 200:
            return 0.7
        elif avg_price >= 100:
            return 0.5
        return 0.3
    
    def _calculate_focus_score(self, categories: List[str]) -> float:
        """Score based on category focus (less scatter = higher intent)"""
        if not categories:
            return 0.3
        
        unique = len(set(categories))
        total = len(categories)
        
        if total == 0:
            return 0.3
        
        focus_ratio = 1 - (unique / total)
        return 0.3 + (focus_ratio * 0.7)
    
    def _calculate_recency_score(self, last_activity: Optional[str]) -> float:
        """Score based on recency of activity"""
        if not last_activity:
            return 0.0
        
        try:
            last_dt = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
            hours_ago = (datetime.now(timezone.utc) - last_dt).total_seconds() / 3600
            
            if hours_ago <= 1:
                return 1.0
            elif hours_ago <= 6:
                return 0.8
            elif hours_ago <= 24:
                return 0.5
            elif hours_ago <= 72:
                return 0.3
            return 0.1
        except:
            return 0.3
    
    def _determine_segment(self, probability: float, factors: Dict) -> str:
        """Determine user segment based on behavior"""
        
        cart_score = factors.get("cart_adds", 0)
        view_score = factors.get("views_count", 0)
        dwell_score = factors.get("dwell_time", 0)
        
        if probability >= 0.7 and cart_score >= 0.6:
            return "hot_lead"
        elif probability >= 0.5 and dwell_score >= 0.7:
            return "engaged_browser"
        elif view_score >= 0.7 and cart_score == 0:
            return "window_shopper"
        elif probability >= 0.4:
            return "potential_buyer"
        elif view_score >= 0.4:
            return "casual_visitor"
        return "new_visitor"
    
    def _get_recommendation(self, segment: str, probability: float) -> str:
        """Get action recommendation based on segment"""
        
        recommendations = {
            "hot_lead": "🔥 Высокий приоритет! Отправьте персональное предложение со скидкой.",
            "engaged_browser": "💡 Заинтересован, но не добавил в корзину. Покажите похожие товары или отзывы.",
            "window_shopper": "👀 Много смотрит, но не покупает. Предложите бесплатную консультацию.",
            "potential_buyer": "📧 Отправьте email с подборкой товаров по интересам.",
            "casual_visitor": "🎯 Покажите популярные товары и специальные предложения.",
            "new_visitor": "👋 Новый посетитель. Покажите преимущества магазина и хиты продаж."
        }
        
        return recommendations.get(segment, "Продолжайте наблюдение.")
    
    async def predict(self, user_context: Dict) -> ConversionPrediction:
        """
        Predict conversion probability for a user.
        
        Args:
            user_context: User context from Observer
        
        Returns:
            ConversionPrediction with probability and recommendations
        """
        
        # Extract features
        total_views = user_context.get("total_views", 0)
        cart_adds = user_context.get("total_cart_adds", 0)
        viewed_products = user_context.get("viewed_products", [])
        viewed_categories = user_context.get("viewed_categories", [])
        dwell_times = user_context.get("top_dwell_pages", {})
        session_start = user_context.get("session_start")
        
        # Calculate average dwell time
        avg_dwell = sum(dwell_times.values()) / len(dwell_times) if dwell_times else 0
        
        # Calculate individual scores
        scores = {
            "views_count": self._calculate_view_score(total_views),
            "cart_adds": self._calculate_cart_score(cart_adds),
            "dwell_time": self._calculate_dwell_score(avg_dwell),
            "category_focus": self._calculate_focus_score(viewed_categories),
            "recency": self._calculate_recency_score(session_start)
        }
        
        # Calculate weighted probability
        probability = sum(
            scores[key] * self.weights.get(key, 0.1)
            for key in scores
        )
        
        # Normalize to 0-1
        probability = min(1.0, max(0.0, probability))
        
        # Boost if cart has items
        if cart_adds > 0:
            probability = min(1.0, probability * 1.3)
        
        # Determine confidence
        data_points = total_views + cart_adds + len(dwell_times)
        if data_points >= 10:
            confidence = "high"
        elif data_points >= 5:
            confidence = "medium"
        else:
            confidence = "low"
        
        # Build factors list
        factors = []
        for key, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            impact = "positive" if score >= 0.5 else "negative" if score < 0.3 else "neutral"
            factors.append({
                "factor": key,
                "score": round(score, 2),
                "impact": impact,
                "weight": self.weights.get(key, 0.1)
            })
        
        # Determine segment and recommendation
        segment = self._determine_segment(probability, scores)
        recommendation = self._get_recommendation(segment, probability)
        
        logger.info(f"🔮 Prediction: user={user_context.get('user_id')}, prob={probability:.2f}, segment={segment}")
        
        return ConversionPrediction(
            probability=round(probability, 3),
            confidence=confidence,
            factors=factors,
            recommendation=recommendation,
            segment=segment
        )
    
    async def batch_predict(self, user_ids: List[str]) -> Dict[str, ConversionPrediction]:
        """Predict conversion for multiple users."""
        await self._ensure_db()
        
        if self._db is None:
            return {}
        
        results = {}
        
        for user_id in user_ids:
            session = await self._db.user_sessions.find_one(
                {"user_id": user_id},
                {"_id": 0}
            )
            
            if session:
                context = {
                    "user_id": user_id,
                    "total_views": len(session.get("views", [])),
                    "total_cart_adds": len(session.get("cart_actions", [])),
                    "viewed_products": [v["product_id"] for v in session.get("views", [])],
                    "viewed_categories": [],
                    "top_dwell_pages": session.get("dwell_times", {}),
                    "session_start": session.get("started_at")
                }
                
                results[user_id] = await self.predict(context)
        
        return results
    
    async def get_high_intent_users(self, min_probability: float = 0.5, limit: int = 20) -> List[Dict]:
        """Get users with high conversion probability."""
        await self._ensure_db()
        
        if self._db is None:
            return []
        
        # Get all recent sessions
        sessions = await self._db.user_sessions.find(
            {},
            {"_id": 0}
        ).sort("updated_at", -1).limit(100).to_list(100)
        
        high_intent = []
        
        for session in sessions:
            context = {
                "user_id": session.get("user_id"),
                "total_views": len(session.get("views", [])),
                "total_cart_adds": len(session.get("cart_actions", [])),
                "viewed_products": [v["product_id"] for v in session.get("views", [])],
                "viewed_categories": [],
                "top_dwell_pages": session.get("dwell_times", {}),
                "session_start": session.get("started_at")
            }
            
            prediction = await self.predict(context)
            
            if prediction.probability >= min_probability:
                high_intent.append({
                    "user_id": session.get("user_id"),
                    "probability": prediction.probability,
                    "segment": prediction.segment,
                    "recommendation": prediction.recommendation,
                    "confidence": prediction.confidence
                })
        
        # Sort by probability and limit
        high_intent.sort(key=lambda x: x["probability"], reverse=True)
        return high_intent[:limit]


# Singleton instance
conversion_predictor = ConversionPredictor()
