/**
 * Density types and utilities for controlling context output size
 */

export type DensityPreset =
  | "minimal"
  | "sparse"
  | "balanced"
  | "detailed"
  | "thorough";

export type DensityValue = DensityPreset | number;

/**
 * Preset mappings to internal float values (0-1)
 */
const presetValues = {
  minimal: 0.1,
  sparse: 0.3,
  balanced: 0.5,
  detailed: 0.7,
  thorough: 0.9,
} as const satisfies Record<DensityPreset, number>;

/**
 * Convert a DensityValue (preset or number) to a normalized float (0-1)
 */
export const resolveDensity = (value: DensityValue): number => {
  if (typeof value === "string") {
    return presetValues[value];
  }
  return Math.max(0, Math.min(1, value));
};

export interface DensityAdjustments {
  thresholdAdjust: number;
  forgetfulnessBoost: number;
}

/**
 * Calculate threshold and forgetfulness adjustments based on density
 *
 * Lower density → higher threshold (fewer sources) + higher forgetfulness (more compression)
 * Higher density → lower threshold (more sources) + lower forgetfulness (less compression)
 */
export const getDensityAdjustments = (density: number): DensityAdjustments => {
  // Linear interpolation for threshold adjustment
  // density 0.1 → +0.25, density 0.5 → 0, density 0.9 → -0.10
  const thresholdAdjust = (0.5 - density) * 0.625;

  // Forgetfulness boost - more aggressive at low density
  // density 0.1 → +6, density 0.3 → +4, density 0.5 → +2, density >= 0.7 → 0
  let forgetfulnessBoost = 0;
  if (density < 0.2) {
    forgetfulnessBoost = 6;
  } else if (density < 0.4) {
    forgetfulnessBoost = 4;
  } else if (density < 0.6) {
    forgetfulnessBoost = 2;
  }

  return { thresholdAdjust, forgetfulnessBoost };
};
