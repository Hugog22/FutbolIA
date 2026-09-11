import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from db.models import Match, Team
from db.session import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

matches = db.query(Match).all()
for m in matches:
    home = db.query(Team).get(m.home_team_id)
    away = db.query(Team).get(m.away_team_id)
    print(f"ID: {m.id}, Date: {m.date}, Home: {home.name}, Away: {away.name}")
