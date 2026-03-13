import aiosqlite

class Database:
    def __init__(self, db_path: str = "app.db"):
        self.db_path = db_path
        self.connection = None

    async def connect(self):
        self.connection = await aiosqlite.connect(self.db_path)
        await self.connection.execute("PRAGMA foreign_keys = ON;")
        await self.connection.commit()
        
        await self._create_tables()

    async def disconnect(self):
        if self.connection:
            await self.connection.close()

    async def _create_tables(self):
        """Create necessary tables in the database."""

        """Create users table"""
        await self.connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
        """)

        """Create profile table"""
        await self.connection.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            balance REAL DEFAULT 0.0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        """Create portfolio table"""
        await self.connection.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        """Create tutorial progress"""
        await self.connection.execute("""
        CREATE TABLE IF NOT EXISTS tutorials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tutorial_id TEXT NOT NULL,
            stage INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)

        await self.connection.commit()
        
db = Database()