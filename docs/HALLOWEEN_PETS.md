# Halloween — Frankie e Mumi

Branch de implementação: `feature/halloween-frankie-mumi`.

## Critérios de aceitação

- Frankie (novo ID estável `sombrios-frankie`) e Mumi (aproveitar ID reservado `sombrios-6`, sem duplicar a múmia do catálogo).
- Ambos selecionáveis, adotáveis e persistidos, mantendo compatibilidade com saves anteriores.
- Três fases reais: bebê com chupeta, jovem e adulto, seguindo `growth.js` e `growth-art.js`.
- Anatomia SVG com grupos independentes para cabeça, corpo, braços/pernas e acessórios; poses volumétricas em frente, perfil, costas e ângulos intermediários pelo pipeline `land-turn-preview.js` / `pet-turn-motion.js`.
- Animações existentes de caminhada, descanso, sono, banho e expressões sem peças destacadas durante curvas.
- Inteligência 50 na sala: Frankie faz curto-circuito com faíscas; Mumi cria redemoinho de faixas.
- Inteligência 75 no parquinho: Frankie interage com gerador de raios; Mumi entra e reaparece do sarcófago encantado.
- Mesmo ambiente `haunted` do fantasma/morcego, brinquedos específicos por espécie; manter ambiente `volcanic` do dragão.
- Preservar cooldowns atuais (15 s sala, 30 s parquinho) e bloqueios de sono, morte e banho.
- Cobrir espécies, poses, progressão, habilidades, playground e saves nos testes.
- Gerar GIFs/capturas **reais do jogo**, identificados como tais: 3 fases, curva de 180°, habilidade de sala e interação com brinquedo; não substituir por arte conceitual.

## Ordem de trabalho

1. Anatomia e três idades (#34)
2. Direções e curvas (#35)
3. Habilidades 50/75 (#36)
4. Brinquedos, ambiente e adoção (#37)
5. Testes e capturas reais (#38)

Não realizar merge na `main` antes da revisão visual e dos testes.
