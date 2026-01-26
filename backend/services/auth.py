from time import time
from backend.database.connection import db
from backend.models.user import User, UserSession
from backend.models.cache import Cache

class AuthService:
    def __init__(self):
        self._sessions: dict[str, UserSession] = {}

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
            user = User(
                id=userdata[0],
                username=userdata[1],
                email=userdata[3]
            )

            token = self._generate_token(username, userdata[0])
            session = UserSession(user, token)
            self._sessions[token] = session

            #init stats
            await session.user.update_balance(1000.0)
            await session.user.add_to_portfolio("AAPL", 10)

            print(await session.user.get_balance())
            print(await session.user.get_portfolio())

            return {
                "status": "success",
                "message": "Login successful",
                "token": token,
                "username": username,
            }
        else:
            return {"status": "failure", "message": "Invalid username or password"}
        
    async def logout(self, token: str):
        if token in self._sessions:
            del self._sessions[token]
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

    def create_session(self, user_id):
        session = self.get_session(user_id)
        if session: return session

        session = UserSession(user_id)
        self._sessions[user_id] = session
        return session
        
    def get_session(self, user_id) -> UserSession:
        return self._sessions[user_id]

    def _generate_token(self, username,user_id):
        # Dummy token generation logic
        return f"token_for_{username}_{user_id}"