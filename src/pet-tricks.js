export const TRICK_INTELLIGENCE=50,TRICK_COOLDOWN=15000;
// Translation belongs to the stage; orientation belongs to the facing wrapper.
// Separate tracks prevent a mirrored local movement from looking like reversing.
export const stegoReturnFrames=[
 {offset:0,translate:'0px 0px'},
 {offset:.22,translate:'30px 0px'},
 {offset:.29,translate:'30px 0px'},
 {offset:.37,translate:'25px -18px'},
 {offset:.44,translate:'20px 0px'},
 {offset:.52,translate:'15px -18px'},
 {offset:.59,translate:'10px 0px'},
 {offset:.67,translate:'5px -18px'},
 {offset:.74,translate:'0px 0px'},
 {offset:1,translate:'0px 0px'}
];
export const stegoTurnFrames=[
 {offset:0,transform:'scaleX(1)'},
 {offset:.27,transform:'scaleX(1)'},
 {offset:.3,transform:'scaleX(-1)'},
 {offset:.92,transform:'scaleX(-1)'},
 {offset:1,transform:'scaleX(1)'}
];
export const tricks={
 'dinos-pterosaur':['spin','Girar no ar'],'selva-owl':['owl-turn','Recolher asas e virar a cabeça'],'exoticos-frog':['hop','Saltar'],
 'pets-1':['paw-roll','Dar a pata e rolar'],'pets-0':['stretch','Espreguiçar'],'pets-2':['hop','Pular'],'pets-mouse':['sniff','Ficar de pé e farejar'],
 'exoticos-0':['wiggle','Mexer cauda e brânquias'],'exoticos-1':['color','Mudar de cor'],'exoticos-7':['shell','Entrar no casco'],
 'selva-0':['roar','Rugir'],'selva-2':['splash','Jogar água'],'selva-4':['roll','Rolar'],'selva-brown':['roll','Rolar'],'selva-polar':['roll','Rolar'],
 'selva-capybara':['relax','Deitar e relaxar'],'selva-fox':['pounce','Saltinho de caça'],'exoticos-penguin':['flap','Bater nadadeiras'],
 'dinos-0':['roar','Rugir'],'dinos-1':['dash','Correr'],'dinos-2':['dash','Correr'],'dinos-3':['dash','Correr'],
 'sombrios-frankie':['short-circuit','Curto-circuito'],'sombrios-6':['bandage-whirl','Redemoinho de faixas'],
 'sombrios-0':['vanish','Desaparecer'],'sombrios-1':['spin','Girar no ar'],'sombrios-dragon':['flame','Cuspir uma pequena chama']
};
export function trickState(p,now=Date.now()){return {locked:p.stats.intelligence<50,blocked:!!(p.sleeping||p.dead),remaining:Math.max(0,Math.ceil(((p.skills?.trickUntil||0)-now)/1000))};}
export function startTrick(p,now=Date.now()){const state=trickState(p,now);if(state.locked||state.blocked||state.remaining||!tricks[p.species])return false;p.skills={...p.skills,trickUntil:now+TRICK_COOLDOWN};return true;}
// Animate existing anatomy, preserving the growth wrappers around each part.
export function animateTrick(target,id,{draw,sound=()=>{},reducedMotion=false,onEnd=()=>{}}={}){
 let kind=tricks[id]?.[0];if(!kind)return ()=>{};
 const face=target.querySelector('.pet-facing');
 const originalMarkup=face.innerHTML;
 // Directional previews distort anatomical coordinates and may point the wrong way.
 // Use the original species drawing for tricks that need a true body or trunk anchor.
 const needsCanonicalArt=id==='selva-2'||id==='dinos-3';
 if(typeof draw==='function'&&(needsCanonicalArt||!face.querySelector('svg')))face.innerHTML=draw();
 const previousWalkState=target.style.animationPlayState;
 target.style.animationPlayState='paused';
 target.classList.add('performing-trick');
 const svg=face.querySelector('svg'),animations=[],effects=[];let disposed=false;
 const part=(selector,frames,duration=2400,origin='50% 50%',options={})=>{for(const el of selector==='root'?[svg]:svg.querySelectorAll(selector)){el.style.transformBox='fill-box';el.style.transformOrigin=origin;animations.push(el.animate(frames,{duration:reducedMotion?800:duration,easing:'ease-in-out',fill:'none',...options}));}};
 if(id==='exoticos-frog'&&svg.querySelector('.tadpole'))kind='wiggle';
 const motion=values=>values.map(transform=>({transform}));
 const roll=(delay=0)=>part('root',motion(['translateX(0) rotate(0deg)','translateX(12px) rotate(90deg) scale(.8)','translateX(18px) rotate(180deg) scale(.8)','translateX(12px) rotate(270deg) scale(.8)','translateX(0) rotate(360deg)']),1800,'50% 58%',{delay});
 const effect=(markup,cls)=>{const el=document.createElement('div');el.className='trick-effect '+cls;el.innerHTML=markup;face.append(el);effects.push(el);};
 let duration=2600;
 switch(kind){
 case 'paw-roll':svg.querySelectorAll('.pet-leg').item(svg.querySelectorAll('.pet-leg').length-1)?.classList.add('trick-paw');part('.trick-paw',motion(['rotate(0deg)','rotate(-65deg)','rotate(-65deg)','rotate(0deg)']),1100,'50% 15%');roll(1100);duration=3100;break;
 case 'roll':roll();break;
 case 'stretch':part('.pet-body',motion(['scaleY(1)','scaleY(1.22)','scaleY(1.22)','scaleY(1)']),2600,'50% 100%');part('.pet-head',motion(['translateY(0)','translateY(-3px)','translateY(0)']),2600);break;
 case 'hop':part('root',[
 {offset:0,transform:'translate(0,0) scaleX(1)'},
 {offset:.2,transform:'translate(13px,-24px) scaleX(1)'},
 {offset:.35,transform:'translate(26px,0) scaleX(1)'},
 {offset:.4,transform:'translate(26px,0) scaleX(-1)'},
 {offset:.6,transform:'translate(13px,-24px) scaleX(-1)'},
 {offset:.75,transform:'translate(0,0) scaleX(-1)'},
 {offset:.85,transform:'translate(0,0) scaleX(1)'},
 {offset:1,transform:'translate(0,0) scaleX(1)'}
 ],2400,'50% 100%');break;
 case 'sniff':{
 const rise=svg.querySelector('.mouse-rise');if(rise){rise.style.transformBox='view-box';rise.style.transformOrigin='76px 173px';animations.push(rise.animate(motion(['rotate(0deg)','rotate(-43deg)','rotate(-43deg)','rotate(0deg)']),{duration:reducedMotion?800:2600,easing:'ease-in-out'}));}break;}
 case 'wiggle':part('.pet-tail',motion(['rotate(-14deg)','rotate(14deg)','rotate(-14deg)']),450,'15% 50%',{iterations:5});part('.pet-head',motion(['rotate(-5deg)','rotate(5deg)','rotate(-5deg)']),450,'50% 75%',{iterations:5});break;
 case 'color':part('root',[{filter:'hue-rotate(0deg)'},{filter:'hue-rotate(80deg)'},{filter:'hue-rotate(190deg)'},{filter:'hue-rotate(0deg)'}],2600);break;
 case 'shell':part('.pet-head,.pet-leg,.pet-tail',motion(['scale(1)','scale(.04)','scale(.04)','scale(1)']),2800,'50% 85%');duration=3000;break;
 case 'roar':part('.pet-head',motion(['scale(1)','scale(1.06) rotate(-5deg)','scale(1.03)','scale(1)']),2200);sound(id==='dinos-0'?'dino-roar':'lion-roar');effect('<svg viewBox="0 0 100 100"><path d="M62 35q15 15 0 30M75 25q25 25 0 50" fill="none" stroke="#efc667" stroke-width="4" stroke-linecap="round"/></svg>','trick-roar');break;
 case 'splash':{
 const trunk=svg.querySelector('.pet-trunk');
 if(trunk){
  const ns='http://www.w3.org/2000/svg',jet=document.createElementNS(ns,'g');
  jet.setAttribute('class','trunk-water-jet');
  // The modeled trunk's nozzle is near (150,151); this jet inherits trunk, head
  // and growth-size transforms, including the smaller young elephant anatomy.
  jet.innerHTML='<path d="M150 151 Q172 141 176 109 M150 151 Q182 149 190 128" fill="none" stroke="#6fd6ee" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="176" cy="108" rx="4" ry="7" fill="#89e6f4"/><ellipse cx="190" cy="127" rx="4" ry="6" fill="#89e6f4"/>';
  trunk.append(jet);effects.push(jet);
  // Use SVG view-box coordinates so the water itself does not shift the pivot.
  const originalBox=trunk.style.transformBox,originalOrigin=trunk.style.transformOrigin;
  trunk.style.transformBox='view-box';trunk.style.transformOrigin='100px 105px';
  effects.push({remove(){trunk.style.transformBox=originalBox;trunk.style.transformOrigin=originalOrigin;}});
  animations.push(trunk.animate(motion(['rotate(0deg)','rotate(-8deg)','rotate(-8deg)','rotate(0deg)']),{duration:reducedMotion?800:2600,easing:'ease-in-out'}));
  animations.push(jet.animate([{offset:0,opacity:0},{offset:.18,opacity:0},{offset:.28,opacity:1},{offset:.72,opacity:1},{offset:.92,opacity:0},{offset:1,opacity:0}],{duration:reducedMotion?800:2600,fill:'both'}));
 }
 sound('clean');break;
}
 case 'relax':part('root',motion(['scaleY(1)','scaleY(.72) translateY(8px)','scaleY(.72) translateY(8px)','scaleY(1)']),2800,'50% 100%');duration=3000;break;
 case 'pounce':part('root',motion(['translate(0,0) rotate(0)','translate(-5px,3px) rotate(-6deg)','translate(16px,-17px) rotate(8deg)','translate(20px,4px) rotate(12deg)','translate(0,0) rotate(0)']),2200,'50% 90%');break;
 case 'owl-turn':part('.wing-left',motion(['rotate(0deg)','rotate(-100deg)','rotate(-100deg)','rotate(0deg)']),2800,'100% 55%');part('.wing-right',motion(['rotate(0deg)','rotate(100deg)','rotate(100deg)','rotate(0deg)']),2800,'0% 55%');part('.pet-head',motion(['rotateY(0deg)','rotateY(-55deg) rotate(-8deg)','rotateY(55deg) rotate(8deg)','rotateY(0deg)']),2800,'50% 75%');duration=3000;break;
 case 'flap':part('.wing-left',motion(['rotate(0deg)','rotate(35deg)','rotate(0deg)']),450,'80% 15%',{iterations:5});part('.wing-right',motion(['rotate(0deg)','rotate(-35deg)','rotate(0deg)']),450,'20% 15%',{iterations:5});break;
 case 'dash':if(id==='dinos-3'){
 // The directional renderer enforces transform:none!important on .pet-facing.
 // Turn the SVG itself instead: its transforms are not subject to that rule.
 // The stage handles position separately, so returning never looks like reversing.
 const previousBox=svg.style.transformBox,previousOrigin=svg.style.transformOrigin;
 svg.style.transformBox='view-box';svg.style.transformOrigin='50% 58%';
 effects.push({remove(){svg.style.transformBox=previousBox;svg.style.transformOrigin=previousOrigin;}});
 const time=reducedMotion?800:3800;
 animations.push(svg.animate(stegoTurnFrames,{duration:time,easing:'linear',fill:'none'}));
 animations.push(target.animate(stegoReturnFrames,{duration:time,easing:'linear',fill:'none'}));
 duration=3820;sound('jump');
 }else{
 part('root',motion(['translateX(0)','translateX(25px)','translateX(-25px)','translateX(0)']),2100);
 part('.pet-leg',motion(['rotate(-18deg)','rotate(18deg)','rotate(-18deg)']),240,'50% 0%',{iterations:8});
 }break;
 case 'vanish':part('root',[{opacity:1,filter:'drop-shadow(0 0 0 #d5bdff)'},{opacity:0,filter:'drop-shadow(0 0 12px #d5bdff)'},{opacity:0},{opacity:1,filter:'drop-shadow(0 0 8px #d5bdff)'},{opacity:1,filter:'none'}],2800);duration=3000;break;
 case 'spin':part('root',motion(['rotate(0deg)','rotate(360deg)']),1600);break;
 case 'short-circuit':{
 const bolts=svg.querySelectorAll('.pet-bolt,.head-bolt');
 const fx=document.createElement('div');fx.className='trick-effect trick-frankie-sparks';
 Object.assign(fx.style,{position:'absolute',inset:'0',pointerEvents:'none',zIndex:'5'});
 fx.innerHTML='<svg viewBox="0 0 200 200" style="width:100%;height:100%;overflow:visible"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M48 70L30 55 43 53 25 31" stroke="#fff9d0" stroke-width="5"/><path d="M152 70l18-15-13-2 18-22" stroke="#fff9d0" stroke-width="5"/><path d="M57 42l-5-15 14 5 3-19M143 42l5-15-14 5-3-19" stroke="#ffe05e" stroke-width="4"/><path d="M35 90l-18-7 11-8M165 90l18-7-11-8" stroke="#a6f3ff" stroke-width="4"/></g><g fill="#fff9cc"><circle cx="28" cy="40" r="4"/><circle cx="171" cy="40" r="4"/><circle cx="52" cy="20" r="3"/><circle cx="147" cy="20" r="3"/></g></svg>';
 face.append(fx);effects.push(fx);
 animations.push(fx.animate([{opacity:0,transform:'scale(.75)'},{opacity:1,transform:'scale(1.08)'},{opacity:.35,transform:'scale(.93)'},{opacity:1,transform:'scale(1.06)'},{opacity:0,transform:'scale(1.2)'}],{duration:reducedMotion?800:2600,fill:'both'}));
 part('.pet-head',motion(['rotate(-3deg)','rotate(3deg)','rotate(-3deg)','rotate(0deg)']),330,'50% 75%',{iterations:7});
 part('root',[{filter:'drop-shadow(0 0 0px #ffed9c)'},{filter:'drop-shadow(0 0 11px #ffe17b)'},{filter:'none'}],2600);break;}
 case 'bandage-whirl':{
 // The mummy dissolves into a bandage-and-dust cyclone; the pet itself never spins.
 duration=4400;
 const fx=document.createElement('div');fx.className='trick-effect trick-mumi-tornado';
 Object.assign(fx.style,{position:'absolute',inset:'-22% -35%',pointerEvents:'none',zIndex:'5',overflow:'visible'});
 const ribbons=Array.from({length:12},(_,i)=>{
  const y=179-i*12,rx=12+i*6.4,ry=3+i*.55;
  const color=i%3===0?'#fff4d7':i%3===1?'#d7bc98':'#f0dfc3';
  return `<g class="mumi-band mumi-band-${i}"><ellipse cx="110" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#79614d" stroke-opacity=".3" stroke-width="12"/><path d="M${110-rx} ${y}a${rx} ${ry} 0 1 0 ${rx*2} 0" fill="none" stroke="${color}" stroke-width="${8+i*.18}" stroke-linecap="round"/><path d="M${110+rx} ${y}a${rx} ${ry} 0 1 0 -${rx*2} 0" fill="none" stroke="${color}" stroke-width="${7+i*.18}" stroke-linecap="round" stroke-opacity=".65"/></g>`;
 }).join('');
 const dust=Array.from({length:28},(_,i)=>{const x=35+(i*37)%155,y=80+(i*29)%110,r=1.5+i%4;return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i%2?'#cfb394':'#ebd8b6'}" opacity=".65"/>`;}).join('');
 fx.innerHTML=`<svg viewBox="0 0 220 220" style="width:100%;height:100%;overflow:visible"><defs><radialGradient id="mumi-dust-cloud"><stop stop-color="#c5a887" stop-opacity=".42"/><stop offset="1" stop-color="#c5a887" stop-opacity="0"/></radialGradient></defs><ellipse cx="110" cy="158" rx="91" ry="65" fill="url(#mumi-dust-cloud)"/><g class="mumi-dust">${dust}</g><g class="mumi-ribbons">${ribbons}</g></svg>`;
 face.append(fx);effects.push(fx);
 // Fade the actual anatomy away completely, then reveal it after the tornado dissipates.
 animations.push(svg.animate([{offset:0,opacity:1,filter:'blur(0px)'},{offset:.18,opacity:0,filter:'blur(5px)'},{offset:.78,opacity:0,filter:'blur(5px)'},{offset:1,opacity:1,filter:'blur(0px)'}],{duration:reducedMotion?1100:duration,fill:'both'}));
 animations.push(fx.animate([{offset:0,opacity:0,transform:'translate(0px,18px) scale(.25)'},{offset:.2,opacity:1,transform:'translate(-8px,0px) scale(.95)'},{offset:.4,opacity:1,transform:'translate(15px,-10px) scale(1.12)'},{offset:.6,opacity:1,transform:'translate(-17px,-4px) scale(1.04)'},{offset:.76,opacity:1,transform:'translate(10px,-10px) scale(1)'},{offset:1,opacity:0,transform:'translate(0px,24px) scale(.18)'}],{duration:reducedMotion?1100:duration,fill:'both'}));
 fx.querySelectorAll('.mumi-band').forEach((band,i)=>animations.push(band.animate([{transform:'translateX(0px) scaleX(1)'},{transform:`translateX(${i%2?12:-12}px) scaleX(.45)`},{transform:'translateX(0px) scaleX(1)'}],{duration:reducedMotion?900:430+i*30,iterations:reducedMotion?1:10,direction:'alternate',easing:'ease-in-out'})));
 animations.push(fx.querySelector('.mumi-dust').animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:reducedMotion?1100:1900,iterations:reducedMotion?1:3,easing:'linear'}));
 break;}
 case 'flame':effect('<svg viewBox="0 0 120 60"><path d="M4 30Q45 10 51 17L76 3 69 21 109 13 94 30 116 42 71 40 82 57 44 44Q26 38 4 30Z" fill="#ff9364"/><path d="M7 30Q42 22 69 26l-8 6 14 7Q40 39 7 30" fill="#ffe391"/></svg>','trick-flame');part('.pet-head',motion(['rotate(0)','rotate(-5deg)','rotate(0)']),2400);sound('jump');break;
 }
 function finish(){if(disposed)return;disposed=true;clearTimeout(timer);animations.forEach(a=>a.cancel());effects.forEach(e=>e.remove());if(needsCanonicalArt&&face.isConnected)face.innerHTML=originalMarkup;target.style.animationPlayState=previousWalkState;target.classList.remove('performing-trick');onEnd();}
 const timer=setTimeout(finish,reducedMotion?850:duration);return finish;
}
