from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")
    app_env: str = "development"
    app_url: str = "http://localhost:3000"
    database_url: str = "sqlite+aiosqlite:///./realyield.db"
    redis_url: str = "redis://localhost:6379/0"
    qstash_token: str = ""
    qstash_current_signing_key: str = ""
    qstash_next_signing_key: str = ""
    jwt_secret: str = "development-only-change-me-32-characters"
    jwt_refresh_secret: str = "development-refresh-change-me-32-chars"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 30
    ai_primary_provider: str = "openai"
    ai_fallback_provider: str = "anthropic"
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    upload_max_bytes: int = 20 * 1024 * 1024
    upload_directory: str = "/tmp/realyield-uploads"

    def origins(self) -> list[str]:
        return [value.strip() for value in self.allowed_origins.split(",") if value.strip()]

    def async_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)

        parts = urlsplit(url)
        if parts.scheme != "postgresql+asyncpg":
            return url

        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        ssl_mode = query.pop("sslmode", None)
        query.pop("channel_binding", None)
        if ssl_mode:
            query["ssl"] = ssl_mode
        return urlunsplit(parts._replace(query=urlencode(query)))

@lru_cache
def get_settings() -> Settings:
    return Settings()
