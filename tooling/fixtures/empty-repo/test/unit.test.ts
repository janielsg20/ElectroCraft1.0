import { describe, expect, it } from 'vitest';
import { health } from '../src/index';

describe('empty repository fixture', () => {
  it('is functional', () => expect(health).toBe('ok'));
});
