// Refreshes ./data from the sibling thefaceanalysis-data checkout when there is one.
// Standalone clones keep the committed snapshot, so `npm run build` works without it.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
const FILES = ["reference-set.json", "types.json", "changelog.json", "face-measurements.csv"];
const from = (f) => new URL(`../../data/${f}`, import.meta.url);
if (existsSync(from(FILES[0]))) {
  mkdirSync(new URL("../data", import.meta.url), { recursive: true });
  for (const f of FILES) copyFileSync(from(f), new URL(`../data/${f}`, import.meta.url));
}
