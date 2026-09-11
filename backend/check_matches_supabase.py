import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from db.models import Match, Team
from db.session import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

matches = db.query(Match).all()
for m in matches:
    home = db.query(Team).filter(Team.id == m.home_team_id).first()
    away = db.query(Team).filter(Team.id == m.away_team_id).first()
    if home and away and ("Betis" in home.name or "Betis" in away.name):
        print(f"ID: {m.id}, Date: {m.date}, Home: {home.name}, Away: {away.name}")
