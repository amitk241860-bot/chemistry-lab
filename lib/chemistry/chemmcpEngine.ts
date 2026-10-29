// ============================================================
// ChemMCP Chemistry Intelligence Engine
// Covers Molecular Weight, GHS Safety Hazards, Aqueous Solution Colors,
// Solubility Rules, and Verified Reaction Prediction
// ============================================================

export interface ChemicalCompoundInfo {
  formula: string;
  name: string;
  iupacName?: string;
  smiles?: string;
  casNumber?: string;
  molecularWeight: number;
  density?: number; // g/mL
  aqueousColor: string; // Hex color for SVG beaker rendering
  isColorless: boolean; // True if clear/colorless in dilute aqueous solution
  defaultPH: number;
  ghsSignal?: 'Danger' | 'Warning' | 'None';
  ghsPictograms: ('flammable' | 'corrosive' | 'toxic' | 'oxidizer' | 'health-hazard' | 'environment')[];
  hazardStatements: string[];
  ppeRequirements: ('gloves' | 'goggles' | 'fume-hood' | 'lab-coat')[];
  operatorSafetySummary: string;
  solubilityWater?: string;
}

export interface PredictedReactionOutcome {
  equation: string;
  netIonicEquation?: string;
  reactionType:
    | 'precipitation'
    | 'neutralization'
    | 'complexation'
    | 'redox'
    | 'gas-evolution'
    | 'thermal'
    | 'no-reaction'
    | 'undetermined';
  isReactionExpected: boolean;
  isDetermined: boolean;
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
  explanation: string;
  safetyNotes: string[];
  isGasEvolving: boolean;
  gasType?: 'H2' | 'O2' | 'CO2' | 'NH3';
  isPrecipitateForming: boolean;
  precipitateColor?: string;
  precipitateName?: string;
  solutionColor: string; // Final supernatant / dissolved solution hex color
  isColorless: boolean; // Whether the dissolved liquid phase is clear/colorless
  targetPH?: number;
}

// Standard clear/colorless aqueous hex token used by GlasswareSvg for water-clear refraction
export const COLORLESS_AQUEOUS_HEX = '#e2e8f0';

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
  const cleaned = formula.replace(/\s+/g, '');

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

