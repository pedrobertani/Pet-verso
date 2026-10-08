# Cores dos itens

A loja tem as abas Comprar e Já possui. Os itens básicos e o brinquedo gratuito da espécie aparecem em Já possui mesmo em saves antigos, sem precisar gastar moedas ou registrar uma compra prévia.

Uma compra libera todas as sete cores: azul, rosa, verde, amarelo, preto suave, roxo e laranja. A seleção fica em `pet.itemColors[itemId]` e é compartilhada pela prévia e pelo cenário. Trocar a cor ou reequipar não cobra moedas nem duplica o inventário. Saves anteriores preservam as cores originais até o usuário escolher uma nova.

As antigas versões de cômoda, abajur e banheira que só diferiam pela cor saem da aba Comprar. Compras existentes continuam em Já possui. Novos formatos poderão ser adicionados como modelos próprios depois.

Os brinquedos de habilidade continuam específicos da espécie. O servidor de lógica `buy` rejeita brinquedo incompatível mesmo se houver tentativa fora da interface. Folhas naturais e água mantêm suas cores; o restante do desenho é pintado sem alterar a geometria ou transparências.


## Acabamentos
Os modelos tradicionais preservam madeira, água e estampas, personalizando detalhes específicos. A linha laqueada usa IDs próprios com `paintedModels`, compra separada e pintura de toda a estrutura. Inclui três camas, cômoda, estante, mesinha, banco e abajur. Os dois acabamentos mantêm sete cores gratuitas após a compra.
