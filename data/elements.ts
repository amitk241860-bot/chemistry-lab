import type { PeriodicElement } from '@/types/chemistry';

// All 118 elements with IUPAC 2021 standard atomic weights
// Source: IUPAC Commission on Isotopic Abundances and Atomic Weights
// Educational data verified against NCERT Chemistry textbooks

export const ELEMENTS: PeriodicElement[] = [
  {
    atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008,
    group: 1, period: 1, category: 'nonmetal',
    electronConfig: '1s¹', electronegativity: 2.2,
    meltingPoint: 14.01, boilingPoint: 20.28, density: 0.0000899,
    discoveredBy: 'Henry Cavendish', yearDiscovered: 1766,
    commonUses: ['Water (H₂O)', 'Fuel cells', 'Ammonia production'],
    schoolRelevance: 'Fundamental element; forms water; appears in acids',
    color: '#ff6b9d'
  },
  {
    atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026,
    group: 18, period: 1, category: 'noble-gas',
    electronConfig: '1s²', electronegativity: null,
    meltingPoint: null, boilingPoint: 4.22, density: 0.000164,
    discoveredBy: 'Pierre Janssen', yearDiscovered: 1868,
    commonUses: ['Balloons', 'Cryogenics', 'MRI scanners'],
    schoolRelevance: 'Noble gas; inert; example of complete valence shell',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94,
    group: 1, period: 2, category: 'alkali-metal',
    electronConfig: '[He] 2s¹', electronegativity: 0.98,
    meltingPoint: 453.69, boilingPoint: 1603, density: 0.534,
    discoveredBy: 'Johan August Arfwedson', yearDiscovered: 1817,
    commonUses: ['Batteries', 'Psychiatric medicine', 'Alloys'],
    schoolRelevance: 'Alkali metal; reacts with water; lightest metal',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122,
    group: 2, period: 2, category: 'alkaline-earth-metal',
    electronConfig: '[He] 2s²', electronegativity: 1.57,
    meltingPoint: 1560, boilingPoint: 2742, density: 1.85,
    discoveredBy: 'Louis Nicolas Vauquelin', yearDiscovered: 1798,
    commonUses: ['Aerospace alloys', 'X-ray windows', 'Nuclear reactors'],
    schoolRelevance: 'Alkaline earth metal; amphoteric oxide',
    color: '#ffa502'
  },
  {
    atomicNumber: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81,
    group: 13, period: 2, category: 'metalloid',
    electronConfig: '[He] 2s² 2p¹', electronegativity: 2.04,
    meltingPoint: 2349, boilingPoint: 4200, density: 2.34,
    discoveredBy: 'Joseph Louis Gay-Lussac', yearDiscovered: 1808,
    commonUses: ['Borosilicate glass', 'Antiseptic', 'Semiconductors'],
    schoolRelevance: 'Metalloid; borax in chemistry labs',
    color: '#2ed573'
  },
  {
    atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011,
    group: 14, period: 2, category: 'nonmetal',
    electronConfig: '[He] 2s² 2p²', electronegativity: 2.55,
    meltingPoint: 3823, boilingPoint: 4098, density: 2.267,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Diamond', 'Graphite', 'Organic molecules', 'Activated charcoal'],
    schoolRelevance: 'Basis of organic chemistry; allotropes (diamond, graphite, fullerene)',
    color: '#747d8c'
  },
  {
    atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007,
    group: 15, period: 2, category: 'nonmetal',
    electronConfig: '[He] 2s² 2p³', electronegativity: 3.04,
    meltingPoint: 63.15, boilingPoint: 77.36, density: 0.001251,
    discoveredBy: 'Daniel Rutherford', yearDiscovered: 1772,
    commonUses: ['Fertilizers (ammonia)', 'Explosives', 'Liquid N₂ cooling'],
    schoolRelevance: 'Major atmospheric gas; Haber process; nitrogen cycle',
    color: '#70a1ff'
  },
  {
    atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999,
    group: 16, period: 2, category: 'nonmetal',
    electronConfig: '[He] 2s² 2p⁴', electronegativity: 3.44,
    meltingPoint: 54.36, boilingPoint: 90.20, density: 0.001429,
    discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1771,
    commonUses: ['Respiration', 'Combustion', 'Welding', 'Medicine'],
    schoolRelevance: 'Essential for combustion; forms oxides; in water',
    color: '#ff4757'
  },
  {
    atomicNumber: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998,
    group: 17, period: 2, category: 'halogen',
    electronConfig: '[He] 2s² 2p⁵', electronegativity: 3.98,
    meltingPoint: 53.48, boilingPoint: 85.03, density: 0.001696,
    discoveredBy: 'Henri Moissan', yearDiscovered: 1886,
    commonUses: ['Toothpaste (fluoride)', 'Teflon', 'Refrigerants'],
    schoolRelevance: 'Most electronegative element; reactive halogen',
    color: '#eccc68'
  },
  {
    atomicNumber: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180,
    group: 18, period: 2, category: 'noble-gas',
    electronConfig: '[He] 2s² 2p⁶', electronegativity: null,
    meltingPoint: 24.56, boilingPoint: 27.07, density: 0.0009,
    discoveredBy: 'William Ramsay', yearDiscovered: 1898,
    commonUses: ['Neon signs', 'Lasers', 'Cryogenics'],
    schoolRelevance: 'Noble gas; example of stable octet configuration',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990,
    group: 1, period: 3, category: 'alkali-metal',
    electronConfig: '[Ne] 3s¹', electronegativity: 0.93,
    meltingPoint: 370.87, boilingPoint: 1156, density: 0.968,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
    commonUses: ['Table salt (NaCl)', 'Soap', 'Street lights'],
    schoolRelevance: 'Key alkali metal; NaCl, NaOH, Na₂CO₃ in practicals',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305,
    group: 2, period: 3, category: 'alkaline-earth-metal',
    electronConfig: '[Ne] 3s²', electronegativity: 1.31,
    meltingPoint: 923, boilingPoint: 1363, density: 1.738,
    discoveredBy: 'Joseph Black', yearDiscovered: 1755,
    commonUses: ['Alloys', 'Fireworks (bright white)', 'Antacids'],
    schoolRelevance: 'Burns with bright white light; in chlorophyll; reactivity series',
    color: '#ffa502'
  },
  {
    atomicNumber: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.982,
    group: 13, period: 3, category: 'post-transition-metal',
    electronConfig: '[Ne] 3s² 3p¹', electronegativity: 1.61,
    meltingPoint: 933.47, boilingPoint: 2792, density: 2.698,
    discoveredBy: 'Hans Christian Ørsted', yearDiscovered: 1825,
    commonUses: ['Foil', 'Aircraft', 'Packaging', 'Wires'],
    schoolRelevance: 'Amphoteric metal; thermite reaction; reactivity series',
    color: '#a4b0be'
  },
  {
    atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085,
    group: 14, period: 3, category: 'metalloid',
    electronConfig: '[Ne] 3s² 3p²', electronegativity: 1.90,
    meltingPoint: 1687, boilingPoint: 3538, density: 2.329,
    discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1824,
    commonUses: ['Semiconductors', 'Glass', 'Solar cells', 'Computer chips'],
    schoolRelevance: 'Semiconductor; second most abundant element in crust',
    color: '#2ed573'
  },
  {
    atomicNumber: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974,
    group: 15, period: 3, category: 'nonmetal',
    electronConfig: '[Ne] 3s² 3p³', electronegativity: 2.19,
    meltingPoint: 317.30, boilingPoint: 553.65, density: 1.82,
    discoveredBy: 'Hennig Brand', yearDiscovered: 1669,
    commonUses: ['Fertilizers', 'Matches', 'Detergents', 'DNA backbone'],
    schoolRelevance: 'Allotropes (white, red, black phosphorus); fertilizers',
    color: '#70a1ff'
  },
  {
    atomicNumber: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06,
    group: 16, period: 3, category: 'nonmetal',
    electronConfig: '[Ne] 3s² 3p⁴', electronegativity: 2.58,
    meltingPoint: 388.36, boilingPoint: 717.87, density: 2.067,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Sulfuric acid', 'Gunpowder', 'Vulcanization', 'Fungicides'],
    schoolRelevance: 'H₂SO₄ production; allotropes; acid rain',
    color: '#ffa502'
  },
  {
    atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45,
    group: 17, period: 3, category: 'halogen',
    electronConfig: '[Ne] 3s² 3p⁵', electronegativity: 3.16,
    meltingPoint: 171.65, boilingPoint: 239.11, density: 0.003214,
    discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1774,
    commonUses: ['Disinfection', 'PVC', 'HCl production', 'Bleach'],
    schoolRelevance: 'HCl in acid experiments; bleaching powder; salt (NaCl)',
    color: '#eccc68'
  },
  {
    atomicNumber: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.948,
    group: 18, period: 3, category: 'noble-gas',
    electronConfig: '[Ne] 3s² 3p⁶', electronegativity: null,
    meltingPoint: 83.80, boilingPoint: 87.30, density: 0.001784,
    discoveredBy: 'Lord Rayleigh', yearDiscovered: 1894,
    commonUses: ['Welding shield gas', 'Light bulbs', 'Wine preservation'],
    schoolRelevance: 'Most abundant noble gas; inert shielding gas',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098,
    group: 1, period: 4, category: 'alkali-metal',
    electronConfig: '[Ar] 4s¹', electronegativity: 0.82,
    meltingPoint: 336.53, boilingPoint: 1032, density: 0.862,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
    commonUses: ['Fertilizers', 'Soap', 'Gunpowder (KNO₃)', 'Medicine'],
    schoolRelevance: 'Flame test (violet); KOH base; KMnO₄ oxidizer in lab',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078,
    group: 2, period: 4, category: 'alkaline-earth-metal',
    electronConfig: '[Ar] 4s²', electronegativity: 1.00,
    meltingPoint: 1115, boilingPoint: 1757, density: 1.55,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1808,
    commonUses: ['Cement (CaCO₃)', 'Bones/teeth (Ca₃(PO₄)₂)', 'Plaster'],
    schoolRelevance: 'CaCO₃ limestone; CaO quicklime; Ca(OH)₂ limewater test for CO₂',
    color: '#ffa502'
  },
  {
    atomicNumber: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.956,
    group: 3, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d¹ 4s²', electronegativity: 1.36,
    meltingPoint: 1814, boilingPoint: 3109, density: 2.985,
    discoveredBy: 'Lars Fredrik Nilson', yearDiscovered: 1879,
    commonUses: ['Aerospace alloys', 'Sports equipment', 'Lamps'],
    schoolRelevance: 'First transition metal; d-block element',
    color: '#ff6348'
  },
  {
    atomicNumber: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.867,
    group: 4, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d² 4s²', electronegativity: 1.54,
    meltingPoint: 1941, boilingPoint: 3560, density: 4.506,
    discoveredBy: 'William Gregor', yearDiscovered: 1791,
    commonUses: ['Aerospace', 'Medical implants', 'White pigment (TiO₂)'],
    schoolRelevance: 'Transition metal; variable oxidation states; TiO₂ pigment',
    color: '#ff6348'
  },
  {
    atomicNumber: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.942,
    group: 5, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d³ 4s²', electronegativity: 1.63,
    meltingPoint: 2183, boilingPoint: 3680, density: 6.0,
    discoveredBy: 'Andrés Manuel del Río', yearDiscovered: 1801,
    commonUses: ['Steel alloys', 'Vanadium flow batteries', 'Catalysts'],
    schoolRelevance: 'Transition metal; V₂O₅ catalyst in H₂SO₄ production',
    color: '#ff6348'
  },
  {
    atomicNumber: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 51.996,
    group: 6, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66,
    meltingPoint: 2180, boilingPoint: 2944, density: 7.15,
    discoveredBy: 'Louis Nicolas Vauquelin', yearDiscovered: 1797,
    commonUses: ['Stainless steel', 'Chrome plating', 'Pigments'],
    schoolRelevance: 'K₂Cr₂O₇ oxidizing agent; colored compounds; stainless steel',
    color: '#ff6348'
  },
  {
    atomicNumber: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.938,
    group: 7, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d⁵ 4s²', electronegativity: 1.55,
    meltingPoint: 1519, boilingPoint: 2334, density: 7.21,
    discoveredBy: 'Johann Gottlieb Gahn', yearDiscovered: 1774,
    commonUses: ['Steel production', 'Batteries (MnO₂)', 'Fertilizers'],
    schoolRelevance: 'KMnO₄ (potassium permanganate) used in titrations',
    color: '#ff6348'
  },
  {
    atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845,
    group: 8, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d⁶ 4s²', electronegativity: 1.83,
    meltingPoint: 1811, boilingPoint: 3134, density: 7.874,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Steel', 'Cast iron', 'Hemoglobin', 'Magnets'],
    schoolRelevance: 'Displacement by iron (Fe + CuSO₄); rusting; reactivity series',
    color: '#ff6348'
  },
  {
    atomicNumber: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.933,
    group: 9, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d⁷ 4s²', electronegativity: 1.88,
    meltingPoint: 1768, boilingPoint: 3200, density: 8.9,
    discoveredBy: 'Georg Brandt', yearDiscovered: 1735,
    commonUses: ['Alloys', 'Batteries (Li-Co)', 'Blue pigment', 'Magnets'],
    schoolRelevance: 'Transition metal; colored coordination compounds',
    color: '#ff6348'
  },
  {
    atomicNumber: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.693,
    group: 10, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d⁸ 4s²', electronegativity: 1.91,
    meltingPoint: 1728, boilingPoint: 3186, density: 8.908,
    discoveredBy: 'Axel Fredrik Cronstedt', yearDiscovered: 1751,
    commonUses: ['Coins', 'Stainless steel', 'Batteries', 'Plating'],
    schoolRelevance: 'Transition metal; catalyst; electroplating',
    color: '#ff6348'
  },
  {
    atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546,
    group: 11, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90,
    meltingPoint: 1357.77, boilingPoint: 2835, density: 8.96,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Electrical wiring', 'Plumbing', 'Bronze', 'CuSO₄ solution'],
    schoolRelevance: 'CuSO₄ blue solution; displacement reaction with Fe; electroplating',
    color: '#ff6348'
  },
  {
    atomicNumber: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38,
    group: 12, period: 4, category: 'transition-metal',
    electronConfig: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65,
    meltingPoint: 692.68, boilingPoint: 1180, density: 7.134,
    discoveredBy: 'Andreas Sigismund Marggraf', yearDiscovered: 1746,
    commonUses: ['Galvanization', 'Batteries', 'Alloys (brass)', 'Sunscreen (ZnO)'],
    schoolRelevance: 'Zn + H₂SO₄ → ZnSO₄ + H₂; electrochemical cells; galvanization',
    color: '#ff6348'
  },
  {
    atomicNumber: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.723,
    group: 13, period: 4, category: 'post-transition-metal',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81,
    meltingPoint: 302.91, boilingPoint: 2477, density: 5.91,
    discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1875,
    commonUses: ['LEDs', 'Solar cells', 'Semiconductors'],
    schoolRelevance: 'Post-transition metal; melts near room temperature',
    color: '#a4b0be'
  },
  {
    atomicNumber: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.630,
    group: 14, period: 4, category: 'metalloid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01,
    meltingPoint: 1211.40, boilingPoint: 3106, density: 5.323,
    discoveredBy: 'Clemens Winkler', yearDiscovered: 1886,
    commonUses: ['Semiconductors', 'Fiber optics', 'Infrared optics'],
    schoolRelevance: 'Metalloid; predicted by Mendeleev (eka-silicon)',
    color: '#2ed573'
  },
  {
    atomicNumber: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.922,
    group: 15, period: 4, category: 'metalloid',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18,
    meltingPoint: 887, boilingPoint: 887, density: 5.727,
    discoveredBy: 'Albertus Magnus', yearDiscovered: 1250,
    commonUses: ['Semiconductors', 'Pesticides', 'Wood preservative'],
    schoolRelevance: 'Metalloid; toxic; arsenic compounds in historical context',
    color: '#2ed573'
  },
  {
    atomicNumber: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.971,
    group: 16, period: 4, category: 'nonmetal',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55,
    meltingPoint: 494, boilingPoint: 958, density: 4.819,
    discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1817,
    commonUses: ['Photocopiers', 'Solar cells', 'Glass coloring'],
    schoolRelevance: 'Nonmetal; allotropes; chalcogen family',
    color: '#70a1ff'
  },
  {
    atomicNumber: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904,
    group: 17, period: 4, category: 'halogen',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96,
    meltingPoint: 265.8, boilingPoint: 332.0, density: 3.122,
    discoveredBy: 'Antoine Jérôme Balard', yearDiscovered: 1826,
    commonUses: ['Flame retardants', 'Fumigants', 'Drugs', 'Photography'],
    schoolRelevance: 'Only liquid non-metal at room temperature; halogen properties',
    color: '#eccc68'
  },
  {
    atomicNumber: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.798,
    group: 18, period: 4, category: 'noble-gas',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: 3.00,
    meltingPoint: 115.79, boilingPoint: 119.93, density: 0.003749,
    discoveredBy: 'William Ramsay', yearDiscovered: 1898,
    commonUses: ['Fluorescent lamps', 'Lasers', 'Photography flash'],
    schoolRelevance: 'Noble gas; complete octet; very unreactive',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.468,
    group: 1, period: 5, category: 'alkali-metal',
    electronConfig: '[Kr] 5s¹', electronegativity: 0.82,
    meltingPoint: 312.46, boilingPoint: 961, density: 1.532,
    discoveredBy: 'Robert Bunsen', yearDiscovered: 1861,
    commonUses: ['Atomic clocks', 'Photovoltaics', 'Fireworks (red-violet)'],
    schoolRelevance: 'Alkali metal; flame test (red-violet)',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.62,
    group: 2, period: 5, category: 'alkaline-earth-metal',
    electronConfig: '[Kr] 5s²', electronegativity: 0.95,
    meltingPoint: 1050, boilingPoint: 1655, density: 2.64,
    discoveredBy: 'Adair Crawford', yearDiscovered: 1790,
    commonUses: ['Fireworks (crimson red)', 'Ferrite magnets', 'Nuclear medicine'],
    schoolRelevance: 'Alkaline earth; flame test (crimson red)',
    color: '#ffa502'
  },
  {
    atomicNumber: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.906,
    group: 3, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d¹ 5s²', electronegativity: 1.22,
    meltingPoint: 1799, boilingPoint: 3609, density: 4.469,
    discoveredBy: 'Johan Gadolin', yearDiscovered: 1794,
    commonUses: ['Superconductors', 'LEDs', 'Camera lenses'],
    schoolRelevance: 'Transition metal; rare earth applications',
    color: '#ff6348'
  },
  {
    atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.224,
    group: 4, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d² 5s²', electronegativity: 1.33,
    meltingPoint: 2128, boilingPoint: 4682, density: 6.52,
    discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789,
    commonUses: ['Nuclear reactors', 'Ceramics', 'Gems (cubic zirconia)'],
    schoolRelevance: 'Corrosion-resistant transition metal',
    color: '#ff6348'
  },
  {
    atomicNumber: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.906,
    group: 5, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d⁴ 5s¹', electronegativity: 1.6,
    meltingPoint: 2750, boilingPoint: 5017, density: 8.57,
    discoveredBy: 'Charles Hatchett', yearDiscovered: 1801,
    commonUses: ['Steel alloys', 'Superconducting magnets', 'Jewelry'],
    schoolRelevance: 'Transition metal; superalloy component',
    color: '#ff6348'
  },
  {
    atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.96,
    group: 6, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16,
    meltingPoint: 2896, boilingPoint: 4912, density: 10.28,
    discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1778,
    commonUses: ['Steel alloys', 'Catalysts', 'Lubricants'],
    schoolRelevance: 'High-melting transition metal; catalyst in N₂ fixation',
    color: '#ff6348'
  },
  {
    atomicNumber: 43, symbol: 'Tc', name: 'Technetium', atomicMass: 97,
    group: 7, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d⁵ 5s²', electronegativity: 1.9,
    meltingPoint: 2430, boilingPoint: 4538, density: 11.0,
    discoveredBy: 'Emilio Segrè', yearDiscovered: 1937,
    commonUses: ['Nuclear medicine (⁹⁹ᵐTc imaging)'],
    schoolRelevance: 'First artificially produced element; radioactive',
    color: '#ff6348'
  },
  {
    atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.07,
    group: 8, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d⁷ 5s¹', electronegativity: 2.2,
    meltingPoint: 2607, boilingPoint: 4423, density: 12.37,
    discoveredBy: 'Karl Ernst Claus', yearDiscovered: 1844,
    commonUses: ['Catalysts', 'Electronics', 'Fountain pen tips'],
    schoolRelevance: 'Platinum group metal; catalyst',
    color: '#ff6348'
  },
  {
    atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.91,
    group: 9, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28,
    meltingPoint: 2237, boilingPoint: 3968, density: 12.41,
    discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1804,
    commonUses: ['Catalytic converters', 'Jewelry', 'Electrical contacts'],
    schoolRelevance: 'Rare and precious; catalytic converter',
    color: '#ff6348'
  },
  {
    atomicNumber: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.42,
    group: 10, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d¹⁰', electronegativity: 2.20,
    meltingPoint: 1828.05, boilingPoint: 3236, density: 12.02,
    discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1803,
    commonUses: ['Catalytic converters', 'Electronics', 'Jewelry', 'Hydrogen storage'],
    schoolRelevance: 'Platinum group metal; catalyst',
    color: '#ff6348'
  },
  {
    atomicNumber: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.87,
    group: 11, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93,
    meltingPoint: 1234.93, boilingPoint: 2435, density: 10.49,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Jewelry', 'Photography', 'Electronics', 'Antibacterial'],
    schoolRelevance: 'AgNO₃ test for halides; silver mirror test for aldehydes',
    color: '#ff6348'
  },
  {
    atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.41,
    group: 12, period: 5, category: 'transition-metal',
    electronConfig: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69,
    meltingPoint: 594.22, boilingPoint: 1040, density: 8.65,
    discoveredBy: 'Friedrich Strohmeyer', yearDiscovered: 1817,
    commonUses: ['Ni-Cd batteries', 'Pigments', 'Nuclear reactors'],
    schoolRelevance: 'Toxic heavy metal; electroplating; Ni-Cd batteries',
    color: '#ff6348'
  },
  {
    atomicNumber: 49, symbol: 'In', name: 'Indium', atomicMass: 114.82,
    group: 13, period: 5, category: 'post-transition-metal',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78,
    meltingPoint: 429.75, boilingPoint: 2345, density: 7.31,
    discoveredBy: 'Ferdinand Reich', yearDiscovered: 1863,
    commonUses: ['LCD screens (ITO)', 'Semiconductors', 'Bearings'],
    schoolRelevance: 'Post-transition metal; touchscreen coatings',
    color: '#a4b0be'
  },
  {
    atomicNumber: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.71,
    group: 14, period: 5, category: 'post-transition-metal',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96,
    meltingPoint: 505.08, boilingPoint: 2875, density: 7.287,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Tin cans', 'Solder', 'Bronze', 'Organ pipes'],
    schoolRelevance: 'Allotropes; tin pest; bronze and solder alloys',
    color: '#a4b0be'
  },
  {
    atomicNumber: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.76,
    group: 15, period: 5, category: 'metalloid',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05,
    meltingPoint: 903.78, boilingPoint: 1860, density: 6.697,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Flame retardants', 'Alloys', 'Semiconductors'],
    schoolRelevance: 'Metalloid; historical element; fire retardants',
    color: '#2ed573'
  },
  {
    atomicNumber: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.60,
    group: 16, period: 5, category: 'metalloid',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.1,
    meltingPoint: 722.66, boilingPoint: 1261, density: 6.24,
    discoveredBy: 'Franz-Joseph Müller von Reichenstein', yearDiscovered: 1782,
    commonUses: ['Alloys', 'Solar cells', 'Thermoelectrics'],
    schoolRelevance: 'Metalloid; chalcogen; semiconductor',
    color: '#2ed573'
  },
  {
    atomicNumber: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90,
    group: 17, period: 5, category: 'halogen',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66,
    meltingPoint: 386.85, boilingPoint: 457.4, density: 4.933,
    discoveredBy: 'Bernard Courtois', yearDiscovered: 1811,
    commonUses: ['Antiseptic (iodine solution)', 'Thyroid medicine', 'Photography'],
    schoolRelevance: 'Starch-iodine test; halogen properties; sublimation',
    color: '#eccc68'
  },
  {
    atomicNumber: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.29,
    group: 18, period: 5, category: 'noble-gas',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: 2.6,
    meltingPoint: 161.40, boilingPoint: 165.03, density: 0.005887,
    discoveredBy: 'William Ramsay', yearDiscovered: 1898,
    commonUses: ['Flash lamps', 'Ion propulsion', 'Anesthesia'],
    schoolRelevance: 'Noble gas; forms some compounds unlike He/Ne/Ar',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 55, symbol: 'Cs', name: 'Caesium', atomicMass: 132.91,
    group: 1, period: 6, category: 'alkali-metal',
    electronConfig: '[Xe] 6s¹', electronegativity: 0.79,
    meltingPoint: 301.59, boilingPoint: 944, density: 1.873,
    discoveredBy: 'Robert Bunsen', yearDiscovered: 1860,
    commonUses: ['Atomic clocks', 'Drilling fluids', 'Night-vision devices'],
    schoolRelevance: 'Most reactive common alkali metal; atomic clocks',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33,
    group: 2, period: 6, category: 'alkaline-earth-metal',
    electronConfig: '[Xe] 6s²', electronegativity: 0.89,
    meltingPoint: 1000, boilingPoint: 2118, density: 3.51,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1808,
    commonUses: ['Fireworks (green)', 'Medical imaging (BaSO₄)', 'Rat poison (BaCO₃)'],
    schoolRelevance: 'BaSO₄ test for sulfate ions; flame test (green)',
    color: '#ffa502'
  },
  {
    atomicNumber: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.91,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 5d¹ 6s²', electronegativity: 1.10,
    meltingPoint: 1193, boilingPoint: 3737, density: 6.145,
    discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1839,
    commonUses: ['Hybrid car batteries', 'Optical glass', 'Catalysts'],
    schoolRelevance: 'First lanthanide; rare earth element',
    color: '#ff9f43'
  },
  {
    atomicNumber: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.12,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12,
    meltingPoint: 1068, boilingPoint: 3716, density: 6.770,
    discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1803,
    commonUses: ['Catalytic converters', 'Glass polishing', 'Lighters (flint)'],
    schoolRelevance: 'Most abundant lanthanide; variable oxidation states (+3, +4)',
    color: '#ff9f43'
  },
  {
    atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.91,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f³ 6s²', electronegativity: 1.13,
    meltingPoint: 1208, boilingPoint: 3403, density: 6.773,
    discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885,
    commonUses: ['Strong magnets (Nd-Pr)', 'Lasers', 'Welding goggles'],
    schoolRelevance: 'Lanthanide; f-block element',
    color: '#ff9f43'
  },
  {
    atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.24,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁴ 6s²', electronegativity: 1.14,
    meltingPoint: 1297, boilingPoint: 3347, density: 7.007,
    discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885,
    commonUses: ['Nd-Fe-B magnets (strongest)', 'Lasers', 'Headphones'],
    schoolRelevance: 'Neodymium magnets; lanthanide series',
    color: '#ff9f43'
  },
  {
    atomicNumber: 61, symbol: 'Pm', name: 'Promethium', atomicMass: 145,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁵ 6s²', electronegativity: 1.13,
    meltingPoint: 1315, boilingPoint: 3273, density: 7.26,
    discoveredBy: 'Jacob A. Marinsky', yearDiscovered: 1945,
    commonUses: ['Nuclear batteries', 'Luminous paint (historical)'],
    schoolRelevance: 'Only radioactive lanthanide; no stable isotopes',
    color: '#ff9f43'
  },
  {
    atomicNumber: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.36,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁶ 6s²', electronegativity: 1.17,
    meltingPoint: 1345, boilingPoint: 2173, density: 7.52,
    discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1879,
    commonUses: ['Sm-Co magnets', 'Cancer treatment', 'Lasers'],
    schoolRelevance: 'Lanthanide; rare earth magnets',
    color: '#ff9f43'
  },
  {
    atomicNumber: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.96,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁷ 6s²', electronegativity: 1.2,
    meltingPoint: 1099, boilingPoint: 1802, density: 5.243,
    discoveredBy: 'Eugène-Anatole Demarçay', yearDiscovered: 1901,
    commonUses: ['Red phosphor in TV/LEDs', 'Euro banknote security', 'Lasers'],
    schoolRelevance: 'Lanthanide; red phosphor; anti-counterfeiting',
    color: '#ff9f43'
  },
  {
    atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.25,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.20,
    meltingPoint: 1585, boilingPoint: 3546, density: 7.895,
    discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1880,
    commonUses: ['MRI contrast agent', 'Nuclear reactors', 'Magnets'],
    schoolRelevance: 'Lanthanide; MRI contrast agents',
    color: '#ff9f43'
  },
  {
    atomicNumber: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.93,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f⁹ 6s²', electronegativity: 1.2,
    meltingPoint: 1629, boilingPoint: 3503, density: 8.229,
    discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843,
    commonUses: ['Green phosphor', 'Sonar systems', 'Fuel cells'],
    schoolRelevance: 'Lanthanide; green phosphor',
    color: '#ff9f43'
  },
  {
    atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.50,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22,
    meltingPoint: 1680, boilingPoint: 2840, density: 8.55,
    discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1886,
    commonUses: ['Neodymium magnets (additive)', 'Nuclear reactors', 'Data storage'],
    schoolRelevance: 'Lanthanide; hard disk applications',
    color: '#ff9f43'
  },
  {
    atomicNumber: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.93,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23,
    meltingPoint: 1734, boilingPoint: 2993, density: 8.795,
    discoveredBy: 'Per Teodor Cleve', yearDiscovered: 1878,
    commonUses: ['Lasers (medical)', 'Magnets', 'Nuclear control rods'],
    schoolRelevance: 'Lanthanide; medical lasers',
    color: '#ff9f43'
  },
  {
    atomicNumber: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.26,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹² 6s²', electronegativity: 1.24,
    meltingPoint: 1802, boilingPoint: 3141, density: 9.066,
    discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843,
    commonUses: ['Fiber optic amplifiers', 'Lasers', 'Glass coloring (pink)'],
    schoolRelevance: 'Lanthanide; optical fiber technology',
    color: '#ff9f43'
  },
  {
    atomicNumber: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.93,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹³ 6s²', electronegativity: 1.25,
    meltingPoint: 1818, boilingPoint: 2223, density: 9.321,
    discoveredBy: 'Per Teodor Cleve', yearDiscovered: 1879,
    commonUses: ['Portable X-ray devices', 'Lasers', 'Magnets'],
    schoolRelevance: 'Rarest naturally occurring lanthanide',
    color: '#ff9f43'
  },
  {
    atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.04,
    group: null, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.1,
    meltingPoint: 1097, boilingPoint: 1469, density: 6.965,
    discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1878,
    commonUses: ['Atomic clocks', 'Stainless steel', 'Lasers'],
    schoolRelevance: 'Complete 4f shell lanthanide',
    color: '#ff9f43'
  },
  {
    atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.97,
    group: 3, period: 6, category: 'lanthanide',
    electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27,
    meltingPoint: 1925, boilingPoint: 3675, density: 9.840,
    discoveredBy: 'Georges Urbain', yearDiscovered: 1907,
    commonUses: ['PET scan detectors', 'Catalysts', 'Lasers'],
    schoolRelevance: 'Last lanthanide; 4f orbital complete',
    color: '#ff9f43'
  },
  {
    atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.49,
    group: 4, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.3,
    meltingPoint: 2506, boilingPoint: 4876, density: 13.31,
    discoveredBy: 'Dirk Coster', yearDiscovered: 1923,
    commonUses: ['Nuclear reactors', 'Semiconductors', 'Superalloys'],
    schoolRelevance: 'Always found with zirconium; difficult to separate',
    color: '#ff6348'
  },
  {
    atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.95,
    group: 5, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.5,
    meltingPoint: 3290, boilingPoint: 5731, density: 16.69,
    discoveredBy: 'Anders Gustaf Ekeberg', yearDiscovered: 1802,
    commonUses: ['Capacitors (electronics)', 'Surgical implants', 'Superalloys'],
    schoolRelevance: 'Corrosion-resistant; used in electronics',
    color: '#ff6348'
  },
  {
    atomicNumber: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.84,
    group: 6, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36,
    meltingPoint: 3695, boilingPoint: 5828, density: 19.25,
    discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1781,
    commonUses: ['Light bulb filaments', 'X-ray tubes', 'Drill bits', 'Armor'],
    schoolRelevance: 'Highest melting point of all metals; light bulb filaments',
    color: '#ff6348'
  },
  {
    atomicNumber: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.21,
    group: 7, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.9,
    meltingPoint: 3459, boilingPoint: 5869, density: 21.02,
    discoveredBy: 'Masataka Ogawa', yearDiscovered: 1908,
    commonUses: ['Jet engine alloys', 'Catalysts', 'Electrical contacts'],
    schoolRelevance: 'One of rarest elements; jet engine applications',
    color: '#ff6348'
  },
  {
    atomicNumber: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.23,
    group: 8, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.2,
    meltingPoint: 3306, boilingPoint: 5285, density: 22.59,
    discoveredBy: 'Smithson Tennant', yearDiscovered: 1803,
    commonUses: ['Fountain pen tips', 'Electrical contacts', 'Staining agent'],
    schoolRelevance: 'Densest naturally occurring element',
    color: '#ff6348'
  },
  {
    atomicNumber: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.22,
    group: 9, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.20,
    meltingPoint: 2719, boilingPoint: 4701, density: 22.56,
    discoveredBy: 'Smithson Tennant', yearDiscovered: 1803,
    commonUses: ['Crucibles', 'Spark plugs', 'Compass bearings', 'Meteoric marker'],
    schoolRelevance: 'Most corrosion-resistant metal; K-Pg boundary marker',
    color: '#ff6348'
  },
  {
    atomicNumber: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.08,
    group: 10, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28,
    meltingPoint: 2041.4, boilingPoint: 4098, density: 21.45,
    discoveredBy: 'Antonio de Ulloa', yearDiscovered: 1748,
    commonUses: ['Catalytic converters', 'Jewelry', 'Electrodes', 'Cancer drugs'],
    schoolRelevance: 'Noble metal; catalytic converter; cisplatin drug',
    color: '#ff6348'
  },
  {
    atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97,
    group: 11, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54,
    meltingPoint: 1337.33, boilingPoint: 3129, density: 19.30,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Jewelry', 'Electronics', 'Currency', 'Medicine'],
    schoolRelevance: 'Noble metal; unreactive; aqua regia dissolves it',
    color: '#ff6348'
  },
  {
    atomicNumber: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59,
    group: 12, period: 6, category: 'transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00,
    meltingPoint: 234.32, boilingPoint: 629.88, density: 13.534,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Thermometers (being phased out)', 'Fluorescent lamps', 'Dental fillings'],
    schoolRelevance: 'Only liquid metal at room temperature; highly toxic',
    color: '#ff6348'
  },
  {
    atomicNumber: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38,
    group: 13, period: 6, category: 'post-transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62,
    meltingPoint: 577, boilingPoint: 1746, density: 11.85,
    discoveredBy: 'William Crookes', yearDiscovered: 1861,
    commonUses: ['Infrared detectors', 'Semiconductors'],
    schoolRelevance: 'Toxic post-transition metal; used in rat poison historically',
    color: '#a4b0be'
  },
  {
    atomicNumber: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2,
    group: 14, period: 6, category: 'post-transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33,
    meltingPoint: 600.61, boilingPoint: 2022, density: 11.34,
    discoveredBy: 'Ancient', yearDiscovered: null,
    commonUses: ['Car batteries (PbSO₄)', 'Radiation shielding', 'Soldering'],
    schoolRelevance: 'Soft heavy metal; PbSO₄ in lead-acid batteries; environmental hazard',
    color: '#a4b0be'
  },
  {
    atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98,
    group: 15, period: 6, category: 'post-transition-metal',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02,
    meltingPoint: 544.55, boilingPoint: 1837, density: 9.807,
    discoveredBy: 'Claude François Geoffroy', yearDiscovered: 1753,
    commonUses: ['Pepto-Bismol (medicine)', 'Alloys (low melting)', 'Cosmetics'],
    schoolRelevance: 'Heaviest stable element; colorful oxide crystals',
    color: '#a4b0be'
  },
  {
    atomicNumber: 84, symbol: 'Po', name: 'Polonium', atomicMass: 209,
    group: 16, period: 6, category: 'metalloid',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2.0,
    meltingPoint: 527, boilingPoint: 1235, density: 9.32,
    discoveredBy: 'Marie Curie', yearDiscovered: 1898,
    commonUses: ['Neutron source', 'Anti-static devices', 'Thermoelectric'],
    schoolRelevance: 'Discovered by Marie Curie; radioactive; named after Poland',
    color: '#2ed573'
  },
  {
    atomicNumber: 85, symbol: 'At', name: 'Astatine', atomicMass: 210,
    group: 17, period: 6, category: 'halogen',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.2,
    meltingPoint: 575, boilingPoint: 610, density: 7.0,
    discoveredBy: 'Dale R. Corson', yearDiscovered: 1940,
    commonUses: ['Cancer treatment (²¹¹At)', 'Research'],
    schoolRelevance: 'Rarest naturally occurring element; radioactive halogen',
    color: '#eccc68'
  },
  {
    atomicNumber: 86, symbol: 'Rn', name: 'Radon', atomicMass: 222,
    group: 18, period: 6, category: 'noble-gas',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: 2.2,
    meltingPoint: 202, boilingPoint: 211.5, density: 0.00973,
    discoveredBy: 'Friedrich Ernst Dorn', yearDiscovered: 1900,
    commonUses: ['Cancer treatment', 'Earthquake prediction research'],
    schoolRelevance: 'Radioactive noble gas; indoor air quality concern; radon gas',
    color: '#c8a2c8'
  },
  {
    atomicNumber: 87, symbol: 'Fr', name: 'Francium', atomicMass: 223,
    group: 1, period: 7, category: 'alkali-metal',
    electronConfig: '[Rn] 7s¹', electronegativity: 0.7,
    meltingPoint: 281, boilingPoint: 890, density: 1.87,
    discoveredBy: 'Marguerite Perey', yearDiscovered: 1939,
    commonUses: ['Research only'],
    schoolRelevance: 'Most reactive alkali metal; radioactive; extremely rare',
    color: '#ff6b6b'
  },
  {
    atomicNumber: 88, symbol: 'Ra', name: 'Radium', atomicMass: 226,
    group: 2, period: 7, category: 'alkaline-earth-metal',
    electronConfig: '[Rn] 7s²', electronegativity: 0.9,
    meltingPoint: 973, boilingPoint: 2010, density: 5.5,
    discoveredBy: 'Marie Curie', yearDiscovered: 1898,
    commonUses: ['Radium dial paint (historical)', 'Cancer treatment'],
    schoolRelevance: 'Discovered by Marie Curie; radioactive; historical medical use',
    color: '#ffa502'
  },
  {
    atomicNumber: 89, symbol: 'Ac', name: 'Actinium', atomicMass: 227,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 6d¹ 7s²', electronegativity: 1.1,
    meltingPoint: 1323, boilingPoint: 3471, density: 10.07,
    discoveredBy: 'André-Louis Debierne', yearDiscovered: 1899,
    commonUses: ['Neutron source', 'Cancer treatment (²²⁵Ac)'],
    schoolRelevance: 'First actinide; gives name to actinide series',
    color: '#a29bfe'
  },
  {
    atomicNumber: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.04,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 6d² 7s²', electronegativity: 1.3,
    meltingPoint: 2023, boilingPoint: 5061, density: 11.72,
    discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1829,
    commonUses: ['Nuclear fuel (potential)', 'Gas mantles', 'Welding electrodes'],
    schoolRelevance: 'Radioactive; potential nuclear fuel; Th-232 decay series',
    color: '#a29bfe'
  },
  {
    atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.04,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.5,
    meltingPoint: 1841, boilingPoint: 4027, density: 15.37,
    discoveredBy: 'Kasimir Fajans', yearDiscovered: 1913,
    commonUses: ['Research only'],
    schoolRelevance: 'Radioactive actinide; in uranium decay chain',
    color: '#a29bfe'
  },
  {
    atomicNumber: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38,
    meltingPoint: 1405.3, boilingPoint: 4404, density: 19.05,
    discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789,
    commonUses: ['Nuclear fuel (U-235)', 'Depleted uranium armor', 'Yellow glass'],
    schoolRelevance: 'Radioactive; nuclear fission fuel; U-235 vs U-238',
    color: '#a29bfe'
  },
  {
    atomicNumber: 93, symbol: 'Np', name: 'Neptunium', atomicMass: 237,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36,
    meltingPoint: 917, boilingPoint: 4175, density: 20.25,
    discoveredBy: 'Edwin McMillan', yearDiscovered: 1940,
    commonUses: ['Neutron detection', 'Research'],
    schoolRelevance: 'First transuranium element; named after Neptune',
    color: '#a29bfe'
  },
  {
    atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: 244,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f⁶ 7s²', electronegativity: 1.28,
    meltingPoint: 912.5, boilingPoint: 3501, density: 19.84,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1940,
    commonUses: ['Nuclear weapons (Pu-239)', 'Nuclear reactors', 'RTG power sources'],
    schoolRelevance: 'Fissile material; Pu-239 in nuclear reactors and weapons',
    color: '#a29bfe'
  },
  {
    atomicNumber: 95, symbol: 'Am', name: 'Americium', atomicMass: 243,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f⁷ 7s²', electronegativity: 1.3,
    meltingPoint: 1449, boilingPoint: 2880, density: 13.67,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1944,
    commonUses: ['Smoke detectors (²⁴¹Am)', 'Research'],
    schoolRelevance: 'In household smoke detectors; named after Americas',
    color: '#a29bfe'
  },
  {
    atomicNumber: 96, symbol: 'Cm', name: 'Curium', atomicMass: 247,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.3,
    meltingPoint: 1613, boilingPoint: 3383, density: 13.51,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1944,
    commonUses: ['Space exploration RTGs', 'Alpha particle sources'],
    schoolRelevance: 'Named after Pierre and Marie Curie; transuranium',
    color: '#a29bfe'
  },
  {
    atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: 247,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f⁹ 7s²', electronegativity: 1.3,
    meltingPoint: 1259, boilingPoint: 2900, density: 14.78,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1949,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Berkeley, California; synthetic element',
    color: '#a29bfe'
  },
  {
    atomicNumber: 98, symbol: 'Cf', name: 'Californium', atomicMass: 251,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.3,
    meltingPoint: 1173, boilingPoint: 1743, density: 15.1,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1950,
    commonUses: ['Neutron startup sources for nuclear reactors', 'Cancer treatment'],
    schoolRelevance: 'Named after California; used as neutron source',
    color: '#a29bfe'
  },
  {
    atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: 252,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹¹ 7s²', electronegativity: 1.3,
    meltingPoint: 1133, boilingPoint: 1269, density: 8.84,
    discoveredBy: 'Albert Ghiorso', yearDiscovered: 1952,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Albert Einstein; discovered in H-bomb debris',
    color: '#a29bfe'
  },
  {
    atomicNumber: 100, symbol: 'Fm', name: 'Fermium', atomicMass: 257,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹² 7s²', electronegativity: 1.3,
    meltingPoint: 1800, boilingPoint: null, density: null,
    discoveredBy: 'Albert Ghiorso', yearDiscovered: 1952,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Enrico Fermi; highly radioactive',
    color: '#a29bfe'
  },
  {
    atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: 258,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹³ 7s²', electronegativity: 1.3,
    meltingPoint: 1100, boilingPoint: null, density: null,
    discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1955,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Dmitri Mendeleev; 101st element',
    color: '#a29bfe'
  },
  {
    atomicNumber: 102, symbol: 'No', name: 'Nobelium', atomicMass: 259,
    group: null, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.3,
    meltingPoint: 1100, boilingPoint: null, density: null,
    discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1966,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Alfred Nobel; synthetic element',
    color: '#a29bfe'
  },
  {
    atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: 266,
    group: 3, period: 7, category: 'actinide',
    electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', electronegativity: 1.3,
    meltingPoint: 1900, boilingPoint: null, density: null,
    discoveredBy: 'Albert Ghiorso', yearDiscovered: 1961,
    commonUses: ['Research only'],
    schoolRelevance: 'Last actinide; named after Ernest Lawrence',
    color: '#a29bfe'
  },
  {
    atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: 267,
    group: 4, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: null,
    meltingPoint: 2400, boilingPoint: 5800, density: 23.2,
    discoveredBy: 'JINR / Lawrence Berkeley', yearDiscovered: 1969,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Ernest Rutherford; transactinide element',
    color: '#ff6348'
  },
  {
    atomicNumber: 105, symbol: 'Db', name: 'Dubnium', atomicMass: 268,
    group: 5, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 29.3,
    discoveredBy: 'JINR / Lawrence Berkeley', yearDiscovered: 1970,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Dubna, Russia; synthetic transactinide',
    color: '#ff6348'
  },
  {
    atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: 269,
    group: 6, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 35.0,
    discoveredBy: 'Lawrence Berkeley', yearDiscovered: 1974,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Glenn Seaborg; transactinide',
    color: '#ff6348'
  },
  {
    atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: 270,
    group: 7, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 37.1,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1981,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Niels Bohr; superheavy element',
    color: '#ff6348'
  },
  {
    atomicNumber: 108, symbol: 'Hs', name: 'Hassium', atomicMass: 269,
    group: 8, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 40.7,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1984,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Hesse, Germany; transactinide',
    color: '#ff6348'
  },
  {
    atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: 278,
    group: 9, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 37.4,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1982,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Lise Meitner; discovered at GSI',
    color: '#778ca3'
  },
  {
    atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: 281,
    group: 10, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d⁸ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 34.8,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1994,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Darmstadt, Germany; superheavy',
    color: '#778ca3'
  },
  {
    atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: 282,
    group: 11, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 28.7,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1994,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Wilhelm Röntgen (X-rays)',
    color: '#778ca3'
  },
  {
    atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: 285,
    group: 12, period: 7, category: 'transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: null,
    meltingPoint: null, boilingPoint: 357, density: 23.7,
    discoveredBy: 'GSI Helmholtz', yearDiscovered: 1996,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Nicolaus Copernicus; may be gas at room temp',
    color: '#ff6348'
  },
  {
    atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: 286,
    group: 13, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: null,
    meltingPoint: 700, boilingPoint: 1430, density: 16,
    discoveredBy: 'RIKEN', yearDiscovered: 2004,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Japan (Nihon); first element discovered in Asia',
    color: '#778ca3'
  },
  {
    atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: 289,
    group: 14, period: 7, category: 'post-transition-metal',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: null,
    meltingPoint: null, boilingPoint: 210, density: 14,
    discoveredBy: 'JINR', yearDiscovered: 1999,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Flerov Laboratory; superheavy element',
    color: '#778ca3'
  },
  {
    atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: 290,
    group: 15, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: null,
    meltingPoint: 670, boilingPoint: 1400, density: 13.5,
    discoveredBy: 'JINR / LLNL', yearDiscovered: 2004,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Moscow Oblast; element 115',
    color: '#778ca3'
  },
  {
    atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: 293,
    group: 16, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: null,
    meltingPoint: 709, boilingPoint: 1085, density: 12.9,
    discoveredBy: 'JINR / LLNL', yearDiscovered: 2000,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Livermore, California; superheavy',
    color: '#778ca3'
  },
  {
    atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: 294,
    group: 17, period: 7, category: 'unknown',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: null,
    meltingPoint: 700, boilingPoint: 883, density: 7.17,
    discoveredBy: 'JINR / ORNL', yearDiscovered: 2010,
    commonUses: ['Research only'],
    schoolRelevance: 'Named after Tennessee, USA; second heaviest halogen',
    color: '#778ca3'
  },
  {
    atomicNumber: 118, symbol: 'Og', name: 'Oganesson', atomicMass: 294,
    group: 18, period: 7, category: 'noble-gas',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', electronegativity: null,
    meltingPoint: null, boilingPoint: null, density: 7.0,
    discoveredBy: 'JINR / LLNL', yearDiscovered: 2002,
    commonUses: ['Research only'],
    schoolRelevance: 'Heaviest known element; named after Yuri Oganessian',
    color: '#c8a2c8'
  },
];

