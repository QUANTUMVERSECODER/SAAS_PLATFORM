import logging
import sys

def setup_logging():
    # Production-ready structured logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Configure uvicorn loggers
    logger = logging.getLogger("uvicorn.access")
    logger.setLevel(logging.INFO)
    
    return logging.getLogger("saas_platform")

logger = setup_logging()
