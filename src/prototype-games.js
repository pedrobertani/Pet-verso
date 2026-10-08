const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function prototypeDifficulty(kind,level=1){
  const n=Math.max(1,Math.floor(level));
  if(kind==='sorting')return {
    categories:Math.min(4,2+Math.floor((n-1)/4)),
    items:Math.min(18,5+Math.floor((n-1)*.75)),
    lives:Math.max(1,4-Math.floor((n-1)/8)),
    rare:n>=9
  };
  if(kind==='blocks')return {
    seeded:Math.min(20,Math.floor((n-1)*.8)),
    largeChance:clamp(.1+(n-1)*.035,.1,.75),
    colors:Math.min(5,3+Math.floor((n-1)/7))
  };
  if(kind==='hidden')return {
    targets:Math.min(9,3+Math.floor((n-1)/3)),
    decoys:Math.min(18,2+Math.floor(n*.8)),
    seconds:Math.max(30,65-Math.floor((n-1)*1.5)),
    scale:Math.max(.68,1-(n-1)*.018)
  };
  return {
    size:Math.min(8,6+Math.floor((n-1)/7)),
    moves:Math.max(13,24-Math.floor((n-1)/3)),
    target:180+(n-1)*55,
    kinds:Math.min(6,5+Math.floor((n-1)/8))
  };
}

export function levelBand(level){
  if(level<=5)return 'Iniciante';
  if(level<=12)return 'Aprendiz';
  if(level<=22)return 'Experiente';
  return 'Mestre';
}

export function levelReward(level,base=100){
  return Math.round(base+Math.min(200,(level-1)*8));
}

export function findMatches(board){
  const hits=new Set(),rows=board.length,cols=board[0]?.length||0;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const value=board[r][c];if(!value)continue;
    if(c+2<cols&&value===board[r][c+1]&&value===board[r][c+2]){
      let x=c;while(x<cols&&board[r][x]===value)hits.add(`${r},${x++}`);
    }
    if(r+2<rows&&value===board[r+1][c]&&value===board[r+2][c]){
      let y=r;while(y<rows&&board[y][c]===value)hits.add(`${y++},${c}`);
    }
  }
  return hits;
}

export function canPlace(board,shape,row,col){
  return shape.every(([x,y])=>row+y>=0&&col+x>=0&&row+y<board.length&&col+x<board[0].length&&!board[row+y][col+x]);
}

const pick=list=>list[Math.floor(Math.random()*list.length)];
const shuffle=list=>{const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const categories=[
  {id:'cars',name:'Carrinhos',symbol:'🚗',color:'#ed8179',toys:['🚗','🚙','🏎️']},
  {id:'plush',name:'Pelúcias',symbol:'🧸',color:'#efba4f',toys:['🧸','🐻','🐰']},
  {id:'blocks',name:'Blocos',symbol:'🧱',color:'#9b7bd7',toys:['🧱','🔺','🟦']},
  {id:'balls',name:'Bolas',symbol:'⚽',color:'#58bdb1',toys:['⚽','🏀','🎾']}
];

function gameHeader(score,level,detail){return `<div class="proto-hud"><b>${score} pontos</b><span>Fase ${level} · ${levelBand(level)}</span><span>${detail}</span></div>`;}

export function sortingGame(area,api){
  let level=1,score=0,stopped=false,timers=[];
  const later=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);};
  function round(){
    const d=prototypeDifficulty('sorting',level),active=categories.slice(0,d.categories);let lives=d.lives,selected=null;
    const toys=shuffle(Array.from({length:d.items},(_,id)=>{const category=active[id%active.length];return {id,category:category.id,symbol:pick(category.toys)};}));
    const remaining=new Set(toys.map(toy=>toy.id));
    area.innerHTML=`${gameHeader(score,level,`<i id="sort-lives">${'♥'.repeat(lives)}</i>`)}<p class="proto-help">Toque no brinquedo e depois na caixa certa.</p><div class="sorting-scene"><div class="sorting-paw">🐾</div><div class="sorting-toys">${toys.map(toy=>`<button data-toy="${toy.id}" data-category="${toy.category}" aria-label="Selecionar ${toy.symbol}">${toy.symbol}</button>`).join('')}</div></div><div class="sorting-bins">${active.map(c=>`<button data-bin="${c.id}" style="--bin:${c.color}"><strong>${c.symbol}</strong><small>${c.name}</small></button>`).join('')}</div>`;
    const toyButtons=[...area.querySelectorAll('[data-toy]')];
    toyButtons.forEach(button=>button.onclick=()=>{if(stopped||button.disabled)return;toyButtons.forEach(x=>x.classList.remove('selected'));selected=button;button.classList.add('selected');api.sound('tap');});
    area.querySelectorAll('[data-bin]').forEach(bin=>bin.onclick=()=>{
      if(stopped||!selected)return;
      if(selected.dataset.category===bin.dataset.bin){
        remaining.delete(+selected.dataset.toy);selected.classList.add('sorted');selected.disabled=true;selected=null;score+=10;api.onScore(score);api.sound('match');
        if(!remaining.size){score+=levelReward(level,25);api.onScore(score);later(()=>{level++;round();},550);}
      }else{
        lives--;selected.classList.add('wrong');api.sound('wrong');area.querySelector('#sort-lives').textContent='♥'.repeat(lives)+'♡'.repeat(d.lives-lives);
        later(()=>selected?.classList.remove('wrong'),260);if(lives<=0){stopped=true;later(()=>api.onEnd(score),450);}
      }
    });
  }
  round();return()=>{stopped=true;timers.forEach(clearTimeout);};
}

