import {test} from 'node:test';import assert from 'node:assert/strict';import {species,activeSpecies,fresh,valid,tick,care,canFeedByHunger,reward,randomSpecies,visibleWasteSlots} from '../src/engine.js';
test('catálogo cobre todas as famílias com identidades únicas',()=>{assert.equal(species.length,51);assert.equal(new Set(species.map(s=>s.id)).size,species.length);assert.equal(new Set(species.map(s=>s.family)).size,5);});
test('sorteio alcança todas as espécies',()=>{activeSpecies.forEach((s,i)=>assert.equal(randomSpecies(()=>(i+.5)/activeSpecies.length),s.id));});
test('sono recupera energia offline sem multiplicar tempo ao reabrir',()=>{let p=fresh('pets-0','Lua',1000);p.stats.energy=10;p.sleeping=true;const n=tick(p,3601000);assert.equal(n.stats.energy,60);assert.equal(n.sleeping,true);assert.deepEqual(tick(n,3601000),n);assert.equal(n.stats.intelligence,0);});
test('retrocesso do relógio não concede energia nem progresso',()=>{const p=fresh('pets-0','Lua',1000);assert.deepEqual(tick(p,0),p);});
test('dormindo não pode gastar com cuidados, mas pode receber prêmio de jogo',()=>{const p=fresh('pets-0','Lua');p.sleeping=true;assert.deepEqual(care(p,'feed'),p);const played=reward(p,100,true,'memory');assert.ok(played.coins>p.coins);assert.equal(played.sleeping,true);assert.equal(played.games,p.games+1);assert.equal(played.stats.energy,p.stats.energy-5);});
test('cuidados respeitam saldo e inteligência é duradoura',()=>{const p=fresh('pets-0','Lua');p.coins=0;assert.deepEqual(care(p,'feed'),p);const n=reward(p,80,true);assert.ok(n.coins>0&&n.stats.intelligence>0);assert.equal(tick(n,n.last+86400000).stats.intelligence,n.stats.intelligence);assert.ok(valid(n));});
test('save corrompido não entra no jogo',()=>{assert.equal(valid({revision:1}),false);const p=fresh('pets-0','Lua');p.stats.health=NaN;assert.equal(valid(p),false);});
import {buy,shop} from '../src/engine.js';
import {GAME_COIN_TARGETS,GAME_BONUS_20_TARGETS,MAX_GAME_COINS} from '../src/game-economy.js';
test('loja não compra sem saldo nem cobra novamente ao equipar',()=>{const p=fresh('pets-0','Lua');assert.equal(buy(p,shop[0].id).coins,p.coins);p.coins=500;const n=buy(p,shop[0].id);assert.equal(n.coins,320);assert.equal(n.equipped.bed,shop[0].id);assert.equal(buy(n,shop[0].id).coins,320);assert.equal(n.inventory.length,1);});
test('negligência offline causa doença e cinco dias sem cuidado causam morte',()=>{const p=fresh('pets-0','Lua',1000);const ill=tick(p,1000+48*3600000);assert.equal(ill.ill,true);assert.equal(ill.dead,false);const dead=tick(p,1000+8*86400000);assert.equal(dead.dead,true);assert.ok(dead.deadAt);assert.deepEqual(care(dead,'medicine'),dead);const farm=reward(dead,100,true);assert.ok(farm.coins>dead.coins);assert.deepEqual(farm.stats,dead.stats);assert.equal(farm.dead,true);assert.equal(tick(dead,dead.last+86400000).dead,true);});
test('cuidados suficientes interrompem doença antes da morte',()=>{let p=fresh('pets-0','Lua',1000);p.ill=true;p.illnessHours=60;p.stats.health=40;p.coins=100;p=care(p,'medicine');p=care(p,'medicine');const n=tick(p,1000+15*60000);assert.equal(n.ill,false);assert.equal(n.dead,false);assert.equal(n.illnessHours,0);});
test('seleção tem 25 espécies com saves antigos válidos',()=>{assert.equal(activeSpecies.length,27);assert.equal(new Set(activeSpecies.map(s=>s.id)).size,activeSpecies.length);assert.equal(valid(fresh('pets-3','Hamster antigo')),true);});
test('necessidades acumulam offline e limpeza não custa moedas nem dá banho',()=>{let p=fresh('pets-0','Lua',1000);p=tick(p,1000+1.75*3600000);assert.equal(p.waste,2);const clean=care(p,'clean');assert.equal(clean.waste,0);assert.equal(clean.coins,p.coins+p.waste);assert.equal(clean.stats.hygiene,p.stats.hygiene);});
test('partidas sem pontos não rendem moedas e faixas calibradas premiam 5, 8, 10, 15 e 20',()=>{
 assert.equal(MAX_GAME_COINS,20,'teto extraordinário esperado');
 for(const [game,targets] of Object.entries(GAME_COIN_TARGETS)){
  const p=fresh('pets-0','Lua'),score=points=>reward(p,points,true,game);
  for(const points of [0,-50,NaN]){
   const n=score(points);
   assert.equal(n.coins,p.coins,game+' sem pontos');
   assert.equal(n.lastEarning,0,game+' não registra prêmio');
  }
  if(game==='puzzle'){
   for(const [boards,expected] of [[0,0],[1,10],[2,10],[3,15],[5,15],[6,20],[12,20]]){
    const n=reward(p,boards*90,true,game,boards);
    assert.equal(n.coins-p.coins,expected,game+' com '+boards+' tabuleiros');
    assert.equal(n.lastEarning,expected);
   }
   continue;
  }
  const {good,excellent,legendary}=targets,bonus=GAME_BONUS_20_TARGETS[game];
  const cases=[[1,5],[good-1,5],[good,8],[excellent-1,8],[excellent,10],[legendary-1,10],[legendary,15],[bonus-1,15],[bonus,20],[1000000,20]];
  assert.ok(good<excellent&&excellent<legendary&&legendary<bonus,'metas crescentes: '+game);
  for(const [points,expected] of cases){
   const n=score(points);
   assert.equal(n.coins-p.coins,expected,game+' com '+points+' pontos');
   assert.equal(n.lastEarning,expected);
  }
 }
});

