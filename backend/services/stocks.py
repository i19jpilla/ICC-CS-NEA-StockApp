from time import time
import yfinance as yf
from backend.models.cache import *
from backend.models.user import User


class StockService:
    def __init__(self):
        self._cache = Cache()

    async def get_stock_info(self, symbol):
        if self._cache.has(symbol):
            return self._cache.get(symbol)

        stock = yf.Ticker(symbol)
        hist = stock.history(period="5d")
        stock_history = hist.reset_index()
        print("Stock history retrieved:", symbol)
        data = {
            "symbol": symbol,
            "buy_price": hist['Close'].iloc[-1],
            "sell_price": hist['Close'].iloc[-1] * 0.95,
            "name": stock.info['shortName'],
            "dates": stock_history['Date'].dt.strftime('%Y-%m-%d').tolist(),
            "prices": stock_history['Close'].tolist(),
        }

        self._cache.set(symbol, data, expiration=300)
        return data

    async def get_buy_price(self, symbol):
        data = await self.get_stock_info(symbol)
        return data["buy_price"]
    
    async def get_sell_price(self, symbol):
        data = await self.get_stock_info(symbol)
        return data["sell_price"]

    async def buy_stock(self, user_id: str, symbol: str, quantity: int):
        buy_price = await self.get_buy_price(symbol)
        total_cost = buy_price * quantity

        user_balance = await user.get_balance()
        if user_balance < total_cost:
            raise Exception("Insufficient funds to complete purchase.")
        user_balance = await user.update_balance(-total_cost)

        portfolio = await user.add_to_portfolio(symbol, quantity)
        curr_quantity = portfolio[symbol]

        # Here you would add logic to deduct funds from the user's account
        print(f"User {user.username} bought {quantity} shares of ${symbol} at {buy_price} each for a total of {total_cost}.")
        return {
            "total_stock": curr_quantity,
            "balance": user_balance
        }

    async def sell_stock(self, user: User, symbol: str, quantity: int):
        sell_price = await self.get_sell_price(symbol)
        total_revenue = sell_price * quantity
        # Here you would add logic to add funds to the user's account
        portfolio = await user.get_portfolio()
        if symbol not in portfolio or portfolio[symbol] < quantity:
            raise Exception("Insufficient stock quantity to complete sale.")
        portfolio = await user.add_to_portfolio(symbol, -quantity)
        curr_quantity = portfolio[symbol]

        user_balance = await user.update_balance(total_revenue)
        print(f"User {user.username} sold {quantity} shares of ${symbol} at {sell_price} each for a total of {total_revenue}.")
        return {
            "total_stock": curr_quantity,
            "balance": user_balance
        }