import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameCoinReward,gameIntelligenceReward,GAME_COIN_TARGETS,MAX_GAME_COINS} from '../src/game-economy.js';

const ids=['memory','sequence','food','fruitmerge','runner','puzzle','hide','flight','words','blocks','match3'];

test('todos os 11 minijogos têm metas específicas crescentes',()=>{
 assert.equal(MAX_GAME_COINS,15);
 assert.deepEqual(Object.keys(GAME_COIN_TARGETS).sort(),ids.sort());
 const pairs=new Set();
 for(const id of ids){
  const {good,excellent,legendary}=GAME_COIN_TARGETS[id];
  assert.ok([good,excellent,legendary].every(Number.isInteger));
  assert.ok(0<good&&good<excellent&&excellent<legendary,id+' deve ter metas válidas');
  pairs.add(good+':'+excellent+':'+legendary);
 }
 assert.ok(pairs.size>=8,'jogos diferentes precisam de metas adaptadas');
});
test('recompensa por partida nunca passa de 15',()=>{
 for(const id of ids){
  const {good,excellent,legendary}=GAME_COIN_TARGETS[id];
  const points=[-30,0,1,good-1,good,excellent-1,excellent,legendary-1,legendary,100000,1e12,NaN,Infinity,-Infinity];
  for(const score of points){
   const value=gameCoinReward(id,score);
   assert.ok([0,5,8,10,15].includes(value),id+' score='+score);
   if(score<=0||!Number.isFinite(score))assert.equal(value,0);
   if(score===good)assert.equal(value,8);
   if(score===excellent)assert.equal(value,10);
   if(score===legendary||score===1e12)assert.equal(value,15);
  }
 }
});
test('pontos de games fáceis não alcançam prêmio excelente de games difíceis',()=>{
 assert.equal(gameCoinReward('flight',65),10);
 assert.equal(gameCoinReward('match3',65),5);
 assert.equal(gameCoinReward('words',160),10);
 assert.equal(gameCoinReward('blocks',160),8);
});
test('jogos antigos sem metas conhecidas têm recompensa limitada',()=>{
 assert.equal(gameCoinReward(undefined,0),0);
 assert.equal(gameCoinReward(undefined,1),5);
 assert.equal(gameCoinReward(undefined,60),8);
 assert.equal(gameCoinReward(undefined,160),10);
 assert.equal(gameCoinReward(undefined,320),15);
 assert.equal(gameCoinReward('unknown',1000000),15);
});

test('inteligência varia por desempenho e respeita as metas individuais',()=>{
 for(const id of ids){
  const {good,excellent}=GAME_COIN_TARGETS[id];
  for(const [score,expected] of [[0,0],[1,1],[good-1,1],[good,3],[excellent-1,3],[excellent,5],[1000000,5],[-1,0],[NaN,0],[Infinity,0]]){
   assert.equal(gameIntelligenceReward(id,score),expected,`${id} com ${score} pontos`);
  }
 }
 assert.equal(gameIntelligenceReward(undefined,60),3);
 assert.equal(gameIntelligenceReward(undefined,160),5);
});

test('limite extraordinário exige o dobro da meta excelente em todos os jogos',()=>{
 for(const id of ids){
  const {excellent,legendary}=GAME_COIN_TARGETS[id];
  assert.equal(legendary,excellent*2,id+' exige uma pontuação realmente alta');
  assert.equal(gameCoinReward(id,legendary-1),10,id+' não concede 15 moedas cedo demais');
  assert.equal(gameCoinReward(id,legendary),15,id+' libera 15 ao atingir a meta');
  assert.equal(gameCoinReward(id,1e9),15,id+' possui limite absoluto mesmo com pontos enormes');
 }
 assert.equal(gameCoinReward('fruitmerge',299),10);
 assert.equal(gameCoinReward('fruitmerge',300),15);
 assert.equal(gameCoinReward('match3',1999),10);
 assert.equal(gameCoinReward('match3',2000),15);
});
