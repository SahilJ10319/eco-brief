from app.core.cache import LRUCache
from typing import Callable, Any


class ModelMultiplexer:
    def __init__(self, capacity: int = 5):
        self._cache = LRUCache(capacity=capacity)
        self._loaders: dict[str, Callable[[], Any]] = {}

    def register(self, model_id: str, loader: Callable[[], Any]) -> None:
        self._loaders[model_id] = loader

    def get_or_load(self, model_id: str) -> Any:
        cached = self._cache.get(model_id)
        if cached is not None:
            return cached

        loader = self._loaders.get(model_id)
        if loader is None:
            raise ValueError(f"no loader registered for model: {model_id}")

        model = loader()
        self._cache.put(model_id, model)
        return model

    def evict(self, model_id: str) -> None:
        self._cache.evict(model_id)

    def loaded_count(self) -> int:
        return self._cache.size()
