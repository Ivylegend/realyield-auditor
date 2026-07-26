import assert from "node:assert/strict";
import test from "node:test";

async function worker() {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(url.href)).default;
}
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("server-renders the RealYield application", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), env, ctx);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /RealYield Auditor/i);
  assert.match(html, /Understand the yield before the APY/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("health endpoint is available", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/api/v1/health"), env, ctx);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
});

test("demo audit returns server-owned fixture", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/api/v1/audits/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target: "Atlas USD" }) }), env, ctx);
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.report.fictional, true);
  assert.equal(body.report.advertisedApy, 18.4);
  assert.equal(body.report.durableApy, 6.9);
  assert.equal(body.stages.at(-1), "COMPLETED");
});
