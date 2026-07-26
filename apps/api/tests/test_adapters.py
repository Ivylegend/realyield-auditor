import pytest
from app.adapters import ADAPTERS, AnalysisTarget
@pytest.mark.asyncio
async def test_aave_and_fallback():
    target=AnalysisTarget("https://app.aave.com/reserve-overview")
    supported=[a.name for a in ADAPTERS if await a.supports(target)]
    assert "aave" in supported
    assert "generic_fallback" in supported
def test_at_least_five_protocol_adapters():
    assert len(ADAPTERS)>=6
