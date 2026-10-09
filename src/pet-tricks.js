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
 // The directional renderer used transform:none!important, which prevents
 // Web Animations from flipping this wrapper until the inline priority is released.
 const priorTransform=face.style.getPropertyValue('transform');
 const priorPriority=face.style.getPropertyPriority('transform');
 face.style.removeProperty('transform');
 effects.push({remove(){if(priorTransform)face.style.setProperty('transform',priorTransform,priorPriority);else face.style.removeProperty('transform');}});
 const time=reducedMotion?800:3800;
 animations.push(face.animate(stegoTurnFrames,{duration:time,easing:'steps(1,end)',fill:'none'}));
 animations.push(target.animate(stegoReturnFrames,{duration:time,easing:'linear',fill:'none'}));
 duration=3820;sound('jump');
 }else{
 part('root',motion(['translateX(0)','translateX(25px)','translateX(-25px)','translateX(0)']),2100);
 part('.pet-leg',motion(['rotate(-18deg)','rotate(18deg)','rotate(-18deg)']),240,'50% 0%',{iterations:8});
 }break;
 case 'vanish':part('root',[{opacity:1,filter:'drop-shadow(0 0 0 #d5bdff)'},{opacity:0,filter:'drop-shadow(0 0 12px #d5bdff)'},{opacity:0},{opacity:1,filter:'drop-shadow(0 0 8px #d5bdff)'},{opacity:1,filter:'none'}],2800);duration=3000;break;
 case 'spin':part('root',motion(['rotate(0deg)','rotate(360deg)']),1600);break;
 case 'flame':effect('<svg viewBox="0 0 120 60"><path d="M4 30Q45 10 51 17L76 3 69 21 109 13 94 30 116 42 71 40 82 57 44 44Q26 38 4 30Z" fill="#ff9364"/><path d="M7 30Q42 22 69 26l-8 6 14 7Q40 39 7 30" fill="#ffe391"/></svg>','trick-flame');part('.pet-head',motion(['rotate(0)','rotate(-5deg)','rotate(0)']),2400);sound('jump');break;
 }
 function finish(){if(disposed)return;disposed=true;clearTimeout(timer);animations.forEach(a=>a.cancel());effects.forEach(e=>e.remove());if(needsCanonicalArt&&face.isConnected)face.innerHTML=originalMarkup;target.classList.remove('performing-trick');onEnd();}
 const timer=setTimeout(finish,reducedMotion?850:duration);return finish;
}
