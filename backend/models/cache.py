from time import time

class CacheItem:
    def __init__(self, data, expiration=300):
        self.data = data
        self.expiration = time() + expiration

class Cache:
    def __init__(self, auto_expire=True):
        self._cache: dict[str, CacheItem] = {}
        self.auto_expire = auto_expire

    def get(self, key: str):
        item = self._cache.get(key)
        if item and (not self.auto_expire or item.expiration > time()):
            return item.data
        return None
        

    
    def set(self, key: str, data, expiration=300):
        self._cache[key] = CacheItem(data, expiration)

    def has(self, key: str) -> bool:
        print("Checking cache for key:", key)
        item = self._cache.get(key)
        return item is not None and item.expiration > time()