import {tick,valid} from './engine.js';

export const MULTI_PET_REVISION=2;
export const EXTRA_PET_PRICE=5000;
export const MAX_PETS=3;

const clone=value=>structuredClone(value);

export function normalizeCollection(raw,now=Date.now()){
 if(valid(raw)){
  const pet=tick(raw,now);
  return {revision:MULTI_PET_REVISION,wallet:pet.coins,activeBorn:pet.born,pets:[pet]};
 }
 if(raw?.revision!==MULTI_PET_REVISION||!Array.isArray(raw.pets)||!raw.pets.length)return null;
 const pets=raw.pets.filter(valid).map(p=>tick(p,now));
 if(!pets.length)return null;
 const wallet=Math.max(0,Math.floor(Number.isFinite(raw.wallet)?raw.wallet:pets[0].coins||0));
 for(const pet of pets)pet.coins=wallet;
 const activeBorn=pets.some(p=>p.born===raw.activeBorn)?raw.activeBorn:pets[0].born;
 return {revision:MULTI_PET_REVISION,wallet,activeBorn,pets};
}

export function activePet(collection){
 return collection?.pets.find(p=>p.born===collection.activeBorn)||collection?.pets[0]||null;
}

export function saveActive(collection,pet){
 if(!collection||!pet)return collection;
 const next=clone(collection),index=next.pets.findIndex(p=>p.born===pet.born);
 next.wallet=Math.max(0,Math.floor(pet.coins));
 const saved={...clone(pet),coins:next.wallet};
 if(index<0)next.pets.push(saved);else next.pets[index]=saved;
 for(const item of next.pets)item.coins=next.wallet;
 next.activeBorn=saved.born;
 return next;
}

export function refreshCollection(collection,now=Date.now()){
 if(!collection)return null;
 const next=clone(collection);
 next.pets=next.pets.map(p=>({...tick(p,now),coins:next.wallet}));
 return next;
}

export function switchActive(collection,born){
 if(!collection?.pets.some(p=>p.born===born))return collection;
 return {...clone(collection),activeBorn:born};
}

export function adoptionPrice(collection){
 return (collection?.pets.length||0)<2?0:EXTRA_PET_PRICE;
}

export function addPet(collection,pet){
 if(!valid(pet))return {ok:false,reason:'invalid',collection};
 if((collection?.pets.length||0)>=MAX_PETS)return {ok:false,reason:'limit',collection};
 const price=adoptionPrice(collection);
 if((collection?.wallet||0)<price)return {ok:false,reason:'coins',price,collection};
 const next=clone(collection);
 next.wallet-=price;
 const adopted={...clone(pet),coins:next.wallet};
 next.pets.push(adopted);
 next.activeBorn=adopted.born;
 for(const item of next.pets)item.coins=next.wallet;
 return {ok:true,price,collection:next};
}

export function removePet(collection,born){
 if(!collection||collection.pets.length<=1||!collection.pets.some(p=>p.born===born))return {ok:false,collection};
 const next=clone(collection);next.pets=next.pets.filter(p=>p.born!==born);
 if(next.activeBorn===born)next.activeBorn=next.pets[0].born;
 for(const pet of next.pets)pet.coins=next.wallet;
 return {ok:true,collection:next};
}

export function needyPets(collection,activeBorn){
 const priority=[['health',p=>p.ill||p.stats.health<40],['food',p=>p.stats.food<40],['hygiene',p=>p.stats.hygiene<40||p.waste>0],['energy',p=>!p.sleeping&&p.stats.energy<35],['joy',p=>!p.sleeping&&p.stats.joy<40]];
 return (collection?.pets||[]).filter(p=>p.born!==activeBorn&&!p.dead).map(p=>{
  const need=priority.find(([,test])=>test(p));
  return need?{pet:p,need:need[0]}:null;
 }).filter(Boolean).sort((a,b)=>priority.findIndex(x=>x[0]===a.need)-priority.findIndex(x=>x[0]===b.need));
}
