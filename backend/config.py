from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "Heritix API"
    MONGODB_URL: str
    DB_NAME: str = "heritix_db"
    GROQ_API_KEY: str
    HUGGINGFACEHUB_API_TOKEN: str
    CLERK_SECRET_KEY: SecretStr

    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
