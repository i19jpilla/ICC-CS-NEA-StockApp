import asyncio
from time import time
from backend import services
from backend.database.connection import db

from backend.utils.timer import RepeatedTimer


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

    def __init__(self, user_id, balance):
        self.user_id = user_id
        self.balance = balance
        self.dirty = False

    def set_balance(self, amount):
        self.balance = amount
        self.dirty = True

    async def save(self, user: User):
        if not self.dirty: return # No changes to save
        print("Saving profile to DB for user:", user.username)
        cursor = await db.connection.cursor()
        await cursor.execute("""
            UPDATE profiles SET
            balance = ?
            WHERE user_id = ?
        """, (self.balance, self.user_id))
        await db.connection.commit()
        self.dirty = False
        

class Portfolio:
    def __init__(self, user_id, portfolio_data=None):
        self.user_id = user_id
        self.holdings: dict[str, int] = {}
        if portfolio_data:
            self.holdings = self._convert_to_dict(portfolio_data)

        self.dirty = False

    def _convert_to_dict(self, portfolio_data):
        holdings = {}
        for item in portfolio_data:
            holdings[item["symbol"]] = item["quantity"]
        return holdings
    
    def add_stock(self, symbol: str, quantity: int):
        if symbol not in self.holdings:
            self.holdings[symbol] = 0
        self.holdings[symbol] += quantity
        self.dirty = True
    
    def remove_stock(self, symbol: str, quantity: int):
        if symbol in self.holdings and self.holdings[symbol] >= quantity:
            self.holdings[symbol] -= quantity
            self.dirty = True
            return True
        return False
    
    async def save(self, user: User):
        if not self.dirty: return # No changes to save
        print("Saving portfolio to DB for user:", user.username)
        cursor = await db.connection.cursor()
        for symbol, quantity in self.holdings.items():
            await cursor.execute("""
                UPDATE portfolios SET quantity = ?
                WHERE user_id = ? AND symbol = ?
            """, (quantity, self.user_id, symbol))
        await db.connection.commit()
        self.dirty = False

class Tutorials:
    def __init__(self, user_id, tutorial_data=None):
        self.user_id = user_id
        self.tutorials: dict[str, int] = {}
        if tutorial_data:
            self.tutorials = self._convert_to_dict(portfolio_data)

        self.dirty = False

    def _convert_to_dict(self, portfolio_data):
        holdings = {}
        for item in portfolio_data:
            holdings[item["tutorial_id"]] = {
                "completed": item["completed"],
                "stage": item["stage"]
            }
        return holdings

    def get_tutorial_data(self, tutorial_id):
        if tutorial_id in self.tutorials:
            return self.tutorials[tutorial_id]
    
    def start_tutorial(self, tutorial_id):
        if tutorial_id in self.tutorials:
            tutorial_data = self.tutorials[tutorial_id]
            if tutorial_data["completed"] == True:
                print("already completed")
                return
            
            return tutorial_data
        
        tutorial_data = {
            "completed": False,
            "stage": 1
        }
        self.tutorials[tutorial_id] = tutorial_data
        self.dirty = True
    
    async def save(self, user: User):
        if not self.dirty: return # No changes to save
        print("Saving tutorial data to DB for user:", user.username)
        cursor = await db.connection.cursor()
        for tutorial_id, data in self.holdings.items():
            await cursor.execute("""
                UPDATE portfolios SET completed = ?
                WHERE user_id = ? AND tutorial_id = ?
            """, (data["completed"] or False, self.user_id, tutorial_id))

            await cursor.execute("""
                UPDATE portfolios SET stage = ?
                WHERE user_id = ? AND tutorial_id = ?
            """, (data["stage"] or 1, self.user_id, tutorial_id))
        await db.connection.commit()
        self.dirty = False

class UserSession:
    def __init__(self, user: User):
        self.user = user

    async def start(self):
        self.profile = await self._load_profile()
        self.portfolio = await self._load_portfolio()
        self.tutorials = await self._load_tutorials()
        self.save_loop = asyncio.create_task(self._save_loop())

    async def stop(self):
        self.save_loop.cancel()
        await self._save()

    async def _save_loop(self):
        while True:
            await asyncio.sleep(60)
            await self._save()

    async def _save(self):
        print("Saving profile for user:", self.user.username)
        await self.profile.save(self.user)
        await self.portfolio.save(self.user)
        await self.tutorials.save(self.user)

    async def _load_profile(self):
        if not self.user: return None
        cursor = await db.connection.cursor()
        user_id = int(self.user.user_id)
        print(user_id)
        await cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
        profile_data = await cursor.fetchone()
        print("Profile loaded", profile_data)

        if profile_data: 
            return Profile(
                user_id = profile_data["user_id"],
                balance = profile_data["balance"],
            )
        else:
            return Profile(
                user_id = self.user.user_id,
                balance = 0
            )
    
    async def get_simulated_market(self):
        return services.stock.get_sandbox(self)
        
    async def _load_portfolio(self):
        if not self.user: return None
        cursor = await db.connection.cursor()
        user_id = int(self.user.user_id)
        print(user_id)
        await cursor.execute("SELECT * FROM portfolios WHERE user_id = ?", (user_id,))
        results = await cursor.fetchall()
        print("Portfolio loaded", results)

        portfolio = Portfolio(
            user_id = self.user.user_id,
            portfolio_data=results
        )
        return portfolio

    async def _load_tutorials(self):
        if not self.user: return None
        cursor = await db.connection.cursor()
        user_id = int(self.user.user_id)
        await cursor.execute("SELECT * FROM tutorials WHERE user_id = ?", (user_id,))
        results = await cursor.fetchall()
        print("Tutorials loaded", results)

        tutorials = Tutorials(
            user_id = self.user.user_id,
            tutorial_data = results
        )
        return tutorials

    def get_balance(self):
        return self.profile.balance or 0
    
    def update_balance(self, fn):
        #check if fn is a number
        if isinstance(fn, (int, float)):
            balance = self.get_balance() + fn
            self.profile.set_balance(balance)
            return balance
        elif callable(fn):
            balance = self.get_balance()
            balance = fn(balance)
            self.profile.set_balance(balance)
            return balance
        
    def get_portfolio(self):
        return self.profile.portfolio or {
            "AAPL": 10
        }

    """
    async def get_portfolio(self):
        cursor = await db.connection.cursor()
        await cursor.execute("SELECT symbol, quantity FROM portfolios WHERE user_id = ?", (self.user.id,))
        results = await cursor.fetchall()
        print("Fetched portfolio from DB:", results)
        portfolio = {}
        for row in results:
            print("Portfolio item:", row)
            symbol, quantity = row[0], row[1]
            portfolio[symbol] = quantity

        return portfolio
    """
    
    async def buy_stock(self, symbol: str, quantity: int):
        await services.stock.market.buy_stock(self, symbol=symbol, quantity=quantity)

    async def sell_stock(self, symbol: str, quantity: int):
        await services.stock.market.sell_stock(self, symbol=symbol, quantity=quantity)