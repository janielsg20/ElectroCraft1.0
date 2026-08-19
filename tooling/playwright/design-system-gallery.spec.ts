import { expect, test } from '@playwright/test';

test('M03.1 design system gallery supports theme, keyboard surfaces and compact responsive layout', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Fundación visual de ElectroCraft' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Operativo');
  await expect(page.locator('[data-help-id="help.studio.shell"]')).toBeVisible();

  const darkButton = page.getByRole('button', { name: 'Oscuro' });
  await darkButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(darkButton).toHaveAttribute('aria-pressed', 'true');

  const compactButton = page.getByRole('button', { name: 'Compacta' });
  await expect(compactButton).toHaveAttribute('aria-pressed', 'true');

  const menuButton = page.getByRole('button', { name: /Abrir menú/ });
  await menuButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Temas' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();

  const toolsButton = page.getByRole('button', { name: 'Abrir herramientas' });
  await toolsButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Primitives preparadas para AppShell' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Fundación visual de ElectroCraft' })).toBeVisible();

  await page.screenshot({ path: 'test-results/m03-1/design-system-gallery.png', fullPage: true });
});
