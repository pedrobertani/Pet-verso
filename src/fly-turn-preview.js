// Directional anatomy: native growth artwork, shoulder-anchored wings and a rounded yaw.
import {petDrawing} from './pets.js';
const anchors={'sombrios-1':[[75,146],[125,146]],'sombrios-dragon':[[83,144],[123,144]],'dinos-pterosaur':[[86,117],[114,117]],'selva-owl':[[80,108],[120,108]]};
export function flyTurnPreview(s,angle=Math.PI/2,beat=0,mode='happy'){
 const holder=document.createElement('div');holder.innerHTML=petDrawing({...s,walking:true,carePose:false},mode);const svg=holder.querySelector('svg');
 const side=Math.cos(angle),depth=Math.abs(Math.sin(angle));
 const move=(el,t)=>{if(!el)return;el.setAttribute('transform',t);el.style.transformOrigin='0 0';el.style.transformBox='view-box';el.style.animation='none';};
 svg.querySelectorAll('*').forEach(el=>el.style.animation='none');
 const head=svg.querySelector('.pet-head');move(head,`translate(${side*7} 0) translate(100 100) scale(${.92+.08*depth} 1) translate(-100 -100)`);
 const eyes=head?.querySelector('.eyes');move(eyes,`translate(${side*5} 0)`);
 const body=svg.querySelector('.pet-body');move(body,`translate(100 140) scale(${.91+.09*depth} 1) translate(-100 -140)`);
 for(const [i,wing]of [...svg.querySelectorAll('.pet-wing')].entries()){
  const [x,y]=anchors[s.id][i],near=i===0?-side:side,projection=.8+.2*near,flap=1-.3*beat;
  move(wing,`translate(${x} ${y}) skewY(${(i===0?-1:1)*5*beat}) scale(${projection*flap} 1) translate(${-x} ${-y})`);
 }
 if(s.id==='sombrios-dragon'){
  const muzzle=[...head.children].find(el=>el.tagName==='path'&&el.getAttribute('d')?.startsWith('M104 87'));
  move(muzzle,`translate(104 0) scale(${side} 1) translate(-104 0)`);
  const front=document.createElementNS('http://www.w3.org/2000/svg','ellipse');for(const[k,v]of Object.entries({cx:104,cy:108,rx:23,ry:17,fill:muzzle.getAttribute('fill'),opacity:depth}))front.setAttribute(k,v);head.insertBefore(front,eyes);
  for(const el of head.querySelectorAll('.mouth'))move(el,`translate(${-31*(1-side)} 0)`);
  const pacifier=head.querySelector('.pet-pacifier');if(pacifier){const wrap=document.createElementNS('http://www.w3.org/2000/svg','g');pacifier.parentNode.insertBefore(wrap,pacifier);wrap.append(pacifier);move(wrap,`translate(${-35*(1-side)} 0)`);}
  const nostril=[...head.children].find(el=>el.getAttribute('cx')==='153');move(nostril,`translate(${-49*(1-side)} 0)`);if(nostril)nostril.setAttribute('opacity',Math.abs(side));
 }else if(s.id==='dinos-pterosaur'){
  const beak=[...head.children].find(el=>el.tagName==='path'&&el.getAttribute('d')?.startsWith('M114 76'));
  move(beak,`translate(${100+14*Math.abs(side)} 0) scale(${side} 1) translate(-114 0)`);
  const front=document.createElementNS('http://www.w3.org/2000/svg','path');front.setAttribute('d','M90 90Q100 85 110 90L100 109Z');front.setAttribute('fill','#f3cf8d');front.setAttribute('opacity',depth);head.insertBefore(front,eyes);
  for(const el of [...head.children].filter(el=>el.tagName==='path'&&el.getAttribute('d')?.startsWith('M120 90')))move(el,`translate(${100+14*Math.abs(side)} 0) scale(${side} 1) translate(-114 0)`);
  const pacifier=head.querySelector('.pet-pacifier');if(pacifier){const wrap=document.createElementNS('http://www.w3.org/2000/svg','g');pacifier.parentNode.insertBefore(wrap,pacifier);wrap.append(pacifier);move(wrap,`translate(${-31*(1-side)} 0)`);}
  const nostril=[...head.children].find(el=>el.getAttribute('cx')==='128');move(nostril,`translate(${-28*(1-side)} 0)`);if(nostril)nostril.setAttribute('opacity',Math.abs(side));
 }
 const tail=svg.querySelector('.pet-tail');move(tail,`translate(100 145) scale(${.4+.6*Math.abs(side)} 1) translate(-100 -145)`);
 svg.classList.add('fly-turn-study');return svg.outerHTML;
}
