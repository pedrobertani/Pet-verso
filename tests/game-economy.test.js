import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameCoinReward,gameIntelligenceReward,GAME_COIN_TARGETS,GAME_BONUS_20_TARGETS,MAX_GAME_COINS} from '../src/game-economy.js';

const ids=['memory','sequence','food','fruitmerge','runner','puzzle','hide','flight','words','blocks','match3'];

test('todos os 11 minijogos têm metas específicas crescentes',()=>{
 assert.equal(MAX_GAME_COINS,20);
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
test('recompensas respeitam faixas de 5, 8, 10, 15 e 20 moedas',()=>{
 for(const id of ids.filter(id=>id!=='puzzle')){
  const {good,excellent,legendary}=GAME_COIN_TARGETS[id];
  const bonus=GAME_BONUS_20_TARGETS[id];
  for(const [score,expected] of [[0,0],[1,5],[good,8],[excellent,10],[legendary,15],[bonus,20],[1e12,20],[-1,0],[NaN,0],[Infinity,0]]){
   assert.equal(gameCoinReward(id,score),expected,id+' score='+score);
  }
 }
 assert.equal(gameCoinReward('puzzle',0,0),0);
 assert.equal(gameCoinReward('puzzle',0,1),10);
 assert.equal(gameCoinReward('puzzle',0,3),15);
 assert.equal(gameCoinReward('puzzle',0,6),20);
});
test('desempenho relativo de jogos diferentes',()=>{
 assert.equal(gameCoinReward('flight',65),5);
 assert.equal(gameCoinReward('match3',65),5);
 assert.equal(gameCoinReward('words',160),5);
 assert.equal(gameCoinReward('blocks',160),5);
});
test('jogos sem metas conhecidas mantêm limite de 15 moedas',()=>{
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

test('bônus de 20 moedas exige a meta especial',()=>{
 for(const [id,bonus] of Object.entries(GAME_BONUS_20_TARGETS)){
  assert.equal(gameCoinReward(id,bonus-1),15,id+' antes do bônus');
  assert.equal(gameCoinReward(id,bonus),20,id+' na meta especial');
 }
 assert.equal(gameCoinReward('match3',15000),20);
});
