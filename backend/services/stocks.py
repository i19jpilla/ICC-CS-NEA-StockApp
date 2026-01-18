import yfinance as yf

class StockService:
    def __init__(self):
        self.stocks = {}

    async def get_stock_info(self, symbol):
        stock = yf.Ticker(symbol)
        hist = stock.history(period="5d")
        
        stock_history = hist.reset_index()
        print("Stock history retrieved:", symbol)
        return {
            "symbol": symbol,
            "buy_price": hist['Close'].iloc[-1],
            "sell_price": hist['Close'].iloc[-1] * 0.95,
            "name": stock.info['shortName'],
            "dates": stock_history['Date'].dt.strftime('%Y-%m-%d').tolist(),
            "prices": stock_history['Close'].tolist()
        }