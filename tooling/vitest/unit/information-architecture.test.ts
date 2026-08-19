import { describe, expect, it } from 'vitest';
import {
  studioEmptyStates,
  studioInformationOptions,
  validateInformationArchitecture,
  type InformationOptionDescriptor,
} from '../../../apps/studio/src/shell/information-architecture';

describe('M03.7 information architecture registry', () => {
  it('validates the canonical Studio information architecture without errors', () => {
    expect(validateInformationArchitecture(studioInformationOptions)).toEqual([]);
  });

  it('keeps every top-level navigation module primary and always visible', () => {
    const navigation = studioInformationOptions.filter((option) => option.surface === 'navigation');
    expect(navigation).toHaveLength(24);
    expect(navigation.every((option) => option.level === 'primary')).toBe(true);
    expect(navigation.every((option) => option.visibility === 'always')).toBe(true);
    expect(new Set(navigation.map((option) => option.route)).size).toBe(24);
  });

  it('requires every advanced option to use disclosure', () => {
    const advanced = studioInformationOptions.filter((option) => option.level === 'advanced');
    expect(advanced.length).toBeGreaterThan(0);
    expect(advanced.every((option) => option.visibility === 'disclosure')).toBe(true);
  });

  it('covers every required empty state plus the List/Detail selection state', () => {
    expect(studioEmptyStates.map((state) => state.id)).toEqual([
      'project-home',
      'canvas',
      'outline',
      'inspector',
      'content',
      'content-detail',
      'queries',
      'forms',
      'administration',
      'media',
      'export',
    ]);
  });

  it('fails closed when primary content is hidden', () => {
    const invalid: InformationOptionDescriptor[] = [
      { id: 'ia.test.primary', surface: 'settings', level: 'primary', visibility: 'when-relevant' },
    ];
    expect(validateInformationArchitecture(invalid)).toContain('primary option must stay visible: ia.test.primary');
  });

  it('fails closed when advanced content bypasses disclosure', () => {
    const invalid: InformationOptionDescriptor[] = [
      { id: 'ia.test.advanced', surface: 'settings', level: 'advanced', visibility: 'always' },
    ];
    expect(validateInformationArchitecture(invalid)).toContain('advanced option must use disclosure: ia.test.advanced');
  });

  it('fails closed when system-state protection is not diagnostic', () => {
    const invalid: InformationOptionDescriptor[] = [
      {
        id: 'ia.test.status',
        surface: 'topbar',
        level: 'contextual',
        visibility: 'when-relevant',
        protectsSystemState: true,
      },
    ];
    expect(validateInformationArchitecture(invalid)).toContain(
      'system-state protection requires diagnostic level: ia.test.status',
    );
  });

  it('fails closed for duplicate ids and duplicate top-level routes', () => {
    const invalid: InformationOptionDescriptor[] = [
      { id: 'ia.navigation.one', surface: 'navigation', level: 'primary', visibility: 'always', route: '/same' },
      { id: 'ia.navigation.one', surface: 'navigation', level: 'primary', visibility: 'always', route: '/same' },
    ];
    const errors = validateInformationArchitecture(invalid);
    expect(errors).toContain('duplicate option id: ia.navigation.one');
    expect(errors).toContain('duplicate navigation route: /same');
  });
});
