import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, pipeline, posts, public, settings
from scheduler import shutdown_scheduler, start_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


# `lifespan` is FastAPI's replacement for the deprecated
# `@app.on_event("startup"|"shutdown")` decorators. Code before `yield`
# runs once on startup, code after `yield` runs once on shutdown.
@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    try:
        yield
    finally:
        shutdown_scheduler()


app = FastAPI(title="The Garage AI Backend", version="0.1.0", lifespan=lifespan)

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pipeline.router)
app.include_router(posts.router)
app.include_router(public.router)
app.include_router(settings.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
