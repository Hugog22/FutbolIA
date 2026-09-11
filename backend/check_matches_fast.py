import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from db.session import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

res = db.execute(text("""
SELECT m.id, m.date, home.name, away.name 
FROM matches m 
JOIN teams home ON m.home_team_id = home.id 
JOIN teams away ON m.away_team_id = away.id 
WHERE home.name LIKE '%Betis%' OR away.name LIKE '%Betis%'
ORDER BY m.date ASC;
"""))
for row in res:
    print(row)
