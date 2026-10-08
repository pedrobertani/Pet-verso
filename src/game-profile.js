import {petDrawing} from './pets.js';
import {dogTurnPreview} from './dog-turn-preview.js';
// Arcade views use the approved anatomy. Never move muzzle, beak or markings separately.
let profileId=0;
const maskedFaces=new Set(['selva-4','exoticos-frog','selva-owl','exoticos-penguin']);
export function gameProfile(s,{flight=false}={}){
 const holder=document.createElement('div');
 holder.innerHTML=s.id==='pets-1'?dogTurnPreview(s,.4,'bored'):petDrawing({...s,walking:true,carePose:false},'bored');
 const svg=holder.querySelector('svg'),head=svg.querySelector('.pet-head');
 if(head){
  const eyes=head.querySelector('.eyes');
  if(eyes&&!maskedFaces.has(s.id)){
   const dots=[...eyes.querySelectorAll('ellipse,circle')],irises=dots.filter(e=>!['#fff','white','#ffffff'].includes(e.getAttribute('fill')));
   if(irises.length===2){
    const originals=irises.map(e=>({x:Number(e.getAttribute('cx')),y:Number(e.getAttribute('cy'))}));
    const left=Math.min(...originals.map(p=>p.x)),right=Math.max(...originals.map(p=>p.x)),span=right-left,mid=(left+right)/2;
    // Already narrow eyes (fox, mouse, capybara) retain their approved placement.
    const gap=Math.min(span,Math.max(10,Math.max(...irises.map(e=>Number(e.getAttribute('rx')||e.getAttribute('r'))))*2.4));
    const center=mid+Math.min(7,(span-gap)*.25),baseline=originals.reduce((sum,p)=>sum+p.y,0)/2;
    for(const dot of dots){const x=Number(dot.getAttribute('cx')),y=Number(dot.getAttribute('cy'));const iris=originals.reduce((best,p)=>Math.abs(p.x-x)<Math.abs(best.x-x)?p:best,originals[0]);dot.setAttribute('cx',String(center+(iris.x<mid?-gap/2:gap/2)+x-iris.x));dot.setAttribute('cy',String(baseline+y-iris.y));}
   }
  }
  if(eyes&&maskedFaces.has(s.id)&&!(s.id==='exoticos-frog'&&(s.growthLevel??2)===0)){
   const face=document.createElementNS('http://www.w3.org/2000/svg','g');face.setAttribute('class','game-face');
   const children=[...head.children];let afterEyes=false;
   for(const child of children){if(child===eyes)afterEyes=true;const cx=Number(child.getAttribute('cx')),cy=Number(child.getAttribute('cy'));const disc=['ellipse','circle'].includes(child.tagName)&&cy>=70&&((cx!==100&&cy<115)||cy>110);if(child===eyes||disc||afterEyes&&!child.classList.contains('pet-ear'))face.append(child);}
   face.setAttribute('transform','translate(15 0) translate(100 0) scale(.78 1) translate(-100 0)');head.append(face);
  }
  // Face details remain attached to the head, including eye masks and baby pacifiers.
  if(s.id!=='pets-1'&&!(s.id==='exoticos-frog'&&(s.growthLevel??2)===0)&&!['selva-fox','pets-mouse','selva-capybara'].includes(s.id)){
   const pivot=maskedFaces.has(s.id)?100:132;
   head.setAttribute('transform',`translate(${maskedFaces.has(s.id)?8:0} 0) translate(${pivot} 0) scale(.88 1) translate(${-pivot} 0)`);
  }
 }
 if(s.id==='selva-fox'){const clip=document.createElementNS('http://www.w3.org/2000/svg','clipPath');const id='fox-exposed-limbs-'+(++profileId);clip.id=id;clip.innerHTML='<rect x="0" y="153" width="220" height="70"/>';svg.querySelector('defs').append(clip);svg.querySelectorAll('.limb-side-outline').forEach(p=>p.setAttribute('clip-path',`url(#${id})`));}
 svg.querySelectorAll('*').forEach(el=>el.style.animation='none');
 if(['selva-brown','selva-polar'].includes(s.id))svg.querySelector('.eyes')?.setAttribute('transform','translate(-2 0)');
 attachNeck(svg,s);if(flight&&!airborneSpecies.has(s.id))addJetBoard(svg);
 svg.setAttribute('data-game-profile','right');return svg.outerHTML;
}

