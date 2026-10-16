import { readFileSync } from "node:fs";

/** Dataset snapshot shipped inside the package (`npm run sync` copies it from ../data). */
const dir = new URL("../data/", import.meta.url);
const json = (name: string) => JSON.parse(readFileSync(new URL(name, dir), "utf8"));

export const reference = json("reference-set.json");
export const types = json("types.json");
export const changelog = json("changelog.json");

export const SITE = "https://thefaceanalysis.com";
export const MEASURES = ["composite", "symmetry", "golden", "fwhr", "midface", "pd", "tilt"] as const;
export const GROUPS = ["all", "female", "male"] as const;
export const UNITS: Record<(typeof MEASURES)[number], string> = {
  composite: "points (0-100)", symmetry: "percent", golden: "percent", fwhr: "ratio", midface: "ratio", pd: "mm", tilt: "degrees",
};
