import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import {
  predictReaction,
  normalizeChemicalFormula,
  getSolutionColorInfo,
  COLORLESS_AQUEOUS_HEX,
} from '@/lib/chemistry/chemmcpEngine';
import {
  resolveServerApiKey,
  normalizeGeminiModel,
} from '@/lib/ai/geminiServer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomExperimentSetup = Record<string, any>;

export interface SelectedChemicalInput {
  formula: string;
  name?: string;
  concentration?: string;
  volumeML?: number;
}

/**
 * Extract chemical formulas from free-form guide text or structured chemical list
 */
function extractFormulasFromInput(
  guide: string,
  chemicals?: SelectedChemicalInput[]
): string[] {
  if (Array.isArray(chemicals) && chemicals.length > 0) {
    return chemicals
      .map((c) => normalizeChemicalFormula(c.formula || c.name || '') || c.formula.trim())
      .filter(Boolean);
  }

  const lower = guide.toLowerCase();
  const detected: string[] = [];

  const patterns: Array<{ match: RegExp; formula: string }> = [
    { match: /\bznso4\b|zinc\s+sulfate|zinc\s+sulphate/i, formula: 'ZnSO4' },
    { match: /\bcuso4\b|copper\(ii\)\s+sulfate|copper\s+sulfate|copper\s+sulphate/i, formula: 'CuSO4' },
    { match: /\bfeso4\b|iron\(ii\)\s+sulfate|ferrous\s+sulfate/i, formula: 'FeSO4' },
    { match: /\bfecl3\b|iron\(iii\)\s+chloride|ferric\s+chloride/i, formula: 'FeCl3' },
    { match: /\bkmno4\b|potassium\s+permanganate/i, formula: 'KMnO4' },
    { match: /\bagno3\b|silver\s+nitrate/i, formula: 'AgNO3' },
    { match: /\bbacl2\b|barium\s+chloride/i, formula: 'BaCl2' },
    { match: /\bna2so4\b|sodium\s+sulfate|sodium\s+sulphate/i, formula: 'Na2SO4' },
    { match: /\bna2co3\b|sodium\s+carbonate/i, formula: 'Na2CO3' },
    { match: /\bpb\(no3\)2\b|lead\(ii\)\s+nitrate|lead\s+nitrate/i, formula: 'Pb(NO3)2' },
    { match: /\bkscn\b|potassium\s+thiocyanate/i, formula: 'KSCN' },
    { match: /\bnacl\b|sodium\s+chloride|salt\s+solution/i, formula: 'NaCl' },
    { match: /\bnaoh\b|sodium\s+hydroxide/i, formula: 'NaOH' },
    { match: /\bhcl\b|hydrochloric\s+acid/i, formula: 'HCl' },
    { match: /\bh2so4\b|sulfuric\s+acid|sulphuric\s+acid/i, formula: 'H2SO4' },
    { match: /\bki\b|potassium\s+iodide/i, formula: 'KI' },
    { match: /\bcacl2\b|calcium\s+chloride/i, formula: 'CaCl2' },
    { match: /\bmgso4\b|magnesium\s+sulfate/i, formula: 'MgSO4' },
    { match: /\bkno3\b|potassium\s+nitrate/i, formula: 'KNO3' },
    { match: /\bnh4cl\b|ammonium\s+chloride/i, formula: 'NH4Cl' },
    { match: /\bnh3\b|ammonia/i, formula: 'NH3' },
    { match: /\bzn\b(?!\s*so4)|metallic\s+zinc|zinc\s+granules|zinc\s+metal/i, formula: 'Zn' },
  ];

  for (const item of patterns) {
    if (item.match.test(guide) && !detected.includes(item.formula)) {
      detected.push(item.formula);
    }
  }

  if (detected.length === 0 && (lower.includes('water') || lower.includes('h2o'))) {
    detected.push('H2O');
  }

  return detected;
}

/**
 * Deterministic ChemMCP Fallback Builder
 * Uses verified stoichiometry and real-world solution/precipitate colors.
 */
