import enum
import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase): pass
class AuditStatus(str, enum.Enum):
    QUEUED="QUEUED"; DISCOVERING="DISCOVERING"; FETCHING_ONCHAIN_DATA="FETCHING_ONCHAIN_DATA"; FETCHING_MARKET_DATA="FETCHING_MARKET_DATA"; FETCHING_DOCUMENTATION="FETCHING_DOCUMENTATION"; ANALYZING_YIELD="ANALYZING_YIELD"; MAPPING_DEPENDENCIES="MAPPING_DEPENDENCIES"; SCORING_RISKS="SCORING_RISKS"; RUNNING_SCENARIOS="RUNNING_SCENARIOS"; REVIEWING_EVIDENCE="REVIEWING_EVIDENCE"; GENERATING_REPORT="GENERATING_REPORT"; COMPLETED="COMPLETED"; FAILED="FAILED"; PARTIALLY_COMPLETED="PARTIALLY_COMPLETED"; CANCELLED="CANCELLED"
class OrderStatus(str, enum.Enum):
    CREATED="CREATED"; PAYMENT_PENDING="PAYMENT_PENDING"; PAID="PAID"; PROCESSING="PROCESSING"; DELIVERED="DELIVERED"; REFUNDED="REFUNDED"; CANCELLED="CANCELLED"

class UUIDMixin:
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
class User(UUIDMixin, Base):
    __tablename__="users"; email: Mapped[str|None]=mapped_column(String(320), unique=True); role: Mapped[str]=mapped_column(String(24), default="user"); is_active: Mapped[bool]=mapped_column(Boolean, default=True)
class Wallet(UUIDMixin, Base):
    __tablename__="wallets"; user_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True); address: Mapped[str]=mapped_column(String(42), index=True); chain_id: Mapped[int]=mapped_column(Integer, default=1); __table_args__=(UniqueConstraint("address","chain_id"),)
class Session(UUIDMixin, Base):
    __tablename__="sessions"; user_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True); token_hash: Mapped[str]=mapped_column(String(128), unique=True); expires_at: Mapped[datetime]=mapped_column(DateTime(timezone=True)); revoked_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True))
class Audit(UUIDMixin, Base):
    __tablename__="audits"; user_id: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True); name: Mapped[str]=mapped_column(String(240)); status: Mapped[AuditStatus]=mapped_column(Enum(AuditStatus), default=AuditStatus.QUEUED, index=True); tier: Mapped[str]=mapped_column(String(24), default="demo"); report: Mapped[dict|None]=mapped_column(JSON)
class AuditTarget(UUIDMixin, Base):
    __tablename__="audit_targets"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); type: Mapped[str]=mapped_column(String(30)); normalized_value: Mapped[str]=mapped_column(Text); chain_id: Mapped[int|None]=mapped_column(Integer)
class AuditJob(UUIDMixin, Base):
    __tablename__="audit_jobs"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), unique=True); job_id: Mapped[str]=mapped_column(String(100), unique=True); status: Mapped[AuditStatus]=mapped_column(Enum(AuditStatus)); progress: Mapped[int]=mapped_column(Integer, default=0); error: Mapped[str|None]=mapped_column(Text)
class AgentRun(UUIDMixin, Base):
    __tablename__="agent_runs"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); agent: Mapped[str]=mapped_column(String(80)); status: Mapped[str]=mapped_column(String(24)); duration_ms: Mapped[int|None]=mapped_column(Integer); tokens: Mapped[int]=mapped_column(Integer, default=0); cost_usd: Mapped[float]=mapped_column(Float, default=0)
class Finding(UUIDMixin, Base):
    __tablename__="findings"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); category: Mapped[str]=mapped_column(String(60), index=True); title: Mapped[str]=mapped_column(String(240)); detail: Mapped[str]=mapped_column(Text); severity: Mapped[str]=mapped_column(String(20))
