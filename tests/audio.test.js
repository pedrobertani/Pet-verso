import {test} from 'node:test';import assert from 'node:assert/strict';import {createAudio,readPreferences,roarAssets} from '../src/audio.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('preferências sobrevivem ao reinício, valores inválidos usam padrões',()=>{const s=storage();s.setItem('petverso-settings-v1','broken');assert.equal(readPreferences(s).effects,true);const a=createAudio({storage:s,contextFactory:()=>{throw Error();}});a.update({dark:true,muted:true,music:true,ambient:false,volume:.25});const b=createAudio({storage:s});assert.deepEqual(b.preferences,a.preferences);a.update({volume:200});assert.equal(a.preferences.volume,1);a.dispose();b.dispose();});
test('silencioso corta todos os canais; ambiente e efeitos têm controles independentes',()=>{const gains=[],sources=[];const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});const source=()=>{const s={frequency:param(),connect(){},disconnect(){},start(){},stop(){this.stopped=true;},stopped:false};sources.push(s);return s;};const ctx={currentTime:0,sampleRate:100,createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g;},createOscillator:source,createBuffer:()=>({getChannelData:()=>new Float32Array(100)}),createBufferSource:source,createBiquadFilter:()=>({frequency:param(),connect(){},disconnect(){}}),resume:()=>Promise.resolve(),suspend:()=>Promise.resolve(),close:()=>Promise.resolve()};const a=createAudio({storage:storage(),contextFactory:()=>ctx});a.unlock();a.sound('feed');assert.equal(sources.length,3);a.update({effects:false});a.sound('win');assert.equal(sources.length,3);a.startWater();assert.equal(sources.length,4);a.update({muted:true});assert.equal(gains[0].gain.value,0);assert.ok(sources[3].stopped);a.sound('win');assert.equal(sources.length,4);a.update({muted:false,volume:.7});assert.equal(gains[0].gain.value,.7);a.setHidden(true);assert.equal(gains[0].gain.value,0);a.dispose();});

test('leão e T-Rex usam arquivos OGG locais, sem ruído sintetizado',()=>{
 const oscillators=[],players=[];
 const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}});
 const ctx={currentTime:0,createGain:()=>({gain:param(),connect(){},disconnect(){}}),
  createOscillator:()=>{oscillators.push(true);return {frequency:param(),connect(){},disconnect(){},start(){},stop(){}};},
  resume:()=>Promise.resolve(),suspend:()=>Promise.resolve(),close:()=>Promise.resolve()};
 const player=createAudio({
  storage:storage(),contextFactory:()=>ctx,
  audioFactory:src=>{const sample={src,volume:0,currentTime:0,playbackRate:1,preload:'',
   calls:0,pauses:0,play(){this.calls++;return Promise.resolve();},pause(){this.pauses++;},
   removeAttribute(){},load(){}};players.push(sample);return sample;}
 });
 player.unlock();
 player.sound('lion-roar');
 player.sound('dino-roar');
 assert.equal(players.length,2);
 assert.equal(players[0].src,roarAssets['lion-roar']);
 assert.match(players[0].src,/^\/audio\/lion-roar\.mp3$/);
 assert.equal(players[1].src,roarAssets['dino-roar']);
 assert.match(players[1].src,/^\/audio\/trex-roar\.mp3$/);
 assert.equal(players[0].calls,1);
 assert.equal(players[1].calls,1);
 assert.ok(players[0].volume>.5);
 assert.equal(players[1].playbackRate,1);
 player.sound('lion-roar');
 assert.equal(players.length,2,'should reuse the loaded player for repeated roars');
 assert.equal(players[0].calls,2);
 assert.equal(oscillators.length,0,'roars must not produce synthetic hiss');
 player.update({effects:false});
 assert.equal(players[0].volume,0);
 assert.ok(players.every(p=>p.pauses>0));
 player.update({effects:true,volume:.3});
 player.sound('lion-roar');
 assert.equal(players[0].volume,.42);
 player.setHidden(true);
 assert.equal(players[0].volume,0);
 player.dispose();
});
