// Interface tones are procedural; species roars are locally bundled CC0 recordings.
export const roarAssets={
 'lion-roar':'/audio/lion-roar.ogg',
 'dino-roar':'/audio/trex-roar.ogg'
};
const defaults={effects:true,music:false,volume:0.45,motion:true,ambient:true,muted:false,dark:false};
export function readPreferences(storage){try{const p=JSON.parse(storage.getItem('petverso-settings-v1')||'{}');return {ambient:typeof p.ambient==='boolean'?p.ambient:defaults.ambient,muted:p.muted===true,dark:p.dark===true,effects:typeof p.effects==='boolean'?p.effects:defaults.effects,music:typeof p.music==='boolean'?p.music:defaults.music,volume:Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):defaults.volume,motion:typeof p.motion==='boolean'?p.motion:defaults.motion};}catch{return {...defaults};}}
export function createAudio({storage=localStorage,contextFactory=()=>new (window.AudioContext||window.webkitAudioContext)(),audioFactory=src=>new Audio(src)}={}){
 let prefs=readPreferences(storage),ctx,master,effects,music,ambient,unlocked=false,hidden=false,timer=null,beat=0,water=null,ambientTimer=null,environment='living';
 const sources=new Set(),roarPlayers=new Map();
 const roarVolume=()=>hidden||prefs.muted||!prefs.effects?0:Math.min(1,prefs.volume*1.4);
 const silenceRoars=()=>{for(const player of roarPlayers.values())try{player.pause();}catch{}};
 function setup(){if(ctx)return true;try{ctx=contextFactory();master=ctx.createGain();effects=ctx.createGain();music=ctx.createGain();ambient=ctx.createGain();effects.connect(master);music.connect(master);ambient.connect(master);master.connect(ctx.destination);apply();return true;}catch{return false;}}
 function apply(){if(ctx){master.gain.value=hidden||prefs.muted?0:prefs.volume;effects.gain.value=prefs.effects?0.3:0;music.gain.value=prefs.music?0.055:0;ambient.gain.value=prefs.ambient?.07:0;}for(const player of roarPlayers.values()){player.volume=roarVolume();if(!player.volume)player.pause();}}
 function tone(freq,at,duration=0.12,type='sine',bus=effects,end=freq){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(0.65,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(bus);sources.add(o);o.onended=()=>{sources.delete(o);o.disconnect();g.disconnect();};o.start(at);o.stop(at+duration+.03);}
 function stopMusic(){clearInterval(timer);timer=null;}
 function startMusic(){stopMusic();if(!ctx||!unlocked||!prefs.music||prefs.muted||hidden)return;const notes=[523.25,659.25,783.99,659.25,587.33,659.25,523.25,0,440,523.25,659.25,523.25,392,440,523.25,0];const play=()=>{const f=notes[beat++%notes.length];if(f)tone(f,ctx.currentTime,.48,'sine',music);};play();timer=setInterval(play,650);}
 function unlock(){if(hidden||!setup())return;const first=!unlocked;unlocked=true;ctx.resume()?.catch(()=>{});if(first){startMusic();startAmbient();}}
 function sound(name='tap'){if(!unlocked||hidden||prefs.muted||!prefs.effects||!ctx)return;const t=ctx.currentTime;
 if(roarAssets[name]){
 // Play a pre-recorded file, not filtered random noise. Cached per species;
 // the browser can serve bundled OGG files even when the device is offline.
 let player=roarPlayers.get(name);
 if(!player){
  try{player=audioFactory(roarAssets[name]);player.preload='auto';roarPlayers.set(name,player);}
  catch{return;}
 }
 try{
  player.pause();player.currentTime=0;
  player.playbackRate=name==='dino-roar'?.88:1;
  player.volume=roarVolume();
  const result=player.play();result?.catch?.(()=>{});
 }catch{}
 return;
 }
 const patterns={tap:[660],feed:[240,300,220],pet:[660,880],soap:[390,520,650],clean:[500,780],sleep:[520,390,260],wake:[390,520,780],win:[523,659,784,1047],buy:[784,1047],match:[659,880],wrong:[220,170],jump:[300],adopt:[523,659,784,1047]};
 (patterns[name]||patterns.tap).forEach((f,i)=>tone(f,t+i*.09,name==='jump'?.18:.12,name==='feed'?'triangle':'sine',effects,name==='jump'?700:f));}
 function stopWater(){if(!water)return;try{water.source.stop();}catch{}water.source.disconnect();water.filter.disconnect();water.gain.disconnect();water=null;}
 function startWater(){stopWater();if(!ctx||!unlocked||hidden||prefs.muted||!prefs.ambient)return;const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.35;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1400;gain.gain.value=.3;source.connect(filter);filter.connect(gain);gain.connect(ambient);source.start();water={source,filter,gain};}
 function update(patch){prefs={...prefs,...patch};prefs.volume=Math.max(0,Math.min(1,Number(prefs.volume)||0));try{storage.setItem('petverso-settings-v1',JSON.stringify(prefs));}catch{}apply();if(!prefs.ambient||prefs.muted)stopWater();if('music' in patch||'muted' in patch)startMusic();if('ambient' in patch||'muted' in patch)startAmbient();return {...prefs};}
 function setHidden(value){hidden=value;apply();if(hidden){stopMusic();stopAmbient();stopWater();for(const source of sources)try{source.stop();}catch{}ctx?.suspend()?.catch(()=>{});}else if(unlocked){ctx?.resume()?.catch(()=>{});startMusic();startAmbient();}}
 function stopAmbient(){clearInterval(ambientTimer);ambientTimer=null;}
 function startAmbient(){stopAmbient();if(!ctx||!unlocked||hidden||prefs.muted||!prefs.ambient||environment==='bathroom')return;ambientTimer=setInterval(()=>{const f=environment==='bedroom'?390:1300;tone(f,ctx.currentTime,.13,'sine',ambient,f*1.25);tone(f*1.2,ctx.currentTime+.2,.16,'sine',ambient,f);},8000);}
 function setEnvironment(room){if(environment===room)return;environment=room;startAmbient();}
 function dispose(){stopAmbient();stopMusic();stopWater();silenceRoars();for(const player of roarPlayers.values())try{player.removeAttribute?.('src');player.load?.();}catch{}roarPlayers.clear();for(const s of sources)try{s.stop();}catch{}ctx?.close()?.catch(()=>{});}
 return {get preferences(){return {...prefs};},unlock,sound,update,startWater,stopWater,setHidden,setEnvironment,dispose};
}
