import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';

const pets=[['sombrios-frankie','frankie'],['sombrios-6','mumi']];
const clips=['trick','park'];
mkdirSync('halloween-videos',{recursive:true});

for(const [id,name] of pets)for(const clip of clips){
 test(`${name} - habilidade ${clip} (GIF real)`,async({page,browser})=>{
  await page.goto('/');
  await page.setViewportSize({width:740,height:600});
  const result=await page.evaluate(async({id,clip})=>{
   const {activeSpecies,fresh}=await import('/src/engine.js');
   const {petDrawing}=await import('/src/pets.js');
   const {toyArt}=await import('/src/park-toys.js');
   const {startTrick,animateTrick}=await import('/src/pet-tricks.js');
   const {startParkAction,animateParkAction}=await import('/src/park-actions.js');
   const species=activeSpecies.find(s=>s.id===id);
   if(!species)throw Error('Espécie não encontrada: '+id);
   const pet=fresh(id,species.name);
   pet.stats.intelligence=clip==='trick'?50:75;
   const unlocked=clip==='trick'?startTrick(pet):startParkAction(pet);
   if(!unlocked)throw Error('Habilidade não desbloqueou no nível correto');
   document.querySelector('#halloween-gif-stage')?.remove();
   const world=document.createElement('div');
   world.id='halloween-gif-stage';
   Object.assign(world.style,{position:'fixed',left:'40px',top:'35px',width:'650px',height:'490px',zIndex:'2147483647',background:'linear-gradient(#d4f4f6,#fef0d5)',borderRadius:'24px',overflow:'hidden',border:'5px solid #b3dbe0'});
   const label=document.createElement('div');
   label.textContent=species.name+' · '+(clip==='trick'?'Habilidade 50 🧠':'Parquinho 75 🧠');
   Object.assign(label.style,{position:'absolute',top:'12px',left:'16px',font:'bold 22px sans-serif',color:'#40345d'});
   world.append(label);
   const target=document.createElement('div');
   target.className='pet-stage';
   target.id='halloween-gif-pet';
   Object.assign(target.style,{position:'absolute',left:clip==='park'?'65px':'225px',top:'155px',width:'190px',height:'190px'});
   const face=document.createElement('div');face.className='pet-facing';face.innerHTML=petDrawing({...species,growthLevel:2},'happy');face.style.width='100%';face.style.height='100%';
   target.append(face);world.append(target);
   if(clip==='park'){
    const toy=document.createElement('div');toy.className='park-object';toy.innerHTML=toyArt(id);
    Object.assign(toy.style,{position:'absolute',left:'355px',top:'145px',width:'220px',height:'180px'});
    world.append(toy);
   }
   document.body.append(world);
   const stop=clip==='trick'?animateTrick(target,id,{draw:()=>petDrawing({...species,growthLevel:2},'happy'),reducedMotion:false}):animateParkAction(world,target,id,{level:2,reducedMotion:false});
   window.__halloweenStop=stop;
   return {unlocked,hasPet:!!target.querySelector('svg'),hasToy:clip==='trick'||!!world.querySelector('.park-object svg')};
  },{id,clip});
  expect(result).toEqual({unlocked:true,hasPet:true,hasToy:true});
  const stage=page.locator('#halloween-gif-stage');
  await expect(stage).toBeVisible();
  const frames=[];
  for(let i=0;i<28;i++){
   const shot=await stage.screenshot({animations:'allow'});
   frames.push(shot);
   await page.waitForTimeout(clip==='trick'?115:230);
  }
  // Record the actual browser-rendered animation, not an artist mockup.
  const {writeFileSync}=await import('node:fs');
  const {spawnSync}=await import('node:child_process');
  const dir=join('halloween-videos',`${name}-${clip}-frames`);
  mkdirSync(dir,{recursive:true});
  frames.forEach((frame,i)=>writeFileSync(join(dir,`frame-${String(i).padStart(3,'0')}.png`),frame));
  const ff=spawnSync('ffmpeg',['-y','-framerate',clip==='trick'?'9':'4','-i',join(dir,'frame-%03d.png'),'-c:v','libvpx-vp9','-pix_fmt','yuv420p',join('halloween-videos',`${name}-${clip}.webm`)],{encoding:'utf8'});
  expect(ff.status,ff.stderr).toBe(0);
 });
}

for(const [id,name] of pets){
 test(`${name} - print do brinquedo novo`,async({page})=>{
  await page.goto('/');
  await page.setViewportSize({width:740,height:600});
  const info=await page.evaluate(async id=>{
   const {toyFor,toyArt}=await import('/src/park-toys.js');
   const {environmentFor,environmentArt}=await import('/src/park-environments.js');
   const toy=toyFor(id);
   if(!toy)throw Error('Brinquedo não encontrado: '+id);
   const stage=document.createElement('div');
   stage.id='halloween-object-preview';
   Object.assign(stage.style,{position:'fixed',left:'40px',top:'35px',width:'650px',height:'490px',zIndex:'2147483647',background:'linear-gradient(#eee4fa,#d8f4ed)',border:'5px solid #b3dbe0',borderRadius:'24px',overflow:'hidden'});
   const title=document.createElement('h2');title.textContent=toy.name;
   Object.assign(title.style,{position:'absolute',top:'10px',left:'20px',font:'bold 28px sans-serif',color:'#49325e'});
   stage.append(title);
   const holder=document.createElement('div');
   holder.innerHTML=toyArt(id);
   Object.assign(holder.style,{position:'absolute',left:'155px',top:'85px',width:'340px',height:'300px'});
   stage.append(holder);
   document.body.append(stage);
   return {name:toy.name,type:toy.type,hasSvg:!!holder.querySelector('svg')};
  },id);
  expect(info.hasSvg).toBe(true);
  await page.locator('#halloween-object-preview').screenshot({path:join('halloween-videos',`${name}-objeto.png`)});
 });
}
