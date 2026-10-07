// Species-specific proportions. Adult artwork remains the approved drawing.
export const growthProfiles={
 'dinos-pterosaur':{head:[1,.94],wing:[.58,.78],tail:[.5,.75]},
 'selva-owl':{head:[1.05,1],wing:[.6,.8],tail:[.65,.8]},
 'exoticos-frog':{head:[1.05,1],body:[.7,.86]},
 'pets-0':{head:[1,.96],tail:[.55,.65]},
 'pets-1':{head:[1,.92],tail:[.65,.65]},
 'pets-2':{head:[.86,.72],tail:[.75,.75]},
 'pets-mouse':{head:[1,.97],tail:[.52,.72]},
 'exoticos-0':{head:[.84,.93],tail:[.55,.7]},
 'exoticos-1':{head:[.9,.8],tail:[.6,.65]},
 'exoticos-7':{head:[1,.96],body:[.76,.75],tail:[.7,.7]},
 'selva-0':{head:[.95,.96],body:[.83,.8],tail:[.75,.75]},
 'selva-2':{head:[.9,.95],horns:[0,0],trunk:[.8,.55]},
 'selva-4':{head:[1.06,1],body:[.76,.78]},
 'selva-brown':{head:[1.02,1],body:[.76,.76]},
 'selva-polar':{head:[.95,.98],body:[.77,.78]},
 'selva-capybara':{head:[.8,.94],body:[.76,.83]},
 'selva-fox':{head:[.78,.92],tail:[.58,.7]},
 'exoticos-penguin':{head:[1.03,1],body:[.82,.88],wing:[.7,.8]},
 'dinos-0':{head:[.8,.83],tail:[.5,.65]},
 'dinos-1':{head:[.9,.93],horns:[.25,.3],tail:[.65,.65]},
 'dinos-2':{head:[.88,.58],body:[.86,.88],tail:[.62,.7]},
 'dinos-3':{head:[.97,.93],plates:[.8,.53],tail:[.62,.7]},
 'sombrios-0':{body:[.84,.7],arm:[.7,.7]},
 'sombrios-1':{wing:[.62,.7],head:[.9,.85]},
 'sombrios-dragon':{wing:[.55,.65],tail:[.52,.65],head:[.92,.82]},
};
function transformGroup(svg,cls,transform){
 const pattern=new RegExp('<g class="'+cls+'(?: [^"]*)?">','g');let match;
 const edits=[];
 while((match=pattern.exec(svg))){let depth=1,end=pattern.lastIndex;const tags=/<g(?:\s[^>]*)?>|<\/g>/g;tags.lastIndex=end;let tag;while(depth&&(tag=tags.exec(svg))){depth+=tag[0]==='</g>'?-1:1;end=tags.lastIndex;}if(depth===0)edits.push({start:match.index,end});}
 for(const {start,end} of edits.reverse())svg=svg.slice(0,start)+`<g class="growth-part" transform="${transform}">`+svg.slice(start,end)+'</g>'+svg.slice(end);
 return svg;
}
export function growthArt(svg,id,level=2){
 if(level===2||!growthProfiles[id])return svg;
 const profile=growthProfiles[id],young=level===1;
 for(const [part,base] of Object.entries({body:[.82,.8],head:[.95,.94],tail:[.65,.72],leg:[.85,.74],...profile})){
  const [sx,sy]=base.map(n=>young?1+(n-1)*.45:n);
  const pivot=part==='wing'?[100,130]:part==='plates'?[100,112]:part==='horns'?[145,105]:part==='trunk'?[100,105]:[100,188];
  svg=transformGroup(svg,'pet-'+part,`translate(${pivot[0]} ${pivot[1]}) scale(${sx} ${sy}) translate(${-pivot[0]} ${-pivot[1]})`);
 }
 const size=young?.9:.73;
 const start=svg.indexOf('</defs>')+7,end=svg.lastIndexOf('</svg>');
 return svg.slice(0,start)+`<g class="growth-size" transform="translate(${100*(1-size)} ${188*(1-size)}) scale(${size})">`+svg.slice(start,end)+'</g>'+svg.slice(end);
}
