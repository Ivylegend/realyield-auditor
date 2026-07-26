from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")
    app_env: str = "development"
    app_url: str = "http://localhost:3000"
    database_url: str = "sqlite+aiosqlite:///./realyield.db"
    redis_url: str = "redis://localhost:6379/0"
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

@lru_cache
def get_settings() -> Settings:
    return Settings()