test('recolher cocô remove a marca correspondente sem dar banho',()=>{const p=fresh('pets-0','Lua',1000);const n=tick(p,1000+.75*3600000);assert.equal(n.waste,1);assert.equal(n.floorDirt,1);assert.ok(n.stats.hygiene<81);const pickup=care(n,'pickup');assert.equal(pickup.waste,0);assert.equal(pickup.floorDirt,0);const clean=care(pickup,'clean');assert.equal(clean.floorDirt,0);assert.equal(clean.stats.hygiene,n.stats.hygiene);const bath=care(n,'bath');assert.equal(bath.stats.hygiene,100);assert.equal(bath.floorDirt,1);});

test('fome cai 24/h; energia e diversão mantêm seu ritmo',()=>{const p=fresh('pets-0','Lua',1000);const n=tick(p,1000+45*60000);assert.equal(n.stats.food,67);assert.equal(n.waste,1);const later=tick(p,1000+3*3600000);assert.equal(later.stats.energy,72);assert.equal(later.stats.joy,14);});
test('energia completa mantém o pet dormindo até o jogador acordá-lo',()=>{const p=fresh('pets-0','Lua',1000);p.sleeping=true;p.stats.energy=20;const n=tick(p,1000+8*3600000);assert.equal(n.stats.energy,100);assert.equal(n.sleeping,true);assert.equal(care(n,'sleep').sleeping,false);assert.ok(n.stats.food>=60);assert.ok(n.stats.hygiene>30&&n.stats.hygiene<40,'perda noturna maior incluindo um cocô');assert.equal(n.ill,false);assert.equal(n.dead,false);});

test('refeição recupera 30 pontos de saciedade e sono completo leva duas horas',()=>{const p=fresh('pets-0','Lua',1000);p.stats.food=25;const fed=care(p,'feed');assert.equal(fed.stats.food,55);assert.equal(tick(fed,1000+45*60000).stats.food,37);p.sleeping=true;p.stats.energy=35;const rested=tick(p,1000+2*3600000);assert.equal(rested.stats.energy,100);assert.equal(rested.sleeping,true);});
test('cada cocô recolhido rende uma moeda sem repetir nem premiar manchas',()=>{const p=fresh('pets-0','Lua');p.waste=2;p.floorDirt=2;const first=care(p,'pickup');assert.equal(first.coins,p.coins+1);const second=care(first,'pickup');assert.equal(second.coins,p.coins+2);assert.equal(care(second,'pickup').coins,second.coins);assert.equal(care(second,'clean').coins,second.coins);assert.equal(care(p,'clean').coins,p.coins+2);});

