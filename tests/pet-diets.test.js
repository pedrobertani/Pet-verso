import test from 'node:test';import assert from 'node:assert/strict';
import {species,activeSpecies,fresh} from '../src/engine.js';
import {dietGroups,diets,foodIcon} from '../src/pet-diets.js';
import {thoughtNeeds} from '../src/pet-thoughts.js';import {colorfulIcon} from '../src/icons.js';
test('cada espécie tem exatamente um tipo alimentar, inclusive saves antigos',()=>{
 const ids=Object.values(dietGroups).flat();assert.equal(new Set(ids).size,ids.length);
 for(const s of species){assert.ok(ids.includes(s.id),s.id);assert.ok(diets[s.diet]);assert.ok(colorfulIcon(foodIcon(s.id)));}
 assert.equal(activeSpecies.length,25);
});
test('pensamento de fome usa a mesma comida da espécie',()=>{
 for(const id of ['selva-0','pets-2','pets-1']){const p=fresh(id,'Pet');p.stats.food=30;assert.equal(thoughtNeeds(p,'living')[0].icon,foodIcon(id));}
 assert.equal(foodIcon('selva-0'),'chicken');assert.equal(foodIcon('pets-2'),'leaf');assert.equal(foodIcon('pets-1'),'apple');
});
