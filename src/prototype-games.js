import {treatSvgs,treatIds} from './treat-assets.js';
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
    moves:Math.max(18,30-Math.floor((n-1)/2)),
    target:450+(n-1)*120,
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

// Only adjacent swaps that really create 3+ matching treats are playable.
// This check never changes the caller's board.
export function findAvailableMatch3Swap(board){
 const rows=board?.length||0,cols=board?.[0]?.length||0;
 if(rows<3||cols<3)return null;
 for(let r=0;r<rows;r++)for(let col=0;col<cols;col++)for(const [dr,dc] of [[0,1],[1,0]]){
  const nr=r+dr,nc=col+dc;
  if(nr>=rows||nc>=cols||!board[r][col]||!board[nr][nc]||board[r][col]===board[nr][nc])continue;
  [board[r][col],board[nr][nc]]=[board[nr][nc],board[r][col]];
  const matches=findMatches(board).size>0;
  [board[r][col],board[nr][nc]]=[board[nr][nc],board[r][col]];
  if(matches)return {from:[r,col],to:[nr,nc]};
 }
 return null;
}

// Used on the first board AND after cascades. A player can never be
// stranded with no available combination. Reshuffling costs no moves.
export function reshuffleMatch3Board(board){
 const size=board.length,flat=board.flat().filter(Boolean);
 if(size<3||board.some(row=>row.length!==size)||flat.length!==size*size)return board;
 for(let attempt=0;attempt<120;attempt++){
  const pieces=shuffle(flat);
  const next=Array.from({length:size},(_,r)=>pieces.slice(r*size,(r+1)*size));
  if(!findMatches(next).size&&findAvailableMatch3Swap(next))return next;
 }
 // Deterministic fallback: a B a in the first row, with 'a' below B.
 // This also guarantees that a rare unlucky shuffle cannot loop forever.
 const values=[...new Set(flat)];
 if(values.length<3)return board;
 const next=Array.from({length:size},(_,r)=>Array.from({length:size},(_,col)=>values[(r+col)%values.length]));
 next[0][0]=values[0];next[0][1]=values[1];next[0][2]=values[0];next[1][1]=values[0];
 if(findMatches(next).size||!findAvailableMatch3Swap(next)){
  throw new Error('Não foi possível gerar um tabuleiro jogável.');
 }
 return next;
}

export function canPlace(board,shape,row,col){
  return shape.every(([x,y])=>row+y>=0&&col+x>=0&&row+y<board.length&&col+x<board[0].length&&!board[row+y][col+x]);
}

