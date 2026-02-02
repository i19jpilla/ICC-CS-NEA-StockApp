from dataclasses import dataclass
from datetime import time

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
        self.symbol = data.symbol
        self.price = data.prices[0] if data.prices else 0.0

    def update_price(self, new_price: float):
        self.price = new_price

class StockMarket:
    def __init__(self):
        self.stocks: dict[str, MarketStock] = {}

    def add_stock(self, stock: MarketStock):
        self.stocks[stock.symbol] = stock

    def get_stock(self, symbol: str) -> MarketStock | None:
        return self.stocks.get(symbol)

class SimulatedMarket(StockMarket):
    def __init__(self):
        super().__init__()
        # Initialize with some simulated stocks
        self.add_stock(MarketStock(StockData(
            symbol="AAPL",
            name="Apple Inc.",
            buy_price=150.0,
            sell_price=145.0,
            dates=[],
            prices=[150.0]
        )))

        self.add_stock(MarketStock(StockData(
            symbol="GOOGL",
            name="Alphabet Inc.",
            buy_price=2800.0,
            sell_price=2750.0,
            dates=[],
            prices=[2800.0]
        )))

    def step(self):
        # Simulate stock price changes
        for stock in self.stocks.values():
            # Simple random walk for demonstration
            import random
            change = random.uniform(-1, 1)
            new_price = max(0, stock.price + change)
            stock.update_price(new_price)

    def get_stock_price(self, symbol: str) -> float | None:
        stock = self.get_stock(symbol)
        return stock.price if stock else None
    
    def buy_stock(self, symbol: str, quantity: int) -> float:
        stock_price = self.get_stock_price(symbol)
        if stock_price is None:
            raise Exception("Stock not found in simulated market.")
        total_cost = stock_price * quantity
        return total_cost