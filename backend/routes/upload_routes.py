"""
Image Upload Routes for Glassy Swap
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import uuid
import os
import aiofiles
from datetime import datetime

from utils.auth_utils import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])

# Upload directory
UPLOAD_DIR = "/app/backend/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed image types
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload single image"""
    
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_TYPES)}"
        )
    
    # Read file
    content = await file.read()
    
    # Validate size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)
    
    # Return URL
    return {
        "url": f"/static/uploads/{filename}",
        "filename": filename,
        "size": len(content),
        "content_type": file.content_type
    }


@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload multiple images (up to 5)"""
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    results = []
    
    for file in files:
        # Validate content type
        if file.content_type not in ALLOWED_TYPES:
            continue
        
        content = await file.read()
        
        # Skip if too large
        if len(content) > MAX_FILE_SIZE:
            continue
        
        # Generate unique filename
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        
        results.append({
            "url": f"/static/uploads/{filename}",
            "filename": filename,
            "size": len(content)
        })
    
    return {"uploaded": results, "count": len(results)}


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete uploaded image"""
    
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    os.remove(filepath)
    
    return {"deleted": filename}
