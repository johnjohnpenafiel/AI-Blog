from fastapi import FastAPI

from routers import auth, pipeline

app = FastAPI(title="DeLorean Backend", version="0.1.0")

app.include_router(auth.router)
app.include_router(pipeline.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
