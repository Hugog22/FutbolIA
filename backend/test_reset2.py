import sys
from sqlalchemy.orm import Session
from db.session import SessionLocal
from db.models import User
from core.subscription import reset_if_new_month

def main():
    db = SessionLocal()
    user = db.query(User).filter(User.free_analyses_reset_at != None).first()
    if not user:
        print("No user found with reset_at populated")
        return
    print(f"User: {user.email}, reset_at: {user.free_analyses_reset_at}")
    try:
        reset_if_new_month(user, db)
        print("Reset successful")
    except Exception as e:
        print(f"Error during reset: {repr(e)}")
    db.close()

if __name__ == "__main__":
    main()
