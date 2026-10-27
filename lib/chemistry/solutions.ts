// ============================================================
// Solution Math & Volumetric Calculations
// ============================================================

export function calculateMolarity(massGrams: number, molarMass: number, volumeML: number): number {
  if (molarMass <= 0 || volumeML <= 0) return 0;
  return Number(((massGrams / molarMass) * (1000 / volumeML)).toFixed(4));
}

export function calculateMassRequired(molarity: number, molarMass: number, volumeML: number): number {
  return Number((molarity * molarMass * (volumeML / 1000)).toFixed(4));
}

export function calculateDilution(m1: number, v1: number, v2: number): number {
  if (v2 <= 0) return 0;
  return Number(((m1 * v1) / v2).toFixed(4));
}

export function calculatePHFromHPlus(hPlusConcentration: number): number {
  if (hPlusConcentration <= 0) return 14;
  const pH = -Math.log10(hPlusConcentration);
  return Number(Math.max(0, Math.min(14, pH)).toFixed(2));
}

export function calculatePHFromOHMinus(ohConcentration: number): number {
  if (ohConcentration <= 0) return 0;
  const pOH = -Math.log10(ohConcentration);
  const pH = 14 - pOH;
  return Number(Math.max(0, Math.min(14, pH)).toFixed(2));
}

export function calculateNeutralizationPH(
  acidVolML: number,
  acidMolarity: number,
  acidBasicity: number,
  baseVolML: number,
  baseMolarity: number,
  baseAcidity: number
): { pH: number; isNeutral: boolean; excess: 'acid' | 'base' | 'none' } {
  const totalVol = acidVolML + baseVolML;
  if (totalVol <= 0) return { pH: 7.0, isNeutral: true, excess: 'none' };

  const eqAcid = (acidVolML * acidMolarity * acidBasicity) / 1000;
  const eqBase = (baseVolML * baseMolarity * baseAcidity) / 1000;

  if (Math.abs(eqAcid - eqBase) < 1e-6) {
    return { pH: 7.0, isNeutral: true, excess: 'none' };
  } else if (eqAcid > eqBase) {
    const excessH = (eqAcid - eqBase) / (totalVol / 1000);
    return {
      pH: calculatePHFromHPlus(excessH),
      isNeutral: false,
      excess: 'acid',
    };
  } else {
    const excessOH = (eqBase - eqAcid) / (totalVol / 1000);
    return {
      pH: calculatePHFromOHMinus(excessOH),
      isNeutral: false,
      excess: 'base',
    };
  }
}
