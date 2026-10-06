export function arcadeDifficulty(seconds){const level=1+Math.floor(Math.max(0,seconds)/45);return {level,speed:Math.min(430,215+(level-1)*30),gap:Math.max(.95,1.65-(level-1)*.12),bombChance:Math.min(.42,.12+(level-1)*.05),wave:Math.min(5,2+Math.floor((level-1)/2)),fruitGap:Math.max(.7,1.25-(level-1)*.08)};}
export function memoryPairs(round){return Math.min(12,6+Math.floor(Math.max(0,round))*2);}
