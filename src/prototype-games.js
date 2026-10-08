import './prototype-games.css';

const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

export function toySort(area,{onEnd,sound}){
 const groups=[
  {id:'red',name:'Vermelho',color:'#ef7590',items:['🧸','🪀','🚗']},
  {id:'blue',name:'Azul',color:'#64bddd',items:['⚽','🧩','🚀']},
  {id:'green',name:'Verde',color:'#7cc58a',items:['🦴','🥎','🐢']}
 ];
 let score=0,selected=null,remaining=shuffle(groups.flatMap(g=>g.items.map(icon=>({icon,group:g.id})))).slice(0,9);
 function draw(){
  area.innerHTML=`<div class="prototype-head"><b>${score} pontos</b><span>Toque no brinquedo e depois na caixa certa.</span></div><div class="sort-items">${remaining.map((x,i)=>`<button data-item="${i}" class="${selected===i?'chosen':''}">${x.icon}</button>`).join('')}</div><div class="sort-bins">${groups.map(g=>`<button data-bin="${g.id}" style="--bin:${g.color}"><span>▾</span><b>${g.name}</b></button>`).join('')}</div>`;
  area.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{selected=+b.dataset.item;sound('tap');draw();});
  area.querySelectorAll('[data-bin]').forEach(b=>b.onclick=()=>{if(selected===null)return;const right=remaining[selected].group===b.dataset.bin;score=Math.max(0,score+(right?12:-4));sound(right?'match':'wrong');if(right)remaining.splice(selected,1);selected=null;if(!remaining.length)return onEnd(score);draw();});
 }
 draw();return ()=>{};
}

const blockShapes=[[[0,0]],[[0,0],[0,1]],[[0,0],[1,0]],[[0,0],[0,1],[1,0]],[[0,0],[0,1],[0,2]]];
export function petBlocks(area,{onEnd,sound}){
 const size=6,grid=Array.from({length:size},()=>Array(size).fill(0));let score=0,moves=18,shape=pick(blockShapes);
 const fits=(r,c)=>shape.every(([dr,dc])=>r+dr<size&&c+dc<size&&!grid[r+dr][c+dc]);
 function place(r,c){if(!fits(r,c)){sound('wrong');return;}shape.forEach(([dr,dc])=>grid[r+dr][c+dc]=1);score+=shape.length*4;moves--;let cleared=0;for(let y=size-1;y>=0;y--)if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(size).fill(0));cleared++;y++;}if(cleared){score+=cleared*30;sound('match');}else sound('tap');shape=pick(blockShapes);if(!moves||!grid.some((_,r)=>grid[r].some((_,c)=>fits(r,c))))return onEnd(score);draw();}
 function draw(){area.innerHTML=`<div class="prototype-head"><b>${score} pontos</b><span>${moves} peças restantes</span></div><div class="block-shape">${shape.map(()=>'<i></i>').join('')}</div><div class="block-board">${grid.flatMap((row,r)=>row.map((v,c)=>`<button data-r="${r}" data-c="${c}" class="${v?'filled':''}" aria-label="Casa ${r+1}, ${c+1}"></button>`)).join('')}</div><p class="prototype-tip">Toque numa casa para encaixar a peça. Complete linhas horizontais.</p>`;area.querySelectorAll('.block-board button').forEach(b=>b.onclick=()=>place(+b.dataset.r,+b.dataset.c));}
 draw();return ()=>{};
}

export function hiddenObjects(area,{onEnd,sound}){
 const objects=['🦴','⚽','🧸','🪀','🥕','⭐','🧩','🧦'],positions=[[12,22],[73,18],[42,34],[18,64],[79,66],[53,72],[35,80],[64,47]];
 let target=0,score=0,seconds=45,timer;
 function draw(){area.innerHTML=`<div class="prototype-head"><b>${score} pontos</b><span>${seconds}s · Encontre: <strong>${objects[target]}</strong></span></div><div class="hidden-room"><div class="hidden-window">☀️</div><div class="hidden-sofa"></div><div class="hidden-rug"></div>${objects.map((o,i)=>`<button data-object="${i}" style="left:${positions[i][0]}%;top:${positions[i][1]}%">${o}</button>`).join('')}</div><p class="prototype-tip">Os objetos mudam de lugar a cada rodada definitiva.</p>`;area.querySelectorAll('[data-object]').forEach(b=>b.onclick=()=>{const i=+b.dataset.object;if(i!==target){score=Math.max(0,score-3);sound('wrong');return;}score+=15;sound('match');b.classList.add('found');target++;if(target===objects.length){clearInterval(timer);return onEnd(score);}draw();});}
 timer=setInterval(()=>{seconds--;const span=area.querySelector('.prototype-head span');if(span)span.innerHTML=`${seconds}s · Encontre: <strong>${objects[target]}</strong>`;if(seconds<=0){clearInterval(timer);onEnd(score);}},1000);draw();return ()=>clearInterval(timer);
}

export function findMatches(board){
 const found=new Set(),n=board.length;
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){if(c+2<n&&board[r][c]===board[r][c+1]&&board[r][c]===board[r][c+2]){let x=c;while(x<n&&board[r][x]===board[r][c])found.add(r+','+(x++));}if(r+2<n&&board[r][c]===board[r+1][c]&&board[r][c]===board[r+2][c]){let y=r;while(y<n&&board[y][c]===board[r][c])found.add((y++)+','+c);}}
 return found;
}
export function treatMatch(area,{onEnd,sound}){
 const icons=['🍎','🥕','🍓','🫐','🥩'],n=6,board=Array.from({length:n},()=>Array.from({length:n},()=>pick(icons)));let first=null,score=0,moves=18;
 function settle(){let matched=findMatches(board);if(!matched.size)return false;score+=matched.size*3;for(const key of matched){const [r,c]=key.split(',').map(Number);board[r][c]=null;}for(let c=0;c<n;c++){const column=board.map(row=>row[c]).filter(Boolean);while(column.length<n)column.unshift(pick(icons));column.forEach((v,r)=>board[r][c]=v);}return true;}
 while(settle()){}
 function tap(r,c){if(!first){first=[r,c];return draw();}const [a,b]=first;first=null;if(Math.abs(a-r)+Math.abs(b-c)!==1){sound('wrong');return draw();}[board[a][b],board[r][c]]=[board[r][c],board[a][b]];if(!settle()){[board[a][b],board[r][c]]=[board[r][c],board[a][b]];sound('wrong');return draw();}moves--;sound('match');while(settle()){}if(!moves)return onEnd(score);draw();}
 function draw(){area.innerHTML=`<div class="prototype-head"><b>${score} pontos</b><span>${moves} jogadas</span></div><div class="treat-board">${board.flatMap((row,r)=>row.map((v,c)=>`<button data-r="${r}" data-c="${c}" class="${first?.[0]===r&&first?.[1]===c?'chosen':''}">${v}</button>`)).join('')}</div><p class="prototype-tip">Troque petiscos vizinhos para formar três ou mais.</p>`;area.querySelectorAll('.treat-board button').forEach(b=>b.onclick=()=>tap(+b.dataset.r,+b.dataset.c));}
 draw();return ()=>{};
}