class EvidenceSource(UUIDMixin, Base):
    __tablename__="evidence_sources"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); name: Mapped[str]=mapped_column(String(160)); url: Mapped[str]=mapped_column(Text); retrieved_at: Mapped[datetime]=mapped_column(DateTime(timezone=True)); data_type: Mapped[str]=mapped_column(String(60)); confidence: Mapped[float]=mapped_column(Float); freshness: Mapped[str]=mapped_column(String(24)); error: Mapped[str|None]=mapped_column(Text)
class EvidenceClaim(UUIDMixin, Base):
    __tablename__="evidence_claims"; source_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("evidence_sources.id", ondelete="CASCADE"), index=True); finding_id: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("findings.id", ondelete="SET NULL")); claim: Mapped[str]=mapped_column(Text); contradictory: Mapped[bool]=mapped_column(Boolean, default=False)
class RiskCategory(UUIDMixin, Base):
    __tablename__="risk_categories"; key: Mapped[str]=mapped_column(String(60), unique=True); label: Mapped[str]=mapped_column(String(120)); default_weight: Mapped[float]=mapped_column(Float)
class RiskScore(UUIDMixin, Base):
    __tablename__="risk_scores"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); category_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("risk_categories.id")); score: Mapped[int]=mapped_column(Integer); confidence: Mapped[float]=mapped_column(Float); evidence_count: Mapped[int]=mapped_column(Integer); explanation: Mapped[str]=mapped_column(Text); weight: Mapped[float]=mapped_column(Float)
class YieldComponent(UUIDMixin, Base):
    __tablename__="yield_components"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); category: Mapped[str]=mapped_column(String(50)); apy: Mapped[float]=mapped_column(Float); payer: Mapped[str]=mapped_column(String(120)); durable: Mapped[bool]=mapped_column(Boolean); verified: Mapped[bool]=mapped_column(Boolean)
class DependencyNode(UUIDMixin, Base):
    __tablename__="dependency_nodes"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); type: Mapped[str]=mapped_column(String(40)); label: Mapped[str]=mapped_column(String(160)); metadata_: Mapped[dict]=mapped_column("metadata", JSON, default=dict)
class DependencyEdge(UUIDMixin, Base):
    __tablename__="dependency_edges"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); source_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("dependency_nodes.id")); target_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("dependency_nodes.id")); relationship: Mapped[str]=mapped_column(String(80))
class Scenario(UUIDMixin, Base):
    __tablename__="scenarios"; key: Mapped[str]=mapped_column(String(80), unique=True); label: Mapped[str]=mapped_column(String(160))
class ScenarioResult(UUIDMixin, Base):
    __tablename__="scenario_results"; audit_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("audits.id", ondelete="CASCADE"), index=True); scenario_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("scenarios.id")); impact: Mapped[str]=mapped_column(Text); severity: Mapped[str]=mapped_column(String(20)); confidence: Mapped[float]=mapped_column(Float)

def simple_model(name: str, tablename: str, fields: dict):
    annotations = {}
    attrs={"__tablename__":tablename,"__annotations__":annotations}
    for field, (annotation, column) in fields.items():
        annotations[field] = Mapped[annotation]
        attrs[field] = column
    return type(name,(UUIDMixin,Base),attrs)

