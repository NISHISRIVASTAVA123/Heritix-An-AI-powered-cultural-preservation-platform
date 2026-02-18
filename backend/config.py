from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Heritix API"
    MONGODB_URL: str
    DB_NAME: str = "heritix_db"
    GROQ_API_KEY: str
    HUGGINGFACEHUB_API_TOKEN: str

    
    class Config:
        env_file = ".env"

settings = Settings()
