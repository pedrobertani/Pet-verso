// Directional anatomy shared by previews and the game.
import {petDrawing} from './pets.js';
import {dogTurnPreview} from './dog-turn-preview.js';
const bipeds=new Set(['selva-4','selva-brown','selva-polar','exoticos-penguin','dinos-0','exoticos-frog','sombrios-frankie','sombrios-6']);
export function landTurnPreview(s,angle=0,mode='happy'){
 if(s.id==='pets-1')return dogTurnPreview(s,angle,mode);
 const side=Math.cos(angle),depth=Math.sin(angle),amount=Math.abs(side),sign=side<0?-1:1;
 const holder=document.createElement('div');holder.innerHTML=petDrawing({...s,growthLevel:s.growthLevel??2,walking:!bipeds.has(s.id),carePose:bipeds.has(s.id)},mode);
 const svg=holder.querySelector('svg');svg.style.overflow='visible';document.body.append(holder);holder.style.cssText='position:absolute;visibility:hidden';
 const parts=[...svg.querySelectorAll('.pet-body,.pet-head,.pet-leg,.pet-tail,.pet-plates,.pet-arm')].filter(el=>!el.parentElement.closest('.pet-body,.pet-head,.pet-leg,.pet-tail'));
 const boxes=new Map(parts.map(el=>[el,el.getBBox()]));holder.remove();
 const quad=!bipeds.has(s.id),body=parts.find(p=>p.classList.contains('pet-body')),bb=boxes.get(body),center=bb?bb.x+bb.width/2:100;
 const legs=parts.filter(p=>p.classList.contains('pet-leg'));const legBoxes=legs.map(p=>boxes.get(p));const frontAt=legBoxes.length?Math.max(...legBoxes.map(b=>b.x+b.width/2)):130;
 function transform(el,cx,cy,sx=1,sy=1){const b=boxes.get(el),ox=b.x+b.width/2,oy=b.y+b.height/2;el.setAttribute('transform',`translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-ox} ${-oy})`);el.style.animation='none';el.style.transformOrigin='0 0';el.style.transformBox='view-box';}
 for(const el of parts){const b=boxes.get(el),x=b.x+b.width/2,y=b.y+b.height/2;
 if(el.classList.contains('pet-body')){if(s.id==='selva-capybara'){const w=29+25*amount,l=100-w,r=100+w,fill=el.querySelector('[fill]')?.getAttribute('fill')||'#d7a36e';el.innerHTML=`<path d="M${l+20} 106H${r-20}Q${r} 106 ${r} 128V143Q${r} 166 ${r-22} 166H${l+22}Q${l} 166 ${l} 143V128Q${l} 106 ${l+20} 106Z" fill="${fill}"/>`;el.removeAttribute('transform');el.style.animation='none';}else transform(el,100,y,sign*(quad?(amount*.35+.65):(.84+.16*depth)),1);}
 else if(el.classList.contains('pet-head')){transform(el,100+(x-100)*side+(quad?0:side*4),y+(s.id==='exoticos-7'?depth*14:0),sign*(.86+.14*depth),1);const trunk=el.querySelector('.pet-trunk');if(trunk){trunk.setAttribute('transform',`translate(${-depth*28} 0)`);trunk.style.transformOrigin='0 0';trunk.style.transformBox='view-box';}const eyes=el.querySelector('.eyes');if(eyes){const dots=[...eyes.querySelectorAll('ellipse')];const centers=dots.filter(e=>!['#fff','white'].includes(e.getAttribute('fill'))).map(e=>Number(e.getAttribute('cx')));const mid=centers.length?(Math.min(...centers)+Math.max(...centers))/2:100;const aligned=['selva-capybara','selva-fox'].includes(s.id);const irises=dots.filter(e=>!['#fff','white'].includes(e.getAttribute('fill')));const irisY=irises.length?irises.reduce((sum,e)=>sum+Number(e.getAttribute('cy')),0)/irises.length:100;for(const dot of dots){const original=Number(dot.getAttribute('cx'));if(aligned){const iris=irises.reduce((best,e)=>Math.abs(Number(e.getAttribute('cx'))-original)<Math.abs(Number(best.getAttribute('cx'))-original)?e:best,irises[0]);const ix=Number(iris.getAttribute('cx')),iy=Number(iris.getAttribute('cy'));dot.dataset.eyeX=String((ix<mid?-6:6)+original-ix);dot.dataset.eyeY=String(irisY+Number(dot.getAttribute('cy'))-iy);}else dot.dataset.eyeX=String((original-mid)*(.85+.15*depth));dot.style.opacity='1';}for(const dot of dots){dot.setAttribute('cx',String(mid+Number(dot.dataset.eyeX)));if(aligned)dot.setAttribute('cy',dot.dataset.eyeY);dot.removeAttribute('data-eye-x');dot.removeAttribute('data-eye-y');}}}

 else if(el.classList.contains('pet-leg')){const front=quad&&x>=frontAt-20,near=legs.indexOf(el)>=Math.floor(legs.length/2);const spread=s.id==='selva-capybara'?36:bb?Math.min(32,bb.width*.28):28;const nx=quad?100+(front?spread:-spread)*side+(near?10:-10)*depth:100+(x-100)*(.9+.1*amount);const baseline=quad?Math.max(...legBoxes.map(r=>r.y+r.height)):b.y+b.height;const ny=quad?baseline-b.height/2:y;transform(el,nx,ny,quad?sign:1,1);if(quad&&!front&&body&&el.parentElement===body.parentElement)body.parentElement.insertBefore(el,body);}

 else if(el.classList.contains('pet-tail')){const root=({'pets-mouse':[66,151],'dinos-0':[84,136],'dinos-1':[64,133],'dinos-2':[64,128],'dinos-3':[57,127]})[s.id];if(root){const width=quad?amount*.35+.65:.84+.16*depth;el.setAttribute('transform',`translate(${100+(root[0]-center)*sign*width} ${root[1]}) scale(${sign*(.5+.5*amount)} 1) translate(${-root[0]} ${-root[1]})`);el.style.animation='none';el.style.transformOrigin='0 0';el.style.transformBox='view-box';}else transform(el,100+(x-center)*side,y,sign*(.5+.5*amount),1);}
 else if(el.classList.contains('pet-plates'))transform(el,100+(x-center)*side,y,.65+.35*amount,1);
 else transform(el,100+(x-100)*side,y,sign*(.8+.2*amount),1);
 }
 svg.classList.add('land-turn-study');svg.querySelectorAll('*').forEach(el=>el.style.animation='none');
 return svg.outerHTML;
}
