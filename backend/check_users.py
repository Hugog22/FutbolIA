import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from db.models import User
from db.session import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Pro: {u.subscription_status}, Used: {u.free_analyses_used}, Reset: {u.free_analyses_reset_at}")