test('cinco dias críticos e renascimento por 300 moedas preservam identidade e progresso',async()=>{const {revive,REVIVE_PRICE}=await import('../src/engine.js');assert.equal(REVIVE_PRICE,300);const p=fresh('pets-0','Lua',1000);p.ill=true;p.neglectHours=119;p.stats.food=0;p.stats.energy=0;p.stats.hygiene=0;p.stats.health=0;assert.equal(tick(p,1000+30*60000).dead,false);const dead=tick(p,1000+3600000);assert.equal(dead.dead,true);dead.coins=REVIVE_PRICE-1;assert.deepEqual(revive(dead),dead,'com 299 moedas não revive e não cobra');dead.coins=REVIVE_PRICE;dead.stats.intelligence=60;const live=revive(dead,9000000);assert.equal(live.coins,0);assert.equal(live.dead,false);assert.equal(live.species,p.species);assert.equal(live.stats.intelligence,60);assert.equal(live.neglectHours,0);assert.equal(live.last,9000000);assert.deepEqual(revive(live,9000001),live,'reviver só cobra uma vez');});

test('inteligência aumenta 1, 3 ou 5 pontos conforme o desempenho',()=>{
 const p=fresh('pets-0','Lua');
 assert.equal(reward(p,0,true,'blocks').stats.intelligence-p.stats.intelligence,0);
 assert.equal(reward(p,10,true,'blocks').stats.intelligence-p.stats.intelligence,1);
 assert.equal(reward(p,220,true,'blocks').stats.intelligence-p.stats.intelligence,3);
 assert.equal(reward(p,660,true,'blocks').stats.intelligence-p.stats.intelligence,5);
 assert.equal(reward(p,10000,true,'blocks').stats.intelligence-p.stats.intelligence,5);
 assert.equal(reward(p,10000,false,'blocks').stats.intelligence-p.stats.intelligence,0);
 p.stats.health=30;
 assert.equal(reward(p,660,true,'blocks').stats.intelligence-p.stats.intelligence,2);
});


test('acordado consome apenas 6 pontos de energia por hora: um a cada dez minutos',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.energy=90;
 assert.ok(Math.abs(tick(p,1000+10*60000).stats.energy-89)<.001);
 assert.equal(tick(p,1000+3600000).stats.energy,84);
 assert.equal(tick(p,1000+3*3600000).stats.energy,72);
});
test('em zero de energia ele adormece sozinho, inclusive quando estava offline',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.energy=1;
 const asleep=tick(p,1000+10*60000);
 assert.equal(asleep.sleeping,true);
 assert.ok(asleep.stats.energy<=.001);
 const rested=tick(p,1000+70*60000);
 assert.equal(rested.sleeping,true);
 assert.ok(Math.abs(rested.stats.energy-50)<.01);
 // At zero and with no elapsed time, the state is still corrected.
 const exhausted=fresh('pets-0','Rex',1000);exhausted.stats.energy=0;
 assert.equal(tick(exhausted,1000).sleeping,true);
});
test('o mesmo intervalo offline divide cansaço e recuperação no instante em que zera',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.energy=2;
 const after=tick(p,1000+30*60000);
 assert.equal(after.sleeping,true);
 // 20 min awake (-2), followed by 10 min asleep (+8.33).
 assert.ok(Math.abs(after.stats.energy-50/6)<.01,after.stats.energy);
});
test('o pet permanece descansando com energia cheia até um clique em Acordar',()=>{
 const p=fresh('pets-0','Lua',1000);p.sleeping=true;p.stats.energy=80;
 const asleep=tick(p,1000+5*3600000);
 assert.equal(asleep.stats.energy,100);
 assert.equal(asleep.sleeping,true);
 const next=tick(asleep,asleep.last+3600000);
 assert.equal(next.stats.energy,100);
 assert.equal(next.sleeping,true);
 const awake=care(next,'sleep');
 assert.equal(awake.sleeping,false);
 assert.equal(awake.stats.energy,100);
 assert.equal(next.sleeping,true,'não deve alterar a cópia original');
 const short=tick(p,1000+10*60000);
 assert.equal(short.sleeping,true,'não acordar automaticamente antes de completar 100');
});
test('partidas continuam consumindo cinco pontos adicionais de energia',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.energy=50;
 const played=reward(p,70,true,'memory');
 assert.equal(played.stats.energy,45);
 assert.equal(played.sleeping,false);
});

