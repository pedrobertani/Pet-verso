import test from 'node:test';
import assert from 'node:assert/strict';
import {prototypeDifficulty,levelBand,levelReward,findMatches,canPlace,findAvailableMatch3Swap,reshuffleMatch3Board} from '../src/prototype-games.js';

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

test('um tabuleiro sem combinações possíveis é detectado corretamente',()=>{
 const names=['A','B','C','D','E'];
 const dead=Array.from({length:6},(_,r)=>Array.from({length:6},(_,col)=>names[(r+col)%names.length]));
 const snapshot=structuredClone(dead);
 assert.equal(findMatches(dead).size,0,'não há trincas já formadas');
 assert.equal(findAvailableMatch3Swap(dead),null,'nenhuma troca adjacente cria trinca');
 assert.deepEqual(dead,snapshot,'a busca não altera o tabuleiro');
 const playable=reshuffleMatch3Board(dead);
 assert.equal(findMatches(playable).size,0,'embaralhar não pode criar trincas grátis');
 assert.ok(findAvailableMatch3Swap(playable),'embaralhar precisa garantir uma jogada possível');
 assert.deepEqual(dead,snapshot,'o tabuleiro antigo não pode ser alterado durante o embaralhamento');
});
test('embaralhar 6x6, 7x7 e 8x8 sempre preserva tabuleiros válidos e jogáveis',()=>{
 for(const size of [6,7,8])for(let iteration=0;iteration<100;iteration++){
  const input=Array.from({length:size},()=>Array.from({length:size},()=>['A','B','C','D','E','F'][Math.floor(Math.random()*6)]));
  const output=reshuffleMatch3Board(input);
  assert.equal(output.length,size);
  assert.equal(output.flat().length,size*size);
  assert.equal(findMatches(output).size,0,'não deve começar com match pronto');
  const move=findAvailableMatch3Swap(output);
  assert.ok(move,'sem jogadas em '+size+'x'+size+', tentativa '+iteration);
  assert.equal(Math.abs(move.from[0]-move.to[0])+Math.abs(move.from[1]-move.to[1]),1);
 }
});
test('detector encontra uma troca adjacente que realmente forma três',()=>{
 const board=[
  ['A','B','A','C','D','E'],
  ['B','A','C','D','E','B'],
  ['C','D','E','A','B','C'],
  ['D','E','B','C','D','E'],
  ['E','B','C','D','E','A'],
  ['B','C','D','E','A','B']
 ];
 const old=structuredClone(board),swap=findAvailableMatch3Swap(board);
 assert.ok(swap,'deve encontrar a combinação de três');
 assert.deepEqual(board,old,'o detector precisa restaurar o tabuleiro');
 const [a,b]=[swap.from,swap.to];
 [board[a[0]][a[1]],board[b[0]][b[1]]]=[board[b[0]][b[1]],board[a[0]][a[1]]];
 assert.ok(findMatches(board).size>=3,'a troca encontrada precisa combinar três ou mais');
});
