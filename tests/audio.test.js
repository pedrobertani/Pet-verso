import {test} from 'node:test';import assert from 'node:assert/strict';import {createAudio,readPreferences} from '../src/audio.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('preferências sobrevivem ao reinício, valores inválidos usam padrões',()=>{const s=storage();s.setItem('petverso-settings-v1','broken');assert.equal(readPreferences(s).effects,true);const a=createAudio({storage:s,contextFactory:()=>{throw Error();}});a.update({dark:true,muted:true,music:true,ambient:false,volume:.25});const b=createAudio({storage:s});assert.deepEqual(b.preferences,a.preferences);a.update({volume:200});assert.equal(a.preferences.volume,1);a.dispose();b.dispose();});
test('silencioso corta todos os canais; ambiente e efeitos têm controles independentes',()=>{const gains=[],sources=[];const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});const source=()=>{const s={frequency:param(),connect(){},disconnect(){},start(){},stop(){this.stopped=true;},stopped:false};sources.push(s);return s;};const ctx={currentTime:0,sampleRate:100,createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g;},createOscillator:source,createBuffer:()=>({getChannelData:()=>new Float32Array(100)}),createBufferSource:source,createBiquadFilter:()=>({frequency:param(),connect(){},disconnect(){}}),resume:()=>Promise.resolve(),suspend:()=>Promise.resolve(),close:()=>Promise.resolve()};const a=createAudio({storage:storage(),contextFactory:()=>ctx});a.unlock();a.sound('feed');assert.equal(sources.length,3);a.update({effects:false});a.sound('win');assert.equal(sources.length,3);a.startWater();assert.equal(sources.length,4);a.update({muted:true});assert.equal(gains[0].gain.value,0);assert.ok(sources[3].stopped);a.sound('win');assert.equal(sources.length,4);a.update({muted:false,volume:.7});assert.equal(gains[0].gain.value,.7);a.setHidden(true);assert.equal(gains[0].gain.value,0);a.dispose();});

test('rugidos do rex e leão geram áudio audível e sem estalos de osciladores extras',()=>{
 const created=[],oscillators=[],param=()=>({value:0,setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 const source=()=>{const o={connect(){},disconnect(){},start(){this.started=true;},stop(){},started:false};created.push(o);return o;};
 const ctx={currentTime:0,sampleRate:8000,
  createGain:()=>({gain:param(),connect(){},disconnect(){}}),
  createOscillator:()=>{oscillators.push(true);return {...source(),frequency:param()};},
  createBuffer:(channels,length)=>{const data=new Float32Array(length);return {getChannelData:()=>data};},
  createBufferSource:source,
  createBiquadFilter:()=>({frequency:param(),connect(){},disconnect(){}}),
  resume:()=>Promise.resolve(),suspend:()=>Promise.resolve(),close:()=>Promise.resolve()
 };
 const player=createAudio({storage:storage(),contextFactory:()=>ctx});player.unlock();
 for(const name of ['lion-roar','dino-roar']){
  player.sound(name);
  const last=created.at(-1);
  assert.equal(last.started,true);
  assert.ok(last.buffer);
  const data=last.buffer.getChannelData(0),rms=Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length);
  assert.ok(rms>.06,name+' is nearly silent');
  assert.ok(Math.max(...data.slice(0,200))<.6,name+' begins with an abrupt peak');
  assert.ok(Math.max(...data.slice(-200))<.6,name+' ends with an abrupt peak');
 }
 assert.equal(oscillators.length,0,'no sharp oscillator notes should precede the roar');
 player.dispose();
});
