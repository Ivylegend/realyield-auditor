"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, BarChart3, Bot, BrainCircuit, Check, ChevronDown,
  CircleDollarSign, Clock3, FileCheck2, GitCompareArrows, Globe2, Hexagon,
  LayoutDashboard, Menu, Network, Orbit, Plus, Search, ShieldAlert, Sparkles,
  Star, TrendingUp, Upload, Wallet, X, Zap, LockKeyhole, ExternalLink,
  CircleHelp, AlertTriangle, CheckCircle2, Play, Share2, Users, Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { AuditReport } from "../lib/demo-report";

type View = "home" | "new" | "live" | "report" | "compare" | "portfolio" | "history" | "pricing" | "listing" | "admin";
type InputMode = "url" | "contract" | "manual" | "wallet";

const stages = [
  { key: "DISCOVERING", label: "Discovering opportunity", agent: "Opportunity Discovery", icon: Search },
  { key: "FETCHING_ONCHAIN_DATA", label: "Reading contracts", agent: "Contract Risk", icon: FileCheck2 },
  { key: "FETCHING_MARKET_DATA", label: "Checking market data", agent: "Yield Source Analyst", icon: TrendingUp },
  { key: "FETCHING_DOCUMENTATION", label: "Reviewing documentation", agent: "Evidence Reviewer", icon: Globe2 },
  { key: "ANALYZING_YIELD", label: "Decomposing yield", agent: "Yield Source Analyst", icon: BarChart3 },
  { key: "MAPPING_DEPENDENCIES", label: "Mapping dependencies", agent: "Counterparty Agent", icon: Network },
  { key: "SCORING_RISKS", label: "Scoring risks", agent: "Risk Engine", icon: ShieldAlert },
  { key: "RUNNING_SCENARIOS", label: "Running stress scenarios", agent: "Scenario Simulator", icon: Orbit },
  { key: "REVIEWING_EVIDENCE", label: "Checking every claim", agent: "Evidence Reviewer", icon: BadgeCheck },
  { key: "GENERATING_REPORT", label: "Composing report", agent: "Report Composer", icon: BrainCircuit },
];

const nav = [
  ["New audit", "new", Plus],
  ["Compare", "compare", GitCompareArrows],
  ["Portfolio", "portfolio", Wallet],
  ["History", "history", Clock3],
] as const;

const demoComparisons = [
  { name: "Atlas USD Vault", apy: 18.4, durable: 6.9, risk: 68, exit: "High", sustainability: "Incentive-dependent", accent: "#dfff62" },
  { name: "Aave USDC", apy: 4.8, durable: 4.5, risk: 31, exit: "Low", sustainability: "Reasonable", accent: "#7ee8bd" },
  { name: "Lido stETH", apy: 3.2, durable: 3.0, risk: 39, exit: "Moderate", sustainability: "Strong", accent: "#8bb9ff" },
];

const riskHistory = [
  { day: "May 01", atlas: 54, aave: 27, lido: 35 },
  { day: "May 08", atlas: 57, aave: 28, lido: 36 },
  { day: "May 15", atlas: 61, aave: 29, lido: 38 },
  { day: "May 22", atlas: 63, aave: 30, lido: 37 },
  { day: "May 29", atlas: 68, aave: 31, lido: 39 },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <button className="brand" onClick={() => setHash("home")} aria-label="RealYield Auditor home">
      <span className="brand-mark"><span /></span>
      {!compact && <span>REALYIELD<small>AUDITOR</small></span>}
    </button>
  );
}

