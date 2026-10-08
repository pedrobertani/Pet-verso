// Species-specific proportions. Adult artwork remains the approved drawing.
export const growthProfiles={
 'dinos-pterosaur':{head:[1,.94],wing:[.86,.9],tail:[.5,.75]},
 'selva-owl':{head:[1.05,1],wing:[.86,.9],tail:[.65,.8]},
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
 'dinos-0':{head:[.8,.83],tail:[.82,.8]},
 'dinos-1':{head:[.9,.93],horns:[.25,.3],tail:[.82,.8]},
 'dinos-2':{head:[.88,.9],body:[.86,.88],tail:[.86,.88]},
 'dinos-3':{head:[.97,.93],tail:[.82,.8]},
 'sombrios-0':{body:[.84,.7],arm:[.7,.7]},
 'sombrios-1':{wing:[.9,.9],head:[.9,.85]},
 'sombrios-dragon':{wing:[.9,.9],tail:[.52,.65],head:[.92,.82]},
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
 const connectedLegs=['dinos-1','dinos-2','selva-capybara','selva-fox','selva-2'].includes(id);
 if(id==='dinos-1'){
  const scale=young?1+(.3-1)*.45:.25;
  const horn=(d,x,y)=>`<path d="${d}" fill="#fff0c8" transform="translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})"/>`;
  svg=svg.replace('<path d="M117 81q-8-22-1-35l18 34M163 79q0-19 15-30l-4 35" fill="#fff0c8" />',horn('M117 81q-8-22-1-35l18 34',125,81)+horn('M163 79q0-19 15-30l-4 35',169,82));
  svg=svg.replace('<path d="M172 108l6-25 9 22Z" fill="#fff0c8" />',horn('M172 108l6-25 9 22Z',180,106));
 }
 for(const [part,base] of Object.entries({body:[.82,.8],head:[.95,.94],tail:[.65,.72],leg:[.85,.74],arm:[.82,.8],...profile})){
  if(id==='dinos-1'&&part==='horns')continue;
  const proportion=part==='leg'&&connectedLegs?(profile.body||[.82,.8]):base;
  const [sx,sy]=proportion.map(n=>young?1+(n-1)*.45:n);
  const pivot=id==='pets-mouse'&&part==='tail'?[svg.includes('mouse-rise')?66:120,svg.includes('mouse-rise')?151:163]:part==='wing'?[100,130]:part==='plates'?[100,112]:part==='horns'?[145,105]:part==='trunk'?[100,105]:[100,188];
  let partTransform=`translate(${pivot[0]} ${pivot[1]}) scale(${sx} ${sy}) translate(${-pivot[0]} ${-pivot[1]})`;
  if(part==='tail'&&['pets-1','pets-mouse'].includes(id)){
   const start=/<g class="pet-tail[^"]*">[\s\S]*?d="M([\d.-]+) ([\d.-]+)/.exec(svg);
   if(start){const root=start.slice(1).map(Number),bodyScale=(profile.body||[.82,.8]).map(n=>young?1+(n-1)*.45:n),mapped=root.map((n,i)=>[100,188][i]+(n-[100,188][i])*bodyScale[i]);partTransform=`translate(${mapped[0]} ${mapped[1]}) scale(${sx} ${sy}) translate(${-root[0]} ${-root[1]})`;}
  }
  svg=transformGroup(svg,'pet-'+part,partTransform);
 }
 const size=young?.9:.73;
 const start=svg.indexOf('</defs>')+7,end=svg.lastIndexOf('</svg>');
 return svg.slice(0,start)+`<g class="growth-size" transform="translate(${100*(1-size)} ${188*(1-size)}) scale(${size})">`+svg.slice(start,end)+'</g>'+svg.slice(end);
}
