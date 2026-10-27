import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { predictReaction } from '@/lib/chemistry/chemmcpEngine';

export interface CustomExperimentSetup {
  id: string;
  title: string;
  description: string;
  equation: string;
  reactionType: string;
  initialApparatus: Array<{
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    volume: number;
    maxVolume: number;
    temperature: number;
    liquidColor: string;
    ph: number;
    activeChemicals: string[];
    isHeating?: boolean;
    hasFilterPaper?: boolean;
    hasResidue?: boolean;
  }>;
  milestones: Array<{
    step: number;
    title: string;
    instruction: string;
    requiredAction: 'pour' | 'heat' | 'mix' | 'measure' | 'observe';
    sourceId?: string;
    targetId?: string;
    minVolume?: number;
    targetTemp?: number;
    successMessage: string;
    hintMessage?: string;
  }>;
  expectedOutcomes: {
    deltaH: number;
    isExothermic: boolean;
    precipitate: boolean;
    precipitateColor?: string;
    gasEvolution: boolean;
    gasType?: string;
    finalColor: string;
    visualSummary: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guideText = (body.guide || '').trim();
    const userApiKey =
      body.apiKey ||
      req.headers.get('x-gemini-api-key') ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    let preferredModel = body.model || 'gemini-3.6-flash';
    if (preferredModel.includes('1.5') || preferredModel.includes('2.5')) {
      preferredModel = 'gemini-3.6-flash';
    }

    if (!guideText) {
      return NextResponse.json(
        { error: 'Please provide an experiment guide, procedure, or aim.' },
        { status: 400 }
      );
    }

    // Try Gemini AI Generation if API key is provided
    if (userApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: userApiKey });

        const prompt = `You are an expert computational chemist and virtual laboratory architect for ChemLab VLab.
Analyze the following user-submitted laboratory experiment guide or procedure.
Extract the chemical reaction, plan the initial apparatus layout on the interactive workbench, and construct sequential validation milestones.

USER GUIDE / PROCEDURE:
"""
${guideText}
"""

RESPOND ONLY WITH VALID STRICT JSON (no markdown formatting, no code fences, no extra text) matching this JSON structure:
{
  "id": "exp-custom-${Date.now()}",
  "title": "Clear experiment title",
  "description": "Concise summary of aim and objective",
  "equation": "Balanced chemical equation with state symbols e.g. AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq)",
  "reactionType": "precipitation" | "neutralization" | "complexation" | "redox" | "gas-evolution" | "thermal" | "dilution",
  "initialApparatus": [
    {
      "id": "item-1",
      "name": "Reagent 1 Container (e.g. 0.1M AgNO3)",
      "type": "beaker-250" | "beaker-100" | "conical-flask-250" | "test-tube" | "cylinder-100" | "evaporating-dish" | "burette-50" | "dropper-pipette" | "glass-rod" | "thermometer" | "burner" | "tripod",
      "x": 160,
      "y": 320,
      "volume": 50,
      "maxVolume": 250,
      "temperature": 25.0,
      "liquidColor": "#38bdf8",
      "ph": 6.8,
      "activeChemicals": ["Ag+(aq)", "NO3-(aq)"]
    },
    {
      "id": "item-2",
      "name": "Reagent 2 Container (e.g. 0.1M NaCl)",
      "type": "beaker-100",
      "x": 420,
      "y": 320,
      "volume": 50,
      "maxVolume": 100,
      "temperature": 25.0,
      "liquidColor": "#38bdf8",
      "ph": 7.0,
      "activeChemicals": ["Na+(aq)", "Cl-(aq)"]
    }
  ],
  "milestones": [
    {
      "step": 1,
      "title": "Mix Reagents",
      "instruction": "Transfer Reagent 2 into Reagent 1 container.",
      "requiredAction": "pour",
      "sourceId": "item-2",
      "targetId": "item-1",
      "minVolume": 20,
      "successMessage": "Right step! Reagents mixed successfully.",
      "hintMessage": "Use the pour dialog to transfer solutions."
    }
  ],
  "expectedOutcomes": {
    "deltaH": -25.0,
    "isExothermic": true,
    "precipitate": true,
    "precipitateColor": "#ffffff",
    "gasEvolution": false,
    "gasType": "None",
    "finalColor": "#ffffff",
    "visualSummary": "Detailed observation of the reaction"
  }
}

CRITICAL RULES:
1. Ensure the x and y coordinates are nicely spaced on the canvas (x between 140 and 650, y between 150 and 380) so elements do NOT overlap!
2. Liquid colors must be authentic hex codes (e.g. Cu2+ is '#0284c7', FeSCN2+ is '#991b1b', PbI2 is '#eab308', neutral water is '#38bdf8').
3. Milestones must accurately reflect the steps needed to complete the experiment safely.`;

        const response = await ai.models.generateContent({
          model: preferredModel,
          contents: prompt,
        });

        const rawText = (response.text || '').trim();
        // Remove markdown backticks if any
        const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanedJson) as CustomExperimentSetup;
        if (parsed.title && parsed.initialApparatus && parsed.milestones) {
          return NextResponse.json({
            success: true,
            source: 'gemini-ai',
            model: preferredModel,
            setup: parsed,
          });
        }
      } catch (aiErr: any) {
        console.warn('Gemini AI parsing failed, falling back to local ChemMCP engine:', aiErr);
      }
    }

    // Deterministic Local ChemMCP Rule-Based Fallback
    const setup = generateDeterministicSetup(guideText);
    return NextResponse.json({
      success: true,
      source: 'chemmcp-local-engine',
      setup,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze experiment guide.' },
      { status: 500 }
    );
  }
}

