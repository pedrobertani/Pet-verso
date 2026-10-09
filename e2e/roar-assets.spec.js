import {test,expect} from '@playwright/test';

test('os rugidos do leão e T-Rex usam MP3s locais acessíveis no navegador',async({page,request})=>{
 await page.goto('/?adulto');
 for(const path of ['/audio/lion-roar.mp3','/audio/trex-roar.mp3']){
  const response=await request.get(path);
  expect(response.ok(),path+' indisponível').toBe(true);
  expect(response.headers()['content-type']).toContain('audio/mpeg');
  const bytes=await response.body();
  expect(bytes.length).toBeGreaterThan(50000);
  expect(bytes.subarray(0,3).toString('ascii')==='ID3'||bytes[0]===255).toBe(true);
 }
 const source=await page.evaluate(async()=>{
  const {roarAssets}=await import('/src/audio.js');
  return roarAssets;
 });
 expect(source).toEqual({'lion-roar':'/audio/lion-roar.mp3','dino-roar':'/audio/trex-roar.mp3'});
});
