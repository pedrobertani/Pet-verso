import {test,expect} from '@playwright/test';

test('toque remove o cocô escolhido, preserva os demais após recarregar e premia uma vez',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{
  const {fresh}=await import('/src/engine.js');
  const pet=fresh('pets-0','Pipoca');
  pet.waste=3;pet.floorDirt=3;
  localStorage.setItem('petverso-v1',JSON.stringify(pet)); // Save legado sem uma coleção.
 });
 await page.reload();
 await expect(page.locator('[data-poop]')).toHaveCount(3);
 await expect(page.locator('.floor-dirt')).toHaveCount(3);
 await page.locator('[data-poop="1"]').click();
 await expect(page.locator('[data-poop="1"]')).toHaveCount(0);
 await expect(page.locator('[data-poop="0"]')).toBeVisible();
 await expect(page.locator('[data-poop="2"]')).toBeVisible();
 await expect(page.locator('.dirt-1')).toHaveCount(0);
 await expect(page.locator('.dirt-0')).toHaveCount(1);
 await expect(page.locator('.dirt-2')).toHaveCount(1);
 await expect(page.locator('.wallet')).toContainText('41');
 await page.reload();
 await expect(page.locator('[data-poop="1"]')).toHaveCount(0);
 await expect(page.locator('[data-poop="2"]')).toBeVisible();
 await page.locator('[data-poop="2"]').click();
 await expect(page.locator('[data-poop="0"]')).toBeVisible();
 await expect(page.locator('[data-poop="2"]')).toHaveCount(0);
 await expect(page.locator('.wallet')).toContainText('42');
});
