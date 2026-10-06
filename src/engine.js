export const families = [
 {id:'pets',name:'Pets',icon:'🐾',color:'#eab483',names:['Gato','Cachorro','Coelho','Hamster','Porquinho-da-índia','Calopsita','Poodle','Gatinho preto'],food:'ração',toy:'bola'},
 {id:'exoticos',name:'Exóticos',icon:'🦎',color:'#a3cddd',names:['Axolote','Camaleão','Furão','Iguana','Ouriço','Gecko','Chinchila','Tartaruga'],food:'frutas',toy:'memória'},
 {id:'selva',name:'Selva',icon:'🌿',color:'#dab274',names:['Leão','Macaco','Elefante','Tigre','Panda','Girafa','Zebra','Onça'],food:'frutas',toy:'corrida'},
 {id:'dinos',name:'Dinos',icon:'🦕',color:'#95c8a0',names:['Tiranossauro','Tricerátops','Braquiossauro','Estegossauro','Velociraptor','Anquilossauro','Parassaurolofo','Diplodoco'],food:'vegetais',toy:'corrida'},
 {id:'sombrios',name:'Sombrios simpáticos',icon:'🌙',color:'#c3b1ec',names:['Fantasminha','Morceguinho','Monstrinho de sombra','Abóbora viva','Dragão noturno','Gatinho espectral','Múmia pequena','Lobinho lunar'],food:'biscoito',toy:'esconde-esconde'},
];
export const species=families.flatMap(f=>f.names.map((name,i)=>({id:`${f.id}-${i}`,name,family:f.id,color:f.color,variant:i,food:f.food,toy:f.toy})));
export const attrs={food:'Saciedade',joy:'Felicidade',energy:'Energia',hygiene:'Higiene',health:'Saúde',intelligence:'Inteligência'};
export const fresh=(id,name,now=Date.now())=>({revision:1,species:id,name:name.trim().slice(0,24)||species.find(s=>s.id===id)?.name||'Meu pet',born:now,last:now,sleeping:false,coins:40,stats:{food:85,joy:80,energy:90,hygiene:90,health:100,intelligence:0},xp:0,personality:['Curioso','Brincalhão','Tranquilo'][Math.floor(Math.random()*3)],games:0,ill:false,illnessHours:0,neglectHours:0,dead:false,deadAt:null,inventory:[],equipped:{}});
const clamp=x=>Math.max(0,Math.min(100,x));
export function valid(p){return p?.revision===1&&species.some(s=>s.id===p.species)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=24&&typeof p.sleeping==='boolean'&&Number.isFinite(p.last)&&Number.isFinite(p.born)&&p.born<=p.last&&Number.isFinite(p.coins)&&p.coins>=0&&Number.isFinite(p.xp)&&p.xp>=0&&Number.isFinite(p.games)&&p.games>=0&&['Curioso','Brincalhão','Tranquilo'].includes(p.personality)&&Object.keys(attrs).every(k=>Number.isFinite(p.stats?.[k])&&p.stats[k]>=0&&p.stats[k]<=100);}
export function tick(p,now=Date.now()){
 const n=structuredClone(p);let remaining=Math.max(0,(now-n.last)/3600000),cursor=n.last;
 n.ill??=false;n.illnessHours??=0;n.neglectHours??=0;n.dead??=false;
 // Hour-sized steps retain the consequences of long offline absences.
 while(remaining>0&&!n.dead){
  const h=Math.min(1,remaining);remaining-=h;cursor+=h*3600000;
  n.stats.food=clamp(n.stats.food-h*(n.sleeping?1.5:3));n.stats.hygiene=clamp(n.stats.hygiene-h*1.5);n.stats.joy=clamp(n.stats.joy-h*(n.sleeping?.5:1));
  n.stats.energy=clamp(n.stats.energy+h*(n.sleeping?18:-2));
  const neglected=n.stats.food<=15||n.stats.energy<=10||n.stats.hygiene<=10;
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
 if(n.sleeping)return n;
 if(action==='feed'&&n.coins>=5){n.coins-=5;s.food=clamp(s.food+25);s.joy=clamp(s.joy+3);n.xp+=2;}
 if(action==='bath'){s.hygiene=100;s.joy=clamp(s.joy+4);n.xp+=2;}
 if(action==='pet'){s.joy=clamp(s.joy+5);}
 if(action==='medicine'&&n.coins>=12&&s.health<90){n.coins-=12;s.health=clamp(s.health+20);}
 return n;
}
export function reward(p,score,smart){const n=structuredClone(p);if(n.dead||n.sleeping||n.stats.energy<10)return n;const points=Math.max(0,Math.min(100,Math.floor(score)));n.coins+=3+Math.floor(points/10);n.games++;n.xp+=3+Math.floor(points/20);n.stats.energy=clamp(n.stats.energy-8);n.stats.joy=clamp(n.stats.joy+5+points/20);if(smart)n.stats.intelligence=clamp(n.stats.intelligence+(n.stats.health<40?1:2)+points/25);return n;}
export function stage(p){return p.xp>=120?'Adulto':p.xp>=40?'Jovem':'Filhote';}
export function randomSpecies(random=Math.random){return species[Math.min(species.length-1,Math.max(0,Math.floor(random()*species.length)))].id;}
export const shop=[{id:'bed-cloud',name:'Caminha nuvem',icon:'☁️',price:180,slot:'bed'},{id:'bed-leaf',name:'Cama folha',icon:'🍃',price:240,slot:'bed'},{id:'bed-moon',name:'Cama lunar',icon:'🌙',price:420,slot:'bed'},{id:'rug',name:'Tapete arco-íris',icon:'🌈',price:110,slot:'rug'},{id:'plant',name:'Plantinha',icon:'🪴',price:90,slot:'decor'},{id:'lamp',name:'Abajur estrela',icon:'⭐',price:260,slot:'decor'},{id:'castle',name:'Castelinho',icon:'🏰',price:600,slot:'decor'},{id:'ball',name:'Bola colorida',icon:'⚽',price:120,slot:'toy'},{id:'rocket',name:'Foguete de brincar',icon:'🚀',price:350,slot:'toy'}];
export function buy(p,id){const item=shop.find(x=>x.id===id);const n=structuredClone(p);if(n.dead)return n;n.inventory??=[];n.equipped??={};if(!item)return n;if(n.inventory.includes(id)){n.equipped[item.slot]=id;return n;}if(n.coins<item.price)return n;n.coins-=item.price;n.inventory.push(id);n.equipped[item.slot]=id;return n;}
