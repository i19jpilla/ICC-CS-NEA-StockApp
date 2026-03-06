from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException

from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import webview
import time

from backend import services
from backend.database.connection import db
from backend.routes import setup_routes

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Not needed for same-origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/pages", StaticFiles(directory="frontend/pages", html=True), name="pages")
app.mount("/shared", StaticFiles(directory="frontend/shared"), name="shared")
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")


@app.on_event("startup")
async def startup_event():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await db.disconnect()

setup_routes(app)
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return RedirectResponse(url="/login")

@app.get("/login")
async def get_login_page():
    return FileResponse("frontend/pages/login/index.html")

@app.get("/dashboard")
async def get_dashboard_page():
    return FileResponse("frontend/pages/dashboard/index.html")

@app.get("/sandbox")
async def get_sandbox_page():
    return FileResponse("frontend/pages/sandbox/index.html")

@app.get("/portfolio")
async def get_portfolio_page():
    return FileResponse("frontend/pages/portfolio/index.html")

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