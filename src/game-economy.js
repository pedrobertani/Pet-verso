// Metas calibradas com placares de 1 minuto medidos em outubro de 2026.
// Jogos com maior risco de derrota usam horizonte de cerca de 3 minutos;
// os demais, cerca de 5 minutos. Puzzle mantém metas antigas por falta de medição.
// Teto universal: 15 moedas, reservado para uma pontuação extraordinária.
export const GAME_COIN_TARGETS=Object.freeze({
 memory:Object.freeze({good:120,excellent:180,legendary:300}),   // Pares por rodada
 sequence:Object.freeze({good:160,excellent:320,legendary:480}),  // 20 pontos por sequência
 food:Object.freeze({good:360,excellent:720,legendary:1080}),      // Frutas e bombas
 fruitmerge:Object.freeze({good:570,excellent:1140,legendary:1900}),// Junções crescentes
 runner:Object.freeze({good:90,excellent:180,legendary:270}),     // 5 pontos por obstáculo
 puzzle:Object.freeze({good:90,excellent:220,legendary:440}),    // Tabuleiros concluídos
 hide:Object.freeze({good:140,excellent:280,legendary:420}),      // 20 pontos por acerto
 flight:Object.freeze({good:140,excellent:280,legendary:420}),     // 5 por portal, 2 por estrela
 words:Object.freeze({good:280,excellent:840,legendary:1400}),    // 20 por palavra
 blocks:Object.freeze({good:220,excellent:660,legendary:1100}),   // Peças e linhas
 match3:Object.freeze({good:2400,excellent:4800,legendary:8000})  // Combinações geram mais pontos
});
const DEFAULT_TARGETS=Object.freeze({good:60,excellent:160,legendary:320});
export const MAX_GAME_COINS=15;

export function gameCoinReward(gameId,score){
 if(!Number.isFinite(score)||score<=0)return 0;
 const {good,excellent,legendary}=GAME_COIN_TARGETS[gameId]||DEFAULT_TARGETS;
 if(score>=legendary)return MAX_GAME_COINS;
 if(score>=excellent)return 10;
 if(score>=good)return 8;
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
