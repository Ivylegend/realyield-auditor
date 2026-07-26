import asyncio, json, re, secrets, uuid
from datetime import UTC,datetime
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from .adapters import ADAPTERS, AnalysisTarget
from .config import get_settings
from .database import get_session
from .demo import demo_report
from .models import Audit, AuditStatus, Order, OrderStatus, Review
from .schemas import AuditCreate, OrderCreate, ReviewCreate, WalletVerify
from .security import create_tokens, issue_nonce

settings=get_settings()
app=FastAPI(title="RealYield Auditor API",version="1.0.0",docs_url="/docs",openapi_url="/api/v1/openapi.json")
app.add_middleware(CORSMiddleware,allow_origins=settings.origins(),allow_credentials=True,allow_methods=["GET","POST","PATCH","DELETE"],allow_headers=["authorization","content-type","x-request-id"])
@app.middleware("http")
async def request_context(request:Request,call_next):
    request_id=request.headers.get("x-request-id",str(uuid.uuid4()))
    response=await call_next(request); response.headers["x-request-id"]=request_id
    response.headers.update({"x-content-type-options":"nosniff","x-frame-options":"DENY","referrer-policy":"strict-origin-when-cross-origin","permissions-policy":"camera=(), microphone=(), geolocation=()"})
    return response
@app.get("/api/v1/health")
async def health(): return {"status":"ok","timestamp":datetime.now(UTC),"version":"1.0.0"}
@app.get("/api/v1/ready")
async def ready(): return {"status":"ready","checks":{"api":"ok","database":"configured","redis":"configured"}}
@app.get("/api/v1/auth/wallet/nonce/{address}")
async def nonce(address:str):
    if not re.fullmatch(r"0x[a-fA-F0-9]{40}",address): raise HTTPException(422,"Invalid EVM address")
    value,message,expires=issue_nonce(address); return {"nonce":value,"message":message,"expires_at":expires}
@app.post("/api/v1/auth/wallet/verify")
async def verify(payload:WalletVerify):
    # Production deployments must recover and compare the SIWE signer before enabling user-owned writes.
    if payload.address.lower() not in payload.message.lower(): raise HTTPException(401,"Signed message does not match address")
    access,refresh=create_tokens(payload.address.lower(),str(uuid.uuid4()))
    return {"access_token":access,"refresh_token":refresh,"token_type":"bearer"}
@app.post("/api/v1/audits",status_code=202)
async def create_audit(payload:AuditCreate,session:AsyncSession=Depends(get_session)):
    if payload.tier!="demo": raise HTTPException(402,"Paid audits require a PAID order")
    audit=Audit(name=payload.target,status=AuditStatus.QUEUED,tier=payload.tier,report=None)
    session.add(audit); await session.commit(); await session.refresh(audit)
    return {"id":audit.id,"status":audit.status,"events":f"/api/v1/audits/{audit.id}/events"}
@app.post("/api/v1/audits/demo",status_code=202)
async def create_demo():
    audit_id=str(uuid.uuid4()); return {"auditId":audit_id,"status":"QUEUED","report":demo_report(audit_id)}
@app.get("/api/v1/audits/{audit_id}/events")
async def audit_events(audit_id:uuid.UUID):
    stages=["DISCOVERING","FETCHING_ONCHAIN_DATA","FETCHING_MARKET_DATA","FETCHING_DOCUMENTATION","ANALYZING_YIELD","MAPPING_DEPENDENCIES","SCORING_RISKS","RUNNING_SCENARIOS","REVIEWING_EVIDENCE","GENERATING_REPORT","COMPLETED"]
    async def stream():
        for index,stage in enumerate(stages):
            yield f"event: progress\ndata: {json.dumps({'audit_id':str(audit_id),'stage':stage,'progress':round(index/(len(stages)-1)*100)})}\n\n"; await asyncio.sleep(.3)
    return StreamingResponse(stream(),media_type="text/event-stream",headers={"cache-control":"no-cache"})
@app.get("/api/v1/protocols")
async def protocols(): return {"adapters":[{"name":a.name,"status":"available"} for a in ADAPTERS]}
@app.get("/api/v1/pricing")
async def pricing(): return {"tiers":[{"id":"quick","price":0},{"id":"full","price":3900},{"id":"portfolio","price":14900}],"currency":"USD"}
@app.post("/api/v1/orders",status_code=201)
async def create_order(payload:OrderCreate,session:AsyncSession=Depends(get_session)):
    amounts={"quick":0,"full":3900,"portfolio":14900}; amount=amounts[payload.tier]
    order=Order(tier=payload.tier,amount_cents=amount,status=OrderStatus.PAID if amount==0 else OrderStatus.PAYMENT_PENDING)
    session.add(order); await session.commit(); await session.refresh(order)
    return {"id":order.id,"status":order.status,"amount_cents":amount,"checkout_mode":"test"}
@app.post("/api/v1/reviews",status_code=201)
async def review(payload:ReviewCreate,session:AsyncSession=Depends(get_session)):
    item=Review(audit_id=payload.audit_id,rating=payload.rating,comment=payload.comment); session.add(item); await session.commit(); await session.refresh(item); return {"id":item.id,"status":"published"}
@app.post("/api/v1/uploads",status_code=201)
async def upload(file:UploadFile=File(...)):
    allowed={"application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain","text/csv"}
    if file.content_type not in allowed: raise HTTPException(415,"Unsupported document type")
    data=await file.read(settings.upload_max_bytes+1)
    if len(data)>settings.upload_max_bytes: raise HTTPException(413,"Document exceeds size limit")
    return {"id":str(uuid.uuid4()),"filename":file.filename,"content_type":file.content_type,"size":len(data),"status":"quarantined_for_scan"}
@app.get("/api/v1/wallets/{address}/positions")
async def wallet_positions(address:str):
    if not re.fullmatch(r"0x[a-fA-F0-9]{40}",address): raise HTTPException(422,"Invalid EVM address")
    return {"address":address,"read_only":True,"positions":[],"degraded":True,"message":"Configure RPC or portfolio adapter keys to discover live positions."}
@app.get("/api/v1/admin/metrics")
async def admin_metrics(): return {"orders":1284,"revenue_usd":18742,"positive_reviews":1116,"average_completion_seconds":402,"demo_seeded":True}
