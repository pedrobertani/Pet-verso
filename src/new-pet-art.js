// Species silhouettes share the existing rig, not a generic mammal body.
const g=(cls,art)=>`<g class="${cls}">${art}</g>`;
const oval=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const path=(d,c,extra='')=>`<path d="${d}" fill="${c}" ${extra}/>`;
const line=(d,c,w=3)=>path(d,'none',`stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`);
const eye=(x,y,m,r=6)=>['sleep','sleepy'].includes(m)?line(`M${x-r} ${y}q${r} 5 ${r*2} 0`,'#304959',2):oval(x,y,r,r*1.22,'#304959')+oval(x+1.5,y-2.5,r*.3,r*.35,'#fff');
export function pterosaur(s,m,c,f){const age=s.growthLevel??2,crest=age===0?12:age===1?23:36;
 return g('pet-wing wing-left',path('M86 117L55 67Q35 40 8 52L12 119Q27 98 42 125Q56 103 74 136Z','#e8b58c', 'stroke="#b77b5c" stroke-width="2" stroke-linejoin="round"')+line('M85 120L55 67 12 119M55 67l-13 58M55 67l19 69','#c68b66',2))+
 g('pet-wing wing-right',path('M114 117L145 67Q165 40 192 52L188 119Q173 98 158 125Q144 103 126 136Z','#e8b58c','stroke="#b77b5c" stroke-width="2" stroke-linejoin="round"')+line('M115 120L145 67l43 52M145 67l13 58M145 67l-19 69','#c68b66',2))+
 g('pet-tail',path('M93 145l7 26 8-27','#be8668'))+g('pet-body',oval(100,129,23,36,f)+oval(101,133,15,25,'#fff0d5'))+
 g('pet-leg leg-0',line('M88 154l-4 15m0-1-6 4m6-4 5 5','#ab765a',5))+g('pet-leg leg-1',line('M111 154l5 15m0-1-5 5m5-5 6 4','#ab765a',5))+
 g('pet-head',path(`M90 71L${92-crest} 35 114 65Z`,'#c88b66')+oval(100,83,28,27,f)+path('M114 76l68 15-62 12q-13-4-6-27','#f3cf8d')+line('M120 90l49 2','#a47b50',1.8)+g('eyes',eye(88,80,m,6)+eye(109,78,m,5))+oval(128,83,2,1.5,'#a47b50'));
}
export function owl(s,m,c,f){const age=s.growthLevel??2;
 return g('pet-tail',path('M87 145l5 25 8-8 8 8 6-25','#aa825f'))+
 g('pet-wing wing-left',path('M86 104Q60 74 31 66q-9-2-11 5l7 24q23 15 51 35Z','#b89069')+line('M30 78l40 35M33 87l33 27','#e7c7a3',3))+
 g('pet-wing wing-right',path('M114 104q26-30 55-38 9-2 11 5l-7 24q-23 15-51 35Z','#b89069')+line('M170 78l-40 35M167 87l-33 27','#e7c7a3',3))+
 g('pet-body',oval(100,126,30,39,f)+oval(100,135,22,28,'#f0d9b9')+line('M91 129l3 3m12-3 3 3m-12 8 3 3m-11 4 3 3m15-3 3 3','#c3a17a',2))+
 g('pet-leg leg-0',line('M88 153v11m0-1-7 4m7-4 7 4','#d4a250',4))+g('pet-leg leg-1',line('M112 153v11m0-1-7 4m7-4 7 4','#d4a250',4))+
 g('pet-head',(age===2?path('M74 61l-7-14 17 9M126 61l7-14-17 9','#b89069'):'')+oval(100,79,35,33,f)+oval(83,82,19,23,'#f7e8cc')+oval(117,82,19,23,'#f7e8cc')+g('eyes',eye(83,80,m,7)+eye(117,80,m,7))+path('M94 96q6-4 12 0l-6 12Z','#efc65b')+line('M80 57l8 3M112 60l8-3','#a77c57',2));
}
export function frog(s,m,c,f){const age=s.growthLevel??2;
 if(age===0)return g('pet-tail frog-tail',path('M83 145Q33 154 12 115q31 23 76 14Z','#6aaa7b'))+g('pet-body tadpole',oval(106,136,36,32,f)+oval(107,150,22,15,'#d3e6b0'))+g('pet-head',g('eyes',eye(96,130,m,6)+eye(120,130,m,6))+g('mouth closed',line('M102 144q8 6 16 0','#52735b',2)));

 const tail=age===2?'':g('pet-tail frog-tail',path(age===0?'M75 145Q23 150 8 107q30 23 74 17Z':'M76 148Q27 151 13 121q28 16 64 10Z','#68aa79'));
 const happy=m==='happy',sleep=['sleep','sleepy'].includes(m),mouth=sleep?'M88 117q12 6 24 0':happy?'M86 114q14 20 28 0Z':m==='sad'?'M89 122q11-8 22 0':'M87 117q13 10 26 0';
 return tail+g('pet-leg leg-0',oval(62,150,25,17,'#69aa79')+oval(55,165,23,7,c)+line('M46 163l-5 5m14-4-2 6','#579766',2))+g('pet-leg leg-1',oval(138,150,25,17,'#69aa79')+oval(146,165,23,7,c)+line('M145 164l2 6m9-7 5 5','#579766',2))+
 g('pet-body',oval(100,140,33,31,f)+oval(100,148,23,22,'#e2e9ac'))+
 g('pet-arm',line('M82 138l-6 26m42-26 6 26',c,9)+oval(75,167,11,4,c)+oval(125,167,11,4,c))+
 g('pet-head',oval(72,83,19,22,c)+oval(128,83,19,22,c)+oval(100,103,47,30,f)+oval(73,81,12,14,'#f7f6d7')+oval(127,81,12,14,'#f7f6d7')+g('eyes',eye(73,81,m,6)+eye(127,81,m,6))+oval(80,111,7,3,'#e6acaa')+oval(120,111,7,3,'#e6acaa')+g('mouth '+(happy?'open':'closed'),path(mouth,happy?'#694b67':'none','stroke="#52735b" stroke-width="2" stroke-linecap="round"')));
}
