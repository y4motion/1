from models.responses import SuccessResponse, ErrorResponse, PaginatedResponse, PaginationMeta, MessageResponse
from typing import Any, List, TypeVar
from fastapi import HTTPException
from utils.logger import logger

T = TypeVar('T')


def success_response(data: Any, message: str = None):
    """Create standardized success response"""
    return SuccessResponse(
        data=data,
        message=message
    ).dict()


def message_response(message: str):
    """Create simple message response"""
    return MessageResponse(
        message=message
    ).dict()


def error_response(error: str, error_code: str = None, details: dict = None):
    """Create standardized error response"""
    return ErrorResponse(
        error=error,
        error_code=error_code,
        details=details
    ).dict()


def paginated_response(
    data: List[T],
    page: int,
    limit: int,
    total: int
):
    """Create standardized paginated response"""
    pages = max(1, (total + limit - 1) // limit)  # Ceiling division, at least 1 page
    
    pagination = PaginationMeta(
        page=page,
        limit=limit,
        total=total,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )
    
    return PaginatedResponse(
        data=data,
        pagination=pagination
    ).dict()


def handle_error(e: Exception, context: str = "", status_code: int = 500):
    """
    Centralized error handling
    
    Args:
        e: The exception
        context: Context string for logging
        status_code: HTTP status code to return
    """
    # If already an HTTPException, re-raise it
    if isinstance(e, HTTPException):
        raise e
    
    # Log the error
    logger.error(f"❌ Error in {context}: {str(e)}", exc_info=True)
    
    # Create standardized error response
    error_detail = error_response(
        error=f"Error in {context}" if context else "Internal server error",
        error_code="INTERNAL_ERROR",
        details={"message": str(e)} if str(e) else None
    )
    
    raise HTTPException(
        status_code=status_code,
        detail=error_detail
    )


def validation_error_response(errors: List[dict]):
    """Create validation error response"""
    return error_response(
        error="Validation failed",
        error_code="VALIDATION_ERROR",
        details={"errors": errors}
    )
