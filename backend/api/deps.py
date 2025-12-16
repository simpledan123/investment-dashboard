from database import get_db
from typing import Generator
from sqlalchemy.orm import Session


# Database dependency
def get_db_session() -> Generator[Session, None, None]:
    """데이터베이스 세션 의존성
    
    Yields:
        SQLAlchemy Session
    """
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()
