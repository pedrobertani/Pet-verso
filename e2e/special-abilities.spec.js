import {test,expect} from '@playwright/test';

test('estegossauro realmente aponta para a esquerda durante os três pulos de volta',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {animateTrick}=await import('/src/pet-tricks.js');
  const {petDrawing}=await import('/src/pets.js');
  const {activeSpecies}=await import('/src/engine.js');
  const species=activeSpecies.find(s=>s.id==='dinos-3');
  const host=document.createElement('div');
  host.innerHTML='<div class="pet-stage roaming"><div class="pet-facing"><svg viewBox="0 0 200 200"></svg></div></div>';
  document.body.append(host);
  const target=host.querySelector('.pet-stage'),face=target.querySelector('.pet-facing');
  // Match the inline !important constraint set by the directional rendering system.
  face.style.setProperty('transform','none','important');
  face.style.setProperty('animation','none','important');
  const stop=animateTrick(target,'dinos-3',{
   draw:()=>petDrawing({...species,growthLevel:2,walking:true},'happy'),
   sound:()=>{},reducedMotion:false
  });
  const turning=face.getAnimations().find(a=>a.effect?.getKeyframes().some(k=>k.transform==='scaleX(-1)'));
  const moving=target.getAnimations().find(a=>a.effect?.getKeyframes().some(k=>k.translate==='25px -18px'));
  if(turning)turning.currentTime=2100;
  const matrix=getComputedStyle(face).transform;
  const flipped=matrix.startsWith('matrix(-1,')||matrix.startsWith('matrix3d(-1,');
  const paused=target.style.animationPlayState==='paused';
  stop();
  const restored=face.style.getPropertyValue('transform')==='none'&&face.style.getPropertyPriority('transform')==='important';
  host.remove();
  return {turning:!!turning,moving:!!moving,flipped,paused,restored};
 });
 expect(result).toEqual({turning:true,moving:true,flipped:true,paused:true,restored:true});
});

test('elefante jovem e adulto soltam água da tromba e não da camada do rosto',async({page})=>{
 await page.goto('/');
 const cases=await page.evaluate(async()=>{
  const {animateTrick}=await import('/src/pet-tricks.js');
  const {petDrawing}=await import('/src/pets.js');
  const {activeSpecies}=await import('/src/engine.js');
  const elephant=activeSpecies.find(s=>s.id==='selva-2');
  return [1,2].map(growthLevel=>{
   const host=document.createElement('div');
   host.innerHTML='<div class="pet-stage"><div class="pet-facing"><svg viewBox="0 0 200 200"></svg></div></div>';
   document.body.append(host);
   const target=host.querySelector('.pet-stage');
   const stop=animateTrick(target,'selva-2',{
    draw:()=>petDrawing({...elephant,growthLevel},'happy'),
    sound:()=>{},reducedMotion:false
   });
   const jet=target.querySelector('.trunk-water-jet');
   const trunk=target.querySelector('.pet-trunk');
   const data={growthLevel,anchored:!!jet&&jet.parentElement===trunk,startsAtNozzle:jet?.querySelector('path')?.getAttribute('d').startsWith('M150 151'),growthWrapper:growthLevel===2||!!target.querySelector('.growth-size')};
   stop();host.remove();return data;
  });
 });
 for(const c of cases)expect(c).toMatchObject({anchored:true,startsAtNozzle:true,growthWrapper:true});
});
