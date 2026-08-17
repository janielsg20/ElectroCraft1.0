import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGeminiGateway } from '../dist/server/gateway.js';
import { GeminiNativeCapabilityAdapter } from '../dist/server/gemini-native-capability-adapter.js';
import { CURRENT_RUNTIME_MODELS } from '../dist/shared/model-resolver.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
if (!apiKey.trim()) {
  console.error('BLOCKED_MISSING_GEMINI_API_KEY');
  process.exit(2);
}
const gateway = createGeminiGateway({ apiKey });

const plan = await gateway.generatePlan({
  profile: 'Calidad',
  prompt: 'Devuelve un GenerationPlanPoc válido para una pantalla de catálogo. Solo Draft: inspect, draft, validate. Usa únicamente herramientas permitidas.',
});
if (!plan.title || plan.steps.length < 1 || plan.requestedTools.some((tool) => tool === 'apply_to_project')) {
  throw new Error('Structured output did not satisfy ElectroCraft policy');
}

const toolResult = await gateway.runToolLoop({
  profile: 'Rápido',
  prompt: 'Primero usa get_app_summary con scope selected y luego confirma brevemente que prepararías un borrador sin aplicar cambios.',
});
if (!toolResult.toolCalls.includes('get_app_summary') || toolResult.stepCount > 3) throw new Error('Bounded tool loop failed');

const stream = gateway.streamDraft({
  profile: 'Rápido',
  prompt: 'Responde exactamente: POC_STREAM_OK',
});
let streamed = '';
for await (const chunk of stream.textStream) streamed += chunk;
if (!streamed.trim()) throw new Error('Streaming produced no text');

const abort = new AbortController();
abort.abort();
let cancellation = false;
try {
  await gateway.generatePlan({ prompt: 'No debe ejecutarse', abortSignal: abort.signal });
} catch (error) {
  cancellation = error?.name === 'AbortError';
}
if (!cancellation) throw new Error('Cancellation gate did not fail closed');

const image = await gateway.generateDraftImage({ prompt: 'Minimal technical placeholder: a blue geometric app card on a neutral background, no text.' });
if (!image.mediaType.startsWith('image/') || image.bytes.byteLength === 0) throw new Error('Image generation returned no image');
const imageSha256 = createHash('sha256').update(image.bytes).digest('hex');

const native = new GeminiNativeCapabilityAdapter(apiKey);
const interaction = await native.probeStableInteractions();
if (interaction.status !== 'completed' || !interaction.outputText.includes('POC_INTERACTIONS_OK') || !interaction.interactionIdPresent) {
  throw new Error(`Interactions v1 probe failed: ${JSON.stringify(interaction)}`);
}

const result = {
  status: 'PASS_LIVE_GEMINI',
  structuredOutput: true,
  toolLoop: true,
  streaming: true,
  cancellation: true,
  image: true,
  interactionsV1: true,
  logicalProfiles: Object.keys(CURRENT_RUNTIME_MODELS),
  resolvedModelsSessionOnly: CURRENT_RUNTIME_MODELS,
  imageEvidence: { mediaType: image.mediaType, byteLength: image.bytes.byteLength, sha256: imageSha256 },
  planEvidence: { artifactType: plan.artifactType, stepCount: plan.steps.length, requestedTools: plan.requestedTools },
  toolEvidence: { stepCount: toolResult.stepCount, toolCalls: toolResult.toolCalls },
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'live-result.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
