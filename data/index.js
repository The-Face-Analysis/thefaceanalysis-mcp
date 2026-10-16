import referenceSet from "./reference-set.json" with { type: "json" };
import types from "./types.json" with { type: "json" };
import changelog from "./changelog.json" with { type: "json" };

export { referenceSet, types, changelog };

/** Median of one measurement, e.g. median("fwhr") or median("midface", "male"). */
export function median(measure, group = "all") {
  const m = referenceSet.measurements[measure]?.[group];
  if (!m) throw new Error(`Unknown measure/group: ${measure}/${group}`);
  return m.median;
}
