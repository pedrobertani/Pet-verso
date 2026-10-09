import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../src/engine.js';
import {normalizeCollection,activePet,saveActive,switchActive,adoptionPrice,addPet,removePet,needyPets,MAX_PETS} from '../src/pet-collection.js';

test('migra o save antigo sem perder progresso, itens ou moedas',()=>{
 const old=fresh('pets-0','Lua',1000);old.coins=432;old.stats.intelligence=37;old.inventory=['bed-cloud'];
 const collection=normalizeCollection(old,1000);
 assert.equal(collection.revision,2);assert.equal(collection.wallet,432);assert.equal(activePet(collection).name,'Lua');
 assert.equal(activePet(collection).stats.intelligence,37);assert.deepEqual(activePet(collection).inventory,['bed-cloud']);
});

test('segundo pet é gratuito e terceiro custa cinco mil moedas',()=>{
 let collection=normalizeCollection(fresh('pets-0','Lua',1000),1000);collection.wallet=5000;collection.pets[0].coins=5000;
 assert.equal(adoptionPrice(collection),0);
 let result=addPet(collection,fresh('dinos-0','Rex',2000));assert.equal(result.ok,true);assert.equal(result.collection.wallet,5000);
 assert.equal(adoptionPrice(result.collection),5000);
 result=addPet(result.collection,fresh('selva-0','Léo',3000));assert.equal(result.ok,true);assert.equal(result.collection.wallet,0);
 assert.ok(result.collection.pets.every(p=>p.coins===0));
});

test('carteira é compartilhada mas progresso e móveis continuam individuais',()=>{
 let collection=normalizeCollection(fresh('pets-0','Lua',1000),1000);collection.wallet=100;collection.pets[0].coins=100;
 collection=addPet(collection,fresh('dinos-0','Rex',2000)).collection;
 let rex=activePet(collection);rex.stats.intelligence=25;rex.inventory=['rug-rainbow'];rex.coins=87;
 collection=saveActive(collection,rex);collection=switchActive(collection,1000);
 const lua=activePet(collection);
 assert.equal(lua.coins,87);assert.equal(lua.stats.intelligence,0);assert.deepEqual(lua.inventory,[]);
 collection=switchActive(collection,2000);assert.equal(activePet(collection).stats.intelligence,25);assert.deepEqual(activePet(collection).inventory,['rug-rainbow']);
});

test('aviso prioriza saúde e ignora energia de pet dormindo',()=>{
 let collection=normalizeCollection(fresh('pets-0','Lua',1000),1000);collection=addPet(collection,fresh('dinos-0','Rex',2000)).collection;
 const rex=activePet(collection);rex.sleeping=true;rex.stats.energy=5;rex.stats.health=30;collection=saveActive(collection,rex);collection=switchActive(collection,1000);
 const alerts=needyPets(collection,1000);assert.equal(alerts.length,1);assert.equal(alerts[0].need,'health');
});


test('coleção aceita no máximo três pets e remoção preserva a carteira',()=>{
 let collection=normalizeCollection(fresh('pets-0','Lua',1000),1000);collection.wallet=10000;collection.pets[0].coins=10000;
 collection=addPet(collection,fresh('dinos-0','Rex',2000)).collection;
 collection=addPet(collection,fresh('selva-0','Léo',3000)).collection;
 assert.equal(collection.pets.length,MAX_PETS);
 const blocked=addPet(collection,fresh('pets-1','Bolt',4000));assert.equal(blocked.ok,false);assert.equal(blocked.reason,'limit');
 const removed=removePet(collection,3000);assert.equal(removed.ok,true);assert.equal(removed.collection.pets.length,2);
 assert.equal(removed.collection.wallet,5000);assert.ok(removed.collection.pets.every(p=>p.coins===5000));
 assert.equal(removePet(normalizeCollection(fresh('pets-0','Único',5000),5000),5000).ok,false);
});
