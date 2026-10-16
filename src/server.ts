import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { classifyFaceShape } from "./classify.js";
import { GROUPS, MEASURES, SITE, UNITS, changelog, reference, types } from "./data.js";

const text = (value: unknown) => ({ content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
const fail = (message: string) => ({ isError: true, content: [{ type: "text" as const, text: message }] });

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

/**
 * Every tool is read-only and takes no photo. Measuring a photo happens in the
 * visitor's browser at thefaceanalysis.com (or in the embeddable widget), and
 * `get_embed_snippet` hands the assistant the code to put that on a page.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: "thefaceanalysis", version: "0.1.0" });

  server.registerTool(
    "get_reference_statistics",
    {
      title: "Face measurement statistics",
      description: `Percentiles (p10, p25, median, p75, p90, min, max) of facial measurements from ${reference.sample.n} adult faces (${reference.sample.female} women, ${reference.sample.male} men) of the Face Research Lab London Set, measured with a 478-point MediaPipe landmarker. Measures: composite score, symmetry, golden ratio fit, fWHR, midface ratio, pupillary distance, canthal tilt. Aggregates only; one research set photographed in one city, so these describe these faces, not a population.`,
      inputSchema: {
        measure: z.enum(MEASURES).optional().describe("One measure. Omit for all."),
        group: z.enum(GROUPS).optional().describe("all, female or male. Omit for all three."),
      },
      annotations: READ_ONLY,
    },
    async ({ measure, group }) => {
      const picked = measure ? [measure] : [...MEASURES];
      const out = Object.fromEntries(
        picked.map((m) => [m, { unit: UNITS[m], ...(group ? { [group]: reference.measurements[m][group] } : reference.measurements[m]) }]),
      );
      return text({ n: reference.sample.n, measuredOn: reference.measurements.engineDate, statistics: out, citeAs: reference.citeAs, license: reference.license, page: reference.page });
    },
  );

  server.registerTool(
    "list_face_types",
    {
      title: "List face, eye, lip and nose types",
      description: "Lists the types the site's detectors use, with slug, name, page URL and how many of the 102 reference faces each type covered. The split shows how the detector divides these faces, not how common a type is in a population.",
      inputSchema: { category: z.enum(["face", "eye", "lip", "nose"]).optional().describe("Omit for all four categories.") },
      annotations: READ_ONLY,
    },
    async ({ category }) => {
      const cats = types.categories as Record<string, { hub: string; types: { slug: string; name: string; page: string; referenceCount: number | null; referenceShare: number | null }[] }>;
      const keys = category ? [category] : Object.keys(cats);
      return text(Object.fromEntries(keys.map((k) => [k, { hub: cats[k].hub, types: cats[k].types.map(({ slug, name, page, referenceCount, referenceShare }) => ({ slug, name, page, referenceCount, referenceShare })) }])));
    },
  );

  server.registerTool(
    "get_face_type",
    {
      title: "Describe one face, eye, lip or nose type",
      description: "Definition and how the type is measured from a front photo (the exact threshold rule), plus its page URL. Example: category 'face', slug 'oval'.",
      inputSchema: { category: z.enum(["face", "eye", "lip", "nose"]), slug: z.string().describe("e.g. oval, heart, hooded, upturned") },
      annotations: READ_ONLY,
    },
    async ({ category, slug }) => {
      const cats = types.categories as Record<string, { types: { slug: string }[] }>;
      const hit = cats[category].types.find((t) => t.slug === slug.toLowerCase());
      if (!hit) return fail(`No ${category} type "${slug}". Valid: ${cats[category].types.map((t) => t.slug).join(", ")}.`);
      return text(hit);
    },
  );

  server.registerTool(
    "classify_face_shape",
    {
      title: "Classify a face shape from four measurements",
      description: "Runs the same seven-rule face shape classifier as thefaceanalysis.com/face-shape-detector on four distances (any consistent unit: pixels, mm or landmark units). Returns the shape, the rule that matched and the four ratios. It does not look at photos: to measure a photo, use the widget (get_embed_snippet) or the site. Borderline faces can flip between two shapes; no accuracy figure is claimed because the reference set has no labelled face types.",
      inputSchema: {
        face_length: z.number().positive().describe("Top of the forehead surface to the bottom of the chin"),
        cheekbone_width: z.number().positive().describe("Widest point across the cheekbones"),
        forehead_width: z.number().positive().describe("Width across the temples"),
        jaw_width: z.number().positive().describe("Width across the jaw"),
      },
      annotations: READ_ONLY,
    },
    async (a) => text({ ...classifyFaceShape({ faceLength: a.face_length, cheekboneWidth: a.cheekbone_width, foreheadWidth: a.forehead_width, jawWidth: a.jaw_width }), method: `${SITE}/methodology`, detector: `${SITE}/face-shape-detector` }),
  );

  server.registerTool(
    "get_methodology",
    {
      title: "Methodology, thresholds and validity",
      description: "How the numbers are made: the landmark model, every classification threshold, how the 1-10 score is built, and how it correlated with 2,513 human raters on the same faces (it did not predict them). Includes the method change history.",
      inputSchema: { include_changelog: z.boolean().optional().describe("Also return the dated change history.") },
      annotations: READ_ONLY,
    },
    async ({ include_changelog }) =>
      text({
        methodology: reference.methodology,
        engine: reference.engine,
        score: reference.score,
        thresholds: reference.thresholds,
        validity: reference.validity,
        notes: reference.notes,
        ...(include_changelog ? { changelog: changelog.entries } : {}),
      }),
  );

  server.registerTool(
    "get_citation",
    {
      title: "How to cite the data",
      description: "Citation text, license (CC BY 4.0 for the aggregate numbers) and the source photo set. Use when quoting a number.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => text({ citeAs: reference.citeAs, page: reference.page, license: reference.license, source: reference.source, downloads: { json: `${SITE}/data/reference-set.json`, csv: `${SITE}/data/face-measurements.csv`, types: `${SITE}/data/types.json` } }),
  );

  server.registerTool(
    "get_embed_snippet",
    {
      title: "Embed code for the face shape widget",
      description: "HTML a website owner can paste to add the free face shape finder (it measures the visitor's photo in their browser, no sign-up). Includes the visible credit link the terms ask for.",
      inputSchema: { size: z.enum(["compact", "standard", "wide"]).optional().describe("compact 360px, standard 480px, wide 720px") },
      annotations: READ_ONLY,
    },
    async ({ size }) => text({
      snippet: `<div data-tfa-widget="face-shape" data-size="${size ?? "standard"}"></div>\n<script async src="${SITE}/embed.js"></script>`,
      terms: "Free to use, including commercially. Keep the credit link visible. Do not present the reading as a medical or cosmetic diagnosis.",
      page: `${SITE}/embed`,
    }),
  );

  return server;
}
