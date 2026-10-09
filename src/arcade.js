import {arcadeDifficulty} from './difficulty.js';
import {fruitSvgs} from './fruit-assets.js';
// Arcade sessions have no countdown: points grow until three lives are lost.
export function arcade(kind,area,{spriteSvg,sound,onEnd,onScore}){
 area.innerHTML=`<div class="arcade-hud"><span id="arcade-score">0 pontos</span><span id="arcade-lives" aria-label="3 vidas">♥ ♥ ♥</span></div><div class="arcade-tip">${kind==='runner'?'Toque para pular · solte para descer':'Arraste para cortar · cuidado com as bombas'}</div><canvas class="arcade-canvas" width="480" height="640" tabindex="0" aria-label="${kind==='runner'?'Toque para pular e solte para descer':'Arraste o dedo para cortar frutas; evite bombas'}"></canvas>`;
 const canvas=area.querySelector('canvas'),ctx=canvas.getContext('2d'),scoreEl=area.querySelector('#arcade-score'),livesEl=area.querySelector('#arcade-lives');
 const sprite=new Image();sprite.src='data:image/svg+xml,'+encodeURIComponent(spriteSvg.replace(/<svg(?![^>]*xmlns=)/,'<svg xmlns="http://www.w3.org/2000/svg"'));
 const fruitImages=fruitSvgs.map(svg=>{const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);return image;});
 let points=0,lives=3,elapsed=0,last=performance.now(),raf,ended=false,hidden=false;
 const timers=[];const obstacles=[],fruits=[],effects=[],trail=[];let next=kind==='runner'?1.8:.55,jumpY=0,velocity=0,invincible=0,pressed=false,lastPoint=null,coyote=0,jumpBuffer=0,landPulse=0;
 function hud(){scoreEl.textContent=`${points} pontos`;livesEl.textContent=Array.from({length:3},(_,i)=>i<lives?'♥':'♡').join(' ');livesEl.setAttribute('aria-label',`${lives} vidas`);onScore(points);}
 function lose(){if(ended)return;lives--;sound('wrong');hud();if(lives<=0){ended=true;onEnd(points);}}
 function jump(){if(kind!=='runner'||ended)return;if(jumpY===0||coyote>0){velocity=700;coyote=0;jumpBuffer=0;sound('jump');}else jumpBuffer=.13;}
 function pos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*480/r.width,y:(e.clientY-r.top)*640/r.height};}
 function slash(a,b){for(const f of fruits){if(f.hit)continue;const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((f.x-a.x)*dx+(f.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(f.x-a.x-t*dx,f.y-a.y-t*dy)>f.r+8)continue;f.hit=true;if(f.bomb){effects.push({x:f.x,y:f.y,color:'#ffd36e',life:.7,bomb:true});lose();}else{points+=5;effects.push({x:f.x,y:f.y,color:f.color,life:.7,bomb:false});sound('feed');hud();}}}
 function down(e){e.preventDefault();if(kind==='runner')return jump();pressed=true;canvas.setPointerCapture(e.pointerId);lastPoint=pos(e);trail.push({...lastPoint,life:.25});slash(lastPoint,lastPoint);}
 function move(e){if(!pressed||kind!=='food')return;const p=pos(e);slash(lastPoint,p);lastPoint=p;trail.push({...p,life:.25});}
 function up(){pressed=false;lastPoint=null;if(kind==='runner'&&velocity>285)velocity=285;}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 const key=e=>{if(e.code==='Space'&&kind==='runner'){e.preventDefault();jump();}};document.addEventListener('keydown',key);
 const visibility=()=>{hidden=document.hidden;last=performance.now();};document.addEventListener('visibilitychange',visibility);
 function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 function fruit(f){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.rotation);if(f.bomb){circle(0,0,f.r,'#394353');circle(-9,-9,7,'#73808f');ctx.strokeStyle='#9b7655';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(7,-f.r+3);ctx.quadraticCurveTo(10,-f.r-17,24,-f.r-12);ctx.stroke();circle(24,-f.r-12,5,'#ffd665');ctx.restore();return;}
 const fruitImage=fruitImages[f.type%fruitImages.length];if(fruitImage?.complete&&fruitImage.naturalWidth){ctx.drawImage(fruitImage,-f.r,-f.r,f.r*2,f.r*2);ctx.restore();return;}
 if(f.type===0){circle(-8,0,f.r*.8,'#f46c74');circle(8,0,f.r*.8,'#f46c74');ctx.fillStyle='#6bb96e';ctx.beginPath();ctx.ellipse(9,-f.r+3,11,6,-.5,0,Math.PI*2);ctx.fill();}
 else if(f.type===1){circle(0,0,f.r,'#ffad4f');circle(-9,-10,6,'#ffd38a');ctx.fillStyle='#74b968';ctx.beginPath();ctx.ellipse(7,-f.r+2,10,5,-.5,0,Math.PI*2);ctx.fill();}
 else if(f.type===2){circle(0,0,f.r,'#68bc80');circle(0,0,f.r*.82,'#ffdca2');circle(0,0,f.r*.69,'#ed6b7c');ctx.fillStyle='#6f4753';for(const [x,y] of [[-9,-9],[9,-9],[0,4],[-12,12],[12,12]]){ctx.beginPath();ctx.ellipse(x,y,2.5,4,0,0,Math.PI*2);ctx.fill();}}
 else {ctx.fillStyle='#dca0eb';for(const [x,y] of [[-11,-10],[10,-10],[-15,9],[11,10],[0,24]])circle(x,y,12,'#ac7ed7');ctx.fillStyle='#78bd73';ctx.beginPath();ctx.ellipse(5,-26,12,6,-.6,0,Math.PI*2);ctx.fill();}
 ctx.restore();}
 function background(){const sky=ctx.createLinearGradient(0,0,0,640);sky.addColorStop(0,kind==='runner'?'#9edcf2':'#ffe1d4');sky.addColorStop(.58,kind==='runner'?'#d9f1ed':'#f8d9e8');sky.addColorStop(1,kind==='runner'?'#fff2cf':'#d9d0f4');ctx.fillStyle=sky;ctx.fillRect(0,0,480,640);
 if(kind==='runner'){
  circle(397,78,37,'#ffe6a4');circle(397,78,28,'#fff1bd');
  for(let i=0;i<6;i++){const x=((i*128-elapsed*18)%760+760)%760-100,y=105+(i%3)*48;ctx.fillStyle='#fffefaad';ctx.beginPath();ctx.ellipse(x,y,42,14,0,0,Math.PI*2);ctx.ellipse(x+27,y+3,31,12,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#b9d8c5';for(let i=-1;i<5;i++){const x=i*150-(elapsed*19)%150;ctx.beginPath();ctx.moveTo(x,430);ctx.quadraticCurveTo(x+75,285,x+150,430);ctx.fill();}
  ctx.fillStyle='#91c9aa';for(let i=-1;i<6;i++){const x=i*112-(elapsed*34)%112;ctx.beginPath();ctx.arc(x,461,88,Math.PI,0);ctx.fill();}
  ctx.fillStyle='#78bd8a';ctx.fillRect(0,470,480,72);
  for(let i=-1;i<8;i++){const x=i*76-(elapsed*72)%76;ctx.fillStyle='#8a6b53';ctx.fillRect(x+24,437,8,45);circle(x+28,426,25,'#70ad7f');circle(x+10,438,18,'#84bf8b');}
  ctx.strokeStyle='#fff5d9';ctx.lineWidth=6;for(let i=-1;i<7;i++){const x=i*92-(elapsed*105)%92;ctx.beginPath();ctx.moveTo(x,479);ctx.lineTo(x,518);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,491);ctx.lineTo(480,491);ctx.stroke();
  ctx.fillStyle='#efd39d';ctx.fillRect(0,518,480,82);ctx.fillStyle='#d8b77c';ctx.fillRect(0,594,480,46);
  for(let i=-1;i<11;i++){const x=i*57-(elapsed*180)%57;ctx.fillStyle='#d0aa70';ctx.beginPath();ctx.ellipse(x+12,553,17,5,-.08,0,Math.PI*2);ctx.fill();}
  for(let i=-1;i<14;i++){const x=i*43-(elapsed*115)%43;circle(x,505+(i%2)*7,3,i%3?'#fff4bf':'#f3a6b9');}
 }else{
  circle(78,90,34,'#fff1b6');ctx.fillStyle='#ffffff52';for(let i=0;i<7;i++){const x=((i*104-elapsed*12)%650+650)%650-70;ctx.beginPath();ctx.ellipse(x,130+(i%3)*55,39,13,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#c9bde8';for(let i=-1;i<7;i++){ctx.beginPath();ctx.arc(i*86-(elapsed*10)%86,640,105,Math.PI,0);ctx.fill();}
  ctx.fillStyle='#ffffff38';for(let i=0;i<9;i++)circle(i*70,618,60,'#ffffff38');
 }}
 function obstacle(o){ctx.save();ctx.translate(o.x,518-o.h);ctx.shadowColor='#725f4a38';ctx.shadowBlur=5;ctx.shadowOffsetY=4;if(o.type==='rock'){ctx.fillStyle='#8f91ad';ctx.beginPath();ctx.moveTo(0,o.h);ctx.quadraticCurveTo(4,13,14,11);ctx.quadraticCurveTo(o.w*.52,-7,o.w-4,15);ctx.lineTo(o.w,o.h);ctx.closePath();ctx.fill();ctx.strokeStyle='#cfd0e2';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(13,17);ctx.lineTo(o.w*.5,8);ctx.stroke();}
 else if(o.type==='log'){ctx.fillStyle='#ae7652';ctx.beginPath();ctx.roundRect(0,0,o.w,o.h,9);ctx.fill();circle(o.w-9,o.h/2,o.h/2,'#efca91');circle(o.w-9,o.h/2,o.h/3,'#c89662');ctx.strokeStyle='#8f5f43';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,8);ctx.lineTo(24,o.h-7);ctx.stroke();}
 else if(o.type==='bush'){circle(o.w*.22,o.h*.72,o.h*.34,'#4f9f68');circle(o.w*.5,o.h*.42,o.h*.5,'#6fba78');circle(o.w*.8,o.h*.7,o.h*.36,'#4f9f68');circle(o.w*.49,o.h*.38,4,'#f4aac0');}
 else {ctx.fillStyle='#ed8b72';ctx.beginPath();ctx.moveTo(0,o.h);ctx.lineTo(o.w/2,0);ctx.lineTo(o.w,o.h);ctx.closePath();ctx.fill();ctx.fillStyle='#fff2cf';ctx.fillRect(o.w*.2,o.h*.55,o.w*.6,8);}ctx.restore();}
 function frame(now){if(ended)return;const dt=hidden?0:Math.min(.035,(now-last)/1000);last=now;elapsed+=dt;const difficulty=arcadeDifficulty(elapsed);scoreEl.textContent=`${points} pontos · Fase ${difficulty.level}`;next-=dt;invincible=Math.max(0,invincible-dt);background();
 if(kind==='runner'){const speed=difficulty.speed;const wasGrounded=jumpY===0;coyote=wasGrounded?.1:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);velocity-=1600*dt;jumpY=Math.max(0,jumpY+velocity*dt);if(jumpY===0){if(!wasGrounded&&velocity<0)landPulse=.18;velocity=0;if(jumpBuffer>0)jump();}landPulse=Math.max(0,landPulse-dt);
 if(next<=0){const types=['rock','log','bush','cone'],type=types[Math.floor(Math.random()*types.length)],h=type==='log'?32:type==='cone'?52:42+Math.random()*13,w=type==='bush'?52:36+Math.random()*18;obstacles.push({x:500,w,h,type,counted:false,hit:false});next=difficulty.gap+Math.random()*.48;}
 for(const o of obstacles){o.x-=speed*dt;obstacle(o);if(!o.counted&&o.x+o.w<76){o.counted=true;points+=5;hud();}if(!o.hit&&invincible===0&&o.x<137&&o.x+o.w>82&&jumpY<o.h-10){o.hit=true;o.counted=true;invincible=1.25;effects.push({x:108,y:485,color:'#fff0c2',life:.45,bomb:false});lose();}}while(obstacles.length&&obstacles[0].x<-90)obstacles.shift();
 const shadowScale=Math.max(.45,1-jumpY/260);ctx.save();ctx.globalAlpha=.2;ctx.fillStyle='#6d5947';ctx.beginPath();ctx.ellipse(107,516,42*shadowScale,9*shadowScale,0,0,Math.PI*2);ctx.fill();ctx.restore();
 if(landPulse>0){ctx.save();ctx.globalAlpha=landPulse/.18;for(let i=0;i<5;i++)circle(72+i*17,514-i%2*5,4,'#ead09d');ctx.restore();}
 if(invincible===0||Math.floor(elapsed*12)%2===0){ctx.save();const bob=jumpY===0?Math.sin(elapsed*15)*2:0;if(sprite.complete&&sprite.naturalWidth)ctx.drawImage(sprite,52,518-100-jumpY+bob,110,110);else circle(107,475-jumpY,30,'#bd9be2');ctx.restore();}}
 else {if(next<=0){const count=difficulty.wave+Math.floor(Math.random()*2);for(let i=0;i<count;i++){const type=Math.floor(Math.random()*fruitImages.length),bomb=Math.random()<difficulty.bombChance;fruits.push({x:70+Math.random()*340,y:690,vx:(Math.random()-.5)*95,vy:-660-Math.random()*130,r:27,type,bomb,hit:false,rotation:0,spin:(Math.random()-.5)*2,color:['#c91f3d','#e52d4f','#f4900c','#dd2e44','#ff886c','#5c913b','#9266cc'][type]});}next=difficulty.fruitGap;}
 for(const f of fruits){f.x+=f.vx*dt;f.vy+=700*dt;f.y+=f.vy*dt;f.rotation+=f.spin*dt;if(!f.hit)fruit(f);if(f.y>730&&f.vy>0&&!f.hit){f.hit=true;if(!f.bomb)lose();}}for(let i=fruits.length-1;i>=0;i--)if(fruits[i].hit||fruits[i].y>740)fruits.splice(i,1);
 for(const e of effects){e.life-=dt;ctx.globalAlpha=Math.max(0,e.life/.7);circle(e.x-35*(.7-e.life),e.y,e.bomb?35:16,e.color);circle(e.x+35*(.7-e.life),e.y+8,e.bomb?20:13,e.color);ctx.globalAlpha=1;}for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);
 for(const t of trail)t.life-=dt;while(trail.length&&trail[0].life<=0)trail.shift();if(trail.length>1){ctx.strokeStyle='#fffdf6';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();trail.forEach((t,i)=>i?ctx.lineTo(t.x,t.y):ctx.moveTo(t.x,t.y));ctx.stroke();}}
 if(!ended)raf=requestAnimationFrame(frame);}
 hud();canvas.focus();raf=requestAnimationFrame(frame);
 return ()=>{ended=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);};
}
