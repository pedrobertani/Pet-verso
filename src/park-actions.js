import {recolorItem} from './item-colors.js';
export const PARK_INTELLIGENCE=75,PARK_COOLDOWN=30000;
export const parkActions={
 'pets-1':'fetch','pets-0':'climb','pets-2':'tunnel-hop','pets-mouse':'wheel',
 'exoticos-0':'swim','exoticos-1':'branch','exoticos-7':'bridge',
 'selva-0':'bat-ball','selva-2':'waterwheel','selva-4':'bamboo','selva-brown':'log','selva-polar':'ice-pool','selva-capybara':'shower-pool','selva-fox':'den','exoticos-penguin':'slide',
 'dinos-0':'bite-ball','dinos-1':'push-ball','dinos-2':'leaves','dinos-3':'logs',
 'sombrios-frankie':'lightning-generator','sombrios-6':'sarcophagus','sombrios-0':'hoop','sombrios-1':'hoop','sombrios-dragon':'dragon-hoop','selva-owl':'hoop','dinos-pterosaur':'hoop','exoticos-frog':'lily-pool'
};
export const supportedParkActions=Object.keys(parkActions);
export function parkActionState(p,now=Date.now()){return {locked:p.stats.intelligence<PARK_INTELLIGENCE,blocked:!!(p.sleeping||p.dead),remaining:Math.max(0,Math.ceil(((p.skills?.parkUntil||0)-now)/1000))};}
export function startParkAction(p,now=Date.now()){const s=parkActionState(p,now);if(s.locked||s.blocked||s.remaining||!supportedParkActions.includes(p.species))return false;p.skills={...p.skills,parkUntil:now+PARK_COOLDOWN};return true;}
export function animateParkAction(world,target,id,{level=2,reducedMotion=false,onEnd=()=>{}}={}){
 if(!supportedParkActions.includes(id))return ()=>{};
 const toy=world.querySelector('.park-object'),face=target.querySelector('.pet-facing'),w=world.getBoundingClientRect(),p=target.getBoundingClientRect(),b=toy.getBoundingClientRect();
 const animations=[],effects=[],partStyles=new Map();let ended=false;
 const kind=parkActions[id],flying=['hoop','dragon-hoop'].includes(kind);
 const origin={x:p.left-w.left+p.width*.5,y:p.top-w.top+p.height*(id==='exoticos-frog'?.835:flying?.5:.94)};
 const point=(x,y)=>({x:b.left-w.left+b.width*x/220-origin.x,y:b.top-w.top+b.height*y/180-origin.y});
 const move=(offset,at,opacity=1,scale=1)=>({offset,translate:`${at.x}px ${at.y}px`,opacity,scale:String(scale)}),zero={x:0,y:0},frames=[];
 const animate=(el,keyframes,options)=>{animations.push(el.animate(keyframes,{duration:reducedMotion?1200:6200,fill:'none',easing:'linear',...options}));};
 const addEffect=(cls,markup,x,y)=>{const el=document.createElement('span');el.className='park-action-effect '+cls;el.innerHTML=markup;el.style.left=(x-w.left-world.clientLeft)+'px';el.style.top=(y-w.top-world.clientTop)+'px';world.append(el);effects.push(el);return el;};
 target.classList.add('park-performing');
 if(id==='exoticos-frog'){
 const first=point(76,130),second=point(146,146),water=point(110,138),baby=level===0;
 if(baby){frames.push(move(0,zero),move(.2,{x:first.x,y:first.y-8}),move(.38,{x:second.x,y:second.y-8}),move(.52,{x:water.x,y:water.y+5},.35,.86),move(.68,{x:first.x,y:first.y-4}),move(1,zero));}
 else{frames.push(move(0,zero),move(.13,{x:first.x*.5,y:first.y*.5-34}),move(.24,first),move(.34,{x:(first.x+second.x)/2,y:(first.y+second.y)/2-26}),move(.44,second),move(.49,second),move(.57,water,0,.55),move(.65,water,0,.55),move(.73,first,1,1),move(.8,first),move(.9,{x:first.x*.5,y:first.y*.5-30}),move(1,zero));}
 animate(target,frames);animate(face,[{offset:0,transform:'scaleX(1)'},{offset:.44,transform:'scaleX(1)'},{offset:.49,transform:'scaleX(-1)'},{offset:.8,transform:'scaleX(-1)'},{offset:1,transform:'scaleX(1)'}]);
 const splash=addEffect('park-splash','<svg viewBox="0 0 100 60"><path d="M10 44q40-17 80 0M30 40 22 22m29 14 2-24m18 25 10-17" fill="none" stroke="#b8f2f7" stroke-width="5" stroke-linecap="round"/></svg>',b.left+b.width*.5,b.top+b.height*138/180);
 animate(splash,[{offset:0,opacity:0},{offset:.5,opacity:0},{offset:.57,opacity:1},{offset:.69,opacity:0},{offset:1,opacity:0}]);
 for(let i=0;i<4;i++){const bubble=addEffect('park-action-bubble','',b.left+b.width*(.35+i*.08),b.top+b.height*.77);animate(bubble,[{offset:0,opacity:0,translate:'0 0'},{offset:.35+i*.025,opacity:0,translate:'0 0'},{offset:.55+i*.025,opacity:1,translate:'0 -20px'},{offset:.78,opacity:0,translate:'0 -40px'},{offset:1,opacity:0}]);}
 }else if(kind==='hoop'){
 const hoop=point(115,66),right={x:hoop.x+b.width*.27,y:hoop.y};
 frames.push(move(0,zero),move(.24,{x:hoop.x-24,y:hoop.y-10},1,.85),move(.38,hoop,1,.72),move(.5,right,1,.85),move(.58,right,1,.85),move(.73,hoop,1,.72),move(.86,{x:hoop.x-24,y:hoop.y-10},1,.85),move(1,zero));animate(target,frames);animate(face,[{offset:0,transform:'scaleX(1)'},{offset:.5,transform:'scaleX(1)'},{offset:.58,transform:'scaleX(-1)'},{offset:.87,transform:'scaleX(-1)'},{offset:1,transform:'scaleX(1)'}]);
 // The near half of the ring masks the flyer as it crosses the opening.
 const ring=document.createElement('div');ring.className='park-hoop-foreground';ring.style.left=(b.left-w.left-world.clientLeft)+'px';ring.style.top=(b.top-w.top-world.clientTop)+'px';ring.style.width=b.width+'px';ring.innerHTML='<svg viewBox="0 0 220 180"><path d="M115 18a38 48 0 0 1 0 96" fill="none" stroke="#ac91d4" stroke-width="13"/></svg>';ring.innerHTML=recolorItem(ring.innerHTML,toy.dataset.itemColor,'flight-hoop');world.append(ring);effects.push(ring);
 animate(ring,[{offset:0,opacity:0},{offset:.23,opacity:0},{offset:.29,opacity:1},{offset:.43,opacity:1},{offset:.5,opacity:0},{offset:.65,opacity:0},{offset:.69,opacity:1},{offset:.8,opacity:1},{offset:.87,opacity:0},{offset:1,opacity:0}]);
 }
 else if(kind==='dragon-hoop'){
 const first=point(65,72),second=point(168,72),fit=Math.min(.82,b.width*(76/220)/(p.width*.88));
 frames.push(move(0,zero),move(.17,first,1,fit),move(.38,second,1,fit),move(.5,{x:second.x+14,y:second.y-8},1,fit),move(.56,second,1,fit),move(.76,first,1,fit),move(1,zero));animate(target,frames);
 animate(face,[{offset:0,transform:'scaleX(1)'},{offset:.5,transform:'scaleX(1)'},{offset:.56,transform:'scaleX(-1)'},{offset:.83,transform:'scaleX(-1)'},{offset:1,transform:'scaleX(1)'}]);
 for(const [x,color] of [[65,'#efbc7e'],[168,'#e9a995']]){const ring=document.createElement('div');ring.className='park-hoop-foreground';ring.style.left=(b.left-w.left-world.clientLeft)+'px';ring.style.top=(b.top-w.top-world.clientTop)+'px';ring.style.width=b.width+'px';ring.innerHTML=`<svg viewBox="0 0 220 180"><path d="M${x} 16a42 56 0 0 1 0 112" fill="none" stroke="${color}" stroke-width="10"/></svg>`;ring.innerHTML=recolorItem(ring.innerHTML,toy.dataset.itemColor,'flight-hoop');world.append(ring);effects.push(ring);animate(ring,[{offset:0,opacity:0},{offset:.12,opacity:1},{offset:.9,opacity:1},{offset:1,opacity:0}]);}
 }
 else{
 const travel=(goal,hold=.68)=>animate(target,[move(0,zero),move(.25,goal),move(hold,goal),move(1,zero)]);
 const returnTurn=(at=.68)=>animate(face,[{offset:0,transform:'scaleX(1)'},{offset:at-.05,transform:'scaleX(1)'},{offset:at,transform:'scaleX(-1)'},{offset:.94,transform:'scaleX(-1)'},{offset:1,transform:'scaleX(1)'}]);
 const part=(selector,keyframes,options={})=>{for(const el of target.querySelectorAll(selector)){if(!partStyles.has(el))partStyles.set(el,[el.style.transformBox,el.style.transformOrigin]);el.style.transformBox='fill-box';el.style.transformOrigin='50% 10%';animate(el,keyframes,options);}};
 const toyPart=(selector,keyframes,options={})=>{for(const el of toy.querySelectorAll(selector)){if(!partStyles.has(el))partStyles.set(el,[el.style.transformBox,el.style.transformOrigin]);el.style.transformBox='fill-box';el.style.transformOrigin='50% 50%';animate(el,keyframes,options);}};
 const spin=(selector,delay=1550)=>toyPart(selector,[{transform:'rotate(0deg)'},{transform:'rotate(540deg)'}],{duration:reducedMotion?500:2700,delay:reducedMotion?300:delay});
 const bubbles=(x=175,y=70)=>{for(let i=0;i<4;i++){const el=addEffect('park-action-bubble','',b.left+b.width*(x+i*6)/220,b.top+b.height*(y+i*9)/180);animate(el,[{offset:0,opacity:0},{offset:.25,opacity:0,translate:'0 0'},{offset:.55,opacity:1,translate:'0 -18px'},{offset:.8,opacity:0,translate:'0 -35px'},{offset:1,opacity:0}]);}};
 const ballEffect=()=>{const el=addEffect('park-action-ball','<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="#f397b7" stroke="#ce6c91" stroke-width="3"/><path d="M7 34q23-24 46 0" fill="none" stroke="#fff1c4" stroke-width="5"/><ellipse cx="21" cy="18" rx="6" ry="4" fill="#ffdce6"/></svg>',b.left+b.width*40/220,b.top+b.height*85/180);el.style.width=(b.width*20/220)+'px';el.style.height=el.style.width;const original=toy.querySelector('.toy-ball');if(original){original.style.visibility='hidden';effects.push({remove:()=>{original.style.visibility='';}});}return el;};
 part('.leg-0',[{rotate:'-7deg'},{rotate:'7deg'},{rotate:'-7deg'}],{duration:reducedMotion?200:560,iterations:reducedMotion?3:11});
 part('.leg-1',[{rotate:'7deg'},{rotate:'-7deg'},{rotate:'7deg'}],{duration:reducedMotion?200:560,iterations:reducedMotion?3:11});
 switch(kind){
 case 'lightning-generator':{
 const at=point(85,148);travel(at,.74);returnTurn(.76);
 toyPart('.toy-lightning',[{opacity:.1,filter:'drop-shadow(0 0 0px #ffe786)'},{opacity:1,filter:'drop-shadow(0 0 10px #ffe786)'},{opacity:.1}],{delay:reducedMotion?150:1500,duration:reducedMotion?600:800,iterations:reducedMotion?2:4});
 part('.pet-head',[{rotate:'-5deg'},{rotate:'5deg'},{rotate:'-5deg'}],{delay:reducedMotion?150:1500,duration:reducedMotion?400:320,iterations:reducedMotion?2:8});break;}
 case 'sarcophagus':{
 const at=point(110,141);animate(target,[move(0,zero),move(.23,at),move(.38,at,.1,.7),move(.63,at,0,.7),move(.77,at,1,.8),move(1,zero)]);returnTurn(.8);
 toyPart('.toy-sarcophagus-lid',[{offset:0,opacity:.4},{offset:.32,opacity:.9},{offset:.65,opacity:1},{offset:.8,opacity:.4},{offset:1,opacity:.4}]);break;}
 case 'fetch':{
 const mouth=target.querySelector('.mouth')?.getBoundingClientRect(),offset={x:mouth?mouth.left+mouth.width/2-w.left-origin.x:p.width*.2,y:mouth?mouth.top+mouth.height/2-w.top-origin.y:-p.height*.35};
 const landing=point(-30,147),catchAt={x:landing.x-offset.x,y:point(-30,163).y};
 animate(target,[move(0,zero),move(.2,zero),move(.45,catchAt),move(.6,catchAt),move(1,zero)]);returnTurn(.67);
 const ball=ballEffect(),base={x:b.left+b.width*40/220,y:b.top+b.height*85/180};
 const ground={x:w.left+origin.x+landing.x-base.x,y:w.top+origin.y+landing.y-base.y},held={x:w.left+origin.x+catchAt.x+offset.x-base.x,y:w.top+origin.y+catchAt.y+offset.y-base.y},home={x:w.left+origin.x-offset.x-base.x,y:w.top+origin.y+offset.y-base.y};
 animate(ball,[{offset:0,translate:'0 0'},{offset:.06,translate:'0 0'},{offset:.14,translate:`${ground.x*.55}px ${Math.min(-24,ground.y-35)}px`},{offset:.24,translate:`${ground.x}px ${ground.y}px`},{offset:.38,translate:`${ground.x}px ${ground.y}px`},{offset:.46,translate:`${held.x}px ${held.y}px`},{offset:.6,translate:`${held.x}px ${held.y}px`},{offset:.67,translate:`${held.x-offset.x*2}px ${held.y}px`},{offset:1,translate:`${home.x}px ${home.y}px`}]);break;}
 case 'climb':animate(target,[move(0,zero),move(.18,point(63,152)),move(.36,point(63,36)),move(.5,point(63,36)),move(.6,point(115,40)),move(.7,point(163,84)),move(.8,point(163,84)),move(.9,point(100,130)),move(1,zero)]);returnTurn(.81);break;
 case 'tunnel-hop':case 'swim':{
 const swim=kind==='swim',entry=point(30,151),exit=point(151,151);animate(target,[move(0,zero),move(.19,entry),move(.29,point(60,145),.2,.8),move(.37,point(97,146),0,.8),move(.45,point(133,146),0,.8),move(.54,exit),move(.65,point(swim?169:180,swim?127:110)),move(.75,point(swim?163:191,swim?145:163)),move(.8,exit),move(1,zero)]);returnTurn(.79);if(swim)bubbles();break;}
 case 'wheel':travel(point(111,137));spin('.toy-wheel-rotor');part('.pet-leg',[{rotate:'-14deg'},{rotate:'14deg'},{rotate:'-14deg'}],{delay:reducedMotion?300:1500,duration:reducedMotion?150:260,iterations:reducedMotion?2:10});returnTurn();break;
 case 'branch':animate(target,[move(0,zero),move(.2,point(61,153)),move(.38,point(99,126)),move(.54,point(135,105)),move(.65,point(135,105)),move(.82,point(91,131)),move(1,zero)]);returnTurn(.7);break;
 case 'bridge':animate(target,[move(0,zero),move(.2,point(30,158)),move(.37,point(76,120)),move(.52,point(121,118)),move(.68,point(184,151)),move(.73,point(184,151)),move(.85,point(107,113)),move(1,zero)]);returnTurn(.73);break;
 case 'bat-ball':travel(point(119,158));toyPart('.toy-ball',[{offset:0,translate:'0 0'},{offset:.25,translate:'0 0'},{offset:.38,translate:'24px -6px'},{offset:.48,translate:'-17px -3px'},{offset:.58,translate:'10px -1px'},{offset:.7,translate:'0 0'},{offset:1,translate:'0 0'}]);part('.leg-1',[{offset:0,rotate:'0deg'},{offset:.25,rotate:'0deg'},{offset:.38,rotate:'-25deg'},{offset:.5,rotate:'0deg'},{offset:1,rotate:'0deg'}]);returnTurn();break;
 case 'waterwheel':travel(point(77,139));spin('.toy-wheel');part('.pet-trunk',[{offset:0,rotate:'0deg'},{offset:.25,rotate:'0deg'},{offset:.38,rotate:'-55deg'},{offset:.65,rotate:'-55deg'},{offset:1,rotate:'0deg'}]);bubbles(104,76);returnTurn();break;
 case 'bamboo':animate(target,[move(0,zero),move(.17,point(108,155)),move(.35,point(108,98)),move(.53,point(108,46)),move(.67,point(108,46)),move(.83,point(108,98)),move(1,zero)]);break;
 case 'log':animate(target,[move(0,zero),move(.18,point(36,105)),move(.35,point(87,98)),move(.51,point(149,98)),move(.62,point(177,103)),move(.69,point(177,103)),move(.83,point(100,98)),move(1,zero)]);part('.pet-body',[{rotate:'-3deg'},{rotate:'3deg'},{rotate:'-3deg'}],{duration:900,iterations:5});returnTurn(.69);break;
 case 'ice-pool':animate(target,[move(0,zero),move(.22,point(91,137)),move(.4,point(117,128)),move(.48,point(178,163),0),move(.64,point(178,163),0),move(.76,point(104,125)),move(.83,point(91,137)),move(1,zero)]);bubbles(178,131);returnTurn(.76);break;
 case 'shower-pool':travel(point(78,145));part('.pet-body',[{offset:0,scale:'1 1'},{offset:.3,scale:'1 1'},{offset:.45,scale:'1 .85'},{offset:.65,scale:'1 .85'},{offset:1,scale:'1 1'}]);bubbles(90,105);returnTurn();break;
 case 'den':animate(target,[move(0,zero),move(.2,point(60,160)),move(.3,point(82,157),0,.8),move(.46,point(159,156),0,.8),move(.55,point(177,160)),move(.64,point(177,160)),move(.72,point(159,156),0,.8),move(.86,point(72,159),0,.8),move(1,zero)]);returnTurn(.65);break;
 case 'slide':animate(target,[move(0,zero),move(.16,point(37,159)),move(.29,point(37,101)),move(.4,point(50,43)),move(.49,point(73,66)),move(.58,point(107,114)),move(.66,point(152,141),.3,.8),move(.76,point(151,140)),move(.84,point(118,151)),move(1,zero)]);bubbles(170,132);returnTurn(.8);break;
 case 'bite-ball':travel(point(87,168));toyPart('.toy-ball',[{offset:0,rotate:'0deg'},{offset:.25,rotate:'0deg'},{offset:.42,rotate:'-12deg'},{offset:.53,rotate:'12deg'},{offset:.68,rotate:'0deg'},{offset:1,rotate:'0deg'}]);part('.pet-head',[{offset:0,rotate:'0deg'},{offset:.25,rotate:'0deg'},{offset:.4,rotate:'-10deg'},{offset:.55,rotate:'7deg'},{offset:1,rotate:'0deg'}]);returnTurn();break;
 case 'push-ball':animate(target,[move(0,zero),move(.25,point(40,161)),move(.54,point(128,171)),move(.75,point(128,171)),move(1,zero)]);toyPart('.toy-ball',[{offset:0,translate:'0 0',rotate:'0deg'},{offset:.25,translate:'0 0',rotate:'0deg'},{offset:.54,translate:'88px 10px',rotate:'220deg'},{offset:.75,translate:'88px 10px',rotate:'220deg'},{offset:1,translate:'0 0',rotate:'0deg'}]);returnTurn();break;
 case 'leaves':travel(point(67,166));part('.pet-head',[{offset:0,rotate:'0deg'},{offset:.25,rotate:'0deg'},{offset:.42,rotate:'-9deg'},{offset:.52,rotate:'5deg'},{offset:.62,rotate:'-5deg'},{offset:1,rotate:'0deg'}]);toyPart('.toy-leaves',[{offset:0,rotate:'0deg'},{offset:.3,rotate:'0deg'},{offset:.45,rotate:'-5deg'},{offset:.6,rotate:'5deg'},{offset:1,rotate:'0deg'}]);returnTurn();break;
 case 'logs':animate(target,[move(0,zero),move(.16,point(50,145)),move(.26,point(80,99)),move(.36,point(112,133)),move(.47,point(143,81)),move(.58,point(173,121)),move(.68,point(173,121)),move(.78,point(112,103)),move(.88,point(50,130)),move(1,zero)]);returnTurn(.7);break;
 }
 }

 function stop(){if(ended)return;ended=true;clearTimeout(timer);animations.forEach(a=>a.cancel());effects.forEach(e=>e.remove());partStyles.forEach(([box,origin],el)=>{el.style.transformBox=box;el.style.transformOrigin=origin;});target.classList.remove('park-performing');onEnd();}
 const timer=setTimeout(stop,reducedMotion?1800:6300);return stop;
}
