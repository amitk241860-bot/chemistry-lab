// ============================================================
// ChemMCP Chemistry Intelligence Engine
// Inspired by OSU-NLP-Group/ChemMCP
// Covers Molecular Weight, GHS Safety Hazards, and Reaction Prediction
// ============================================================

export interface ChemicalCompoundInfo {
  formula: string;
  name: string;
  iupacName?: string;
  smiles?: string;
  casNumber?: string;
  molecularWeight: number;
  density?: number; // g/mL
  ghsSignal?: 'Danger' | 'Warning' | 'None';
  ghsPictograms: ('flammable' | 'corrosive' | 'toxic' | 'oxidizer' | 'health-hazard' | 'environment')[];
  hazardStatements: string[];
  ppeRequirements: ('gloves' | 'goggles' | 'fume-hood' | 'lab-coat')[];
  operatorSafetySummary: string;
  solubilityWater?: string;
}

export interface PredictedReactionOutcome {
  equation: string;
  reactionType: 'precipitation' | 'neutralization' | 'complexation' | 'redox' | 'gas-evolution' | 'thermal' | 'no-reaction';
  products: {
    formula: string;
    name: string;
    state: 'aq' | 's' | 'g' | 'l';
    color: string;
    precipitateColor?: string;
  }[];
  deltaH: number; // kJ/mol (negative = exothermic, positive = endothermic)
  tempChangeExpected: number; // estimated Delta T in Celsius for 50mL 0.1M
  visualObservation: string;
  isGasEvolving: boolean;
  gasType?: 'H2' | 'O2' | 'CO2' | 'NH3';
  isPrecipitateForming: boolean;
  precipitateColor?: string;
  targetPH?: number;
}

// Atomic weights lookup (IUPAC standard)
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  He: 4.0026,
  Li: 6.94,
  Be: 9.0122,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Ne: 20.18,
  Na: 22.99,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Sc: 44.956,
  Ti: 47.867,
  V: 50.942,
  Cr: 51.996,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,
  Br: 79.904,
  Ag: 107.87,
  I: 126.9,
  Ba: 137.33,
  Pb: 207.2,
};

// Parse a chemical formula into element counts (e.g., "CuSO4" -> { Cu: 1, S: 1, O: 4 })
export function parseFormula(formula: string): Record<string, number> {
  const result: Record<string, number> = {};
  // Handle simple formulas and parentheses e.g. Ba(NO3)2
  const cleaned = formula.replace(/\s+/g, '');
  
  // Expand parentheses if present e.g. Ba(NO3)2 -> BaN2O6
  const expanded = cleaned.replace(/\(([^)]+)\)(\d+)/g, (_, group, count) => {
    const factor = parseInt(count, 10);
    return group.replace(/([A-Z][a-z]*)(\d*)/g, (__: string, elem: string, c: string) => {
      const n = (parseInt(c, 10) || 1) * factor;
      return elem + n;
    });
  });

  const regex = /([A-Z][a-z]*)(\d*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(expanded)) !== null) {
    if (match[0].length === 0) break;
    const elem = match[1];
    const count = parseInt(match[2] || '1', 10);
    result[elem] = (result[elem] || 0) + count;
  }
  return result;
}

// Calculate molecular weight from formula
export function calculateMolecularWeight(formula: string): number {
  try {
    const parsed = parseFormula(formula);
    let total = 0;
    for (const [elem, count] of Object.entries(parsed)) {
      if (ATOMIC_WEIGHTS[elem]) {
        total += ATOMIC_WEIGHTS[elem] * count;
      }
    }
    return Number(total.toFixed(3));
  } catch {
    return 0;
  }
}

