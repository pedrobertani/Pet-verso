// Open contours omit the upper attachment seam while keeping the sides and foot.
function openLimbContour(d){
 const commands=d.match(/[a-zA-Z][^a-zA-Z]*/g)||[],numbers=t=>(t.match(/-?\d*\.?\d+/g)||[]).map(Number);
 if(commands.length<2)return d.replace(/[Zz]$/,'');
 const [x,y]=numbers(commands[0]),first=commands[1],n=numbers(first);let endpoint=null;
 if(first[0]==='h')endpoint=[x+n[0],y];
 else if(first[0]==='H')endpoint=[n[0],y];
 else if(first[0]==='q'&&Math.abs(n[3])<=4)endpoint=[x+n[2],y+n[3]];
 else if(first[0]==='l'&&Math.abs(n[1])<=4)endpoint=[x+n[0],y+n[1]];
 return (endpoint?`M${endpoint[0]} ${endpoint[1]}`+commands.slice(2).join(''):d).replace(/[Zz]$/,'');
}
let limbClipId=0;
// Feet share one base coat; outlines separate overlapping limbs instead of dark fills.
export function consistentPaws(svg){
 const matches=[...svg.matchAll(/<g class="(?:pet-leg|pet-arm)[^\"]*">/g)];if(!matches.length)return svg;
 const regions=matches.map(m=>{let depth=1;const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=m.index+m[0].length;let tag;while(depth&&(tag=tags.exec(svg)))depth+=tag[0]==='</g>'?-1:1;return {start:m.index,end:tags.lastIndex};});
 const legs=regions.filter(r=>svg.slice(r.start,r.end).startsWith('<g class="pet-leg'));const last=legs.at(-1)||regions.at(-1),sample=svg.slice(last.start,last.end),color=/fill="(?!none)([^"]+)"/.exec(sample)?.[1];if(!color)return svg;
 for(const r of regions.reverse()){let art=svg.slice(r.start,r.end);art=art.replace(/<(path|ellipse|circle)([^>]*)(\/)>/g,(whole,tag,attrs)=>{if(!/fill="(?!none)/.test(attrs)){if(tag!=='path'||!svg.slice(r.start,r.end).startsWith('<g class="pet-arm'))return whole;const d=/d="([^"]+)"/.exec(attrs)?.[1],width=Number(/stroke-width="([^"]+)"/.exec(attrs)?.[1]);if(!d||!width)return whole;const start=/M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(d);const line=attrs.replace(/stroke="[^"]+"/,'stroke="#354557"').replace(/stroke-width="[^"]+"/,`stroke-width="${width+2.4}"`);const coat=/stroke="([^"]+)"/.exec(attrs)?.[1];return `<path class="limb-side-outline"${line}/>`+whole+(start?`<circle cx="${start[1]}" cy="${start[2]}" r="${width/2+1.3}" fill="${coat}"/>`:'');}if(/opacity=/.test(attrs))return whole;if(svg.slice(r.start,r.end).startsWith('<g class="pet-leg'))attrs=attrs.replace(/fill="[^"]+"/,`fill="${color}"`);if(tag==='path'){const d=/d="([^"]+)"/.exec(attrs)?.[1];if(d){attrs=attrs.replace(/\s*stroke(?:-width|-linejoin|-linecap)?="[^"]*"/g,'');const contour=openLimbContour(d);return `<path${attrs}/><path class="limb-side-outline" d="${contour}" fill="none" stroke="#354557" stroke-opacity=".65" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;}}attrs=attrs.replace(/\s*stroke(?:-width|-linejoin|-linecap)?="[^"]*"/g,'');const value=name=>Number(new RegExp(name+'=\"([^\"]+)\"').exec(attrs)?.[1]||0);const x=value('cx'),y=value('cy'),rx=value(tag==='circle'?'r':'rx'),ry=value(tag==='circle'?'r':'ry');const transform=/transform="([^"]+)"/.exec(attrs)?.[1];return `<${tag}${attrs}/><path class="limb-side-outline" d="M${x-rx*.94} ${y-ry*.34} A${rx} ${ry} 0 1 0 ${x+rx*.94} ${y-ry*.34}" fill="none" stroke="#354557" stroke-opacity=".65" stroke-width="1.2" stroke-linecap="round" ${transform?`transform="${transform}"`:''}/>`;});svg=svg.slice(0,r.start)+art+svg.slice(r.end);}
 const attachmentFloor={'selva-fox':157,'selva-capybara':164,'dinos-2':154,'selva-2':160,'dinos-1':158};
 const species=/species-([\w-]+)/.exec(svg)?.[1],floor=attachmentFloor[species];
 if(floor&&svg.includes('quadruped-pose')){
  const clipId='exposed-paws-'+(++limbClipId);
  svg=svg.replace('</defs>',`<clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="-100" y="${floor}" width="400" height="150"/></clipPath></defs>`);
  svg=svg.replace(/class="limb-side-outline"/g,`class="limb-side-outline" clip-path="url(#${clipId})"`);
 }
 return svg;
}