const blockShapes=[
 [[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],
 [[0,0],[1,0],[0,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[0,1],[0,2],[1,2]]
];
export function blocksGame(area,api){
  const size=8;let level=1,score=0,board=[],tray=[],selected=null,stopped=false;
  const empty=()=>Array.from({length:size},()=>Array(size).fill(0));
  function seed(count,colors){for(let n=0;n<count;n++){const open=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(!board[r][c])open.push([r,c]);if(!open.length)return;const [r,c]=pick(open);board[r][c]=1+Math.floor(Math.random()*colors);}}
  function available(shape){for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(canPlace(board,shape,r,c))return true;return false;}
  function makeTray(){const d=prototypeDifficulty('blocks',level),pool=blockShapes.filter((_,i)=>i<5||Math.random()<d.largeChance);return Array.from({length:3},(_,id)=>({id,shape:pick(pool),color:1+Math.floor(Math.random()*d.colors)}));}
  function clearLines(){let lines=0;for(let r=0;r<size;r++)if(board[r].every(Boolean)){board[r].fill(0);lines++;}for(let c=0;c<size;c++)if(board.every(row=>row[c])){board.forEach(row=>row[c]=0);lines++;}return lines;}
  function next(){const d=prototypeDifficulty('blocks',level);board=empty();seed(d.seeded,d.colors);tray=makeTray();draw();}
  function draw(){
    area.innerHTML=`${gameHeader(score,level,'Complete linhas')}<div class="block-board" style="--block-size:${size}">${board.flatMap((row,r)=>row.map((value,c)=>`<button data-cell="${r},${c}" class="block-color-${value}" aria-label="Linha ${r+1}, coluna ${c+1}"></button>`)).join('')}</div><p class="proto-help">Escolha uma peça e toque no tabuleiro.</p><div class="block-tray">${tray.map(piece=>{const width=Math.max(...piece.shape.map(p=>p[0]))+1,height=Math.max(...piece.shape.map(p=>p[1]))+1;return `<button data-piece="${piece.id}" class="${selected?.id===piece.id?'selected':''}"><i class="piece-preview" style="--pw:${width};--ph:${height}">${piece.shape.map(([x,y])=>`<span class="block-color-${piece.color}" style="--x:${x};--y:${y}"></span>`).join('')}</i></button>`;}).join('')}</div>`;
    area.querySelectorAll('[data-piece]').forEach(button=>button.onclick=()=>{selected=tray.find(piece=>piece.id===+button.dataset.piece);api.sound('tap');draw();});
    area.querySelectorAll('[data-cell]').forEach(button=>button.onclick=()=>{
      if(!selected||stopped)return;const [row,col]=button.dataset.cell.split(',').map(Number);
      if(!canPlace(board,selected.shape,row,col)){button.classList.add('wrong');api.sound('wrong');setTimeout(()=>button.classList.remove('wrong'),250);return;}
      selected.shape.forEach(([x,y])=>board[row+y][col+x]=selected.color);score+=selected.shape.length*5;tray=tray.filter(piece=>piece.id!==selected.id);selected=null;
      const lines=clearLines();if(lines){score+=lines*levelReward(level,40);api.sound('match');}else api.sound('tap');api.onScore(score);
      if(!tray.length){level++;score+=levelReward(level,20);api.onScore(score);tray=makeTray();}
      if(!tray.some(piece=>available(piece.shape))){stopped=true;setTimeout(()=>api.onEnd(score),400);return;}draw();
    });
  }
  next();return()=>{stopped=true;};
}

const hiddenCatalog=[['⚽','Bola'],['🎀','Laço'],['🐟','Peixinho'],['🔑','Chave'],['🧦','Meia'],['🦴','Osso'],['⭐','Estrela'],['🪁','Pipa'],['🍎','Maçã']];
export function hiddenGame(area,api){
  let level=1,score=0,interval=0,stopped=false;
  function round(){
    clearInterval(interval);const d=prototypeDifficulty('hidden',level);let seconds=d.seconds;
    const targets=shuffle(hiddenCatalog).slice(0,d.targets).map(([symbol,name],id)=>({id,symbol,name,x:7+Math.random()*84,y:12+Math.random()*70}));
    const decoys=Array.from({length:d.decoys},()=>({symbol:pick(['🌸','📚','🪴','🧸','🖼️','🛋️']),x:5+Math.random()*88,y:10+Math.random()*72}));
    const found=new Set();
    area.innerHTML=`${gameHeader(score,level,`<i id="hidden-time">${seconds}s</i>`)}<p class="proto-help">Encontre os objetos da lista.</p><div class="hidden-room" style="--object-scale:${d.scale}"><div class="hidden-window"><i></i></div><div class="hidden-bed">🛏️</div><div class="hidden-shelf">📚 🪴</div><div class="hidden-rug"></div><span class="hidden-pet">🐶</span>${decoys.map(o=>`<span class="hidden-decoy" style="--x:${o.x}%;--y:${o.y}%">${o.symbol}</span>`).join('')}${targets.map(o=>`<button data-hidden="${o.id}" style="--x:${o.x}%;--y:${o.y}%" aria-label="${o.name}">${o.symbol}</button>`).join('')}</div><div class="hidden-list">${targets.map(o=>`<span data-target="${o.id}">${o.symbol}<small>${o.name}</small></span>`).join('')}</div>`;
    area.querySelectorAll('[data-hidden]').forEach(button=>button.onclick=()=>{
      const id=+button.dataset.hidden;if(stopped||found.has(id))return;found.add(id);button.classList.add('found');area.querySelector(`[data-target="${id}"]`).classList.add('found');score+=15+Math.ceil(seconds/10);api.onScore(score);api.sound('match');
      if(found.size===targets.length){clearInterval(interval);score+=levelReward(level,30);api.onScore(score);setTimeout(()=>{level++;round();},600);}
    });
    interval=setInterval(()=>{seconds--;const timer=area.querySelector('#hidden-time');if(timer)timer.textContent=seconds+'s';if(seconds<=0){clearInterval(interval);stopped=true;api.sound('wrong');api.onEnd(score);}},1000);
  }
  round();return()=>{stopped=true;clearInterval(interval);};
}

const treats=['🦴','🐟','🍓','🥕','🐾','🥛'];
export function match3Game(area,api){
  let level=1,score=0,levelStart=0,target=0,moves=0,board=[],selected=null,locked=false,stopped=false;
  function makeBoard(size,kinds){
    const values=treats.slice(0,kinds),result=Array.from({length:size},()=>Array(size));
    for(let r=0;r<size;r++)for(let c=0;c<size;c++){const allowed=values.filter(value=>!(c>1&&result[r][c-1]===value&&result[r][c-2]===value)&&!(r>1&&result[r-1][c]===value&&result[r-2][c]===value));result[r][c]=pick(allowed);}
    return result;
  }
  function collapse(){const size=board.length;for(let c=0;c<size;c++){const values=[];for(let r=size-1;r>=0;r--)if(board[r][c])values.push(board[r][c]);for(let r=size-1,index=0;r>=0;r--,index++)board[r][c]=values[index]||pick(treats.slice(0,prototypeDifficulty('match3',level).kinds));}}
  async function resolve(){
    let chain=0,hits=findMatches(board);
    while(hits.size&&!stopped){chain++;hits.forEach(key=>{const [r,c]=key.split(',').map(Number);board[r][c]=null;});score+=hits.size*10*chain;api.onScore(score);api.sound('match');draw(hits);await wait(260);collapse();draw();await wait(220);hits=findMatches(board);}
    locked=false;
    if(score-levelStart>=target){score+=Math.max(0,moves)*5+levelReward(level,25);api.onScore(score);level++;setTimeout(round,550);}
    else if(moves<=0){stopped=true;api.onEnd(score);}else draw();
  }
  function round(){const d=prototypeDifficulty('match3',level);board=makeBoard(d.size,d.kinds);moves=d.moves;target=d.target;levelStart=score;selected=null;locked=false;draw();}
  function draw(clearing=new Set()){
    const progress=clamp((score-levelStart)/target*100,0,100),size=board.length;
    area.innerHTML=`${gameHeader(score,level,`${moves} jogadas`)}<div class="match-progress"><span style="width:${progress}%"></span></div><p class="proto-help">Meta: ${target} pontos nesta fase</p><div class="match-board" style="--match-size:${size}">${board.flatMap((row,r)=>row.map((value,c)=>`<button data-gem="${r},${c}" class="${selected?.[0]===r&&selected?.[1]===c?'selected':''} ${clearing.has(`${r},${c}`)?'clearing':''}" aria-label="Petisco ${value||''}">${value||''}</button>`)).join('')}</div>`;
    area.querySelectorAll('[data-gem]').forEach(button=>button.onclick=async()=>{
      if(locked||stopped)return;const current=button.dataset.gem.split(',').map(Number);
      if(!selected){selected=current;api.sound('tap');draw();return;}
      const [r,c]=selected,[r2,c2]=current;selected=null;if(Math.abs(r-r2)+Math.abs(c-c2)!==1){draw();return;}
      [board[r][c],board[r2][c2]]=[board[r2][c2],board[r][c]];const hits=findMatches(board);
      if(!hits.size){[board[r][c],board[r2][c2]]=[board[r2][c2],board[r][c]];api.sound('wrong');draw();return;}
      moves--;locked=true;draw();await resolve();
    });
  }
  round();return()=>{stopped=true;};
}

export function prototypeGame(kind,area,api){
  const games={sorting:sortingGame,blocks:blocksGame,hidden:hiddenGame,match3:match3Game};
  if(!games[kind])throw new Error(`Jogo desconhecido: ${kind}`);
  return games[kind](area,api);
}
