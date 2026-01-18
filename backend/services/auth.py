class AuthService:
    def __init__(self):
        self.users = {
            "testuser": "password123"
        }  # This would typically interface with a database

    async def login(self, username, password):
        # Logic for user login
        if username in self.users and self.users[username] == password:
            token = self._generate_token(username)
            return {
                "status": "success",
                "message": "Login successful",
                "token": token,
                "username": username
            }
        else:
            return {"status": "failure", "message": "Invalid username or password"}

    async def register(self, username, password):
        # Logic for user registration
        if username in self.users:
            return {"status": "failure", "message": "Username already exists"}
        else:
            self.users[username] = password  # In real applications, hash the password
            return {"status": "success", "message": "Registration successful"}

    def _generate_token(self, username):
        # Dummy token generation logic
        return f"token_for_{username}"