Protocol=simple_model("Protocol","protocols",{"name":(str,mapped_column(String(120),unique=True)),"slug":(str,mapped_column(String(120),unique=True))})
ProtocolAdapter=simple_model("ProtocolAdapter","protocol_adapters",{"protocol_id":(uuid.UUID|None,mapped_column(ForeignKey("protocols.id"))),"name":(str,mapped_column(String(120),unique=True)),"status":(str,mapped_column(String(24),default="healthy"))})
Chain=simple_model("Chain","chains",{"chain_id":(int,mapped_column(Integer,unique=True)),"name":(str,mapped_column(String(80),unique=True))})
Token=simple_model("Token","tokens",{"chain_id":(int,mapped_column(Integer,index=True)),"address":(str,mapped_column(String(42),index=True)),"symbol":(str,mapped_column(String(30)))})
Contract=simple_model("Contract","contracts",{"chain_id":(int,mapped_column(Integer,index=True)),"address":(str,mapped_column(String(42),index=True)),"is_proxy":(bool,mapped_column(Boolean,default=False)),"verified":(bool,mapped_column(Boolean,default=False))})
UploadedDocument=simple_model("UploadedDocument","uploaded_documents",{"audit_id":(uuid.UUID,mapped_column(ForeignKey("audits.id",ondelete="CASCADE"),index=True)),"filename":(str,mapped_column(String(255))),"content_type":(str,mapped_column(String(100))),"size_bytes":(int,mapped_column(Integer)),"storage_key":(str,mapped_column(String(255),unique=True))})
Order=simple_model("Order","orders",{"user_id":(uuid.UUID|None,mapped_column(ForeignKey("users.id",ondelete="SET NULL"),index=True)),"tier":(str,mapped_column(String(30))),"amount_cents":(int,mapped_column(Integer)),"status":(OrderStatus,mapped_column(Enum(OrderStatus),default=OrderStatus.CREATED,index=True))})
Payment=simple_model("Payment","payments",{"order_id":(uuid.UUID,mapped_column(ForeignKey("orders.id",ondelete="CASCADE"),index=True)),"provider":(str,mapped_column(String(30))),"provider_id":(str|None,mapped_column(String(160),unique=True)),"status":(str,mapped_column(String(30))),"amount_cents":(int,mapped_column(Integer))})
Subscription=simple_model("Subscription","subscriptions",{"user_id":(uuid.UUID,mapped_column(ForeignKey("users.id",ondelete="CASCADE"),index=True)),"plan":(str,mapped_column(String(30))),"status":(str,mapped_column(String(30)))})
UsageRecord=simple_model("UsageRecord","usage_records",{"user_id":(uuid.UUID|None,mapped_column(ForeignKey("users.id",ondelete="SET NULL"),index=True)),"kind":(str,mapped_column(String(60),index=True)),"units":(float,mapped_column(Float)),"cost_usd":(float,mapped_column(Float,default=0))})
Review=simple_model("Review","reviews",{"user_id":(uuid.UUID|None,mapped_column(ForeignKey("users.id",ondelete="SET NULL"))),"audit_id":(uuid.UUID,mapped_column(ForeignKey("audits.id",ondelete="CASCADE"),index=True)),"rating":(int,mapped_column(Integer)),"comment":(str|None,mapped_column(Text))})
SavedOpportunity=simple_model("SavedOpportunity","saved_opportunities",{"user_id":(uuid.UUID,mapped_column(ForeignKey("users.id",ondelete="CASCADE"),index=True)),"name":(str,mapped_column(String(240))),"target":(str,mapped_column(Text))})
Portfolio=simple_model("Portfolio","portfolios",{"user_id":(uuid.UUID,mapped_column(ForeignKey("users.id",ondelete="CASCADE"),index=True)),"name":(str,mapped_column(String(160)))})
PortfolioPosition=simple_model("PortfolioPosition","portfolio_positions",{"portfolio_id":(uuid.UUID,mapped_column(ForeignKey("portfolios.id",ondelete="CASCADE"),index=True)),"chain_id":(int,mapped_column(Integer)),"protocol":(str,mapped_column(String(120))),"asset":(str,mapped_column(String(80))),"value_usd":(float,mapped_column(Float))})
Notification=simple_model("Notification","notifications",{"user_id":(uuid.UUID,mapped_column(ForeignKey("users.id",ondelete="CASCADE"),index=True)),"type":(str,mapped_column(String(60))),"message":(str,mapped_column(Text)),"read_at":(datetime|None,mapped_column(DateTime(timezone=True)))})
AdminAuditLog=simple_model("AdminAuditLog","admin_audit_logs",{"actor_id":(uuid.UUID|None,mapped_column(ForeignKey("users.id",ondelete="SET NULL"),index=True)),"action":(str,mapped_column(String(120),index=True)),"target_type":(str,mapped_column(String(80))),"target_id":(str|None,mapped_column(String(80))),"details":(dict,mapped_column(JSON,default=dict))})

Index("ix_tokens_chain_address", Token.chain_id, Token.address, unique=True)
Index("ix_contracts_chain_address", Contract.chain_id, Contract.address, unique=True)
