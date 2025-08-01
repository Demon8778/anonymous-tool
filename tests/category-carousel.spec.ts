import { test, expect } from '@playwright/test';

test.describe('CategoryCarousel Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-category-carousel');
  });

  test.describe('Desktop Tests', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('should render all category badges', async ({ page }) => {
      // Wait for the component to load
      await page.waitForSelector('[data-testid="category-carousel"]', { timeout: 5000 });
      
      // Check that categories are visible (use first() to handle duplicates)
      await expect(page.locator('text=Happy').first()).toBeVisible();
      await expect(page.locator('text=Excited').first()).toBeVisible();
      await expect(page.locator('text=Dancing').first()).toBeVisible();
      await expect(page.locator('text=Funny').first()).toBeVisible();
    });

    test('should show hover effects on category badges', async ({ page }) => {
      const happyCategory = page.locator('text=Happy').first();
      
      // Get initial styles
      const initialTransform = await happyCategory.evaluate(el => 
        window.getComputedStyle(el.closest('.cursor-pointer')).transform
      );
      
      // Hover over the category
      await happyCategory.hover();
      
      // Wait a bit for animation
      await page.waitForTimeout(300);
      
      // Check that transform has changed (indicating hover effect)
      const hoveredTransform = await happyCategory.evaluate(el => 
        window.getComputedStyle(el.closest('.cursor-pointer')).transform
      );
      
      expect(hoveredTransform).not.toBe(initialTransform);
    });

    test('should trigger search when category is clicked', async ({ page }) => {
      // Set up console listener
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log') {
          consoleMessages.push(msg.text());
        }
      });

      // Set up dialog handler
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('happy celebration');
        await dialog.accept();
      });

      // Click on Happy category
      await page.locator('text=Happy').first().click();
      
      // Wait for the click animation delay
      await page.waitForTimeout(300);
      
      // Check console log
      expect(consoleMessages.some(msg => msg.includes('happy celebration'))).toBe(true);
    });

    test('should have auto-scroll functionality', async ({ page }) => {
      const scrollContainer = page.locator('.overflow-x-auto').first();
      
      // Get initial scroll position
      const initialScrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
      
      // Wait for auto-scroll to happen
      await page.waitForTimeout(2000);
      
      // Get new scroll position
      const newScrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
      
      // Should have scrolled
      expect(newScrollLeft).toBeGreaterThan(initialScrollLeft);
    });

    test('should pause auto-scroll on hover', async ({ page }) => {
      const carousel = page.locator('[data-testid="category-carousel"]').first();
      const scrollContainer = page.locator('.overflow-x-auto').first();
      
      // Wait for auto-scroll to start
      await page.waitForTimeout(500);
      
      // Hover over carousel to pause auto-scroll
      await carousel.hover();
      
      // Get scroll position after hover
      const scrollLeft1 = await scrollContainer.evaluate(el => el.scrollLeft);
      
      // Wait a bit while hovering
      await page.waitForTimeout(1000);
      
      // Get scroll position again - should be the same or very close
      const scrollLeft2 = await scrollContainer.evaluate(el => el.scrollLeft);
      
      // Should not have scrolled much while hovering (allow for small variations)
      expect(Math.abs(scrollLeft2 - scrollLeft1)).toBeLessThan(50);
    });

    test('should display gradient overlays', async ({ page }) => {
      // Check for gradient overlays
      const leftGradient = page.locator('.bg-gradient-to-r').first();
      const rightGradient = page.locator('.bg-gradient-to-l').first();
      
      await expect(leftGradient).toBeVisible();
      await expect(rightGradient).toBeVisible();
    });

    test('should display instructions text', async ({ page }) => {
      await expect(page.locator('text=Click a category to search for popular GIFs').first()).toBeVisible();
    });
  });

  test.describe('Mobile Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should render correctly on mobile', async ({ page }) => {
      // Check that categories are visible on mobile
      await expect(page.locator('text=Happy').first()).toBeVisible();
      await expect(page.locator('text=Excited').first()).toBeVisible();
    });

    test('should handle touch interactions on mobile', async ({ page, browserName }) => {
      // Set up dialog handler
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('dancing party');
        await dialog.accept();
      });

      // Use tap for mobile browsers that support it, click for others
      const dancingCategory = page.locator('text=Dancing').first();
      if (browserName === 'webkit' || page.context().browser()?.browserType().name() === 'webkit') {
        await dancingCategory.tap();
      } else {
        await dancingCategory.click();
      }
      
      // Wait for the click animation delay
      await page.waitForTimeout(300);
    });

    test('should have proper touch targets on mobile', async ({ page }) => {
      const categoryElement = page.locator('text=Happy').first();
      const categoryButton = categoryElement.locator('xpath=ancestor::div[contains(@class, "cursor-pointer")]');
      
      // Get the bounding box
      const boundingBox = await categoryButton.boundingBox();
      
      // Should have minimum touch target size (44px)
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should maintain functionality on mobile', async ({ page }) => {
      // Test that auto-scroll still works on mobile
      const scrollContainer = page.locator('.overflow-x-auto').first();
      
      const initialScrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
      await page.waitForTimeout(2000);
      const newScrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
      
      expect(newScrollLeft).toBeGreaterThan(initialScrollLeft);
    });
  });

  test.describe('Animation Tests', () => {
    test('should have smooth transitions', async ({ page }) => {
      const happyCategory = page.locator('text=Happy').first();
      
      // Check that transition CSS is applied
      const transitionProperty = await happyCategory.evaluate(el => 
        window.getComputedStyle(el.closest('.cursor-pointer')).transitionProperty
      );
      
      expect(transitionProperty).toContain('all');
    });

    test('should show click animation', async ({ page }) => {
      const happyCategory = page.locator('text=Happy').first();
      
      // Set up dialog handler to prevent blocking
      let dialogHandled = false;
      page.on('dialog', async dialog => {
        dialogHandled = true;
        await dialog.accept();
      });
      
      // Click and immediately check for animation
      await happyCategory.click();
      
      // Wait for the click animation delay and dialog
      await page.waitForTimeout(300);
      
      // Verify dialog was triggered (indicating click was processed)
      expect(dialogHandled).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should be keyboard accessible', async ({ page }) => {
      // Focus on the first category
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper contrast', async ({ page }) => {
      // Check that text is visible (basic contrast check)
      const happyCategory = page.locator('text=Happy').first();
      await expect(happyCategory).toBeVisible();
      
      // Check that the category has a background color
      const backgroundColor = await happyCategory.evaluate(el => 
        window.getComputedStyle(el.closest('.cursor-pointer')).backgroundColor
      );
      
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });
});