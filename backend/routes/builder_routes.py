"""
PC Builder API Router
Эндпоинты для конфигуратора ПК и проверки совместимости.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import logging

from services.compatibility_service import compatibility_service
from utils.auth_utils import get_current_user_optional
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/builder", tags=["pc-builder"])


class ValidateBuildRequest(BaseModel):
    """Запрос на валидацию сборки"""
    product_ids: List[str] = Field(..., description="Массив ID товаров для проверки")


class QuickCheckRequest(BaseModel):
    """Запрос на быструю проверку нового компонента"""
    new_product_id: str = Field(..., description="ID нового товара")
    existing_product_ids: List[str] = Field(default=[], description="ID существующих товаров в корзине/сборке")


@router.post("/validate")
async def validate_build(
    request: ValidateBuildRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Полная валидация сборки ПК.
    
    Проверяет:
    - CPU + Motherboard: совместимость сокета
    - Motherboard + RAM: тип памяти (DDR4/DDR5)
    - GPU + Case: длина видеокарты
    - PSU: достаточная мощность
    - Cooler + Case: высота кулера
    - Form Factor: совместимость форм-факторов
    """
    if not request.product_ids:
        raise HTTPException(status_code=400, detail="No products provided")
    
    # Use global db
    if db is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    from bson import ObjectId
    
    parts = []
    for pid in request.product_ids:
        try:
            product = await db.products.find_one({"_id": ObjectId(pid)}, {"_id": 0})
            if product:
                product["id"] = pid
                parts.append(product)
        except Exception as e:
            logger.warning(f"Invalid product ID: {pid} - {e}")
    
    if not parts:
        raise HTTPException(status_code=404, detail="No valid products found")
    
    # Run compatibility check
    report = compatibility_service.validate_build(parts)
    
    return {
        "success": True,
        "report": report.to_dict(),
        "parts_checked": len(parts)
    }


@router.post("/quick-check")
async def quick_compatibility_check(
    request: QuickCheckRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Быстрая проверка совместимости нового товара с существующими.
    
    Используется при добавлении в корзину для проактивного предупреждения.
    """
    # Use global db
    if db is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    from bson import ObjectId
    
    # Fetch new product
    try:
        new_product = await db.products.find_one({"_id": ObjectId(request.new_product_id)}, {"_id": 0})
        if not new_product:
            raise HTTPException(status_code=404, detail="New product not found")
        new_product["id"] = request.new_product_id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID: {e}")
    
    # Fetch existing products
    existing_parts = []
    for pid in request.existing_product_ids:
        try:
            product = await db.products.find_one({"_id": ObjectId(pid)}, {"_id": 0})
            if product:
                product["id"] = pid
                existing_parts.append(product)
        except:
            pass
    
    # Quick check
    issue = compatibility_service.quick_check(new_product, existing_parts)
    
    if issue:
        return {
            "success": True,
            "is_compatible": False,
            "issue": {
                "severity": issue.severity.value,
                "component1": issue.component1,
                "component2": issue.component2,
                "issue_type": issue.issue_type,
                "message": issue.message,
                "suggestion": issue.suggestion
            }
        }
    
    return {
        "success": True,
        "is_compatible": True,
        "issue": None
    }


@router.get("/recommendations/{product_id}")
async def get_compatible_recommendations(
    product_id: str,
    limit: int = 5
):
    """
    Получить рекомендации совместимых компонентов для данного товара.
    
    Например: для CPU вернёт совместимые материнские платы.
    """
    # Use global db
    if db is None:
        raise HTTPException(status_code=500, detail="Database not available")
    
    from bson import ObjectId
    
    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid product ID: {e}")
    
    category = product.get("category", "").lower()
    specs = product.get("specs", {})
    recommendations = {}
    
    # CPU -> Motherboards with same socket
    if category == "cpu":
        socket = specs.get("socket")
        if socket:
            mobos = await db.products.find(
                {"category": "motherboard", "specs.socket": socket},
                {"_id": 0, "title": 1, "price": 1, "brand": 1, "specs.form_factor": 1}
            ).limit(limit).to_list(limit)
            recommendations["compatible_motherboards"] = mobos
    
    # Motherboard -> Compatible CPUs and RAM
    elif category == "motherboard":
        socket = specs.get("socket")
        ram_type = specs.get("ram_type")
        
        if socket:
            cpus = await db.products.find(
                {"category": "cpu", "specs.socket": socket},
                {"_id": 0, "title": 1, "price": 1, "brand": 1, "specs.cores": 1}
            ).limit(limit).to_list(limit)
            recommendations["compatible_cpus"] = cpus
        
        if ram_type:
            rams = await db.products.find(
                {"category": "ram", "specs.type": ram_type},
                {"_id": 0, "title": 1, "price": 1, "brand": 1, "specs.capacity": 1}
            ).limit(limit).to_list(limit)
            recommendations["compatible_ram"] = rams
    
    # GPU -> Cases that fit
    elif category == "gpu":
        length = specs.get("length_mm", 0)
        if length:
            cases = await db.products.find(
                {"category": "case", "specs.max_gpu_length": {"$gte": length}},
                {"_id": 0, "title": 1, "price": 1, "brand": 1, "specs.max_gpu_length": 1}
            ).limit(limit).to_list(limit)
            recommendations["compatible_cases"] = cases
        
        recommended_psu = specs.get("recommended_psu_wattage", 0)
        if recommended_psu:
            psus = await db.products.find(
                {"category": "psu", "specs.wattage": {"$gte": recommended_psu}},
                {"_id": 0, "title": 1, "price": 1, "brand": 1, "specs.wattage": 1}
            ).limit(limit).to_list(limit)
            recommendations["compatible_psus"] = psus
    
    return {
        "success": True,
        "product": product.get("title"),
        "category": category,
        "recommendations": recommendations
    }
