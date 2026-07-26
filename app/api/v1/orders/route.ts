export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { tier?: string; coupon?: string };
  const tier = ["quick", "full", "portfolio"].includes(body.tier ?? "") ? body.tier! : "full";
  const price = tier === "quick" ? 0 : tier === "portfolio" ? 149 : 39;
  return Response.json({
    order: { id: crypto.randomUUID(), tier, price, currency: "USD", status: price === 0 ? "PAID" : "PAYMENT_PENDING" },
    checkoutMode: "test",
  }, { status: 201 });
}
