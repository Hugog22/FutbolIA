from datetime import datetime, timezone
import pytz
aware = datetime.now(timezone.utc)
naive = datetime.utcnow()
try:
    aware < naive
except Exception as e:
    print(f"Error: {repr(e)}")
