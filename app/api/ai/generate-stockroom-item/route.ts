import { NextRequest, NextResponse } from 'next/server';
import { StockItemDefinition } from '@/components/laboratory/Stockroom';
import {
  resolveServerApiKey,
  generateContentWithFallback,
  classifyGeminiError,
  normalizeGeminiModel,
} from '@/lib/ai/geminiServer';

// Deterministic fallback generator powered by ChemMCP chemical knowledge rules
function generateFallbackStockItem(
  prompt: string,
  categoryHint?: 'solutions' | 'glassware' | 'tools'
): StockItemDefinition {
  const p = prompt.toLowerCase();
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 1. Detect Category
  let category: 'solutions' | 'glassware' | 'tools' = categoryHint || 'solutions';
  if (
    p.includes('flask') ||
    p.includes('beaker') ||
    p.includes('cylinder') ||
    p.includes('tube') ||
    p.includes('dish') ||
    p.includes('burette') ||
    p.includes('cup')
  ) {
    category = 'glassware';
  } else if (
    p.includes('meter') ||
    p.includes('balance') ||
    p.includes('burner') ||
    p.includes('stirrer') ||
    p.includes('thermometer') ||
    p.includes('paper') ||
    p.includes('rod') ||
    p.includes('pipette') ||
    p.includes('tripod') ||
    p.includes('scale')
  ) {
    category = 'tools';
  }

  // 2. Solutions fallback
  if (category === 'solutions') {
    if (p.includes('permanganate') || p.includes('kmno4')) {
      return {
        id,
        name: 'Potassium Permanganate (KMnO₄)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '0.100 M KMnO₄ (50.0 mL, Deep Purple Oxidizer)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#7e22ce',
        pH: 7.0,
        temperature: 25.0,
        species: { 'K+': 0.1, 'MnO4-': 0.1 },
        contentsName: '0.100 M KMnO₄',
      };
    }

    if (p.includes('dichromate') || p.includes('k2cr2o7')) {
      return {
        id,
        name: 'Potassium Dichromate (K₂Cr₂O₇)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '0.100 M K₂Cr₂O₇ (50.0 mL, Bright Orange)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#ea580c',
        pH: 4.2,
        temperature: 25.0,
        species: { 'K+': 0.2, 'Cr2O7(2-)': 0.1 },
        contentsName: '0.100 M K₂Cr₂O₇',
      };
    }

    if (p.includes('sulfate') && (p.includes('iron') || p.includes('feso4'))) {
      return {
        id,
        name: 'Iron(II) Sulfate (FeSO₄)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '0.100 M FeSO₄ (50.0 mL, Pale Green)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#86efac',
        pH: 5.2,
        temperature: 25.0,
        species: { 'Fe2+': 0.1, 'SO4(2-)': 0.1 },
        contentsName: '0.100 M FeSO₄',
      };
    }

    if (p.includes('sulfuric') || p.includes('h2so4')) {
      return {
        id,
        name: 'Sulfuric Acid (H₂SO₄)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '1.000 M H₂SO₄ (50.0 mL, Strong Diprotic Acid)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#e2e8f0',
        pH: 0.3,
        temperature: 25.0,
        species: { 'H+': 2.0, 'SO4(2-)': 1.0 },
        contentsName: '1.000 M H₂SO₄',
      };
    }

    if (p.includes('cobalt') || p.includes('cocl2')) {
      return {
        id,
        name: 'Cobalt(II) Chloride (CoCl₂)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '0.100 M CoCl₂ (50.0 mL, Rose Pink Hydrate)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#f43f5e',
        pH: 6.2,
        temperature: 25.0,
        species: { 'Co2+': 0.1, 'Cl-': 0.2 },
        contentsName: '0.100 M CoCl₂',
      };
    }

    if (p.includes('ammonia') || p.includes('nh3') || p.includes('nh4oh')) {
      return {
        id,
        name: 'Aqueous Ammonia (NH₃·H₂O)',
        category: 'solutions',
        type: 'beaker-100',
        subtitle: '1.000 M NH₃(aq) (50.0 mL, Weak Alkaline Base)',
        volume: 50,
        maxVolume: 100,
        liquidColor: '#ecfdf5',
        pH: 11.6,
        temperature: 25.0,
        species: { 'NH4+': 0.004, 'OH-': 0.004, 'NH3(aq)': 0.996 },
        contentsName: '1.000 M NH₃',
      };
    }

    return {
      id,
      name: prompt.trim().slice(0, 32),
      category: 'solutions',
      type: 'beaker-100',
      subtitle: 'Custom Prepared Reagent (50.0 mL, pH 7.0)',
      volume: 50,
      maxVolume: 100,
      liquidColor: '#38bdf8',
      pH: 7.0,
      temperature: 25.0,
      species: { '[Custom]': 0.1 },
      contentsName: prompt.trim().slice(0, 32),
    };
  }

  // 3. Glassware fallback
  if (category === 'glassware') {
    let type = 'beaker-250';
    let maxVolume = 250;
    if (p.includes('flask') || p.includes('erlenmeyer') || p.includes('conical')) {
      type = 'conical-flask-250';
      maxVolume = 250;
    } else if (p.includes('tube')) {
      type = 'test-tube';
      maxVolume = 25;
    } else if (p.includes('cylinder')) {
      type = 'cylinder-100';
      maxVolume = 100;
    } else if (p.includes('dish')) {
      type = 'evaporating-dish';
      maxVolume = 50;
    } else if (p.includes('burette')) {
      type = 'burette-50';
      maxVolume = 50;
    } else if (p.includes('funnel')) {
      type = 'filter-funnel';
      maxVolume = 60;
    }

    return {
      id,
      name: prompt.trim().slice(0, 32),
      category: 'glassware',
      type,
      subtitle: `Calibrated Lab Glassware (${maxVolume} mL Capacity)`,
      volume: 0,
      maxVolume,
      liquidColor: '#38bdf8',
      pH: 7.0,
      temperature: 25.0,
      species: {},
      contentsName: 'Empty',
    };
  }

  // 4. Tools fallback
  let toolType = 'glass-rod';
  if (p.includes('stirrer') || p.includes('hotplate') || p.includes('burner')) {
    toolType = 'burner';
  } else if (p.includes('meter') || p.includes('probe')) {
    toolType = p.includes('conductivity') ? 'conductivity-meter' : 'ph-meter';
  } else if (p.includes('balance') || p.includes('scale')) {
    toolType = 'analytical-balance';
  } else if (p.includes('thermometer')) {
    toolType = 'thermometer';
  } else if (p.includes('funnel') || p.includes('paper')) {
    toolType = 'filter-paper';
  } else if (p.includes('pipette') || p.includes('dropper')) {
    toolType = 'dropper-pipette';
  }

  return {
    id,
    name: prompt.trim().slice(0, 32),
    category: 'tools',
    type: toolType,
    subtitle: 'Calibrated Laboratory Instrument',
  };
}

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  try {
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const categoryHint = body.category as
      | 'solutions'
      | 'glassware'
      | 'tools'
      | undefined;

    if (!prompt) {
      return NextResponse.json(
        {
          error:
            'Please specify the chemical solution, glassware, or tool to generate.',
        },
        { status: 400 }
      );
    }

    const { apiKey } = resolveServerApiKey(req, body.apiKey);
    const requestedModel = normalizeGeminiModel(body.model);

    if (apiKey) {
      try {
        const systemPrompt = `You are an expert computational chemist and virtual lab apparatus architect.
The user wants to generate a new laboratory item for the ChemLab Virtual Workbench Stockroom.
User prompt: "${prompt}"
Category hint: ${categoryHint || 'auto-detect'}

Generate a single laboratory item adhering strictly to this JSON format:
{
  "id": "custom-${Date.now()}",
  "name": "Standard Chemical or Equipment Name (e.g. 0.5 M Potassium Permanganate or 250mL Round Bottom Flask)",
  "category": "solutions" | "glassware" | "tools",
  "type": "beaker-250" | "beaker-100" | "conical-flask-250" | "test-tube" | "cylinder-100" | "evaporating-dish" | "burette-50" | "foam-cup" | "filter-funnel" | "dropper-pipette" | "analytical-balance" | "ph-meter" | "conductivity-meter" | "burner" | "tripod" | "retort-stand" | "glass-rod" | "filter-paper" | "thermometer",
  "subtitle": "Short descriptive badge with concentration, pH, or precision details",
  "volume": 50,
  "maxVolume": 100,
  "liquidColor": "#7e22ce",
  "pH": 7.0,
  "temperature": 25.0,
  "isInsulated": false,
  "species": {
    "K+": 0.5,
    "MnO4-": 0.5
  },
  "contentsName": "Short solution display name (e.g. 0.5 M KMnO4)",
  "solidAmount": 0
}

CRITICAL RULES:
1. Liquid color MUST be an authentic HEX code reflecting actual chemical appearance in solution.
2. pH must be chemically accurate for the given acid/base/salt concentration.
3. Return ONLY valid JSON, without markdown formatting or code blocks.`;

        const { text: rawText, modelUsed } = await generateContentWithFallback({
          apiKey,
          preferredModel: requestedModel,
          contents: systemPrompt,
          responseMimeType: 'application/json',
          timeoutMs: 12000,
        });

        const cleanedJson = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        const item = JSON.parse(cleanedJson) as StockItemDefinition;
        if (item.name && item.category && item.type) {
          return NextResponse.json({
            success: true,
            source: 'gemini',
            model: modelUsed,
            item: {
              ...item,
              id: item.id || `custom-${Date.now()}`,
              isAiGenerated: true,
            },
          });
        }
      } catch (geminiError: unknown) {
        const classified = classifyGeminiError(geminiError, apiKey);
        console.warn(
          `[generate-stockroom-item] Gemini fallback (${classified.code}): ${classified.technicalReason}`
        );
      }
    }

    // Fallback: ChemMCP Engine
    const fallbackItem = generateFallbackStockItem(prompt, categoryHint);
    return NextResponse.json({
      success: true,
      source: 'chemmcp-engine',
      item: {
        ...fallbackItem,
        isAiGenerated: true,
      },
    });
  } catch (error: unknown) {
    const classified = classifyGeminiError(error);
    return NextResponse.json(
      { error: classified.userMessage || 'Failed to generate stockroom item.' },
      { status: 500 }
    );
  }
}
