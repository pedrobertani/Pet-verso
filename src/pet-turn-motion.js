import {landTurnPreview} from './land-turn-preview.js';
import {flyTurnPreview} from './fly-turn-preview.js';
const flying=new Set(['sombrios-0','sombrios-1','sombrios-dragon','dinos-pterosaur','selva-owl']);
const ns='http://www.w3.org/2000/svg';
// Keep animation inside the anatomical transform so feet and wings stay attached.
function animateInside(svg,selector){
 for(const [i,el]of [...svg.querySelectorAll(selector)].entries()){
  const inner=document.createElementNS(ns,'g');inner.setAttribute('class',el.getAttribute('class')+(el.classList.contains('pet-leg')&&!/leg-[01]/.test(el.getAttribute('class'))?' leg-'+(i%2):''));while(el.firstChild)inner.append(el.firstChild);el.setAttribute('class','directional-part');el.append(inner);
 }
}
export function bindDirectionalPet({world,target,getPet,getSpecies,getMode,reducedMotion}){
 if(!world||!target||target.classList.contains('in-bed')||target.classList.contains('resting-away')||world.classList.contains('bathroom'))return ()=>{};
 const face=target.querySelector('.pet-facing');if(!face)return ()=>{};
 target.classList.add('directional-pet');face.style.setProperty('transform','none','important');face.style.setProperty('animation','none','important');
 const cache=new Map();let angle=Number(target.dataset.turnAngle)||0,wanted=angle,lastX=target.getBoundingClientRect().x,lastTime=0,frame=0,lastPose=-1,lastSvg=null,disposed=false;
 function pose(index){
  if(cache.has(index))return cache.get(index);
  const s=getSpecies(),yaw=index*Math.PI/16,holder=document.createElement('div');holder.innerHTML=flying.has(s.id)?flyTurnPreview(s,yaw,0,getMode()):landTurnPreview(s,yaw,getMode());const svg=holder.querySelector('svg');
  animateInside(svg,flying.has(s.id)?'.pet-wing':'.pet-leg');svg.classList.add('directional-art');const html=svg.outerHTML;cache.set(index,html);return html;
 }
 function tick(time){
  if(disposed)return;frame=requestAnimationFrame(tick);const pet=getPet();if(!pet||pet.sleeping||pet.dead||document.hidden){lastTime=time;return;}
  const x=target.getBoundingClientRect().x,dx=x-lastX;lastX=x;
  if(world.dataset.skillBusy==='true'||world.dataset.thinking==='true'||target.classList.contains('being-touched')||target.classList.contains('performing-trick')){lastTime=time;return;}
  if(target.classList.contains('call-controlled'))wanted=target.dataset.walkDirection==='left'?Math.PI:0;else if(Math.abs(dx)>.15)wanted=dx<0?Math.PI:0;
  const step=Math.min(50,time-(lastTime||time))*Math.PI/700;lastTime=time;angle=reducedMotion()?wanted:angle+Math.sign(wanted-angle)*Math.min(step,Math.abs(wanted-angle));target.dataset.turnAngle=String(angle);
  const index=Math.round(angle/Math.PI*16);if(index!==lastPose||face.querySelector('svg')!==lastSvg){face.innerHTML=pose(index);lastSvg=face.querySelector('svg');lastPose=index;for(const animation of face.getAnimations({subtree:true}))animation.currentTime=time;}
 }
 frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);cache.clear();};
}