export const ELEMENT_CATEGORY_COLORS: Record<string, string> = {
  'alkali-metal':          '#ff6b6b',
  'alkaline-earth-metal':  '#ffa502',
  'transition-metal':      '#ff6348',
  'post-transition-metal': '#a4b0be',
  'metalloid':             '#2ed573',
  'nonmetal':              '#70a1ff',
  'halogen':               '#eccc68',
  'noble-gas':             '#c8a2c8',
  'lanthanide':            '#ff9f43',
  'actinide':              '#a29bfe',
  'unknown':               '#778ca3',
};

export const CATEGORY_LABELS: Record<string, string> = {
  'alkali-metal':          'Alkali Metal',
  'alkaline-earth-metal':  'Alkaline Earth Metal',
  'transition-metal':      'Transition Metal',
  'post-transition-metal': 'Post-transition Metal',
  'metalloid':             'Metalloid',
  'nonmetal':              'Nonmetal',
  'halogen':               'Halogen',
  'noble-gas':             'Noble Gas',
  'lanthanide':            'Lanthanide',
  'actinide':              'Actinide',
  'unknown':               'Unknown',
};

export function getElementById(atomicNumber: number): PeriodicElement | undefined {
  return ELEMENTS.find(e => e.atomicNumber === atomicNumber);
}

export function getElementsByCategory(category: string): PeriodicElement[] {
  return ELEMENTS.filter(e => e.category === category);
}

export function getElementsByPeriod(period: number): PeriodicElement[] {
  return ELEMENTS.filter(e => e.period === period);
}

export function getElementsByGroup(group: number): PeriodicElement[] {
  return ELEMENTS.filter(e => e.group === group);
}

export function searchElements(query: string): PeriodicElement[] {
  const q = query.toLowerCase();
  return ELEMENTS.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.symbol.toLowerCase().includes(q) ||
    e.atomicNumber.toString() === q
  );
}
