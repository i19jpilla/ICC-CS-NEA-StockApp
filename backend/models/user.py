from time import time
from backend import services
from backend.database.connection import db

from dataclass import dataclass


class User:
    user_id: str
    username: str
    email: str
    #password: str   should not store password locally

    def __init__(self, user_id, username, email):
        self.user_id = user_id
        self.username = username
        self.email = email

class Profile:
    user_id: str
    balance: int
    portfolio: dict[str, int]

    def __init__(self, user_id, balance, portfolio):
        self.user_id = user_id
        self.balance = balance
        self.portfolio = portfolio #change to portfolio class

        self.dirty = False

    def set_balance(self, amount):
        self.balance = amount
        self.dirty = True

class UserSession:
    def __init__(self, user: User):
        self.user = user
        self.profile = self._load_profile(user)

    def _load_profile(self):
        cursor = db.connection.cursor()
        cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (self.user.id))
        profile_data = cursor.fetchone()
        print("Profile loaded", profile_data)

        if profile_data: 
            return Profile(
                user_id = self.user.id,
                balance = profile_data["balance"],
                portfolio = profile_data["portfolio"] or {} #need a separate portfolio table
            )
        else:
            return {}

    async def _save(self):
        if not self.dirty: return

        cursor = await db.connection.cursor()
        await cursor.execute("""
            UPDATE profiles SET
            balance = ?
            WHERE user_id = ?
        """, (self.profile.balance, self.user.id))
        await db.connection.commit()

        self.dirty = False

    def get_balance(self):
        return self.profile.balance or 0
    
    def update_balance(self, fn):
        balance = self.get_balance()
        balance = fn(balance)
        self.profile.set_balance(balance)

    def get_portfolio(self):
        return self.profile.portfolio or {
            "AAPL": 10
        }

    async def get_portfolio(self):
        cursor = await db.connection.cursor()
        await cursor.execute("SELECT symbol, quantity FROM portfolios WHERE user_id = ?", (self.id,))
        results = await cursor.fetchall()
        print("Fetched portfolio from DB:", results)
        portfolio = {}
        for row in results:
            print("Portfolio item:", row)
            symbol, quantity = row[0], row[1]
            portfolio[symbol] = quantity

        return portfolio
    
    async def add_to_portfolio(self, symbol: str, quantity: int):
        portfolio = self.get_portfolio()
        if not portfolio[symbol]: portfolio[symbol] = 0
        portfolio[symbol] += quantity
    
    async def buy_stock(self, symbol: str, quantity: int):
        await services.stock.buy_stock(user=self.user, symbol=symbol, quantity=quantity)

    async def sell_stock(self, symbol: str, quantity: int):
        await services.stock.sell_stock(user=self.user, symbol=symbol, quantity=quantity)