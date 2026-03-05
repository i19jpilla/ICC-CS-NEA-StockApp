from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Path

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


@app.on_event("startup")
async def startup_event():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await db.disconnect()

setup_routes(app)

@app.get("/api/frontend-manifest")
def frontend_manifest():
    base = Path("frontend")
    # return files in load order — context, hooks, components, pages, app last
    order = ["context", "hooks", "components", "pages"]
    files = []
    for folder in order:
        d = base / folder
        if d.exists():
            for f in sorted(d.iterdir()):
                if f.suffix in (".jsx", ".js"):
                    files.append("/" + f.relative_to(base).as_posix())
    files.append("/App.jsx")
    return files

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

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