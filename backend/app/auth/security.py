"""
Minimal JWT auth for /auth/signup and /auth/login (API_SPEC.md). Enough
to gate the API during development — swap SECRET_KEY for a real secret
(env var, never hardcoded) and add refresh-token/expiry handling before
this goes anywhere near production.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
