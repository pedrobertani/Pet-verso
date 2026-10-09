import {tick} from './engine.js';
// Each need has its own cooldown. Coincident needs share one notification.
export function notificationPlan(pet,now=Date.now(),lastTimes={}){
 if(!pet||pet.dead)return [];
 const plan=[],last={...lastTimes},start=new Date(now);start.setMinutes(Math.floor(start.getMinutes()/15)*15+15,0,0);let lastNotice=Math.max(0,...Object.values(last));
 for(let offset=0;offset<48*4;offset++){
  const at=new Date(start.getTime()+offset*15*60000),hour=at.getHours();
  if(hour<9||hour>=21||at.getTime()-lastNotice<3600000)continue;
  const future=tick(pet,at.getTime());if(future.dead)break;
  const active=[
   ['health','cuidados de saúde',future.ill||future.stats.health<40],
   ['food','comida',future.stats.food<40],
   ['joy','brincar',!future.sleeping&&future.stats.joy<40],
   ['waste','limpar o cocô',future.waste>0],
   ['hygiene','banho',future.stats.hygiene<40],
   ['energy','descanso',!future.sleeping&&future.stats.energy<35]
  ].filter(([code,,needed])=>needed&&at.getTime()-(last[code]??0)>=2*3600000);
  if(!active.length)continue;
  lastNotice=at.getTime();
  const codes=active.map(([code])=>code);for(const code of codes)last[code]=at.getTime();
  const id=100000000+(at.getFullYear()-2020)*1000000+(at.getMonth()+1)*10000+at.getDate()*100+hour;
  plan.push({id,title:`Hora de cuidar de ${pet.name}`,body:`Seu pet pode precisar de ${active.map(([,label])=>label).join(', ')}. Venha dar uma olhada!`,schedule:{at},channelId:'pet-care',isExactNotification:false,extra:{petBorn:pet.born,codes,scene:codes.includes('energy')?'bedroom':'living'}});
 }
 return plan;
}
export function notificationManager({api,platform,storage,onStatus=()=>{}}){
 const key='petverso-reminders-v1',historyKey='petverso-reminder-history-v2';let enabled=storage.getItem(key)==='true',queue=Promise.resolve(),generation=0;
 const native=platform!=='web';
 const status=()=>native?(enabled?'enabled':'disabled'):'web';
 async function replace(input,token){
  if(!native)return;
  const pending=await api.getPending();
  if(token!==generation)return;
  const owned=pending.notifications.filter(n=>n.id>=100000000&&n.id<200000000);
  if(owned.length)await api.cancel({notifications:owned.map(n=>({id:n.id}))});
  const pets=(Array.isArray(input)?input:[input]).filter(p=>p&&!p.dead);
  if(token!==generation||!enabled||!pets.length)return;
  const permission=await api.checkPermissions();
  if(permission.display!=='granted'){enabled=false;storage.setItem(key,'false');onStatus('denied');return;}
  if(platform==='android')await api.createChannel({id:'pet-care',name:'Cuidados dos pets',description:'Lembretes por necessidade de cada pet',importance:3,visibility:1});
  if(token!==generation)return;
  const now=Date.now();let history={};try{history=JSON.parse(storage.getItem(historyKey)||'{}');}catch{}
  const nextHistory={},notifications=[];
  pets.slice(0,20).forEach((pet,index)=>{
   const saved=history[pet.born]||[];
   const past=saved.filter(e=>e.at<=now&&e.at>now-24*3600000);
   const lastTimes={};for(const event of past)for(const code of event.codes||[])lastTimes[code]=Math.max(lastTimes[code]||0,event.at);
   const planned=notificationPlan(pet,now,lastTimes).slice(0,40).map((notice,sequence)=>({...notice,id:100000000+index*1000+sequence,extra:{...notice.extra,petBorn:pet.born}}));
   notifications.push(...planned);
   nextHistory[pet.born]=[...past,...planned.map(item=>({at:item.schedule.at.getTime(),codes:item.extra.codes}))];
  });
  notifications.sort((a,b)=>a.schedule.at-b.schedule.at);
  if(notifications.length)await api.schedule({notifications});
  storage.setItem(historyKey,JSON.stringify(nextHistory));
 }
 function sync(input){const token=++generation,snapshot=input?structuredClone(input):null;queue=queue.catch(()=>{}).then(()=>replace(snapshot,token)).catch(()=>{onStatus('error');return false;});return queue;}
 async function toggle(input){
  if(!native){onStatus('web');return;}
  if(enabled){enabled=false;storage.setItem(key,'false');await api.cancel({notifications:[{id:99999}]});await sync(input);onStatus('disabled');return;}
  const current=await api.checkPermissions();const permission=current.display==='granted'?current:await api.requestPermissions();
  if(permission.display!=='granted'){onStatus('denied');return;}
  enabled=true;storage.setItem(key,'true');const ok=await sync(input);if(enabled&&ok!==false)onStatus('enabled');
 }
 async function test(){if(!native||!enabled)return;const p=await api.checkPermissions();if(p.display!=='granted'){onStatus('denied');return;}await api.schedule({notifications:[{id:99999,title:'PetVerso',body:'Tudo pronto! Os lembretes dos seus pets estão ativados.',channelId:'pet-care',isExactNotification:false,schedule:{at:new Date(Date.now()+10000)}}]});onStatus('test');}
 return {status,sync,toggle,test};
}