export const airborneSpecies=new Set(['sombrios-0','sombrios-1','sombrios-dragon','dinos-pterosaur','selva-owl']);
const neckAnchors={
 'pets-0':[[128,126],[130,114],10], 'pets-1':[[137,120],[139,119],11],
 'pets-2':[[114,145],[131,130],8], 'pets-mouse':[[138,160],[145,157],6],
 'exoticos-0':[[116,159],[128,132],7], 'exoticos-1':[[117,152],[128,136],7],
 'exoticos-7':[[123,160],[140,145],8], 'selva-0':[[130,124],[132,118],12],
 'selva-2':[[131,127],[133,115],13], 'selva-capybara':[[128,131],[127,123],12],
 'selva-fox':[[132,133],[137,115],9], 'dinos-0':[[110,106],[117,91],13],
 'dinos-1':[[136,133],[132,129],13], 'dinos-2':[[133,125],[133,134],13],
 'dinos-3':[[139,127],[148,128],16],
};
function measured(svg,fn){const holder=document.createElement('div');holder.style.cssText='position:absolute;visibility:hidden;pointer-events:none';document.body.append(holder);holder.append(svg);try{return fn();}finally{holder.remove();}}
function mapped(svg,node,[x,y]){const point=svg.createSVGPoint();point.x=x;point.y=y;return point.matrixTransform(node.getCTM()).matrixTransform(svg.getCTM().inverse());}
function attachNeck(svg,s){const anchors=neckAnchors[s.id],head=svg.querySelector('.pet-head'),body=svg.querySelector('.pet-body');if(!anchors||!head||!body)return;
 measured(svg,()=>{const inner=head.firstElementChild?.tagName==='g'&&!head.firstElementChild.getAttribute('class')?head.firstElementChild:head;const from=mapped(svg,body,anchors[0]),to=mapped(svg,inner,anchors[1]);if(['dinos-3','exoticos-7','dinos-0'].includes(s.id)){const matrix=head.parentNode.getCTM().inverse(),a=svg.createSVGPoint(),b=svg.createSVGPoint();a.x=from.x;a.y=from.y;b.x=to.x;b.y=to.y;const root=svg.getCTM();const pa=a.matrixTransform(root).matrixTransform(matrix),pb=b.matrixTransform(root).matrixTransform(matrix);head.setAttribute('transform',`translate(${pa.x-pb.x} ${pa.y-pb.y}) ${head.getAttribute('transform')||''}`);return;}
 const scale=Math.hypot(body.getCTM().a,body.getCTM().b)/Math.hypot(svg.getCTM().a,svg.getCTM().b),w=anchors[2]*scale;
 const neck=document.createElementNS('http://www.w3.org/2000/svg','path');neck.setAttribute('class','game-neck');neck.setAttribute('fill',[...body.children].find(el=>el.hasAttribute('fill')&&el.getAttribute('fill')!=='none')?.getAttribute('fill')||'#cfa16e');neck.setAttribute('d',`M${from.x-w} ${from.y} Q${(from.x+to.x)/2-w} ${(from.y+to.y)/2} ${to.x-w*.7} ${to.y} Q${to.x} ${to.y-w} ${to.x+w*.7} ${to.y} Q${(from.x+to.x)/2+w} ${(from.y+to.y)/2} ${from.x+w} ${from.y}Z`);svg.querySelector('defs')?.after(neck);});
}
function addJetBoard(svg){measured(svg,()=>{const b=svg.getBBox(),width=Math.max(55,Math.min(160,b.width*.88)),x=b.x+b.width/2-width/2,y=b.y+b.height+3;const board=document.createElementNS('http://www.w3.org/2000/svg','g');board.setAttribute('class','pet-jet-board');board.innerHTML=`<path d="M${x+4} ${y}H${x+width-6}q10 0 6 7-4 8-15 8H${x+15}q-12-1-15-9-2-6 4-6Z" fill="#64cbd8" stroke="#478fa8" stroke-width="2"/><path d="M${x+12} ${y+4}H${x+width-14}" stroke="#d4f7ee" stroke-width="3" stroke-linecap="round"/><rect x="${x-2}" y="${y+1}" width="24" height="15" rx="6" fill="#9585c8" stroke="#6b5b9b" stroke-width="2"/><ellipse cx="${x}" cy="${y+8}" rx="4" ry="6" fill="#465675"/><path d="M${x-3} ${y+4}Q${x-16} ${y+1} ${x-28} ${y+8}q14 10 25 5Z" fill="#f4b45c"/><path d="M${x-4} ${y+6}l-15 2 15 3Z" fill="#fff0a8"/>`;svg.append(board);const vb=svg.viewBox.baseVal;const left=Math.min(vb.x,x-30),right=Math.max(vb.x+vb.width,x+width+4),bottom=Math.max(vb.y+vb.height,y+20);svg.setAttribute('viewBox',`${left} ${vb.y} ${right-left} ${bottom-vb.y}`);});}
