import {test} from 'node:test';import assert from 'node:assert/strict';
import {fresh,tick,care,reward,activeSpecies,valid} from '../src/engine.js';
import {growthProgress,advanceGrowth} from '../src/growth.js';
import {growthProfiles} from '../src/growth-art.js';import {petDrawing} from '../src/pets.js';
const day=86400000;
function ready(level=1){const p=fresh('selva-0','Leo',1000);p.last=p.born+(level===1?2:4)*day;p.growth.baths=level===1?8:24;p.growth.meals=level===1?12:40;p.growth.games=level===1?6:20;p.stats.intelligence=level===1?15:40;return p;}
test('crescimento exige todas as metas, incluindo tempo mínimo; XP sozinho não basta',()=>{
 const p=ready();for(const key of ['baths','meals','games']){const n=structuredClone(p);n.growth[key]--;assert.equal(growthProgress(n).level,0,key);}
 p.stats.intelligence=14;assert.equal(growthProgress(p).level,0);p.stats.intelligence=15;p.last--;assert.equal(growthProgress(p).level,0);p.last++;
 assert.equal(growthProgress(p).level,1);const xp=fresh('pets-0','Lua');xp.xp=9999;assert.equal(growthProgress(xp).level,0);
});
test('metas acumulam e fases conquistadas não regridem',()=>{const p=advanceGrowth(ready());p.last=p.born+4*day;p.growth.baths=24;p.growth.meals=40;p.growth.games=20;p.stats.intelligence=39;assert.equal(growthProgress(p).level,1);p.stats.intelligence=40;advanceGrowth(p);assert.equal(p.growth.level,2);p.stats.intelligence=0;assert.equal(growthProgress(p).level,2);assert.equal(p.growth.meals,40);});
test('só cuidados necessários e partidas com pontos contam; bloqueios não dão progresso',()=>{let p=fresh('pets-0','Lua');assert.equal(care(p,'feed').growth.meals,0);assert.equal(care(p,'bath').growth.baths,0);p.stats.food=60;p.stats.hygiene=75;p=care(p,'feed');p=care(p,'bath');assert.equal(p.growth.meals,1);assert.equal(p.growth.baths,1);assert.equal(care(p,'bath').growth.baths,1);p.coins=0;p.stats.food=0;assert.equal(care(p,'feed').growth.meals,1);assert.equal(reward(p,0,true,'memory').growth.games,0);const n=reward(p,100,true,'memory');assert.equal(n.growth.games,1);assert.equal(n.stats.intelligence,3);p.sleeping=true;const sleeping=reward(p,100,true,'memory');assert.equal(sleeping.growth.games,1);assert.ok(sleeping.coins>p.coins);assert.equal(sleeping.sleeping,true);});
test('migração mantém fase antiga e patrimônio, sem inventar banhos ou refeições',()=>{const p=fresh('pets-0','Lua');delete p.growth;p.xp=120;p.games=8;p.coins=333;p.inventory=['bed-cloud'];const n=tick(p,p.last);assert.equal(growthProgress(n).name,'Adulto');assert.equal(n.growth.games,8);assert.equal(n.growth.baths,0);assert.equal(n.growth.meals,0);assert.equal(n.coins,333);assert.deepEqual(n.inventory,p.inventory);assert.ok(valid(n));assert.deepEqual(tick(n,n.last),n);});
test('pet morto não evolui e relógio voltando não concede idade',()=>{const p=ready();p.dead=true;p.deadAt=p.last;assert.equal(growthProgress(p).level,0);const baby=fresh('pets-0','Lua',1000);assert.deepEqual(tick(baby,0),baby);});
test('todas as 22 espécies têm fases diferentes, com olhos e animações de cuidado preservados',()=>{for(const pet of activeSpecies){assert.ok(growthProfiles[pet.id],pet.id);const renders=[0,1,2].map(growthLevel=>petDrawing({...pet,growthLevel,carePose:true},'happy'));assert.equal(new Set(renders.map(x=>x.replaceAll(/standard-coat-\d+/g,'coat'))).size,3,pet.id);for(const growthLevel of [0,1,2])for(const carePose of [true,false]){const svg=petDrawing({...pet,growthLevel,carePose},'sleep');assert.equal((svg.match(/class="eyes"/g)||[]).length,1,pet.id);assert.ok(!svg.includes('class="teeth"'),pet.id);}}});

test('fase jovem permanece aos 2 dias, adulto requer 4 dias e todas as metas antigas',()=>{
 const p=ready(2);
 assert.equal(growthProgress(p).level,2,'adulto aos 4 dias com 24 banhos, 40 refeições, 20 jogos e 40 inteligência');
 for(const key of ['baths','meals','games']){
  const reduced=structuredClone(p);reduced.growth[key]--;
  assert.equal(growthProgress(reduced).level,1,'não evoluir sem completar '+key);
 }
 const before=structuredClone(p);before.last--;
 assert.equal(growthProgress(before).level,1,'não evoluir um milissegundo antes de 4 dias');
 const younger=ready(1);
 assert.equal(growthProgress(younger).level,1,'jovem aos 2 dias');
});
