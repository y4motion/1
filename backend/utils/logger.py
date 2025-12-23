import logging
import sys
from datetime import datetime
from pathlib import Path
import os

# Create logs directory
LOGS_DIR = Path(__file__).parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# Get environment from env vars
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DEBUG = os.getenv('DEBUG', 'True') == 'True'


class ColoredFormatter(logging.Formatter):
    """Colored log formatter for console"""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        # Save original levelname
        original_levelname = record.levelname
        
        # Add color to level name for console
        if record.levelname in self.COLORS:
            colored_levelname = (
                f"{self.COLORS[record.levelname]}{record.levelname:8}{self.RESET}"
            )
            record.levelname = colored_levelname
        
        # Format the record
        result = super().format(record)
        
        # Restore original levelname
        record.levelname = original_levelname
        
        return result


def setup_logging():
    """Setup application logging"""
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if DEBUG else logging.INFO)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_formatter = ColoredFormatter(
        '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    
    # File handler (all logs)
    today = datetime.now().strftime('%Y%m%d')
    file_handler = logging.FileHandler(
        LOGS_DIR / f"app_{today}.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(name)s | %(filename)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    
    # Error file handler (only errors)
    error_handler = logging.FileHandler(
        LOGS_DIR / f"errors_{today}.log",
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    
    # Add handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    
    # Reduce noise from libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    
    root_logger.info(f"🚀 Logging configured for {ENVIRONMENT} environment")
    root_logger.info(f"📁 Logs directory: {LOGS_DIR}")
    
    return root_logger


# Create logger instance
logger = setup_logging()


# Helper functions for structured logging
def log_api_call(endpoint: str, method: str, user_id: str = None):
    """Log API call with context"""
    logger.info(f"API: {method} {endpoint} | User: {user_id or 'Anonymous'}")


def log_database_operation(operation: str, collection: str, doc_id: str = None):
    """Log database operation"""
    logger.debug(f"DB: {operation} on {collection} | ID: {doc_id or 'N/A'}")


def log_cache_operation(operation: str, key: str, hit: bool = None):
    """Log cache operation"""
    status = '✅ HIT' if hit else '❌ MISS' if hit is not None else 'SET'
    logger.debug(f"CACHE: {status} | {operation} | Key: {key[:50]}...")


def log_error_with_context(error: Exception, context: dict):
    """Log error with additional context"""
    logger.error(
        f"Error: {str(error)} | Context: {context}",
        exc_info=True
    )
