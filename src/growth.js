export const growthNames=['Bebê','Jovem','Adulto'];
export const growthGoals=[{days:2,baths:8,meals:12,games:6,intelligence:15},{days:4,baths:24,meals:40,games:20,intelligence:40}];
const count=x=>Number.isFinite(x)?Math.max(0,Math.floor(x)):0;
export function growthState(p){
 const old=p.growth;
 return {version:1,level:old?Math.min(2,count(old.level)):(p.xp>=120?2:p.xp>=40?1:0),baths:count(old?.baths),meals:count(old?.meals),games:count(old?.games??p.games)};
}
export function growthProgress(p){
 const state=growthState(p),days=Math.max(0,((p.dead?p.deadAt:p.last)-p.born)/86400000);
 const values={days,baths:state.baths,meals:state.meals,games:state.games,intelligence:p.stats.intelligence};
 let level=state.level;
 while(level<2&&!p.dead&&Object.entries(growthGoals[level]).every(([key,goal])=>values[key]>=goal))level++;
 const goals=growthGoals[Math.min(level,1)];
 const missions=Object.entries(goals).map(([key,goal])=>({key,goal,value:Math.min(goal,values[key]),done:values[key]>=goal}));
 return {level,name:growthNames[level],next:growthNames[level+1]||null,missions,ratio:missions.reduce((n,m)=>n+Math.min(1,m.value/m.goal),0)/missions.length};
}
export function advanceGrowth(p){p.growth=growthState(p);p.growth.level=growthProgress(p).level;return p;}
export function countGrowthCare(p,kind){p.growth=growthState(p);p.growth[kind]++;return advanceGrowth(p);}
