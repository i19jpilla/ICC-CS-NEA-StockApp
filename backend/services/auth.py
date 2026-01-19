from time import time
from backend.database.connection import db
from backend.models.user import User, UserSession
from backend.models.cache import Cache

class AuthService:
    def __init__(self):
        self._user_sessions: dict[str, UserSession] = {}

    def _cleanup_sessions(self):
        current_time = time()
        tokens_to_remove = []
        for token, session in self._user_sessions.items():
            if session.expiration <= current_time:
                tokens_to_remove.append(token)

        for token in tokens_to_remove:
            del self._user_sessions[token]

    async def login(self, username, password):
        cursor = await db.connection.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
        userdata = await cursor.fetchone()
        if userdata:
            user_id = userdata[0]
            if self._user_sessions.has(user_id):
                session = self._user_sessions.get(user_id)
                return {
                    "status": "success",
                    "message": "Already logged in",
                    "token": session.token,
                    "username": username
                }
            else:
                user = User(
                    id=userdata[0],
                    username=userdata[1],
                    email=userdata[3]
                )

                token = self._generate_token(username)
                session = UserSession(user, token)
                self._user_sessions.set(token, session, expiration=3600)

                return {
                    "status": "success",
                    "message": "Login successful",
                    "token": token,
                    "username": username
                }
        else:
            return {"status": "failure", "message": "Invalid username or password"}
        
    async def logout(self, token: str):
        if token in self._user_sessions:
            del self._user_sessions[token]
            return {"status": "success", "message": "Logout successful"}
        else:
            return {"status": "failure", "message": "Invalid session token"}

    async def register(self, username, password):
        cursor = await db.connection.execute("SELECT * FROM users WHERE username = ?", (username,))
        existing_user = await cursor.fetchone()
        if existing_user:
            return {"status": "failure", "message": "Username already exists"}
        else:
            await db.connection.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
            return {"status": "success", "message": "Registration successful"}
        
    def get_session(self, token: str) -> UserSession:
        return self._user_sessions.get(token)

    def _generate_token(self, username):
        # Dummy token generation logic
        return f"token_for_{username}"