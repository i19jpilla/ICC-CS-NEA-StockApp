import asyncio
from dataclasses import dataclass, asdict
from datetime import datetime

from backend.models.user import UserSession

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

    def update_price(self, new_price: float):
        self.current_price = new_price
        timestamp = datetime.now()
        self.history.append({
            "timestamp": timestamp,
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
            "sell_price": self.current_price,  # Assuming sell price is same as buy price
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
    
    def sell_stock(self, user: UserSession, symbol: str, quantity: int) -> float:
        stock = self.get_stock(symbol)
        if not stock:
            raise Exception("Stock not found in market.")
        total_revenue = stock.price * quantity
        return total_revenue

class SandboxMarket(StockMarket):
    def __init__(self):
        super().__init__()
        # Initialize with some simulated stocks
        self.add_stock(MarketStock(StockData(
            symbol="AAPL",
            name="Apple Inc.",
            buy_price=150.0,
            sell_price=145.0,
            dates=[],
            prices=[]
        )))

        self.add_stock(MarketStock(StockData(
            symbol="GOOG",
            name="Alphabet Inc.",
            buy_price=2800.0,
            sell_price=2750.0,
            dates=[],
            prices=[]
        )))

        for i in range(10):
            self.step()  # Simulate some initial price changes to populate history

    def _simulate_market(self):
        while True:
            self.step()
            asyncio.sleep(5)  # Simulate market updates every 5 seconds
    
    def step(self):
        # Simulate stock price changes
        for stock in self.stocks.values():
            # Simple random walk for demonstration
            import random
            change = random.uniform(-1, 1)
            new_price = max(0, stock.get_price() + change)
            stock.update_price(new_price)
        
        print(self.stocks.items())

    def start(self):
        # Simulate market conditions (e.g., price changes, news events)
        self.main_loop = asyncio.create_task(self._simulate_market())

    def stop(self):
        self.main_loop.cancel()

    def get_market_stocks(self) -> dict[str, dict]:
        stock_data = {}
        for symbol, stock in self.stocks.items():
            stock_data[symbol] = stock.get_data()
        return stock_data