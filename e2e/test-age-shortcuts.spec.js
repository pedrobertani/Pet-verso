import {test,expect} from '@playwright/test';

// These shortcuts must never be shipped to main. They exist only on the
// testing branch and must not overwrite an existing player's save.
test('atalhos jovem/adulto simulam fase, 50 mil moedas e inteligência sem alterar o save',async({page})=>{
 await page.goto('/');
 await page.locator('[data-adopt="pets-0"]').click();
 await page.locator('#confirm-adopt').click();
 await page.locator('.hatch-skip').click();
 const original=await page.evaluate(()=>localStorage.getItem('petverso-v1'));
 expect(original).toBeTruthy();

 await page.goto('/?adulto');
 await expect(page.locator('.test-age-banner')).toContainText('Adulto');
 await expect(page.locator('.wallet')).toContainText('50000');
 await expect(page.locator('.eyebrow')).toContainText('Adulto');
 await expect(page.locator('.skill-badge')).toHaveAttribute('aria-disabled','false');

 // Rename forces save() to run; sandbox must never persist that change.
 await page.locator('#rename').click();
 await page.locator('.pet-dialog-input').fill('Somente teste');
 await page.locator('.pet-dialog-confirm').click();
 await expect(page.locator('.pet-name-box h1')).toContainText('Somente teste');
 expect(await page.evaluate(()=>localStorage.getItem('petverso-v1'))).toBe(original);

 await page.goto('/?jovem');
 await expect(page.locator('.test-age-banner')).toContainText('Jovem');
 await expect(page.locator('.wallet')).toContainText('50000');
 await expect(page.locator('.eyebrow')).toContainText('Jovem');
 await expect(page.locator('.skill-badge')).toHaveAttribute('aria-disabled','false');
 expect(await page.evaluate(()=>localStorage.getItem('petverso-v1'))).toBe(original);

 await page.goto('/');
 await expect(page.locator('.test-age-banner')).toHaveCount(0);
 await expect(page.locator('.wallet')).not.toContainText('50000');
 expect(await page.evaluate(()=>localStorage.getItem('petverso-v1'))).toBe(original);
 await expect(page.locator('.pet-name-box h1')).not.toContainText('Somente teste');
});

test('atalho de fase funciona até sem pet salvo e não cria save real',async({page})=>{
 await page.goto('/?adulto');
 await expect(page.locator('.test-age-banner')).toContainText('Adulto');
 await expect(page.locator('.wallet')).toContainText('50000');
 await expect(page.locator('.eyebrow')).toContainText('Adulto');
 expect(await page.evaluate(()=>localStorage.getItem('petverso-v1'))).toBeNull();
});
