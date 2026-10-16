export interface Distribution { n: number; p10: number; p25: number; median: number; p75: number; p90: number; min: number; max: number }
export type Measure = "composite" | "symmetry" | "golden" | "fwhr" | "midface" | "pd" | "tilt";
export type Group = "all" | "female" | "male";
export interface ReferenceSet {
  generatedAt: string; name: string; page: string; citeAs: string;
  license: { name: string; url: string };
  methodology: { url: string; lastChanged: string };
  sample: { n: number; female: number; male: number };
  thresholds: Record<string, unknown>;
  validity: unknown;
  measurements: { engineDate: string } & Record<Measure, Record<Group, Distribution>>;
  [k: string]: unknown;
}
export interface FaceType { slug: string; name: string; page: string; definition: string; referenceCount: number | null; referenceShare: number | null; [k: string]: unknown }
export interface Types { categories: Record<"face" | "eye" | "lip" | "nose", { hub: string; types: FaceType[] }>; [k: string]: unknown }
export interface Changelog { entries: unknown[]; [k: string]: unknown }
export const referenceSet: ReferenceSet;
export const types: Types;
export const changelog: Changelog;
export function median(measure: Measure, group?: Group): number;
