from fastapi import FastAPI

import yfinance as yf


app  = FastAPI()
@app.get("/stock")
async def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5d")
    
    stock_history = hist.reset_index()

    return {
        "ticker": ticker,
        "buy_price": hist['Close'].iloc[-1],
        "sell_price": hist['Close'].iloc[-1] * 0.95,
        "name": stock.info['shortName'],
        "dates": stock_history['Date'].dt.strftime('%Y-%m-%d').tolist(),
        "prices": stock_history['Close'].tolist()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)