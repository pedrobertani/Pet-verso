import {chromium} from 'playwright';
import {createServer} from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:5235}});
await server.listen();
const browser=await chromium.launch({executablePath:'/workspace/scratch/e0a3b19a9c5b/pet-test-tools/chromium',args:['--no-sandbox','--disable-gpu']});
try{
 const page=await browser.newPage({viewport:{width:1150,height:1100}});
 await page.goto('http://127.0.0.1:5235');
 await page.evaluate(async()=>{
  const {activeSpecies}=await import('/src/engine.js');
  const {petDrawing}=await import('/src/pets.js');
  const ids=['dinos-2','selva-capybara','selva-fox','selva-2','dinos-1'];
  document.body.innerHTML='<main><h1>Revisão das junções e do rosto</h1><header><span></span><b>Bebê</b><b>Jovem</b><b>Adulto</b></header>'+ids.map(id=>{
   const s=activeSpecies.find(p=>p.id===id);
   return '<section><h2>'+s.name+'</h2>'+[0,1,2].map(growthLevel=>'<figure>'+petDrawing({...s,growthLevel},'idle')+'</figure>').join('')+'</section>';
  }).join('')+'</main>';
  document.head.insertAdjacentHTML('beforeend','<style>body{margin:0;background:#fff2df;color:#354557}main{padding:20px}h1{font-size:26px}header,section{display:grid;grid-template-columns:170px repeat(3,1fr);align-items:center;text-align:center}section{background:#fffaf0;margin:10px 0;border-radius:16px;height:195px}h2{font-size:19px}figure{margin:0}svg.creature{width:250px!important;height:180px!important;transform:none!important}svg *{animation:none!important}</style>');
 });
 await page.screenshot({path:'previews/anatomia-corrigida-tres-idades.png',fullPage:true});
 await page.evaluate(async()=>{
  const {activeSpecies}=await import('/src/engine.js');
  const {landTurnPreview}=await import('/src/land-turn-preview.js');
  document.querySelector('main').innerHTML='<h1>Conferência da virada · bebê e jovem</h1>'+['dinos-2','selva-capybara','selva-fox','selva-2','dinos-1'].map(id=>{
   const s=activeSpecies.find(p=>p.id===id);
   return [0,1].map(growthLevel=>'<section><h2>'+s.name+'<br>'+['Bebê','Jovem'][growthLevel]+'</h2>'+[0,Math.PI/2,Math.PI].map(angle=>'<figure>'+landTurnPreview({...s,growthLevel},angle,'idle')+'</figure>').join('')+'</section>').join('');
  }).join('');
 });
 await page.screenshot({path:'previews/anatomia-corrigida-viradas.png',fullPage:true});
 await page.evaluate(()=>{
  document.querySelectorAll('section').forEach(section=>{if(!section.querySelector('h2').textContent.includes('RaposaBebê'))section.remove();});
  document.querySelector('h1').textContent='Raposa bebê · pescoço mais firme';
 });
 await page.screenshot({path:'previews/raposa-bebe-pescoco.png',clip:{x:0,y:0,width:1150,height:330}});
}finally{await browser.close();await server.close();}
