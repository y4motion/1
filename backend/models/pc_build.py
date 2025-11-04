from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

class PCBuildComponent(BaseModel):
    component_id: str
    component_type: str  # cpu, gpu, motherboard, ram, storage, psu, case, cooling
    name: str
    price: float
    specs: Optional[str] = None
    tdp: Optional[int] = None
    
class PCBuild(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    build_name: Optional[str] = "My PC Build"
    build_type: Optional[str] = None  # Mini-ITX, Micro-ATX, Mid-Tower, Full-Tower
    components: Dict[str, PCBuildComponent] = {}
    total_price: float = 0
    total_power: int = 0
    recommended_psu: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_complete: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user123",
                "build_name": "Gaming Rig 2025",
                "build_type": "Mid-Tower",
                "components": {
                    "cpu": {
                        "component_id": "cpu1",
                        "component_type": "cpu",
                        "name": "AMD Ryzen 7 9800X3D",
                        "price": 479,
                        "specs": "8-Core, 16-Thread, 5.2GHz Boost",
                        "tdp": 120
                    }
                },
                "total_price": 1500,
                "total_power": 450,
                "recommended_psu": 600,
                "is_complete": False
            }
        }

class PCBuildCreate(BaseModel):
    build_name: Optional[str] = "My PC Build"
    components: Dict[str, PCBuildComponent] = {}
    
class PCBuildUpdate(BaseModel):
    build_name: Optional[str] = None
    components: Optional[Dict[str, PCBuildComponent]] = None
