import hashlib, secrets
from datetime import UTC, datetime, timedelta
from jose import jwt
from .config import get_settings

_nonces: dict[str, tuple[str, datetime]] = {}
def issue_nonce(address: str) -> tuple[str, str, datetime]:
    nonce=secrets.token_urlsafe(24); expires=datetime.now(UTC)+timedelta(minutes=5)
    message=f"RealYield Auditor sign-in\nAddress: {address.lower()}\nNonce: {nonce}\nExpires: {expires.isoformat()}\nRead-only authentication. No transaction requested."
    _nonces[address.lower()]=(nonce,expires)
    return nonce,message,expires
def create_tokens(subject: str, session_id: str) -> tuple[str,str]:
    settings=get_settings(); now=datetime.now(UTC)
    access=jwt.encode({"sub":subject,"sid":session_id,"type":"access","iat":now,"exp":now+timedelta(minutes=settings.jwt_access_token_expire_minutes)},settings.jwt_secret,algorithm="HS256")
    refresh=jwt.encode({"sub":subject,"sid":session_id,"type":"refresh","jti":secrets.token_urlsafe(16),"iat":now,"exp":now+timedelta(days=settings.jwt_refresh_token_expire_days)},settings.jwt_refresh_secret,algorithm="HS256")
    return access,refresh
def token_hash(token:str)->str: return hashlib.sha256(token.encode()).hexdigest()
