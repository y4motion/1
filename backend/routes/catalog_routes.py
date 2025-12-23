from fastapi import APIRouter
from typing import Dict, Any
from config.catalog_config import PERSONAS, MAIN_CATEGORIES, SPECIFIC_FILTERS, PERSONA_FILTER_PRESETS
from config.marketplace_catalog import MARKETPLACE_CATALOG
from utils.cache import cache_response

router = APIRouter()


@router.get("/catalog/personas")
@cache_response(ttl_seconds=3600)  # 1 hour - rarely changes
async def get_personas() -> Dict[str, Any]:
    """Get all available personas"""
    return {"personas": PERSONAS}


@router.get("/catalog/categories")
@cache_response(ttl_seconds=3600)  # 1 hour - rarely changes
async def get_categories() -> Dict[str, Any]:
    """Get all main categories and their subcategories"""
    return {"categories": MAIN_CATEGORIES}


@router.get("/catalog/categories/{category_id}")
@cache_response(ttl_seconds=3600)  # 1 hour
async def get_category(category_id: str) -> Dict[str, Any]:
    """Get specific category details"""
    if category_id not in MAIN_CATEGORIES:
        return {"error": "Category not found"}
    return {"category": MAIN_CATEGORIES[category_id]}


@router.get("/catalog/filters/{subcategory_id}")
async def get_specific_filters(subcategory_id: str) -> Dict[str, Any]:
    """Get specific filters for a subcategory"""
    if subcategory_id not in SPECIFIC_FILTERS:
        return {"filters": {}}
    return {"subcategory_id": subcategory_id, "filters": SPECIFIC_FILTERS[subcategory_id]}


@router.get("/catalog/presets/{persona_id}")
async def get_persona_presets(persona_id: str) -> Dict[str, Any]:
    """Get filter presets for a specific persona"""
    if persona_id not in PERSONA_FILTER_PRESETS:
        return {"presets": {}}
    return {"persona_id": persona_id, "presets": PERSONA_FILTER_PRESETS[persona_id]}


@router.get("/catalog/search-categories")
async def search_categories(query: str = "") -> Dict[str, Any]:
    """Search categories by name (for search dropdown integration)"""
    results = []
    query_lower = query.lower()
    
    for cat_id, category in MAIN_CATEGORIES.items():
        # Search in main category
        if query_lower in category["name"].lower() or query_lower in category["name_en"].lower():
            results.append({
                "type": "main_category",
                "id": cat_id,
                "name": category["name"],
                "name_en": category["name_en"],
                "icon": category["icon"]
            })
        
        # Search in subcategories
        for subcat_id, subcategory in category["subcategories"].items():
            if query_lower in subcategory["name"].lower() or query_lower in subcategory["name_en"].lower():
                results.append({
                    "type": "subcategory",
                    "id": subcat_id,
                    "parent_id": cat_id,
                    "name": subcategory["name"],
                    "name_en": subcategory["name_en"],
                    "parent_name": category["name"]
                })
    
    return {"query": query, "results": results}


@router.get("/marketplace/catalog")
async def get_marketplace_catalog() -> Dict[str, Any]:
    """Get extended marketplace catalog for gaming/tech products"""
    return {"catalog": MARKETPLACE_CATALOG}


@router.get("/marketplace/catalog/{category_id}")
async def get_marketplace_category(category_id: str) -> Dict[str, Any]:
    """Get specific marketplace category with all subcategories"""
    if category_id not in MARKETPLACE_CATALOG:
        return {"error": "Category not found"}
    return {"category": MARKETPLACE_CATALOG[category_id]}
