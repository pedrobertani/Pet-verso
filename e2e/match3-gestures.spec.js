import {test,expect} from '@playwright/test';

// Jogo isolado: evita depender da adoção e do save para testar o gesto real.
async function openGame(page){
 await page.goto('/');
 await page.evaluate(async()=>{
  const {match3Game}=await import('/src/prototype-games.js');
  const area=document.createElement('div');
  area.id='match3-gesture-test';
  area.style.cssText='position:fixed;inset:0;z-index:99999;padding:24px;background:#fff9ef;overflow:auto';
  document.body.append(area);
  window.__match3Result={score:0,ended:false};
  match3Game(area,{
   sound:()=>{},
   onScore:score=>window.__match3Result.score=score,
   onEnd:()=>window.__match3Result.ended=true
  });
 });
 await expect(page.locator('.match-board [data-gem]')).toHaveCount(36);
}

async function getPlayableMove(page){
 return page.evaluate(async()=>{
  const {findAvailableMatch3Swap}=await import('/src/prototype-games.js');
  const buttons=[...document.querySelectorAll('.match-board [data-gem]')];
  const size=Math.sqrt(buttons.length);
  const board=Array.from({length:size},()=>Array(size));
  for(const button of buttons){
   const [r,c]=button.dataset.gem.split(',').map(Number);
   board[r][c]=[...button.querySelector('.treat-art').classList].find(x=>x.startsWith('treat-'));
  }
  const move=findAvailableMatch3Swap(board);
  return move;
 });
}

test('Combinação de Petiscos sempre oferece troca que pontua',async({page})=>{
 await openGame(page);
 const move=await getPlayableMove(page);
 expect(move).toBeTruthy();
 const from=page.locator('[data-gem="'+move.from.join(',')+'"]');
 const to=page.locator('[data-gem="'+move.to.join(',')+'"]');
 await from.click();
 await expect(page.locator('[data-gem="'+move.from.join(',')+'"]')).toHaveClass(/selected/);
 await to.click();
 await expect.poll(()=>page.evaluate(()=>window.__match3Result.score)).toBeGreaterThan(0);
 await expect.poll(async()=>Boolean(await getPlayableMove(page))).toBeTruthy();
});

test('arrastar petisco no celular ou desktop troca pela direção do gesto',async({page},testInfo)=>{
 await openGame(page);
 const move=await getPlayableMove(page);
 expect(move).toBeTruthy();
 await expect(page.locator('.match-board')).toHaveCSS('touch-action','none');
 const from=await page.locator('[data-gem="'+move.from.join(',')+'"]').boundingBox();
 const to=await page.locator('[data-gem="'+move.to.join(',')+'"]').boundingBox();
 const sx=from.x+from.width/2,sy=from.y+from.height/2;
 // Passa um pouco do centro vizinho: não é preciso soltar exatamente nele.
 const ex=sx+(to.x+to.width/2-sx)*1.2,ey=sy+(to.y+to.height/2-sy)*1.2;
 if(testInfo.project.name==='mobile'){
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:sx,y:sy}]});
  for(let n=1;n<=5;n++)await cdp.send('Input.dispatchTouchEvent',{
   type:'touchMove',touchPoints:[{id:1,x:sx+(ex-sx)*n/5,y:sy+(ey-sy)*n/5}]
  });
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{
  await page.mouse.move(sx,sy);
  await page.mouse.down();
  await page.mouse.move(ex,ey,{steps:6});
  await page.mouse.up();
 }
 await expect.poll(()=>page.evaluate(()=>window.__match3Result.score)).toBeGreaterThan(0);
 await expect.poll(async()=>Boolean(await getPlayableMove(page))).toBeTruthy();
});
