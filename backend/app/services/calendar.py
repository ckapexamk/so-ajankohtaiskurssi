from app.repositories.session import find_calendar_sessions

def list_calendar_sessions(db, user_id, from_, to, plan_id=None):
    return find_calendar_sessions(db, user_id, from_, to, plan_id)