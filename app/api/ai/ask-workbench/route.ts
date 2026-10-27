import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { predictReaction } from '@/lib/chemistry/chemmcpEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, vesselA, vesselB, vessel, question, workbenchItems } = body;
    const userApiKey =
      body.apiKey ||
      req.headers.get('x-gemini-api-key') ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // --- MODE 1: PREDICT CHEMICAL MIXING ---
    if (mode === 'predict-mixing') {
      const chemA = vesselA?.name || vesselA?.contentsName || '';
      const chemB = vesselB?.name || vesselB?.contentsName || '';

      // First run local ChemMCP deterministic prediction
      const localOutcome = predictReaction([chemA, chemB]);

      // If user provided Gemini API key, augment with rich AI analysis
      if (userApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: userApiKey });
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

          const response = await ai.models.generateContent({
            model: body.model || 'gemini-3.6-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          return NextResponse.json({
            success: true,
            source: 'gemini',
            data: parsed,
          });
        } catch (err: any) {
          console.warn('Gemini mixing prediction fallback to local engine:', err?.message);
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
          precipitateName: localOutcome.products.find((p) => p.state === 's')?.name || null,
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
          safetyWarning: 'Wear safety goggles and lab coat. Pour slowly down the beaker wall.',
        },
      });
    }

    // --- MODE 2: PREDICT BURNER HEATING EFFECT ---
    if (mode === 'predict-heating') {
      const vesselName = vessel?.name || 'Vessel';
      const contentsName = vessel?.contentsName || 'Solution';
      const currentTemp = vessel?.temperature || 25.0;

      if (userApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: userApiKey });
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

          const response = await ai.models.generateContent({
            model: body.model || 'gemini-3.6-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          return NextResponse.json({
            success: true,
            source: 'gemini',
            data: parsed,
          });
        } catch (err: any) {
          console.warn('Gemini burner prediction fallback to local engine:', err?.message);
        }
      }

      // Local Deterministic Thermal Simulation Summary
      const isSalt = contentsName.toLowerCase().includes('salt') || contentsName.toLowerCase().includes('nacl');
      return NextResponse.json({
        success: true,
        source: 'chemmcp',
        data: {
          boilingPoint: isSalt ? 102.5 : 100.0,
          heatingRate: '+2.2°C per second under steady oxidizing blue flame',
          coolingRate: '-0.6°C per second natural convective cooling towards 25.0°C',
          thermalDecomposition: false,
          decompositionEquation: 'H₂O(l) + Heat → H₂O(g)↑ (Physical boiling; solvent vaporization)',
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
      if (!userApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google Gemini API key required for freeform questions. Add your API key in Settings (⚙️).',
          },
          { status: 400 }
        );
      }

      const ai = new GoogleGenAI({ apiKey: userApiKey });
      const benchSummary = (workbenchItems || [])
        .map(
          (it: any) =>
            `- ${it.name} (${it.type}): volume=${it.volume}mL, temp=${it.temperature}°C, pH=${it.pH}, contents=${it.contentsName}`
        )
        .join('\n');

      const prompt = `You are a helpful, expert AI Virtual Chemistry Lab Assistant.
The student is running a custom chemistry experiment with the following active apparatus on the workbench:
${benchSummary || 'No apparatus placed yet.'}

The student asks:
"${question}"

Provide a concise, encouraging, and accurate answer (under 150 words). Include chemical equations, temperature changes, or color changes where relevant.`;

      const response = await ai.models.generateContent({
        model: body.model || 'gemini-3.6-flash',
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        answer: response.text || 'No response generated.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid mode' }, { status: 400 });
  } catch (error: any) {
    console.error('Ask workbench error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
