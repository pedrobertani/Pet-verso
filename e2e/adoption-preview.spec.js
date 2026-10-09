import {test,expect} from '@playwright/test';

test('catálogo mostra pet adulto, mas adoção continua nascendo bebê',async({page})=>{
 await page.goto('/');
 const catalog=page.locator('[data-adopt="pets-0"]');
 await expect(catalog.locator('.pet-pacifier')).toHaveCount(0);
 await catalog.click();
 await expect(page.locator('.color-preview .pet-pacifier')).toHaveCount(0);
 await page.locator('#confirm-adopt').click();
 await page.locator('.hatch-skip').click();
 await expect(page.locator('.room .pet-pacifier')).toHaveCount(1);
 const level=await page.evaluate(()=>{
  const save=JSON.parse(localStorage.getItem('petverso-v1'));
  return save.pets[0].growth.level;
 });
 expect(level).toBe(0);
});
