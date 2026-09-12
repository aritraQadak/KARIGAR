from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.capture import router as capture_router
from app.routes.voice import router as voice_router
from app.routes.authenticity import router as authenticity_router
from app.services.voice_service import load_voice_config
from app.routes.verification import router

load_voice_config()
app = FastAPI(title="KARIGAR AI Verification", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://{host}:{port}"
        for host in ("localhost", "127.0.0.1")
        for port in (3000, 5173, 4173)
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(router)
app.include_router(capture_router)
app.include_router(voice_router)
app.include_router(authenticity_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