function buildFallbackExperimentSetup(
  guide: string,
  chemicals?: SelectedChemicalInput[]
) {
  const formulas = extractFormulasFromInput(guide, chemicals);
  const chemPrediction = predictReaction(formulas.length > 0 ? formulas : ['H2O']);

  const structuredChemicals: SelectedChemicalInput[] =
    Array.isArray(chemicals) && chemicals.length > 0
      ? chemicals.map((c) => {
          const norm = normalizeChemicalFormula(c.formula || c.name || '') || c.formula.trim();
          return {
            formula: norm,
            name: c.name || getSolutionColorInfo(norm).name,
            concentration: c.concentration || '0.1 M',
            volumeML: Number(c.volumeML) > 0 ? Number(c.volumeML) : 50,
          };
        })
      : formulas.map((formula) => {
          const info = getSolutionColorInfo(formula);
          return {
            formula,
            name: info.name,
            concentration: '0.1 M',
            volumeML: 50,
          };
        });

  const initialApparatus: Array<{
    id: string;
    type: string;
    name: string;
    label: string;
    volume: number;
    maxVolume: number;
    liquidColor: string;
    pH: number;
    temperature: number;
    contentsName: string;
    activeChemicals: string[];
    chemicalFormula?: string;
    concentration?: string;
  }> = [];

  if (structuredChemicals.length > 0) {
    structuredChemicals.forEach((chem, index) => {
      const colorInfo = getSolutionColorInfo(chem.formula);
      const label = `${chem.concentration || '0.1 M'} ${chem.formula} (${chem.volumeML || 50} mL)`;
      initialApparatus.push({
        id: `vessel-${index + 1}`,
        type: index === 0 ? 'beaker-250' : 'beaker-100',
        name: label,
        label,
        volume: chem.volumeML || 50,
        maxVolume: index === 0 ? 250 : 100,
        liquidColor: colorInfo.hex,
        pH: colorInfo.defaultPH,
        temperature: 25,
        contentsName: `${chem.concentration || '0.1 M'} ${chem.formula}`,
        activeChemicals: [chem.formula],
        chemicalFormula: chem.formula,
        concentration: chem.concentration || '0.1 M',
      });
    });

    if (structuredChemicals.length >= 2) {
      initialApparatus.push({
        id: 'vessel-receiver',
        type: 'beaker-250',
        name: 'Reaction Beaker (250 mL)',
        label: 'Reaction Beaker (250 mL)',
        volume: 0,
        maxVolume: 250,
        liquidColor: COLORLESS_AQUEOUS_HEX,
        pH: 7.0,
        temperature: 25,
        contentsName: 'Empty',
        activeChemicals: [],
      });
    }
  } else {
    initialApparatus.push(
      {
        id: 'vessel-1',
        type: 'beaker-250',
        name: 'Reaction Beaker (250 mL)',
        label: 'Reaction Beaker (250 mL)',
        volume: 50,
        maxVolume: 250,
        liquidColor: COLORLESS_AQUEOUS_HEX,
        pH: 7.0,
        temperature: 25,
        contentsName: 'Distilled Water',
        activeChemicals: ['H2O'],
      },
      {
        id: 'vessel-2',
        type: 'thermometer',
        name: 'Digital Thermometer',
        label: 'Digital Thermometer',
        volume: 0,
        maxVolume: 0,
        liquidColor: '#ef4444',
        pH: 7.0,
        temperature: 25,
        contentsName: 'Thermometer',
        activeChemicals: [],
      }
    );
  }

  const productStrings = chemPrediction.products.map(
    (p) => `${p.name} (${p.formula}${p.state === 's' ? '↓' : ''})`
  );

  const chemTitle =
    structuredChemicals.length >= 2
      ? `${structuredChemicals.map((c) => c.formula).join(' + ')} Aqueous Reaction Analysis`
      : guide.split('\n')[0]?.slice(0, 60)?.trim() || 'Custom Virtual Chemistry Experiment';

  const steps = [
    {
      id: 1,
      step: 1,
      title: 'Inspect Initial Reagents',
      instruction:
        structuredChemicals.length >= 2
          ? `Inspect the initial reagent vessels containing ${structuredChemicals
              .map((c) => `${c.volumeML || 50} mL of ${c.concentration || '0.1 M'} ${c.formula}`)
              .join(' and ')}.`
          : 'Inspect the initial reagents and apparatus placed on the laboratory workbench.',
      hint: 'Click any vessel to inspect its initial pH, temperature, and dissolved ions.',
      hintMessage: 'Click any vessel to inspect its initial pH, temperature, and dissolved ions.',
      notification: `Reagents ready: ${structuredChemicals.map((c) => c.formula).join(' + ') || 'Standard aqueous setup'}.`,
      successMessage: 'Initial reagents verified.',
      requiredAction: 'observe',
    },
    {
      id: 2,
      step: 2,
      title: 'Mix Reagents & Observe Phase Behavior',
      instruction:
        structuredChemicals.length >= 2
          ? `Click "Mix" or drag ${structuredChemicals[1].formula} onto ${structuredChemicals[0].formula} to combine the solutions in the reaction beaker.`
          : 'Transfer the reagent into the reaction vessel or apply heat as needed.',
      hint: 'Watch the liquid meniscus, color transition, and bottom of the beaker for any solid precipitate or gas bubbles.',
      hintMessage: 'Watch the liquid meniscus, color transition, and bottom of the beaker.',
      notification: chemPrediction.visualObservation,
      successMessage: chemPrediction.visualObservation,
      requiredAction: 'pour',
    },
    {
      id: 3,
      step: 3,
      title: 'Verify Stoichiometry & AI Analysis',
      instruction:
        'Review the Experiment Results & AI Analysis panel to verify the balanced equation, net ionic equation, and spectator ions.',
      hint: `Expected outcome: ${chemPrediction.equation}`,
      hintMessage: `Expected outcome: ${chemPrediction.equation}`,
      notification: chemPrediction.isReactionExpected
        ? `Reaction verified: ${productStrings.join(', ')}`
        : chemPrediction.isDetermined
        ? 'No net chemical reaction occurs — ions remain dissolved in a clear solution.'
        : 'Reaction not determined from verified rules.',
      successMessage: 'Reaction analysis verified.',
      requiredAction: 'observe',
    },
  ];

  return {
    id: `exp-custom-${Date.now()}`,
    title: chemTitle,
    reactionType: chemPrediction.reactionType,
    equation: chemPrediction.equation,
    description:
      structuredChemicals.length >= 2
        ? `Investigate the aqueous mixing of ${structuredChemicals
            .map((c) => `${c.concentration || '0.1 M'} ${c.formula}`)
            .join(' and ')} and observe solution color, phase behavior, and ionic equilibria.`
        : guide.slice(0, 200),
    category:
      chemPrediction.reactionType === 'no-reaction'
        ? 'Aqueous Ion Equilibrium (No Net Reaction)'
        : chemPrediction.reactionType === 'undetermined'
        ? 'Exploratory Chemical Analysis'
        : `${chemPrediction.reactionType.toUpperCase()} Reaction Practical`,
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    principle: `${chemPrediction.equation} (${chemPrediction.netIonicEquation || chemPrediction.equation}) — ΔH = ${chemPrediction.deltaH} kJ/mol`,
    objective:
      structuredChemicals.length >= 2
        ? `Investigate the aqueous mixing of ${structuredChemicals
            .map((c) => `${c.concentration || '0.1 M'} ${c.formula}`)
            .join(' and ')} and observe solution color, phase behavior, and ionic equilibria.`
        : guide.slice(0, 200),
    safetyNotes: chemPrediction.safetyNotes,
    requiredEquipment: Array.from(new Set(initialApparatus.map((a) => a.type))),
    steps,
    milestones: steps,
    initialApparatus,
    expectedOutcomes: {
      isReactionExpected: chemPrediction.isReactionExpected,
      isDetermined: chemPrediction.isDetermined,
      reactionType: chemPrediction.reactionType,
      finalColor: chemPrediction.solutionColor,
      solutionColor: chemPrediction.solutionColor,
      isColorless: chemPrediction.isColorless,
      precipitate: chemPrediction.isPrecipitateForming,
      precipitateColor: chemPrediction.precipitateColor || '',
      precipitateName: chemPrediction.precipitateName || '',
      gasEvolution: chemPrediction.isGasEvolving,
      gasName: chemPrediction.gasType || '',
      targetTempC: Number((25 + (chemPrediction.tempChangeExpected || 0)).toFixed(1)),
      targetPH: chemPrediction.targetPH ?? 7.0,
      balancedEquation: chemPrediction.equation,
      netIonicEquation: chemPrediction.netIonicEquation || chemPrediction.equation,
      reactants: structuredChemicals.map((c) => c.formula),
      products:
        productStrings.length > 0
          ? productStrings
          : chemPrediction.reactionType === 'no-reaction'
          ? structuredChemicals.map((c) => `${c.formula}(aq, spectator ions)`)
          : [],
      observations: [chemPrediction.visualObservation, chemPrediction.explanation].filter(Boolean),
      explanation: chemPrediction.explanation,
      summaryObservation: chemPrediction.visualObservation,
      visualSummary: chemPrediction.visualObservation,
      safetyNotes: chemPrediction.safetyNotes,
    },
  };
}

