// Metas calibradas com placares de 1 minuto medidos em outubro de 2026.
// Jogos com maior risco de derrota usam horizonte de cerca de 3 minutos;
// os demais, cerca de 5 minutos. Puzzle usa tabuleiros concluídos.
// Teto universal: 20 moedas para conquistas excepcionais.
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
export const MAX_GAME_COINS=20;
// Faixa especial: 20 moedas para partidas acima da meta lendária.
// Quebra-cabeça usa quantidade de tabuleiros concluídos, não pontos.
export const GAME_BONUS_20_TARGETS=Object.freeze({
 memory:570,
 sequence:900,
 food:2025,
 fruitmerge:3600,
 runner:510,
 hide:790,
 flight:790,
 words:2625,
 blocks:2065,
 match3:15000
});

export function gameCoinReward(gameId,score,completedBoards=0){
 if(gameId==='puzzle'){
  if(completedBoards>=6)return 20;
  if(completedBoards>=3)return 15;
  if(completedBoards>=1)return 10;
  return 0;
 }
 if(!Number.isFinite(score)||score<=0)return 0;
 const bonusTarget=GAME_BONUS_20_TARGETS[gameId];
 if(bonusTarget&&score>=bonusTarget)return MAX_GAME_COINS;
 const {good,excellent,legendary}=GAME_COIN_TARGETS[gameId]||DEFAULT_TARGETS;
 if(score>=legendary)return 15;
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
