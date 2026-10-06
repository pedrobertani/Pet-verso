# PetVerso — protótipo v0.1

Bichinho virtual offline em português, um companheiro por vez. Adoção escolhida ou ovo surpresa com chances iguais para as 40 espécies. Seis atributos: saciedade, felicidade, energia, higiene, saúde e inteligência. Guarda progresso no dispositivo; inteligência não cai com o tempo.

## Catálogo definido nesta base

- **Pets:** Gato, Cachorro, Coelho, Hamster, Porquinho-da-índia, Calopsita, Poodle, Gatinho preto.
- **Exóticos:** Axolote, Camaleão, Furão, Iguana, Ouriço, Gecko, Chinchila, Tartaruga.
- **Selva:** Leão, Macaco, Elefante, Tigre, Panda, Girafa, Zebra, Onça.
- **Dinos:** Tiranossauro, Tricerátops, Braquiossauro, Estegossauro, Velociraptor, Anquilossauro, Parassaurolofo, Diplodoco.
- **Sombrios simpáticos:** Fantasminha, Morceguinho, Monstrinho de sombra, Abóbora viva, Dragão noturno, Gatinho espectral, Múmia pequena, Lobinho lunar.

As espécies estão cadastradas e disponíveis; a arte inicial usa desenhos vetoriais compartilhados por família, com variações de cor e detalhe. Não são as artes finais específicas de cada animal. Animações iniciais: respirar, piscar, carinho, comer, banho e sono. A corrida usa representação simplificada. Evolução por experiência: jovem aos 40 pontos, adulto aos 120; arte de cada fase ainda pendente.

## Cuidados, doença e morte

Alimentar custa 5 moedas; remédio custa 12 e só pode ser usado abaixo de 90 de saúde. Banho, carinho e dormir são grátis. Sono recupera energia em tempo real, inclusive offline, e reduz consumo de comida. O horário é flexível.

Saciedade ≤15, energia ≤10 ou higiene ≤10 são necessidades críticas. Doze horas contínuas nesse estado, ou saúde ≤25, causam doença. A doença termina quando saúde ≥70 e saciedade, energia e higiene ≥30. **72 horas consecutivas doente sem recuperação causam morte permanente**. Mostra lápide R.I.P., bloqueia cuidados e jogos; sem ressurreição. Nova adoção reinicia pet, moedas e móveis. O tempo offline conta integralmente. Aviso visível antes da adoção e contagem de horas restantes durante a doença. Notificações nativas ainda não implementadas.

## Brincadeiras e economia

Memória, sequência de cores, caça aos petiscos, corrida com cenário automático e pulo por toque, quebra-cabeça deslizante da imagem e esconde-esconde. Partidas rendem 3–13 moedas e gastam 8 de energia. Jogos de raciocínio aumentam inteligência; saúde baixa reduz aprendizado. Fechar a partida não concede prêmio.

Loja: plantinha 90, tapete 110, bola 120, cama nuvem 180, cama folha 240, abajur 260, foguete 350, cama lunar 420, castelinho 600. A cama básica é gratuita. Móveis adquiridos podem ser equipados sem nova cobrança. Preços iniciais a balancear com partidas reais. Sem compras com dinheiro.

## Desenvolvimento e builds

Node 22. `npm ci`, `npm test`, `npm run dev`. `npm run build` gera dist. `npx playwright install --with-deps chromium` e `npx playwright test` verificam interfaces móvel e desktop.

Capacitor: `br.app.petverso`. Actions para CI, APK de teste, iOS simulador/Ad Hoc opcional e AAB de publicação com assinatura opcional. Projetos nativos gerados durante builds. Para dispatch manual, os workflows precisam estar na main.

iOS assinado requer IOS_CERTIFICATE_P12_BASE64, IOS_CERTIFICATE_PASSWORD, IOS_PROVISIONING_PROFILE_BASE64 e IOS_TEAM_ID; perfil próprio para br.app.petverso. Android assinado requer ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS e ANDROID_KEY_PASSWORD. Versão de upload deve ter versionCode maior que qualquer envio anterior. Não publica automaticamente nas lojas. Sem certificados cadastrados, só os builds sem assinatura/simulador podem ser validados.

## Limitações desta primeira base

Artes e animações específicas de cada espécie/fase ainda precisam ser produzidas. Preferências por família são apresentadas, mas ainda não alteram benefícios dos cuidados. Personalidade é sorteada inicialmente. Sem contas, sincronização, múltiplos pets simultâneos ou notificações. Não testado em aparelho físico.
