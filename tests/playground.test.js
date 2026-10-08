import test from 'node:test';import assert from 'node:assert/strict';
import {activeSpecies,fresh,buy,shop} from '../src/engine.js';
import {toyFor,toyArt} from '../src/park-toys.js';
import {environmentFor,environmentArt} from '../src/park-environments.js';
test('cada espécie possui um ambiente e brinquedo grátis',()=>{for(const s of activeSpecies){assert.ok(environmentFor(s.id).pets.includes(s.id));assert.equal(toyFor(s.id).price,0);assert.ok(toyArt(s.id).includes('<svg'));const p=fresh(s.id,'Pet');p.coins=0;const n=buy(p,toyFor(s.id).id);assert.equal(n.equipped['park-toy'],toyFor(s.id).id);assert.equal(n.coins,0);}});
test('brinquedo de outra espécie não altera dinheiro ou equipamento',()=>{const p=fresh('pets-0','Pet');assert.deepEqual(buy(p,toyFor('pets-mouse').id),p);});
test('modo noturno troca o sol pela lua e mantém o aquário sem sol',()=>{for(const s of activeSpecies){const svg=environmentArt(environmentFor(s.id).id,{night:true});assert.ok(!svg.includes('cx="300" cy="53" r="21"'));}assert.equal(shop.filter(i=>i.species==='pets-0').length,1);});
