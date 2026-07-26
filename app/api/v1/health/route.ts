export async function GET() {
  return Response.json({ status: "ok", service: "realyield-web", version: "1.0.0", checks: { api: "healthy", demoAdapter: "healthy" } });
}
