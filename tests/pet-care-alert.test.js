import test from 'node:test';
import assert from 'node:assert/strict';
import {petCareSignal} from '../src/pet-care-alert.js';

test('cada necessidade mostra um pensamento curto e identificável',()=>{
 const expectations=[
  ['food','🍗','Estou com fome'],
  ['hygiene','🚿','Quero um banho'],
  ['energy','💤','Quero dormir'],
  ['joy','🧸','Quero brincar'],
  ['health','❤️','Preciso de cuidados']
 ];
 for(const [need,icon,label] of expectations){
  assert.deepEqual(petCareSignal(need,{ill:false,waste:0}),{icon,label},need);
 }
});
test('doença e sujeira têm prioridade visual dentro da própria categoria',()=>{
 assert.deepEqual(petCareSignal('health',{ill:true}),{icon:'💊',label:'Preciso de remédio'});
 assert.deepEqual(petCareSignal('hygiene',{waste:2}),{icon:'🧹',label:'Preciso de limpeza'});
});
test('necessidade desconhecida não quebra o seletor',()=>{
 assert.deepEqual(petCareSignal('unexpected'),{icon:'💗',label:'Preciso de atenção'});
});
