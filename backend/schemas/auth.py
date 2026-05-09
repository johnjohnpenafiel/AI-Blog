import uuid

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr


class LogoutResponse(BaseModel):
    status: str
