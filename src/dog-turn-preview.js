// Directional anatomy: redraw anatomy through a turn; never flatten or mirror the whole pet.
import {growthArt} from './growth-art.js';
import {mouth} from './pet-art.js';
import {babyPacifier} from './baby-pacifier.js';
const ellipse=(x,y,rx,ry,fill)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
export function dogTurnPreview(s,angle=0,mode='happy'){
 const side=Math.cos(angle),depth=Math.sin(angle),amount=Math.abs(side),dir=Math.sign(side)||1;
 const coat=s.palette?.color||'#d2a079',detail=s.palette?.detail||'#895438',cream='#fff0da';
 const headX=100+side*39,headY=95,bodyW=29+amount*25;
 const paw=(x,y,far=false)=>`<g class="pet-leg ${far?'far-paw':'near-paw'}"><path d="M${x-10} ${y-34}q7-3 20 0l1 32q0 6-7 6h-8q-5-2-3-7Z" fill="${coat}" stroke="#43526055" stroke-width="1.2"/>${ellipse(x,y+2,11,4,coat)}</g>`;
 const backX=100-side*35,frontX=100+side*32;
 const rearLegs=paw(backX-12*depth,181-16*depth,true)+paw(backX+12*depth,181-16*depth);
 const frontLegs=paw(frontX-12*depth,181,true)+paw(frontX+12*depth,181);
 const tail=`<g class="pet-tail"><path d="M${100-side*bodyW*.8} 131Q${100-side*(bodyW+23)} 135 ${100-side*(bodyW+21)} 106" fill="none" stroke="${detail}" stroke-width="10" stroke-linecap="round"/></g>`;
 const body=`<g class="pet-body">${ellipse(100,128,bodyW,34,coat)}${ellipse(100,147,bodyW*.65,10,coat)}</g>`;
 const ear=(x,y,near)=>`<g class="pet-ear">${ellipse(x,y,near?12:10,31,detail)}</g>`;
 const leftEar=ear(headX-(25+5*depth)+side*5,headY+2,true);
 const rightEar=ear(headX+(25+5*depth)+side*5,headY+2,true);
 const farEar=side>=0?rightEar:leftEar,nearEar=side>=0?leftEar:rightEar;
 const eye=(x,y,r)=>ellipse(x,y,r,r*1.2,'#314457')+ellipse(x+1,y-2,r*.27,r*.32,'white');
 const eyeNear=headX+dir*(amount*0-15*depth),eyeFar=headX+dir*(15*depth+amount*20);
 const muzzleX=headX+side*20,muzzleY=headY+16;
 const face=ellipse(headX,headY,33-amount*2,33,coat)+
 `<g class="eyes">${eye(eyeNear,headY-4,6)}${amount<.95?eye(eyeFar,headY-5,6-amount*3):''}</g>`+
 ellipse(muzzleX,muzzleY,25-amount*3,18,cream)+ellipse(muzzleX+side*7,muzzleY-9,6,5,'#674637')+
 mouth(mode,muzzleX,muzzleY+6,19,{tongue:true});
 let art=tail+rearLegs+body+frontLegs+`<g class="pet-head">${farEar}${face}${nearEar}</g>`+(s.dirty?'<g class="pet-dirt" fill="#87623d" opacity=".5"><ellipse cx="86" cy="146" rx="11" ry="6"/><ellipse cx="135" cy="116" rx="8" ry="5"/></g>':'');
 if((s.growthLevel??2)===0)art=babyPacifier(art,'pets-1');
 return growthArt(`<svg xmlns="http://www.w3.org/2000/svg" class="creature standard-pet walking-pose species-pets-1 dog-turn-study ${mode}" viewBox="0 0 200 200"><defs></defs>${art}</svg>`,'pets-1',s.growthLevel??2);
}
