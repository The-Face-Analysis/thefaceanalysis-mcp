import { reference } from "./data.js";

export type FaceShape = "oval" | "round" | "square" | "heart" | "oblong" | "diamond" | "triangle";

export interface FaceDistances {
  /** Hairline-side top of the forehead surface to the bottom of the chin. */
  faceLength: number;
  /** Widest point across the cheekbones. */
  cheekboneWidth: number;
  /** Width across the temples. */
  foreheadWidth: number;
  /** Width across the jaw. */
  jawWidth: number;
}

/**
 * Same rules, same order and same thresholds as the site's detector
 * (thefaceanalysis.com/face-shape-detector). The thresholds are read from the
 * published dataset (`thresholds.faceShape`), so a methodology change reaches
 * this tool through the data package and not through a second copy of numbers.
 *
 * ORDER MATTERS: a rule placed after a broader one never fires (the site's
 * methodology page explains the history). Do not reorder without re-measuring.
 */
export function classifyFaceShape(d: FaceDistances) {
  const R = reference.thresholds.faceShape as Record<string, number>;
  const ratio = d.faceLength / d.cheekboneWidth;
  const jaw = d.jawWidth / d.cheekboneWidth;
  const forehead = d.foreheadWidth / d.cheekboneWidth;
  const foreheadToJaw = d.foreheadWidth / d.jawWidth;

  let shape: FaceShape = "oval";
  let rule = "none of the other six rules matched";
  if (ratio >= R.oblongRatio) { shape = "oblong"; rule = `length ÷ cheekbone width ≥ ${R.oblongRatio}`; }
  else if (jaw >= R.triangleJaw && foreheadToJaw <= R.triangleForeheadToJaw) { shape = "triangle"; rule = `jaw ÷ cheekbone ≥ ${R.triangleJaw} and forehead ÷ jaw ≤ ${R.triangleForeheadToJaw}`; }
  else if (ratio <= R.roundRatio && jaw >= R.roundJaw) { shape = "round"; rule = `length ÷ cheekbone ≤ ${R.roundRatio} and jaw ÷ cheekbone ≥ ${R.roundJaw}`; }
  else if (jaw >= R.squareJaw && foreheadToJaw <= R.squareForeheadToJaw) { shape = "square"; rule = `jaw ÷ cheekbone ≥ ${R.squareJaw} and forehead ÷ jaw ≤ ${R.squareForeheadToJaw}`; }
  else if (foreheadToJaw >= R.heartForeheadToJaw) { shape = "heart"; rule = `forehead ÷ jaw ≥ ${R.heartForeheadToJaw}`; }
  else if (forehead <= R.diamondForehead && jaw <= R.diamondJaw) { shape = "diamond"; rule = `forehead ÷ cheekbone ≤ ${R.diamondForehead} and jaw ÷ cheekbone ≤ ${R.diamondJaw}`; }

  const round3 = (n: number) => Math.round(n * 1000) / 1000;
  return {
    shape,
    matchedRule: rule,
    ratios: { lengthToCheekbone: round3(ratio), jawToCheekbone: round3(jaw), foreheadToCheekbone: round3(forehead), foreheadToJaw: round3(foreheadToJaw) },
  };
}
