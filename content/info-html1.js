// HTML e CSS — NÍVEL BÁSICO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
// A chave é o id da lição. `npm test` confere que toda lição tem as 4 explicações.
module.exports = {
  'html-1-01': [
    `Toda página da internet é escrita em HTML. O HTML usa etiquetas, chamadas de tags, escritas entre os sinais < e >. A tag <h1> quer dizer "isto é o título principal". Quase toda tag abre e fecha, como uma caixa com tampa: <h1> abre e </h1> fecha.`,
    `Serve para dizer ao navegador (o programa que mostra as páginas) o que cada pedaço do texto é: um título, um parágrafo, uma lista...`,
    `Escreva <h1>, depois o texto e depois </h1>. Fica assim: <h1>Ola, mundo!</h1>`,
    `Na área da página aparece o texto em letras grandes e em negrito, como o título de um livro. As tags não aparecem: só o que está entre elas.`],
  'html-1-02': [
    `A tag <p> cria um parágrafo, um bloco de texto. Cada parágrafo começa em uma linha nova e deixa um espacinho entre ele e o próximo.`,
    `Serve para escrever os textos da página. Quase todo texto de um site fica dentro de parágrafos.`,
    `Escreva um <p> para cada frase, e feche cada um com </p>. O título <h1> fica em cima dos parágrafos.`,
    `O título grande e, embaixo, duas frases em linhas separadas, com um pouco de espaço entre elas.`],
  'html-1-03': [
    `Os títulos têm seis tamanhos, de <h1> (o maior) até <h6> (o menor). Pense num livro: o <h1> é o nome do livro, o <h2> é o nome de cada capítulo e o <h3> é o nome de cada parte do capítulo.`,
    `Serve para organizar a página em partes. Quem lê enxerga o que é mais importante, e os buscadores como o Google também.`,
    `Escreva os três títulos, um embaixo do outro: <h1>, depois <h2> e depois <h3>, cada um com o seu texto.`,
    `Três linhas de texto em negrito, cada uma menor que a de cima: Minha cidade (grande), Lugares (média) e Pracas (menor).`],
  'html-1-04': [
    `<strong> deixa o texto em negrito e quer dizer "isto é importante". <em> deixa o texto em itálico (inclinado) e quer dizer "fale isto com ênfase". Elas ficam dentro de outra tag, em volta só das palavras que você quer destacar.`,
    `Serve para chamar a atenção para uma palavra no meio da frase, como fazemos com a voz quando falamos.`,
    `Dentro do <p>, ponha <em> em volta da palavra muito e <strong> em volta da palavra importante. Sempre feche as duas.`,
    `Uma frase só, e duas palavras diferentes das outras: muito inclinada e importante em negrito.`],
  'html-1-05': [
    `Algumas tags não têm fechamento porque não guardam nada dentro delas. <br> quer dizer "quebre a linha aqui" e <hr> desenha uma linha de ponta a ponta da página.`,
    `Serve para separar: o <br> separa linhas dentro de um mesmo parágrafo (como num endereço ou numa poesia) e o <hr> separa uma parte da página da outra.`,
    `No meio do texto do parágrafo escreva <br>, sem fechar. Depois do </p>, em uma linha nova, escreva <hr>.`,
    `Um parágrafo com duas linhas (Rua das Flores, 10 e, embaixo, Recife) e uma linha fininha cruzando a página embaixo dele.`],
  'html-1-06': [
    `Uma lista com marcadores é uma lista de itens com bolinhas na frente. A tag <ul> faz a lista toda e cada <li> é um item. Os <li> sempre ficam dentro de um <ul>.`,
    `Serve para mostrar coisas que não precisam de ordem: ingredientes, compras, menu de um site.`,
    `Abra um <ul>, escreva um <li> para cada fruta e feche o </ul> no final. Cada <li> também precisa do seu </li>.`,
    `Três linhas, cada uma com uma bolinha na frente: Banana, Maca e Uva.`],
  'html-1-07': [
    `A lista numerada é igual à lista com marcadores, só que cada item ganha um número. Ela usa a tag <ol> no lugar do <ul>, e os itens continuam sendo <li>.`,
    `Serve quando a ordem importa: passos de uma receita, instruções, um ranking.`,
    `Escreva o título <h2> e, embaixo, um <ol> com três <li>. Você não digita os números: o navegador coloca sozinho.`,
    `O título Passo a passo e, embaixo, a lista numerada: 1. Misturar, 2. Assar, 3. Comer.`],
  'html-1-08': [
    `Um link é um texto que você clica para ir a outro lugar. Ele é feito com a tag <a>. O atributo href (que quer dizer "referência de hipertexto") guarda o endereço de destino. Um atributo é um extra que fica dentro da tag de abertura, no formato nome="valor".`,
    `Serve para ligar uma página a outras páginas. É o que faz a internet ser uma "teia": tudo ligado por links.`,
    `Escreva <a href="endereço">, depois o texto que a pessoa vai clicar, e feche com </a>. O endereço vai entre aspas.`,
    `O texto Ir para o Google aparece em azul e sublinhado, no jeito de um link.`],
  'html-1-09': [
    `A tag <img> coloca uma figura na página. O atributo src diz onde está o arquivo da imagem e o atributo alt escreve com palavras o que tem na imagem. O <img> não tem tag de fechamento.`,
    `Serve para mostrar fotos e desenhos. O alt ajuda quem usa leitor de tela (um programa que lê a página em voz alta) e aparece se a imagem não carregar.`,
    `Escreva <img src="gato.png" alt="Um gato preto">. Os dois atributos ficam dentro da mesma tag, separados por um espaço.`,
    `Aqui no CodeUp aparece uma figura de exemplo com o nome do arquivo (gato.png) escrito nela. Numa página de verdade, ali apareceria a foto.`],
  'html-1-10': [
    `Dentro de um <a> pode ficar qualquer coisa, até uma imagem. Aí a imagem vira o botão do link. O atributo target="_blank" faz o link abrir em uma aba nova do navegador.`,
    `Serve para logos que levam para o site da loja e para links externos, que abrem em outra aba sem fazer a pessoa sair da sua página.`,
    `Escreva <a href="..." target="_blank">, depois o <img ...> e feche com </a>. Os dois atributos do <a> ficam na tag de abertura.`,
    `A figura do logo aparece na página e, ao passar o mouse sobre ela, vira uma mãozinha de link.`],
  'html-1-11': [
    `Uma página completa tem uma estrutura, como uma casa tem fundação, paredes e telhado. A primeira linha, <!DOCTYPE html>, diz que o arquivo é HTML. A tag <html> envolve tudo. Dentro dela há duas partes: o <head> (a cabeça, com informações da página) e o <body> (o corpo, com o que aparece na tela).`,
    `Serve para o navegador saber ler direitinho o seu arquivo. Todo site do mundo é construído sobre essa estrutura.`,
    `Escreva as tags na ordem: <!DOCTYPE html>, <html>, <head> com o <title>, </head>, <body> com o <h1>, </body> e </html>.`,
    `Só o conteúdo do <body> aparece na página: o título Ola. O texto do <title> não aparece na página: ele aparece na aba do navegador.`],
  'html-1-12': [
    `lang="pt-BR" é um atributo da tag <html> que avisa: "o texto está em português do Brasil". <meta charset="UTF-8"> é uma linha do <head> que diz como as letras são guardadas, para os acentos aparecerem certinhos.`,
    `Serve para a página funcionar bem para todos: os leitores de tela leem com o sotaque certo e as letras como é, ç e ã não viram símbolos estranhos.`,
    `Coloque lang="pt-BR" dentro da tag de abertura <html ...> e escreva <meta charset="UTF-8"> dentro do <head>. O meta não tem fechamento.`,
    `A página parece igual, porque são avisos para o navegador. Mas agora ela está pronta para textos em português com acentos.`],
  'html-1-13': [
    `A <div> é uma caixa invisível que junta vários elementos. A <span> é uma caixinha invisível que junta só um pedaço de texto, sem quebrar a linha. A diferença: a div ocupa a linha toda; a span fica no meio do texto.`,
    `Serve para agrupar. Mais para frente, com o CSS, você vai enfeitar uma div inteira (como um cartão) ou uma palavra dentro de uma frase (com a span).`,
    `Abra uma <div>, coloque dentro o <h2> e o <p>, e feche a </div>. No parágrafo, envolva só a palavra hoje com <span>...</span>.`,
    `O título Aviso e embaixo a frase Entrega hoje. Sem CSS, a div e a span não mudam nada na aparência.`],
  'html-1-14': [
    `id e class são nomes que você dá aos elementos, como etiquetas de nome. O id é único: dois elementos não podem ter o mesmo id. A class pode se repetir, e um elemento pode ter mais de uma, separadas por espaço.`,
    `Serve para o CSS (e depois o JavaScript) achar um elemento específico ou um grupo de elementos e saber a quem enfeitar.`,
    `Escreva class="aviso" na tag de abertura do primeiro parágrafo e id="final" na do segundo. Sem espaços em volta do sinal de igual.`,
    `Dois parágrafos comuns. Os nomes não mudam a aparência: eles esperam o CSS usá-los.`],
  'html-1-15': [
    `<header>, <main> e <footer> são tags com significado: o topo da página, o conteúdo principal e o rodapé. Elas se parecem com uma <div>, mas dizem o que cada parte é.`,
    `Serve para organizar páginas grandes e para ajudar buscadores e leitores de tela a entender a página: "aqui é o cabeçalho, aqui é o que importa, aqui é o rodapé".`,
    `Escreva as três partes uma depois da outra: o <header> com o <h1>, o <main> com um <p> e o <footer> com o texto final.`,
    `De cima para baixo: o título Meu blog, um parágrafo e o texto Feito por mim.`],
  'html-1-16': [
    `Uma tabela mostra dados em linhas e colunas, como uma planilha. A <table> é a tabela inteira, cada <tr> é uma linha (de "table row") e cada <td> é uma célula dentro da linha (de "table data").`,
    `Serve para dados que combinam em linhas e colunas: notas, preços, horários de aulas.`,
    `Abra um <table>, escreva um <tr> para cada linha e, dentro de cada linha, um <td> para cada coluna. Feche tudo.`,
    `Uma grade de dois por dois: Ana e 10 na primeira linha, Leo e 12 na segunda. Sem CSS, a tabela não tem linhas de borda.`],
  'html-1-17': [
    `A tag <th> (de "table header") é uma célula de cabeçalho: ela dá o nome da coluna. Fica em negrito e centralizada. É usada no lugar do <td> na primeira linha.`,
    `Serve para a tabela explicar o que cada coluna guarda e para leitores de tela anunciarem os títulos das colunas.`,
    `Faça uma primeira <tr> só com <th> (Aluno e Nota). Depois, mais duas <tr> com os <td> dos alunos.`,
    `A primeira linha da tabela em negrito (Aluno, Nota) e embaixo as notas de Bia e de Caio.`],
  'html-1-18': [
    `Um formulário é uma ficha para a pessoa preencher. A tag <form> envolve a ficha. O <input> é um campo para digitar. O <label> é o nome do campo, a etiqueta que diz o que escrever ali.`,
    `Serve para receber informações: cadastro, login, busca, contato. Todo site que pede seu nome usa um formulário.`,
    `Dentro do <form>, escreva o <label for="nome"> e depois o <input type="text" id="nome" name="nome">. O for do label e o id do input têm o mesmo nome.`,
    `A palavra Nome e, ao lado, uma caixinha para digitar. Se você tocar na palavra Nome, o cursor entra na caixinha.`],
  'html-1-19': [
    `O <input> muda de forma conforme o atributo type: "email" é para e-mails e "password" esconde o que se digita. O <textarea> é uma caixa grande para textos de várias linhas. O <button> cria um botão, e type="submit" faz o botão enviar o formulário.`,
    `Serve para montar formulários completos, como um "Fale conosco": e-mail, mensagem e botão de enviar.`,
    `Dentro do <form>, escreva o <input type="email" name="email">, o <textarea name="msg"></textarea> e o <button type="submit">Enviar</button>.`,
    `Uma caixa de e-mail, uma caixa maior para a mensagem e um botão escrito Enviar.`],
  'html-1-20': [
    `CSS é a linguagem que deixa a página bonita: cores, tamanhos, espaços. Uma regra de CSS tem um seletor (quem será enfeitado), chaves { } e, dentro delas, propriedade: valor; separados por dois-pontos e terminados com ponto e vírgula. Para escrever CSS dentro da página, use a tag <style>.`,
    `Serve para separar o que a página É (o HTML) de como ela PARECE (o CSS). Com uma regra só, você muda todos os títulos de uma vez.`,
    `Escreva <style>, a regra h1 { color: red; } e </style>. Depois escreva o <h1> com o texto Festa!`,
    `O título Festa! aparece com letras vermelhas, em vez do preto de sempre.`],
  'html-1-21': [
    `color muda a cor do texto e background-color muda a cor do fundo. A cor pode ser escrita como nome (yellow), como código hexadecimal (#ff0000, que é um vermelho) ou como rgb(255, 0, 0). Todos esses são jeitos de dizer a mesma coisa.`,
    `Serve para dar vida à página e para destacar o que importa: um aviso vermelho, um fundo amarelo, um texto azul.`,
    `Aqui você escreve só o CSS; a página já está pronta. Escreva h1 { color: #ff0000; } e p { background-color: yellow; }`,
    `O título aparece em vermelho e o parágrafo ganha um fundo amarelo atrás do texto.`],
  'html-1-22': [
    `font-size é o tamanho da letra, em pixels (px). font-family escolhe a fonte: você escreve uma lista de fontes e o navegador usa a primeira que o computador tiver; no final coloque sans-serif (letra sem perninhas) ou serif (com perninhas). font-style: italic deixa em itálico.`,
    `Serve para dar personalidade ao texto: um título bem grande, um texto de aparência elegante, uma citação inclinada.`,
    `Escreva h1 { font-size: 40px; font-family: Arial, sans-serif; } e p { font-style: italic; }. Cada propriedade termina com ponto e vírgula.`,
    `O título bem grande, numa letra sem perninhas, e o parágrafo inclinado.`],
  'html-1-23': [
    `text-align alinha o texto: left (esquerda), center (centro) ou right (direita). text-transform muda as letras: uppercase deixa tudo em MAIÚSCULAS. text-decoration: none tira o sublinhado dos links.`,
    `Serve para arrumar o texto: títulos no centro, avisos em maiúsculas e menus de links sem sublinhado.`,
    `Escreva uma regra para cada elemento: h1 { text-align: center; }, p { text-transform: uppercase; } e a { text-decoration: none; }`,
    `O título no meio da tela, o parágrafo todo em letras maiúsculas e o link Saiba mais sem a linha embaixo.`],
  'html-1-24': [
    `No CSS, o seletor de classe começa com um ponto: .aviso acha todos os elementos com class="aviso". O seletor de id começa com cerquilha: #final acha o elemento com id="final". Com a vírgula você junta vários seletores: h1, h2 { } vale para os dois.`,
    `Serve para enfeitar só o que você quer, e não todos os parágrafos de uma vez.`,
    `Escreva .aviso { color: red; } e #final { font-weight: bold; }. Não coloque espaço entre o ponto e o nome.`,
    `Os dois parágrafos de aviso ficam vermelhos, o parágrafo Boa sorte! fica em negrito e o título não muda.`],
  'html-1-25': [
    `Todo elemento é uma caixa. Dentro da caixa está o conteúdo; em volta dele vem o padding, o espaço de dentro, entre o conteúdo e a borda. padding: 20px; deixa 20 pixels de espaço nos quatro lados.`,
    `Serve para o conteúdo respirar: botões e cartões ficam mais bonitos quando o texto não encosta na borda.`,
    `Escreva .caixa { background-color: lightblue; padding: 20px; }. O fundo ajuda a ver o tamanho da caixa.`,
    `Uma caixa azul-clara com o texto afastado das bordas, com bastante espaço em volta.`],
  'html-1-26': [
    `A margin é o espaço de fora da caixa: ela empurra os vizinhos para longe. Com margin: 0 auto; e uma largura definida (width), a caixa fica centralizada na horizontal: o auto divide o espaço que sobra nos dois lados.`,
    `Serve para separar elementos uns dos outros e para centralizar blocos no meio da página.`,
    `Escreva .caixa { width: 200px; margin: 0 auto; } e h1 { margin-bottom: 30px; }.`,
    `A caixa estreita no meio da largura da página e um vão maior entre o título e a caixa.`],
  'html-1-27': [
    `border é a moldura da caixa. Ela junta três coisas: a espessura (3px), o estilo (solid é uma linha cheia, dashed é tracejada, dotted é de pontinhos) e a cor (blue). border-radius deixa os cantos arredondados.`,
    `Serve para cartões, botões e fotos com contorno e cantos suaves, como nos aplicativos de hoje.`,
    `Escreva .cartao { border: 3px solid blue; border-radius: 12px; }. Os três pedaços do border vão na mesma linha, separados por espaço.`,
    `O cartão ganha uma moldura azul bem marcada, com os quatro cantos arredondados.`],
  'html-1-28': [
    `width é a largura e height é a altura de uma caixa. Dá para usar px (pixels) ou % (uma parte do espaço disponível). max-width coloca um limite: a caixa nunca passa dele, mas pode ser menor em telas pequenas.`,
    `Serve para controlar o tamanho de cartões, imagens e banners, e fazer a página se ajustar bem ao celular.`,
    `Escreva .foto { width: 150px; height: 100px; background-color: gray; }. A regra vale para as duas fotos de uma vez.`,
    `Duas caixas cinzas do mesmo tamanho, uma embaixo da outra.`],
  'html-1-29': [
    `display: flex liga o modo "flexível" da caixa: os filhos dela ficam lado a lado, na mesma linha, em vez de um embaixo do outro. justify-content decide como eles se distribuem (space-between joga o primeiro para uma ponta e o último para a outra). gap é o espaço entre eles.`,
    `Serve para fazer menus, galerias e barras de botões. É a ferramenta de layout mais usada hoje.`,
    `Escreva .menu { display: flex; justify-content: space-between; gap: 20px; }. As regras ficam na caixa-pai (a .menu), não nos links.`,
    `Os três links Inicio, Sobre e Contato ficam na mesma linha, o primeiro na esquerda e o último na direita.`],
  'html-1-30': [
    `:hover é um estado do elemento: ele só vale enquanto o mouse está em cima. No CSS você escreve .botao:hover { ... } e essas regras só funcionam nesse momento. Por isso botões e links mudam de cor quando você passa o mouse.`,
    `Serve para a página responder ao usuário: mostrar que algo é clicável, destacar um menu, dar vida aos botões.`,
    `Escreva duas regras: .botao { background-color: tomato; } e .botao:hover { background-color: darkred; }.`,
    `O botão fica vermelho-tomate. Ao passar o mouse (ou tocar, no celular) sobre ele, o fundo escurece.`]
};
