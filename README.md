# PetVerso — protótipo v0.3

Bichinho virtual offline em português, um companheiro por vez. Adoção escolhida ou ovo surpresa com chances iguais para as 18 espécies. Seis atributos: saciedade, felicidade, energia, higiene, saúde e inteligência. Guarda progresso no dispositivo; inteligência não cai com o tempo.

## Catálogo visual

Dezoito pets com desenhos vetoriais próprios: Gato, Cachorro, Axolote, Camaleão, Leão, Panda, Tiranossauro, Tricerátops, Fantasminha e Morceguinho, além de Coelho, Tartaruga, Elefante, Braquiossauro, Estegossauro, Urso marrom e Urso polar e Rato. Sorteio uniforme por espécie. Gatos e cachorros têm três cores escolhidas depois da espécie; ratos têm branco e cinza; ovo surpresa sorteia também a cor. Nome e cor persistem no save. Saves das espécies antigas continuam válidos, com aviso de arte legada. Arte 2D com sombras, sem modelos 3D. Pet passeia na sala, recebe carinho por arraste e dorme na cama no quarto.

Necessidades usam ícones e barras: verde ≥75, amarelo ≥50, laranja ≥25 e vermelho abaixo de 25. O toque mostra o nome e o valor; leitores de tela recebem ambos. Textos de ajuda ficam recolhidos. A inteligência também usa a mesma escala, mas não perde pontos com o tempo.

Banheiro com cena vetorial integrada: tocar no chuveiro, arrastar o sabonete sobre o pet e tocar no chuveiro novamente. Um ciclo completa o banho; teclado também permite esfregar. Higiene só recupera ao terminar. Necessidades se acumulam na sala; recolher ou limpar é grátis e independente do banho. A carteira atualiza imediatamente ao receber prêmio de minijogo, com proteção contra conclusão duplicada.

Evolução por experiência: jovem aos 40 pontos, adulto aos 120; arte de cada fase ainda pendente. A corrida usa representação simplificada.

## Cuidados, doença e morte

Alimentar custa 5 moedas; remédio custa 12 e só pode ser usado abaixo de 90 de saúde. Banho, carinho, limpeza e dormir são grátis. Sono recupera energia em tempo real, inclusive offline, e reduz consumo de comida. O horário é flexível.

Saciedade ≤15, energia ≤10 ou higiene ≤10, ou quatro necessidades acumuladas, são necessidades críticas. Doze horas contínuas nesse estado, ou saúde ≤25, causam doença. A doença termina quando saúde ≥70 e saciedade, energia e higiene ≥30. **72 horas consecutivas doente sem recuperação causam morte permanente**. Mostra lápide R.I.P., bloqueia cuidados e jogos; sem ressurreição. Nova adoção reinicia pet, moedas e móveis. O tempo offline conta integralmente. Aviso visível antes da adoção e contagem de horas restantes durante a doença. Notificações locais opcionais, com permissão e horários aproximados entre 9h e 21h.

## Brincadeiras e economia

Memória, sequência de cores, caça aos petiscos, corrida com cenário automático e pulo por toque, quebra-cabeça deslizante da imagem e esconde-esconde. Partidas rendem 3–13 moedas e gastam 8 de energia. Jogos de raciocínio aumentam inteligência; saúde baixa reduz aprendizado. Fechar a partida não concede prêmio.

Loja: plantinha 90, tapete 110, bola 120, cama nuvem 180, cama folha 240, abajur 260, foguete 350, cama lunar 420, castelinho 600. A cama básica é gratuita. Móveis adquiridos podem ser equipados sem nova cobrança. Preços iniciais a balancear com partidas reais. Sem compras com dinheiro.

## Desenvolvimento e builds

Node 22. `npm ci`, `npm test`, `npm run dev`. `npm run build` gera dist. `npx playwright install --with-deps chromium` e `npx playwright test` verificam interfaces móvel e desktop.

Capacitor: `br.app.petverso`. Actions para CI, APK de teste, iOS simulador/Ad Hoc opcional e AAB de publicação com assinatura opcional. Projetos nativos gerados durante builds. Para dispatch manual, os workflows precisam estar na main.

