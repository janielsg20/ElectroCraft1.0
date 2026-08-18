import type { JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { generateHTML } from '@tiptap/html';
import {
  createElectroCraftEnginePayload,
  electroCraftEnginePayloadSchema,
  type ElectroCraftEnginePayload,
  type JsonValue,
} from '@electrocraft/domain';

export class TiptapEnginePayloadBlockedError extends Error {
  constructor(
    readonly code: 'INVALID_TIPTAP_WRAPPER' | 'INVALID_TIPTAP_VALUE' | 'UNSUPPORTED_TIPTAP_WRAPPER_VERSION',
    message: string,
  ) {
    super(message);
    this.name = 'TiptapEnginePayloadBlockedError';
  }
}

const minimalRichTextExtensions = [Document, Paragraph, Text];

function assertTiptapRoot(value: JsonValue): asserts value is JsonValue & { type: 'doc'; content?: JsonValue[] } {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new TiptapEnginePayloadBlockedError('INVALID_TIPTAP_VALUE', 'Tiptap JSON must be a document object');
  }
  if (value.type !== 'doc') {
    throw new TiptapEnginePayloadBlockedError('INVALID_TIPTAP_VALUE', 'Tiptap JSON root type must be doc');
  }
  if ('content' in value && value.content !== undefined && !Array.isArray(value.content)) {
    throw new TiptapEnginePayloadBlockedError('INVALID_TIPTAP_VALUE', 'Tiptap document content must be an array');
  }
}

function renderTiptapJson(value: JsonValue): string {
  assertTiptapRoot(value);
  return generateHTML(value as JSONContent, minimalRichTextExtensions);
}

export function validateTiptapEnginePayload(input: unknown): ElectroCraftEnginePayload {
  const wrapper = electroCraftEnginePayloadSchema.safeParse(input);
  if (!wrapper.success || wrapper.data.engine !== 'tiptap') {
    throw new TiptapEnginePayloadBlockedError('INVALID_TIPTAP_WRAPPER', 'Expected tiptap engine payload wrapper');
  }
  if (wrapper.data.schemaVersion !== 1) {
    throw new TiptapEnginePayloadBlockedError(
      'UNSUPPORTED_TIPTAP_WRAPPER_VERSION',
      `Tiptap wrapper schemaVersion ${wrapper.data.schemaVersion} is not supported`,
    );
  }
  try {
    renderTiptapJson(wrapper.data.value);
  } catch (error) {
    if (error instanceof TiptapEnginePayloadBlockedError) throw error;
    throw new TiptapEnginePayloadBlockedError(
      'INVALID_TIPTAP_VALUE',
      error instanceof Error ? error.message : 'Tiptap rejected the persisted rich-text JSON',
    );
  }
  return wrapper.data;
}

export function createTiptapEnginePayload(value: JsonValue): ElectroCraftEnginePayload {
  const payload = createElectroCraftEnginePayload('tiptap', 1, value);
  return validateTiptapEnginePayload(payload);
}

export function migrateTiptapEnginePayload(input: unknown): ElectroCraftEnginePayload {
  return validateTiptapEnginePayload(input);
}

export function renderTiptapEnginePayloadToHtml(input: unknown): string {
  const payload = validateTiptapEnginePayload(input);
  return renderTiptapJson(payload.value);
}
