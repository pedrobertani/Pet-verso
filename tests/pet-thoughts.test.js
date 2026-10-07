import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,care} from '../src/engine.js';import {thoughtNeeds} from '../src/pet-thoughts.js';
test('pensamentos usam necessidades atuais e desaparecem após o cuidado',()=>{
 const p=fresh('pets-1','Pet',1000);p.stats.food=30;assert.deepEqual(thoughtNeeds(p,'living',1000).map(n=>n.id),['food']);
 assert.equal(thoughtNeeds(care(p,'feed'),'living',1000).length,0);
 p.stats.energy=15;p.stats.hygiene=45;assert.deepEqual(thoughtNeeds(p,'living',1000).map(n=>n.id),['sleep']);
});
test('sono, morte e banho não exibem pedidos; carinho e quintal respeitam o cuidado recente',()=>{
 const p=fresh('pets-1','Pet',1000),now=1000+61*60000;
 assert.deepEqual(thoughtNeeds(p,'living',now).map(n=>n.id),['affection','outdoors']);
 p.last=now;const loved=care(p,'pet');assert.ok(!thoughtNeeds(loved,'living',now).some(n=>n.id==='affection'));
 loved.stats.joy=80;loved.social.outdoors=now;assert.equal(thoughtNeeds(loved,'living',now).length,0);
 for(const flag of ['sleeping','dead'])assert.equal(thoughtNeeds({...p,[flag]:true},'living',now).length,0);
 assert.equal(thoughtNeeds(p,'bathroom',now).length,0);assert.ok(!thoughtNeeds(p,'garden',now).some(n=>n.id==='outdoors'));
});
