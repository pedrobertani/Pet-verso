// Replace the expression inside the head so growth and tricks move it together.
export function babyPacifier(art,id){
 const match=/<(?:g|path) class="mouth [^"]*"/.exec(art);
 let start,end,x,y;
 if(match){
  start=match.index;
  if(match[0].startsWith('<g')){let depth=1;const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=art.indexOf('>',start)+1;let tag;while(depth&&(tag=tags.exec(art))){depth+=tag[0]==='</g>'?-1:1;}end=tags.lastIndex;}
  else end=art.indexOf('/>',start)+2;
  const piece=art.slice(start,end),point=/d="M([\d.-]+) ([\d.-]+)([Qq])([\d.-]+)/.exec(piece);
  if(point){x=point[3]==='Q'?Number(point[4]):Number(point[1])+Number(point[4]);y=Number(point[2])+3;}
 }
 if(x===undefined){[x,y]=({'exoticos-penguin':[100,109],'dinos-pterosaur':[131,94],'selva-owl':[100,94],'selva-2':[100,120],'pets-mouse':[166,169]})[id]||[100,120];if(!match){const head=/<g class="pet-head">/.exec(art);if(!head)return art;start=end=head.index+head[0].length;}}
 if(id==='pets-mouse'){[x,y]=art.includes('mouse-rise')?[166,169]:[100,129];}
 // Keep the dragon shield on the projecting muzzle, clear of the belly and arm.
 if(id==='sombrios-dragon'){x=139;y=104;}
 const drawing=`<g class="pet-pacifier" transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="11" ry="6" fill="#9ce2e3" stroke="#4d9cab" stroke-width="1.5"/><ellipse cx="-5" cy="-1" rx="2" ry="1.4" fill="#e5fcf5"/><ellipse cx="5" cy="-1" rx="2" ry="1.4" fill="#e5fcf5"/><circle cy="2" r="3.5" fill="#ef98bb"/><ellipse cy="8" rx="5" ry="5" fill="none" stroke="#d66d9c" stroke-width="2.5"/></g>`;
 // Species with a beak/trunk draw those shapes after the insertion point.
 if(!match){const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=end;let depth=1,tag;while(depth&&(tag=tags.exec(art))){depth+=tag[0]==='</g>'?-1:1;}start=end=tags.lastIndex-4;}
 return art.slice(0,start)+drawing+art.slice(end);
}
