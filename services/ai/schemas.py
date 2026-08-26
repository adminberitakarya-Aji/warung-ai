from __future__ import annotations

import time
import random
import string
from datetime import datetime

from pydantic import BaseModel, Field
from typing import Any, Literal, Optional


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

def _gen_id(prefix: str = "job") -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
    return f"{prefix}_{suffix}"


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class GenerateImageRequest(BaseModel):
    generation_id: str
    prompt: str
    model: str = "warung-vision-v1"
    negative_prompt: str = ""
    width: int = 1920
    height: int = 1080
    steps: int = 30
    cfg_scale: float = 7.5
    seed: Optional[int] = None
    style_preset: Optional[str] = None
    parameters: dict[str, Any] = Field(default_factory=dict)


class GenerateVideoRequest(BaseModel):
    generation_id: str
    prompt: str
    model: str = "warung-cinema-v1"
    reference_image_url: Optional[str] = None
    duration_seconds: int = 5
    fps: int = 24
    width: int = 1920
    height: int = 1080
    parameters: dict[str, Any] = Field(default_factory=dict)


class RefinementRequest(BaseModel):
    generation_id: str
    source_asset_url: str
    instruction: str
    tags: list[str] = Field(default_factory=list)
    model: str = "warung-vision-v2"
    parameters: dict[str, Any] = Field(default_factory=dict)


class RemoveBackgroundRequest(BaseModel):
    source_asset_url: str


class ExtractFrameRequest(BaseModel):
    video_url: str
    timestamp_seconds: float = 0.0
    output_format: Literal["jpeg", "png", "webp"] = "png"


class UpscaleRequest(BaseModel):
    source_asset_url: str
    scale_factor: float = 2.0


class ColorGradeRequest(BaseModel):
    source_asset_url: str
    lut_name: Optional[str] = None
    temperature: float = 0.0
    saturation: float = 1.0
    contrast: float = 1.0


class GenerationResult(BaseModel):
    generation_id: str
    status: Literal["completed", "failed"]
    asset_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[float] = None
    error: Optional[str] = None
    processing_time_ms: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ToolResult(BaseModel):
    task_id: str
    status: Literal["completed", "failed"]
    output_url: Optional[str] = None
    error: Optional[str] = None
    processing_time_ms: int = 0
