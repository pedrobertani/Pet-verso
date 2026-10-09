import {test,expect} from '@playwright/test';

test('balão de pensamento substitui o alerta inferior e funciona em ambos os temas',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{
  const {fresh}=await import('/src/engine.js');
  const {normalizeCollection,addPet}=await import('/src/pet-collection.js');
  const hungry=fresh('pets-0','Gatinho');
  const healthy=fresh('pets-1','Auau');
  for(const p of [hungry,healthy]){
   Object.assign(p.stats,{food:100,health:100,energy:100,hygiene:100,joy:100});
   p.ill=false;p.waste=0;
  }
  hungry.stats.food=15;
  let collection=normalizeCollection(hungry);
  collection=addPet(collection,healthy).collection; // Auau is active; Gatinho needs care.
  localStorage.setItem('petverso-v1',JSON.stringify(collection));
 });
 await page.reload();

 await expect(page.locator('#other-pet-alert')).toHaveCount(0);
 await expect(page.locator('#switch-pet i')).toHaveText('1');
 await page.locator('#switch-pet').click();

 const cards=page.locator('.pet-switch-option[data-switch-born]');
 await expect(cards).toHaveCount(2);
 const hungryCard=cards.filter({hasText:'Gatinho'});
 const healthyCard=cards.filter({hasText:'Auau'});
 await expect(hungryCard.locator('.pet-care-thought')).toHaveCount(1);
 await expect(healthyCard.locator('.pet-care-thought')).toHaveCount(0);
 await expect(hungryCard.locator('.pet-care-thought')).toHaveAttribute('aria-label','Estou com fome');
 await expect(hungryCard).toHaveAttribute('aria-label',/Gatinho.*Estou com fome/);

 const bubble=hungryCard.locator('.pet-care-thought');
 const light=await bubble.evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.evaluate(()=>document.documentElement.dataset.theme='dark');
 const dark=await bubble.evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(dark).not.toBe(light);

 await hungryCard.click();
 await expect(page.locator('#switch-pet i')).toHaveCount(0);
 await page.locator('#switch-pet').click();
 await expect(page.locator('.pet-care-thought')).toHaveCount(1);
 await expect(page.locator('.pet-switch-option.active .pet-care-thought')).toHaveCount(1);
});
