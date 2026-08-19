import { Button, Input, ScrollArea, getStudioIcon } from '@electrocraft/design-system';
import { PuckEditorComponents, structuralPuckConfig, usePuckPaletteInsert } from '@electrocraft/editor-puck';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { paletteT } from '../i18n/palette.es';
import {
  getPaletteItemById,
  getPaletteItemsByCategory,
  paletteCategories,
  resolvePaletteInsert,
  searchPaletteCatalog,
  type PaletteDiagnostic,
  type PaletteItemDescriptor,
} from './palette-catalog';
import { usePalettePreferences } from './palette-preferences';
import './palette-panel.css';

const SearchIcon = getStudioIcon('studio.sidebar.queries');
const PaletteIcon = getStudioIcon('studio.sidebar.components');
const CloseIcon = getStudioIcon('window.close');

function focusCanvas() {
  const canvas = document.querySelector<HTMLElement>('[data-editor-canvas-stage]');
  canvas?.focus();
}

function PaletteItem({
  descriptor,
  favorite,
  onToggleFavorite,
  onInsert,
}: {
  readonly descriptor: PaletteItemDescriptor;
  readonly favorite: boolean;
  readonly onToggleFavorite: (id: PaletteItemDescriptor['id']) => void;
  readonly onInsert: (descriptor: PaletteItemDescriptor) => void;
}) {
  const Icon = getStudioIcon(descriptor.iconId);

  return (
    <article className="ec-palette-item" data-palette-item={descriptor.id}>
      <button
        type="button"
        className="ec-palette-item-main"
        onClick={() => onInsert(descriptor)}
        aria-label={`${paletteT('studio.palette.insert')}: ${descriptor.name}`}
      >
        <span className="ec-palette-item-icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="ec-palette-item-copy">
          <strong>{descriptor.name}</strong>
          <span>{descriptor.description}</span>
        </span>
        <span className="ec-palette-kind">{descriptor.kind}</span>
      </button>
      <button
        type="button"
        className="ec-palette-favorite"
        aria-pressed={favorite}
        aria-label={favorite ? paletteT('studio.palette.favoriteRemove') : paletteT('studio.palette.favoriteAdd')}
        onClick={() => onToggleFavorite(descriptor.id)}
      >
        <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
      </button>
    </article>
  );
}

function PaletteSection({
  title,
  descriptors,
  favorites,
  onToggleFavorite,
  onInsert,
}: {
  readonly title: string;
  readonly descriptors: readonly PaletteItemDescriptor[];
  readonly favorites: ReadonlySet<PaletteItemDescriptor['id']>;
  readonly onToggleFavorite: (id: PaletteItemDescriptor['id']) => void;
  readonly onInsert: (descriptor: PaletteItemDescriptor) => void;
}) {
  if (descriptors.length === 0) return null;

  return (
    <section className="ec-palette-section" aria-label={title}>
      <header className="ec-palette-section-header">
        <h3>{title}</h3>
        <span>{descriptors.length}</span>
      </header>
      <div className="ec-palette-grid" data-palette-grid>
        {descriptors.map((descriptor) => (
          <PaletteItem
            key={descriptor.id}
            descriptor={descriptor}
            favorite={favorites.has(descriptor.id)}
            onToggleFavorite={onToggleFavorite}
            onInsert={onInsert}
          />
        ))}
      </div>
    </section>
  );
}

function PaletteDiagnosticNotice({
  diagnostic,
  onDismiss,
}: {
  readonly diagnostic: PaletteDiagnostic;
  readonly onDismiss: () => void;
}) {
  return (
    <section className="ec-palette-diagnostic" role="status" data-palette-diagnostic={diagnostic.code}>
      <header>
        <div>
          <strong>{paletteT('studio.palette.diagnosticTitle')}</strong>
          <code>{diagnostic.code}</code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label={paletteT('studio.palette.diagnosticClose')}
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      </header>
      <dl>
        <div>
          <dt>{paletteT('studio.palette.diagnosticLocation')}</dt>
          <dd>{diagnostic.location}</dd>
        </div>
        <div>
          <dt>{paletteT('studio.palette.diagnosticCause')}</dt>
          <dd>{diagnostic.cause}</dd>
        </div>
        <div>
          <dt>{paletteT('studio.palette.diagnosticAction')}</dt>
          <dd>{diagnostic.action}</dd>
        </div>
      </dl>
    </section>
  );
}

