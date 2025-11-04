from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from models.pc_build import PCBuild, PCBuildCreate, PCBuildUpdate
from models.user import User
from database import db
from utils.auth_utils import get_current_user, get_current_user_optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/pc-builds", tags=["PC Builds"])

@router.post("", response_model=PCBuild, status_code=status.HTTP_201_CREATED)
async def create_pc_build(
    build_data: PCBuildCreate,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Create a new PC build configuration"""
    
    # Calculate total price and power
    total_price = sum(comp.price for comp in build_data.components.values())
    
    # Calculate power consumption
    total_power = 0
    for comp in build_data.components.values():
        if comp.tdp:
            total_power += comp.tdp
        if comp.component_type == 'motherboard':
            total_power += 50
        elif comp.component_type == 'ram':
            total_power += 10
        elif comp.component_type == 'storage':
            total_power += 10
    
    # Add fan power
    total_power += 30
    
    # Calculate recommended PSU (20% headroom)
    recommended_psu = int((total_power * 1.2 // 50 + 1) * 50)
    
    # Determine build type from case component
    build_type = None
    if 'case' in build_data.components:
        case_name = build_data.components['case'].name.lower()
        if 'mini' in case_name or 'itx' in case_name:
            build_type = 'Mini-ITX'
        elif 'micro' in case_name:
            build_type = 'Micro-ATX'
        elif 'full' in case_name:
            build_type = 'Full-Tower'
        else:
            build_type = 'Mid-Tower'
    
    # Check if build is complete (all required components)
    required_components = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu']
    is_complete = all(comp in build_data.components for comp in required_components)
    
    new_build = PCBuild(
        id=str(uuid.uuid4()),
        user_id=current_user.id if current_user else None,
        build_name=build_data.build_name,
        build_type=build_type,
        components=build_data.components,
        total_price=total_price,
        total_power=total_power,
        recommended_psu=recommended_psu,
        is_complete=is_complete,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    await db.pc_builds.insert_one(new_build.model_dump())
    
    return new_build

@router.get("", response_model=List[PCBuild])
async def get_user_builds(
    current_user: User = Depends(get_current_user)
):
    """Get all PC builds for the current user"""
    builds = await db.pc_builds.find({"user_id": current_user.id}).to_list(100)
    return [PCBuild(**build) for build in builds]

@router.get("/{build_id}", response_model=PCBuild)
async def get_pc_build(
    build_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a specific PC build by ID"""
    build = await db.pc_builds.find_one({"id": build_id})
    
    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PC build not found"
        )
    
    # Check if user owns this build (optional - allow viewing public builds)
    if current_user and build.get("user_id") != current_user.id:
        pass  # Allow viewing other builds for now
    
    return PCBuild(**build)

@router.put("/{build_id}", response_model=PCBuild)
async def update_pc_build(
    build_id: str,
    build_update: PCBuildUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a PC build"""
    existing_build = await db.pc_builds.find_one({"id": build_id, "user_id": current_user.id})
    
    if not existing_build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PC build not found or unauthorized"
        )
    
    update_data = {}
    
    if build_update.build_name is not None:
        update_data["build_name"] = build_update.build_name
    
    if build_update.components is not None:
        # Recalculate totals
        total_price = sum(comp.price for comp in build_update.components.values())
        
        total_power = 0
        for comp in build_update.components.values():
            if comp.tdp:
                total_power += comp.tdp
            if comp.component_type == 'motherboard':
                total_power += 50
            elif comp.component_type == 'ram':
                total_power += 10
            elif comp.component_type == 'storage':
                total_power += 10
        total_power += 30
        
        recommended_psu = int((total_power * 1.2 // 50 + 1) * 50)
        
        # Determine build type
        build_type = None
        if 'case' in build_update.components:
            case_name = build_update.components['case'].name.lower()
            if 'mini' in case_name or 'itx' in case_name:
                build_type = 'Mini-ITX'
            elif 'micro' in case_name:
                build_type = 'Micro-ATX'
            elif 'full' in case_name:
                build_type = 'Full-Tower'
            else:
                build_type = 'Mid-Tower'
        
        required_components = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu']
        is_complete = all(comp in build_update.components for comp in required_components)
        
        update_data["components"] = {k: v.model_dump() for k, v in build_update.components.items()}
        update_data["total_price"] = total_price
        update_data["total_power"] = total_power
        update_data["recommended_psu"] = recommended_psu
        update_data["build_type"] = build_type
        update_data["is_complete"] = is_complete
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.pc_builds.update_one(
        {"id": build_id},
        {"$set": update_data}
    )
    
    updated_build = await db.pc_builds.find_one({"id": build_id})
    return PCBuild(**updated_build)

@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pc_build(
    build_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a PC build"""
    result = await db.pc_builds.delete_one({"id": build_id, "user_id": current_user.id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PC build not found or unauthorized"
        )
    
    return None

@router.post("/{build_id}/add-to-cart")
async def add_build_to_cart(
    build_id: str,
    as_assembled: bool = False,
    current_user: User = Depends(get_current_user)
):
    """
    Add PC build to cart
    - as_assembled=False: Add individual components
    - as_assembled=True: Add as a complete assembled build
    """
    build = await db.pc_builds.find_one({"id": build_id})
    
    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PC build not found"
        )
    
    if not build.get('is_complete'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Build is incomplete. All required components must be selected."
        )
    
    # Get or create user's cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        cart = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "items": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.carts.insert_one(cart)
    
    if as_assembled:
        # Add as single assembled build item
        cart_item = {
            "id": str(uuid.uuid4()),
            "type": "assembled_build",
            "build_id": build_id,
            "name": f"{build.get('build_name', 'Custom PC')} (Assembled)",
            "price": build.get('total_price', 0) + 99,  # Add assembly fee
            "quantity": 1,
            "metadata": {
                "build_type": build.get('build_type'),
                "components_count": len(build.get('components', {}))
            }
        }
        cart['items'].append(cart_item)
    else:
        # Add individual components
        for comp_key, comp_data in build.get('components', {}).items():
            cart_item = {
                "id": str(uuid.uuid4()),
                "type": "component",
                "component_type": comp_data.get('component_type'),
                "name": comp_data.get('name'),
                "price": comp_data.get('price'),
                "quantity": 1,
                "specs": comp_data.get('specs')
            }
            cart['items'].append(cart_item)
    
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart},
        upsert=True
    )
    
    return {
        "message": "Build added to cart successfully",
        "cart_id": cart['id'],
        "items_added": len(build.get('components', {})) if not as_assembled else 1
    }
