import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getSupabaseImagePatterns, getResumableUploadEndpoint } from "../lib/supabase/urls.mjs";

for (const project of ["qexvohhfowswnryqugvr", "ztpvxikmatppyhoooyam"]) {
  const origin = `https://${project}.supabase.co`;
  assert.equal(getResumableUploadEndpoint(`${origin}/`),
    `https://${project}.storage.supabase.co/storage/v1/upload/resumable`);
  const patterns = getSupabaseImagePatterns(origin);
  assert.equal(patterns.length, 2);
  assert.ok(patterns.every((pattern) => pattern.hostname === `${project}.supabase.co`));
}
assert.deepEqual(getSupabaseImagePatterns(undefined), []);
assert.equal(getResumableUploadEndpoint("http://localhost:54321"),
  "http://localhost:54321/storage/v1/upload/resumable");

// Exercise both route guards without importing any email provider or credentials.
const previousEnvironment = process.env.VERCEL_ENV;
process.env.VERCEL_ENV = "preview";
try {
  for (const route of ["send-inquiry-email", "test-email"]) {
    const source = await readFile(new URL(`../app/api/${route}/route.js`, import.meta.url), "utf8");
    const isolatedSource = source.replace(/^import[\s\S]*?from ["'][^"']+["'];/m,
      "const getResendEmailConfig = () => { throw new Error('Email provider must not be reached'); };");
    const routeModule = await import(`data:text/javascript;base64,${Buffer.from(isolatedSource).toString("base64")}`);
    const response = await routeModule.POST(new Request("http://localhost/test", { method: "POST" }));
    assert.equal(response.status, 403);
    assert.match((await response.json()).error, /disabled in Preview/);
    if (route === "test-email") assert.equal((await (await routeModule.GET()).json()).ready, false);
  }
} finally {
  if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = previousEnvironment;
}
console.log("Passed: deployment-specific image/upload URLs and Preview email guards.");
