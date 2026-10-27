import type { Reaction } from '@/types/chemistry';

export const KNOWN_REACTIONS: Reaction[] = [
  {
    id: 'neutralization-hcl-naoh',
    reactants: ['hydrochloric-acid', 'sodium-hydroxide'],
    products: ['sodium-chloride', 'water'],
    equation: 'HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l)',
    type: 'neutralization',
    observation: 'Exothermic neutralization reaction; solution remains clear and temperature rises slightly.',
    temperatureChange: 5.5,
  },
  {
    id: 'displacement-fe-cuso4',
    reactants: ['iron-filings', 'copper-sulphate'],
    products: ['ferrous-sulphate', 'copper'],
    equation: 'Fe (s) + CuSO₄ (aq) → FeSO₄ (aq) + Cu (s)↓',
    type: 'displacement',
    observation: 'Deep blue copper sulphate solution fades to pale green; reddish-brown copper deposit forms on iron surface.',
    colorChange: ['#1d4ed8', '#86efac'],
    precipitate: 'Cu (s)',
  },
  {
    id: 'displacement-zn-hcl',
    reactants: ['zinc-granules', 'hydrochloric-acid'],
    products: ['zinc-chloride', 'hydrogen'],
    equation: 'Zn (s) + 2HCl (aq) → ZnCl₂ (aq) + H₂ (g)↑',
    type: 'displacement',
    observation: 'Rapid effervescence with evolution of colourless, odourless hydrogen gas bubbles that burn with a pop sound.',
    gasEvolved: 'H₂',
    temperatureChange: 4.0,
  },
  {
    id: 'precipitation-bacl2-na2so4',
    reactants: ['barium-chloride', 'sodium-sulphate'],
    products: ['barium-sulphate', 'sodium-chloride'],
    equation: 'BaCl₂ (aq) + Na₂SO₄ (aq) → BaSO₄ (s)↓ + 2NaCl (aq)',
    type: 'precipitation',
    observation: 'Instantaneous formation of a dense, heavy white precipitate of barium sulphate insoluble in dilute acids.',
    precipitate: 'BaSO₄ (s)',
    colorChange: ['transparent', '#f8fafc'],
  },
  {
    id: 'precipitation-pbno3-ki',
    reactants: ['lead-nitrate', 'potassium-iodide'],
    products: ['lead-iodide', 'potassium-nitrate'],
    equation: 'Pb(NO₃)₂ (aq) + 2KI (aq) → PbI₂ (s)↓ + 2KNO₃ (aq)',
    type: 'precipitation',
    observation: 'Instantaneous formation of a brilliant golden-yellow precipitate of lead(II) iodide.',
    precipitate: 'PbI₂ (s)',
    colorChange: ['transparent', '#facc15'],
  },
  {
    id: 'redox-kmno4-oxalic',
    reactants: ['potassium-permanganate', 'oxalic-acid', 'sulphuric-acid'],
    products: ['potassium-sulphate', 'manganese-sulphate', 'water', 'carbon-dioxide'],
    equation: '2KMnO₄ + 5(COOH)₂ + 3H₂SO₄ → K₂SO₄ + 2MnSO₄ + 8H₂O + 10CO₂↑',
    type: 'oxidation_reduction',
    observation: 'Deep purple permanganate solution is reduced to colourless Mn²⁺; effervescence of CO₂ gas; pink persists at endpoint.',
    colorChange: ['#701a75', 'transparent'],
    gasEvolved: 'CO₂',
  },
  {
    id: 'kinetics-thiosulphate-hcl',
    reactants: ['sodium-thiosulphate', 'hydrochloric-acid'],
    products: ['sodium-chloride', 'sulphur-dioxide', 'sulphur', 'water'],
    equation: 'Na₂S₂O₃ (aq) + 2HCl (aq) → 2NaCl (aq) + SO₂ (g) + S (s)↓ + H₂O (l)',
    type: 'decomposition',
    observation: 'Gradual formation of pale yellow colloidal sulphur opacity; choking smell of SO₂ gas.',
    precipitate: 'S (colloidal)',
    gasEvolved: 'SO₂',
    colorChange: ['transparent', '#fef08a'],
  },
  {
    id: 'equilibrium-fe-scn',
    reactants: ['ferric-chloride', 'potassium-thiocyanate'],
    products: ['ferric-thiocyanate', 'potassium-chloride'],
    equation: 'Fe³⁺ (aq) + SCN⁻ (aq) ⇌ [Fe(SCN)]²⁺ (aq)',
    type: 'combination',
    observation: 'Dynamic equilibrium between pale yellow Fe³⁺ and colourless SCN⁻ to form intense blood-red complex.',
    colorChange: ['#fef08a', '#991b1b'],
  },
];

export function findReaction(reactantIds: string[]): Reaction | undefined {
  const sorted = [...reactantIds].sort();
  return KNOWN_REACTIONS.find((rxn) => {
    const rxnSorted = [...rxn.reactants].sort();
    return (
      rxnSorted.length === sorted.length &&
      rxnSorted.every((r, idx) => r === sorted[idx])
    );
  });
}
