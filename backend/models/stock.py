import asyncio
from dataclasses import dataclass, asdict
from datetime import datetime
import time

from backend.models.user import UserSession
from backend import services

@dataclass
class StockData:
    symbol: str
    name: str
    buy_price: float
    sell_price: float
    dates: list[str]
    prices: list[float]

class MarketStock:
    def __init__(self, data: StockData):
        self._data = data
        self.symbol = data.symbol
        self.history: list = self._generate_price_history(self._data)
        self.current_price = self._data.buy_price

    def _generate_price_history(self, data: StockData):
        history = []
        # Create a dictionary mapping dates to prices for easy access
        # Must assume that dates and prices are aligned in the same order
        for i in range(len(data.dates)):
            history.append({
                "timestamp": data.dates[i],
                "price": data.prices[i]
            })
        return history

    def update_price(self, new_price: float, timestamp: int = None):
        self.current_price = new_price
        if not timestamp:
            timestamp = int(time.time())

        date = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        self.history.append({
            "timestamp": date,
            "price": new_price
        })

    def get_price(self) -> float:
        return self.current_price or self._data.buy_price
    
    def get_data(self) -> dict:
        # Return a copy of the original StockData with updated current_price
        history = {}
        for entry in self.history:
            #convert timestamp to string for JSON serialization
            timestamp = entry["timestamp"].strftime('%Y-%m-%d %H:%M:%S') if isinstance(entry["timestamp"], datetime) else entry["timestamp"]
            history[timestamp] = entry["price"]

        data = {
            "buy_price": self.current_price,
            "sell_price": self.current_price * 0.95,
            "history": history,
            "name": self._data.name,
            "symbol": self._data.symbol,
        }
        return data

class StockMarket:
    def __init__(self):
        self.stocks: dict[str, MarketStock] = {}

    def add_stock(self, stock: MarketStock):
        self.stocks[stock.symbol] = stock

    def get_stock(self, symbol: str) -> MarketStock | None:
        return self.stocks.get(symbol)
    
    def get_stock_data(self, symbol: str) -> dict | None:
        stock = self.get_stock(symbol)
        return stock.get_data() if stock else None
    
    async def buy_stock(self, session: UserSession, symbol: str, quantity: int):
        stock = self.get_stock(symbol)
        if not stock:
            print("Stock not found in market.")
            return {
                "success": False,
                "message": "Stock not found in market."
            }
        
        total_cost = stock.get_price() * quantity

        user_balance = session.profile.balance
        if user_balance < total_cost:
            print("Insufficient funds to complete purchase.")
            return {
                "success": False,
                "message": "Insufficient funds to complete purchase."
            }
        
        session.update_balance(lambda balance: balance - total_cost)

        session.portfolio.add_stock(symbol, quantity)
        curr_quantity = session.portfolio.holdings.get(symbol, 0)

        # Here you would add logic to deduct funds from the user's account
        print(f"User {session.user.username} bought {quantity} shares of ${symbol} at ${stock.get_price()} each for a total of ${total_cost}.")
        return {
            "success": True,
            "total_stock": curr_quantity,
            "balance": user_balance
        }
    
    async def sell_stock(self, user: UserSession, symbol: str, quantity: int) -> float:
        stock = self.get_stock(symbol)
        if not stock:
            print("Stock not found in market.")
            return
        total_revenue = stock.get_price() * quantity
        return total_revenue

class SandboxMarket(StockMarket):
    def __init__(self):
        super().__init__()
        self.market_id = f"sandbox_{int(time.time())}"
        self.tracked_stocks: set[str] = set()

        # Initialize with some simulated stocks
        self.add_stock(MarketStock(StockData(
            symbol="AAPL",
            name="Apple Inc.",
            buy_price=600.0,
            sell_price=575.0,
            dates=[],
            prices=[]
        )))

        self.add_stock(MarketStock(StockData(
            symbol="GOOG",
            name="Alphabet Inc.",
            buy_price=800.0,
            sell_price=750.0,
            dates=[],
            prices=[]
        )))

        self.add_stock(MarketStock(StockData(
            symbol="TSLA",
            name="Tesla Inc.",
            buy_price=500.0,
            sell_price=450.0,
            dates=[],
            prices=[]
        )))

        self.start_time = time.time()
        self.steps = 0
        self.TICK_INTERVAL = 60  # seconds

        self.UPDATE_INTERVAL = 2  # seconds

        for i in range(20):  # Simulate 20 initial steps to populate price history
            self.step()

    def get_websocket_channel(self):
        return f"sandbox:{self.market_id}"

    async def _simulate_market(self):
        channel = self.get_websocket_channel()
        while True:
            print("Simulating market update...")
            self.step()
            await services.websocket.broadcast(
                channel=channel,
                data={
                    "type": "market_update",
                    "data": self.get_market_stocks()
                }
            )
            await asyncio.sleep(self.UPDATE_INTERVAL)  # Simulate market updates every 5 seconds
    
    def step(self):
        self.steps += 1
        now = self.start_time + (self.steps * self.TICK_INTERVAL)
        print(f"Sandbox market step {self.steps} at time {now:.2f}s")

        # Simulate stock price changes
        for stock in self.stocks.values():
            import random
            # Simulate a price change of up to ±50%
            VOLATILITY = 0.5 
            price_change = stock.get_price() * random.uniform(-VOLATILITY, VOLATILITY) 
            new_price = max(0, stock.get_price() + price_change) # Ensure price doesn't go negative
            stock.update_price(new_price, now)
        
        print(self.stocks.items())

    def start(self):
        # Simulate market conditions (e.g., price changes, news events)
        self.main_loop = asyncio.create_task(self._simulate_market())
        self.track_all_stocks()  # Track all stocks by default

    def stop(self):
        self.main_loop.cancel()

    # Handles the tracking / untracking of stocks in the sandbox (cannot add for the regular one, as it is global)
    def get_market_stocks(self) -> dict[str, dict]:
        stock_data = {}
        for symbol, stock in self.stocks.items():
            if symbol in self.tracked_stocks:
                stock_data[symbol] = stock.get_data()
        return stock_data
    
    def track_stock(self, symbol: str):
        if symbol in self.stocks:
            self.tracked_stocks.add(symbol)
    
    def untrack_stock(self, symbol: str):
        self.tracked_stocks.discard(symbol)
    
    def track_all_stocks(self):
        self.tracked_stocks = set(self.stocks.keys())