// Keep scene animation progress across UI refreshes in the same room.
export function captureSceneMotion(root){
 const target=root.querySelector('#touch-pet');if(!target||target.classList.contains('in-bed'))return null;
 return {style:target.getAttribute('style'),controlled:target.classList.contains('call-controlled'),facing:target.querySelector('.pet-facing')?.getAttribute('style'),animations:root.getAnimations({subtree:true}).filter(a=>a.effect?.target?.closest?.('#touch-pet')).map(a=>({name:a.animationName,time:a.currentTime,rate:a.playbackRate}))};
}
export function restoreSceneMotion(root,state){
 const target=root.querySelector('#touch-pet');if(!state||!target||target.classList.contains('in-bed'))return;
 if(state.controlled){target.classList.remove('roaming');target.classList.add('call-controlled','called-idle');if(state.style)target.setAttribute('style',state.style);if(state.facing)target.querySelector('.pet-facing')?.setAttribute('style',state.facing);}
 const remaining=[...state.animations];for(const animation of root.getAnimations({subtree:true})){if(!animation.effect?.target?.closest?.('#touch-pet'))continue;const i=remaining.findIndex(a=>a.name===animation.animationName);if(i>=0){const old=remaining.splice(i,1)[0];animation.currentTime=old.time;animation.playbackRate=old.rate;}}
}
