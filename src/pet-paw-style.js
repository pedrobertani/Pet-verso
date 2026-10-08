// Feet share one base coat; outlines separate overlapping limbs instead of dark fills.
export function consistentPaws(svg){
 const dinosaur=/species-dinos-[0-3]/.test(svg);
 const matches=[...svg.matchAll(/<g class="pet-leg[^\"]*">/g)];if(!matches.length)return svg;
 const regions=matches.map(m=>{let depth=1;const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=m.index+m[0].length;let tag;while(depth&&(tag=tags.exec(svg)))depth+=tag[0]==='</g>'?-1:1;return {start:m.index,end:tags.lastIndex};});
 const last=regions.at(-1),sample=svg.slice(last.start,last.end),color=/fill="(?!none)([^"]+)"/.exec(sample)?.[1];if(!color)return svg;
 for(const r of regions.reverse()){let art=svg.slice(r.start,r.end);art=art.replace(/<(path|ellipse|circle)([^>]*)(\/)>/g,(whole,tag,attrs)=>{if(!/fill="(?!none)/.test(attrs))return whole;if(/opacity=/.test(attrs))return whole;attrs=attrs.replace(/fill="[^"]+"/,`fill="${color}"`);if(dinosaur&&tag==='path'){const d=/d="([^"]+)"/.exec(attrs)?.[1];if(d){attrs=attrs.replace(/\s*stroke(?:-width|-linejoin|-linecap)?="[^"]*"/g,'');const top=/^M([\d.-]+) ([\d.-]+)h([\d.-]+)(.*)Z$/.exec(d);const contour=top?`M${Number(top[1])+Number(top[3])} ${top[2]}${top[4]}`:d.replace(/[Zz]$/,'');return `<path${attrs}/><path class="limb-side-outline" d="${contour}" fill="none" stroke="#354557" stroke-opacity=".65" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;}}if(!/stroke=/.test(attrs))attrs+=' stroke="#43526055" stroke-width="1.2" stroke-linejoin="round"';return `<${tag}${attrs}/>`;});svg=svg.slice(0,r.start)+art+svg.slice(r.end);}
 return svg;
}
