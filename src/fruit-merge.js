import {fruitSvgs} from './fruit-assets.js';

const ORDER=[1,0,2,3,4,6,5];
const NAMES=['Morango','Cerejas','Tangerina','Maçã','Pêssego','Uvas','Melancia'];
const RADII=[18,23,29,36,44,53,66];
const COLORS=['#f5a6bd','#df6d7c','#f6ad61','#e36d76','#f39b80','#a98bd4','#75b978'];

export function fruitMergeGame(area,{sound,onScore,onEnd}){
 area.innerHTML=`<div class="fruit-merge-hud"><strong id="fruit-merge-score">0 pontos</strong><span>Próxima: <b id="fruit-merge-next">Morango</b></span></div><p class="fruit-merge-help">Arraste para escolher o lugar e solte a fruta. Junte duas iguais!</p><canvas class="fruit-merge-canvas" width="360" height="520" aria-label="Jogo de combinar frutas"></canvas>`;
 const canvas=area.querySelector('canvas'),ctx=canvas.getContext('2d'),scoreEl=area.querySelector('#fruit-merge-score'),nextEl=area.querySelector('#fruit-merge-next');
 const images=fruitSvgs.map(svg=>{const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);return image;});
 const fruits=[];let score=0,current=0,next=randomStarter(),aimX=180,ready=true,ended=false,raf,last=performance.now(),danger=0;
 function randomStarter(){const r=Math.random();return r<.56?0:r<.88?1:2;}
 function imageFor(level){return images[ORDER[level]];}
 function updateHud(){scoreEl.textContent=`${score} pontos`;nextEl.textContent=NAMES[next];onScore(score);}
 function pos(e){const r=canvas.getBoundingClientRect();return Math.max(RADII[current]+8,Math.min(360-RADII[current]-8,(e.clientX-r.left)*360/r.width));}
 function drop(){if(!ready||ended)return;fruits.push({x:aimX,y:56,r:RADII[current],level:current,vx:0,vy:35,dead:false,settled:0});current=next;next=randomStarter();aimX=Math.max(RADII[current]+8,Math.min(360-RADII[current]-8,aimX));ready=false;nextEl.textContent=NAMES[next];sound('feed');setTimeout(()=>{ready=true;},420);}
 function pointer(e){e.preventDefault();aimX=pos(e);}
 canvas.addEventListener('pointerdown',e=>{pointer(e);canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(canvas.hasPointerCapture(e.pointerId))pointer(e);});
 canvas.addEventListener('pointerup',e=>{pointer(e);drop();});
 canvas.addEventListener('pointercancel',()=>{});
 function drawFruit(f,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.translate(f.x,f.y);ctx.shadowColor='#6e59442e';ctx.shadowBlur=5;ctx.shadowOffsetY=4;const image=imageFor(f.level);if(image?.complete&&image.naturalWidth)ctx.drawImage(image,-f.r,-f.r,f.r*2,f.r*2);else{ctx.fillStyle=COLORS[f.level];ctx.beginPath();ctx.arc(0,0,f.r,0,Math.PI*2);ctx.fill();}ctx.restore();}
 function merge(a,b){a.dead=b.dead=true;const level=a.level+1,r=RADII[level];fruits.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,r,level,vx:(a.vx+b.vx)/2,vy:Math.min(a.vy,b.vy)-80,dead:false,settled:0});score+=(level+1)*3;sound('match');updateHud();}
 function physics(dt){
  for(const f of fruits){if(f.dead)continue;f.vy+=720*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.pow(.12,dt);if(f.x-f.r<8){f.x=f.r+8;f.vx=Math.abs(f.vx)*.35;}if(f.x+f.r>352){f.x=352-f.r;f.vx=-Math.abs(f.vx)*.35;}if(f.y+f.r>510){f.y=510-f.r;f.vy*=-.16;if(Math.abs(f.vy)<18)f.vy=0;}}
  for(let pass=0;pass<3;pass++)for(let i=0;i<fruits.length;i++){const a=fruits[i];if(a.dead)continue;for(let j=i+1;j<fruits.length;j++){const b=fruits[j];if(b.dead)continue;const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.01,min=a.r+b.r;if(dist>=min)continue;if(a.level===b.level&&a.level<NAMES.length-1){merge(a,b);break;}const nx=dx/dist,ny=dy/dist,overlap=(min-dist)/2;a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){const impulse=-rel*.42;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}}}
  for(let i=fruits.length-1;i>=0;i--)if(fruits[i].dead)fruits.splice(i,1);
  const threatened=fruits.some(f=>f.y-f.r<82&&Math.abs(f.vy)<35);danger=threatened?danger+dt:Math.max(0,danger-dt*2);if(danger>1.8){ended=true;sound('wrong');onEnd(score);}
 }
 function background(){
  const gradient=ctx.createLinearGradient(0,0,0,520);gradient.addColorStop(0,'#fff5e8');gradient.addColorStop(1,'#f1e4f5');ctx.fillStyle=gradient;ctx.fillRect(0,0,360,520);
  ctx.fillStyle='#ffffff70';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(30+i*60,510,58,Math.PI,0);ctx.fill();}
  ctx.strokeStyle=danger>0?'#e98691':'#e4c7bf';ctx.lineWidth=3;ctx.setLineDash([8,7]);ctx.beginPath();ctx.moveTo(8,78);ctx.lineTo(352,78);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#cdaea5';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(5,18);ctx.lineTo(5,514);ctx.lineTo(355,514);ctx.lineTo(355,18);ctx.stroke();
 }
 function frame(now){if(ended)return;const dt=Math.min(.025,(now-last)/1000);last=now;physics(dt);background();for(const f of fruits)drawFruit(f);if(ready){ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle='#967668';ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(aimX,12);ctx.lineTo(aimX,45);ctx.stroke();ctx.setLineDash([]);drawFruit({x:aimX,y:34,r:RADII[current],level:current},.88);ctx.restore();}raf=requestAnimationFrame(frame);}
 updateHud();raf=requestAnimationFrame(frame);
 return ()=>{ended=true;cancelAnimationFrame(raf);};
}
