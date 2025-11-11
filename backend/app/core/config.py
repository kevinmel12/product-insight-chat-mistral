from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    
    Required:
        MISTRAL_API_KEY: Your Mistral AI API key
        MISTRAL_MODEL_ID: Model identifier (default: mistral-medium-3.1)
    """
    
    mistral_api_key: str
    mistral_model_id: str = "mistral-medium-3.1"
    mistral_base_url: str = "https://api.mistral.ai/v1"
    
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()

