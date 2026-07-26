# Protocol adapters

The working Python adapter registry lives in `apps/api/app/adapters.py`. It includes Aave,
Compound, Lido, Rocket Pool, EigenLayer-style products, Uniswap V3, Curve, Convex,
Maker/Sky, Ethena-style products, ERC-4626, generic staking, and a labeled fallback.
Every source result carries retrieval time, type, confidence, freshness, value, and error.
