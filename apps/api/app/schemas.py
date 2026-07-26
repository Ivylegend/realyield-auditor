from datetime import datetime
from enum import StrEnum
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl, field_validator

class TargetType(StrEnum): url="url"; contract="contract"; manual="manual"; wallet="wallet"
class AuditCreate(BaseModel):
    type: TargetType
    target: str = Field(min_length=1,max_length=500)
    chain_id: int|None=None
    tier: str="demo"
    @field_validator("target")
    @classmethod
    def reject_control_chars(cls,value:str)->str:
        if any(ord(char)<32 for char in value): raise ValueError("control characters are not allowed")
        return value.strip()
class NonceResponse(BaseModel): nonce:str; message:str; expires_at:datetime
class WalletVerify(BaseModel): address:str=Field(pattern=r"^0x[a-fA-F0-9]{40}$"); message:str; signature:str
class TokenPair(BaseModel): access_token:str; refresh_token:str; token_type:str="bearer"
class OrderCreate(BaseModel): tier:str=Field(pattern=r"^(quick|full|portfolio)$"); coupon:str|None=None
class ReviewCreate(BaseModel): audit_id:UUID; rating:int=Field(ge=1,le=5); comment:str|None=Field(default=None,max_length=2000)
class SourceRecord(BaseModel):
    source_name:str; url:HttpUrl|None; retrieved_at:datetime; data_type:str; confidence:float=Field(ge=0,le=1); value:dict|list|str|float|None=None; error:str|None=None; freshness:str
class YieldBreakdown(BaseModel): name:str; apy:float; payer:str; classification:str; durable:bool; verified:bool
class RiskOutput(BaseModel): category:str; score:int=Field(ge=0,le=100); severity:str; evidence_count:int; confidence:float=Field(ge=0,le=1); explanation:str; freshness:str; weight:float
class AgentSynthesis(BaseModel):
    summary:str; yield_components:list[YieldBreakdown]; risks:list[RiskOutput]; unknowns:list[str]; limitations:list[str]
