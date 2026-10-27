import type { ClassId } from '@/types/experiment';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  experimentIds: string[];
}

export interface ClassCurriculum {
  classId: ClassId;
  title: string;
  board: string;
  description: string;
  chapters: Chapter[];
}

export const CURRICULUM: Record<ClassId, ClassCurriculum> = {
  9: {
    classId: 9,
    title: 'Class 9 Chemistry (CBSE)',
    board: 'NCERT / CBSE',
    description: 'Foundational concepts of matter, mixtures, solutions, atoms and molecules.',
    chapters: [
      {
        id: 'c9-ch1',
        number: 1,
        title: 'Matter in Our Surroundings',
        description: 'Physical nature of matter, states of matter, and phase transitions.',
        experimentIds: ['c9-e4'],
      },
      {
        id: 'c9-ch2',
        number: 2,
        title: 'Is Matter Around Us Pure?',
        description: 'Mixtures, solutions, suspensions, colloids, and separation techniques.',
        experimentIds: ['c9-e1', 'c9-e2', 'c9-e3', 'c9-e5'],
      },
    ],
  },
  10: {
    classId: 10,
    title: 'Class 10 Chemistry (CBSE)',
    board: 'NCERT / CBSE',
    description: 'Chemical reactions, acids, bases, salts, metals, non-metals, and carbon compounds.',
    chapters: [
      {
        id: 'c10-ch1',
        number: 1,
        title: 'Chemical Reactions and Equations',
        description: 'Types of reactions: combination, decomposition, displacement, and redox.',
        experimentIds: ['c10-e3', 'c10-e4'],
      },
      {
        id: 'c10-ch2',
        number: 2,
        title: 'Acids, Bases and Salts',
        description: 'Properties of acids and bases, indicators, pH scale, and neutralization.',
        experimentIds: ['c10-e1', 'c10-e2'],
      },
      {
        id: 'c10-ch4',
        number: 4,
        title: 'Carbon and its Compounds',
        description: 'Covalent bonding, homologous series, and soap cleansing action.',
        experimentIds: ['c10-e5'],
      },
    ],
  },
  11: {
    classId: 11,
    title: 'Class 11 Chemistry (CBSE)',
    board: 'NCERT / CBSE',
    description: 'Quantitative concepts, equilibrium, atomic spectra, and volumetric analysis.',
    chapters: [
      {
        id: 'c11-ch1',
        number: 1,
        title: 'Some Basic Concepts of Chemistry',
        description: 'Mole concept, molarity, standard solutions, and stoichiometric calculations.',
        experimentIds: ['c11-e1', 'c11-e2', 'c11-e3'],
      },
      {
        id: 'c11-ch2',
        number: 2,
        title: 'Structure of Atom & Periodic Trends',
        description: 'Atomic emission spectra, electron excitation, and flame coloration.',
        experimentIds: ['c11-e5'],
      },
      {
        id: 'c11-ch7',
        number: 7,
        title: 'Equilibrium',
        description: "Dynamic equilibrium, law of mass action, and Le Chatelier's principle.",
        experimentIds: ['c11-e4'],
      },
    ],
  },
  12: {
    classId: 12,
    title: 'Class 12 Chemistry (CBSE)',
    board: 'NCERT / CBSE',
    description: 'Advanced redox titrations, chemical kinetics, electrochemistry, and qualitative analysis.',
    chapters: [
      {
        id: 'c12-ch2',
        number: 2,
        title: 'Electrochemistry',
        description: 'Galvanic cells, Daniell cell, Nernst equation, and standard electrode potential.',
        experimentIds: ['c12-e3'],
      },
      {
        id: 'c12-ch3',
        number: 3,
        title: 'Chemical Kinetics',
        description: 'Rates of reaction, factors affecting reaction rate, and collision theory.',
        experimentIds: ['c12-e2'],
      },
      {
        id: 'c12-ch4',
        number: 4,
        title: 'Surface Chemistry & Colloids',
        description: 'Lyophilic and lyophobic sols, Tyndall effect, and colloidal stability.',
        experimentIds: ['c12-e5'],
      },
      {
        id: 'c12-ch8',
        number: 8,
        title: 'd and f-Block Elements & Volumetric Analysis',
        description: 'KMnO₄ redox titration and transition metal catalytic behaviour.',
        experimentIds: ['c12-e1'],
      },
      {
        id: 'c12-ch14',
        number: 14,
        title: 'Qualitative Inorganic Analysis',
        description: 'Systematic scheme for identification of acidic and basic radicals in salts.',
        experimentIds: ['c12-e4'],
      },
    ],
  },
};
