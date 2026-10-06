import {chromium} from 'playwright';
import {createServer} from 'vite';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('previews',{recursive:true});
const server=await createServer({server:{host:'127.0.0.1',port:5178}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.PETVERSO_CHROME,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--in-process-gpu']});
try{
 const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5178');await page.locator('[data-adopt="dinos-1"]').click();
 await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('petverso-v1'));p.coins=3000;p.equipped={sofa:'sofa',shelf:'shelf',table:'table','garden-swing':'swing','garden-slide':'slide','garden-trampoline':'trampoline','garden-bench':'bench'};p.inventory=Object.values(p.equipped);localStorage.setItem('petverso-v1',JSON.stringify(p));});await page.reload();
 const roomShot=async name=>{await page.locator('.room').screenshot({path:`previews/${name}.png`});};
 await roomShot('sala');await page.locator('[data-scene="bedroom"]').click();await roomShot('quarto-acordado');assert.equal(await page.locator('.sleep-cover').count(),0);
 await page.locator('[data-scene="garden"]').click();await roomShot('quintal-equipado');assert.equal(await page.locator('.garden-item').count(),4);
 await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('petverso-v1'));p.equipped={};localStorage.setItem('petverso-v1',JSON.stringify(p));});await page.reload();await page.locator('[data-scene="garden"]').click();await roomShot('quintal-vazio');
 await page.locator('[data-care="sleep"]').click();await roomShot('quarto-dormindo');assert.equal(await page.locator('.in-bed').count(),1);
 for(const [scene,name] of [['living','sala-noite'],['bathroom','banheiro-noite'],['garden','quintal-noite']]){await page.locator(`[data-scene="${scene}"]`).click();await roomShot(name);assert.equal(await page.locator('.night').count(),1);assert.equal(await page.locator('.creature:visible').count(),0);}
 await page.locator('[data-care="sleep"]').click();await page.locator('[data-page="shop"]').click();await page.locator('[data-shop-room="garden"]').click();assert.equal(await page.locator('.shop-card').count(),4);await page.locator('main').screenshot({path:'previews/loja-quintal.png'});
 await page.locator('[data-shop-room="living"]').click();assert.ok(await page.locator('.shop-card').count()>=9);await page.locator('.shop-card:has([data-buy="sofa"])').scrollIntoViewIfNeeded();await page.screenshot({path:'previews/loja-sala.png'});
 await page.locator('[data-page="games"]').click();await page.locator('[data-game="runner"]').click();await page.waitForTimeout(2800);await page.screenshot({path:'previews/corrida.png'});assert.ok((await page.locator('canvas').boundingBox()).height>400);
 await page.getByRole('button',{name:'Fechar',exact:true}).click();await page.locator('[data-game="food"]').click();await page.waitForTimeout(1100);await page.screenshot({path:'previews/frutas.png'});await page.getByRole('button',{name:'Fechar',exact:true}).click();
 // Complete the first memory board and verify a new board replaces a timed ending.
 await page.locator('[data-game="memory"]').click();const groups=new Map();
 for(let i=0;i<12;i++){await page.locator(`[data-card="${i}"]`).click();const svg=await page.locator(`[data-card="${i}"]`).innerHTML();if(!groups.has(svg))groups.set(svg,[]);groups.get(svg).push(i);if(i%2===1)await page.waitForTimeout(700);}
 assert.equal(groups.size,6);for(const indices of groups.values()){for(const i of indices){const button=page.locator(`[data-card="${i}"]`);if(!(await button.getAttribute('class')||'').includes('matched'))await button.click();}}
 await page.waitForTimeout(550);assert.ok((await page.locator('#play').innerText()).includes('Rodada 2'));assert.equal(await page.locator('[data-card]').count(),16);const cardsBox=await page.locator('[data-card]').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));assert.equal(new Set(cardsBox.slice(0,4).map(b=>Math.round(b.y))).size,1);assert.ok(cardsBox[0].w<100);await page.screenshot({path:'previews/memoria-pontos.png'});await page.getByRole('button',{name:'Fechar',exact:true}).click();
 const points=await page.evaluate(()=>JSON.parse(localStorage.getItem('petverso-v1')).totalPoints);assert.ok(points>0);await page.reload();await page.locator('[data-page="games"]').click();assert.ok((await page.locator('.points-summary').innerText()).includes(String(points)));
 await page.locator('[data-game="hide"]').click();await page.waitForTimeout(5100);await page.screenshot({path:'previews/caixas.png'});await page.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.locator('[data-page="shop"]').click();await page.locator('[data-shop-room="bedroom"]').click();await page.screenshot({path:'previews/loja-quarto.png',fullPage:true});await page.locator('[data-shop-room="bathroom"]').click();await page.evaluate(()=>window.scrollTo(0,0));const bar=await page.locator('nav').boundingBox();assert.ok(Math.abs(bar.y+bar.height-850)<2);await page.screenshot({path:'previews/loja-banheiras.png'});await page.locator('[data-buy="tub-mint"]').click();await page.locator('[data-page="home"]').click();await page.locator('[data-scene="bathroom"]').click();await roomShot('banheira-menta');
 assert.deepEqual(errors,[]);console.log('Room, shop, game size, memory continuation and points persistence checks passed.');
}finally{await browser.close();await server.close();}
