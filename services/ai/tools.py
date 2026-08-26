"""
Media processing tools: remove background, extract frame, upscale, colour grade.
All backed by Pillow + placeholder logic for Phase 6 mock mode.
Real implementations use REMBG / FFmpeg / Real-ESRGAN.
"""

from __future__ import annotations

import io
import time
import random
import httpx
from PIL import Image, ImageEnhance, ImageFilter

from storage import upload_bytes_to_storage, ensure_bucket
from schemas import (
    RemoveBackgroundRequest,
    ExtractFrameRequest,
    UpscaleRequest,
    ColorGradeRequest,
    ToolResult,
    _gen_id,
)


async def _fetch_image_bytes(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content


def _load_image(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGBA")


def _save_png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


async def remove_background(req: RemoveBackgroundRequest) -> ToolResult:
    """
    Stub: loads the source image and fills with transparency.
    Real impl: replace with rembg.remove(data).
    """
    t0 = time.time()
    task_id = _gen_id("rembg")
    try:
        ensure_bucket()
        raw = await _fetch_image_bytes(req.source_asset_url)
        img = _load_image(raw)
        # Stub: paint background transparent (real = rembg)
        r, g, b, a = img.split()
        stub = Image.merge("RGBA", (r, g, b, Image.new("L", img.size, 0)))
        out_bytes = _save_png(stub)
        key = f"tools/rembg/{task_id}.png"
        url = upload_bytes_to_storage(key, out_bytes, "image/png")
        return ToolResult(task_id=task_id, status="completed", output_url=url,
                          processing_time_ms=int((time.time() - t0) * 1000))
    except Exception as exc:
        return ToolResult(task_id=task_id, status="failed", error=str(exc))


async def extract_frame(req: ExtractFrameRequest) -> ToolResult:
    """
    Stub: returns a solid placeholder frame.
    Real impl: ffmpeg -ss {timestamp} -i {video_url} -frames:v 1 out.png
    """
    t0 = time.time()
    task_id = _gen_id("frame")
    try:
        ensure_bucket()
        colour = (random.randint(20, 60),) * 3
        frame = Image.new("RGB", (1920, 1080), color=colour)
        out_bytes = _save_png(frame)
        key = f"tools/frames/{task_id}.png"
        url = upload_bytes_to_storage(key, out_bytes, "image/png")
        return ToolResult(task_id=task_id, status="completed", output_url=url,
                          processing_time_ms=int((time.time() - t0) * 1000))
    except Exception as exc:
        return ToolResult(task_id=task_id, status="failed", error=str(exc))


async def upscale(req: UpscaleRequest) -> ToolResult:
    """
    Stub: uses Pillow LANCZOS resize.
    Real impl: Real-ESRGAN 4× upscaler.
    """
    t0 = time.time()
    task_id = _gen_id("upscale")
    try:
        ensure_bucket()
        raw = await _fetch_image_bytes(req.source_asset_url)
        img = Image.open(io.BytesIO(raw))
        new_w = int(img.width * req.scale_factor)
        new_h = int(img.height * req.scale_factor)
        upscaled = img.resize((new_w, new_h), Image.LANCZOS)
        buf = io.BytesIO()
        upscaled.save(buf, format="PNG")
        key = f"tools/upscaled/{task_id}.png"
        url = upload_bytes_to_storage(key, buf.getvalue(), "image/png")
        return ToolResult(task_id=task_id, status="completed", output_url=url,
                          processing_time_ms=int((time.time() - t0) * 1000))
    except Exception as exc:
        return ToolResult(task_id=task_id, status="failed", error=str(exc))


async def color_grade(req: ColorGradeRequest) -> ToolResult:
    """
    Stub: applies brightness / saturation / contrast via Pillow.
    Real impl: 3D LUT application via Pillow + custom CUBE reader.
    """
    t0 = time.time()
    task_id = _gen_id("grade")
    try:
        ensure_bucket()
        raw = await _fetch_image_bytes(req.source_asset_url)
        img = Image.open(io.BytesIO(raw)).convert("RGB")

        if req.saturation != 1.0:
            img = ImageEnhance.Color(img).enhance(req.saturation)
        if req.contrast != 1.0:
            img = ImageEnhance.Contrast(img).enhance(req.contrast)
        if req.temperature != 0.0:
            r, g, b = img.split()
            r = ImageEnhance.Brightness(r).enhance(1.0 + req.temperature * 0.05)
            b = ImageEnhance.Brightness(b).enhance(1.0 - req.temperature * 0.05)
            img = Image.merge("RGB", (r, g, b))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        key = f"tools/graded/{task_id}.png"
        url = upload_bytes_to_storage(key, buf.getvalue(), "image/png")
        return ToolResult(task_id=task_id, status="completed", output_url=url,
                          processing_time_ms=int((time.time() - t0) * 1000))
    except Exception as exc:
        return ToolResult(task_id=task_id, status="failed", error=str(exc))
