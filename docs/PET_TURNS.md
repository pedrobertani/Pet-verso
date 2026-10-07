# Viradas dos pets

`pet-turn-motion.js` acompanha a direção do passeio e do chamado por toque. A virada dura 700 ms e interpola 17 poses anatômicas; o personagem inteiro nunca recebe um `scaleX` negativo. As poses são guardadas em cache durante a visita ao cômodo.

Os desenhos aprovados são compartilhados com as prévias: `land-turn-preview.js`, `dog-turn-preview.js` e `fly-turn-preview.js`. Os terrestres preservam patas, cores, contornos e crescimento. Voadores usam projeção das asas a partir do ombro e batida para a frente; dragão e pterossauro ajustam focinho/bico e chupeta durante a curva.

A virada fica pausada durante pensamento, carinho e habilidade. Sono e banheiro usam os desenhos próprios de cuidado. O controlador cancela o frame e libera o cache ao sair da tela. Preferências de movimento reduzido eliminam a transição.

`scene-motion.js` conserva posição, fase do passeio, direção e ângulo durante uma atualização de cuidados no mesmo cômodo. `call-pet.js` publica a direção do caminho em `data-walk-direction`.

Validação: `e2e/turns.spec.js` cobre as 25 espécies nas três idades e em três direções, continuidade de posição, pausa nas habilidades, banho e sono.
