from fastapi.responses import HTMLResponse, RedirectResponse
from backend import services


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
        return await services.auth.register(data["username"], data["password"], data["email"])
    
    @app.post("/api/auth/logout")
    async def logout_page(
        data: dict
    ):
        return await services.auth.logout(data["token"])

    @app.post("/test/add_cash")
    async def test_add_cash(
        data: dict
    ):
        session = services.auth.get_session(data["token"])
        if session:
            amount = data["amount"] or 100
            new_balance = session.update_balance(amount)
            return {"status": "success", "message": "Cash added successfully", "new_balance": new_balance}
        else:
            return {"status": "failure", "message": "Invalid session token"}
    
    @app.post("/api/stocks/buy")
    async def buy_stock(
        data: dict
    ):
        session = services.auth.get_session(data["token"])
        if session:
            data = await session.buy_stock(data["symbol"], data["quantity"])
            return {"status": "success", "message": "Stock purchased successfully", "data": data}
        else:
            return {"status": "failure", "message": "Invalid session token"}
        
    @app.post("/api/stocks/sell")
    async def sell_stock(
        data: dict
    ):
        session = services.auth.get_session(data["token"])
        if session:
            data = await session.sell_stock(data["symbol"], data["quantity"])
            return {"status": "success", "message": "Stock sold successfully", "data": data}
        else:
            return {"status": "failure", "message": "Invalid session token"}
        
    @app.get("/api/sandbox")
    async def get_sandbox_stocks(symbol: str, token: str):
        session = services.auth.get_session(token)
        if not session:
            return {"status": "failure", "message": "Invalid session token"}
        
        sandbox = services.stock.get_sandbox(session)
        stocks = sandbox.get_stock_data(symbol)
        print(stocks, symbol, token)
        if stocks:
            return {"status": "success", "data": dict(stocks)}
        else:
            return {"status": "failure", "message": "Stock not found in sandbox"}
        
    @app.get("/api/sandbox/refresh")  
    async def refresh_sandbox(symbol: str, token: str):
        session = services.auth.get_session(token)
        if not session:
            return {"status": "failure", "message": "Invalid session token"}
        
        sandbox = services.stock.get_sandbox(session)
        sandbox.step()

        stock_data = sandbox.get_stock_data(symbol)
        if stock_data:
            return {"status": "success", "data": stock_data}
        else:
            return {"status": "failure", "message": "Stock not found in sandbox"}