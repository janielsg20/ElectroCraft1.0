import { DesignSystemGallery, ThemeProvider, type DesignSystemGalleryCopy } from '@electrocraft/design-system';
import { getStudioHelpDescriptor } from '../help/help-registry';
import { studioNavigationMessageKeys, studioT } from '../i18n/studio-shell.es';

const galleryCopy: DesignSystemGalleryCopy = Object.freeze({
  kicker: studioT('studio.designSystem.kicker'),
  title: studioT('studio.designSystem.title'),
  summary: studioT('studio.designSystem.summary'),
  themeLabel: studioT('studio.designSystem.themeLabel'),
  themeSystem: studioT('studio.designSystem.themeSystem'),
  themeLight: studioT('studio.designSystem.themeLight'),
  themeDark: studioT('studio.designSystem.themeDark'),
  primaryAction: studioT('studio.designSystem.primaryAction'),
  secondaryAction: studioT('studio.designSystem.secondaryAction'),
  outlineAction: studioT('studio.designSystem.outlineAction'),
  ghostAction: studioT('studio.designSystem.ghostAction'),
  destructiveAction: studioT('studio.designSystem.destructiveAction'),
  disabledAction: studioT('studio.designSystem.disabledAction'),
  tooltipLabel: studioT('studio.designSystem.tooltipLabel'),
  tooltipContent: studioT('studio.designSystem.tooltipContent'),
  dropdownLabel: studioT('studio.designSystem.dropdownLabel'),
  keyboardFocusTechnicalLabel: studioT('studio.designSystem.keyboardFocusTechnicalLabel'),
  duplicateAction: studioT('studio.designSystem.duplicateAction'),
  renameAction: studioT('studio.designSystem.renameAction'),
  deleteAction: studioT('studio.designSystem.deleteAction'),
  sheetOpen: studioT('studio.designSystem.sheetOpen'),
  sheetTitle: studioT('studio.designSystem.sheetTitle'),
  sheetDescription: studioT('studio.designSystem.sheetDescription'),
  fieldName: studioT('studio.designSystem.fieldName'),
  fieldPlaceholder: studioT('studio.designSystem.fieldPlaceholder'),
  closeAction: studioT('studio.designSystem.closeAction'),
  statesLabel: studioT('studio.designSystem.statesLabel'),
  typedStatesTechnicalLabel: studioT('studio.designSystem.typedStatesTechnicalLabel'),
  tokensLabel: studioT('studio.designSystem.tokensLabel'),
  densityLabel: studioT('studio.designSystem.densityLabel'),
  densityHigh: studioT('studio.designSystem.densityHigh'),
  interactionHint: studioT('studio.designSystem.interactionHint'),
  navigationVocabulary: studioT('studio.designSystem.navigationVocabulary'),
  i18nKeysTechnicalLabel: studioT('studio.designSystem.i18nKeysTechnicalLabel'),
  helpTitle: studioT('studio.designSystem.helpTitle'),
  routeLabel: studioT('studio.designSystem.routeLabel'),
  internalNotice: studioT('studio.designSystem.internalNotice'),
  stateLabels: Object.freeze({
    initial: studioT('studio.designSystem.state.initial'),
    loading: studioT('studio.designSystem.state.loading'),
    ready: studioT('studio.designSystem.state.ready'),
    empty: studioT('studio.designSystem.state.empty'),
    error: studioT('studio.designSystem.state.error'),
    disabled: studioT('studio.designSystem.state.disabled'),
    saving: studioT('studio.designSystem.state.saving'),
    saved: studioT('studio.designSystem.state.saved'),
    blocked: studioT('studio.designSystem.state.blocked'),
  }),
});

const navigationLabels = Object.freeze(studioNavigationMessageKeys.map((key) => studioT(key)));

export function DesignSystemDevelopmentRoute() {
  const help = getStudioHelpDescriptor('help.studio.shell');

  return (
    <ThemeProvider defaultTheme="system">
      <DesignSystemGallery copy={galleryCopy} navigationLabels={navigationLabels} help={help} />
    </ThemeProvider>
  );
}
