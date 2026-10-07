import {foodIcon} from './pet-diets.js';
// Needs are chosen from the current save; no extra hunger or happiness meter.
export function thoughtNeeds(p,scene,now=Date.now()){
 if(!p||p.dead||p.sleeping||scene==='bathroom')return [];
 const needs=[],add=(id,icon,label,value)=>needs.push({id,icon,label,value});
 if(p.stats.food<60)add('food',foodIcon(p.species),'Estou com fome',p.stats.food);
 if(p.stats.energy<40)add('sleep','sleep','Quero dormir',p.stats.energy);
 if(p.stats.hygiene<55)add('bath','bath','Quero tomar banho',p.stats.hygiene);
 if(p.stats.joy<60)add('play','games','Quero brincar',p.stats.joy);
 if(p.stats.health<40||p.ill)add('health','health','Preciso de cuidados',p.stats.health);
 const social=p.social||{},since=key=>Math.max(0,now-(social[key]??p.born));
 if(since('affection')>=45*60000&&p.stats.joy<85)add('affection','affection','Quero carinho',p.stats.joy);
 if(!['garden','playground'].includes(scene)&&since('outdoors')>=60*60000&&p.stats.joy<85)add('outdoors','home','Quero ir ao quintal',p.stats.joy);
 const urgent=needs.filter(n=>n.value<25);
 return urgent.length?urgent.sort((a,b)=>a.value-b.value):needs;
}
export function bindPetThoughts({world,target,getPet,scene,icon}){
 if(!world||!target||scene==='bathroom')return ()=>{};
 let bubble=null,shownAt=0,nextAt=Date.now()+4000,index=0,disposed=false;
 function hide(resume=true){if(!bubble)return;bubble.remove();bubble=null;world.dataset.thinking='false';if(resume&&world.dataset.skillBusy!=='true')world.dispatchEvent(new Event('pet-thought-end'));nextAt=Date.now()+12000;}
 function check(){
  if(disposed)return;
  const now=Date.now(),needs=thoughtNeeds(getPet(),scene,now);
  if(document.hidden||world.dataset.skillBusy==='true'||document.querySelector('.overlay')||!needs.length){hide();return;}
  if(bubble){if(!needs.some(n=>n.id===bubble.dataset.need)||now-shownAt>=4000)hide();return;}
  if(now<nextAt)return;
  const need=needs[index++%needs.length];world.dataset.thinking='true';world.dispatchEvent(new Event('pet-thought-start'));
  const w=world.getBoundingClientRect(),head=target.querySelector('.pet-head')?.getBoundingClientRect()||target.getBoundingClientRect();
  bubble=document.createElement('span');bubble.className='pet-thought';bubble.dataset.need=need.id;bubble.setAttribute('role','img');bubble.setAttribute('aria-label',need.label);bubble.innerHTML=icon(need.icon)+'<i></i><i></i>';
  bubble.style.left=Math.max(42,Math.min(w.width-42,head.left+head.width*.5-w.left-world.clientLeft))+'px';bubble.style.top=Math.max(70,head.top-w.top-world.clientTop-66)+'px';world.append(bubble);shownAt=now;
 }
 const timer=setInterval(check,500),interrupt=()=>hide();
 world.addEventListener('pointerdown',interrupt);world.addEventListener('pet-skill-start',interrupt);document.addEventListener('visibilitychange',interrupt);
 return ()=>{disposed=true;clearInterval(timer);hide(false);world.removeEventListener('pointerdown',interrupt);world.removeEventListener('pet-skill-start',interrupt);document.removeEventListener('visibilitychange',interrupt);};
}
