from fastapi import FastAPI, HTTPException

from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import webview
import time

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Not needed for same-origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()
        

@app.get("/stock")
async def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5d")
    
    stock_history = hist.reset_index()
    print("Stock history retrieved:", ticker)
    return {
        "ticker": ticker,
        "buy_price": hist['Close'].iloc[-1],
        "sell_price": hist['Close'].iloc[-1] * 0.95,
        "name": stock.info['shortName'],
        "dates": stock_history['Date'].dt.strftime('%Y-%m-%d').tolist(),
        "prices": stock_history['Close'].tolist()
    }

def start_server():
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    import threading
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    webview.create_window(
        title="Stock Data API",
        url="http://127.0.0.1:8000",
        width=800,
        height=600,
        resizable=True
    )

    time.sleep(1)  # Give the server a moment to start
    print("Launching webview...")
    webview.start(debug=True)