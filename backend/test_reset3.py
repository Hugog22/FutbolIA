import sys
from sqlalchemy.orm import Session
from db.session import SessionLocal
from db.models import User
from core.subscription import reset_if_new_month

def main():
    db = SessionLocal()
    user = db.query(User).filter(User.free_analyses_reset_at != None).first()
    print(f"reset_at type: {type(user.free_analyses_reset_at)}, tzinfo: {user.free_analyses_reset_at.tzinfo}")
    db.close()

if __name__ == "__main__":
    main()
