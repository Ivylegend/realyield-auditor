"""Seed reference data after migrations: python scripts/seed.py."""
import asyncio
from sqlalchemy import select
from apps.api.app.database import SessionLocal
from apps.api.app.models import Chain, Protocol, ProtocolAdapter, RiskCategory
from apps.api.app.scoring import WEIGHTS
async def main():
    async with SessionLocal() as db:
        for chain_id,name in [(1,"Ethereum"),(42161,"Arbitrum"),(8453,"Base"),(10,"Optimism"),(137,"Polygon")]:
            if not await db.scalar(select(Chain).where(Chain.chain_id==chain_id)): db.add(Chain(chain_id=chain_id,name=name))
        for name in ["Aave","Compound","Lido","Rocket Pool","EigenLayer","Uniswap V3","Curve","Convex","Maker/Sky","Ethena"]:
            slug=name.lower().replace(" ","-").replace("/","-")
            if not await db.scalar(select(Protocol).where(Protocol.slug==slug)): db.add(Protocol(name=name,slug=slug))
        for key,weight in WEIGHTS.items():
            if not await db.scalar(select(RiskCategory).where(RiskCategory.key==key)): db.add(RiskCategory(key=key,label=key.replace("_"," ").title(),default_weight=weight))
        await db.commit()
if __name__=="__main__": asyncio.run(main())
