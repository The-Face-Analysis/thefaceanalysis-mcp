// Refreshes ./data from the sibling thefaceanalysis-data checkout when there is one.
// Standalone clones keep the committed snapshot, so `npm run build` works without it.
import { cpSync, existsSync, mkdirSync } from "node:fs";
const source = new URL("../../data/reference-set.json", import.meta.url);
if (existsSync(source)) {
  mkdirSync(new URL("../data", import.meta.url), { recursive: true });
  cpSync(new URL("../../data", import.meta.url), new URL("../data", import.meta.url), { recursive: true, filter: (p) => !/node_modules|\.git/.test(p) });
}
