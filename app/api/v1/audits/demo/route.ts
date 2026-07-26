import { createDemoReport } from "../../../../../lib/demo-report";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { target?: string; type?: string };
  const target = (body.target ?? "").trim();
  if (target.length > 500) return Response.json({ error: "Target is too long." }, { status: 422 });
  const report = createDemoReport();
  return Response.json({
    auditId: report.id,
    status: "QUEUED",
    target: target || "Atlas USD Real Yield Vault",
    report,
    stages: [
      "DISCOVERING", "FETCHING_ONCHAIN_DATA", "FETCHING_MARKET_DATA",
      "FETCHING_DOCUMENTATION", "ANALYZING_YIELD", "MAPPING_DEPENDENCIES",
      "SCORING_RISKS", "RUNNING_SCENARIOS", "REVIEWING_EVIDENCE",
      "GENERATING_REPORT", "COMPLETED",
    ],
  }, { status: 202, headers: { "cache-control": "no-store" } });
}
