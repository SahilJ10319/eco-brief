from collections import OrderedDict
from threading import Lock
from typing import Any


class LRUCache:
    def __init__(self, capacity: int = 5):
        self._cache: OrderedDict[str, Any] = OrderedDict()
        self._capacity = capacity
        self._lock = Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            if key not in self._cache:
                return None
            self._cache.move_to_end(key)
            return self._cache[key]

    def put(self, key: str, value: Any) -> None:
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = value
            if len(self._cache) > self._capacity:
                self._cache.popitem(last=False)

    def evict(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def size(self) -> int:
        with self._lock:
            return len(self._cache)
