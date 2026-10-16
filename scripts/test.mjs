// Protocol-level test: spawns the real server over stdio and over HTTP and calls every tool.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const body = (r) => JSON.parse(r.content[0].text);

async function exercise(client, label) {
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["classify_face_shape", "get_citation", "get_embed_snippet", "get_face_type", "get_methodology", "get_reference_statistics", "list_face_types"]);

  const fwhr = body(await client.callTool({ name: "get_reference_statistics", arguments: { measure: "fwhr", group: "all" } }));
  assert.equal(fwhr.statistics.fwhr.all.median, 1.78);
  assert.equal(fwhr.n, 102);

  const faces = body(await client.callTool({ name: "list_face_types", arguments: { category: "face" } }));
  assert.equal(faces.face.types.length, 7);

  const oval = body(await client.callTool({ name: "get_face_type", arguments: { category: "face", slug: "oval" } }));
  assert.match(oval.definition, /oval/i);
  const bad = await client.callTool({ name: "get_face_type", arguments: { category: "face", slug: "nope" } });
  assert.equal(bad.isError, true);

  const shape = body(await client.callTool({ name: "classify_face_shape", arguments: { face_length: 1.3, cheekbone_width: 1, forehead_width: 0.9, jaw_width: 0.8 } }));
  assert.equal(shape.shape, "oblong");

  const meth = body(await client.callTool({ name: "get_methodology", arguments: { include_changelog: true } }));
  assert.ok(meth.thresholds.faceShape.oblongRatio && meth.changelog.length > 0);

  const cite = body(await client.callTool({ name: "get_citation", arguments: {} }));
  assert.equal(cite.license.name, "CC BY 4.0");

  const emb = body(await client.callTool({ name: "get_embed_snippet", arguments: { size: "wide" } }));
  assert.match(emb.snippet, /data-size="wide"/);
  console.log(`  ✓ ${label}: ${names.length} tools, statistics, types, classifier, methodology, citation, embed`);
}

// stdio
{
  const client = new Client({ name: "test", version: "0" });
  await client.connect(new StdioClientTransport({ command: "node", args: ["dist/stdio.js"] }));
  await exercise(client, "stdio");
  await client.close();
}
// hosted HTTP
{
  const port = 8791;
  const srv = spawn("node", ["dist/http.js"], { env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "ignore", "pipe"] });
  await new Promise((ok) => srv.stderr.once("data", ok));
  const client = new Client({ name: "test", version: "0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://localhost:${port}/mcp`)));
  await exercise(client, "http");
  await client.close();
  const get = await fetch(`http://localhost:${port}/mcp`);
  assert.equal(get.status, 405);
  srv.kill();
}
console.log("all good");
