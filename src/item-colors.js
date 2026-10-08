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
 const palette=itemColors.find(c=>c.id===color);if(!svg||!palette)return svg;
 const base=palette.hex.slice(1).match(/../g).map(h=>parseInt(h,16));
 return svg.replace(/(fill|stroke|stop-color)="(#[0-9a-fA-F]{6})"/g,(whole,attribute,hex)=>{
  const rgb=hex.slice(1).match(/../g).map(h=>parseInt(h,16)),max=Math.max(...rgb),min=Math.min(...rgb),l=(max+min)/510;
  if(max-min<16||l>.94||l<.16)return whole;
  // Keep leaves and water recognizable; only the decorative structure is painted.
  if(id==='plant'&&rgb[1]>rgb[0]*1.12&&rgb[1]>rgb[2]*1.08)return whole;
  if(/pool|swim|waterwheel|tub/.test(id)&&rgb[2]>rgb[0]*1.15&&rgb[1]>rgb[0]*1.1)return whole;
  const amount=(l-.65)*.85,paint=base.map(n=>Math.round(amount>0?n+(255-n)*amount:n*(1+amount))).map(n=>n.toString(16).padStart(2,'0')).join('');
  return `${attribute}="#${paint}"`;
 });
}
