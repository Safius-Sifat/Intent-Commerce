import redis.asyncio as redis

from src.config import settings


class RedisClient:
    _client: redis.Redis | None = None

    async def connect(self) -> None:
        self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self) -> None:
        if self._client:
            await self._client.close()

    @property
    def client(self) -> redis.Redis:
        if self._client is None:
            raise RuntimeError("Redis client not connected")
        return self._client


redis_client = RedisClient()
