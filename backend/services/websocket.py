from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.channels = {}  # channel_name -> list of WebSocket connections
    
    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.channels:
            self.channels[channel] = []
        self.channels[channel].append(websocket)
    
    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.channels:
            self.channels[channel].remove(websocket)
            if not self.channels[channel]:  # If no more connections in the channel
                del self.channels[channel]
    
    async def send_text(self, message: str, websocket: WebSocket, channel: str):
        await websocket.send_text(f"[{channel}] {message}")

    async def send_json(self, message: dict, websocket: WebSocket, channel: str):
        await websocket.send_json({"channel": channel, "data": message})
    
    async def broadcast(self, channel: str, data: dict):
        if channel in self.channels:
            for connection in self.channels[channel]:
                await self.send_json(data, connection, channel)