function setHash(view: string) {
  window.location.hash = view;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function AppButton({ children, onClick, kind = "primary", disabled = false, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; kind?: "primary" | "ghost" | "outline" | "danger"; disabled?: boolean; type?: "button" | "submit";
}) {
  return <button type={type} className={`button ${kind}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`chip ${tone}`}><span className="chip-dot" />{children}</span>;
}

function Header({ view, navigate }: { view: View; navigate: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <Brand />
      <nav className={open ? "topnav open" : "topnav"}>
        {nav.map(([label, key, Icon]) => (
          <button key={key} className={view === key ? "active" : ""} onClick={() => { navigate(key); setOpen(false); }}>
            <Icon size={15} />{label}
          </button>
        ))}
        <button className={view === "pricing" ? "active" : ""} onClick={() => navigate("pricing")}>Pricing</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu size={20} /></button>
        <button className="wallet-button" onClick={() => navigate("portfolio")}><Wallet size={16} /><span>Connect wallet</span></button>
        <AppButton onClick={() => navigate("new")}>Start audit <ArrowRight size={16} /></AppButton>
      </div>
    </header>
  );
}

function MiniStat({ value, label, note }: { value: string; label: string; note?: string }) {
  return <div className="mini-stat"><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}</div>;
}

function SearchComposer({ onStart, large = false }: { onStart: (value: string) => void; large?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <form className={large ? "search-composer large" : "search-composer"} onSubmit={(e) => { e.preventDefault(); onStart(value); }}>
      <Search size={21} />
      <input aria-label="Opportunity to audit" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste a URL, contract, token, pool, or protocol…" />
      <button type="submit">Audit yield <ArrowRight size={17} /></button>
    </form>
  );
}

function Home({ navigate, startAudit }: { navigate: (v: View) => void; startAudit: (v: string) => void }) {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-copy">
            <Chip tone="lime"><Sparkles size={12} /> Built for OKX.AI Genesis Hackathon</Chip>
            <h1>Know where the yield comes from <em>before you trust the APY.</em></h1>
            <p>AI agents trace every source of return, map hidden dependencies, and stress-test what could cause principal loss.</p>
            <SearchComposer onStart={startAudit} large />
            <div className="quick-picks">
              <span>Try an example</span>
              <button onClick={() => startAudit("Atlas USD Real Yield Vault")}>Atlas USD · 18.4%</button>
              <button onClick={() => startAudit("Aave USDC")}>Aave USDC</button>
              <button onClick={() => startAudit("Lido stETH")}>Lido stETH</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="signal-orbit orbit-a" />
            <div className="signal-orbit orbit-b" />
            <motion.div className="audit-preview" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
              <div className="preview-head">
                <div><span className="preview-icon">A</span><div><small>FICTIONAL DEMO</small><strong>Atlas USD Vault</strong></div></div>
                <Chip tone="amber">Elevated risk</Chip>
              </div>
              <div className="preview-score">
                <div className="apy"><small>Advertised APY</small><strong>18.4%</strong><span>Only <b>6.9%</b> appears durable</span></div>
                <div className="risk-ring" style={{ "--risk": "68%" } as React.CSSProperties}><span><strong>68</strong><small>/ 100</small></span></div>
              </div>
              <div className="yield-stack">
                <span style={{ width: "22%", background: "#dfff62" }}>4.1</span>
                <span style={{ width: "15%", background: "#7ee8bd" }}>2.8</span>
                <span style={{ width: "35%", background: "#d4a95b" }}>6.5</span>
                <span style={{ width: "18%", background: "#df7d66" }}>3.2</span>
                <span style={{ width: "10%", background: "#a58fae" }}>1.8</span>
              </div>
              <div className="stack-legend"><span><i className="durable" />Durable 37.5%</span><span><i className="dependent" />Dependent 62.5%</span></div>
              <div className="alert-card"><AlertTriangle size={18} /><span><strong>Yield relies on emissions + leverage</strong><small>11.5% may fall away if incentives or recursion end.</small></span></div>
              <button onClick={() => startAudit("Atlas USD Real Yield Vault")}>Open evidence-backed report <ArrowRight size={15} /></button>
            </motion.div>
          </div>
        </section>

        <section className="proof-strip">
          <span>10 specialist agents</span><i />
          <span>16 risk categories</span><i />
          <span>Claim-level citations</span><i />
          <span>Deterministic scoring</span>
        </section>

        <section className="section how">
          <div className="section-kicker">THE AUDIT PIPELINE</div>
          <div className="section-title"><h2>One question. Ten agents.<br /><em>A defensible answer.</em></h2><p>Each specialist investigates a distinct failure mode. An evidence reviewer then challenges every claim before the report ships.</p></div>
          <div className="agent-grid">
            {[
              [Search, "Discover", "Identify protocol, chain, contracts, and missing context."],
              [BarChart3, "Decompose", "Separate productive yield from emissions, points, and leverage."],
              [Network, "Map", "Trace vaults, oracles, bridges, issuers, and governance."],
              [Orbit, "Stress-test", "Model depegs, exits, pauses, and incentive cliffs."],
              [BadgeCheck, "Verify", "Remove unsupported claims and score evidence freshness."],
              [BrainCircuit, "Explain", "Compose a careful, actionable report without recommendations."],
            ].map(([Icon, title, text], i) => {
              const AgentIcon = Icon as typeof Search;
              return <motion.article className="agent-card" key={title as string} whileHover={{ y: -5 }}><span>0{i + 1}</span><AgentIcon size={23} /><h3>{title as string}</h3><p>{text as string}</p></motion.article>;
            })}
          </div>
        </section>

        <section className="section opportunity-section">
          <div className="section-kicker">COVERAGE</div>
          <div className="section-title"><h2>Yield takes many forms.<br /><em>So does risk.</em></h2><p>From lending pools to tokenized treasuries, the adapter layer degrades gracefully when premium data is unavailable.</p></div>
          <div className="opportunity-row">
            {["Stablecoins", "Lending", "Liquidity pools", "LSTs & LRTs", "Restaking", "Tokenized RWAs", "ERC-4626 vaults", "Staking"].map((x, i) => <span key={x}><Hexagon size={16} />{x}<small>0{i + 1}</small></span>)}
          </div>
        </section>

        <section className="section example-section">
          <div className="example-copy">
            <Chip tone="amber">Fictional seeded demo</Chip>
            <h2>18.4% advertised.<br /><em>6.9% looks durable.</em></h2>
            <p>The Atlas USD audit finds that reward emissions, recursive leverage, and a temporary campaign account for most of the headline APY.</p>
            <ul>
              <li><Check size={15} />Centralized stablecoin issuer identified</li>
              <li><Check size={15} />Upgradeable vault and multisig mapped</li>
              <li><Check size={15} />Seven-day exit cooldown surfaced</li>
              <li><Check size={15} />Incomplete dependency audit flagged</li>
            </ul>
            <AppButton onClick={() => startAudit("Atlas USD Real Yield Vault")}>Run the 90-second demo <Play size={15} /></AppButton>
          </div>
          <div className="dependency-demo">
            <div className="dep-label">DEPENDENCY MAP</div>
            <div className="dep-node n1">Your aUSD</div><div className="dep-node n2 hot">Atlas Vault</div>
            <div className="dep-node n3">Aegis Lending</div><div className="dep-node n4">Meridian DEX</div>
            <div className="dep-node n5 warn">ATLAS token</div><div className="dep-node n6 warn">aUSD issuer</div>
            <svg viewBox="0 0 600 360" aria-hidden="true"><path d="M95 180 L245 180 M330 170 L445 80 M330 185 L445 175 M330 195 L445 280 M510 95 L535 140 M510 265 L535 205" /></svg>
          </div>
        </section>

        <section className="section pricing-preview">
          <div className="section-kicker">PRICING</div>
          <div className="section-title"><h2>Start with the question.<br /><em>Scale with the exposure.</em></h2><button onClick={() => navigate("pricing")}>View full pricing <ArrowRight size={16} /></button></div>
          <div className="price-grid">
            <PriceCard title="Quick Scan" price="$0" time="~90 sec" features={["Yield-source breakdown", "Core risk categories", "10 public sources"]} action="Run free demo" onClick={() => startAudit("")} />
            <PriceCard title="Full Audit" price="$39" time="8–12 min" featured features={["Complete dependency graph", "16-category risk report", "Scenario simulation", "Exportable report"]} action="Start full audit" onClick={() => navigate("new")} />
            <PriceCard title="Portfolio" price="$149" time="15–20 min" features={["Up to 20 positions", "Shared dependency analysis", "Concentration risk", "30-day monitoring"]} action="Connect portfolio" onClick={() => navigate("portfolio")} />
          </div>
        </section>

        <section className="section reviews">
          <div className="section-kicker">RECENT REVIEWS</div>
          <div className="review-grid">
            {[
              ["“It showed that nearly half the APY was a temporary token campaign. That was the piece the dashboard left out.”", "0x7B…91A", "Full Audit"],
              ["“The dependency graph made our shared oracle exposure obvious across three positions.”", "R. Chen", "Portfolio Audit"],
              ["“Clear sourcing, careful language, and no fake certainty. Exactly what DeFi research needs.”", "marcus.eth", "Quick Scan"],
            ].map(([quote, name, tier]) => <article key={name}><div className="stars">{[1,2,3,4,5].map(x => <Star key={x} size={14} fill="currentColor" />)}</div><p>{quote}</p><footer><span>{name}<small>{tier}</small></span><BadgeCheck size={17} /></footer></article>)}
          </div>
        </section>

        <section className="final-cta">
          <div><Chip tone="lime">Public demo available</Chip><h2>Don’t trust the number.<br /><em>Trace the mechanism.</em></h2><p>Start with a URL, contract, wallet position, or a few lines of context.</p></div>
          <AppButton onClick={() => navigate("new")}>Audit an opportunity <ArrowRight size={18} /></AppButton>
        </section>
      </main>
      <Footer navigate={navigate} />
    </>
  );
}

function PriceCard({ title, price, time, features, action, featured, onClick }: { title: string; price: string; time: string; features: string[]; action: string; featured?: boolean; onClick: () => void }) {
  return <article className={featured ? "price-card featured" : "price-card"}>{featured && <span className="popular">MOST REQUESTED</span>}<h3>{title}</h3><div className="price">{price}<small>{price !== "$0" ? " / audit" : " demo"}</small></div><span className="delivery"><Clock3 size={14} />{time}</span><ul>{features.map(x => <li key={x}><Check size={15} />{x}</li>)}</ul><AppButton kind={featured ? "primary" : "outline"} onClick={onClick}>{action}<ArrowRight size={15} /></AppButton></article>;
}

function NewAudit({ startAudit }: { startAudit: (v: string) => void }) {
  const [mode, setMode] = useState<InputMode>("url");
  const [target, setTarget] = useState("");
  const [chain, setChain] = useState("Ethereum");
  const modes: [InputMode, string, typeof Globe2][] = [["url", "URL / Protocol", Globe2], ["contract", "Contract", FileCheck2], ["manual", "Manual entry", Plus], ["wallet", "Wallet positions", Wallet]];
  return (
    <PageShell eyebrow="NEW AUDIT" title="What would you like to investigate?" subtitle="Give the agents a starting point. They’ll identify contracts, dependencies, and missing evidence.">
      <div className="audit-form-shell">
        <div className="mode-tabs">
          {modes.map(([key, label, Icon]) => <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}><Icon size={17} />{label}</button>)}
        </div>
        <div className="audit-form">
          {mode === "wallet" ? (
            <div className="wallet-empty"><span><Wallet size={28} /></span><h3>Connect a wallet to discover positions</h3><p>Read-only access. RealYield never requests seed phrases, private keys, or transaction approval.</p><AppButton onClick={() => setTarget("0x71C…A92F")}>Connect demo wallet <ArrowRight size={16} /></AppButton>{target && <div className="position-found"><CheckCircle2 size={18} /><div><b>3 yield positions found</b><small>Aave USDC · Lido stETH · Atlas USD Vault</small></div></div>}</div>
          ) : mode === "manual" ? (
            <div className="manual-grid">
              <label>Opportunity name<input value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. Atlas USD Vault" /></label>
              <label>Advertised APY<input placeholder="18.4%" /></label>
              <label>Protocol<input placeholder="Protocol name" /></label>
              <label>Chain<select value={chain} onChange={e => setChain(e.target.value)}><option>Ethereum</option><option>Arbitrum</option><option>Base</option><option>Optimism</option></select></label>
              <label>Deposit asset<input placeholder="USDC" /></label>
              <label>Reward asset<input placeholder="Optional" /></label>
              <label className="wide">Additional context<textarea placeholder="Describe the yield mechanism, lock-up, or any claims you want verified." /></label>
            </div>
          ) : (
            <div className="target-entry">
              {mode === "contract" && <label>Chain<select value={chain} onChange={e => setChain(e.target.value)}><option>Ethereum</option><option>Arbitrum</option><option>Base</option><option>Optimism</option><option>Polygon</option></select></label>}
              <label>{mode === "url" ? "Opportunity URL, token, or protocol" : "Contract address"}<div className="big-input">{mode === "url" ? <Globe2 size={20} /> : <FileCheck2 size={20} />}<input autoFocus value={target} onChange={e => setTarget(e.target.value)} placeholder={mode === "url" ? "https://app.protocol.fi/vault/…" : "0x0000…"} /></div></label>
              <button className="demo-fill" onClick={() => setTarget("Atlas USD Real Yield Vault")}><Sparkles size={14} /> Use fictional Atlas demo</button>
            </div>
          )}
          <div className="form-options">
            <label>Analysis depth<select><option>Quick Scan · Free</option><option>Full Audit · $39</option><option>Deep Research · $89</option></select></label>
            <label className="upload"><Upload size={18} /><span><b>Add supporting documents</b><small>PDF, DOCX, TXT, or CSV · 20 MB max</small></span><input type="file" accept=".pdf,.docx,.txt,.csv" /></label>
          </div>
          <div className="form-footer"><div><b>Quick Scan</b><span>~90 seconds · 10 source checks · 8 risk categories</span></div><AppButton onClick={() => startAudit(target || "Atlas USD Real Yield Vault")}>Start evidence scan <ArrowRight size={17} /></AppButton></div>
        </div>
      </div>
      <div className="security-note"><LockKeyhole size={18} /><div><b>Your inputs are treated as untrusted data.</b><span>Scraped pages and uploads cannot override analysis instructions. Private files are never exposed through public URLs.</span></div></div>
    </PageShell>
  );
}

function LiveAudit({ report, progress, cancelled, onCancel, openReport }: { report: AuditReport | null; progress: number; cancelled: boolean; onCancel: () => void; openReport: () => void }) {
  const current = Math.min(Math.floor(progress / 9.7), stages.length - 1);
  const findings = [
    ["18.4% APY detected", "Advertised rate"], ["Upgradeable proxy found", "Contract control"],
    ["6.5% token emissions", "Incentive dependency"], ["7-day cooldown", "Exit constraint"],
    ["Recursive loop detected", "Leverage"], ["1 incomplete audit", "Evidence gap"],
  ];
  return (
    <div className="workspace">
      <div className="workspace-top">
        <div><Chip tone={cancelled ? "red" : progress >= 100 ? "mint" : "lime"}>{cancelled ? "Cancelled" : progress >= 100 ? "Audit complete" : "Analysis in progress"}</Chip><h1>{report?.name ?? "Preparing audit…"}</h1><span>Ethereum · ERC-4626 Vault · Fictional demo</span></div>
        <div>{progress < 100 && !cancelled ? <AppButton kind="outline" onClick={onCancel}><X size={15} /> Cancel</AppButton> : <AppButton onClick={openReport}>Open report <ArrowRight size={16} /></AppButton>}</div>
      </div>
      <div className="overall-progress"><div><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b><small>{cancelled ? "Analysis stopped" : progress >= 100 ? "Report ready" : stages[current].label}</small></div>
      <div className="workspace-grid">
        <aside className="agent-rail">
          <div className="panel-label">AGENT PIPELINE</div>
          {stages.map((s, i) => {
            const Icon = s.icon;
            return <div key={s.key} className={i < current || progress >= 100 ? "agent-step done" : i === current && !cancelled ? "agent-step active" : "agent-step"}><span>{i < current || progress >= 100 ? <Check size={14} /> : <Icon size={15} />}</span><div><b>{s.agent}</b><small>{i < current || progress >= 100 ? "Complete" : i === current ? s.label : "Waiting"}</small></div>{i === current && !cancelled && <i />}</div>;
          })}
        </aside>
        <section className="live-center">
          <div className="live-map">
            <div className="panel-head"><div><Network size={17} />Dependency map</div><span>{Math.min(7, Math.max(1, current - 1))} nodes identified</span></div>
            <div className="building-map">
              {["Your aUSD", "Atlas Vault", "Aegis Lending", "Meridian DEX", "Oracle", "ATLAS", "Issuer"].slice(0, Math.min(7, Math.max(2, current))).map((n, i) => <motion.span initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} key={n} className={`map-dot md${i}`}>{n}</motion.span>)}
              <svg viewBox="0 0 700 330"><path d="M90 165 L265 165 M340 155 L480 70 M340 165 L480 165 M340 175 L480 260 M555 80 L620 135 M555 250 L620 195" /></svg>
            </div>
          </div>
          <div className="evidence-feed">
            <div className="panel-head"><div><Globe2 size={17} />Live evidence feed</div><span>{Math.min(24, current * 3 + 1)} sources checked</span></div>
            {findings.slice(0, Math.max(1, Math.ceil(current / 1.4))).map(([title, type], i) => <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={title}><span className={i > 1 ? "feed-icon warn" : "feed-icon"}>{i > 1 ? <AlertTriangle size={14} /> : <Check size={14} />}</span><div><b>{title}</b><small>{type} · {i + 2}m ago</small></div><Chip tone={i > 1 ? "amber" : "mint"}>{i > 1 ? "Flagged" : "Verified"}</Chip></motion.div>)}
          </div>
        </section>
        <aside className="findings-rail">
          <div className="panel-label">KEY FINDINGS <span>{Math.min(findings.length, Math.ceil(current / 1.4))}</span></div>
          {findings.slice(0, Math.max(1, Math.ceil(current / 1.4))).map(([title, type], i) => <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={title}><small>{type}</small><b>{title}</b><span className={i < 2 ? "neutral-risk" : "high-risk"}>{i < 2 ? "Observed" : "Risk signal"}</span></motion.article>)}
          <div className="source-health"><div><span className="pulse" /><b>Sources healthy</b></div><small>7 / 8 adapters responding</small><div className="health-bars">{[1,1,1,1,1,1,1,.35].map((x,i) => <i key={i} style={{ opacity: x }} />)}</div></div>
        </aside>
      </div>
    </div>
  );
}

function RiskNode({ data }: NodeProps) {
  const d = data as { label: string; type: string };
  return <div className={`flow-node ${d.type}`}><Handle type="target" position={Position.Left} /><span>{d.type.slice(0, 1).toUpperCase()}</span><div><small>{d.type}</small><b>{d.label}</b></div><Handle type="source" position={Position.Right} /></div>;
}

function Report({ report, navigate }: { report: AuditReport; navigate: (v: View) => void }) {
  const [tab, setTab] = useState("Summary");
  const [rated, setRated] = useState(false);
  const tabs = ["Summary", "Yield", "Dependencies", "Risks", "Scenarios", "Evidence", "Contract", "Documents", "Methodology"];
  const colors = ["#dfff62", "#7ee8bd", "#d4a95b", "#df7d66", "#a58fae"];
  const flow = useMemo(() => ({
    nodes: report.nodes.map(n => ({ id: n.id, position: { x: n.x, y: n.y }, data: { label: n.label, type: n.type }, type: "risk" })) as Node[],
    edges: report.edges.map(([source, target], i) => ({ id: `e${i}`, source, target, animated: i < 4, style: { stroke: i > 3 ? "#d5a157" : "#6aa98c" } })) as Edge[],
  }), [report]);

  const submitRating = async (rating: number) => {
    await fetch("/api/v1/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rating, auditId: report.id }) });
    setRated(true);
  };

  return (
    <div className="report-page">
      <div className="report-banner"><span><Sparkles size={14} />FICTIONAL DEMO DATA</span> This report demonstrates product behavior. No named protocol, token, contract, or source in this report is real.</div>
      <div className="report-head">
        <div className="report-id"><span className="preview-icon">A</span><div><small>ATLAS FINANCE · ETHEREUM</small><h1>{report.name}</h1><span>Generated {new Date(report.createdAt).toLocaleDateString()} · Audit #{report.id.slice(0, 8)}</span></div></div>
        <div className="report-actions"><AppButton kind="outline" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={15} /> Share</AppButton><AppButton kind="outline"><FileCheck2 size={15} /> Export PDF</AppButton><AppButton onClick={() => navigate("compare")}><Plus size={15} /> Compare</AppButton></div>
      </div>
      <nav className="report-tabs">{tabs.map(x => <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>{x}</button>)}</nav>

      {tab === "Summary" && <div className="report-content">
        <section className="summary-grid">
          <article className="conclusion-card">
            <div className="card-kicker"><BadgeCheck size={15} />EXECUTIVE CONCLUSION</div>
            <h2>Most of the headline APY is <em>not durable.</em></h2>
            <p>{report.conclusion}</p>
            <div className="conclusion-chips"><Chip tone="amber">{report.riskLevel} risk</Chip><Chip tone="red">{report.sustainability}</Chip><Chip tone="mint">{report.confidence} confidence</Chip></div>
          </article>
          <article className="score-card">
            <div className="risk-ring large" style={{ "--risk": `${report.riskScore}%` } as React.CSSProperties}><span><strong>{report.riskScore}</strong><small>/ 100</small></span></div>
            <div><small>WEIGHTED RISK SCORE</small><h3>{report.riskLevel}</h3><p>Confidence-adjusted: <b>{report.adjustedRisk}</b></p></div>
          </article>
        </section>
        <section className="metrics-row">
          <MiniStat value={`${report.advertisedApy}%`} label="Advertised APY" note="Protocol claim" />
          <MiniStat value={`${report.durableApy}%`} label="Durable estimate" note="37.5% of headline" />
          <MiniStat value={`${report.sustainabilityScore}/100`} label="Sustainability" note={report.sustainability} />
          <MiniStat value={`${report.exitComplexity}/100`} label="Exit complexity" note="7-day cooldown" />
          <MiniStat value={`${report.completeness}%`} label="Data completeness" note="1 unresolved source" />
        </section>
        <section className="report-split">
          <YieldComposition report={report} />
          <article className="key-risks">
            <div className="card-head"><div><ShieldAlert size={18} /><span><small>PRIORITY REVIEW</small><b>Key risk signals</b></span></div><button onClick={() => setTab("Risks")}>View all <ArrowRight size={14} /></button></div>
            {report.risks.slice(0, 4).map(r => <div className="risk-row" key={r.name}><span className={`risk-number ${r.score > 70 ? "high" : ""}`}>{r.score}</span><div><b>{r.name}</b><small>{r.explanation}</small></div><Chip tone={r.score > 70 ? "red" : "amber"}>{r.severity}</Chip></div>)}
          </article>
        </section>
        <section className="unknown-card"><div><CircleHelp size={22} /><span><small>UNRESOLVED</small><h3>What could not be verified</h3></span></div><ul>{report.unknowns.map(x => <li key={x}>{x}</li>)}</ul></section>
        <section className="checklist-card"><div className="card-head"><div><FileCheck2 size={18} /><span><small>BEFORE ALLOCATING</small><b>Independent verification checklist</b></span></div><span>{report.checklist.length} items</span></div><div>{report.checklist.map(x => <label key={x}><input type="checkbox" /><span><Check size={13} /></span>{x}</label>)}</div></section>
        <section className="rating-card"><div><Star size={22} /><span><h3>{rated ? "Thanks for the review." : "Was this audit useful?"}</h3><p>{rated ? "Your rating is now reflected in service metrics." : "Help others evaluate the RealYield Auditor service."}</p></span></div>{!rated && <div className="rate-stars">{[1,2,3,4,5].map(n => <button key={n} onClick={() => submitRating(n)} aria-label={`Rate ${n} stars`}><Star size={21} /></button>)}</div>}</section>
      </div>}
      {tab === "Yield" && <ReportSection title="Yield composition" subtitle="Every percentage point is attributed to a mechanism and payer."><div className="large-report-card"><YieldComposition report={report} large /><div className="payer-grid">{report.components.map((c, i) => <article key={c.name}><span style={{ background: colors[i] }} /><small>{c.kind.toUpperCase()}</small><h3>{c.name}</h3><strong>{c.value}%</strong><p>{c.durable ? "Generated by observable user demand or fees. Durability still depends on utilization." : "Dependent on incentives, leverage, or a temporary program."}</p><Chip tone={c.durable ? "mint" : "amber"}>{c.durable ? "Potentially durable" : "Dependent"}</Chip></article>)}</div></div></ReportSection>}
      {tab === "Dependencies" && <ReportSection title="Dependency graph" subtitle="Follow principal and reward exposure across protocols, contracts, data feeds, and counterparties."><div className="flow-wrap"><ReactFlow nodes={flow.nodes} edges={flow.edges} nodeTypes={{ risk: RiskNode }} fitView minZoom={.7} maxZoom={1.4}><Background color="#20382f" gap={24} /><Controls /></ReactFlow><div className="flow-legend"><span><i className="asset" />Asset</span><span><i className="protocol" />Protocol</span><span><i className="risk" />Risk concentration</span></div></div></ReportSection>}
      {tab === "Risks" && <ReportSection title="Transparent risk scoring" subtitle="Deterministic category scores, evidence counts, confidence, freshness, and weights—not one unexplained AI number."><div className="risk-table"><div className="risk-table-head"><span>Category</span><span>Score</span><span>Severity</span><span>Evidence</span><span>Confidence</span><span>Weight</span></div>{report.risks.map(r => <div className="risk-table-row" key={r.name}><div><b>{r.name}</b><small>{r.explanation}</small></div><strong>{r.score}</strong><Chip tone={r.score > 70 ? "red" : r.score > 50 ? "amber" : "neutral"}>{r.severity}</Chip><span>{r.evidence} claims</span><span>{r.confidence}%</span><span>{r.weight}%</span></div>)}</div></ReportSection>}
      {tab === "Scenarios" && <ReportSection title="Directional stress scenarios" subtitle="These are exposure analyses, not exact predictions."><div className="scenario-grid">{report.scenarios.map((s, i) => <article key={s.scenario}><header><span>0{i + 1}</span><Chip tone={s.severity === "Critical" ? "red" : "amber"}>{s.severity}</Chip></header><h3>{s.scenario}</h3><p>{s.impact}</p><dl><div><dt>Affected</dt><dd>{s.affected}</dd></div><div><dt>Possible mitigation</dt><dd>{s.mitigation}</dd></div><div><dt>Confidence</dt><dd>{s.confidence}</dd></div></dl></article>)}</div></ReportSection>}
      {tab === "Evidence" && <ReportSection title="Evidence ledger" subtitle="Each factual claim is paired with source, freshness, and confidence. All demo sources below are fictional."><div className="evidence-table"><div className="evidence-table-head"><span>Source</span><span>Supporting claim</span><span>Freshness</span><span>Confidence</span><span>Status</span></div>{report.evidence.map(e => <div className="evidence-table-row" key={e.source}><a href={e.url}>{e.source}<ExternalLink size={12} /></a><span>{e.claim}</span><span>{e.freshness}</span><strong>{e.confidence}%</strong><Chip tone={e.status === "Unresolved" ? "amber" : "mint"}>{e.status}</Chip></div>)}</div></ReportSection>}
      {["Contract", "Documents", "Methodology"].includes(tab) && <ReportSection title={tab} subtitle={tab === "Contract" ? "Contract metadata is descriptive and is not a formal smart-contract audit." : tab === "Documents" ? "Uploaded documents are treated as untrusted evidence and cited by page where available." : "How RealYield turns evidence into deterministic scores."}><InfoTab tab={tab} /></ReportSection>}
      <Disclaimer />
    </div>
  );
}

function YieldComposition({ report, large = false }: { report: AuditReport; large?: boolean }) {
  const colors = ["#dfff62", "#7ee8bd", "#d4a95b", "#df7d66", "#a58fae"];
  return <article className={large ? "yield-card large" : "yield-card"}><div className="card-head"><div><BarChart3 size={18} /><span><small>YIELD MECHANICS</small><b>Where 18.4% comes from</b></span></div><Chip tone="amber">62.5% dependent</Chip></div><div className="composition-list">{report.components.map((c,i) => <div key={c.name}><span><i style={{ background: colors[i] }} />{c.name}</span><div><b style={{ width: `${c.value / report.advertisedApy * 100}%`, background: colors[i] }} /></div><strong>{c.value}%</strong></div>)}</div><footer><span><i />Potentially durable <b>{report.durableApy}%</b></span><span><i />Incentive / leverage dependent <b>{(report.advertisedApy - report.durableApy).toFixed(1)}%</b></span></footer></article>;
}

function ReportSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="report-content standalone"><div className="report-section-title"><h2>{title}</h2><p>{subtitle}</p></div>{children}</div>;
}

function InfoTab({ tab }: { tab: string }) {
  if (tab === "Contract") return <div className="info-grid"><MiniStat value="ERC-4626" label="Standard" /><MiniStat value="Upgradeable" label="Proxy pattern" /><MiniStat value="3 of 5" label="Governance multisig" /><MiniStat value="24 hours" label="Upgrade delay" /><article><h3>Privilege summary</h3><p>The governance multisig can upgrade implementation logic and pause deposits. The current seeded metadata indicates an emergency withdrawal route, but its behavior under all strategy failure modes could not be verified.</p></article><article><h3>Verification status</h3><p>Proxy and implementation metadata are marked verified in the fictional fixture. One external strategy dependency has incomplete audit coverage.</p></article></div>;
  if (tab === "Documents") return <div className="document-list">{["Atlas Vault overview.pdf", "Strategy audit summary.pdf", "aUSD reserve attestation.pdf"].map((x,i) => <article key={x}><FileCheck2 size={20} /><div><b>{x}</b><small>{i === 1 ? "18 pages · incomplete coverage" : "Verified type · citations indexed"}</small></div><Chip tone={i === 1 ? "amber" : "mint"}>{i === 1 ? "Needs review" : "Processed"}</Chip></article>)}</div>;
  return <div className="method-grid">{[["1", "Collect", "Adapters normalize public market, contract, and documentation evidence."],["2", "Score", "Versioned rules convert observable signals into category scores."],["3", "Adjust", "Confidence and completeness reduce certainty; they never erase risk."],["4", "Review", "The evidence agent removes unsupported claims and flags contradictions."]].map(([n,t,p]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}</div>;
}

function Compare() {
  return <PageShell eyebrow="COMPARE" title="APY is one number. Compare what sits beneath it." subtitle="Evaluate up to four opportunities across durability, risk, liquidity, dependencies, and evidence quality.">
    <div className="compare-tools"><button><Plus size={16} /> Add opportunity</button><span>3 of 4 selected</span></div>
    <div className="compare-grid">
      <aside>{["Advertised APY", "Durable estimate", "Weighted risk", "Sustainability", "Exit complexity", "Reward exposure", "Data confidence"].map(x => <span key={x}>{x}</span>)}</aside>
      {demoComparisons.map((d,i) => <article key={d.name} style={{ "--accent": d.accent } as React.CSSProperties}><header><span>{d.name.slice(0,1)}</span><div><small>{i === 0 ? "FICTIONAL DEMO" : "REFERENCE"}</small><h3>{d.name}</h3></div><button><X size={14} /></button></header><strong>{d.apy}%</strong><span className="durable-value">{d.durable}%</span><span className={`compare-risk ${d.risk > 60 ? "high" : ""}`}>{d.risk} / 100</span><span>{d.sustainability}</span><span>{d.exit}</span><span>{i === 0 ? "8.3% APY" : i === 1 ? "0.3% APY" : "LDO exposure"}</span><span>{i === 0 ? "84%" : i === 1 ? "93%" : "91%"}</span></article>)}
    </div>
    <div className="compare-chart"><div className="card-head"><div><TrendingUp size={17} /><span><small>30-DAY SIGNAL</small><b>Risk score movement</b></span></div></div><ResponsiveContainer width="100%" height={260}><AreaChart data={riskHistory}><defs><linearGradient id="atlas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfff62" stopOpacity={.3}/><stop offset="1" stopColor="#dfff62" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1b3029" vertical={false}/><XAxis dataKey="day" stroke="#698078" fontSize={11}/><YAxis stroke="#698078" fontSize={11}/><Tooltip contentStyle={{background:"#0b1713",border:"1px solid #263d34"}}/><Area type="monotone" dataKey="atlas" stroke="#dfff62" fill="url(#atlas)" strokeWidth={2}/><Area type="monotone" dataKey="aave" stroke="#7ee8bd" fill="none"/><Area type="monotone" dataKey="lido" stroke="#8bb9ff" fill="none"/></AreaChart></ResponsiveContainer></div>
  </PageShell>;
}

function Portfolio() {
  const pie = [{name:"Atlas",value:42,color:"#dfff62"},{name:"Aave",value:34,color:"#7ee8bd"},{name:"Lido",value:24,color:"#8bb9ff"}];
  return <PageShell eyebrow="WALLET PORTFOLIO" title="Shared dependencies hide between positions." subtitle="A read-only portfolio view reveals concentration across protocols, chains, issuers, and infrastructure.">
    <div className="portfolio-head"><div><span className="avatar-wallet"><Wallet size={22} /></span><div><small>DEMO WALLET</small><h3>0x71C8…A92F</h3></div></div><AppButton kind="outline">Change wallet <ChevronDown size={15} /></AppButton></div>
    <div className="portfolio-stats"><MiniStat value="$128,420" label="Deposited value" note="+2.4% this month" /><MiniStat value="8.1%" label="Weighted APY" note="5.2% durable estimate" /><MiniStat value="49/100" label="Portfolio risk" note="Moderate" /><MiniStat value="3" label="Active positions" note="2 fully audited" /></div>
    <div className="portfolio-grid">
      <article className="allocation-card"><div className="card-head"><div><Orbit size={18}/><span><small>CONCENTRATION</small><b>Protocol allocation</b></span></div></div><div className="pie-wrap"><ResponsiveContainer width="55%" height={240}><PieChart><Pie data={pie} dataKey="value" innerRadius={64} outerRadius={95} paddingAngle={3}>{pie.map(x => <Cell key={x.name} fill={x.color}/>)}</Pie><Tooltip contentStyle={{background:"#0b1713",border:"1px solid #263d34"}}/></PieChart></ResponsiveContainer><div>{pie.map(x => <span key={x.name}><i style={{background:x.color}}/>{x.name}<b>{x.value}%</b></span>)}</div></div></article>
      <article className="shared-card"><div className="card-head"><div><Network size={18}/><span><small>CROSS-POSITION RISK</small><b>Shared dependencies</b></span></div></div>{[["Ethereum L1","100%","All 3 positions"],["Primary Oracle Network","76%","Atlas + Aave"],["USDC issuer","34%","Aave position"],["Liquid staking validators","24%","Lido position"]].map(([n,v,p]) => <div key={n}><span><b>{n}</b><small>{p}</small></span><strong>{v}</strong></div>)}</article>
    </div>
    <div className="positions-table"><div className="card-head"><div><Wallet size={18}/><span><small>POSITIONS</small><b>Detected yield exposure</b></span></div><AppButton kind="outline"><Plus size={14}/> Audit selected</AppButton></div>{demoComparisons.map((d,i) => <div className="position-row" key={d.name}><input type="checkbox" defaultChecked/><span className="position-logo" style={{background:d.accent}}>{d.name[0]}</span><div><b>{d.name}</b><small>Ethereum · {i===0?"ERC-4626":"Protocol position"}</small></div><span>${[53936,43663,30821][i].toLocaleString()}</span><span>{d.apy}% APY</span><Chip tone={d.risk>60?"amber":"mint"}>{d.risk}/100</Chip><Chip tone={i===0?"mint":"neutral"}>{i===0?"Complete":"Monitor"}</Chip><button><ArrowRight size={16}/></button></div>)}</div>
  </PageShell>;
}

function History({ openReport }: { openReport: () => void }) {
  const rows = [
    ["Atlas USD Real Yield Vault","Atlas Finance","Ethereum","Completed","Elevated","Incentive-dependent","Today","$0"],
    ["Aave USDC Market","Aave","Ethereum","Completed","Moderate","Reasonable","Jul 24","$39"],
    ["Lido stETH","Lido","Ethereum","Completed","Moderate","Strong","Jul 21","$39"],
    ["Curve crvUSD/USDC","Curve","Ethereum","Partially complete","Elevated","Incentive-dependent","Jul 18","$39"],
  ];
  return <PageShell eyebrow="AUDIT HISTORY" title="Every investigation, one evidence trail." subtitle="Reopen, compare, export, or monitor past audits."><div className="history-tools"><div><Search size={16}/><input placeholder="Search audits…"/></div><button>All statuses <ChevronDown size={14}/></button><AppButton><Plus size={15}/> New audit</AppButton></div><div className="history-table"><div className="history-head"><span>Opportunity</span><span>Status</span><span>Risk</span><span>Sustainability</span><span>Created</span><span>Price</span><span /></div>{rows.map((r,i)=><button className="history-row" key={r[0]} onClick={i===0?openReport:undefined}><div><span className="position-logo">{r[0][0]}</span><span><b>{r[0]}</b><small>{r[1]} · {r[2]}</small></span></div><Chip tone={r[3]==="Completed"?"mint":"amber"}>{r[3]}</Chip><Chip tone={r[4]==="Elevated"?"amber":"neutral"}>{r[4]}</Chip><span>{r[5]}</span><span>{r[6]}</span><span>{r[7]}</span><ArrowRight size={15}/></button>)}</div></PageShell>;
}

function Pricing({ navigate, startAudit }: { navigate:(v:View)=>void; startAudit:(v:string)=>void }) {
  return <PageShell eyebrow="SERVICE PRICING" title="Pay for depth, not vague certainty." subtitle="Every tier explains its evidence limits. Paid audits begin only after confirmed test payment."><div className="price-grid full"><PriceCard title="Quick Scan" price="$0" time="~90 sec" features={["Yield-source breakdown","8 core risk categories","Up to 10 public sources","Shareable web report"]} action="Run free demo" onClick={()=>startAudit("")}/><PriceCard title="Full Audit" price="$39" time="8–12 min" featured features={["Complete dependency graph","16-category risk report","Scenario simulation","Contract metadata","Evidence review","PDF export"]} action="Order full audit" onClick={()=>navigate("new")}/><PriceCard title="Portfolio" price="$149" time="15–20 min" features={["Up to 20 positions","Shared dependency analysis","Concentration risk","Portfolio report","30-day monitoring"]} action="Audit portfolio" onClick={()=>navigate("portfolio")}/></div><div className="billing-note"><Receipt size={20}/><div><b>Test payments enabled</b><span>Fiat checkout is abstracted behind a payment provider. Crypto and OKX payment rails can be added without changing order state logic.</span></div></div><Faq /></PageShell>;
}

function Listing({ startAudit }: { startAudit:(v:string)=>void }) {
  return <PageShell eyebrow="OKX.AI SERVICE LISTING" title="RealYield Auditor" subtitle="AI-powered yield source investigation and dependency risk analysis for DeFi and tokenized assets."><div className="listing-layout"><main className="listing-main"><div className="listing-hero"><div className="listing-logo"><Brand compact /></div><div><Chip tone="lime">DeFi research · Risk intelligence</Chip><h2>Know where the yield comes from before you trust the APY.</h2><p>Ten specialist agents trace the return mechanism, identify the payer, map hidden dependencies, stress-test failure scenarios, and compose an evidence-backed deliverable.</p><div className="listing-metrics"><MiniStat value="1,284" label="Orders completed"/><MiniStat value="4.9/5" label="Average rating"/><MiniStat value="96%" label="Positive reviews"/></div></div></div><h3>Example deliverables</h3><div className="deliverables">{["Executive yield sustainability assessment","Visual APY decomposition","Protocol and dependency graph","16 transparent risk categories","Directional scenario simulation","Claim-level evidence ledger"].map(x=><span key={x}><CheckCircle2 size={16}/>{x}</span>)}</div><div className="creator"><div className="creator-avatar">RY</div><div><small>CREATOR</small><h3>RealYield Research Labs</h3><p>Agentic risk intelligence for onchain financial products.</p></div><BadgeCheck size={20}/></div></main><aside className="order-card"><Chip tone="lime">Available now</Chip><div className="order-price"><strong>$39</strong><span>per full audit</span></div><div><span>Delivery</span><b>8–12 minutes</b></div><div><span>Evidence sources</span><b>Up to 50</b></div><div><span>Revisions</span><b>1 included</b></div><AppButton onClick={()=>startAudit("")}>Start service <ArrowRight size={16}/></AppButton><AppButton kind="outline"><Share2 size={15}/> Share on X</AppButton><p>Not financial advice. No transaction access requested.</p></aside></div></PageShell>;
}

function Admin() {
  return <PageShell eyebrow="ADMIN OPERATIONS" title="Service health and revenue" subtitle="Monitor orders, evidence adapters, agent execution, quality flags, and cost."><div className="admin-stats"><MiniStat value="$18,742" label="Gross revenue" note="+18.2% month over month"/><MiniStat value="1,284" label="Delivered orders" note="98.6% completion"/><MiniStat value="4.9 / 5" label="Review score" note="1,116 positive"/><MiniStat value="6m 42s" label="Avg. completion" note="-38 sec this week"/></div><div className="admin-grid"><article className="admin-chart"><div className="card-head"><div><CircleDollarSign size={18}/><span><small>30 DAYS</small><b>Revenue and orders</b></span></div></div><ResponsiveContainer width="100%" height={270}><AreaChart data={riskHistory.map((x,i)=>({...x,revenue:[320,510,440,690,860][i]}))}><CartesianGrid stroke="#1b3029" vertical={false}/><XAxis dataKey="day" stroke="#698078" fontSize={11}/><YAxis stroke="#698078" fontSize={11}/><Tooltip contentStyle={{background:"#0b1713",border:"1px solid #263d34"}}/><Area type="monotone" dataKey="revenue" stroke="#dfff62" fill="#dfff6220" strokeWidth={2}/></AreaChart></ResponsiveContainer></article><article className="source-status"><div className="card-head"><div><Zap size={18}/><span><small>LIVE</small><b>Adapter health</b></span></div></div>{["DefiLlama","CoinGecko","Etherscan","Blockscout","Ethereum RPC","Protocol docs","AI synthesis"].map((x,i)=><div key={x}><span><i className={i===5?"warn":""}/>{x}</span><Chip tone={i===5?"amber":"mint"}>{i===5?"Degraded":"Healthy"}</Chip><small>{[142,188,234,201,97,1840,921][i]} ms</small></div>)}</article></div><div className="ops-table"><div className="card-head"><div><Users size={18}/><span><small>RECENT ACTIVITY</small><b>Orders and audits</b></span></div></div>{[["#RY-1284","Atlas USD Vault","Demo","Delivered","$0"],["#RY-1283","Aave USDC","Full","Delivered","$39"],["#RY-1282","Portfolio · 8 positions","Portfolio","Processing","$149"],["#RY-1281","Ethena USDe","Full","Flagged review","$39"]].map(r=><div key={r[0]}>{r.map((x,i)=><span key={i}>{x}</span>)}</div>)}</div></PageShell>;
}

function PageShell({ eyebrow, title, subtitle, children }: { eyebrow:string; title:string; subtitle:string; children:React.ReactNode }) {
  return <main className="page-shell"><div className="page-intro"><div className="section-kicker">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{children}</main>;
}

function Faq() {
  const [open,setOpen]=useState(0);
  const q=[["Is this financial advice?","No. RealYield provides evidence-backed research and risk explanations, not investment recommendations."],["Is the contract analysis a formal audit?","No. It surfaces metadata and risk signals but does not replace a professional smart-contract audit."],["What if a data source is unavailable?","The adapter reports the failure, lowers confidence and completeness, and avoids inventing missing values."],["Can APY change after the report?","Yes. Yield, token prices, liquidity, utilization, and incentives can change rapidly. Freshness is shown per claim."]];
  return <div className="faq"><div className="section-kicker">FAQ</div>{q.map(([a,b],i)=><button key={a} onClick={()=>setOpen(open===i?-1:i)}><span><b>{a}</b>{open===i&&<p>{b}</p>}</span><ChevronDown size={17} style={{transform:open===i?"rotate(180deg)":""}}/></button>)}</div>;
}

function Disclaimer() {
  return <div className="disclaimer"><ShieldAlert size={18}/><p><b>Research, not a recommendation.</b> Not financial advice. Data may be delayed or incomplete. Smart-contract analysis is not a formal audit. Public documents may contain inaccurate claims. APY can change rapidly. Independently verify contracts and protocol terms. AI-generated conclusions may contain errors.</p></div>;
}

function Footer({ navigate }: { navigate:(v:View)=>void }) {
  return <footer className="footer"><div><Brand/><p>Evidence-backed yield intelligence for a market that moves faster than certainty.</p></div><div><b>Product</b><button onClick={()=>navigate("new")}>New audit</button><button onClick={()=>navigate("compare")}>Compare</button><button onClick={()=>navigate("portfolio")}>Portfolio</button></div><div><b>Service</b><button onClick={()=>navigate("pricing")}>Pricing</button><button onClick={()=>navigate("listing")}>OKX.AI listing</button><button onClick={()=>navigate("admin")}>Admin demo</button></div><div><b>Safety</b><span>Not financial advice</span><span>Methodology v1.0</span><span>Data-source policy</span></div><small>© 2026 RealYield Auditor · Built for OKX.AI Genesis Hackathon</small></footer>;
}

export default function RealYieldApp() {
  const [view, setView] = useState<View>("home");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const syncHash = () => {
      const next = window.location.hash.slice(1) as View;
      if (next) setView(next);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const navigate = (next: View) => { setView(next); setHash(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const startAudit = async (target: string) => {
    setCancelled(false); setProgress(2); navigate("live");
    try {
      const res = await fetch("/api/v1/audits/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target, type: "demo" }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit could not start");
      setReport(data.report);
      let value = 2;
      const timer = window.setInterval(() => {
        value += value < 45 ? 7 : value < 86 ? 5 : 3;
        if (value >= 100) { value = 100; window.clearInterval(timer); }
        setProgress(value);
      }, 520);
    } catch {
      setProgress(0);
    }
  };
  const openReport = () => { if (report) navigate("report"); };

  return <div className="app">
    <Header view={view} navigate={navigate} />
    <AnimatePresence mode="wait">
      <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
        {view === "home" && <Home navigate={navigate} startAudit={startAudit} />}
        {view === "new" && <NewAudit startAudit={startAudit} />}
        {view === "live" && <LiveAudit report={report} progress={progress} cancelled={cancelled} onCancel={() => setCancelled(true)} openReport={openReport} />}
        {view === "report" && report && <Report report={report} navigate={navigate} />}
        {view === "compare" && <Compare />}
        {view === "portfolio" && <Portfolio />}
        {view === "history" && <History openReport={openReport} />}
        {view === "pricing" && <Pricing navigate={navigate} startAudit={startAudit} />}
        {view === "listing" && <Listing startAudit={startAudit} />}
        {view === "admin" && <Admin />}
      </motion.div>
    </AnimatePresence>
  </div>;
}
