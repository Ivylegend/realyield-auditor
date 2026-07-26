export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { rating?: number; auditId?: string };
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 422 });
  }
  return Response.json({ review: { id: crypto.randomUUID(), ...body, status: "published" } }, { status: 201 });
}