test('sono de energia zero até 100 demora exatamente duas horas e nunca desperta sozinho',()=>{
 const p=fresh('pets-0','Lua',1000);p.sleeping=true;p.stats.energy=0;
 const half=tick(p,1000+3600000);assert.equal(half.stats.energy,50);assert.equal(half.sleeping,true);
 const nearly=tick(p,1000+110*60000);assert.ok(nearly.stats.energy<100);
 const full=tick(p,1000+2*3600000);assert.equal(full.stats.energy,100);assert.equal(full.sleeping,true);
 const later=tick(full,full.last+6*3600000);assert.equal(later.stats.energy,100);assert.equal(later.sleeping,true);
 const manual=care(full,'sleep');assert.equal(manual.sleeping,false);assert.equal(manual.stats.energy,100);
});

test('saciedade cai 24/h e cada refeição repõe 30 pontos por 5 moedas',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.food=25;p.coins=20;
 const fed=care(p,'feed');
 assert.equal(fed.stats.food,55);
 assert.equal(fed.coins,15);
 assert.equal(tick(fed,1000+3600000).stats.food,31);
 assert.equal(tick(fed,1000+2*3600000).stats.food,7);
 assert.equal(tick(fed,1000+10*60000).stats.food,51);
 assert.equal(tick({...fed,sleeping:true},1000+2*3600000).stats.food,49);
 assert.equal(care(fed,'medicine').coins,15,'preço do remédio não foi modificado');
 const patient={...fed,stats:{...fed.stats,health:50}};
 assert.equal(care(patient,'medicine').coins,3,'remédio custa 12 moedas');
});

test('higiene cai 10 por hora acordado e 5 por hora dormindo, antes de produzir cocô',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.hygiene=100;p.stats.energy=90;
 const awake=tick(p,1000+30*60000);
 assert.ok(Math.abs(awake.stats.hygiene-95)<1e-9,awake.stats.hygiene);
 assert.equal(awake.waste,0);
 const sleeping=tick({...p,sleeping:true},1000+60*60000);
 assert.ok(Math.abs(sleeping.stats.hygiene-95)<1e-9,sleeping.stats.hygiene);
 assert.equal(sleeping.waste,0);
});
test('cada cocô diminui 15 de higiene, além da sujeira acumulada',()=>{
 const p=fresh('pets-0','Lua',1000);p.stats.hygiene=100;p.stats.energy=90;
 const first=tick(p,1000+45*60000);
 assert.equal(first.waste,1);
 // 7,5 pontos por 45min acordado + 15 pelo cocô + 0,6 pela sujeira.
 assert.ok(Math.abs(first.stats.hygiene-76.9)<1e-9,first.stats.hygiene);
 const second=tick(p,1000+90*60000);
 assert.equal(second.waste,2);
 // Ao longo de 90min, dois cocôs custam 30 pontos, além do desgaste e sujeira.
 // O tick longo divide o tempo em blocos de até 1h: 100-15-30-1,6 = 53,4.
 assert.ok(Math.abs(second.stats.hygiene-53.4)<1e-9,second.stats.hygiene);
 assert.equal(care(second,'bath').stats.hygiene,100,'banho continua gratuito e restaura toda higiene');
});

