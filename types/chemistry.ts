// ============================================================
// Chemistry Types
// ============================================================

export type Phase = 'solid' | 'liquid' | 'gas' | 'aqueous';
export type HazardLevel = 'none' | 'low' | 'medium' | 'high';
export type ReactionType =
  | 'combination'
  | 'decomposition'
  | 'displacement'
  | 'double_displacement'
  | 'neutralization'
  | 'oxidation_reduction'
  | 'precipitation';

export interface Substance {
  id: string;
  name: string;
  formula: string;
  color: string;        // CSS color string
  phase: Phase;
  hazard: HazardLevel;
  molarMass?: number;   // g/mol
  density?: number;     // g/mL
}

export interface Solution {
  id: string;
  solute: Substance;
  solvent: Substance;
  concentration: number;  // mol/L
  volume: number;          // mL
  pH: number;
  color: string;           // current colour (may change with reaction)
}

export interface Reaction {
  id: string;
  reactants: string[];      // Substance IDs
  products: string[];       // Substance IDs
  equation: string;         // Balanced equation string
  type: ReactionType;
  observation: string;
  colorChange?: [string, string];   // [before, after]
  temperatureChange?: number;       // °C (+ = exothermic, - = endothermic)
  gasEvolved?: string;              // formula of gas
  precipitate?: string;             // formula of precipitate
}

export interface IndicatorColor {
  name: string;
  getColor: (pH: number) => string;
  colorDescription: (pH: number) => string;
}

export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  group: number | null;   // null for lanthanides/actinides in main grid
  period: number;
  category: ElementCategory;
  electronConfig: string;
  electronegativity: number | null;
  meltingPoint: number | null;    // K
  boilingPoint: number | null;    // K
  density: number | null;         // g/cm³
  discoveredBy: string;
  yearDiscovered: number | null;
  commonUses: string[];
  schoolRelevance: string;        // relevance to school chemistry
  color: string;                  // category colour for periodic table display
}

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';