export function StudioPalette() {
  const [query, setQuery] = useState('');
  const [diagnostic, setDiagnostic] = useState<PaletteDiagnostic | null>(null);
  const insertWithPuck = usePuckPaletteInsert();
  const { preferences, toggleFavorite, rememberRecent } = usePalettePreferences();
  const availableComponentTypes = useMemo(() => new Set(Object.keys(structuralPuckConfig.components)), []);
  const results = useMemo(() => searchPaletteCatalog(query), [query]);
  const favorites = useMemo(() => new Set(preferences.favorites), [preferences.favorites]);
  const favoriteItems = useMemo(
    () =>
      preferences.favorites.map(getPaletteItemById).filter((value): value is PaletteItemDescriptor => Boolean(value)),
    [preferences.favorites],
  );
  const recentItems = useMemo(
    () => preferences.recent.map(getPaletteItemById).filter((value): value is PaletteItemDescriptor => Boolean(value)),
    [preferences.recent],
  );

  const insert = (descriptor: PaletteItemDescriptor) => {
    const resolution = resolvePaletteInsert(descriptor, availableComponentTypes);
    if (resolution.status === 'blocked') {
      setDiagnostic(resolution.diagnostic);
      rememberRecent(descriptor.id);
      return;
    }

    insertWithPuck(resolution.componentType);
    rememberRecent(descriptor.id);
    setDiagnostic(null);
    focusCanvas();
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      focusCanvas();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const firstItem = document.querySelector<HTMLButtonElement>('.ec-palette-item-main');
      firstItem?.focus();
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      focusCanvas();
    }
  };

  return (
    <section
      className="ec-palette"
      aria-label={paletteT('studio.palette.title')}
      data-studio-palette
      onKeyDown={onPanelKeyDown}
    >
      <header className="ec-palette-header">
        <div className="ec-palette-heading">
          <PaletteIcon aria-hidden="true" />
          <div>
            <h2>{paletteT('studio.palette.title')}</h2>
            <p>{paletteT('studio.palette.description')}</p>
          </div>
        </div>
        <label className="ec-palette-search">
          <span className="sr-only">{paletteT('studio.palette.searchLabel')}</span>
          <SearchIcon aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder={paletteT('studio.palette.searchPlaceholder')}
            aria-label={paletteT('studio.palette.searchLabel')}
          />
        </label>
        <p className="ec-palette-keyboard-help">{paletteT('studio.palette.keyboardHelp')}</p>
      </header>

      {diagnostic ? <PaletteDiagnosticNotice diagnostic={diagnostic} onDismiss={() => setDiagnostic(null)} /> : null}

      <ScrollArea className="ec-palette-scroll" label={paletteT('studio.palette.allCategories')}>
        <div className="ec-palette-content">
          {!query && favoriteItems.length > 0 ? (
            <PaletteSection
              title={paletteT('studio.palette.favorites')}
              descriptors={favoriteItems}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onInsert={insert}
            />
          ) : null}
          {!query && recentItems.length > 0 ? (
            <PaletteSection
              title={paletteT('studio.palette.recent')}
              descriptors={recentItems}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onInsert={insert}
            />
          ) : null}

          {results.length === 0 ? (
            <div className="ec-palette-empty" role="status">
              <strong>{paletteT('studio.palette.noResultsTitle')}</strong>
              <span>{paletteT('studio.palette.noResultsDescription')}</span>
            </div>
          ) : (
            paletteCategories.map((category) => (
              <PaletteSection
                key={category}
                title={category}
                descriptors={getPaletteItemsByCategory(results, category)}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onInsert={insert}
              />
            ))
          )}

          <section className="ec-palette-puck-source" aria-label={paletteT('studio.palette.dragSource')}>
            <PuckEditorComponents />
          </section>
        </div>
      </ScrollArea>
    </section>
  );
}
