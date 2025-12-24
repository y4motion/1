from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from utils.logger import logger
from utils.metrics import metrics
import time


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        # Start timer
        start_time = time.time()
        
        # Get client info
        client_host = request.client.host if request.client else "unknown"
        
        # Log incoming request
        logger.info(
            f"➡️  {request.method:6} {request.url.path:50} | Client: {client_host}"
        )
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log unhandled exceptions
            duration = time.time() - start_time
            logger.error(
                f"⬅️  500 {request.method:6} {request.url.path:50} | "
                f"Duration: {duration:.3f}s | ERROR: {str(e)}"
            )
            
            # Record metrics
            metrics.record_request(request.url.path, duration, 500)
            
            raise
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Record metrics
        metrics.record_request(request.url.path, duration, response.status_code)
        
        # Log response with color coding
        status = response.status_code
        log_msg = (
            f"⬅️  {status} {request.method:6} {request.url.path:50} | "
            f"Duration: {duration:.3f}s"
        )
        
        # Add slow query warning
        if duration > 1.0:
            log_msg += " ⚠️ SLOW"
        
        # Log with appropriate level
        if status >= 500:
            logger.error(log_msg)
        elif status >= 400:
            logger.warning(log_msg)
        else:
            logger.info(log_msg)
        
        # Add custom header with response time
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        response.headers["X-Request-ID"] = str(id(request))
        
        return response
