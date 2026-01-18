from fastapi.responses import HTMLResponse, RedirectResponse
from backend import services
from backend.models.auth import LoginRequest, RegisterRequest


def setup_routes(app):
    @app.get("/api/stocks")
    async def get_stock_data(symbol: str):
        return await services.stock.get_stock_info(symbol)
    
    @app.post("/api/auth/login")
    async def login_page(
        data: dict
    ):
        print(data)
        res = await services.auth.login(data["username"], data["password"])
        print("Login response:", res)
        return res
    
    @app.post("/api/auth/register")
    async def register_page(
        data: dict
    ):
        return await services.auth.register(data["username"], data["password"])  