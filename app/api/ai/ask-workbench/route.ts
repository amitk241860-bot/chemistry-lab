import { NextRequest, NextResponse } from 'next/server';
import { predictReaction } from '@/lib/chemistry/chemmcpEngine';
import {
  resolveServerApiKey,
  generateContentWithFallback,
  classifyGeminiError,
  normalizeGeminiModel,
} from '@/lib/ai/geminiServer';

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  try {
    const { mode, vesselA, vesselB, vessel, question, workbenchItems } = body;
    const { apiKey } = resolveServerApiKey(req, body.apiKey);
    const requestedModel = normalizeGeminiModel(body.model);

    // --- MODE 1: PREDICT CHEMICAL MIXING ---
    if (mode === 'predict-mixing') {
      const chemA = vesselA?.name || vesselA?.contentsName || '';
      const chemB = vesselB?.name || vesselB?.contentsName || '';

      // First run local ChemMCP deterministic prediction
      const localOutcome = predictReaction([chemA, chemB]);

      if (apiKey) {
        try {
          const prompt = `You are a virtual chemistry lab co-pilot.
The student is performing an experiment and wants to know:
What will happen if we mix "${chemA}" with "${chemB}"?

Return a JSON object with this exact shape:
{
  "equation": "Balanced molecular and ionic chemical equation",
  "reactionType": "precipitation | acid-base | redox | gas-evolution | complexation | no-reaction",
  "products": [
    { "name": "Compound name", "formula": "Chemical formula", "state": "aq|s|l|g", "color": "#hex" }
  ],
  "precipitate": true or false,
  "precipitateName": "Name and color of precipitate if any",
  "gasEvolution": true or false,
  "gasType": "Gas name and formula if any",
  "deltaH": number in kJ/mol (negative for exothermic, positive for endothermic),
  "temperatureChange": "e.g. +6.5°C rise (Exothermic) or No significant thermal shift",
  "visualObservation": "Detailed 2-sentence description of what will be seen in the beaker",
  "safetyWarning": "Safety precautions for handling these reagents"
}
Output only valid JSON.`;

          const { text, modelUsed } = await generateContentWithFallback({
            apiKey,
            preferredModel: requestedModel,
            contents: prompt,
            responseMimeType: 'application/json',
            timeoutMs: 12000,
          });

          const cleaned = text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();
          const parsed = JSON.parse(cleaned || '{}');
          return NextResponse.json({
            success: true,
            source: 'gemini',
            model: modelUsed,
            data: parsed,
          });
        } catch (err: unknown) {
          const classified = classifyGeminiError(err, apiKey);
          console.warn(
            `[ask-workbench:predict-mixing] Gemini fallback (${classified.code}): ${classified.technicalReason}`
          );
        }
      }

      // ChemMCP Local Fallback
      return NextResponse.json({
        success: true,
        source: 'chemmcp',
        data: {
          equation: localOutcome.equation,
          reactionType: localOutcome.reactionType,
          products: localOutcome.products,
          precipitate: localOutcome.isPrecipitateForming,
          precipitateName:
            localOutcome.products.find((p) => p.state === 's')?.name || null,
          gasEvolution: localOutcome.isGasEvolving,
          gasType: localOutcome.gasType || null,
          deltaH: localOutcome.deltaH,
          temperatureChange:
            localOutcome.deltaH < 0
              ? `Exothermic: Temperature increases by ~${localOutcome.tempChangeExpected || 2.5}°C`
              : localOutcome.deltaH > 0
              ? `Endothermic: Temperature decreases by ~${localOutcome.tempChangeExpected || 2.0}°C`
              : 'Negligible temperature change (0.0°C)',
          visualObservation: localOutcome.visualObservation,
          safetyWarning:
            'Wear safety goggles and lab coat. Pour slowly down the beaker wall.',
        },
      });
    }

    // --- MODE 2: PREDICT BURNER HEATING EFFECT ---
    if (mode === 'predict-heating') {
      const vesselName = vessel?.name || 'Vessel';
      const contentsName = vessel?.contentsName || 'Solution';
      const currentTemp = vessel?.temperature || 25.0;

      if (apiKey) {
        try {
          const prompt = `You are an expert physical chemistry simulator co-pilot.
A student is placing "${vesselName}" (containing "${contentsName}", current temperature: ${currentTemp}°C) over an active Bunsen burner.

Explain what will happen through the burner heating and cooling cycle.
Return a JSON object with this exact shape:
{
  "boilingPoint": number (in °C, e.g. 100 or 102),
  "heatingRate": "Expected temperature rise rate (e.g. +2.2°C per second under steady flame)",
  "coolingRate": "Expected cooling rate once burner is removed (e.g. -0.6°C per second back to 25°C)",
  "thermalDecomposition": true or false,
  "decompositionEquation": "Balanced equation if thermal breakdown occurs, or 'None (physical boiling only)'",
  "phaseChanges": "Step-by-step description of phase transitions (ambient heating -> convective simmering -> vigorous boiling -> steam evolution -> solvent evaporation -> solid crystallisation)",
  "solidResidue": "Description of any salt crust or residue remaining after liquid boils off",
  "temperatureCurveSummary": "Summary of how temperature increases while heated and decreases once flame is removed",
  "safetyPrecautions": "Precautions: use tongs, do not touch heated glass, watch for thermal bumping"
}
Output only valid JSON.`;

          const { text, modelUsed } = await generateContentWithFallback({
            apiKey,
            preferredModel: requestedModel,
            contents: prompt,
            responseMimeType: 'application/json',
            timeoutMs: 12000,
          });

          const cleaned = text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();
          const parsed = JSON.parse(cleaned || '{}');
          return NextResponse.json({
            success: true,
            source: 'gemini',
            model: modelUsed,
            data: parsed,
          });
        } catch (err: unknown) {
          const classified = classifyGeminiError(err, apiKey);
          console.warn(
            `[ask-workbench:predict-heating] Gemini fallback (${classified.code}): ${classified.technicalReason}`
          );
        }
      }

      // Local Deterministic Thermal Simulation Summary
      const isSalt =
        contentsName.toLowerCase().includes('salt') ||
        contentsName.toLowerCase().includes('nacl');
      return NextResponse.json({
        success: true,
        source: 'chemmcp',
        data: {
          boilingPoint: isSalt ? 102.5 : 100.0,
          heatingRate: '+2.2°C per second under steady oxidizing blue flame',
          coolingRate:
            '-0.6°C per second natural convective cooling towards 25.0°C',
          thermalDecomposition: false,
          decompositionEquation:
            'H₂O(l) + Heat → H₂O(g)↑ (Physical boiling; solvent vaporization)',
          phaseChanges:
            '1. Temperature rises linearly from 25°C to 100°C.\n2. Vigorous bubbling and steam vapor condensation.\n3. Water volume steadily decreases as steam evolves.\n4. Dissolved solute crystallizes out as white residue.',
          solidResidue: isSalt
            ? 'Dry white crystalline Sodium Chloride (NaCl) crust coats the evaporating dish.'
            : 'Evaporates cleanly to dryness if pure distilled water.',
          temperatureCurveSummary:
            'Heating increases kinetic energy from 25°C to 100°C plateau. Turning off the burner results in gradual temperature decrease back to ambient 25°C.',
          safetyPrecautions:
            'Use crucible tongs to handle hot glassware. Never heat a closed container. Allow cooling before touching.',
        },
      });
    }

    // --- MODE 3: FREEFORM AI LAB ASSISTANT QUESTION ---
    if (mode === 'ask-question') {
      const q = typeof question === 'string' ? question.trim() : '';
      if (!q) {
        return NextResponse.json(
          { success: false, error: 'Please enter a chemistry question.' },
          { status: 400 }
        );
      }

      const benchSummary = (workbenchItems || [])
        .map(
          (it: any) =>
            `- ${it.name} (${it.type}): volume=${it.volume}mL, temp=${it.temperature}°C, pH=${it.pH}, contents=${it.contentsName}`
        )
        .join('\n');

      if (apiKey) {
        try {
          const prompt = `You are a helpful, expert AI Virtual Chemistry Lab Assistant.
The student is running a custom chemistry experiment with the following active apparatus on the workbench:
${benchSummary || 'No apparatus placed yet.'}

The student asks:
"${q}"

Provide a concise, encouraging, and accurate answer (under 150 words). Include chemical equations, temperature changes, or color changes where relevant.`;

          const { text, modelUsed } = await generateContentWithFallback({
            apiKey,
            preferredModel: requestedModel,
            contents: prompt,
            timeoutMs: 12000,
          });

          return NextResponse.json({
            success: true,
            source: 'gemini',
            model: modelUsed,
            answer: text || 'No response generated.',
          });
        } catch (err: unknown) {
          const classified = classifyGeminiError(err, apiKey);
          console.warn(
            `[ask-workbench:ask-question] Gemini fallback (${classified.code}): ${classified.technicalReason}`
          );
          return NextResponse.json({
            success: true,
            source: 'chemmcp',
            aiWarning: classified.userMessage,
            answer: buildLocalTutorAnswer(q, workbenchItems || []),
          });
        }
      }

      return NextResponse.json({
        success: true,
        source: 'chemmcp',
        answer: buildLocalTutorAnswer(q, workbenchItems || []),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const classified = classifyGeminiError(error);
    return NextResponse.json(
      { success: false, error: classified.userMessage || 'Server error' },
      { status: 500 }
    );
  }
}

function buildLocalTutorAnswer(question: string, workbenchItems: any[]): string {
  const qLower = question.toLowerCase();
  const activeReagents = workbenchItems
    .filter((i) => i.volume > 0 || i.contentsName)
    .map((i) => i.name || i.contentsName)
    .filter(Boolean);

  const outcome =
    activeReagents.length >= 2
      ? predictReaction(activeReagents)
      : predictReaction(['AgNO3', 'NaCl']);

  if (qLower.includes('precipitate') || qLower.includes('compound')) {
    if (outcome.isPrecipitateForming) {
      const solid = outcome.products.find((p) => p.state === 's');
      return `[ChemMCP Local Tutor] Based on your workbench reagents (${activeReagents.join(
        ' + '
      )}), mixing forms an insoluble precipitate: ${
        solid ? `${solid.name} (${solid.formula})` : 'solid precipitate'
      }.\nEquation: ${outcome.equation}\nObservation: ${outcome.visualObservation}`;
    }
    return `[ChemMCP Local Tutor] For the current reagents on your bench, no insoluble precipitate forms (${outcome.equation}). ${outcome.visualObservation}`;
  }

  if (
    qLower.includes('temp') ||
    qLower.includes('exothermic') ||
    qLower.includes('endothermic') ||
    qLower.includes('heat') ||
    qLower.includes('100')
  ) {
    if (qLower.includes('100') || qLower.includes('plateau') || qLower.includes('boil')) {
      return `[ChemMCP Local Tutor] During boiling at 100°C (at 1 atm), thermal energy supplied by the Bunsen burner is absorbed as latent heat of vaporization (ΔH_vap = 40.7 kJ/mol) to convert liquid H₂O(l) into steam H₂O(g)↑ rather than raising kinetic temperature.`;
    }
    const thermalType =
      outcome.deltaH < 0
        ? `exothermic (ΔH = ${outcome.deltaH} kJ/mol, temperature rises by ~+${outcome.tempChangeExpected}°C)`
        : outcome.deltaH > 0
        ? `endothermic (ΔH = +${outcome.deltaH} kJ/mol, temperature drops)`
        : 'thermally neutral (ΔH ≈ 0 kJ/mol)';
    return `[ChemMCP Local Tutor] The reaction (${outcome.equation}) is ${thermalType}. ${outcome.visualObservation}`;
  }

  return `[ChemMCP Local Tutor] Active reaction analysis: ${outcome.equation} (${outcome.reactionType}). ${outcome.visualObservation}`;
}