// Fallback generator using ChemMCP intelligence
function generateDeterministicSetup(guide: string): CustomExperimentSetup {
  const lower = guide.toLowerCase();

  // Detect reactants
  const reactants: string[] = [];
  if (lower.includes('silver') || lower.includes('agno3')) reactants.push('AgNO3');
  if (lower.includes('sodium chloride') || lower.includes('nacl')) reactants.push('NaCl');
  if (lower.includes('barium') || lower.includes('bacl2')) reactants.push('BaCl2');
  if (lower.includes('sulfate') || lower.includes('na2so4')) reactants.push('Na2SO4');
  if (lower.includes('lead') || lower.includes('pb(')) reactants.push('Pb(NO3)2');
  if (lower.includes('potassium iodide') || lower.includes('ki')) reactants.push('KI');
  if (lower.includes('iron') || lower.includes('fecl3')) reactants.push('FeCl3');
  if (lower.includes('thiocyanate') || lower.includes('kscn')) reactants.push('KSCN');
  if (lower.includes('hydrochloric') || lower.includes('hcl')) reactants.push('HCl');
  if (lower.includes('hydroxide') || lower.includes('naoh')) reactants.push('NaOH');
  if (lower.includes('zinc') || lower.includes('zn')) reactants.push('Zn');

  if (reactants.length < 2) {
    // Default to classic double displacement if unspecified
    reactants.push('AgNO3', 'NaCl');
  }

  const prediction = predictReaction(reactants);

  // Setup apparatus based on reaction type
  const isNeutralization = prediction.reactionType === 'neutralization';
  const isPrecipitation = prediction.reactionType === 'precipitation';
  const isComplexation = prediction.reactionType === 'complexation';

  const r1Name = reactants[0] || 'Reactant A';
  const r2Name = reactants[1] || 'Reactant B';

  const initialApparatus: CustomExperimentSetup['initialApparatus'] = [
    {
      id: 'vessel-1',
      name: `Reaction Beaker (contains 50 mL 0.1M ${r1Name})`,
      type: 'beaker-250',
      x: 230,
      y: 320,
      volume: 50,
      maxVolume: 250,
      temperature: 25.0,
      liquidColor: isComplexation ? '#fef08a' : '#38bdf8',
      ph: isNeutralization ? 1.0 : 6.8,
      activeChemicals: [`${r1Name}(aq)`],
    },
    {
      id: 'vessel-2',
      name: `Supply Beaker (contains 50 mL 0.1M ${r2Name})`,
      type: 'beaker-100',
      x: 480,
      y: 320,
      volume: 50,
      maxVolume: 100,
      temperature: 25.0,
      liquidColor: '#38bdf8',
      ph: isNeutralization ? 13.0 : 7.0,
      activeChemicals: [`${r2Name}(aq)`],
    },
    {
      id: 'tool-rod',
      name: 'Glass Stirring Rod',
      type: 'glass-rod',
      x: 350,
      y: 200,
      volume: 0,
      maxVolume: 0,
      temperature: 25.0,
      liquidColor: 'transparent',
      ph: 7.0,
      activeChemicals: [],
    },
  ];

  const milestones: CustomExperimentSetup['milestones'] = [
    {
      step: 1,
      title: 'Position Reaction Apparatus',
      instruction: `Inspect the Reaction Beaker containing ${r1Name} and the Supply Beaker with ${r2Name} on the bench.`,
      requiredAction: 'observe',
      successMessage: 'Setup inspected! Reagents ready for reaction.',
      hintMessage: 'Check the liquid volumes and solution properties in the info panel.',
    },
    {
      step: 2,
      title: `Mix ${r2Name} into ${r1Name}`,
      instruction: `Pour 25 mL of ${r2Name} from the supply beaker into the reaction vessel.`,
      requiredAction: 'pour',
      sourceId: 'vessel-2',
      targetId: 'vessel-1',
      minVolume: 20,
      successMessage: `Right step! Solutions mixed. ${prediction.visualObservation}`,
      hintMessage: 'Drag the supply beaker over the reaction vessel to initiate transfer.',
    },
    {
      step: 3,
      title: 'Stir & Measure Final State',
      instruction: 'Observe the visual reaction outcome, color change, and final solution temperature.',
      requiredAction: 'observe',
      successMessage: `Reaction completed successfully! Equation: ${prediction.equation}`,
      hintMessage: 'Review the chemical species in the Solution Info Panel.',
    },
  ];

  return {
    id: `exp-custom-${Date.now()}`,
    title: prediction.reactionType !== 'no-reaction'
      ? `Investigation of ${prediction.products.map((p) => p.name).join(' & ')} Formation`
      : 'Custom Virtual Chemistry Experiment',
    description: `Experimental verification of the reaction: ${prediction.equation}`,
    equation: prediction.equation,
    reactionType: prediction.reactionType,
    initialApparatus,
    milestones,
    expectedOutcomes: {
      deltaH: prediction.deltaH,
      isExothermic: prediction.deltaH < 0,
      precipitate: prediction.isPrecipitateForming,
      precipitateColor: prediction.precipitateColor || '#ffffff',
      gasEvolution: prediction.isGasEvolving,
      gasType: prediction.gasType || 'None',
      finalColor: prediction.products[0]?.color || '#38bdf8',
      visualSummary: prediction.visualObservation,
    },
  };
}
