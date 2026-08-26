"""
Mock AI provider.

Real implementation will delegate to:
  - Image: Stability AI / DALL·E / Fal.ai Flux
  - Video: Kling AI / Wan 2.1 / Runway ML / Luma Dream Machine
  - Refinement: ControlNet / IP-Adapter / Real-ESRGAN
  - Tools: REMBG / FFmpeg / Real-ESRGAN

For Phase 6 we ship a functional mock that:
  1. Sleeps to simulate latency
  2. Creates a minimal valid PNG (1×1 solid colour) via Pillow
  3. Uploads it to MinIO/S3
  4. Returns the real public URL
"""

from __future__ import annotations

import io
import time
import random
from typing import Optional

from PIL import Image

from config import settings
from storage import upload_bytes_to_storage, ensure_bucket
from schemas import (
    GenerateImageRequest,
    GenerateVideoRequest,
    RefinementRequest,
    GenerationResult,
    _gen_id,
)


def _placeholder_png(width: int = 1920, height: int = 1080) -> bytes:
    """Return a tiny solid-colour PNG as a bytes buffer."""
    colour = (
        random.randint(30, 80),
        random.randint(30, 80),
        random.randint(30, 80),
    )
    img = Image.new("RGB", (width, height), color=colour)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


async def generate_image(req: GenerateImageRequest) -> GenerationResult:
    t0 = time.time()

    # Simulate processing time (0.5 – 1.5 s in mock mode)
    await _simulate_latency(0.5, 1.5)

    try:
        ensure_bucket()
        png_bytes = _placeholder_png(req.width, req.height)
        key = f"generations/{req.generation_id}/result.png"
        url = upload_bytes_to_storage(key, png_bytes, "image/png")

        return GenerationResult(
            generation_id=req.generation_id,
            status="completed",
            asset_url=url,
            thumbnail_url=url,
            width=req.width,
            height=req.height,
            processing_time_ms=int((time.time() - t0) * 1000),
        )
    except Exception as exc:
        return GenerationResult(
            generation_id=req.generation_id,
            status="failed",
            error=str(exc),
            processing_time_ms=int((time.time() - t0) * 1000),
        )


async def generate_video(req: GenerateVideoRequest) -> GenerationResult:
    """
    Stub: returns a still PNG since we can't encode MP4 in mock mode
    without a heavy FFmpeg dependency. Phase 6.5 (real models) will
    produce proper video files.
    """
    t0 = time.time()
    await _simulate_latency(1.0, 2.5)

    try:
        ensure_bucket()
        png_bytes = _placeholder_png(req.width, req.height)
        key = f"generations/{req.generation_id}/result_preview.png"
        url = upload_bytes_to_storage(key, png_bytes, "image/png")

        return GenerationResult(
            generation_id=req.generation_id,
            status="completed",
            asset_url=url,
            thumbnail_url=url,
            width=req.width,
            height=req.height,
            duration_seconds=float(req.duration_seconds),
            processing_time_ms=int((time.time() - t0) * 1000),
        )
    except Exception as exc:
        return GenerationResult(
            generation_id=req.generation_id,
            status="failed",
            error=str(exc),
            processing_time_ms=int((time.time() - t0) * 1000),
        )


async def run_refinement(req: RefinementRequest) -> GenerationResult:
    t0 = time.time()
    await _simulate_latency(0.5, 1.0)

    try:
        ensure_bucket()
        png_bytes = _placeholder_png()
        key = f"generations/{req.generation_id}/refined.png"
        url = upload_bytes_to_storage(key, png_bytes, "image/png")

        return GenerationResult(
            generation_id=req.generation_id,
            status="completed",
            asset_url=url,
            thumbnail_url=url,
            width=1920,
            height=1080,
            processing_time_ms=int((time.time() - t0) * 1000),
        )
    except Exception as exc:
        return GenerationResult(
            generation_id=req.generation_id,
            status="failed",
            error=str(exc),
            processing_time_ms=int((time.time() - t0) * 1000),
        )


async def _simulate_latency(min_s: float, max_s: float) -> None:
    import asyncio
    await asyncio.sleep(random.uniform(min_s, max_s))
