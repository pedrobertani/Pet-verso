import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reward,buy,valid} from '../src/engine.js';
test('partidas longas acumulam pontos acima de 100 e preservam o maior recorde',()=>{
 let p=fresh('pets-0','Mimi');p=reward(p,650,false,'runner');
 assert.equal(p.totalPoints,650);assert.equal(p.records.runner,650);assert.equal(p.lastEarning,10,'partida excelente respeita teto de 10 moedas');
 p=reward(p,180,false,'runner');assert.equal(p.totalPoints,830);assert.equal(p.records.runner,650);
 p=reward(p,240,false,'food');assert.equal(p.records.food,240);assert.equal(p.totalPoints,1070);assert.equal(valid(p),true);
});
test('saves anteriores recebem recordes e pontos sem perder moedas',()=>{
 let p=fresh('pets-0','Mimi');delete p.totalPoints;delete p.records;p=reward(p,400,true,'memory');
 assert.equal(p.totalPoints,400);assert.equal(p.records.memory,400);assert.equal(p.coins,50,'save antigo recebe somente 10 moedas por partida excelente');
});
test('móveis de sala e quintal coexistem e reequipar não cobra de novo',()=>{
 let p=fresh('pets-0','Mimi');p.coins=2000;for(const id of ['sofa','shelf','swing','slide'])p=buy(p,id);
 assert.equal(p.equipped.sofa,'sofa');assert.equal(p.equipped.shelf,'shelf');assert.equal(p.equipped['garden-swing'],'swing');assert.equal(p.equipped['garden-slide'],'slide');
 const coins=p.coins;p=buy(p,'swing');assert.equal(p.coins,coins);assert.equal(p.inventory.length,4);
});