iOS assinado requer IOS_CERTIFICATE_P12_BASE64, IOS_CERTIFICATE_PASSWORD, IOS_PROVISIONING_PROFILE_BASE64 e IOS_TEAM_ID; perfil próprio para br.app.petverso. Android assinado requer ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS e ANDROID_KEY_PASSWORD. Versão de upload deve ter versionCode maior que qualquer envio anterior. Não publica automaticamente nas lojas. Sem certificados cadastrados, só os builds sem assinatura/simulador podem ser validados.

## Limitações desta primeira base

Arte por fase e substituição das artes legadas ainda precisam ser produzidas. Preferências por família são apresentadas, mas ainda não alteram benefícios dos cuidados. Personalidade é sorteada inicialmente. Sem contas, sincronização, múltiplos pets simultâneos . Não testado em aparelho físico.

Cocô reduz higiene em oito pontos e deixa manchas; sujeira e cocô acumulados aumentam a perda contínua. Recolher tira só o cocô; limpar remove as manchas e o cocô, sem recuperar a higiene do pet. Abaixo de 60 de higiene, aparecem manchas no pet, removidas com banho completo.

## Revisão visual e lembretes locais

Cachorro, rex, estegossauro, morcego e elefante têm nova anatomia. Rato disponível em branco e cinza. Boca e conteúdo (língua/dentes) são desenhados juntos; boca fechada não mostra dentes. Energia usa raio. Móveis da loja e do ambiente compartilham a mesma arte vetorial.

Lembretes opt-in com @capacitor/local-notifications 8.3.1 e @capacitor/app. Agendamento local de até 48 horas, janelas diurnas entre 9h e 21h, por necessidade prevista (comida, brincar, fezes, higiene, energia e saúde), com intervalo mínimo de uma hora entre avisos, agrupamento de necessidades e repetição do mesmo motivo somente após duas horas; sem eventos após morte prevista. Cuidados/retorno ao app recalculam e substituem o plano. Desativar, remover pet ou morrer cancela pendências. Horários inexatos, sem solicitar acesso especial a alarmes. Pode haver atraso do sistema e a entrega real ainda precisa ser validada em aparelho físico. O botão de teste agenda um aviso em aproximadamente dez segundos.

Após gerar Android, executar `node .github/scripts/prepare-android.mjs` para instalar o ícone monocromático de notificação e remover a permissão de alarmes exatos herdada do plugin. Os workflows fazem isso automaticamente.

## Ritmo de cuidados

Acordado: saciedade -18/h, felicidade -18/h, energia -16/h, higiene -6/h mais sujeira. A partir do estado inicial, comida e brincadeira ficam abaixo de 40 em cerca de 2–3h, energia abaixo de 35 em 3–4h. Fezes a cada 90min acordado. Dormindo: comida -3/h, felicidade -0,5/h, higiene -1/h mais sujeira, energia +24/h, fezes a cada 8h. Uma noite de oito horas a partir de um pet saudável foi testada sem doença. Regras de doença e morte por negligência prolongada permanecem.

Os ciclos são um balanceamento próprio inspirado no cuidado recorrente de Pou e Tamagotchi, não uma reprodução de taxas oficiais (que não são publicadas nas referências consultadas). A partir de barras em 100: comida/felicidade cruzam 40 após 3h20; energia cruza 35 após cerca de 4h04. Um cochilo de 2h30 recupera 60 pontos. Alimentar recupera 25 pontos por porção; duas porções recuperam 50. O estado inicial começa abaixo de 100, por isso o primeiro cuidado chega antes. Referências: https://www.pou.me/ e https://tamagotchi-official.com/manual/toy/original/Original_webmanual.pdf.

Revisão visual v0.3: todas as 18 espécies agora têm anatomia própria, olhos fechados durante o sono e expressões sem sobreposição. Casco da tartaruga, pescoço/cabeça do braquiossauro, chifres do tricerátops, juba do leão, focinhos dos ursos/gato/coelho e brânquias do axolote revistos junto aos seis primeiros desenhos. Rato em branco e cinza; cores anteriores de gato/cachorro preservadas.
