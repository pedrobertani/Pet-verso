export const paintedModels={'bed-painted':'bed-basic','bed-cloud-painted':'bed-cloud','bed-moon-painted':'bed-moon','dresser-painted':'dresser-basic','shelf-painted':'shelf','table-painted':'table','bench-painted':'bench','lamp-painted':'lamp-basic'};
export const legacyColorItems=new Set(['dresser-mint','dresser-rose','lamp-rose','tub-mint','tub-rose']);
export const itemColors=[
 {id:'blue',name:'Azul',hex:'#9ed8ee'},{id:'pink',name:'Rosa',hex:'#efb0cf'},
 {id:'green',name:'Verde',hex:'#a7dcc3'},{id:'yellow',name:'Amarelo',hex:'#f6df98'},
 {id:'black',name:'Preto suave',hex:'#616979'},{id:'purple',name:'Roxo',hex:'#c5afe9'},
 {id:'orange',name:'Laranja',hex:'#efbe98'}
];
export function validItemColor(id){return itemColors.some(c=>c.id===id);}
export function ownsItem(p,item){return !!(item&&(item.price===0||p.inventory?.includes(item.id)));}
export function defaultItemColor(id){return /mint|leaf/.test(id)?'green':/rose/.test(id)?'pink':/moon/.test(id)?'blue':/lamp-basic/.test(id)?'yellow':'purple';}
export function recolorItem(svg,color,id=''){
 const palette=itemColors.find(c=>c.id===(color||(paintedModels[id]?'purple':undefined)));if(!svg||!palette)return svg;
 const full=!!paintedModels[id];
 const accents={
 'rug':['#986ab5','#bd90dc'],
 'shelf':['#79c9ce','#bb9be2','#f291ae'],
 'table':['#ffe0aa'], 'bench':['#688c83'],
 'swing':['#f49ab3','#c66c91'],
 'slide':['#4eafc0','#85dde2','#ad8cdc'],
 'trampoline':['#936ebc','#b8a0df','#91c9d4'],
 'ball':['#ec787f'],
 'rocket':['#d9b4fc','#8660be','#e887a7','#b75c7d'],
 'plant':['#e98a6b'],
 };
 const allowed=id.startsWith('bed-')?['#d9b4fc','#8660be','#b5ef97','#44a78b','#a4e6fb','#5783cf']:id.startsWith('dresser-')?['#b48562']:id.startsWith('lamp-')?['#efaac9','#ffe19d']:accents[id];
 const base=palette.hex.slice(1).match(/../g).map(h=>parseInt(h,16));
 return svg.replace(/(fill|stroke|stop-color)="(#[0-9a-fA-F]{6})"/g,(whole,attribute,hex)=>{
  const rgb=hex.slice(1).match(/../g).map(h=>parseInt(h,16)),max=Math.max(...rgb),min=Math.min(...rgb),l=(max+min)/510;
  if(max-min<16||l>.94||l<.16)return whole;
  if(!full&&allowed&&!allowed.includes(hex.toLowerCase()))return whole;
  // Natural materials keep their original finish; unlisted toys use colored accents only.
  if(!full&&!allowed&&rgb[0]>rgb[2]*1.15&&rgb[1]>rgb[2]*1.08&&rgb[0]>rgb[1])return whole;
  // Keep leaves and water recognizable; only the decorative structure is painted.
  if(id==='plant'&&rgb[1]>rgb[0]*1.12&&rgb[1]>rgb[2]*1.08)return whole;
  if(/pool|swim|waterwheel|tub/.test(id)&&rgb[2]>rgb[0]*1.15&&rgb[1]>rgb[0]*1.1)return whole;
  if(full&&['#fff0a8','#f7eeff','#e0f5a5','#70ae70'].includes(hex.toLowerCase()))return whole;
  const amount=(l-.65)*.85,paint=base.map(n=>Math.round(amount>0?n+(255-n)*amount:n*(1+amount))).map(n=>n.toString(16).padStart(2,'0')).join('');
  return `${attribute}="#${paint}"`;
 });
}
