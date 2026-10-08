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
// Feet share one base coat; outlines separate overlapping limbs instead of dark fills.
export function consistentPaws(svg){
 const matches=[...svg.matchAll(/<g class="pet-leg[^\"]*">/g)];if(!matches.length)return svg;
 const regions=matches.map(m=>{let depth=1;const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=m.index+m[0].length;let tag;while(depth&&(tag=tags.exec(svg)))depth+=tag[0]==='</g>'?-1:1;return {start:m.index,end:tags.lastIndex};});
 const last=regions.at(-1),sample=svg.slice(last.start,last.end),color=/fill="(?!none)([^"]+)"/.exec(sample)?.[1];if(!color)return svg;
 for(const r of regions.reverse()){let art=svg.slice(r.start,r.end);art=art.replace(/<(path|ellipse|circle)([^>]*)(\/)>/g,(whole,tag,attrs)=>{if(!/fill="(?!none)/.test(attrs))return whole;if(/opacity=/.test(attrs))return whole;attrs=attrs.replace(/fill="[^"]+"/,`fill="${color}"`);if(tag==='path'){const d=/d="([^"]+)"/.exec(attrs)?.[1];if(d){attrs=attrs.replace(/\s*stroke(?:-width|-linejoin|-linecap)?="[^"]*"/g,'');const contour=openLimbContour(d);return `<path${attrs}/><path class="limb-side-outline" d="${contour}" fill="none" stroke="#354557" stroke-opacity=".65" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;}}attrs=attrs.replace(/\s*stroke(?:-width|-linejoin|-linecap)?="[^"]*"/g,'');return `<${tag}${attrs}/>`;});svg=svg.slice(0,r.start)+art+svg.slice(r.end);}
 return svg;
}
