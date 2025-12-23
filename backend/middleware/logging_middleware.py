from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from utils.logger import logger
from utils.metrics import metrics
import time
import json


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
        
        # Log request body for POST/PUT (excluding sensitive endpoints)
        if request.method in ["POST", "PUT"]:
            sensitive_paths = ["/auth/login", "/auth/register", "/payment"]
            is_sensitive = any(path in request.url.path for path in sensitive_paths)
            
            if not is_sensitive and logger.level <= 10:  # DEBUG level
                try:
                    body = await request.body()
                    if body:
                        # Parse body
                        body_str = body.decode('utf-8')
                        try:
                            body_json = json.loads(body_str)
                            # Remove password if present
                            if 'password' in body_json:
                                body_json['password'] = '***'
                            logger.debug(f"   Body: {json.dumps(body_json, ensure_ascii=False)[:200]}")
                        except json.JSONDecodeError:
                            logger.debug(f"   Body: {body_str[:200]}")
                        
                        # Need to create new request with body for next middleware
                        async def receive():
                            return {"type": "http.request", "body": body}
                        
                        request._receive = receive
                except Exception as e:
                    logger.debug(f"   Could not read body: {e}")
        
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
            raise
        
        # Calculate duration
        duration = time.time() - start_time
        
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
        
        return response
