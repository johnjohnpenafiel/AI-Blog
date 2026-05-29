"""Shared FastAPI dependencies.

`require_api_key` is the backend's auth gate. The backend has no per-user
auth of its own — it trusts the single Next.js front-end, which authenticates
the admin via NextAuth and then forwards server-to-server requests carrying a
shared secret in the `Authorization: Bearer <secret>` header. Every protected
router depends on this gate; the public blog routes (`/public/*`), the login
endpoint (`/auth/*`), and `/health` deliberately do not.

FastAPI runs a router-level dependency (declared via
`APIRouter(..., dependencies=[Depends(require_api_key)])`) before every route
handler in that router. Raising `HTTPException` here short-circuits the
request, so an unauthenticated call never reaches the handler or the DB.
"""
import hmac
import os

from fastapi import Header, HTTPException, status


def require_api_key(authorization: str | None = Header(default=None)) -> None:
    """Reject any request lacking the correct `Authorization: Bearer <secret>`.

    `Header(default=None)` tells FastAPI to inject the request's `Authorization`
    header (or `None` if absent) as this parameter.
    """
    expected = os.environ.get("BACKEND_API_SECRET")
    if not expected:
        # Fail closed: a missing secret is a server misconfiguration, not a
        # reason to serve protected routes unauthenticated.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="server auth is not configured",
        )

    prefix = "Bearer "
    provided = (
        authorization[len(prefix):]
        if authorization and authorization.startswith(prefix)
        else ""
    )
    # Constant-time comparison so a timing side-channel can't reveal the secret.
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="missing or invalid API key",
        )
