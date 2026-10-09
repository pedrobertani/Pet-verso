import test from 'node:test';
import assert from 'node:assert/strict';
import {prototypeDifficulty,levelBand,levelReward,findMatches,canPlace} from '../src/prototype-games.js';

test('difficulty grows gradually and remains bounded',()=>{
  const early=prototypeDifficulty('sorting',1),middle=prototypeDifficulty('sorting',12),late=prototypeDifficulty('sorting',40);
  assert.ok(early.items<middle.items);assert.ok(middle.items<=late.items);assert.equal(late.categories,4);assert.equal(late.lives,1);
  assert.ok(prototypeDifficulty('hidden',1).seconds>prototypeDifficulty('hidden',20).seconds);
  assert.equal(prototypeDifficulty('match3',99).size,8);
  assert.ok(prototypeDifficulty('match3',99).moves>=13);
});

test('level labels and rewards support a long progression',()=>{
  assert.equal(levelBand(1),'Iniciante');assert.equal(levelBand(10),'Aprendiz');assert.equal(levelBand(20),'Experiente');assert.equal(levelBand(30),'Mestre');
  assert.ok(levelReward(20)>levelReward(1));assert.ok(levelReward(99)<=300);
});

test('match finder detects horizontal and vertical runs',()=>{
  const board=[['A','A','A','B'],['C','D','A','B'],['C','D','A','B'],['E','F','G','H']];
  const hits=findMatches(board);assert.ok(hits.has('0,0'));assert.ok(hits.has('0,2'));assert.ok(hits.has('2,2'));assert.ok(hits.has('2,3'));assert.equal(hits.size,8);
});

test('block placement respects occupied cells and board limits',()=>{
  const board=Array.from({length:4},()=>Array(4).fill(0)),shape=[[0,0],[1,0],[0,1]];board[1][1]=1;
  assert.equal(canPlace(board,shape,0,0),true);assert.equal(canPlace(board,shape,1,1),false);assert.equal(canPlace(board,shape,3,3),false);
});
