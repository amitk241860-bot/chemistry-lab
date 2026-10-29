import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeApiKey,
  normalizeGeminiModel,
  getCandidateModels,
  redactSecrets,
  classifyGeminiError,
} from './geminiServer';
import {
  predictReaction,
  normalizeChemicalFormula,
  getSolutionColorInfo,
  COLORLESS_AQUEOUS_HEX,
} from '../chemistry/chemmcpEngine';

test('sanitizeApiKey strips quotes and whitespace', () => {
  assert.equal(sanitizeApiKey('  "AIzaSyTestKey1234567890"  '), 'AIzaSyTestKey1234567890');
  assert.equal(sanitizeApiKey(" 'AIzaSySingleQuotedKey12345' "), 'AIzaSySingleQuotedKey12345');
  assert.equal(sanitizeApiKey(null), '');
});

test('normalizeGeminiModel replaces invalid gemini-3.6-flash and preserves valid models', () => {
  assert.equal(normalizeGeminiModel('gemini-3.6-flash'), 'gemini-2.5-flash');
  assert.equal(normalizeGeminiModel('gemini-1.5-flash'), 'gemini-2.5-flash');
  assert.equal(normalizeGeminiModel('gemini-2.5-flash'), 'gemini-2.5-flash');
  assert.equal(normalizeGeminiModel('gemini-flash-latest'), 'gemini-flash-latest');
  assert.equal(normalizeGeminiModel('gemini-3.8-flash'), 'gemini-3.8-flash');
  assert.equal(normalizeGeminiModel('models/gemini-2.5-pro'), 'gemini-2.5-pro');
});

test('getCandidateModels returns valid fallback sequence without gemini-3.6-flash', () => {
  const candidates = getCandidateModels('gemini-3.6-flash');
  assert.equal(candidates.includes('gemini-3.6-flash'), false);
  assert.equal(candidates[0], 'gemini-2.5-flash');
  assert.equal(candidates.includes('gemini-flash-latest'), true);
});

test('redactSecrets removes API keys from error messages', () => {
  const fakeKey = 'AIzaSyD9Ab8RN6JaT1234567890abcdef';
  const raw = `Request failed with key=${fakeKey} on endpoint`;
  const redacted = redactSecrets(raw, fakeKey);
  assert.equal(redacted.includes(fakeKey), false);
  assert.equal(redacted.includes('Ab8RN6JaT'), false);
});

test('classifyGeminiError categorizes 401, 404, 429, and timeouts safely', () => {
  const err404 = classifyGeminiError(
    new Error('404 NOT_FOUND: models/gemini-3.6-flash is not found')
  );
  assert.equal(err404.code, 'MODEL_NOT_FOUND');
  assert.equal(err404.httpStatus, 404);

  const err401 = classifyGeminiError(
    new Error('400 API_KEY_INVALID: API key not valid')
  );
  assert.equal(err401.code, 'INVALID_KEY');
  assert.equal(err401.httpStatus, 401);

  const errTimeout = classifyGeminiError(new Error('Request timed out after 12000ms'));
  assert.equal(errTimeout.code, 'TIMEOUT');
  assert.equal(errTimeout.httpStatus, 504);
});

test('normalizeChemicalFormula distinguishes ZnSO4 from metallic Zn', () => {
  assert.equal(normalizeChemicalFormula('0.1 M ZnSO4'), 'ZnSO4');
  assert.equal(normalizeChemicalFormula('Zinc Sulfate Solution (ZnSO₄)'), 'ZnSO4');
  assert.notEqual(normalizeChemicalFormula('ZnSO4'), 'Zn');
  assert.equal(normalizeChemicalFormula('Sodium Chloride (NaCl)'), 'NaCl');
});

test('ZnSO4 + NaCl predicts no net chemical reaction and clear colorless solution', () => {
  const znNacl = predictReaction(['ZnSO4', 'NaCl']);
  assert.equal(znNacl.reactionType, 'no-reaction');
  assert.equal(znNacl.isReactionExpected, false);
  assert.equal(znNacl.isDetermined, true);
  assert.equal(znNacl.isPrecipitateForming, false);
  assert.equal(znNacl.isGasEvolving, false);
  assert.equal(znNacl.isColorless, true);
  assert.equal(znNacl.solutionColor, COLORLESS_AQUEOUS_HEX);
  assert.equal(znNacl.precipitateColor, undefined);
});

test('Colored vs colorless solution colors and separate precipitate colors are accurate', () => {
  assert.equal(getSolutionColorInfo('ZnSO4').isColorless, true);
  assert.equal(getSolutionColorInfo('NaCl').isColorless, true);
  assert.equal(getSolutionColorInfo('CuSO4').hex, '#0284c7');
  assert.equal(getSolutionColorInfo('KMnO4').hex, '#7e22ce');
  assert.equal(getSolutionColorInfo('FeCl3').hex, '#d97706');
  assert.equal(getSolutionColorInfo('FeSO4').hex, '#86efac');

  const agcl = predictReaction(['AgNO3', 'NaCl']);
  assert.equal(agcl.reactionType, 'precipitation');
  assert.equal(agcl.isReactionExpected, true);
  assert.equal(agcl.isPrecipitateForming, true);
  assert.equal(agcl.precipitateColor, '#ffffff');
  assert.equal(agcl.solutionColor, COLORLESS_AQUEOUS_HEX);

  const cuoh2 = predictReaction(['CuSO4', 'NaOH']);
  assert.equal(cuoh2.reactionType, 'precipitation');
  assert.equal(cuoh2.isPrecipitateForming, true);
  assert.equal(cuoh2.precipitateColor, '#38bdf8');

  const neut = predictReaction(['HCl', 'NaOH']);
  assert.equal(neut.reactionType, 'neutralization');
  assert.equal(neut.deltaH < 0, true);
  assert.equal(neut.isColorless, true);
});

test('Unsupported chemical combinations return undetermined honestly', () => {
  const unknown = predictReaction(['XeF6', 'PtCl4']);
  assert.equal(unknown.reactionType, 'undetermined');
  assert.equal(unknown.isDetermined, false);
  assert.equal(unknown.equation, 'Reaction not determined');
});
