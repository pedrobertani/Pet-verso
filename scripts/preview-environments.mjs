import {chromium} from 'playwright';
import {createServer} from 'vite';
import {mkdir} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:5192}});await server.listen();
const browser=await chromium.launch({executablePath:'/tmp/petverso-headless/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox','--single-process','--in-process-gpu']});
try{
const page=await browser.newPage({viewport:{width:1200,height:1800},deviceScaleFactor:1});await page.goto('http://127.0.0.1:5192');
await page.evaluate(async()=>{
const {environments,environmentArt}=await import('/src/park-environments.js');
document.body.innerHTML=`<main class="env-review"><header><b>PetVerso</b><span>ETAPA 1 / 9 · PRÉVIA DOS AMBIENTES</span></header><h1>Um cantinho para cada pet</h1><p>Chão livre para brincar. Elementos decorativos ao fundo.</p><div class="env-grid">${environments.map(e=>`<section><h2>${e.name}</h2><p>${e.description}</p><div>${environmentArt(e.id)}</div></section>`).join('')}</div><footer>Prévia vetorial · sem brinquedos e sem móveis nesta etapa</footer></main>`;
document.head.insertAdjacentHTML('beforeend',`<style>body{margin:0;background:#fff3df!important;color:#354859}.env-review{padding:30px;font-family:Nunito,sans-serif}.env-review header{display:flex;justify-content:space-between;align-items:center;color:#34839b}.env-review header b{font:35px 'Lilita One'}.env-review header span{font-size:14px;font-weight:800;letter-spacing:1px}.env-review h1{font:36px 'Lilita One';margin:22px 0 5px}.env-review>p{margin:0 0 20px}.env-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.env-grid section{background:#fffaf1;border:2px solid #ecd8ba;border-radius:23px;padding:14px;box-shadow:0 5px #e8ccaa}.env-grid h2{font:25px 'Lilita One';margin:0 0 3px}.env-grid p{font-size:14px;margin:0 0 12px;color:#737f78}.env-grid section>div{border-radius:16px;overflow:hidden;line-height:0}.env-grid svg{width:100%;height:auto;display:block}.env-review footer{text-align:center;font-size:14px;margin:26px 0 0;color:#8a8174}body:after{display:none}</style>`);
});await page.evaluate(()=>document.fonts.ready);await mkdir('previews',{recursive:true});await page.screenshot({path:'previews/ambientes-especies-etapa-1.png',fullPage:true});console.log('previews/ambientes-especies-etapa-1.png');
}finally{await browser.close();await server.close();}
