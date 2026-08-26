from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Server
    host: str = Field(default="0.0.0.0", alias="AI_SERVICE_HOST")
    port: int = Field(default=8000, alias="AI_SERVICE_PORT")
    debug: bool = Field(default=False, alias="DEBUG")

    # Storage (S3/R2/MinIO)
    storage_endpoint: str = Field(default="http://localhost:9000", alias="STORAGE_ENDPOINT")
    storage_region: str = Field(default="auto", alias="STORAGE_REGION")
    storage_bucket: str = Field(default="warungai-media", alias="STORAGE_BUCKET")
    storage_access_key: str = Field(default="minioadmin", alias="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field(default="minioadmin", alias="STORAGE_SECRET_KEY")
    storage_public_url: str = Field(default="", alias="STORAGE_PUBLIC_URL")

    # AI Providers (pluggable — add real keys in .env.local)
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    replicate_api_key: str = Field(default="", alias="REPLICATE_API_KEY")
    stability_api_key: str = Field(default="", alias="STABILITY_API_KEY")
    fal_api_key: str = Field(default="", alias="FAL_API_KEY")

    # API auth (simple shared secret between apps/api and services/ai)
    internal_api_secret: str = Field(default="warungai-internal-secret", alias="INTERNAL_API_SECRET")

    @property
    def storage_public_base(self) -> str:
        return self.storage_public_url or f"{self.storage_endpoint}/{self.storage_bucket}"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
