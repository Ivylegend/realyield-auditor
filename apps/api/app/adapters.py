from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import UTC, datetime
import httpx

@dataclass
class AnalysisTarget: value:str; chain_id:int|None=None
@dataclass
class AdapterResult:
    source_name:str; url:str|None; retrieved_at:datetime; data_type:str; confidence:float; value:object|None=None; error:str|None=None; freshness:str="fresh"
class ProtocolAdapter(ABC):
    name="generic"
    @abstractmethod
    async def supports(self,target:AnalysisTarget)->bool: ...
    async def fetch_metadata(self,target:AnalysisTarget)->AdapterResult: return AdapterResult(self.name,None,datetime.now(UTC),"metadata",.3,error="Protocol-specific metadata unavailable",freshness="unknown")
    async def fetch_yield_data(self,target:AnalysisTarget)->AdapterResult: return AdapterResult(self.name,None,datetime.now(UTC),"yield",.2,error="Yield data unavailable",freshness="unknown")
    async def fetch_dependencies(self,target:AnalysisTarget)->list[AdapterResult]: return []
    async def fetch_risk_signals(self,target:AnalysisTarget)->list[AdapterResult]: return []
class NamedAdapter(ProtocolAdapter):
    keywords:tuple[str,...]=()
    async def supports(self,target): return any(k in target.value.lower() for k in self.keywords)
class AaveAdapter(NamedAdapter): name="aave"; keywords=("aave","aave.com")
class CompoundAdapter(NamedAdapter): name="compound"; keywords=("compound","compound.finance")
class LidoAdapter(NamedAdapter): name="lido"; keywords=("lido","steth")
class RocketPoolAdapter(NamedAdapter): name="rocket_pool"; keywords=("rocket pool","reth")
class EigenLayerAdapter(NamedAdapter): name="eigenlayer"; keywords=("eigenlayer","restaking","lrt")
class UniswapV3Adapter(NamedAdapter): name="uniswap_v3"; keywords=("uniswap","univ3")
class CurveAdapter(NamedAdapter): name="curve"; keywords=("curve","crv")
class ConvexAdapter(NamedAdapter): name="convex"; keywords=("convex","cvx")
class MakerSkyAdapter(NamedAdapter): name="maker_sky"; keywords=("maker","sky","dai","usds")
class EthenaAdapter(NamedAdapter): name="ethena"; keywords=("ethena","usde")
class ERC4626Adapter(NamedAdapter): name="erc4626"; keywords=("erc-4626","erc4626","vault")
class GenericStakingAdapter(NamedAdapter): name="generic_staking"; keywords=("stake","staking")
class GenericAdapter(ProtocolAdapter):
    name="generic_fallback"
    async def supports(self,target): return True
class DefiLlamaSource:
    def __init__(self,base_url="https://api.llama.fi"): self.base_url=base_url
    async def protocols(self):
        try:
            async with httpx.AsyncClient(timeout=8,follow_redirects=False) as client: response=await client.get(f"{self.base_url}/protocols"); response.raise_for_status()
            return AdapterResult("DefiLlama",f"{self.base_url}/protocols",datetime.now(UTC),"protocols",.9,response.json(),"fresh")
        except Exception as exc: return AdapterResult("DefiLlama",None,datetime.now(UTC),"protocols",0,error=str(exc),freshness="unavailable")
ADAPTERS=[AaveAdapter(),CompoundAdapter(),LidoAdapter(),RocketPoolAdapter(),EigenLayerAdapter(),UniswapV3Adapter(),CurveAdapter(),ConvexAdapter(),MakerSkyAdapter(),EthenaAdapter(),ERC4626Adapter(),GenericStakingAdapter(),GenericAdapter()]