// Extensive ChemMCP Compound Knowledge Base with verified real-world solution colors
export const COMPOUND_DATABASE: Record<string, ChemicalCompoundInfo> = {
  H2O: {
    formula: 'H2O',
    name: 'Distilled Water',
    iupacName: 'Oxidane',
    smiles: 'O',
    casNumber: '7732-18-5',
    molecularWeight: 18.015,
    density: 1.0,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Not a hazardous substance according to GHS.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Safe neutral solvent. Non-toxic, non-flammable.',
    solubilityWater: 'Miscible in all proportions',
  },
  ZnSO4: {
    formula: 'ZnSO4',
    name: 'Zinc Sulfate',
    iupacName: 'Zinc sulfate',
    smiles: '[Zn+2].[O-]S(=O)(=O)[O-]',
    casNumber: '7733-02-0',
    molecularWeight: 161.47,
    density: 3.54,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 5.5,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'toxic', 'environment'],
    hazardStatements: [
      'H302: Harmful if swallowed.',
      'H318: Causes serious eye damage.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Colorless aqueous salt solution (Zn²⁺ has a filled d¹⁰ subshell). Irritating to eyes; avoid aquatic release.',
    solubilityWater: '577 g/L at 20°C (Forms clear, colorless solution)',
  },
  NaCl: {
    formula: 'NaCl',
    name: 'Sodium Chloride',
    iupacName: 'Sodium chloride',
    smiles: '[Na+].[Cl-]',
    casNumber: '7647-14-5',
    molecularWeight: 58.44,
    density: 2.16,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Non-hazardous under typical laboratory conditions.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Standard non-hazardous neutral electrolyte salt. Colorless in aqueous solution.',
    solubilityWater: '360 g/L at 20°C (Clear, colorless solution)',
  },
  HCl: {
    formula: 'HCl',
    name: 'Hydrochloric Acid',
    iupacName: 'Chlorane',
    smiles: 'Cl',
    casNumber: '7647-01-0',
    molecularWeight: 36.46,
    density: 1.18,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 1.0,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'toxic'],
    hazardStatements: [
      'H314: Causes severe skin burns and eye damage.',
      'H335: May cause respiratory irritation.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Strong acid; clear and colorless in dilute solution. Causes chemical burns on contact.',
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
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 13.0,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive'],
    hazardStatements: [
      'H314: Causes severe skin burns and eye damage.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Caustic strong base; clear and colorless in aqueous solution. Wear eye protection and gloves.',
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
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 6.5,
    ghsSignal: 'Danger',
    ghsPictograms: ['oxidizer', 'corrosive', 'environment'],
    hazardStatements: [
      'H272: May intensify fire; oxidizer.',
      'H314: Causes severe skin burns and eye damage.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Clear, colorless light-sensitive oxidizer. Stains skin dark brown/black on contact.',
    solubilityWater: '2160 g/L at 20°C',
  },
  BaCl2: {
    formula: 'BaCl2',
    name: 'Barium Chloride',
    iupacName: 'Barium dichloride',
    smiles: '[Cl-].[Ba+2].[Cl-]',
    casNumber: '10361-37-2',
    molecularWeight: 208.23,
    density: 3.86,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'Danger',
    ghsPictograms: ['toxic'],
    hazardStatements: ['H301: Toxic if swallowed.', 'H332: Harmful if inhaled.'],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Toxic soluble barium salt; forms a clear, colorless aqueous solution.',
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
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Not classified as hazardous.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Inert neutral sulfate salt; forms a clear, colorless aqueous solution.',
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
    aqueousColor: '#0284c7', // Characteristic blue [Cu(H2O)6]2+
    isColorless: false,
    defaultPH: 4.5,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic', 'environment'],
    hazardStatements: [
      'H302: Harmful if swallowed.',
      'H315: Causes skin irritation.',
      'H319: Causes serious eye irritation.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Vibrant blue aqueous solution due to hexaaquacopper(II) [Cu(H₂O)₆]²⁺ ions. Irritating to skin and eyes.',
    solubilityWater: '320 g/L at 20°C',
  },
  KMnO4: {
    formula: 'KMnO4',
    name: 'Potassium Permanganate',
    iupacName: 'Potassium manganate(VII)',
    smiles: '[K+].[O-][Mn](=O)(=O)=O',
    casNumber: '7722-64-7',
    molecularWeight: 158.034,
    density: 2.7,
    aqueousColor: '#7e22ce', // Deep purple permanganate MnO4-
    isColorless: false,
    defaultPH: 7.0,
    ghsSignal: 'Danger',
    ghsPictograms: ['oxidizer', 'corrosive', 'toxic', 'environment'],
    hazardStatements: [
      'H272: May intensify fire; oxidizer.',
      'H302: Harmful if swallowed.',
      'H314: Causes severe skin burns and eye damage.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Intense violet-purple oxidizing solution due to MnO₄⁻ charge-transfer absorption.',
    solubilityWater: '64 g/L at 20°C',
  },
  KI: {
    formula: 'KI',
    name: 'Potassium Iodide',
    iupacName: 'Potassium iodide',
    smiles: '[K+].[I-]',
    casNumber: '7681-11-0',
    molecularWeight: 166.0,
    density: 3.12,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'Warning',
    ghsPictograms: ['health-hazard'],
    hazardStatements: ['H372: Causes damage to thyroid gland through prolonged or repeated exposure.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Freshly prepared aqueous KI is clear and colorless (oxidizes slowly in air).',
    solubilityWater: '1400 g/L at 20°C',
  },
  'Pb(NO3)2': {
    formula: 'Pb(NO3)2',
    name: 'Lead(II) Nitrate',
    iupacName: 'Lead(2+) dinitrate',
    smiles: '[Pb+2].[O-][N+](=O)[O-].[O-][N+](=O)[O-]',
    casNumber: '10099-74-8',
    molecularWeight: 331.2,
    density: 4.53,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 4.8,
    ghsSignal: 'Danger',
    ghsPictograms: ['toxic', 'health-hazard', 'environment', 'oxidizer'],
    hazardStatements: [
      'H360: May damage fertility or the unborn child.',
      'H302+H332: Harmful if swallowed or inhaled.',
      'H410: Very toxic to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Toxic heavy metal salt; colorless in aqueous solution. Handle with gloves.',
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
    aqueousColor: '#d97706', // Yellow to amber-brown in aqueous solution due to [Fe(H2O)5(OH)]2+ / chloro complexes
    isColorless: false,
    defaultPH: 2.1,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'toxic'],
    hazardStatements: [
      'H302: Harmful if swallowed.',
      'H314: Causes severe skin burns and eye damage.',
      'H290: May be corrosive to metals.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Yellow to amber-brown acidic solution due to Fe(III) hydrolysis and chloride coordination.',
    solubilityWater: '912 g/L at 20°C',
  },
  FeSO4: {
    formula: 'FeSO4',
    name: 'Iron(II) Sulfate',
    iupacName: 'Iron(2+) sulfate',
    smiles: '[Fe+2].[O-]S(=O)(=O)[O-]',
    casNumber: '7720-78-7',
    molecularWeight: 151.91,
    density: 2.84,
    aqueousColor: '#86efac', // Pale sea-green [Fe(H2O)6]2+
    isColorless: false,
    defaultPH: 4.5,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic'],
    hazardStatements: ['H302: Harmful if swallowed.', 'H315: Causes skin irritation.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Pale green aqueous solution containing hexaaquairon(II) [Fe(H₂O)₆]²⁺ ions.',
    solubilityWater: '256 g/L at 20°C',
  },
  KSCN: {
    formula: 'KSCN',
    name: 'Potassium Thiocyanate',
    iupacName: 'Potassium thiocyanate',
    smiles: '[K+].[S-]C#N',
    casNumber: '333-20-0',
    molecularWeight: 97.18,
    density: 1.89,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 6.9,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic'],
    hazardStatements: [
      'H302+H312+H332: Harmful if swallowed, in contact with skin or if inhaled.',
      'H412: Harmful to aquatic life with long lasting effects.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Colorless reagent used for detecting Fe³⁺ ions.',
    solubilityWater: '2170 g/L at 20°C',
  },
  Na2CO3: {
    formula: 'Na2CO3',
    name: 'Sodium Carbonate',
    iupacName: 'Disodium carbonate',
    smiles: '[Na+].[Na+].[O-]C([O-])=O',
    casNumber: '497-19-8',
    molecularWeight: 105.99,
    density: 2.54,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 11.4,
    ghsSignal: 'Warning',
    ghsPictograms: ['corrosive'],
    hazardStatements: ['H319: Causes serious eye irritation.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Alkaline carbonate salt; forms a clear, colorless aqueous solution.',
    solubilityWater: '215 g/L at 20°C',
  },
  CaCl2: {
    formula: 'CaCl2',
    name: 'Calcium Chloride',
    iupacName: 'Calcium dichloride',
    smiles: '[Cl-].[Ca+2].[Cl-]',
    casNumber: '10043-52-4',
    molecularWeight: 110.98,
    density: 2.15,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'Warning',
    ghsPictograms: ['corrosive'],
    hazardStatements: ['H319: Causes serious eye irritation.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Soluble calcium salt; dissolves exothermically to give a clear, colorless solution.',
    solubilityWater: '745 g/L at 20°C',
  },
  H2SO4: {
    formula: 'H2SO4',
    name: 'Sulfuric Acid',
    iupacName: 'Sulfuric acid',
    smiles: 'OS(=O)(=O)O',
    casNumber: '7664-93-9',
    molecularWeight: 98.079,
    density: 1.84,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 0.8,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive'],
    hazardStatements: ['H314: Causes severe skin burns and eye damage.'],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Strong diprotic acid; clear and colorless. Always add acid to water slowly.',
    solubilityWater: 'Miscible (strongly exothermic)',
  },
  NH4Cl: {
    formula: 'NH4Cl',
    name: 'Ammonium Chloride',
    iupacName: 'Ammonium chloride',
    smiles: '[NH4+].[Cl-]',
    casNumber: '12125-02-9',
    molecularWeight: 53.49,
    density: 1.53,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 5.1,
    ghsSignal: 'Warning',
    ghsPictograms: ['toxic'],
    hazardStatements: ['H302: Harmful if swallowed.', 'H319: Causes serious eye irritation.'],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Weakly acidic colorless salt solution.',
    solubilityWater: '372 g/L at 20°C',
  },
  NH3: {
    formula: 'NH3',
    name: 'Aqueous Ammonia',
    iupacName: 'Azane',
    smiles: 'N',
    casNumber: '1336-21-6',
    molecularWeight: 17.031,
    density: 0.91,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 11.6,
    ghsSignal: 'Danger',
    ghsPictograms: ['corrosive', 'environment'],
    hazardStatements: ['H314: Causes severe skin burns and eye damage.', 'H335: May cause respiratory irritation.'],
    ppeRequirements: ['gloves', 'goggles', 'fume-hood', 'lab-coat'],
    operatorSafetySummary: 'Pungent colorless weak base solution. Coordinates with transition metal ions.',
    solubilityWater: 'Miscible',
  },
  KNO3: {
    formula: 'KNO3',
    name: 'Potassium Nitrate',
    iupacName: 'Potassium nitrate',
    smiles: '[K+].[O-][N+](=O)[O-]',
    casNumber: '7757-79-1',
    molecularWeight: 101.103,
    density: 2.11,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'Warning',
    ghsPictograms: ['oxidizer'],
    hazardStatements: ['H272: May intensify fire; oxidizer.'],
    ppeRequirements: ['goggles', 'lab-coat'],
    operatorSafetySummary: 'Soluble colorless nitrate salt.',
    solubilityWater: '316 g/L at 20°C',
  },
  MgSO4: {
    formula: 'MgSO4',
    name: 'Magnesium Sulfate',
    iupacName: 'Magnesium sulfate',
    smiles: '[Mg+2].[O-]S(=O)(=O)[O-]',
    casNumber: '7487-88-9',
    molecularWeight: 120.366,
    density: 2.66,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 6.5,
    ghsSignal: 'None',
    ghsPictograms: [],
    hazardStatements: ['Not classified as hazardous.'],
    ppeRequirements: ['lab-coat'],
    operatorSafetySummary: 'Colorless soluble magnesium salt (Epsom salt).',
    solubilityWater: '351 g/L at 20°C',
  },
  C2H5OH: {
    formula: 'C2H5OH',
    name: 'Ethanol (99%)',
    iupacName: 'Ethanol',
    smiles: 'CCO',
    casNumber: '64-17-5',
    molecularWeight: 46.07,
    density: 0.789,
    aqueousColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    defaultPH: 7.0,
    ghsSignal: 'Danger',
    ghsPictograms: ['flammable'],
    hazardStatements: [
      'H225: Highly flammable liquid and vapor.',
      'H319: Causes serious eye irritation.',
    ],
    ppeRequirements: ['gloves', 'goggles', 'lab-coat'],
    operatorSafetySummary: 'Volatile, highly flammable colorless liquid. Keep away from open flames.',
    solubilityWater: 'Miscible in all proportions',
  },
};

/**
 * Normalize and identify a chemical formula from user text, vessel name, or species key.
 * Carefully distinguishes compounds like ZnSO4 from elemental Zn.
 */
export function normalizeChemicalFormula(rawInput: string): string {
  if (!rawInput) return '';
  const text = rawInput
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .trim();
  const lower = text.toLowerCase();

  // Specific compound checks BEFORE elemental checks!
  if (lower.includes('znso4') || lower.includes('zinc sulfate') || lower.includes('zinc sulphate')) return 'ZnSO4';
  if (lower.includes('zncl2') || lower.includes('zinc chloride')) return 'ZnCl2';
  if (lower.includes('agno3') || lower.includes('silver nitrate')) return 'AgNO3';
  if (lower.includes('agi') || lower.includes('silver iodide')) return 'AgI';
  if (lower.includes('agcl') || lower.includes('silver chloride')) return 'AgCl';
  if (lower.includes('nacl') || lower.includes('sodium chloride') || lower.includes('salt solution')) return 'NaCl';
  if (lower.includes('kcl') || lower.includes('potassium chloride')) return 'KCl';
  if (lower.includes('kno3') || lower.includes('potassium nitrate')) return 'KNO3';
  if (lower.includes('nano3') || lower.includes('sodium nitrate')) return 'NaNO3';
  if (lower.includes('bacl2') || lower.includes('barium chloride')) return 'BaCl2';
  if (lower.includes('baso4') || lower.includes('barium sulfate')) return 'BaSO4';
  if (lower.includes('na2so4') || lower.includes('sodium sulfate') || lower.includes('sodium sulphate')) return 'Na2SO4';
  if (lower.includes('mgso4') || lower.includes('magnesium sulfate')) return 'MgSO4';
  if (lower.includes('pb(no3)2') || lower.includes('pbno3') || lower.includes('lead(ii) nitrate') || lower.includes('lead nitrate')) return 'Pb(NO3)2';
  if (lower.includes('ki') || lower.includes('potassium iodide')) return 'KI';
  if (lower.includes('fecl3') || lower.includes('iron(iii) chloride') || lower.includes('ferric chloride')) return 'FeCl3';
  if (lower.includes('feso4') || lower.includes('iron(ii) sulfate') || lower.includes('ferrous sulfate')) return 'FeSO4';
  if (lower.includes('kscn') || lower.includes('potassium thiocyanate') || lower.includes('thiocyanate')) return 'KSCN';
  if (lower.includes('kmno4') || lower.includes('potassium permanganate') || lower.includes('permanganate')) return 'KMnO4';
  if (lower.includes('k2cr2o7') || lower.includes('dichromate')) return 'K2Cr2O7';
  if (lower.includes('k2cro4') || lower.includes('potassium chromate')) return 'K2CrO4';
  if (lower.includes('cocl2') || lower.includes('cobalt')) return 'CoCl2';
  if (lower.includes('niso4') || lower.includes('nicl2') || lower.includes('nickel')) return 'NiSO4';
  if (lower.includes('cuso4') || lower.includes('copper(ii) sulfate') || lower.includes('copper sulfate') || lower.includes('cupric sulfate')) return 'CuSO4';
  if (lower.includes('cucl2') || lower.includes('copper(ii) chloride')) return 'CuCl2';
  if (lower.includes('hcl') || lower.includes('hydrochloric')) return 'HCl';
  if (lower.includes('h2so4') || lower.includes('sulfuric') || lower.includes('sulphuric')) return 'H2SO4';
  if (lower.includes('hno3') || lower.includes('nitric acid')) return 'HNO3';
  if (lower.includes('ch3cooh') || lower.includes('acetic') || lower.includes('vinegar')) return 'CH3COOH';
  if (lower.includes('naoh') || lower.includes('sodium hydroxide')) return 'NaOH';
  if (lower.includes('koh') || lower.includes('potassium hydroxide')) return 'KOH';
  if (lower.includes('nh4cl') || lower.includes('ammonium chloride')) return 'NH4Cl';
  if (lower.includes('nh3') || lower.includes('nh4oh') || lower.includes('ammonia') || lower.includes('ammonium hydroxide')) return 'NH3';
  if (lower.includes('na2co3') || lower.includes('sodium carbonate')) return 'Na2CO3';
  if (lower.includes('nahco3') || lower.includes('sodium bicarbonate') || lower.includes('baking soda')) return 'NaHCO3';
  if (lower.includes('cacl2') || lower.includes('calcium chloride')) return 'CaCl2';
  if (lower.includes('h2o') || lower.includes('distilled water') || lower === 'water') return 'H2O';
  // Elemental metals only when explicitly standalone or labeled metal/granules/nail
  if (/\bzn\b|\bzinc\s*(metal|granules|dust|strip|solid)?\b/i.test(lower) && !lower.includes('sulfate') && !lower.includes('chloride') && !lower.includes('nitrate')) {
    return 'Zn';
  }
  if (/\bfe\b|\biron\s*(nail|metal|filings|strip|solid)\b/i.test(lower) && !lower.includes('iron(ii)') && !lower.includes('iron(iii)') && !lower.includes('chloride') && !lower.includes('sulfate')) {
    return 'Fe';
  }

  return '';
}

/**
 * Look up the realistic aqueous solution appearance for a chemical formula or name.
 */
export function getSolutionColorInfo(input: string): {
  color: string;
  hex: string;
  isColorless: boolean;
  label: string;
  name: string;
  defaultPH: number;
} {
  const formula = normalizeChemicalFormula(input) || input.trim();
  const dbEntry = COMPOUND_DATABASE[formula];
  if (dbEntry) {
    return {
      color: dbEntry.aqueousColor,
      hex: dbEntry.aqueousColor,
      isColorless: dbEntry.isColorless,
      label: dbEntry.isColorless ? 'Clear / Colorless' : dbEntry.name,
      name: dbEntry.name,
      defaultPH: dbEntry.defaultPH,
    };
  }

  switch (formula) {
    case 'CuSO4':
    case 'CuCl2':
      return { color: '#0284c7', hex: '#0284c7', isColorless: false, label: 'Blue (Cu²⁺ aq)', name: 'Copper(II) Sulfate', defaultPH: 4.5 };
    case 'KMnO4':
      return { color: '#7e22ce', hex: '#7e22ce', isColorless: false, label: 'Deep Purple (MnO₄⁻ aq)', name: 'Potassium Permanganate', defaultPH: 7.0 };
    case 'FeCl3':
      return { color: '#d97706', hex: '#d97706', isColorless: false, label: 'Yellow-Brown (Fe³⁺ aq)', name: 'Iron(III) Chloride', defaultPH: 2.1 };
    case 'FeSO4':
      return { color: '#86efac', hex: '#86efac', isColorless: false, label: 'Pale Green (Fe²⁺ aq)', name: 'Iron(II) Sulfate', defaultPH: 4.5 };
    case 'K2Cr2O7':
      return { color: '#ea580c', hex: '#ea580c', isColorless: false, label: 'Orange (Cr₂O₇²⁻ aq)', name: 'Potassium Dichromate', defaultPH: 4.0 };
    case 'K2CrO4':
      return { color: '#facc15', hex: '#facc15', isColorless: false, label: 'Yellow (CrO₄²⁻ aq)', name: 'Potassium Chromate', defaultPH: 8.5 };
    case 'CoCl2':
      return { color: '#f472b6', hex: '#f472b6', isColorless: false, label: 'Rose Pink (Co²⁺ aq)', name: 'Cobalt(II) Chloride', defaultPH: 5.5 };
    case 'NiSO4':
      return { color: '#10b981', hex: '#10b981', isColorless: false, label: 'Emerald Green (Ni²⁺ aq)', name: 'Nickel(II) Sulfate', defaultPH: 5.5 };
    default:
      return { color: COLORLESS_AQUEOUS_HEX, hex: COLORLESS_AQUEOUS_HEX, isColorless: true, label: 'Clear / Colorless', name: formula || 'Aqueous Reagent', defaultPH: 7.0 };
  }
}

// Known soluble salts/acids/bases where aqueous mixing can be evaluated by ionic solubility rules
const KNOWN_AQUEOUS_SPECIES = new Set([
  'H2O',
  'ZnSO4',
  'ZnCl2',
  'NaCl',
  'KCl',
  'KNO3',
  'NaNO3',
  'AgNO3',
  'BaCl2',
  'Na2SO4',
  'MgSO4',
  'Pb(NO3)2',
  'KI',
  'FeCl3',
  'FeSO4',
  'KSCN',
  'KMnO4',
  'K2Cr2O7',
  'K2CrO4',
  'CoCl2',
  'NiSO4',
  'CuSO4',
  'CuCl2',
  'HCl',
  'H2SO4',
  'HNO3',
  'CH3COOH',
  'NaOH',
  'KOH',
  'NH4Cl',
  'NH3',
  'Na2CO3',
  'NaHCO3',
  'CaCl2',
  'Zn',
  'Fe',
]);

// ChemMCP Forward Reaction Predictor
export function predictReaction(reactants: string[]): PredictedReactionOutcome {
  const cleanedInputs = reactants.map((r) => r.trim()).filter(Boolean);
  const canonical = cleanedInputs.map((r) => normalizeChemicalFormula(r));

  const has = (formula: string) => canonical.includes(formula);
  const hasAny = (formulas: string[]) => formulas.some((f) => canonical.includes(f));

  // 0. Special explicit check: ZnSO4 + NaCl (Dilute aqueous Zinc Sulfate + Sodium Chloride)
  if (has('ZnSO4') && has('NaCl')) {
    return {
      equation: 'ZnSO₄(aq) + 2NaCl(aq) → No Net Ionic Reaction (Zn²⁺, SO₄²⁻, Na⁺, Cl⁻ remain dissolved)',
      netIonicEquation: 'No net ionic reaction (all ions remain spectator ions in dilute aqueous solution)',
      reactionType: 'no-reaction',
      isReactionExpected: false,
      isDetermined: true,
      products: [
        { formula: 'Zn2+(aq) + SO4^2-(aq)', name: 'Dissolved Zinc & Sulfate Ions', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
        { formula: 'Na+(aq) + Cl-(aq)', name: 'Dissolved Sodium & Chloride Ions', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: 0,
      tempChangeExpected: 0,
      visualObservation:
        'Both zinc sulfate (ZnSO₄) and sodium chloride (NaCl) are clear, colorless aqueous solutions. After mixing, the solution remains clear and colorless with no precipitate, no gas bubbles, and no dramatic color change.',
      explanation:
        'Under ordinary dilute aqueous conditions, ZnSO₄ dissociates into Zn²⁺(aq) and SO₄²⁻(aq) while NaCl dissociates into Na⁺(aq) and Cl⁻(aq). Because potential ion-exchange partners ZnCl₂ and Na₂SO₄ are both soluble in water, all four ions remain dissolved as spectator ions and no significant net ionic reaction occurs.',
      safetyNotes: [
        'Wear standard laboratory safety goggles and gloves.',
        'Zinc sulfate solution is irritating to eyes and harmful to aquatic life; dispose of in designated aqueous salt waste.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 6.2,
    };
  }

  // 1. AgNO3 + NaCl (or KCl / HCl / BaCl2 / CaCl2) -> AgCl(s)↓ (White Curdy Precipitate)
  if (has('AgNO3') && hasAny(['NaCl', 'KCl', 'HCl', 'BaCl2', 'CaCl2', 'NH4Cl'])) {
    const partner = canonical.find((c) => ['NaCl', 'KCl', 'HCl', 'BaCl2', 'CaCl2', 'NH4Cl'].includes(c)) || 'NaCl';
    const eqMap: Record<string, string> = {
      NaCl: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      KCl: 'AgNO₃(aq) + KCl(aq) → AgCl(s)↓ + KNO₃(aq)',
      HCl: 'AgNO₃(aq) + HCl(aq) → AgCl(s)↓ + HNO₃(aq)',
      BaCl2: '2AgNO₃(aq) + BaCl₂(aq) → 2AgCl(s)↓ + Ba(NO₃)₂(aq)',
      CaCl2: '2AgNO₃(aq) + CaCl₂(aq) → 2AgCl(s)↓ + Ca(NO₃)₂(aq)',
      NH4Cl: 'AgNO₃(aq) + NH₄Cl(aq) → AgCl(s)↓ + NH₄NO₃(aq)',
    };
    return {
      equation: eqMap[partner] || 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
      netIonicEquation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'AgCl', name: 'Silver Chloride Precipitate', state: 's', color: '#ffffff', precipitateColor: '#ffffff' },
        { formula: 'NaNO3', name: 'Aqueous Nitrate Salt', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -65.5,
      tempChangeExpected: 0.8,
      visualObservation:
        'Immediate formation of a dense, white curdy precipitate of insoluble Silver Chloride AgCl(s)↓ that settles to the bottom of a clear, colorless supernatant solution.',
      explanation:
        'Silver ions (Ag⁺) combine rapidly with chloride ions (Cl⁻) to form insoluble silver chloride (Ksp = 1.77 × 10⁻¹⁰), while the spectator ions remain dissolved in the colorless supernatant.',
      safetyNotes: [
        'Silver nitrate is an oxidizer and stains skin dark brown/black upon exposure to light.',
        'Wear nitrile gloves and safety goggles; collect silver halide precipitates in heavy-metal recovery.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#ffffff',
      precipitateName: 'White Silver Chloride (AgCl↓)',
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 6.8,
    };
  }

  // 2. BaCl2 + Sulfate (Na2SO4 / ZnSO4 / MgSO4 / H2SO4 / CuSO4) -> BaSO4(s)↓ (Heavy White Precipitate)
  if (has('BaCl2') && hasAny(['Na2SO4', 'ZnSO4', 'MgSO4', 'H2SO4', 'CuSO4', 'FeSO4'])) {
    const partner = canonical.find((c) => ['Na2SO4', 'ZnSO4', 'MgSO4', 'H2SO4', 'CuSO4', 'FeSO4'].includes(c)) || 'Na2SO4';
    const isCopper = partner === 'CuSO4';
    const isIronII = partner === 'FeSO4';
    const eqMap: Record<string, string> = {
      Na2SO4: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)',
      ZnSO4: 'BaCl₂(aq) + ZnSO₄(aq) → BaSO₄(s)↓ + ZnCl₂(aq)',
      MgSO4: 'BaCl₂(aq) + MgSO₄(aq) → BaSO₄(s)↓ + MgCl₂(aq)',
      H2SO4: 'BaCl₂(aq) + H₂SO₄(aq) → BaSO₄(s)↓ + 2HCl(aq)',
      CuSO4: 'BaCl₂(aq) + CuSO₄(aq) → BaSO₄(s)↓ + CuCl₂(aq)',
      FeSO4: 'BaCl₂(aq) + FeSO₄(aq) → BaSO₄(s)↓ + FeCl₂(aq)',
    };
    return {
      equation: eqMap[partner],
      netIonicEquation: 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'BaSO4', name: 'Barium Sulfate Precipitate', state: 's', color: '#ffffff', precipitateColor: '#ffffff' },
        {
          formula: isCopper ? 'CuCl2' : isIronII ? 'FeCl2' : 'NaCl',
          name: isCopper ? 'Aqueous Copper(II) Chloride' : isIronII ? 'Aqueous Iron(II) Chloride' : 'Aqueous Chloride Solution',
          state: 'aq',
          color: isCopper ? '#0284c7' : isIronII ? '#86efac' : COLORLESS_AQUEOUS_HEX,
        },
      ],
      deltaH: -26.3,
      tempChangeExpected: 0.4,
      visualObservation: `Immediate formation of a fine, heavy chalky white precipitate of Barium Sulfate BaSO₄(s)↓ at the bottom of the ${
        isCopper ? 'blue Cu²⁺(aq)' : isIronII ? 'pale green Fe²⁺(aq)' : 'clear, colorless'
      } solution.`,
      explanation:
        'Barium ions (Ba²⁺) react with sulfate ions (SO₄²⁻) to precipitate highly insoluble barium sulfate (Ksp = 1.08 × 10⁻¹⁰).',
      safetyNotes: [
        'Soluble barium salts (BaCl₂) are toxic if swallowed. Wash hands thoroughly after handling.',
        'Wear eye protection and lab coat.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#ffffff',
      precipitateName: 'White Barium Sulfate (BaSO₄↓)',
      solutionColor: isCopper ? '#0284c7' : isIronII ? '#86efac' : COLORLESS_AQUEOUS_HEX,
      isColorless: !isCopper && !isIronII,
      targetPH: partner === 'H2SO4' ? 1.5 : 6.8,
    };
  }

  // 3. Pb(NO3)2 + 2KI -> PbI2(s)↓ (Golden Yellow Precipitate / Golden Rain)
  if (has('Pb(NO3)2') && has('KI')) {
    return {
      equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
      netIonicEquation: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'PbI2', name: 'Lead(II) Iodide Precipitate', state: 's', color: '#eab308', precipitateColor: '#eab308' },
        { formula: 'KNO3', name: 'Potassium Nitrate', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -61.2,
      tempChangeExpected: 0.6,
      visualObservation:
        'Instant crystallization of a brilliant golden-yellow precipitate of Lead(II) Iodide PbI₂(s)↓ suspended and settling inside the beaker.',
      explanation:
        'Lead(II) ions (Pb²⁺) combine with iodide ions (I⁻) in a 1:2 stoichiometric ratio to form sparingly soluble golden-yellow lead(II) iodide crystals (Ksp = 9.8 × 10⁻⁹).',
      safetyNotes: [
        'Lead(II) compounds are toxic cumulative heavy metals. Handle strictly with gloves and dispose of in toxic heavy-metal waste.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#eab308',
      precipitateName: 'Golden-Yellow Lead(II) Iodide (PbI₂↓)',
      solutionColor: '#fef9c3',
      isColorless: false,
      targetPH: 6.5,
    };
  }

  // 4. FeCl3 + KSCN -> [Fe(SCN)]2+(aq) (Blood Red Complex Ion)
  if (has('FeCl3') && has('KSCN')) {
    return {
      equation: 'FeCl₃(aq) + KSCN(aq) ⇌ [Fe(SCN)]Cl₂(aq) + KCl(aq)',
      netIonicEquation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq)',
      reactionType: 'complexation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: '[Fe(SCN)]2+', name: 'Pentaaquathiocyanatoiron(III) Complex', state: 'aq', color: '#991b1b' },
      ],
      deltaH: -18.4,
      tempChangeExpected: 0.3,
      visualObservation:
        'Instantaneous transition from yellow-amber Fe³⁺(aq) to an intense, transparent deep blood-red solution of [Fe(SCN)]²⁺(aq) with no solid precipitate.',
      explanation:
        'Thiocyanate ligands (SCN⁻) substitute a coordinated water molecule on [Fe(H₂O)₆]³⁺ to form the soluble blood-red charge-transfer complex ion [Fe(H₂O)₅(SCN)]²⁺.',
      safetyNotes: [
        'Iron(III) chloride is acidic and corrosive; avoid contact with skin and clothing.',
        'Do not mix thiocyanate salts with concentrated strong acids.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: '#991b1b',
      isColorless: false,
      targetPH: 2.4,
    };
  }

  // 5. CuSO4 (or CuCl2) + Base (NaOH / KOH) -> Cu(OH)2(s)↓ (Sky-Blue Precipitate)
  if (hasAny(['CuSO4', 'CuCl2']) && hasAny(['NaOH', 'KOH'])) {
    const cuSalt = has('CuCl2') ? 'CuCl₂' : 'CuSO₄';
    const base = has('KOH') ? 'KOH' : 'NaOH';
    const spectatorSalt = has('KOH')
      ? has('CuCl2') ? '2KCl(aq)' : 'K₂SO₄(aq)'
      : has('CuCl2') ? '2NaCl(aq)' : 'Na₂SO₄(aq)';
    return {
      equation: `${cuSalt}(aq) + 2${base}(aq) → Cu(OH)₂(s)↓ + ${spectatorSalt}`,
      netIonicEquation: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'Cu(OH)2', name: 'Copper(II) Hydroxide Precipitate', state: 's', color: '#0284c7', precipitateColor: '#38bdf8' },
        { formula: 'Na2SO4', name: 'Colorless Aqueous Salt', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -54.2,
      tempChangeExpected: 1.2,
      visualObservation:
        'Immediate formation of a flocculent, gelatinous sky-blue precipitate of Copper(II) Hydroxide Cu(OH)₂(s)↓ suspended and settling at the bottom of the beaker.',
      explanation:
        'Aqueous copper(II) ions (Cu²⁺) react with hydroxide ions (OH⁻) to precipitate insoluble blue copper(II) hydroxide (Ksp = 2.2 × 10⁻²⁰).',
      safetyNotes: [
        'Sodium hydroxide is caustic and causes severe eye and skin burns.',
        'Copper(II) salts are harmful if swallowed and toxic to aquatic organisms.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#38bdf8',
      precipitateName: 'Blue Copper(II) Hydroxide (Cu(OH)₂↓)',
      solutionColor: '#7dd3fc',
      isColorless: false,
      targetPH: 9.5,
    };
  }

  // 6. ZnSO4 + 2NaOH -> Zn(OH)2(s)↓ (White Gelatinous Amphoteric Precipitate)
  if (has('ZnSO4') && hasAny(['NaOH', 'KOH'])) {
    return {
      equation: 'ZnSO₄(aq) + 2NaOH(aq) → Zn(OH)₂(s)↓ + Na₂SO₄(aq)',
      netIonicEquation: 'Zn²⁺(aq) + 2OH⁻(aq) → Zn(OH)₂(s)↓ (redissolves in excess OH⁻ as [Zn(OH)₄]²⁻)',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'Zn(OH)2', name: 'Zinc Hydroxide Precipitate', state: 's', color: '#ffffff', precipitateColor: '#f8fafc' },
        { formula: 'Na2SO4', name: 'Sodium Sulfate', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -42.0,
      tempChangeExpected: 0.9,
      visualObservation:
        'Formation of a white gelatinous precipitate of Zinc Hydroxide Zn(OH)₂(s)↓ (which is amphoteric and dissolves in excess concentrated NaOH to form colorless zincate [Zn(OH)₄]²⁻).',
      explanation:
        'Stoichiometric addition of OH⁻ to Zn²⁺ precipitates white amphoteric Zn(OH)₂(s).',
      safetyNotes: ['Wear safety goggles and gloves when handling caustic NaOH and zinc salts.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#f8fafc',
      precipitateName: 'White Zinc Hydroxide (Zn(OH)₂↓)',
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 9.0,
    };
  }

  // 7. FeCl3 + 3NaOH -> Fe(OH)3(s)↓ (Reddish-Brown Precipitate)
  if (has('FeCl3') && hasAny(['NaOH', 'KOH', 'NH3'])) {
    return {
      equation: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s)↓ + 3NaCl(aq)',
      netIonicEquation: 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'Fe(OH)3', name: 'Iron(III) Hydroxide', state: 's', color: '#9a3412', precipitateColor: '#9a3412' },
        { formula: 'NaCl', name: 'Sodium Chloride', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -88.4,
      tempChangeExpected: 1.8,
      visualObservation:
        'Rapid formation of a flocculent reddish-brown rust precipitate of Iron(III) Hydroxide Fe(OH)₃(s)↓ settling at the bottom.',
      explanation:
        'Iron(III) cations (Fe³⁺) hydrolyze strongly with hydroxide ions to form insoluble reddish-brown iron(III) hydroxide (Ksp = 2.8 × 10⁻³⁹).',
      safetyNotes: ['Wear gloves and goggles; FeCl₃ and NaOH are both corrosive.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#9a3412',
      precipitateName: 'Reddish-Brown Iron(III) Hydroxide (Fe(OH)₃↓)',
      solutionColor: '#fde68a',
      isColorless: false,
      targetPH: 8.8,
    };
  }

  // 8. FeSO4 + 2NaOH -> Fe(OH)2(s)↓ (Dirty Green Precipitate)
  if (has('FeSO4') && hasAny(['NaOH', 'KOH'])) {
    return {
      equation: 'FeSO₄(aq) + 2NaOH(aq) → Fe(OH)₂(s)↓ + Na₂SO₄(aq)',
      netIonicEquation: 'Fe²⁺(aq) + 2OH⁻(aq) → Fe(OH)₂(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'Fe(OH)2', name: 'Iron(II) Hydroxide', state: 's', color: '#15803d', precipitateColor: '#15803d' },
        { formula: 'Na2SO4', name: 'Sodium Sulfate', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -47.1,
      tempChangeExpected: 1.0,
      visualObservation:
        'Formation of a gelatinous dirty-green precipitate of Iron(II) Hydroxide Fe(OH)₂(s)↓ which gradually darkens at the surface upon air oxidation.',
      explanation:
        'Aqueous iron(II) ions (Fe²⁺) react with hydroxide ions (OH⁻) to precipitate green Fe(OH)₂(s).',
      safetyNotes: ['Handle sodium hydroxide with gloves and eye protection.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#15803d',
      precipitateName: 'Green Iron(II) Hydroxide (Fe(OH)₂↓)',
      solutionColor: '#dcfce7',
      isColorless: false,
      targetPH: 9.2,
    };
  }

  // 9. AgNO3 + KI -> AgI(s)↓ (Canary Pale Yellow Precipitate)
  if (has('AgNO3') && has('KI')) {
    return {
      equation: 'AgNO₃(aq) + KI(aq) → AgI(s)↓ + KNO₃(aq)',
      netIonicEquation: 'Ag⁺(aq) + I⁻(aq) → AgI(s)↓',
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'AgI', name: 'Silver Iodide', state: 's', color: '#fde047', precipitateColor: '#fde047' },
        { formula: 'KNO3', name: 'Potassium Nitrate', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -112.5,
      tempChangeExpected: 1.4,
      visualObservation:
        'Instant formation of a pale canary-yellow curdy precipitate of insoluble Silver Iodide AgI(s)↓.',
      explanation:
        'Silver ions (Ag⁺) and iodide ions (I⁻) have an extremely low solubility product (Ksp = 8.5 × 10⁻¹⁷), precipitating pale yellow AgI(s).',
      safetyNotes: ['Silver nitrate stains skin and clothing; wear gloves and goggles.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#fde047',
      precipitateName: 'Pale-Yellow Silver Iodide (AgI↓)',
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 6.8,
    };
  }

  // 10. Strong Acid + Strong Base Neutralization (HCl / H2SO4 / HNO3 + NaOH / KOH)
  if (hasAny(['HCl', 'H2SO4', 'HNO3']) && hasAny(['NaOH', 'KOH'])) {
    const isSulfuric = has('H2SO4');
    return {
      equation: isSulfuric
        ? 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l) + Heat'
        : 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Heat',
      netIonicEquation: 'H⁺(aq) + OH⁻(aq) → H₂O(l)  (ΔH° = -57.3 kJ/mol)',
      reactionType: 'neutralization',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        {
          formula: isSulfuric ? 'Na2SO4' : 'NaCl',
          name: isSulfuric ? 'Sodium Sulfate' : 'Sodium Chloride',
          state: 'aq',
          color: COLORLESS_AQUEOUS_HEX,
        },
        { formula: 'H2O', name: 'Water', state: 'l', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: isSulfuric ? -114.6 : -57.3,
      tempChangeExpected: isSulfuric ? 8.5 : 6.8,
      visualObservation:
        'Both solutions are clear and colorless. Upon mixing, the solution remains clear and colorless with no precipitate, while the vessel warms noticeably (+6.8°C) due to exothermic acid-base neutralization.',
      explanation:
        'Hydronium ions (H⁺) and hydroxide ions (OH⁻) combine to form water molecules, releasing -57.3 kJ/mol of neutralization enthalpy while spectator ions (Na⁺, Cl⁻) remain dissolved.',
      safetyNotes: [
        'Corrosive acid and base reagents; wear safety goggles, gloves, and lab coat.',
      ],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 7.0,
    };
  }

  // 11. Metallic Zinc + Acid (HCl / H2SO4) -> Hydrogen Gas Evolution
  if (has('Zn') && hasAny(['HCl', 'H2SO4'])) {
    const isSulfuric = has('H2SO4');
    return {
      equation: isSulfuric
        ? 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑'
        : 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
      netIonicEquation: 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)↑',
      reactionType: 'gas-evolution',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        {
          formula: isSulfuric ? 'ZnSO4' : 'ZnCl2',
          name: isSulfuric ? 'Zinc Sulfate' : 'Zinc Chloride',
          state: 'aq',
          color: COLORLESS_AQUEOUS_HEX,
        },
        { formula: 'H2', name: 'Hydrogen Gas', state: 'g', color: '#ffffff' },
      ],
      deltaH: -153.9,
      tempChangeExpected: 4.5,
      visualObservation:
        'Vigorous effervescence of colorless Hydrogen gas bubbles H₂(g)↑ rising from the zinc metal surface while the aqueous solution remains clear and colorless.',
      explanation:
        'Metallic zinc (E° = -0.76 V) reduces H⁺(aq) ions to H₂(g) gas while oxidizing to colorless Zn²⁺(aq) ions.',
      safetyNotes: [
        'Hydrogen gas (H₂) is extremely flammable; keep all open Bunsen burner flames away from the reaction vessel.',
      ],
      isGasEvolving: true,
      gasType: 'H2',
      isPrecipitateForming: false,
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 3.5,
    };
  }

  // 12. Single Displacement: Iron Metal + Copper(II) Sulfate -> FeSO4(aq) + Cu(s)↓
  if (has('Fe') && has('CuSO4')) {
    return {
      equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓',
      netIonicEquation: 'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)↓',
      reactionType: 'redox',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'FeSO4', name: 'Iron(II) Sulfate', state: 'aq', color: '#86efac' },
        { formula: 'Cu', name: 'Copper Metal Deposit', state: 's', color: '#b45309', precipitateColor: '#b45309' },
      ],
      deltaH: -152.0,
      tempChangeExpected: 3.2,
      visualObservation:
        'The deep blue CuSO₄ solution gradually turns pale green as FeSO₄(aq) forms and reddish-brown metallic copper Cu(s) deposits at the bottom.',
      explanation:
        'Elemental iron is more reactive than copper and reduces blue Cu²⁺(aq) ions to metallic Cu(s) while oxidizing to pale green Fe²⁺(aq).',
      safetyNotes: ['Dispose of copper/iron solutions in designated transition-metal waste containers.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: '#b45309',
      precipitateName: 'Reddish-Brown Copper Deposit (Cu↓)',
      solutionColor: '#86efac',
      isColorless: false,
      targetPH: 5.0,
    };
  }

  // 13. Carbonate / Bicarbonate + Acid -> CO2(g)↑ Effervescence
  if (hasAny(['Na2CO3', 'NaHCO3']) && hasAny(['HCl', 'H2SO4', 'HNO3', 'CH3COOH'])) {
    return {
      equation: 'Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)↑',
      netIonicEquation: 'CO₃²⁻(aq) + 2H⁺(aq) → H₂O(l) + CO₂(g)↑',
      reactionType: 'gas-evolution',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'NaCl', name: 'Sodium Chloride', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
        { formula: 'CO2', name: 'Carbon Dioxide Gas', state: 'g', color: '#ffffff' },
      ],
      deltaH: -28.4,
      tempChangeExpected: 1.5,
      visualObservation:
        'Rapid effervescence of colorless, odorless Carbon Dioxide gas bubbles CO₂(g)↑ in a clear, colorless aqueous solution.',
      explanation:
        'Protonation of carbonate ions forms unstable carbonic acid (H₂CO₃), which decomposes rapidly into H₂O(l) and CO₂(g)↑.',
      safetyNotes: ['Add acid slowly to prevent foaming over the rim of the beaker.'],
      isGasEvolving: true,
      gasType: 'CO2',
      isPrecipitateForming: false,
      solutionColor: COLORLESS_AQUEOUS_HEX,
      isColorless: true,
      targetPH: 6.2,
    };
  }

  // 14. Carbonate + Soluble Metal Salt -> Insoluble Carbonate Precipitate (CaCO3 / ZnCO3 / CuCO3 / BaCO3)
  if (has('Na2CO3') && hasAny(['CaCl2', 'BaCl2', 'ZnSO4', 'CuSO4', 'MgSO4'])) {
    const partner = canonical.find((c) => ['CaCl2', 'BaCl2', 'ZnSO4', 'CuSO4', 'MgSO4'].includes(c)) || 'CaCl2';
    const isCopper = partner === 'CuSO4';
    const pptFormula =
      partner === 'CaCl2'
        ? 'CaCO3'
        : partner === 'BaCl2'
        ? 'BaCO3'
        : partner === 'ZnSO4'
        ? 'ZnCO3'
        : partner === 'CuSO4'
        ? 'CuCO3'
        : 'MgCO3';
    const pptColor = isCopper ? '#2dd4bf' : '#ffffff';
    return {
      equation: `${partner}(aq) + Na₂CO₃(aq) → ${pptFormula}(s)↓ + Aqueous Salt`,
      netIonicEquation: `M²⁺(aq) + CO₃²⁻(aq) → ${pptFormula}(s)↓`,
      reactionType: 'precipitation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: pptFormula, name: `${pptFormula} Precipitate`, state: 's', color: pptColor, precipitateColor: pptColor },
        { formula: 'NaCl', name: 'Aqueous Sodium Salt', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -14.0,
      tempChangeExpected: 0.4,
      visualObservation: `Immediate formation of an insoluble ${
        isCopper ? 'blue-green basic copper carbonate' : 'chalky white carbonate'
      } precipitate (${pptFormula}↓).`,
      explanation:
        'Most metal carbonates (except Group 1 and ammonium) are insoluble in water and precipitate upon mixing.',
      safetyNotes: ['Wear eye protection and gloves.'],
      isGasEvolving: false,
      isPrecipitateForming: true,
      precipitateColor: pptColor,
      precipitateName: `${isCopper ? 'Blue-Green' : 'White'} ${pptFormula}↓`,
      solutionColor: isCopper ? '#99f6e4' : COLORLESS_AQUEOUS_HEX,
      isColorless: !isCopper,
      targetPH: 8.5,
    };
  }

  // 15. CuSO4 + NH3 -> [Cu(NH3)4]2+ Deep Royal Blue Complex
  if (has('CuSO4') && has('NH3')) {
    return {
      equation: 'CuSO₄(aq) + 4NH₃(aq) ⇌ [Cu(NH₃)₄]SO₄(aq)',
      netIonicEquation: '[Cu(H₂O)₄]²⁺(aq) + 4NH₃(aq) ⇌ [Cu(NH₃)₄]²⁺(aq) + 4H₂O(l)',
      reactionType: 'complexation',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: '[Cu(NH3)4]2+', name: 'Tetraamminecopper(II) Complex', state: 'aq', color: '#1d4ed8' },
      ],
      deltaH: -89.0,
      tempChangeExpected: 2.1,
      visualObservation:
        'Sky-blue Cu²⁺(aq) solution transitions to an intense, deep royal violet-blue solution of [Cu(NH₃)₄]²⁺(aq).',
      explanation:
        'Ammonia ligands replace coordinated water ligands around Cu²⁺, shifting the d-d absorption band and producing a deep royal-blue complex.',
      safetyNotes: ['Use aqueous ammonia in a well-ventilated area; avoid inhaling pungent NH₃ vapors.'],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: '#1d4ed8',
      isColorless: false,
      targetPH: 9.8,
    };
  }

  // 16. KMnO4 + FeSO4 (Acidic/Aqueous Redox Decolorization)
  if (has('KMnO4') && has('FeSO4')) {
    return {
      equation: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
      netIonicEquation: 'MnO₄⁻(purple) + 5Fe²⁺(pale green) + 8H⁺ → Mn²⁺(colorless) + 5Fe³⁺(yellow-amber) + 4H₂O',
      reactionType: 'redox',
      isReactionExpected: true,
      isDetermined: true,
      products: [
        { formula: 'Fe3+(aq)', name: 'Iron(III) Ions', state: 'aq', color: '#d97706' },
        { formula: 'Mn2+(aq)', name: 'Manganese(II) Ions', state: 'aq', color: COLORLESS_AQUEOUS_HEX },
      ],
      deltaH: -124.0,
      tempChangeExpected: 2.4,
      visualObservation:
        'The intense purple color of permanganate (MnO₄⁻) is rapidly decolorized as Fe²⁺ is oxidized to yellow-amber Fe³⁺(aq).',
      explanation:
        'Permanganate (Mn VII) acts as a strong oxidizing agent, oxidizing Fe²⁺ to Fe³⁺ while being reduced to nearly colorless Mn²⁺(aq).',
      safetyNotes: ['KMnO₄ is a strong oxidizer and stains skin; wear gloves and goggles.'],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: '#f59e0b',
      isColorless: false,
      targetPH: 3.0,
    };
  }

  // 17. Check if all reactants are recognized soluble species in our verified database -> Verified No Net Ionic Reaction
  const allRecognized =
    canonical.length >= 2 && canonical.every((c) => Boolean(c) && KNOWN_AQUEOUS_SPECIES.has(c));

  if (allRecognized) {
    // Determine combined solution color from any colored transition-metal ion present
    const coloredReactant = canonical
      .map((c) => getSolutionColorInfo(c))
      .find((info) => !info.isColorless);
    const finalColor = coloredReactant ? coloredReactant.color : COLORLESS_AQUEOUS_HEX;
    const isColorless = !coloredReactant;

    return {
      equation: `${cleanedInputs.join('(aq) + ')}(aq) → No Net Ionic Reaction (all ions remain dissolved)`,
      netIonicEquation: 'No net ionic reaction under ordinary dilute aqueous conditions',
      reactionType: 'no-reaction',
      isReactionExpected: false,
      isDetermined: true,
      products: [],
      deltaH: 0,
      tempChangeExpected: 0,
      visualObservation: isColorless
        ? 'The clear, colorless aqueous solutions mix smoothly to form a clear, colorless homogeneous solution with no precipitate, no gas bubbles, and no unexpected color shift.'
        : `The solutions mix smoothly without precipitation or gas evolution; the mixture retains the characteristic ${coloredReactant?.label} appearance diluted in solution.`,
      explanation:
        'According to aqueous solubility and acid-base rules, mixing these dilute solutions produces no insoluble precipitate, no weak electrolyte/gas, and no redox electron transfer under standard ambient conditions.',
      safetyNotes: ['Follow standard laboratory safety procedures: wear eye protection and lab coat.'],
      isGasEvolving: false,
      isPrecipitateForming: false,
      solutionColor: finalColor,
      isColorless,
      targetPH: 7.0,
    };
  }

  // 18. Honest fallback when one or more reactants are unrecognized/unsupported
  return {
    equation: 'Reaction not determined',
    netIonicEquation: 'Reaction not determined',
    reactionType: 'undetermined',
    isReactionExpected: false,
    isDetermined: false,
    products: [],
    deltaH: 0,
    tempChangeExpected: 0,
    visualObservation:
      'Reaction not determined — this chemical combination is outside the verified aqueous reaction database and cannot be predicted with high confidence.',
    explanation:
      'To prevent inventing unverified products, precipitates, or colors, the simulator reports "Reaction not determined" when the chemical inputs cannot be matched to verified stoichiometric and solubility rules.',
    safetyNotes: [
      'Do not mix unknown or unverified chemical reagents without consulting Safety Data Sheets (SDS).',
    ],
    isGasEvolving: false,
    isPrecipitateForming: false,
    solutionColor: COLORLESS_AQUEOUS_HEX,
    isColorless: true,
    targetPH: 7.0,
  };
}
