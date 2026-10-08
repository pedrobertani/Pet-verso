// Native vector environments. The lower third remains free for pet/toy placement.
export const environments = [
 {id:'wetland',name:'Lago dos sapinhos',pets:['exoticos-frog'],description:'Sapo'},
 {id:'rainforest',name:'Floresta das corujinhas',pets:['selva-owl'],description:'Corujinha'},
 {id:'home',name:'Quintal de casa',pets:['pets-0','pets-1','pets-2','pets-mouse'],description:'Gato, cachorro, coelho e ratinho'},
 {id:'savanna',name:'Savana e lago',pets:['selva-0','selva-2'],description:'Leão e elefante'},
 {id:'bamboo',name:'Bosque de bambus',pets:['selva-4'],description:'Panda'},
 {id:'forest',name:'Bosque e lago',pets:['selva-brown','selva-capybara','selva-fox'],description:'Urso marrom, capivara e raposa'},
 {id:'tropical',name:'Jardim tropical',pets:['exoticos-1','exoticos-7'],description:'Camaleão e tartaruga'},
 {id:'ice',name:'Refúgio de gelo',pets:['selva-polar','exoticos-penguin'],description:'Urso polar e pinguim'},
 {id:'prehistoric',name:'Vale dos dinossauros',pets:['dinos-0','dinos-1','dinos-2','dinos-3','dinos-pterosaur'],description:'Todos os dinossauros'},
 {id:'haunted',name:'Castelinho encantado',pets:['sombrios-0','sombrios-1'],description:'Fantasminha e morcego'},
 {id:'volcanic',name:'Vale do dragão',pets:['sombrios-dragon'],description:'Dragãozinho'},
 {id:'aquarium',name:'Aquário do axolote',pets:['exoticos-0'],description:'Axolote'}
];
export function environmentFor(species){return environments.find(e=>e.pets.includes(species))||environments.find(e=>e.id==='home');}
const ellipse=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const tree=(x,y,size=1,kind='round')=>`<g transform="translate(${x} ${y}) scale(${size})"><path d="M-8 0V-65H8V0Z" fill="#9d704b"/>${kind==='pine'?'<path d="M0-145L-48-65H-30L-59-25H59L30-65H48Z" fill="#528b7b"/>':ellipse(-27,-92,39,36,'#6eae72')+ellipse(27,-92,39,36,'#7cbd78')+ellipse(0,-126,40,36,'#89c77f')}</g>`;
const pond=(x,y,c='#7bd1da')=>ellipse(x,y,66,21,'#b6dacf')+ellipse(x,y-3,58,16,c)+`<path d="M${x-30} ${y-7}h24m10 6h20" stroke="#e0fcff" stroke-width="3" stroke-linecap="round"/>`;
const bamboo=(x,y)=>`<g stroke-linecap="round"><path d="M${x} ${y}v-120m16 120v-140m-31 140v-95" stroke="#528b58" stroke-width="8"/><path d="M${x-4} ${y-30}h8m-8-30h8m8 10h8m-8-30h8" stroke="#b3db88" stroke-width="3"/><path d="M${x} ${y-90}q-40-35-30-5q7 12 30 5m16-30q35-28 25-2q-8 10-25 2" fill="#79b96c" stroke="none"/></g>`;
const cloud=(x,y)=>`<g fill="#fff" opacity=".75">${ellipse(x,y,32,10,'#fff')}${ellipse(x-10,y-8,15,14,'#fff')}${ellipse(x+10,y-12,18,17,'#fff')}</g>`;
export function environmentArt(id,{night=false,playground=false,tall=false}={}){
 const e=environments.find(e=>e.id===id)||environments.find(e=>e.id==='home');id=e.id;
 const palettes={wetland:['#b5e9e6','#83bba1','#b9d9aa'],rainforest:['#b4e9df','#6ca78b','#a1ca92'],home:['#a9e6f2','#a5d67b','#c0dd8d'],savanna:['#ffe0a3','#d9c97a','#efd393'],bamboo:['#bae6d8','#91c286','#b9dba0'],forest:['#b9dfec','#84b496','#a9cf9a'],tropical:['#a9e6d8','#78b99b','#a6d4a3'],ice:['#bfe9f5','#c1dbe8','#f0f8fc'],prehistoric:['#b7e1e9','#80b899','#b6d491'],haunted:['#746aab','#696690','#8a7da9'],volcanic:['#f5b4a6','#9b83ad','#c6a3bd'],aquarium:['#a4e6ee','#7bc6d7','#f0d9b1']};
 const [sky,hills,floor]=palettes[id];const renderedSky=night&&id!=='aquarium'?'#263758':sky;let back='',front='';
 if(id==='home'){
 back=`<g stroke="#dba470" stroke-width="3"><path d="M28 242V144L94 101l66 43v98Z" fill="#fff0d8"/><path d="M18 146l76-53 76 53" fill="none" stroke="#cc8c73" stroke-width="10" stroke-linejoin="round"/><rect x="75" y="189" width="38" height="53" rx="16" fill="#adcbdd"/><rect x="44" y="153" width="28" height="28" rx="5" fill="#a1deed"/></g>${tree(520,243,.85)}<path d="M0 247H600" stroke="#eac390" stroke-width="7"/>`;
 }
 if(id==='savanna')back=`${tree(90,242,.7)}<g><path d="M480 246l-5-75 13-40 8 6-10 35 7 74" fill="#94704d"/>${ellipse(478,130,75,17,'#93ae67')}${ellipse(448,120,47,17,'#a9c776')}</g>${pond(480,268)}`;
 if(id==='bamboo')back=`${bamboo(55,246)}${bamboo(108,245)}${bamboo(488,244)}${bamboo(541,247)}${pond(495,270)}`;
 if(id==='forest')back=`${tree(65,247,.94)}${tree(134,246,.72)}${tree(522,247,1)}${pond(480,272)}`;
 if(id==='tropical')back=`${tree(66,247,.9)}${tree(530,247,.85)}<path d="M30 250q-20-75 30-34q-4-65 26-24q40-30 30 0l-7 58H30Z M487 247q-8-62 25-32q10-56 30-21q29-19 25 9l-5 44H487Z" fill="#438e76"/>${pond(467,269)}`;
 if(id==='ice')back=`<path d="M5 249l76-105 63 91 74-141 114 155Z" fill="#d6edf6"/><path d="M57 174l24-30 30 39-28-7-12 7M187 137l31-43 41 51-39-13-18 12" fill="#fff"/><path d="M452 249q-17-49 36-55q57 0 61 55Z" fill="#edf8fc" stroke="#b1d6e4" stroke-width="3"/><path d="M480 249v-19q13-25 26 0v19" fill="#93bed3"/><path d="M454 221h83m-52-22v21m24 0v27" stroke="#c7e0ea" stroke-width="3"/>${pond(475,274,'#78bfdb')}`;
 if(id==='prehistoric')back=`<path d="M150 249L260 103l115 146" fill="#98b7ad"/><path d="M233 136l27-33 32 36-27-9Z" fill="#cedbd0"/>${tree(66,244,.96,'pine')}${tree(530,246,1.06,'pine')}<g fill="#7a9b83"><ellipse cx="130" cy="249" rx="35" ry="13"/><ellipse cx="550" cy="260" rx="29" ry="11"/></g>${pond(465,272)}`;
 if(id==='haunted'){
 back=`<g fill="#b3a0d6" stroke="#655485" stroke-width="3"><path d="M399 246V167h125v79Z"/><path d="M382 246V137h38v109m86 0V137h38v109"/><path d="M375 139l26-38 26 38m71 0 26-38 26 38" fill="#655485"/><path d="M442 170v-27h35v27"/><path d="M435 246v-32q26-38 52 0v32" fill="#6c6496"/></g><g fill="#ffe3a0"><rect x="393" y="157" width="13" height="23" rx="7"/><rect x="517" y="157" width="13" height="23" rx="7"/></g>${tree(64,246,.8,'pine')}`;
 front=`<g transform="translate(74 266)">${ellipse(0,0,23,17,'#f2b078')}<path d="M-2-13v-9" stroke="#6d926e" stroke-width="6"/><path d="M-12-4l4-5 4 5m10 0 4-5 4 5M-9 5q9 8 18 0" fill="none" stroke="#815970" stroke-width="3"/></g><g transform="translate(554 275)" fill="#efe5d3"><path d="M-13 4v-13a15 15 0 0 1 30 0V4h-5v8H-8V4Z"/><g fill="#827494"><circle cx="-5" cy="-6" r="3"/><circle cx="9" cy="-6" r="3"/></g></g>`;
 }
 if(id==='volcanic')back=`<path d="M146 249L258 106h49l117 143Z" fill="#8f779c"/><path d="M248 118l10-12h49l16 18-33-9-12 8Z" fill="#f8b979"/><path d="M288 122q-8 30 17 43t15 62" fill="none" stroke="#f4b37a" stroke-width="10" stroke-linecap="round"/><path d="M0 254q50-21 107 1m404-5q48-18 89 0" fill="none" stroke="#b0889f" stroke-width="17"/><g fill="#ffe2b2"><circle cx="269" cy="84" r="3"/><circle cx="297" cy="68" r="4"/><circle cx="317" cy="86" r="3"/></g>${ellipse(520,260,29,12,'#a4859f')}`;
 if(id==='aquarium'){
 back=`<g fill="#5aad99"><path d="M37 271q28-33 8-71t17-52q-4 45 17 75t-9 48Z"/><path d="M520 270q-18-50 4-79t-3-45q47 31 23 71t7 53Z"/></g><g fill="#fff" opacity=".45"><circle cx="79" cy="103" r="8"/><circle cx="86" cy="78" r="5"/><circle cx="501" cy="100" r="7"/><circle cx="518" cy="65" r="4"/></g><path d="M119 261q-18-34 2-31q12 3 11 24q2-42 16-37q11 5-4 47" fill="none" stroke="#dc9dac" stroke-width="8" stroke-linecap="round"/>${ellipse(481,268,28,10,'#baafbf')}`;
 front='<path d="M8 18V382h584V18" fill="none" stroke="#dbfaff" stroke-width="9" opacity=".75"/><path d="M23 30v120m10-118v60" stroke="white" stroke-width="4" opacity=".5"/>';
 }
 if(id==='wetland')back=tree(58,251,.72)+tree(534,249,.85)+pond(153,266)+`<g stroke-linecap="round"><path d="M36 267v-43m12 44v-35M226 270v-37" stroke="#619978" stroke-width="5"/><path d="M36 237v-14m12 19v-11M226 243v-12" stroke="#b79465" stroke-width="7"/></g>`;
 if(id==='rainforest')back=tree(43,255,1.3)+tree(115,249,1.05)+tree(526,250,1.4)+tree(587,250,1.05)+tree(190,249,.8)+`<path d="M43 111q42 30 72-9M526 87q-18 26-8 67" fill="none" stroke="#78b37b" stroke-width="4"/>${pond(150,268)}${ellipse(58,259,55,9,'#79ae85')}${ellipse(538,256,61,10,'#79ae85')}`;
 // Contact patches sit behind decorations, joining their bases to the terrain.
 const supports={
 tropical:ellipse(66,248,63,10,'#78ae89')+ellipse(530,248,64,10,'#78ae89'),
 ice:ellipse(160,243,166,12,'#d9eaf2')+ellipse(495,249,58,9,'#c6dee9'),
 prehistoric:ellipse(66,248,49,9,'#8fbb82')+ellipse(278,239,132,11,'#99bd8c')+ellipse(530,250,51,9,'#8fbb82'),
 haunted:ellipse(464,249,96,11,'#73668f')+ellipse(64,248,43,8,'#73668f'),
 volcanic:ellipse(285,245,151,15,'#ad8da7')
 };
 back=(supports[id]||'')+back;
 if(playground&&['savanna','bamboo','forest','tropical','ice','prehistoric','haunted','volcanic'].includes(id)){back=`<g transform="translate(600 0) scale(-1 1)">${back}</g>`;front=`<g transform="translate(600 0) scale(-1 1)">${front}</g>`;}
 const sun=(night&&id!=='aquarium')||id==='haunted'?'<path d="M301 39a25 25 0 1 0 21 40a24 24 0 0 1-21-40" fill="#ffe5a9"/>':id==='aquarium'?'':`<circle cx="300" cy="53" r="21" fill="#ffe7a1"/>`;
 return `<svg class="park-environment theme-${id}" viewBox="0 0 600 ${tall?600:400}" preserveAspectRatio="none" role="img" aria-label="${e.name}" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="400" fill="${renderedSky}"/>${sun}${id==='haunted'||id==='aquarium'?'':cloud(138,60)+cloud(455,76)}<path d="M0 236Q85 160 177 220T359 201T600 235V400H0Z" fill="${hills}"/><path d="M0 249Q180 236 300 251T600 249V400H0Z" fill="${floor}"/>${tall?`<rect y="399" width="600" height="201" fill="${floor}"/>`:""}${back}<path d="M0 322Q200 306 375 327T600 320" fill="none" stroke="#ffffff" stroke-opacity=".13" stroke-width="5"/>${front}</svg>`;
}
