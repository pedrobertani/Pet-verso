export const families = [
 {id:'pets',name:'Pets',icon:'🐾',color:'#eab483',names:['Gato','Cachorro','Coelho','Hamster','Porquinho-da-índia','Calopsita','Poodle','Gatinho preto'],food:'ração',toy:'bola'},
 {id:'exoticos',name:'Exóticos',icon:'🦎',color:'#a3cddd',names:['Axolote','Camaleão','Furão','Iguana','Ouriço','Gecko','Chinchila','Tartaruga'],food:'frutas',toy:'memória'},
 {id:'selva',name:'Selva',icon:'🌿',color:'#dab274',names:['Leão','Macaco','Elefante','Tigre','Panda','Girafa','Zebra','Onça'],food:'frutas',toy:'corrida'},
 {id:'dinos',name:'Dinos',icon:'🦕',color:'#95c8a0',names:['Tiranossauro','Tricerátops','Braquiossauro','Estegossauro','Velociraptor','Anquilossauro','Parassaurolofo','Diplodoco'],food:'vegetais',toy:'corrida'},
 {id:'sombrios',name:'Sombrios simpáticos',icon:'🌙',color:'#c3b1ec',names:['Fantasminha','Morceguinho','Monstrinho de sombra','Abóbora viva','Dragão noturno','Gatinho espectral','Múmia pequena','Lobinho lunar'],food:'biscoito',toy:'esconde-esconde'},
];
export const species=families.flatMap(f=>f.names.map((name,i)=>({id:`${f.id}-${i}`,name,family:f.id,color:f.color,variant:i,food:f.food,toy:f.toy})));
species.push(...[{id:'selva-brown',name:'Urso marrom',color:'#a77552'},{id:'selva-polar',name:'Urso polar',color:'#f2f7ff'}].map(s=>({...s,family:'selva',variant:0,food:'frutas',toy:'bola'})));
species.push({id:'pets-mouse',name:'Rato',family:'pets',color:'#e9edf2',variant:0,food:'ração',toy:'bola'});
species.push(...[{id:'selva-capybara',name:'Capivara',family:'selva',color:'#d7a36e',food:'frutas',toy:'bola'},{id:'selva-fox',name:'Raposa',family:'selva',color:'#ef9b57',food:'frutas',toy:'esconde-esconde'},{id:'exoticos-penguin',name:'Pinguim',family:'exoticos',color:'#7d90b9',food:'ração',toy:'corrida'},{id:'sombrios-dragon',name:'Dragãozinho',family:'sombrios',color:'#b6a0de',food:'biscoito',toy:'corrida'}].map(s=>({...s,variant:0})));
export const palettes={'pets-mouse':[{id:'white',name:'Branco',color:'#f0f2f6',detail:'#d6dce5'},{id:'gray',name:'Cinza',color:'#9eabba',detail:'#7b8da4'}],'pets-0':[{id:'orange',name:'Laranja',color:'#f4b173',detail:'#bf753d'},{id:'gray',name:'Cinza',color:'#a7b4c5',detail:'#5d7088'},{id:'black',name:'Preto',color:'#586171',detail:'#333d50'}],'pets-1':[{id:'caramel',name:'Caramelo',color:'#d2a079',detail:'#895438'},{id:'brown',name:'Marrom',color:'#9e7056',detail:'#60412e'},{id:'blackwhite',name:'Preto e branco',color:'#eef2f5',detail:'#364354'}]};
export const activeSpecies=species.filter(s=>['pets-0','pets-1','exoticos-0','exoticos-1','selva-0','selva-4','dinos-0','dinos-1','sombrios-0','sombrios-1','pets-2','exoticos-7','selva-2','dinos-2','dinos-3','selva-brown','selva-polar','pets-mouse','selva-capybara','selva-fox','exoticos-penguin','sombrios-dragon'].includes(s.id));
export const attrs={food:'Saciedade',joy:'Felicidade',energy:'Energia',hygiene:'Higiene',health:'Saúde',intelligence:'Inteligência'};
export const fresh=(id,name,now=Date.now())=>({revision:1,species:id,name:name.trim().slice(0,24)||species.find(s=>s.id===id)?.name||'Meu pet',born:now,last:now,sleeping:false,coins:40,stats:{food:85,joy:80,energy:90,hygiene:90,health:100,intelligence:0},xp:0,personality:['Curioso','Brincalhão','Tranquilo'][Math.floor(Math.random()*3)],games:0,ill:false,illnessHours:0,neglectHours:0,dead:false,deadAt:null,inventory:[],equipped:{},waste:0,wasteClock:0,floorDirt:0,lastEarning:0,totalPoints:0,records:{}});
const clamp=x=>Math.max(0,Math.min(100,x));
export function valid(p){return p?.revision===1&&species.some(s=>s.id===p.species)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=24&&typeof p.sleeping==='boolean'&&Number.isFinite(p.last)&&Number.isFinite(p.born)&&p.born<=p.last&&Number.isFinite(p.coins)&&p.coins>=0&&Number.isFinite(p.xp)&&p.xp>=0&&Number.isFinite(p.games)&&p.games>=0&&['Curioso','Brincalhão','Tranquilo'].includes(p.personality)&&Object.keys(attrs).every(k=>Number.isFinite(p.stats?.[k])&&p.stats[k]>=0&&p.stats[k]<=100);}
export function tick(p,now=Date.now()){
 const n=structuredClone(p);let remaining=Math.max(0,(now-n.last)/3600000),cursor=n.last;
 n.ill??=false;n.illnessHours??=0;n.neglectHours??=0;n.dead??=false;n.waste??=0;n.wasteClock??=0;n.floorDirt??=n.waste;
 // Hour-sized steps retain the consequences of long offline absences.
 while(remaining>0&&!n.dead){
  const h=Math.min(1,remaining);remaining-=h;cursor+=h*3600000;
  n.wasteClock+=h;const interval=n.sleeping?8:.75;if(n.wasteClock>=interval){const produced=Math.floor(n.wasteClock/interval);n.waste=Math.min(5,n.waste+produced);n.floorDirt=Math.min(5,n.floorDirt+produced);n.stats.hygiene=clamp(n.stats.hygiene-produced*8);n.wasteClock%=interval;}
  n.stats.food=clamp(n.stats.food-h*(n.sleeping?3:80));n.stats.hygiene=clamp(n.stats.hygiene-h*((n.sleeping?1:6)+(n.waste+(n.floorDirt??0))*.4));n.stats.joy=clamp(n.stats.joy-h*(n.sleeping?.5:22));
  n.stats.energy=clamp(n.stats.energy+h*(n.sleeping?24:-22));
  const neglected=n.stats.food<=15||n.stats.energy<=10||n.stats.hygiene<=10||n.waste>=4;
  n.neglectHours=neglected?n.neglectHours+h:0;
  n.stats.health=clamp(n.stats.health+h*(neglected?-3:(n.sleeping?2:.5)));
  if(!n.ill&&(n.neglectHours>=12||n.stats.health<=25)){n.ill=true;n.illnessHours=0;}
  if(n.ill){
   const recovered=n.stats.health>=70&&n.stats.food>=30&&n.stats.energy>=30&&n.stats.hygiene>=30;
   if(recovered){n.ill=false;n.illnessHours=0;n.neglectHours=0;}
   else {n.illnessHours+=h;if(n.illnessHours>=72){n.dead=true;n.deadAt=cursor;n.sleeping=false;}}
  }
 }
 n.last=Math.max(now,n.last);return n;
}
export function care(p,action){const n=structuredClone(p);if(n.dead)return n;const s=n.stats;
 if(action==='sleep'){n.sleeping=!n.sleeping;return n;}
 if(action==='clean'){n.coins+=n.waste??0;n.waste=0;n.floorDirt=0;return n;}if(action==='pickup'){if((n.waste??0)>0){n.waste--;n.coins++;}return n;}
 if(n.sleeping)return n;
 if(action==='feed'&&n.coins>=5){n.coins-=5;s.food=clamp(s.food+60);s.joy=clamp(s.joy+3);n.xp+=2;}
 if(action==='bath'){s.hygiene=100;s.joy=clamp(s.joy+4);n.xp+=2;}
 if(action==='pet'){s.joy=clamp(s.joy+5);}
 if(action==='medicine'&&n.coins>=12&&s.health<90){n.coins-=12;s.health=clamp(s.health+20);}
 return n;
}
export function reward(p,score,smart,gameId){const n=structuredClone(p);if(n.dead||n.sleeping||n.stats.energy<10)return n;const points=Math.max(0,Math.min(100,Math.floor(score)));const earnedPoints=Math.max(0,Math.floor(Number.isFinite(score)?score:0));n.totalPoints=(n.totalPoints||0)+earnedPoints;n.records??={};if(gameId)n.records[gameId]=Math.max(n.records[gameId]||0,earnedPoints);n.lastEarning=gameId?3+Math.floor(earnedPoints/40):3+Math.floor(points/10);n.coins+=n.lastEarning;n.games++;n.xp+=3+Math.floor(points/20);n.stats.energy=clamp(n.stats.energy-8);n.stats.joy=clamp(n.stats.joy+5+points/20);if(smart)n.stats.intelligence=clamp(n.stats.intelligence+(n.stats.health<40?1:2)+points/25);return n;}
export function stage(p){return p.xp>=120?'Adulto':p.xp>=40?'Jovem':'Filhote';}
export function randomSpecies(random=Math.random){return activeSpecies[Math.min(activeSpecies.length-1,Math.max(0,Math.floor(random()*activeSpecies.length)))].id;}
export const shop=[{id:'bed-cloud',name:'Caminha nuvem',icon:'☁️',price:180,slot:'bed'},{id:'bed-leaf',name:'Cama folha',icon:'🍃',price:240,slot:'bed'},{id:'bed-moon',name:'Cama lunar',icon:'🌙',price:420,slot:'bed'},{id:'rug',name:'Tapete arco-íris',icon:'🌈',price:110,slot:'rug'},{id:'plant',name:'Plantinha',icon:'🪴',price:90,slot:'decor'},{id:'lamp',name:'Abajur estrela',icon:'⭐',price:260,slot:'lamp',room:'bedroom'},{id:'castle',name:'Castelinho',icon:'🏰',price:600,slot:'decor'},{id:'ball',name:'Bola colorida',icon:'⚽',price:120,slot:'toy'},{id:'rocket',name:'Foguete de brincar',icon:'🚀',price:350,slot:'toy'},{id:'sofa',name:'Sofá aconchegante',price:280,slot:'sofa',room:'living'},{id:'shelf',name:'Estante de livros',price:220,slot:'shelf',room:'living'},{id:'table',name:'Mesinha redonda',price:160,slot:'table',room:'living'},{id:'swing',name:'Balanço do quintal',price:360,slot:'garden-swing',room:'garden'},{id:'slide',name:'Escorregador',price:450,slot:'garden-slide',room:'garden'},{id:'trampoline',name:'Cama elástica',price:520,slot:'garden-trampoline',room:'garden'},{id:'bench',name:'Banco do jardim',price:190,slot:'garden-bench',room:'garden'}];
shop.push(...[
{id:'bed-basic',name:'Cama simples',price:0,slot:'bed',room:'bedroom'},
{id:'rug-basic',name:'Tapete lilás',price:0,slot:'rug',room:'living'},
{id:'dresser-basic',name:'Cômoda simples',price:0,slot:'dresser',room:'bedroom'},
{id:'dresser-mint',name:'Cômoda menta',price:230,slot:'dresser',room:'bedroom'},
{id:'dresser-rose',name:'Cômoda rosinha',price:230,slot:'dresser',room:'bedroom'},
{id:'lamp-basic',name:'Abajur simples',price:0,slot:'lamp',room:'bedroom'},
{id:'lamp-rose',name:'Abajur rosinha',price:140,slot:'lamp',room:'bedroom'},
{id:'tub-basic',name:'Banheira lilás',price:0,slot:'tub',room:'bathroom'},
{id:'tub-mint',name:'Banheira menta',price:200,slot:'tub',room:'bathroom'},
{id:'tub-rose',name:'Banheira rosinha',price:200,slot:'tub',room:'bathroom'}]);
export function buy(p,id){const item=shop.find(x=>x.id===id);const n=structuredClone(p);if(n.dead)return n;n.inventory??=[];n.equipped??={};if(!item)return n;if(n.inventory.includes(id)){n.equipped[item.slot]=id;return n;}if(n.coins<item.price)return n;n.coins-=item.price;n.inventory.push(id);n.equipped[item.slot]=id;return n;}
