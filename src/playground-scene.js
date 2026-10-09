import {recolorItem} from './item-colors.js';
import {environmentArt,environmentFor} from './park-environments.js';
import {toyFor,toyArt,toyLayout} from './park-toys.js';
export function playgroundScene({species,pet,drawing}){
 const toy=toyFor(species.id),layout=toyLayout(species.id),flying=['sombrios-0','sombrios-1','sombrios-dragon','dinos-pterosaur','selva-owl'].includes(species.id);
 return `<section class="room world playground ${pet.sleeping?'night':''}" aria-label="Parquinho de ${species.name}" style="--park-pet-width:${layout.petWidth}%;--park-pet-left:${layout.petLeft}%"><div class="park-background">${environmentArt(environmentFor(species.id).id,{playground:true,night:pet.sleeping,tall:true})}</div><button class="park-navigation park-back" data-scene="garden" aria-label="Voltar ao Quintal"><span aria-hidden="true">‹</span> Quintal</button><div class="park-object" data-item-color="${pet.itemColors?.[toy?.id]||''}" style="left:${layout.left}%;width:${layout.width}%">${recolorItem(toyArt(species.id),pet.itemColors?.[toy?.id],toy?.type)}</div>${pet.sleeping?'':`<div class="pet-stage park-pet ${flying?'airborne':'grounded'} roaming" id="touch-pet" tabindex="0" role="button" aria-label="Faça carinho no pet"><div class="pet-facing">${drawing(species,'idle',true)}</div><div class="hearts"></div></div>`}<span class="room-caption">${pet.sleeping?'Seu pet está dormindo no quarto.':toy?`${toy.name} · brincar com inteligência 75`: 'Seu cantinho para brincar'}</span></section>`;
}
// One horizontal gesture per pointer. Vertical gestures keep normal page scrolling.
export function bindParkSwipe(world,onNavigate){
 if(!world)return ()=>{};let start=null;
 const down=e=>{if(e.target.closest('button,#touch-pet'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};};
 const up=e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)onNavigate(dx<0?'playground':'garden');};
 const cancel=()=>{start=null;};
 world.addEventListener('pointerdown',down);world.addEventListener('pointerup',up);world.addEventListener('pointercancel',cancel);
 return ()=>{world.removeEventListener('pointerdown',down);world.removeEventListener('pointerup',up);world.removeEventListener('pointercancel',cancel);};
}
