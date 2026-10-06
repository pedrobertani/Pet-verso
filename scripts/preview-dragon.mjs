import {chromium} from 'playwright';
import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import {fresh} from '../src/engine.js';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:5189}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.PETVERSO_CHROME||'/tmp/petverso-headless/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox','--single-process','--in-process-gpu']});
try{
 const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5189');await mkdir('previews/dragon-frames',{recursive:true});let index=0;
 const setTime=async t=>page.evaluate(t=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=t}),t);
 for(const [id,name] of [['sombrios-dragon','Dragãozinho']]){
  await page.evaluate(p=>localStorage.setItem('petverso-v1',JSON.stringify(p)),fresh(id,name));await page.reload();await page.locator('.room').scrollIntoViewIfNeeded();assert.equal(await page.locator('.airborne.roaming .creature').evaluate(el=>getComputedStyle(el).animationName),'dragon-hover');
  if(id==='pets-0')assert.equal(await page.locator('.walking-pose .pet-leg').count(),4);
  for(const t of [1000,8000,15000]){await setTime(t);const x=await page.locator('.pet-facing').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);assert.equal(Math.sign(x),t===8000?-1:1);}
  for(let i=0;i<72;i++){await setTime(i*250);await writeFile(`previews/dragon-frames/frame-${String(index++).padStart(3,'0')}.png`,await page.locator('.room').screenshot());}
  await setTime(1000);await page.locator('.room').screenshot({path:`previews/dragao-voando.png`});
  for(const scene of ['bedroom','garden']){await page.locator(`[data-scene="${scene}"]`).click();for(const t of [1000,11000]){await setTime(t);const x=await page.locator('.pet-facing').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a);assert.equal(Math.sign(x),t===1000?1:-1);}}
  await page.locator('[data-care="bath"]').click();assert.equal(await page.locator('.bath-composition .walking-pose').count(),0);assert.equal(await page.locator('.bath-composition .pet-facing').count(),0);
  assert.ok(await page.locator('.bath-composition .pet-wing').evaluateAll(els=>els.every(el=>getComputedStyle(el).animationName==='none')));await page.locator('[data-care="sleep"]').click();assert.equal(await page.locator('.in-bed .walking-pose').count(),0);assert.equal(await page.locator('.pet-blanket').count(),1);assert.equal(await page.locator('.in-bed .pet-facing').evaluate(el=>getComputedStyle(el).animationName),'none');
 }
 assert.deepEqual(errors,[]);console.log('Viradas verificadas na sala, quarto e quintal; banho e sono sem espelhamento ou pose de caminhada.');
}finally{await browser.close();await server.close();}