export async function POST(req: NextRequest) {
  let guideText = '';
  let chemicalsInput: SelectedChemicalInput[] | undefined;

  try {
    const body = await req.json();
    guideText = typeof body?.guide === 'string' ? body.guide.trim() : '';
    chemicalsInput = Array.isArray(body?.chemicals) ? body.chemicals : undefined;

    if (!guideText && (!chemicalsInput || chemicalsInput.length === 0)) {
      return NextResponse.json(
        { error: 'Please select at least one chemical or enter a laboratory experiment guide.' },
        { status: 400 }
      );
    }

    if (guideText.length > 10000) {
      return NextResponse.json(
        { error: 'Laboratory guide text exceeds maximum length (10,000 characters).' },
        { status: 400 }
      );
    }

    const combinedDescription =
      guideText ||
      (chemicalsInput || [])
        .map((c) => `${c.volumeML || 50} mL of ${c.concentration || '0.1 M'} ${c.formula}`)
        .join(' mixed with ');

    const deterministicSetup = buildFallbackExperimentSetup(combinedDescription, chemicalsInput);

    // Server-side API key resolution (never trust client keys alone)
    const { apiKey } = resolveServerApiKey(req, body?.apiKey);

    if (!apiKey) {
      return NextResponse.json({
        experiment: deterministicSetup,
        warning:
          'GEMINI_API_KEY is not configured on the server (.env.local). Generated experiment using local ChemMCP stoichiometric engine.',
        aiSource: 'chemmcp-fallback',
      });
    }

    const modelId = normalizeGeminiModel(body?.model);
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an expert Chemistry Laboratory Professor and ChemMCP AI Engine.
Analyze the user's chemical reagents and laboratory guide and return a structured JSON virtual experiment configuration.

REACTANTS & VERIFIED CHEMMCP STOICHIOMETRY:
- Reactants: ${JSON.stringify(deterministicSetup.expectedOutcomes.reactants)}
- Verified Reaction Type: ${deterministicSetup.expectedOutcomes.reactionType}
- Is Reaction Expected: ${deterministicSetup.expectedOutcomes.isReactionExpected}
- Balanced Equation: ${deterministicSetup.expectedOutcomes.balancedEquation}
- Net Ionic Equation: ${deterministicSetup.expectedOutcomes.netIonicEquation}
- Supernatant Solution Color (Hex): ${deterministicSetup.expectedOutcomes.solutionColor} (Colorless=${deterministicSetup.expectedOutcomes.isColorless})
- Precipitate Forming: ${deterministicSetup.expectedOutcomes.precipitate} (${deterministicSetup.expectedOutcomes.precipitateName || 'none'}, Hex=${deterministicSetup.expectedOutcomes.precipitateColor || 'none'})
- Gas Evolution: ${deterministicSetup.expectedOutcomes.gasEvolution} (${deterministicSetup.expectedOutcomes.gasName || 'none'})

CRITICAL SCIENTIFIC ACCURACY RULES:
1. Never invent precipitates or gas bubbles when all ion combinations are soluble in water (e.g., ZnSO4 + NaCl -> No net reaction; clear, colorless solution #e2e8f0; precipitate: false; gasEvolution: false).
2. Distinguish between dissolved solution color (finalColor / solutionColor) and solid precipitate color (precipitateColor). For example, AgNO3 + NaCl forms a white AgCl precipitate (#ffffff) in a clear, colorless supernatant solution (#e2e8f0).
3. If a chemical combination cannot be determined with certainty, state "Reaction not determined" rather than guessing.`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GEMINI_REQUEST_TIMEOUT')), 12000)
    );

    const generationPromise = ai.models.generateContent({
      model: modelId,
      contents: `Reagents & Guide:\n"""\n${combinedDescription}\n"""\n\nGenerate the complete virtual experiment JSON configuration.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER },
            principle: { type: Type.STRING },
            objective: { type: Type.STRING },
            safetyNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            expectedOutcomes: {
              type: Type.OBJECT,
              properties: {
                finalColor: { type: Type.STRING },
                precipitate: { type: Type.BOOLEAN },
                precipitateColor: { type: Type.STRING },
                gasEvolution: { type: Type.BOOLEAN },
                targetTempC: { type: Type.NUMBER },
                targetPH: { type: Type.NUMBER },
                balancedEquation: { type: Type.STRING },
                summaryObservation: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: [
                'finalColor',
                'precipitate',
                'gasEvolution',
                'targetTempC',
                'targetPH',
                'balancedEquation',
                'summaryObservation',
              ],
            },
          },
          required: [
            'title',
            'category',
            'principle',
            'objective',
            'safetyNotes',
            'expectedOutcomes',
          ],
        },
      },
    });

    const response = await Promise.race([generationPromise, timeoutPromise]);
    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    const verifiedOutcomes = deterministicSetup.expectedOutcomes;
    const mergedOutcomes = verifiedOutcomes.isDetermined
      ? {
          ...verifiedOutcomes,
          explanation: parsed.expectedOutcomes?.explanation || verifiedOutcomes.explanation,
        }
      : {
          ...verifiedOutcomes,
          ...parsed.expectedOutcomes,
          isReactionExpected:
            parsed.expectedOutcomes?.balancedEquation &&
            !String(parsed.expectedOutcomes.balancedEquation).toLowerCase().includes('no reaction') &&
            !String(parsed.expectedOutcomes.balancedEquation).toLowerCase().includes('not determined'),
          isDetermined:
            Boolean(parsed.expectedOutcomes?.balancedEquation) &&
            !String(parsed.expectedOutcomes.balancedEquation).toLowerCase().includes('not determined'),
          solutionColor: parsed.expectedOutcomes?.finalColor || verifiedOutcomes.solutionColor,
        };

    const customExperiment = {
      ...deterministicSetup,
      ...parsed,
      id: `exp-custom-${Date.now()}`,
      initialApparatus: deterministicSetup.initialApparatus,
      steps: deterministicSetup.steps,
      milestones: deterministicSetup.milestones,
      expectedOutcomes: mergedOutcomes,
    };

    return NextResponse.json({
      experiment: customExperiment,
      aiSource: 'gemini-api',
      modelUsed: modelId,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[analyze-experiment] Gemini API error:', errMessage);

    if (guideText || (chemicalsInput && chemicalsInput.length > 0)) {
      const combined =
        guideText ||
        (chemicalsInput || []).map((c) => `${c.concentration || '0.1 M'} ${c.formula}`).join(' + ');
      const fallback = buildFallbackExperimentSetup(combined, chemicalsInput);
      return NextResponse.json({
        experiment: fallback,
        warning: `Gemini API unavailable (${errMessage.slice(0, 120)}). Generated experiment using verified ChemMCP stoichiometry engine.`,
        aiSource: 'chemmcp-fallback',
      });
    }

    return NextResponse.json(
      { error: 'Failed to analyze experiment guide.' },
      { status: 500 }
    );
  }
}
