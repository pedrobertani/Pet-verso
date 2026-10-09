import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameCoinReward,gameIntelligenceReward,GAME_COIN_TARGETS,MAX_GAME_COINS} from '../src/game-economy.js';

const ids=['memory','sequence','food','fruitmerge','runner','puzzle','hide','flight','words','blocks','match3'];

test('todos os 11 minijogos têm metas específicas crescentes',()=>{
 assert.equal(MAX_GAME_COINS,10);
 assert.deepEqual(Object.keys(GAME_COIN_TARGETS).sort(),ids.sort());
 const pairs=new Set();
 for(const id of ids){
  const {good,excellent}=GAME_COIN_TARGETS[id];
  assert.ok(Number.isInteger(good)&&Number.isInteger(excellent));
  assert.ok(0<good&&good<excellent,id+' deve ter metas válidas');
  pairs.add(good+':'+excellent);
 }
 assert.ok(pairs.size>=8,'jogos diferentes precisam de metas adaptadas');
});
test('recompensa por partida sempre fica entre 0 e 10',()=>{
 for(const id of ids){
  const {good,excellent}=GAME_COIN_TARGETS[id];
  const points=[-30,0,1,good-1,good,excellent-1,excellent,100000,1e12,NaN,Infinity,-Infinity];
  for(const score of points){
   const value=gameCoinReward(id,score);
   assert.ok([0,5,8,10].includes(value),id+' score='+score);
   if(score<=0||!Number.isFinite(score))assert.equal(value,0);
   if(score===good)assert.equal(value,8);
   if(score===excellent||score===1e12)assert.equal(value,10);
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
 assert.equal(gameCoinReward('unknown',1000000),10);
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
