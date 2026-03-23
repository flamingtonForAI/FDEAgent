/**
 * Smoke test: Project creation dialog and form interaction.
 *
 * Verifies the critical path from QuickStart to the NewProjectDialog
 * blank-project form. Auth is required for actual creation, so this
 * test validates the UI flow up to form completion.
 */
import { test, expect } from '@playwright/test';

test.describe('Project creation smoke test', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').waitFor({ timeout: 10_000 });
  });

  test('QuickStart opens NewProjectDialog and blank form is interactive', async ({ page }) => {
    // 1. Navigate to QuickStart
    await page.getByRole('button', { name: '快速开始' }).click();

    // 2. Click the button that opens NewProjectDialog (the "direct path" card)
    // It contains a Rocket icon + text about starting a new project.
    // Look for any button in the QuickStart area that triggers NewProjectDialog.
    const createBtn = page.locator('button').filter({ hasText: '准备好开始' });
    // Fallback: try the "直接开始" / "开始构建" style button
    const directBtn = page.locator('button').filter({ hasText: /开始构建|直接开始|创建新项目/ });

    const trigger = (await createBtn.isVisible({ timeout: 3_000 }).catch(() => false))
      ? createBtn
      : directBtn.first();
    await trigger.waitFor({ timeout: 5_000 });
    await trigger.click();

    // 3. Verify dialog opens
    const dialogHeading = page.getByRole('heading', { name: '创建新项目' });
    await expect(dialogHeading).toBeVisible({ timeout: 5_000 });

    // 4. Choose blank project mode (if mode selector is shown)
    const blankOption = page.getByText('空白项目');
    if (await blankOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await blankOption.click();
    }

    // 5. Fill in the form
    const nameInput = page.getByPlaceholder('输入项目名称...');
    await nameInput.waitFor({ timeout: 3_000 });
    await nameInput.fill('E2E Smoke Test Project');
    await expect(nameInput).toHaveValue('E2E Smoke Test Project');

    // Fill use case
    const useCaseInput = page.getByPlaceholder('描述业务场景...');
    if (await useCaseInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await useCaseInput.fill('Manufacturing production tracking');
      await expect(useCaseInput).toHaveValue('Manufacturing production tracking');
    }

    // 6. Verify the create button exists (we don't click it since auth is required)
    const submitBtn = page.locator('button').filter({ hasText: '创建项目' }).last();
    await expect(submitBtn).toBeVisible({ timeout: 3_000 });
  });
});
