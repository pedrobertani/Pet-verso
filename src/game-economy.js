// Uma tabela de metas por minijogo evita que jogos com placares inflados
// rendam mais moedas do que os jogos que pontuam devagar.
// Teto universal: 15 moedas, reservado para uma pontuação extraordinária.
export const GAME_COIN_TARGETS=Object.freeze({
 memory:Object.freeze({good:100,excellent:240,legendary:480}),   // Pares por rodada
 sequence:Object.freeze({good:60,excellent:160,legendary:320}),  // 20 pontos por sequência
 food:Object.freeze({good:50,excellent:140,legendary:280}),      // Frutas e bombas
 fruitmerge:Object.freeze({good:45,excellent:150,legendary:300}),// Junções crescentes
 runner:Object.freeze({good:25,excellent:75,legendary:150}),     // 5 pontos por obstáculo
 puzzle:Object.freeze({good:90,excellent:220,legendary:440}),    // Tabuleiros concluídos
 hide:Object.freeze({good:60,excellent:140,legendary:280}),      // 20 pontos por acerto
 flight:Object.freeze({good:25,excellent:65,legendary:130}),     // 5 por portal, 2 por estrela
 words:Object.freeze({good:60,excellent:160,legendary:320}),    // 20 por palavra
 blocks:Object.freeze({good:75,excellent:200,legendary:400}),   // Peças e linhas
 match3:Object.freeze({good:350,excellent:1000,legendary:2000})  // Combinações geram mais pontos
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
