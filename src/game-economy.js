// As metas variam conforme a velocidade de pontuação e a dificuldade de cada jogo.
// Os valores são hipóteses iniciais de balanceamento, a validar com partidas reais.
export const GAME_COIN_TARGETS=Object.freeze({
 memory:Object.freeze({good:100,excellent:240,legendary:480}),
 sequence:Object.freeze({good:60,excellent:160,legendary:320}),
 food:Object.freeze({good:50,excellent:140,legendary:280}),
 fruitmerge:Object.freeze({good:45,excellent:150,legendary:300}),
 runner:Object.freeze({good:25,excellent:75,legendary:150}),
 puzzle:Object.freeze({good:90,excellent:220,legendary:440}),
 hide:Object.freeze({good:60,excellent:140,legendary:280}),
 flight:Object.freeze({good:25,excellent:65,legendary:130}),
 words:Object.freeze({good:60,excellent:160,legendary:320}),
 blocks:Object.freeze({good:75,excellent:200,legendary:400}),
 match3:Object.freeze({good:350,excellent:1000,legendary:2000})
});
const DEFAULT_TARGETS=Object.freeze({good:60,excellent:160,legendary:320});
export const MAX_GAME_COINS=50;
export const GAME_COIN_TIERS=Object.freeze({
 memory:Object.freeze([[100,5],[240,10],[480,15],[800,20],[1200,25],[1800,30],[2800,40],[4500,50]]),
 sequence:Object.freeze([[40,5],[100,10],[180,15],[300,20],[440,25],[600,30],[900,40],[1400,50]]),
 food:Object.freeze([[50,5],[140,10],[280,15],[500,20],[800,25],[1200,30],[2000,40],[3200,50]]),
 fruitmerge:Object.freeze([[100,5],[350,10],[800,15],[1500,20],[2500,25],[4000,30],[7000,40],[12000,50]]),
 runner:Object.freeze([[25,5],[75,10],[150,15],[250,20],[400,25],[600,30],[900,40],[1400,50]]),
 puzzle:Object.freeze([[100,5],[250,10],[500,15],[850,20],[1300,25],[2000,30],[3200,40],[5000,50]]),
 hide:Object.freeze([[40,5],[100,10],[180,15],[300,20],[440,25],[600,30],[900,40],[1400,50]]),
 flight:Object.freeze([[20,5],[55,10],[100,15],[170,20],[260,25],[380,30],[550,40],[850,50]]),
 words:Object.freeze([[60,5],[160,10],[320,15],[520,20],[800,25],[1200,30],[1800,40],[2800,50]]),
 blocks:Object.freeze([[75,5],[200,10],[400,15],[700,20],[1100,25],[1700,30],[2700,40],[4200,50]]),
 match3:Object.freeze([[1000,5],[3000,10],[6000,15],[10000,20],[15000,25],[25000,30],[50000,40],[100000,50]])
});
// Mantido como alias para consumidores do Petisco.
export const MATCH3_COIN_TIERS=Object.freeze([...GAME_COIN_TIERS.match3].reverse().map(tier=>Object.freeze(tier)));

export function gameCoinReward(gameId,score){
 if(!Number.isFinite(score)||score<=0)return 0;
 const tiers=GAME_COIN_TIERS[gameId];
 if(!tiers)return score>=DEFAULT_TARGETS.legendary?15:score>=DEFAULT_TARGETS.excellent?10:score>=DEFAULT_TARGETS.good?8:5;
 for(let i=tiers.length-1;i>=0;i--)if(score>=tiers[i][0])return tiers[i][1];
 return 5;
}

// Intelligence is awarded only for minigames tagged as cognitive by the
// caller. Significant effort yields 3 to 5 intelligence, not inflated points.
export function gameIntelligenceReward(gameId,score){
 if(!Number.isFinite(score)||score<=0)return 0;
 const {good,excellent}=GAME_COIN_TARGETS[gameId]||DEFAULT_TARGETS;
 if(score>=excellent)return 5;
 if(score>=good)return 3;
 return 1;
}