const pick=list=>list[Math.floor(Math.random()*list.length)];
const shuffle=list=>{const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function gameHeader(score,level,detail){return `<div class="proto-hud"><b>${score} pontos</b><span>Fase ${level} · ${levelBand(level)}</span><span>${detail}</span></div>`;}

const blockShapes=[
 [[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],
 [[0,0],[1,0],[0,1]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[0,1],[0,2],[1,2]]
];
export function blocksGame(area,api){
  const size=8;let level=1,score=0,board=[],tray=[],selected=null,stopped=false,linesDone=0;
  const empty=()=>Array.from({length:size},()=>Array(size).fill(0));
  function seed(count,colors){for(let n=0;n<count;n++){const open=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(!board[r][c])open.push([r,c]);if(!open.length)return;const [r,c]=pick(open);board[r][c]=1+Math.floor(Math.random()*colors);}}
  function available(shape){for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(canPlace(board,shape,r,c))return true;return false;}
  function makeTray(){const d=prototypeDifficulty('blocks',level),pool=blockShapes.filter((_,i)=>i<5||Math.random()<d.largeChance);return Array.from({length:3},(_,id)=>({id,shape:pick(pool),color:1+Math.floor(Math.random()*d.colors)}));}
  const lineGoal=()=>Math.min(6,2+Math.floor((level-1)/4));
  function clearLines(){let lines=0;for(let r=0;r<size;r++)if(board[r].every(Boolean)){board[r].fill(0);lines++;}for(let c=0;c<size;c++)if(board.every(row=>row[c])){board.forEach(row=>row[c]=0);lines++;}return lines;}
  function anchor(shape,row,col){const width=Math.max(...shape.map(p=>p[0]))+1,height=Math.max(...shape.map(p=>p[1]))+1;return [clamp(row-Math.floor(height/2),0,size-height),clamp(col-Math.floor(width/2),0,size-width)];}
  function preview(row,col){area.querySelectorAll('[data-cell]').forEach(cell=>cell.classList.remove('drop-preview','drop-invalid'));if(!selected)return;const [r,c]=anchor(selected.shape,row,col),ok=canPlace(board,selected.shape,r,c);selected.shape.forEach(([x,y])=>area.querySelector(`[data-cell="${r+y},${c+x}"]`)?.classList.add(ok?'drop-preview':'drop-invalid'));}
  function place(row,col){if(!selected||stopped)return;const [r,c]=anchor(selected.shape,row,col);if(!canPlace(board,selected.shape,r,c)){api.sound('wrong');preview(row,col);return;}selected.shape.forEach(([x,y])=>board[r+y][c+x]=selected.color);score+=selected.shape.length;tray=tray.filter(piece=>piece.id!==selected.id);selected=null;const lines=clearLines();if(lines){linesDone+=lines;score+=lines*(5+Math.min(level,10));api.sound('match');}else api.sound('tap');api.onScore(score);if(linesDone>=lineGoal()){score+=10+level*2;api.onScore(score);level++;setTimeout(next,550);return;}if(!tray.length)tray=makeTray();if(!tray.some(piece=>available(piece.shape))){stopped=true;setTimeout(()=>api.onEnd(score),400);return;}draw();}
  function next(){const d=prototypeDifficulty('blocks',level);linesDone=0;board=empty();seed(d.seeded,d.colors);tray=makeTray();draw();}
  function draw(){
    area.innerHTML=`${gameHeader(score,level,`Linhas ${linesDone}/${lineGoal()}`)}<div class="block-board" style="--block-size:${size}">${board.flatMap((row,r)=>row.map((value,c)=>`<button data-cell="${r},${c}" class="block-color-${value}" aria-label="Linha ${r+1}, coluna ${c+1}"></button>`)).join('')}</div><p class="proto-help">Arraste a peça para o tabuleiro ou toque na peça e no local.</p><div class="block-tray">${tray.map(piece=>{const width=Math.max(...piece.shape.map(p=>p[0]))+1,height=Math.max(...piece.shape.map(p=>p[1]))+1;return `<button data-piece="${piece.id}" class="${selected?.id===piece.id?'selected':''}"><i class="piece-preview" style="--pw:${width};--ph:${height}">${piece.shape.map(([x,y])=>`<span class="block-color-${piece.color}" style="--x:${x};--y:${y}"></span>`).join('')}</i></button>`;}).join('')}</div>`;
    area.querySelectorAll('[data-piece]').forEach(button=>{
      let start=null,moved=false,suppressClick=false,lastCell='';
      const choose=()=>{selected=tray.find(piece=>piece.id===+button.dataset.piece);area.querySelectorAll('[data-piece]').forEach(x=>x.classList.toggle('selected',x===button));api.sound('tap');};
      const resetDrag=()=>{button.classList.remove('piece-dragging');button.style.removeProperty('--piece-x');button.style.removeProperty('--piece-y');};
      button.onclick=()=>{if(suppressClick){suppressClick=false;return;}choose();};
      button.onpointerdown=event=>{choose();start=[event.clientX,event.clientY];moved=false;lastCell='';button.setPointerCapture?.(event.pointerId);};
      button.onpointermove=event=>{
        if(!selected||!start)return;const dx=event.clientX-start[0],dy=event.clientY-start[1];if(Math.hypot(dx,dy)>6)moved=true;if(!moved)return;
        event.preventDefault();button.classList.add('piece-dragging');button.style.setProperty('--piece-x',`${dx}px`);button.style.setProperty('--piece-y',`${dy}px`);
        const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-cell]');if(cell&&area.contains(cell)&&cell.dataset.cell!==lastCell){lastCell=cell.dataset.cell;const [row,col]=lastCell.split(',').map(Number);preview(row,col);}
      };
      button.onpointerup=event=>{const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-cell]');resetDrag();start=null;if(moved)suppressClick=true;if(cell&&area.contains(cell)){event.preventDefault();const [row,col]=cell.dataset.cell.split(',').map(Number);place(row,col);}};
      button.onpointercancel=()=>{resetDrag();start=null;moved=false;};
    });
    area.querySelectorAll('[data-cell]').forEach(button=>{
      button.onpointerenter=()=>{if(selected){const [row,col]=button.dataset.cell.split(',').map(Number);preview(row,col);}};
      button.onclick=()=>{const [row,col]=button.dataset.cell.split(',').map(Number);place(row,col);};
    });
  }
  next();return()=>{stopped=true;};
}

const treats=treatIds;
export function match3Game(area,api){
  let level=1,score=0,levelStart=0,target=0,moves=0,board=[],selected=null,locked=false,stopped=false,shuffleMessage='';
  function makeBoard(size,kinds){
    const values=treats.slice(0,kinds),result=Array.from({length:size},()=>Array(size));
    for(let r=0;r<size;r++)for(let c=0;c<size;c++){const allowed=values.filter(value=>!(c>1&&result[r][c-1]===value&&result[r][c-2]===value)&&!(r>1&&result[r-1][c]===value&&result[r-2][c]===value));result[r][c]=pick(allowed);}
    return result;
  }
  function collapse(){const size=board.length;for(let c=0;c<size;c++){const values=[];for(let r=size-1;r>=0;r--)if(board[r][c])values.push(board[r][c]);for(let r=size-1,index=0;r>=0;r--,index++)board[r][c]=values[index]||pick(treats.slice(0,prototypeDifficulty('match3',level).kinds));}}
  async function resolve(){
    let chain=0,hits=findMatches(board);
    while(hits.size&&!stopped){chain++;hits.forEach(key=>{const [r,c]=key.split(',').map(Number);board[r][c]=null;});score+=hits.size*10*chain;api.onScore(score);api.sound('match');draw(hits);await wait(260);collapse();draw();await wait(220);hits=findMatches(board);}
    if(stopped)return;
    if(score-levelStart<target&&moves>0&&!findAvailableMatch3Swap(board)){
      board=reshuffleMatch3Board(board);
      shuffleMessage='Sem combinações! Embaralhei os petiscos, sem gastar jogadas.';
    }
    locked=false;
    if(score-levelStart>=target){score+=Math.max(0,moves)*5+levelReward(level,25);api.onScore(score);level++;setTimeout(round,550);}
    else if(moves<=0){stopped=true;api.onEnd(score);}else draw();
  }
  function round(){if(stopped)return;const d=prototypeDifficulty('match3',level);const initial=makeBoard(d.size,d.kinds);board=findAvailableMatch3Swap(initial)?initial:reshuffleMatch3Board(initial);moves=d.moves;target=d.target;levelStart=score;selected=null;locked=false;shuffleMessage='';draw();}
  async function attempt(from,current){
    if(locked||stopped)return false;const [r,c]=from,[r2,c2]=current;if(Math.abs(r-r2)+Math.abs(c-c2)!==1)return false;
    locked=true;[board[r][c],board[r2][c2]]=[board[r2][c2],board[r][c]];draw();
    area.querySelector(`[data-gem="${r},${c}"]`)?.classList.add('swap-from');
    area.querySelector(`[data-gem="${r2},${c2}"]`)?.classList.add('swap-to');
    await wait(170);const hits=findMatches(board);
    if(!hits.size){[board[r][c],board[r2][c2]]=[board[r2][c2],board[r][c]];api.sound('wrong');selected=null;draw();area.querySelector(`[data-gem="${r},${c}"]`)?.classList.add('swap-reject');locked=false;return false;}
    selected=null;shuffleMessage='';moves--;draw();await resolve();return true;
  }
  function draw(clearing=new Set()){
    const progress=clamp((score-levelStart)/target*100,0,100),size=board.length;
    area.innerHTML=`${gameHeader(score,level,`${moves} jogadas`)}<div class="match-progress"><span style="width:${progress}%"></span></div><p class="proto-help">Meta: ${target} pontos nesta fase</p><div class="match-board" style="--match-size:${size}">${board.flatMap((row,r)=>row.map((value,c)=>`<button data-gem="${r},${c}" class="${selected?.[0]===r&&selected?.[1]===c?'selected':''} ${clearing.has(`${r},${c}`)?'clearing':''}" aria-label="Petisco ${value||''}"><span class="treat-art treat-${Math.max(0,treats.indexOf(value))}">${value?treatSvgs[value]:''}</span></button>`)).join('')}</div><p class="match-status" role="status" aria-live="polite">${shuffleMessage}</p>`;
    // Capture input on the board, not on a petisco that may move or rerender.
    // A swipe always means ONE adjacent move in its dominant direction.
    const grid=area.querySelector('.match-board');
    const positionOf=element=>element?.closest?.('[data-gem]')?.dataset.gem?.split(',').map(Number);
    const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
    const adjacent=(from,dx,dy)=>{
      const horizontal=Math.abs(dx)>=Math.abs(dy);
      const row=from[0]+(horizontal?0:Math.sign(dy)),col=from[1]+(horizontal?Math.sign(dx):0);
      return row>=0&&col>=0&&row<size&&col<size?[row,col]:null;
    };
    const clearDrag=()=>{
      grid.querySelectorAll('[data-gem]').forEach(button=>{
        button.classList.remove('dragging','drag-target');
        button.style.removeProperty('--drag-x');
        button.style.removeProperty('--drag-y');
      });
    };
    const tap=async current=>{
      if(!current||locked||stopped)return;
      if(!selected){selected=current;api.sound('tap');draw();return;}
      if(same(selected,current)){selected=null;draw();return;}
      if(Math.abs(selected[0]-current[0])+Math.abs(selected[1]-current[1])===1){
        await attempt(selected,current);return;
      }
      selected=current;api.sound('tap');draw();
    };
    let active=null;
    grid.onpointerdown=event=>{
      if(locked||stopped||(event.pointerType==='mouse'&&event.button!==0))return;
      const from=positionOf(event.target);
      if(!from)return;
      event.preventDefault();
      active={id:event.pointerId,from,x:event.clientX,y:event.clientY};
      grid.setPointerCapture?.(event.pointerId);
    };
    grid.onpointermove=event=>{
      if(!active||active.id!==event.pointerId)return;
      const dx=event.clientX-active.x,dy=event.clientY-active.y;
      if(Math.hypot(dx,dy)<=8)return;
      event.preventDefault();
      const to=adjacent(active.from,dx,dy);
      const dragged=grid.querySelector('[data-gem="'+active.from.join(',')+'"]');
      const hovered=to?grid.querySelector('[data-gem="'+to.join(',')+'"]'):null;
      grid.querySelectorAll('[data-gem]').forEach(x=>x.classList.toggle('drag-target',x===hovered));
      if(dragged){
        const distance=Math.min(Math.hypot(dx,dy),dragged.getBoundingClientRect().width);
        const length=Math.hypot(dx,dy)||1;
        dragged.style.setProperty('--drag-x',(dx/length*distance)+'px');
        dragged.style.setProperty('--drag-y',(dy/length*distance)+'px');
        dragged.classList.add('dragging');
      }
    };
    grid.onpointerup=async event=>{
      if(!active||active.id!==event.pointerId)return;
      event.preventDefault();
      const {from,x,y}=active,dx=event.clientX-x,dy=event.clientY-y;
      active=null;clearDrag();
      if(Math.hypot(dx,dy)>8){
        const to=adjacent(from,dx,dy);
        selected=null;
        if(to)await attempt(from,to);
        else draw();
      }else await tap(from);
    };
    grid.onpointercancel=()=>{
      active=null;clearDrag();
    };
    // Keyboard and screen-reader activation of a gem still uses tap-to-swap.
    grid.onclick=event=>{
      if(event.detail!==0)return;
      tap(positionOf(event.target));
    };
  }
  round();return()=>{stopped=true;};
}

export function prototypeGame(kind,area,api){
  const games={blocks:blocksGame,match3:match3Game};
  if(!games[kind])throw new Error(`Jogo desconhecido: ${kind}`);
  return games[kind](area,api);
}
