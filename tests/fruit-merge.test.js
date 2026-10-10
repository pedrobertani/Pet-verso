import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fruitOverflowDanger,FRUIT_LIMIT_Y,FRUIT_DROP_GRACE_SECONDS,FRUIT_OVERFLOW_SECONDS} from '../src/fruit-merge.js';

test('fruta recém-solta não causa derrota ao passar pela linha vermelha',()=>{
 const falling={y:55,r:24,age:0,vy:400,dead:false};
 let danger=0;
 for(let n=0;n<25;n++){
  falling.age+=.02;
  danger=fruitOverflowDanger([falling],danger,.02);
 }
 assert.equal(danger,0,'nos primeiros 500ms, fruta nova não deve contar como pilha travada');
 assert.equal(FRUIT_LIMIT_Y,78);
 assert.ok(FRUIT_DROP_GRACE_SECONDS>.5&&FRUIT_DROP_GRACE_SECONDS<1.5);
});
test('pilha de frutas acima da linha termina mesmo se estiver tremendo e pulando',()=>{
 const fruit={y:70,r:32,age:3,vy:1500,dead:false};
 let danger=0;
 for(let frame=0;frame<100;frame++){
  fruit.vy=frame%2?1500:-1000;
  danger=fruitOverflowDanger([fruit],danger,.02);
 }
 assert.ok(danger>=FRUIT_OVERFLOW_SECONDS,'velocidade não pode impedir fim do jogo');
});
test('altura e idade, não velocidade, determinam a linha e o alerta diminui quando desobstrui',()=>{
 const stalled={y:FRUIT_LIMIT_Y+17,r:18,age:5,vy:0,dead:false};
 const overflowing={...stalled,y:FRUIT_LIMIT_Y+17-1};
 assert.equal(fruitOverflowDanger([stalled],0,.1),0,'um pixel abaixo da linha não é derrota');
 assert.equal(fruitOverflowDanger([overflowing],0,.1),.1,'um pixel acima da linha ativa alerta');
 const fresh={...overflowing,age:.3};
 assert.equal(fruitOverflowDanger([fresh],0,.2),0,'fruta nova ainda cai');
 assert.equal(fruitOverflowDanger([{...overflowing,dead:true}],0,.2),0,'fruta fundida não conta');
 assert.equal(fruitOverflowDanger([stalled],1,.1),.8,'alerta diminui quando a linha libera');
 assert.equal(fruitOverflowDanger([stalled],.1,.1),0,'alerta não fica negativo');
 assert.equal(fruitOverflowDanger([overflowing],.2,0),.2,'sem passagem de tempo não avança');
});
