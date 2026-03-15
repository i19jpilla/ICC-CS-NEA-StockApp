import fastapi
from fastapi.responses import HTMLResponse, RedirectResponse
from backend import services


def setup_routes(app: fastapi.FastAPI):
    @app.get("/api/stocks")
    async def get_stock_data(symbol: str):
        stock_data = await services.stock.get_stock_info(symbol)
        return stock_data
    
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
            return {"status": "success", "message": "Cash added successfully", "data": {
                "balance": new_balance
            }}
        else:
            return {"status": "failure", "message": "Invalid session token"}
    
    @app.post("/api/stocks/buy")
    async def buy_stock(
        data: dict
    ):
        session = services.auth.get_session(data["token"])
        if session:
            success, res = await session.buy_stock(data["symbol"], data["quantity"])
            if success:
                return {"status": "success", "message": "Stock purchased successfully", "data": res}
            else:
                return {"status": "error", "message": res}
        else:
            return {"status": "failure", "message": "Invalid session token"}
        
    @app.post("/api/stocks/sell")
    async def sell_stock(
        data: dict
    ):
        session = services.auth.get_session(data["token"])
        if session:
            success, res = await session.sell_stock(data["symbol"], data["quantity"])
            if success:
                return {"status": "success", "message": "Stock sold successfully", "data": res}
            else:
                return {"status": "error", "message": res}
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
        
    @app.get("/api/sandbox/all")
    async def get_all_sandbox_stocks(token: str):
        session = services.auth.get_session(token)
        if not session:
            return {"status": "failure", "message": "Invalid session token"}
        
        sandbox = services.stock.get_sandbox(session)
        stocks = sandbox.get_market_stocks()
        return {"status": "success", "data": stocks}
        
    @app.websocket("/ws/sandbox")
    async def websocket_endpoint(websocket: fastapi.WebSocket):
        token = websocket.query_params.get("token")
        session = services.auth.get_session(token)
        if not session:
            await websocket.close(code=1008)
            return
        
        sandbox = services.stock.get_sandbox(session)
        channel = sandbox.get_websocket_channel()
        await services.websocket.connect(websocket, channel)

        try:
            while True:
                data = await websocket.receive_json()
                print(f"Received request from client: {data}")
                # Handles incoming messages from the client if needed, e.g. for subscribing to specific stock updates
                action = data.get("type")
                symbol = data.get("symbol")
                
                match action:
                    case "track":
                        if not symbol:
                            await services.websocket.send_json({"error": "Symbol is required for tracking"}, websocket, channel)
                            continue

                        stock_data = sandbox.get_stock_data(symbol)
                        if stock_data:
                            sandbox.track_stock(symbol)
                            await services.websocket.send_json({
                                "type": "ticker_update",
                                "data": stock_data
                            }, websocket, channel)
                        else:
                            await services.websocket.send_json({"error": "Stock not found"}, websocket, channel)
                    
                    case "untrack":
                        if not symbol:
                            await services.websocket.send_json({"error": "Symbol is required for untracking"}, websocket, channel)
                            continue

                        sandbox.untrack_stock(symbol)
                        await services.websocket.send_json({
                            "type": "ticker_untrack",
                            "data": {"symbol": symbol}
                        }, websocket, channel)

                    case "all":
                        sandbox.track_all_stocks()
                        # Client cannot handle multiple ticker data objects yet

        except fastapi.WebSocketDisconnect:
            print("WebSocket disconnected")

        finally:
            if websocket and websocket.client_state == fastapi.websockets.WebSocketState.CONNECTED:
                await services.websocket.disconnect(websocket, channel)


        
        