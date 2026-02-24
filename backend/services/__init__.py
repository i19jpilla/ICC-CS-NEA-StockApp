from .stocks import StockService
#from .user import UserService
from .auth import AuthService
from .websocket import WebSocketManager

stock = StockService()
#user = UserService()
auth = AuthService()
websocket = WebSocketManager()