// Extensive ChemMCP Compound Knowledge Base
export const COMPOUND_DATABASE: Record<string, ChemicalCompoundInfo> = {
  H2O: {
    formula: 'H2O',
    name: 'Distilled Water',
    iupacName: 'Oxidane',
    smiles: 'O',
    casNumber: '7732-18-5',
    molecularWeight: 18.015,
    density: 1.0,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Not a hazardous substance according to GHS.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Safe neutral solvent. Non-toxic, non-flammable.',
    solubilityWater: 'Miscible in all proportions',
  },
  HCl: {
    formula: 'HCl',
    name: 'Hydrochloric Acid',
    iupacName: 'Chlorane',
    smiles: 'Cl',
    casNumber: '7647-01-0',
    molecularWeight: 36.46,
    density: 1.18,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'toxic'],
    hazardStatements: [
      'H314: Causes severe skin burns and eye damage.',
      'H335: May cause respiratory irritation.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Strong volatile acid. Vapors irritate respiratory tract. Causes severe burns upon contact.',
    solubilityWater: 'Highly soluble exothermic dissolution',
  },
  NaOH: {
    formula: 'NaOH',
    name: 'Sodium Hydroxide',
    iupacName: 'Sodium hydroxide',
    smiles: '[Na+].[OH-]',
    casNumber: '1310-73-2',
    molecularWeight: 39.997,
    density: 2.13,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive'],
    hazardStatements: [
      'H314: Causes severe skin burns and eye damage.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Extremely caustic base. Saponifies skin fats rapidly causing slippery chemical burns.',
    solubilityWater: '1090 g/L at 20°C',
  },
  AgNO3: {
    formula: 'AgNO3',
    name: 'Silver Nitrate',
    iupacName: 'Silver(1+) nitrate',
    smiles: '[Ag+].[O-][N+](=O)[O-]',
    casNumber: '7761-88-8',
    molecularWeight: 169.87,
    density: 4.35,
    ghsSignal: 'Danger',
    ghsPictograms: ['oxidizer', 'corrosive', 'environment'],
    hazardStatements: [
      'H272: May intensify fire; oxidizer.',
      'H314: Causes severe skin burns and eye damage.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Light-sensitive oxidizer. Stains skin with dark reduced silver deposits. Avoid release into environment.',
    solubilityWater: '2160 g/L at 20°C',
  },
  NaCl: {
    formula: 'NaCl',
    name: 'Sodium Chloride',
    iupacName: 'Sodium chloride',
    smiles: '[Na+].[Cl-]',
    casNumber: '7647-14-5',
    molecularWeight: 58.44,
    density: 2.16,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Non-hazardous under typical laboratory conditions.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Standard non-hazardous table salt.',
    solubilityWater: '360 g/L at 20°C',
  },
  BaCl2: {
    formula: 'BaCl2',
    name: 'Barium Chloride',
    iupacName: 'Barium dichloride',
    smiles: '[Cl-].[Ba+2].[Cl-]',
    casNumber: '10361-37-2',
    molecularWeight: 208.23,
    density: 3.86,
    ghsSignal: 'Danger',
    ghsPictograms: ['toxic'],
    hazardStatements: [
      'H301: Toxic if swallowed.',
      'H332: Harmful if inhaled.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Toxic soluble barium salt. Do not ingest; wash hands immediately.',
    solubilityWater: '375 g/L at 20°C',
  },
  Na2SO4: {
    formula: 'Na2SO4',
    name: 'Sodium Sulfate',
    iupacName: 'Disodium sulfate',
    smiles: '[Na+].[Na+].[O-]S(=O)(=O)[O-]',
    casNumber: '7757-82-6',
    molecularWeight: 142.04,
    density: 2.66,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Not classified as hazardous.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Inert neutral sulfate salt. Low toxicity.',
    solubilityWater: '195 g/L at 20°C',
  },
  CuSO4: {
    formula: 'CuSO4',
    name: 'Copper(II) Sulfate',
    iupacName: 'Copper(2+) sulfate',
    smiles: '[Cu+2].[O-]S(=O)(=O)[O-]',
    casNumber: '7758-98-7',
    molecularWeight: 159.61,
    density: 3.6,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic', 'environment'],
    hazardStatements: [
      'H302: Harmful if swallowed.',
      'H315: Causes skin irritation.',
      'H319: Causes serious eye irritation.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Vibrant blue crystalline salt. Irritating to eyes; toxic to aquatic organisms.',
    solubilityWater: '320 g/L at 20°C',
  },
  KI: {
    formula: 'KI',
    name: 'Potassium Iodide',
    iupacName: 'Potassium iodide',
    smiles: '[K+].[I-]',
    casNumber: '7681-11-0',
    molecularWeight: 166.0,
    density: 3.12,
    ghsSignal: 'Warning',
    ghsPictograms: ['health-hazard'],
    hazardStatements: ['H372: Causes damage to thyroid gland through prolonged or repeated exposure.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Oxidizes slowly in air to elemental yellow/brown iodine.',
    solubilityWater: '1400 g/L at 20°C',
  },
  Pb_NO3_2: {
    formula: 'Pb(NO3)2',
    name: 'Lead(II) Nitrate',
    iupacName: 'Lead(2+) dinitrate',
    smiles: '[Pb+2].[O-][N+](=O)[O-].[O-][N+](=O)[O-]',
    casNumber: '10099-74-8',
    molecularWeight: 331.2,
    density: 4.53,
    ghsSignal: 'Danger',
    ghsPictograms: ['toxic', 'health-hazard', 'environment', 'oxidizer'],
    hazardStatements: [
      'H360: May damage fertility or the unborn child.',
      'H302+H332: Harmful if swallowed or inhaled.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Toxic cumulative heavy metal compound. Must be handled inside fume hood with nitrile gloves.',
    solubilityWater: '520 g/L at 20°C',
  },
  FeCl3: {
    formula: 'FeCl3',
    name: 'Iron(III) Chloride',
    iupacName: 'Iron trichloride',
    smiles: 'Cl[Fe](Cl)Cl',
    casNumber: '7705-08-0',
    molecularWeight: 162.2,
    density: 2.9,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'toxic'],
    hazardStatements: [
      'H302: Harmful if swallowed.',
      'H314: Causes severe skin burns and eye damage.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Yellow-brown acidic solution. Corrosive and strongly staining.',
    solubilityWater: '912 g/L at 20°C',
  },
  KSCN: {
    formula: 'KSCN',
    name: 'Potassium Thiocyanate',
    iupacName: 'Potassium thiocyanate',
    smiles: '[K+].[S-]C#N',
    casNumber: '333-20-0',
    molecularWeight: 97.18,
    density: 1.89,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic'],
    hazardStatements: [
      'H302+H312+H332: Harmful if swallowed, in contact with skin or if inhaled.',
      'H412: Harmful to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Reagent used for detecting Fe(3+). Contact with acids liberates highly toxic gas.',
    solubilityWater: '2170 g/L at 20°C',
  },
  C2H5OH: {
    formula: 'C2H5OH',
    name: 'Ethanol (99%)',
    iupacName: 'Ethanol',
    smiles: 'CCO',
    casNumber: '64-17-5',
    molecularWeight: 46.07,
    density: 0.789,
    ghsSignal: 'Danger',
    ghsPictograms: ['flammable'],
    hazardStatements: [
      'H225: Highly flammable liquid and vapor.',
      'H319: Causes serious eye irritation.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Volatile, highly flammable liquid. Keep away from Bunsen burner open flames.',
    solubilityWater: 'Miscible in all proportions',
  },
};

// ChemMCP Forward Reaction Predictor
export function predictReaction(reactants: string[]): PredictedReactionOutcome {
  const norm = reactants.map((r) => r.trim());

  // 1. AgNO3 + NaCl -> AgCl(s) (White Curd Precipitate)
  if (
    (norm.includes('AgNO3') || norm.some((r) => r.includes('Silver Nitrate'))) &&
    (norm.includes('NaCl') || norm.some((r) => r.includes('Sodium Chloride')))
  ) {
    return {
      equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'AgCl', name: 'Silver Chloride', state: 's', color: '#f8fafc', precipitateColor: '#ffffff' },
        { formula: 'NaNO3', name: 'Sodium Nitrate', state: 'aq', color: '#e0f2fe' },
      ],
      deltaH: -65.5,
      tempChangeExpected: 0.8,
      visualObservation: 'Instant formation of a dense, white curdy precipitate of insoluble Silver Chloride AgCl(s). Solution turns milky white.',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#ffffff',
      targetPH: 6.8,
    };
  }

  // 2. BaCl2 + Na2SO4 -> BaSO4(s) (Heavy White Precipitate)
  if (
    (norm.includes('BaCl2') || norm.some((r) => r.includes('Barium Chloride'))) &&
    (norm.includes('Na2SO4') || norm.some((r) => r.includes('Sodium Sulfate')))
  ) {
    return {
      equation: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'BaSO4', name: 'Barium Sulfate', state: 's', color: '#f8fafc', precipitateColor: '#ffffff' },
        { formula: 'NaCl', name: 'Sodium Chloride', state: 'aq', color: '#e0f2fe' },
      ],
      deltaH: -26.3,
      tempChangeExpected: 0.4,
      visualObservation: 'Formation of a fine, chalky white precipitate of Barium Sulfate BaSO₄(s). Solution becomes opaque white.',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#ffffff',
      targetPH: 7.0,
    };
  }

  // 3. Pb(NO3)2 + 2KI -> PbI2(s) (Golden Yellow Precipitate / Golden Rain)
  if (
    (norm.includes('Pb(NO3)2') || norm.some((r) => r.includes('Lead'))) &&
    (norm.includes('KI') || norm.some((r) => r.includes('Potassium Iodide')))
  ) {
    return {
      equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'PbI2', name: 'Lead(II) Iodide', state: 's', color: '#facc15', precipitateColor: '#eab308' },
        { formula: 'KNO3', name: 'Potassium Nitrate', state: 'aq', color: '#fef08a' },
      ],
      deltaH: -61.2,
      tempChangeExpected: 0.6,
      visualObservation: 'Spectacular bright golden-yellow precipitate of Lead(II) Iodide PbI₂(s) crystallizes immediately upon contact.',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#eab308',
      targetPH: 6.5,
    };
  }

  // 4. FeCl3 + KSCN -> [Fe(SCN)]2+ (Blood Red Complex)
  if (
    (norm.includes('FeCl3') || norm.some((r) => r.includes('Iron(III)'))) &&
    (norm.includes('KSCN') || norm.some((r) => r.includes('Thiocyanate')))
  ) {
    return {
      equation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq) (Blood Red Complex)',
      reactionType: 'complexation',
      products: [
        { formula: '[Fe(SCN)]2+', name: 'Iron(III) Thiocyanate Complex', state: 'aq', color: '#991b1b' },
      ],
      deltaH: -18.4,
      tempChangeExpected: 0.3,
      visualObservation: 'Rapid, dramatic color shift from faint pale amber to intense deep blood-red [Fe(SCN)]²⁺ complex equilibrium.',
      isGasEvolving: false,
      isPrecipitateForming: false,
      targetPH: 2.2,
    };
  }

  // 5. Strong Acid + Strong Base Neutralization (HCl + NaOH)
  if (
    (norm.includes('HCl') || norm.some((r) => r.includes('Hydrochloric'))) &&
    (norm.includes('NaOH') || norm.some((r) => r.includes('Sodium Hydroxide')))
  ) {
    return {
      equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Heat',
      reactionType: 'neutralization',
      products: [
        { formula: 'NaCl', name: 'Sodium Chloride', state: 'aq', color: '#38bdf8' },
        { formula: 'H2O', name: 'Water', state: 'l', color: '#38bdf8' },
      ],
      deltaH: -57.3,
      tempChangeExpected: 6.8, // noticeably warm
      visualObservation: 'Rapid exothermic neutralization. Temperature rises sharply (~+6.8°C). Solution reaches neutral pH 7.0.',
      isGasEvolving: false,
      isPrecipitateForming: false,
      targetPH: 7.0,
    };
  }

  // 6. Zinc + Hydrochloric Acid -> Hydrogen Gas Evolution
  if (
    (norm.includes('Zn') || norm.some((r) => r.includes('Zinc'))) &&
    (norm.includes('HCl') || norm.some((r) => r.includes('Hydrochloric')))
  ) {
    return {
      equation: 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
      reactionType: 'gas-evolution',
      products: [
        { formula: 'ZnCl2', name: 'Zinc Chloride', state: 'aq', color: '#bae6fd' },
        { formula: 'H2', name: 'Hydrogen Gas', state: 'g', color: '#ffffff' },
      ],
      deltaH: -153.9,
      tempChangeExpected: 4.5,
      visualObservation: 'Vigorous effervescence! Continuous stream of Hydrogen gas bubbles H₂(g) rapidly evoluting from metal surface.',
      isGasEvolving: true,
      gasType: 'H2',
      isPrecipitateForming: false,
      targetPH: 3.5,
    };
  }

  // 7. Copper(II) Sulfate + Sodium Hydroxide -> Cu(OH)2(s) (Pale Blue Gelatinous Precipitate)
  if (
    (norm.includes('CuSO4') || norm.some((r) => r.includes('Copper'))) &&
    (norm.includes('NaOH') || norm.some((r) => r.includes('Sodium Hydroxide')))
  ) {
    return {
      equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'Cu(OH)2', name: 'Copper(II) Hydroxide', state: 's', color: '#0284c7', precipitateColor: '#38bdf8' },
        { formula: 'Na2SO4', name: 'Sodium Sulfate', state: 'aq', color: '#f0f9ff' },
      ],
      deltaH: -54.2,
      tempChangeExpected: 1.2,
      visualObservation: 'Instant formation of a thick, light sky-blue gelatinous precipitate of Copper(II) Hydroxide Cu(OH)₂(s).',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#38bdf8',
      targetPH: 9.5,
    };
  }

  // 8. Iron(III) Chloride + Sodium Hydroxide -> Fe(OH)3(s) (Reddish-Brown Precipitate)
  if (
    (norm.includes('FeCl3') || norm.some((r) => r.includes('Iron(III)'))) &&
    (norm.includes('NaOH') || norm.some((r) => r.includes('Sodium Hydroxide')))
  ) {
    return {
      equation: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s)↓ + 3NaCl(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'Fe(OH)3', name: 'Iron(III) Hydroxide', state: 's', color: '#7c2d12', precipitateColor: '#9a3412' },
        { formula: 'NaCl', name: 'Sodium Chloride', state: 'aq', color: '#e0f2fe' },
      ],
      deltaH: -88.4,
      tempChangeExpected: 1.8,
      visualObservation: 'Rapid precipitation of a flocculent reddish-brown rust precipitate of Iron(III) Hydroxide Fe(OH)₃(s).',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#9a3412',
      targetPH: 9.0,
    };
  }

  // 9. Iron(II) Sulfate + Sodium Hydroxide -> Fe(OH)2(s) (Dirty Green Precipitate)
  if (
    (norm.includes('FeSO4') || norm.some((r) => r.includes('Iron(II)'))) &&
    (norm.includes('NaOH') || norm.some((r) => r.includes('Sodium Hydroxide')))
  ) {
    return {
      equation: 'FeSO₄(aq) + 2NaOH(aq) → Fe(OH)₂(s)↓ + Na₂SO₄(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'Fe(OH)2', name: 'Iron(II) Hydroxide', state: 's', color: '#166534', precipitateColor: '#15803d' },
        { formula: 'Na2SO4', name: 'Sodium Sulfate', state: 'aq', color: '#f0f9ff' },
      ],
      deltaH: -47.1,
      tempChangeExpected: 1.0,
      visualObservation: 'Formation of a characteristic gelatinous dirty-green precipitate of Iron(II) Hydroxide Fe(OH)₂(s).',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#15803d',
      targetPH: 9.2,
    };
  }

  // 10. Silver Nitrate + Potassium Iodide -> AgI(s) (Pale Yellow Precipitate)
  if (
    (norm.includes('AgNO3') || norm.some((r) => r.includes('Silver'))) &&
    (norm.includes('KI') || norm.some((r) => r.includes('Potassium Iodide')))
  ) {
    return {
      equation: 'AgNO₃(aq) + KI(aq) → AgI(s)↓ + KNO₃(aq)',
      reactionType: 'precipitation',
      products: [
        { formula: 'AgI', name: 'Silver Iodide', state: 's', color: '#fef08a', precipitateColor: '#fde047' },
        { formula: 'KNO3', name: 'Potassium Nitrate', state: 'aq', color: '#f8fafc' },
      ],
      deltaH: -112.5,
      tempChangeExpected: 1.4,
      visualObservation: 'Instant formation of a bright canary pale-yellow curdy precipitate of insoluble Silver Iodide AgI(s).',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#fde047',
      targetPH: 6.8,
    };
  }

  // 11. Sulfuric Acid + Sodium Hydroxide -> Na2SO4 + 2H2O (Neutralization)
  if (
    (norm.includes('H2SO4') || norm.some((r) => r.includes('Sulfuric'))) &&
    (norm.includes('NaOH') || norm.some((r) => r.includes('Sodium Hydroxide')))
  ) {
    return {
      equation: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l) + Heat',
      reactionType: 'neutralization',
      products: [
        { formula: 'Na2SO4', name: 'Sodium Sulfate', state: 'aq', color: '#38bdf8' },
        { formula: 'H2O', name: 'Water', state: 'l', color: '#38bdf8' },
      ],
      deltaH: -114.6,
      tempChangeExpected: 8.5,
      visualObservation: 'Strong exothermic neutralization! Vessel becomes very warm (~+8.5°C rise). Neutralization reaches pH 7.0.',
      isGasEvolving: false,
      isPrecipitateForming: false,
      targetPH: 7.0,
    };
  }

  // 12. Single Displacement: Iron + Copper(II) Sulfate -> FeSO4 + Cu(s)
  if (
    (norm.includes('Fe') || norm.some((r) => r.includes('Iron'))) &&
    (norm.includes('CuSO4') || norm.some((r) => r.includes('Copper')))
  ) {
    return {
      equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓',
      reactionType: 'redox',
      products: [
        { formula: 'FeSO4', name: 'Iron(II) Sulfate', state: 'aq', color: '#86efac' },
        { formula: 'Cu', name: 'Copper Metal Deposit', state: 's', color: '#b45309', precipitateColor: '#b45309' },
      ],
      deltaH: -152.0,
      tempChangeExpected: 3.2,
      visualObservation: 'Single displacement: Blue solution fades to pale green FeSO₄ as shiny reddish-brown elemental copper deposits coat the metal.',
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#b45309',
      targetPH: 5.5,
    };
  }

  // Default No Reaction
  return {
    equation: `${reactants.join(' + ')} → Homogeneous Mixture (No chemical reaction)`,
    reactionType: 'no-reaction',
    products: [],
    deltaH: 0,
    tempChangeExpected: 0,
    visualObservation: 'The solutions mix homogeneously without noticeable temperature shift, color change, or precipitation.',
    isGasEvolving: false,
    isPrecipitateForming: false,
  };
}
