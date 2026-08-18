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
  profile: 'Código',
  prompt: 'Devuelve un GenerationPlanPoc válido para crear un componente React de ElectroCraft. artifactType debe ser component. Solo inspect, draft y validate; jamás Apply. Usa únicamente herramientas permitidas.',
});
if (plan.artifactType !== 'component' || !plan.title || plan.steps.length < 1 || plan.requestedTools.some((tool) => tool === 'apply_to_project')) {
  throw new Error('Structured code plan did not satisfy ElectroCraft policy');
}

const codeArtifact = await gateway.generateCodeArtifact({
  profile: 'Código',
  prompt: 'Genera un componente React TypeScript pequeño llamado StatusBadge para ElectroCraft. artifactType=component. Usa rutas relativas, incluye al menos un archivo TSX exportable, sin secretos, sin acceso de red, sin instalación de paquetes y draftOnly=true.',
});
if (codeArtifact.artifactType !== 'component' || codeArtifact.files.length < 1) throw new Error('Code artifact missing component files');
const entry = codeArtifact.files.find((file) => file.path === codeArtifact.entryFile);
if (!entry || !/(export|function|const|class)/.test(entry.content)) throw new Error('Generated code entry file is not usable source code');
const codeBytes = Buffer.from(codeArtifact.files.map((file) => `${file.path}\n${file.content}`).join('\n---\n'));
const codeSha256 = createHash('sha256').update(codeBytes).digest('hex');

const toolResult = await gateway.runToolLoop({
  profile: 'Rápido',
  prompt: 'Primero usa get_app_summary con scope selected y luego confirma brevemente que prepararías código Draft sin aplicar cambios.',
});
if (!toolResult.toolCalls.includes('get_app_summary') || toolResult.stepCount > 3) throw new Error('Bounded tool loop failed');

const stream = gateway.streamCodeDraft({
  profile: 'Código',
  prompt: 'Devuelve una sola línea de JavaScript que contenga exactamente el identificador POC_STREAM_CODE_OK y un valor true.',
});
let streamed = '';
for await (const chunk of stream.textStream) streamed += chunk;
if (!streamed.includes('POC_STREAM_CODE_OK')) throw new Error('Streaming code marker missing');

const abort = new AbortController();
abort.abort();
let cancellation = false;
try {
  await gateway.generateCodeArtifact({ prompt: 'No debe ejecutarse', abortSignal: abort.signal });
} catch (error) {
  cancellation = error?.name === 'AbortError';
}
if (!cancellation) throw new Error('Cancellation gate did not fail closed');

const native = new GeminiNativeCapabilityAdapter(apiKey);
const interaction = await native.probeStableInteractions();
if (interaction.status !== 'completed' || !interaction.outputText.includes('POC_INTERACTIONS_CODE_OK') || !interaction.outputText.includes('electrocraft') || !interaction.interactionIdPresent) {
  throw new Error(`Interactions v1 code probe failed: ${JSON.stringify(interaction)}`);
}

const result = {
  status: 'PASS_LIVE_GEMINI_CODE',
  structuredOutput: true,
  codeArtifact: true,
  toolLoop: true,
  streaming: true,
  cancellation: true,
  interactionsV1: true,
  logicalProfiles: Object.keys(CURRENT_RUNTIME_MODELS),
  resolvedModelsSessionOnly: CURRENT_RUNTIME_MODELS,
  codeEvidence: {
    artifactType: codeArtifact.artifactType,
    fileCount: codeArtifact.files.length,
    languages: [...new Set(codeArtifact.files.map((file) => file.language))],
    byteLength: codeBytes.byteLength,
    sha256: codeSha256,
    entryFile: codeArtifact.entryFile,
  },
  planEvidence: { artifactType: plan.artifactType, stepCount: plan.steps.length, requestedTools: plan.requestedTools },
  toolEvidence: { stepCount: toolResult.stepCount, toolCalls: toolResult.toolCalls },
};
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts', 'live-result.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