test('ração só bloqueia em 100 e alimenta de 0 a 99.99 sem cobrança indevida',()=>{
 const base=fresh('pets-0','Lua',1000);base.coins=40;base.stats.food=100;
 assert.equal(canFeedByHunger(base),false,'100 bloqueia');
 assert.deepEqual(care(base,'feed'),base,'100 não desconta moedas nem aumenta missões');
 for(const food of [99.99,99.5,99,90,85,70,69.5,40,1,0]){
  const p={...base,stats:{...base.stats,food}};
  assert.equal(canFeedByHunger(p),true,'qualquer saciedade menor que 100 é permitida: '+food);
  const after=care(p,'feed');
  assert.equal(after.coins,p.coins-5,'custa 5 moedas');
  assert.equal(after.stats.food,Math.min(100,food+30),'ração recupera até 30');
  assert.equal(after.growth.meals,p.growth.meals+1,'conta refeição');
  assert.equal(after.xp,p.xp+2,'ganha XP');
  if(after.stats.food===100){
   assert.deepEqual(care(after,'feed'),after,'ao completar 100 bloqueia a próxima refeição');
  }else{
   assert.equal(canFeedByHunger(after),true,'abaixo de 100 a ração continua disponível');
  }
 }
 const hungry={...base,stats:{...base.stats,food:0}};
 const afterOne=care(hungry,'feed');
 const afterTwo=care(afterOne,'feed');
 const afterThree=care(afterTwo,'feed');
 assert.equal(afterThree.stats.food,90,'0 → 30 → 60 → 90');
 const full=care(afterThree,'feed');
 assert.equal(full.stats.food,100,'quarta ração completa 100');
 assert.equal(full.coins,20,'quatro refeições custam 20 moedas');
 assert.equal(full.growth.meals,4);
 assert.deepEqual(care(full,'feed'),full,'quinta ração não cobra nem concede progresso');
 for(const pet of [
  {...base,coins:0,stats:{...base.stats,food:20}},
  {...base,sleeping:true,stats:{...base.stats,food:20}},
  {...base,dead:true,stats:{...base.stats,food:20}}
 ]){
  assert.deepEqual(care(pet,'feed'),pet,'outros bloqueios continuam funcionando');
 }
});

test('reviver custa 300 exatamente e preserva o troco',async()=>{
 const {revive,REVIVE_PRICE}=await import('../src/engine.js');
 const p=fresh('pets-0','Lua',1000);p.dead=true;p.deadAt=1000;p.coins=REVIVE_PRICE+100;
 const n=revive(p,2000);
 assert.equal(n.coins,100);
 assert.equal(n.dead,false);
 assert.equal(p.dead,true,'o save original não deve ser mutado');
 assert.equal(p.coins,400);
 assert.equal(n.stats.food,80);
 assert.equal(n.stats.energy,80);
});


test('recolhe exatamente o cocô escolhido sem trocar a posição dos demais',()=>{
 const p=fresh('pets-0','Pipoca',1000);
 p.waste=3;p.floorDirt=3;
 assert.deepEqual(visibleWasteSlots(p),[0,1,2],'save antigo sem IDs ainda exibe as posições');
 const after=care(p,'pickup',1);
 assert.equal(after.waste,2);assert.equal(after.floorDirt,2);
 assert.deepEqual(visibleWasteSlots(after),[0,2],'cocôs das posições 0 e 2 permanecem');
 assert.deepEqual(visibleWasteSlots(after,'floorDirt'),[0,2],'mancha da posição 1 desaparece');
 assert.equal(after.coins,p.coins+1);
 const saved=JSON.parse(JSON.stringify(after));
 assert.deepEqual(visibleWasteSlots(saved),[0,2],'posições persistem no salvamento');
 assert.deepEqual(care(saved,'pickup',1),saved,'não recolhe duas vezes o mesmo cocô');
 const next=care(saved,'pickup',2);
 assert.deepEqual(visibleWasteSlots(next),[0]);
 assert.equal(next.coins,p.coins+2);
 const newPoop=tick(saved,1000+.75*3600000);
 assert.deepEqual(visibleWasteSlots(newPoop),[0,2,1],'novo cocô ocupa uma vaga livre sem mover os demais');
 assert.deepEqual(visibleWasteSlots(newPoop,'floorDirt'),[0,2,1]);
});

test('limpeza geral e reviver não guardam posições antigas de cocô',()=>{
 const p=fresh('pets-0','Pipoca',1000);p.waste=2;p.floorDirt=2;
 const picked=care(p,'pickup',0),clean=care(picked,'clean');
 assert.deepEqual(visibleWasteSlots(clean),[]);
 assert.deepEqual(visibleWasteSlots(clean,'floorDirt'),[]);
 assert.deepEqual(clean.wasteSlotIds,[]);
 assert.deepEqual(clean.dirtSlotIds,[]);
});
