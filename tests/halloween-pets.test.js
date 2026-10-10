import test from 'node:test';
import assert from 'node:assert/strict';
import {activeSpecies,fresh,valid,shop} from '../src/engine.js';
import {petDrawing} from '../src/pets.js';
import {environmentFor} from '../src/park-environments.js';
import {toyFor,toyArt,toyLayout} from '../src/park-toys.js';
import {tricks,startTrick,TRICK_INTELLIGENCE} from '../src/pet-tricks.js';
import {parkActions,startParkAction,PARK_INTELLIGENCE} from '../src/park-actions.js';

const pets=[['sombrios-frankie','short-circuit','lightning-generator'],['sombrios-6','bandage-whirl','sand-tsunami']];
for(const [id,trick,toy] of pets){
 test(`Halloween ${id}: adoção, arte e fases`,()=>{
  const species=activeSpecies.find(s=>s.id===id);
  assert.ok(species,'espécie deve estar ativa');
  assert.ok(valid(fresh(id,species.name)));
  for(const level of [0,1,2]){
   const art=petDrawing({...species,growthLevel:level},'happy');
   assert.match(art,/<svg/);
   for(const part of ['pet-body','pet-head','pet-arm','pet-leg','eyes'])assert.ok(art.includes(part),`${id} fase ${level}: ${part}`);
   assert.equal(art.includes('pet-pacifier'),level===0,`chupeta somente no bebê de ${id}`);
   assert.equal(art.includes('growth-size'),level!==2);
  }
 });
 test(`Halloween ${id}: quintal e brinquedo`,()=>{
  assert.equal(environmentFor(id).id,id==='sombrios-6'?'enchanted-desert':'haunted');
  const item=toyFor(id);assert.ok(item);assert.equal(item.type,toy);assert.equal(item.price,0);
  assert.ok(shop.some(i=>i.id===item.id));
  assert.match(toyArt(id),/<svg/);
  assert.ok(toyLayout(id));
 });
 test(`Halloween ${id}: níveis 50 e 75`,()=>{
  assert.equal(tricks[id][0],trick);assert.equal(parkActions[id],toy);
  const pet=fresh(id,id),now=10000;
  assert.equal(startTrick(pet,now),false);
  pet.stats.intelligence=TRICK_INTELLIGENCE;
  assert.equal(startTrick(pet,now),true);
  assert.equal(startTrick(pet,now),false,'cooldown 50');
  assert.equal(startParkAction(pet,now),false);
  pet.stats.intelligence=PARK_INTELLIGENCE;
  assert.equal(startParkAction(pet,now),true);
  assert.equal(startParkAction(pet,now),false,'cooldown 75');
 });
}
