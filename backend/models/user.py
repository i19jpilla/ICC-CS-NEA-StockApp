from time import time
from backend import services
from backend.database.connection import db

class User:
    def __init__(self, id, username, email):
        self.username = username
        self.email = email
        self.id = id  # This would typically be set by the database

    def get_profile(self):
        return {
            "username": self.username,
            "email": self.email,
            "id": self.id
        }
    
    async def get_balance(self):
        # Placeholder for balance retrieval logic
        cursor = await db.connection.cursor()
        await cursor.execute("SELECT balance FROM profile WHERE user_id = ?", (self.id,))
        result = await cursor.fetchone()
        return result[0] if result else 0.0  # Return 0 if no balance found
    
    async def update_balance(self, amount: float):
        cursor = await db.connection.cursor()
        await cursor.execute("UPDATE profile SET balance = balance + ? WHERE user_id = ?", (amount, self.id))
        await db.connection.commit()
        return await self.get_balance()

    async def get_portfolio(self):
        cursor = await db.connection.cursor()
        await cursor.execute("SELECT symbol, quantity FROM portfolio WHERE user_id = ?", (self.id,))
        results = await cursor.fetchall()

        portfolio = {}
        for row in results:
            print("Portfolio item:", row)
            symbol, quantity = row[0], row[1]
            portfolio[symbol] = quantity

        return portfolio
    
    async def add_to_portfolio(self, symbol: str, quantity: int):
        portfolio = await self.get_portfolio()
        if symbol in portfolio:
            portfolio[symbol] += quantity
        else:
            portfolio[symbol] = quantity

        cursor = await db.connection.cursor()
        await cursor.execute("UPDATE portfolio SET quantity = ? WHERE user_id = ? AND symbol = ?",
                             (portfolio[symbol], self.id, symbol))
        await db.connection.commit()
        return portfolio

class UserSession:
    def __init__(self, user: User, token: str, expiration: int = 3600):
        self.user = user
        self.token = token
        self.expiration = time() + expiration

    def get_session_info(self):
        return {
            "user": self.user.get_profile(),
            "token": self.token,
            "expiration": self.expiration
        }
    
    async def buy_stock(self, symbol: str, quantity: int):
        await services.stock.buy_stock(self.user, symbol=symbol, quantity=quantity)

    async def sell_stock(self, symbol: str, quantity: int):
        await services.stock.sell_stock(self.user, symbol=symbol, quantity=quantity)