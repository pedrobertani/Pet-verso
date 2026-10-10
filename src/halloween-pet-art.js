// Halloween pets: separate anatomy groups for growth and directional movement.
const g=(c,s)=>`<g class="${c}">${s}</g>`;
const eyes=(m)=>['sleep','sleepy'].includes(m)?'<g class="eyes"><path d="M70 95q10 9 20 0M110 95q10 9 20 0" fill="none" stroke="#354255" stroke-width="3" stroke-linecap="round"/></g>':'<g class="eyes"><ellipse cx="80" cy="94" rx="8" ry="10" fill="#354255"/><ellipse cx="120" cy="94" rx="8" ry="10" fill="#354255"/><circle cx="82" cy="90" r="3" fill="white"/><circle cx="122" cy="90" r="3" fill="white"/></g>';
const mouth=(m)=>['sleep','sleepy','sad','sick'].includes(m)?'<path class="mouth closed" d="M91 119q9 5 18 0" fill="none" stroke="#64536a" stroke-width="3"/>':'<path class="mouth closed" d="M89 117q11 15 22 0" fill="none" stroke="#64536a" stroke-width="3"/>';
export function halloweenPet(s,m){
 const age=s.growthLevel??2,baby=age===0,young=age===1,headY=baby?101:young?97:92,headRx=baby?43:young?42:40,headRy=baby?42:young?39:37;
 if(s.id==='sombrios-frankie'){
  const skin='#9adba0',shadow='#68ad86',hair='#49315f';
  const outfit=baby?'<path d="M76 132q24-9 48 0v37q-24 10-48 0Z" fill="#8060a4" stroke="#563d78" stroke-width="2"/><path d="M79 131l10 15m32-15-10 15" stroke="#c6a7e6" stroke-width="5"/><circle cx="89" cy="145" r="3" fill="#f8d57c"/><circle cx="111" cy="145" r="3" fill="#f8d57c"/><path d="M96 155l8 5-8 5" fill="none" stroke="#d7b9f1" stroke-width="2"/>':young?'<path d="M74 128q26-9 52 0l-3 43q-23 8-46 0Z" fill="#775296" stroke="#50346b" stroke-width="2"/><path d="M81 130l11 14h16l11-14" fill="none" stroke="#b899d4" stroke-width="5"/><path d="M93 151h14m-14 7h14" stroke="#e6c47d" stroke-width="2"/>':'<path d="M72 126q28-12 56 0l-3 46q-25 10-50 0Z" fill="#62447e" stroke="#3f2d60" stroke-width="2"/><path d="M78 132l17 15h10l17-15" fill="none" stroke="#aa8cc9" stroke-width="5"/><path d="M88 151l7 6-7 6m24-12-7 6 7 6" fill="none" stroke="#e5c27b" stroke-width="2"/>';
  const fringe=`<path d="M${100-headRx-3} ${headY-10}Q${100-headRx-9} ${headY-37} ${100-headRx+4} ${headY-43}L${100-headRx+12} ${headY-59}L${100-headRx+25} ${headY-49}L${100-headRx+39} ${headY-65}L${100-headRx+53} ${headY-50}L${100-headRx+66} ${headY-61}L${100+headRx-7} ${headY-45}Q${100+headRx+9} ${headY-36} ${100+headRx+3} ${headY-8}L${100+headRx-4} ${headY-22}L${100+headRx-15} ${headY-17}L${100+headRx-26} ${headY-25}L${100+headRx-38} ${headY-15}L${100+headRx-50} ${headY-24}L${100-headRx+16} ${headY-15}Z" fill="${hair}" stroke="#38264d" stroke-width="2"/>`;
  return g('pet-body',`<rect x="71" y="119" width="58" height="54" rx="22" fill="${skin}" stroke="${shadow}" stroke-width="2"/>${outfit}`)+
  g('pet-arm arm-left',`<path d="M74 129q-19-1-20 20l-1 10q8 10 17 0l10-23" fill="${skin}" stroke="${shadow}" stroke-width="2"/>`)+
  g('pet-arm arm-right',`<path d="M126 129q19-1 20 20l1 10q-8 10-17 0l-10-23" fill="${skin}" stroke="${shadow}" stroke-width="2"/>`)+
  g('pet-leg leg-0',`<path d="M77 162v19q0 9 21 5v-24" fill="${skin}" stroke="${shadow}" stroke-width="2"/>`)+
  g('pet-leg leg-1',`<path d="M102 162v24q21 4 21-5v-19" fill="${skin}" stroke="${shadow}" stroke-width="2"/>`)+
  g('pet-head',`<rect x="${100-headRx}" y="${headY-headRy}" width="${headRx*2}" height="${headRy*2+9}" rx="25" fill="${skin}" stroke="${shadow}" stroke-width="2"/>${fringe}<path d="M69 72l10 4 9-3m22 0 10 4 10-4" stroke="#8d63a5" stroke-width="3" fill="none"/><rect x="49" y="${headY+1}" width="15" height="15" rx="4" fill="#b8c6d2" stroke="#657587" stroke-width="2"/><rect x="136" y="${headY+1}" width="15" height="15" rx="4" fill="#b8c6d2" stroke="#657587" stroke-width="2"/><path d="M80 ${headY-21}l8 5 8-5 8 5 8-5" fill="none" stroke="#527e68" stroke-width="2"/>${eyes(m)}${mouth(m)}<circle cx="64" cy="112" r="5" fill="#ef9eb0" opacity=".55"/><circle cx="136" cy="112" r="5" fill="#ef9eb0" opacity=".55"/>`);
 }
 if(s.id==='sombrios-6'){
  const linen='#f4dfb6',edge='#c8a477';
  const wrap='<path d="M66 139l65 16M70 153l59-22M76 164l47-16" stroke="#c8a477" stroke-width="5" opacity=".8"/>';
  return g('pet-body',`<ellipse cx="100" cy="145" rx="32" ry="35" fill="${linen}" stroke="${edge}" stroke-width="2"/>${wrap}`)+
   g('pet-arm arm-left',`<path d="M72 132q-20-2-23 24l13 5 18-21" fill="${linen}" stroke="${edge}" stroke-width="3"/><path d="M56 146l13 5" stroke="${edge}" stroke-width="3"/>`)+
   g('pet-arm arm-right',`<path d="M128 132q20-2 23 24l-13 5-18-21" fill="${linen}" stroke="${edge}" stroke-width="3"/><path d="M144 146l-13 5" stroke="${edge}" stroke-width="3"/>`)+
   g('pet-leg leg-0',`<path d="M77 160v21q0 8 21 5v-23" fill="${linen}" stroke="${edge}" stroke-width="2"/>`)+
   g('pet-leg leg-1',`<path d="M102 163v23q21 3 21-5v-21" fill="${linen}" stroke="${edge}" stroke-width="2"/>`)+
   g('pet-head',`<ellipse cx="100" cy="${headY}" rx="${headRx}" ry="${headRy}" fill="${linen}" stroke="${edge}" stroke-width="2"/><path d="M64 ${headY-25}q36 22 72-1M61 ${headY-8}q38-20 78 3M64 ${headY+16}q36-14 72 5" fill="none" stroke="#d4b88b" stroke-width="9"/><path d="M65 ${headY-26}q35 21 70-1M61 ${headY-8}q40-20 78 3M64 ${headY+16}q36-14 72 5" fill="none" stroke="#a98961" stroke-width="1.5"/><path d="M132 73q20-18 24-4t-11 23" fill="none" stroke="${linen}" stroke-width="11" stroke-linecap="round"/>${eyes(m)}${mouth(m)}`);
 }
 return null;
}
