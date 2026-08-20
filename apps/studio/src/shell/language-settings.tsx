import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@electrocraft/design-system';
import { electroCraftI18n, translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';
import { useState } from 'react';
import { HelpTrigger } from '../help/help-ui';

const LANGUAGE_STORAGE_KEY = 'electrocraft.studio.locale';

type SettingsKey = ElectroCraftResourceKey<'settings'>;
type StudioLocale = 'es';

function settingsT(key: SettingsKey) {
  return translateStrict('settings', key);
}

function readStoredLocale(): StudioLocale {
  if (typeof window === 'undefined') return 'es';
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'es' ? 'es' : 'es';
}

export function LanguageSettings() {
  const [appliedLocale, setAppliedLocale] = useState<StudioLocale>(readStoredLocale);
  const [draftLocale, setDraftLocale] = useState<StudioLocale>(appliedLocale);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(LANGUAGE_STORAGE_KEY, draftLocale);
    void electroCraftI18n.changeLanguage(draftLocale);
    setAppliedLocale(draftLocale);
    setSaved(true);
  };

  const cancel = () => {
    setDraftLocale(appliedLocale);
    setSaved(false);
  };

  return (
    <section
      className="ec-topbar-settings-section"
      aria-labelledby="general-settings-title"
      data-information-level="primary"
      data-settings-destination="general-language"
    >
      <div className="flex items-center gap-2">
        <h2 id="general-settings-title">{settingsT('settings.general.title')}</h2>
        <HelpTrigger helpId="help.studio.language" data-language-help-trigger />
      </div>

      <div className="ec-topbar-setting-row" data-language-settings>
        <div>
          <strong>{settingsT('settings.language.label')}</strong>
          <p>{settingsT('settings.language.description')}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label={settingsT('settings.language.label')}>
              {settingsT('settings.language.spanish')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDraftLocale('es')}>
              {settingsT('settings.language.spanish')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-end gap-2" data-language-settings-actions>
        {saved ? <span role="status">{settingsT('settings.language.saved')}</span> : null}
        <Button variant="ghost" size="sm" onClick={cancel}>
          {settingsT('settings.language.cancel')}
        </Button>
        <Button size="sm" onClick={save}>
          {settingsT('settings.language.save')}
        </Button>
      </div>
    </section>
  );
}
