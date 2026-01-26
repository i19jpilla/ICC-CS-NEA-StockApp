from time import time
from backend import services
from backend.database.connection import db

from dataclass import dataclass

@dataclass
class User:
    user_id: str
    username: str
    email: str
    #password: str   should not store password locally

class Profile:
    user_id: str
    balance: int
    portfolio: dict[str, int]

class User:
    def __init__(self, user_id, username, email):
        self.id = user_id
        self.user = self._load_user()
        self.profile = self._load_profile()
        self.dirty = False
    
     def _load_profile(self):
        cursor = db.connection.cursor()
        cursor.execute("SELECT * FROM profile WHERE user_id = ?", (self.id))
        profile_data = cursor.fetchone()
        print("Profile loaded", profile_data)

        if profile_data: 
            return Profile(
                user_id = self.id,
                balance = profile_data["balance"],
                portfolio = profile_data["portfolio"] or {} #need a separate portfolio table
            )
        else:
            return {}

    async def _save(self):
        if not self.dirty: return

    
    

class UserSession:
    def __init__(self, user: User):
        self.user = user

    async def get_balance(self):
        # Placeholder for balance retrieval logic
        cursor = await db.connection.cursor()
        await cursor.execute("SELECT balance FROM profile WHERE user_id = ?", (self.user.id,))
        result = await cursor.fetchone()
        print("Fetched balance from DB:", result)
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
        print("Fetched portfolio from DB:", results)
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
    
    async def buy_stock(self, symbol: str, quantity: int):
        await services.stock.buy_stock(user=self.user, symbol=symbol, quantity=quantity)

    async def sell_stock(self, symbol: str, quantity: int):
        await services.stock.sell_stock(user=self.user, symbol=symbol, quantity=quantity)