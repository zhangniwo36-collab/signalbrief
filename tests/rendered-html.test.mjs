import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SignalBrief portfolio product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="en"[^>]*translate="no"/i);
  assert.match(html, /<meta[^>]*name="google"[^>]*content="notranslate"/i);
  assert.match(html, /<title>SignalBrief — Turn documents into clear next moves<\/title>/i);
  assert.match(html, /Turn messy documents into clear next moves/);
  assert.match(html, /Working document/);
  assert.match(html, /Structured intelligence/);
  assert.match(html, /What matters now/);
  assert.match(html, /Risks &amp; dependencies/);
  assert.match(html, /Analyze with AI/);
  assert.match(html, /Run local demo/);
  assert.match(html, /Sample and local brief are already loaded/);
  assert.match(html, /role="status"[^>]*aria-live="polite"/i);
  assert.match(html, /Engineering evidence/);
  assert.match(html, /github\.com\/zhangniwo36-collab\/signalbrief/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("removes disposable starter assets and metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<SignalWorkspace \/>/);
  assert.match(layout, /Turn documents into clear next moves/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});
