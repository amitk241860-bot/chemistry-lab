// ============================================================
// pH Indicators & Color Transition Engine
// ============================================================

export interface IndicatorInfo {
  id: string;
  name: string;
  range: string;
  acidColorName: string;
  baseColorName: string;
  getColor: (pH: number) => string;
  getDescription: (pH: number) => string;
}

export const INDICATORS: Record<string, IndicatorInfo> = {
  litmus: {
    id: 'litmus',
    name: 'Litmus Solution',
    range: 'pH 5.0 – 8.0',
    acidColorName: 'Red',
    baseColorName: 'Blue',
    getColor: (pH: number) => {
      if (pH < 6.0) return '#ef4444'; // Red
      if (pH > 7.5) return '#3b82f6'; // Blue
      return '#a855f7'; // Purple (neutral)
    },
    getDescription: (pH: number) => {
      if (pH < 6.0) return 'Red (Acidic, pH < 6)';
      if (pH > 7.5) return 'Blue (Basic, pH > 7.5)';
      return 'Purple (Neutral, pH ~7)';
    },
  },
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    range: 'pH 8.3 – 10.0',
    acidColorName: 'Colourless',
    baseColorName: 'Pink / Magenta',
    getColor: (pH: number) => {
      if (pH < 8.2) return 'transparent';
      if (pH <= 9.0) return 'rgba(244, 114, 182, 0.5)'; // Faint pink
      if (pH <= 10.5) return '#ec4899'; // Vibrant pink
      return '#be185d'; // Deep magenta
    },
    getDescription: (pH: number) => {
      if (pH < 8.2) return 'Colourless (Acidic/Neutral, pH < 8.2)';
      if (pH <= 9.0) return 'Faint Pink (Equivalence Point, pH 8.3–9.0)';
      return 'Deep Pink/Magenta (Basic, pH > 9.0)';
    },
  },
  methyl_orange: {
    id: 'methyl_orange',
    name: 'Methyl Orange',
    range: 'pH 3.1 – 4.4',
    acidColorName: 'Red',
    baseColorName: 'Yellow',
    getColor: (pH: number) => {
      if (pH < 3.1) return '#ef4444'; // Red
      if (pH <= 4.4) return '#f97316'; // Orange
      return '#eab308'; // Yellow
    },
    getDescription: (pH: number) => {
      if (pH < 3.1) return 'Red (Strongly Acidic, pH < 3.1)';
      if (pH <= 4.4) return 'Orange (Transition, pH 3.1–4.4)';
      return 'Yellow (Mildly Acidic/Neutral/Basic, pH > 4.4)';
    },
  },
  universal: {
    id: 'universal',
    name: 'Universal Indicator',
    range: 'pH 0 – 14 Full Spectrum',
    acidColorName: 'Red',
    baseColorName: 'Violet',
    getColor: (pH: number) => {
      const rounded = Math.max(0, Math.min(14, Math.round(pH)));
      const palette: Record<number, string> = {
        0: '#dc2626', // Deep Red (Conc. HCl)
        1: '#ef4444', // Red
        2: '#f87171', // Light Red (Gastric juice)
        3: '#fb923c', // Orange-Red (Vinegar)
        4: '#f97316', // Orange (Tomato juice)
        5: '#fbbf24', // Yellow-Orange
        6: '#fde047', // Light Yellow (Milk, saliva)
        7: '#22c55e', // Green (Pure water)
        8: '#14b8a6', // Blue-Green (Eggs)
        9: '#06b6d4', // Cyan (Baking soda)
        10: '#3b82f6', // Light Blue (Milk of magnesia)
        11: '#6366f1', // Blue (Ammonia)
        12: '#8b5cf6', // Violet
        13: '#a855f7', // Purple (Bleach)
        14: '#7e22ce', // Deep Purple/Indigo (1M NaOH)
      };
      return palette[rounded] || '#22c55e';
    },
    getDescription: (pH: number) => {
      const rounded = Math.max(0, Math.min(14, Math.round(pH)));
      const desc: Record<number, string> = {
        0: 'pH 0: Strongly acidic (Deep Red)',
        1: 'pH 1: Strongly acidic (Red)',
        2: 'pH 2: Strongly acidic (Light Red)',
        3: 'pH 3: Moderately acidic (Orange-Red)',
        4: 'pH 4: Moderately acidic (Orange)',
        5: 'pH 5: Weakly acidic (Yellow-Orange)',
        6: 'pH 6: Weakly acidic (Light Yellow)',
        7: 'pH 7: Neutral (Green)',
        8: 'pH 8: Weakly alkaline (Blue-Green)',
        9: 'pH 9: Weakly alkaline (Cyan)',
        10: 'pH 10: Alkaline (Light Blue)',
        11: 'pH 11: Strongly alkaline (Blue)',
        12: 'pH 12: Strongly alkaline (Violet)',
        13: 'pH 13: Strongly alkaline (Purple)',
        14: 'pH 14: Extremely alkaline (Deep Indigo)',
      };
      return desc[rounded] || `pH ${pH}`;
    },
  },
};
