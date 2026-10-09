import test from 'node:test';import assert from 'node:assert/strict';import {fresh,activeSpecies,tick} from '../src/engine.js';import {tricks,startTrick,trickState,stegoReturnFrames,stegoTurnFrames} from '../src/pet-tricks.js';
test('todas as espécies possuem truque; 50 libera e cooldown persiste no tick',()=>{for(const s of activeSpecies){assert.ok(tricks[s.id]);const p=fresh(s.id,'Pet');p.stats.intelligence=49;assert.equal(startTrick(p,1000),false);p.stats.intelligence=50;assert.equal(startTrick(p,1000),true);assert.equal(startTrick(p,1100),false);assert.equal(trickState(p,1100).remaining,15);assert.equal(tick(p,p.last+100).skills.trickUntil,16000);assert.equal(startTrick(p,16000),true);}});
test('sono e morte não gastam o cooldown',()=>{const p=fresh('pets-1','Pet');p.stats.intelligence=100;p.sleeping=true;assert.equal(startTrick(p),false);assert.equal(p.skills,undefined);p.sleeping=false;p.dead=true;assert.equal(startTrick(p),false);});

test('estegossauro vira antes dos três saltos e termina no ponto inicial',()=>{
 const peaks=stegoReturnFrames.filter(frame=>frame.translate?.endsWith('-18px'));
 assert.equal(peaks.length,3);
 assert.ok(peaks.every(frame=>frame.offset>.3&&frame.offset<.74));
 assert.ok(stegoTurnFrames.some(frame=>frame.offset<.32&&frame.transform==='scaleX(-1)'));
 assert.ok(stegoTurnFrames.some(frame=>frame.offset>.9&&frame.transform==='scaleX(-1)'));
 assert.equal(stegoReturnFrames.at(-1).translate,'0px 0px');
});
