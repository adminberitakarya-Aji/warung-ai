"""
WarungAI AI & Media Processing Service (FastAPI)
Spec reference: §6, §7, §10, §11
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from fastapi.responses import JSONResponse

from config import settings
from schemas import (
    GenerateImageRequest,
    GenerateVideoRequest,
    RefinementRequest,
    RemoveBackgroundRequest,
    ExtractFrameRequest,
    UpscaleRequest,
    ColorGradeRequest,
    GenerationResult,
    ToolResult,
)
from provider import generate_image, generate_video, run_refinement
from tools import remove_background, extract_frame, upscale, color_grade


# ---------------------------------------------------------------------------
# Startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    from storage import ensure_bucket
    try:
        ensure_bucket()
        print("[startup] Storage bucket verified.")
    except Exception as exc:
        print(f"[startup] Storage not reachable (ok in dev): {exc}")
    yield
    print("[shutdown] WarungAI AI service stopping.")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="WarungAI AI Service",
    description=(
        "Internal AI & media-processing microservice for WarungAI. "
        "Handles image/video generation, refinement, and media tools."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tightened by INTERNAL_API_SECRET in prod
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Internal API key guard
# ---------------------------------------------------------------------------

_api_key_header = APIKeyHeader(name="X-Internal-Secret", auto_error=False)


async def verify_internal_secret(key: str | None = Security(_api_key_header)) -> None:
    if key != settings.internal_api_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akses internal tidak sah.",
        )


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "warungai-ai"}


# ---------------------------------------------------------------------------
# Generation endpoints
# ---------------------------------------------------------------------------

@app.post(
    "/generate/image",
    response_model=GenerationResult,
    tags=["Generation"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_generate_image(req: GenerateImageRequest) -> GenerationResult:
    """Generate a cinematic still image for a scene."""
    return await generate_image(req)


@app.post(
    "/generate/video",
    response_model=GenerationResult,
    tags=["Generation"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_generate_video(req: GenerateVideoRequest) -> GenerationResult:
    """Generate a short video clip from a prompt (§7 siklus generasi)."""
    return await generate_video(req)


@app.post(
    "/generate/refinement",
    response_model=GenerationResult,
    tags=["Refinement"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_run_refinement(req: RefinementRequest) -> GenerationResult:
    """Apply refinement instructions (upscale, outpaint, color grade) to an existing asset."""
    return await run_refinement(req)


# ---------------------------------------------------------------------------
# Media tool endpoints
# ---------------------------------------------------------------------------

@app.post(
    "/tools/remove-background",
    response_model=ToolResult,
    tags=["Tools"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_remove_background(req: RemoveBackgroundRequest) -> ToolResult:
    return await remove_background(req)


@app.post(
    "/tools/extract-frame",
    response_model=ToolResult,
    tags=["Tools"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_extract_frame(req: ExtractFrameRequest) -> ToolResult:
    return await extract_frame(req)


@app.post(
    "/tools/upscale",
    response_model=ToolResult,
    tags=["Tools"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_upscale(req: UpscaleRequest) -> ToolResult:
    return await upscale(req)


@app.post(
    "/tools/color-grade",
    response_model=ToolResult,
    tags=["Tools"],
    dependencies=[Depends(verify_internal_secret)],
)
async def api_color_grade(req: ColorGradeRequest) -> ToolResult:
    return await color_grade(req)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
