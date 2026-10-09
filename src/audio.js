// Original procedural sounds: offline, no downloads or copyrighted recordings.
const defaults={effects:true,music:false,volume:0.45,motion:true,ambient:true,muted:false,dark:false};
export function readPreferences(storage){try{const p=JSON.parse(storage.getItem('petverso-settings-v1')||'{}');return {ambient:typeof p.ambient==='boolean'?p.ambient:defaults.ambient,muted:p.muted===true,dark:p.dark===true,effects:typeof p.effects==='boolean'?p.effects:defaults.effects,music:typeof p.music==='boolean'?p.music:defaults.music,volume:Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):defaults.volume,motion:typeof p.motion==='boolean'?p.motion:defaults.motion};}catch{return {...defaults};}}
export function createAudio({storage=localStorage,contextFactory=()=>new (window.AudioContext||window.webkitAudioContext)()}={}){
 let prefs=readPreferences(storage),ctx,master,effects,music,ambient,unlocked=false,hidden=false,timer=null,beat=0,water=null,ambientTimer=null,environment='living';
 const sources=new Set();
 function setup(){if(ctx)return true;try{ctx=contextFactory();master=ctx.createGain();effects=ctx.createGain();music=ctx.createGain();ambient=ctx.createGain();effects.connect(master);music.connect(master);ambient.connect(master);master.connect(ctx.destination);apply();return true;}catch{return false;}}
 function apply(){if(!ctx)return;master.gain.value=hidden||prefs.muted?0:prefs.volume;effects.gain.value=prefs.effects?0.3:0;music.gain.value=prefs.music?0.055:0;ambient.gain.value=prefs.ambient?.07:0;}
 function tone(freq,at,duration=0.12,type='sine',bus=effects,end=freq){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(0.65,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(bus);sources.add(o);o.onended=()=>{sources.delete(o);o.disconnect();g.disconnect();};o.start(at);o.stop(at+duration+.03);}
 function stopMusic(){clearInterval(timer);timer=null;}
 function startMusic(){stopMusic();if(!ctx||!unlocked||!prefs.music||prefs.muted||hidden)return;const notes=[523.25,659.25,783.99,659.25,587.33,659.25,523.25,0,440,523.25,659.25,523.25,392,440,523.25,0];const play=()=>{const f=notes[beat++%notes.length];if(f)tone(f,ctx.currentTime,.48,'sine',music);};play();timer=setInterval(play,650);}
 function unlock(){if(hidden||!setup())return;const first=!unlocked;unlocked=true;ctx.resume()?.catch(()=>{});if(first){startMusic();startAmbient();}}
 function sound(name='tap'){if(!unlocked||hidden||prefs.muted||!prefs.effects||!ctx)return;const t=ctx.currentTime;
 if(name==='lion-roar'||name==='dino-roar'){
 // Reintroduce the textured growl (the smoother pure-tone replacement was
 // too quiet), but omit the high-pitched oscillator stack and button tap.
 const dino=name==='dino-roar',duration=dino?2.25:1.75;
 const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
 let noise=0,phase=0;const rate=ctx.sampleRate;
 for(let i=0;i<data.length;i++){
  const sec=i/rate,progress=sec/duration;
  noise=.89*noise+.11*(Math.random()*2-1);
  const attack=Math.min(1,sec/(dino?.19:.12));
  const release=Math.pow(Math.max(0,1-progress),dino?.55:.85);
  const pulse=dino?(.8+.2*Math.sin(sec*18)):(.72+.28*Math.pow(Math.sin(sec*25),2));
  const pitch=(dino?61:107)*(1-progress*(dino?.35:.24));
  phase+=2*Math.PI*pitch/rate;
  const sub=.27*Math.sin(phase)+.08*Math.sin(2*phase);
  // Bounded waveform avoids clipping while keeping a clearly audible texture.
  data[i]=Math.tanh((noise*.9+sub)*1.4)*attack*release*pulse;
 }
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 source.buffer=buffer;filter.type='lowpass';
 filter.frequency.setValueAtTime(dino?950:1300,t);
 filter.frequency.exponentialRampToValueAtTime(dino?250:390,t+duration);
 // The effects bus is already attenuated to 0.3, so the previous value 0.62
 // made these relatively low-frequency sounds almost inaudible.
 gain.gain.value=2.1;
 source.connect(filter);filter.connect(gain);gain.connect(effects);
 sources.add(source);
 source.onended=()=>{sources.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};
 source.start(t);source.stop(t+duration);return;
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
 function dispose(){stopAmbient();stopMusic();stopWater();for(const s of sources)try{s.stop();}catch{}ctx?.close()?.catch(()=>{});}
 return {get preferences(){return {...prefs};},unlock,sound,update,startWater,stopWater,setHidden,setEnvironment,dispose};
}
