from time import time
from backend.database.connection import db
from backend.models.user import User, UserSession
from backend.models.cache import Cache

class AuthService:
    def __init__(self):
        self._sessions: dict[str, UserSession] = {}
        self._token_dict: dict[str, str] = {}

    def _cleanup_sessions(self):
        current_time = time()
        tokens_to_remove = []
        for user_id, session in self._sessions.items():
            if session.expiration <= current_time:
                tokens_to_remove.append(user_id)

        for user_id in tokens_to_remove:
            del self._sessions[user_id]

    async def login(self, username, password):
        password_hash = password  # In real applications, hash the password!
        cursor = await db.connection.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, password_hash))
        userdata = await cursor.fetchone()
        if userdata:
            user_id = userdata[0]
            user = User(
                user_id=user_id,
                username=userdata[1],
                email=userdata[3]
            )

            token = self._generate_token(username, user_id)
            session = self.create_session(user, token)
            await session.start()

            #init stats
            print(session.profile.balance)
            print(session.portfolio.holdings)

            return {
                "status": "success",
                "message": "Login successful",
                "token": token,
                "username": username,
            }
        else:
            return {"status": "failure", "message": "Invalid username or password"}
        
    async def logout(self, token: str):
        if token in self._token_dict:
            user_id = self._token_dict[token]
            session = self._sessions[user_id]
            await session.stop()
            del self._token_dict[user_id]
            del self._sessions[user_id]
            return {"status": "success", "message": "Logout successful"}
        else:
            return {"status": "failure", "message": "Invalid session token"}

    async def register(self, username, password, email):
        cursor = await db.connection.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, email))
        existing_user = await cursor.fetchone()
        if existing_user:
            return {"status": "failure", "message": "Username or email already exists"}
        else:
            password_hash = password  # should hash the password
            await db.connection.execute("INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)", (username, password_hash, email))
            return {"status": "success", "message": "Registration successful"}

    def create_session(self, user, token):
        session = self.get_session(token)
        if session: return session

        session = UserSession(user)
        self._token_dict[token] = session.user.user_id
        self._sessions[session.user.user_id] = session
        return session
        
    def get_session(self, token) -> UserSession:
        if token in self._token_dict:
            user_id = self._token_dict[token]
            return self._sessions.get(user_id)

    def _generate_token(self, username,user_id):
        # Dummy token generation logic
        return f"token_for_{username}_{user_id}"