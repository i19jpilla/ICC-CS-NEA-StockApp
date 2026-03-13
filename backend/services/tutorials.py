from time import time
from backend.database.connection import db
from backend.models.user import User, UserSession
from backend.models.cache import Cache

# move to json file
TUTORIAL_CONFIG = {
    "dashboard": {},
    "sandbox": {},
}

class TutorialService:
    def __init__(self):
        self._sessions: dict[str, UserSession] = {}
        self._token_dict: dict[str, str] = {}

    def start_tutorial(self, session: UserSession, tutorial_id: str):
        if not tutorial_id in TUTORIAL_CONFIG:
            print("Invalid tutorial", tutorial_id)
            return
        
        session.tutorials.start_tutorial(tutorial_id)

    def next_stage(self, session: UserSession, tutorial_id: str, stage: int):
        tutorial_data = self.get_tutorial_data(tutorial_id)
        curr_stage = tutorial_data["stage"]
        stage = stage or curr_stage + 1
        
