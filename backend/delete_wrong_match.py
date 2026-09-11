import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from db.session import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    db.execute(text("DELETE FROM market_odds WHERE match_id = 620;"))
    db.execute(text("DELETE FROM odds WHERE match_id = 620;"))
    db.execute(text("DELETE FROM odds_history WHERE match_id = 620;"))
    db.execute(text("DELETE FROM bets WHERE match_id = 620;"))
    db.execute(text("DELETE FROM matches WHERE id = 620;"))
    db.commit()
    print("Match 620 and related data deleted successfully.")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
