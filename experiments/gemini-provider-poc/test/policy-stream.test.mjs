import test from 'node:test';
import assert from 'node:assert/strict';
import { assertToolAllowed, ToolNotAllowedError } from '../dist/shared/tool-policy.js';
import { reduceStreamState } from '../dist/shared/stream-state.js';

test('allowed tool is accepted', () => assert.doesNotThrow(() => assertToolAllowed('get_app_summary')));
test('forbidden Apply tool is denied', () => assert.throws(() => assertToolAllowed('apply_to_project'), ToolNotAllowedError));
test('unknown tool is denied', () => assert.throws(() => assertToolAllowed('totally_unknown'), ToolNotAllowedError));
test('stream lifecycle covers complete/incomplete/error/cancel', () => {
  assert.equal(reduceStreamState('Inicial', { type: 'start' }), 'Cargando');
  assert.equal(reduceStreamState('Cargando', { type: 'finish', finishReason: 'stop' }), 'Completado');
  assert.equal(reduceStreamState('Cargando', { type: 'finish', finishReason: 'length' }), 'Incompleto');
  assert.equal(reduceStreamState('Cargando', { type: 'error' }), 'Error');
  assert.equal(reduceStreamState('Cargando', { type: 'abort' }), 'Cancelado');
});
