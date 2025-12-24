from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from models.responses import ErrorResponse
from utils.logger import logger
from datetime import datetime, timezone


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(f"⚠️ Validation error on {request.url.path}: {errors}")
    
    error_response = ErrorResponse(
        error="Validation failed",
        error_code="VALIDATION_ERROR",
        details={"errors": errors},
        timestamp=datetime.now(timezone.utc)
    )
    
    # Convert to dict and serialize datetime
    content = error_response.dict()
    content['timestamp'] = content['timestamp'].isoformat()
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=content
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.warning(
        f"⚠️ HTTP {exc.status_code} on {request.url.path}: {exc.detail}"
    )
    
    # Check if detail is already our error format
    if isinstance(exc.detail, dict) and 'error' in exc.detail:
        content = exc.detail
    else:
        error_response = ErrorResponse(
            error=exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            error_code=f"HTTP_{exc.status_code}",
            timestamp=datetime.now(timezone.utc)
        )
        content = error_response.dict()
        content['timestamp'] = content['timestamp'].isoformat()
    
    return JSONResponse(
        status_code=exc.status_code,
        content=content
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other unhandled exceptions"""
    logger.error(
        f"❌ Unhandled exception on {request.url.path}: {str(exc)}",
        exc_info=True
    )
    
    # In development, show detailed error
    details = None
    if request.app.debug:
        details = {
            "message": str(exc),
            "type": type(exc).__name__
        }
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            error_code="INTERNAL_ERROR",
            details=details,
            timestamp=datetime.now(timezone.utc)
        ).dict()
    )
