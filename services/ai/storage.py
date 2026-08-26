import boto3
from botocore.config import Config
from config import settings

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.storage_endpoint,
            region_name=settings.storage_region,
            aws_access_key_id=settings.storage_access_key,
            aws_secret_access_key=settings.storage_secret_key,
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


def upload_bytes_to_storage(key: str, data: bytes, content_type: str) -> str:
    """Upload raw bytes to S3/MinIO and return a public URL."""
    client = get_s3_client()
    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return f"{settings.storage_public_base}/{key}"


def ensure_bucket() -> None:
    """Create the storage bucket if it does not exist yet."""
    client = get_s3_client()
    try:
        client.head_bucket(Bucket=settings.storage_bucket)
    except Exception:
        try:
            client.create_bucket(Bucket=settings.storage_bucket)
        except Exception as exc:
            print(f"[storage] Could not create bucket: {exc}")
