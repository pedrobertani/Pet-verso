import {arcadeDifficulty} from './difficulty.js';
import {fruitSvgs} from './fruit-assets.js';
// Arcade sessions have no countdown: points grow until three lives are lost.
export function arcade(kind,area,{spriteSvg,sound,onEnd,onScore}){
 area.innerHTML=`<div class="arcade-hud"><span id="arcade-score">0 pontos</span><span id="arcade-lives" aria-label="3 vidas">♥ ♥ ♥</span></div><canvas class="arcade-canvas" width="480" height="640" tabindex="0" aria-label="${kind==='runner'?'Toque para pular':'Arraste o dedo para cortar frutas; evite bombas'}"></canvas>`;
 const canvas=area.querySelector('canvas'),ctx=canvas.getContext('2d'),scoreEl=area.querySelector('#arcade-score'),livesEl=area.querySelector('#arcade-lives');
 const sprite=new Image();sprite.src='data:image/svg+xml,'+encodeURIComponent(spriteSvg.replace(/<svg(?![^>]*xmlns=)/,'<svg xmlns="http://www.w3.org/2000/svg"'));
 const fruitImages=fruitSvgs.map(svg=>{const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);return image;});
 let points=0,lives=3,elapsed=0,last=performance.now(),raf,ended=false,hidden=false;
 const timers=[];const obstacles=[],fruits=[],effects=[],trail=[];let next=kind==='runner'?2:.55,jumpY=0,velocity=0,invincible=0,pressed=false,lastPoint=null;
 function hud(){scoreEl.textContent=`${points} pontos`;livesEl.textContent=Array.from({length:3},(_,i)=>i<lives?'♥':'♡').join(' ');livesEl.setAttribute('aria-label',`${lives} vidas`);onScore(points);}
 function lose(){if(ended)return;lives--;sound('wrong');hud();if(lives<=0){ended=true;onEnd(points);}}
 function jump(){if(kind==='runner'&&jumpY===0&&!ended){velocity=690;sound('jump');}}
 function pos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*480/r.width,y:(e.clientY-r.top)*640/r.height};}
 function slash(a,b){for(const f of fruits){if(f.hit)continue;const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((f.x-a.x)*dx+(f.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(f.x-a.x-t*dx,f.y-a.y-t*dy)>f.r+8)continue;f.hit=true;if(f.bomb){effects.push({x:f.x,y:f.y,color:'#ffd36e',life:.7,bomb:true});lose();}else{points+=10;effects.push({x:f.x,y:f.y,color:f.color,life:.7,bomb:false});sound('feed');hud();}}}
 function down(e){e.preventDefault();if(kind==='runner')return jump();pressed=true;canvas.setPointerCapture(e.pointerId);lastPoint=pos(e);trail.push({...lastPoint,life:.25});slash(lastPoint,lastPoint);}
 function move(e){if(!pressed||kind!=='food')return;const p=pos(e);slash(lastPoint,p);lastPoint=p;trail.push({...p,life:.25});}
 function up(){pressed=false;lastPoint=null;}
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
 function background(){const sky=ctx.createLinearGradient(0,0,0,640);sky.addColorStop(0,kind==='runner'?'#7bdafa':'#d8c0f6');sky.addColorStop(1,kind==='runner'?'#edfcde':'#ffdfc7');ctx.fillStyle=sky;ctx.fillRect(0,0,480,640);
 if(kind==='runner'){circle(392,76,34,'#ffe599');for(let i=0;i<5;i++){const x=(i*150-elapsed*25)%750;ctx.fillStyle='#ffffffbb';ctx.beginPath();ctx.ellipse(x,130+i%2*50,45,16,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#90d48c';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(i*150-elapsed*40%150,475,105,Math.PI,0);ctx.fill();}ctx.fillStyle='#72c98a';ctx.fillRect(0,480,480,160);ctx.fillStyle='#efd9a0';ctx.fillRect(0,518,480,70);for(let i=0;i<12;i++){ctx.fillStyle='#d4b57b';ctx.fillRect(i*65-elapsed*180%65,550,23,5);}}
 else {ctx.fillStyle='#ffffff30';for(let i=0;i<9;i++)circle(i*70,610,60,'#ffffff30');}}
 function obstacle(o){ctx.save();ctx.translate(o.x,518-o.h);if(o.type==='rock'){ctx.fillStyle='#9f99bd';ctx.beginPath();ctx.moveTo(0,o.h);ctx.lineTo(8,14);ctx.lineTo(o.w*.5,0);ctx.lineTo(o.w-5,14);ctx.lineTo(o.w,o.h);ctx.closePath();ctx.fill();ctx.strokeStyle='#d4cce5';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(12,18);ctx.lineTo(o.w*.48,9);ctx.stroke();}
 else if(o.type==='log'){ctx.fillStyle='#b67e53';ctx.fillRect(0,0,o.w,o.h);circle(o.w-9,o.h/2,o.h/2,'#ebc58b');circle(o.w-9,o.h/2,o.h/3,'#c89b68');}
 else if(o.type==='bush'){circle(o.w*.25,o.h*.7,o.h*.35,'#4ba96b');circle(o.w*.5,o.h*.43,o.h*.5,'#66bd75');circle(o.w*.8,o.h*.7,o.h*.35,'#4ba96b');}
 else {ctx.fillStyle='#f5967e';ctx.beginPath();ctx.moveTo(0,o.h);ctx.lineTo(o.w/2,0);ctx.lineTo(o.w,o.h);ctx.fill();ctx.fillStyle='#fff2cc';ctx.fillRect(o.w*.25,o.h*.55,o.w*.5,8);}ctx.restore();}
 function frame(now){if(ended)return;const dt=hidden?0:Math.min(.035,(now-last)/1000);last=now;elapsed+=dt;const difficulty=arcadeDifficulty(elapsed);scoreEl.textContent=`${points} pontos · Fase ${difficulty.level}`;next-=dt;invincible=Math.max(0,invincible-dt);background();
 if(kind==='runner'){const speed=difficulty.speed;velocity-=1550*dt;jumpY=Math.max(0,jumpY+velocity*dt);if(!jumpY)velocity=0;if(next<=0){const types=['rock','log','bush','cone'],type=types[Math.floor(Math.random()*4)],h=type==='log'?34:45+Math.random()*14;obstacles.push({x:500,w:35+Math.random()*20,h,type,counted:false});next=difficulty.gap+Math.random()*.4;}
 for(const o of obstacles){o.x-=speed*dt;obstacle(o);if(!o.counted&&o.x+o.w<68){o.counted=true;points+=10;hud();}if(invincible===0&&o.x<136&&o.x+o.w>78&&jumpY<o.h-8){o.counted=true;invincible=1.2;lose();}}while(obstacles.length&&obstacles[0].x<-90)obstacles.shift();
 if(invincible===0||Math.floor(elapsed*12)%2===0){if(sprite.complete&&sprite.naturalWidth)ctx.drawImage(sprite,52,518-100-jumpY,110,110);else circle(107,475-jumpY,30,'#bd9be2');}}
 else {if(next<=0){const count=difficulty.wave+Math.floor(Math.random()*2);for(let i=0;i<count;i++){const type=Math.floor(Math.random()*fruitImages.length),bomb=Math.random()<difficulty.bombChance;fruits.push({x:70+Math.random()*340,y:690,vx:(Math.random()-.5)*95,vy:-660-Math.random()*130,r:27,type,bomb,hit:false,rotation:0,spin:(Math.random()-.5)*2,color:['#c91f3d','#e52d4f','#f4900c','#dd2e44','#ff886c','#5c913b','#9266cc'][type]});}next=difficulty.fruitGap;}
 for(const f of fruits){f.x+=f.vx*dt;f.vy+=700*dt;f.y+=f.vy*dt;f.rotation+=f.spin*dt;if(!f.hit)fruit(f);if(f.y>730&&f.vy>0&&!f.hit){f.hit=true;if(!f.bomb)lose();}}for(let i=fruits.length-1;i>=0;i--)if(fruits[i].hit||fruits[i].y>740)fruits.splice(i,1);
 for(const e of effects){e.life-=dt;ctx.globalAlpha=Math.max(0,e.life/.7);circle(e.x-35*(.7-e.life),e.y,e.bomb?35:16,e.color);circle(e.x+35*(.7-e.life),e.y+8,e.bomb?20:13,e.color);ctx.globalAlpha=1;}for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);
 for(const t of trail)t.life-=dt;while(trail.length&&trail[0].life<=0)trail.shift();if(trail.length>1){ctx.strokeStyle='#fffdf6';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();trail.forEach((t,i)=>i?ctx.lineTo(t.x,t.y):ctx.moveTo(t.x,t.y));ctx.stroke();}}
 if(!ended)raf=requestAnimationFrame(frame);}
 hud();canvas.focus();raf=requestAnimationFrame(frame);
 return ()=>{ended=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);};
}
