// EXCEL — NÍVEL BÁSICO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'xl-1-01': [
    `O Excel é uma folha cheia de quadradinhos, chamados células. Cada célula tem um endereço, como B2 (coluna B, linha 2). Quando você escreve um sinal de igual (=) no começo, o Excel entende que é uma conta e mostra o resultado.`,
    `Serve para o computador fazer as contas por você. Em vez de pegar a calculadora, você escreve a conta numa célula e o Excel responde na hora.`,
    `Toque na célula B2 (ela fica destacada) e, na barra de cima, escreva: um =, o número 15, um + e o número 27. Depois toque no ✓ ou aperte Enter para confirmar.`,
    `Na célula B2 vai aparecer o número 42. A conta fica guardada, mas o que se vê na célula é só o resultado.`],
  'xl-1-02': [
    `As quatro contas básicas ganham sinais no teclado: + é mais, - é menos, * (asterisco) é vezes e / (barra) é dividido. Os sinais × e ÷ da escola não funcionam no Excel.`,
    `Serve para fazer qualquer conta simples, do jeito certo. Quem usa x ou ÷ por engano recebe um aviso de erro, então vale decorar esses quatro.`,
    `Em cada linha, escreva = e depois a conta que está escrita na coluna A, trocando × por * e ÷ por /. Por exemplo, a de multiplicar é =20*5.`,
    `Quatro resultados: 25, 15, 100 e 4, um em cada linha da coluna Resultado.`],
  'xl-1-03': [
    `Em vez de escrever os números dentro da conta, você pode apontar para a célula onde eles estão, como B2. A conta passa a olhar o que está na célula, e não um número parado.`,
    `Serve para a planilha se atualizar sozinha. Se o preço mudar, você troca só o número da célula e todas as contas que dependem dela mudam juntas.`,
    `Em D2 escreva = e depois toque na célula B2 (ou digite B2), escreva * e toque na célula C2. Fica =B2*C2. Confirme.`,
    `O total da caneta: 25 reais, que é o preço de 2,50 vezes 10 canetas.`],
  'xl-1-04': [
    `Quando você escreve uma fórmula numa linha e a copia para a linha de baixo, o Excel é esperto: ele troca as linhas sozinho. A fórmula =B2*C2 copiada uma linha abaixo vira =B3*C3.`,
    `Serve para não escrever a mesma conta dezenas de vezes. Você faz uma vez e espalha para a coluna inteira em um segundo.`,
    `Escreva =B2*C2 em D2 e confirme. Depois toque na célula D2 e use o botão Preencher ↓ (ele copia a fórmula para as linhas de baixo da coluna).`,
    `A coluna Total preenchida do Caneta até o Lápis: 25, 72, 120, 36 e 36.`],
  'xl-1-05': [
    `Parênteses são como uma caixinha: o que está dentro é feito primeiro. Sem eles, o Excel faz primeiro vezes e dividido e só depois soma e subtrai, igual na escola.`,
    `Serve para dizer ao Excel a ordem certa das contas. 2+3*4 dá 14, mas (2+3)*4 dá 20: o resultado muda!`,
    `Você quer somar o preço com o frete e só depois multiplicar pela quantidade. Escreva =(B2+C2)*D2 e copie para as outras linhas.`,
    `Os totais: Camiseta 144, Boné 60 e Meia 78. Se esquecer os parênteses, os números ficam errados.`],
  'xl-1-06': [
    `Porcentagem é uma fração de 100: 10% é o mesmo que 0,1. Na planilha, a célula pode mostrar 10% mas guardar 0,1. Aumentar 10% é multiplicar por 1,10; por isso a conta usa (1 + o reajuste).`,
    `Serve para calcular aumentos, descontos, comissões e juros, coisas que aparecem em qualquer loja.`,
    `Escreva =B2*(1+C2) em D2 e copie para baixo. A célula C2 já guarda o reajuste como porcentagem; é só apontar para ela.`,
    `Os novos preços: Arroz 22, Feijão 8,40 e Óleo 9.`],
  'xl-1-07': [
    `O sinal ^ (acento circunflexo) eleva um número a uma potência. 2^3 quer dizer 2 vezes 2 vezes 2, que dá 8. É a conta que faz o dinheiro render com juros que crescem sobre juros.`,
    `Serve para calcular juros compostos: quanto um dinheiro vira depois de alguns anos, rendendo uma taxa a cada ano.`,
    `Escreva =A2*(1+B2)^C2 em D2: o capital vezes (1 + a taxa) elevado ao número de anos. Copie para as outras linhas.`,
    `Os montantes: 1.157,63 reais, 2.163,20 reais e 2.196,15 reais.`],
  'xl-1-08': [
    `SOMA é uma função, uma ferramenta pronta do Excel. Você dá a ela um intervalo (como B2:B6, que quer dizer "de B2 até B6") e ela soma tudo que tem lá dentro.`,
    `Serve para somar uma lista inteira sem escrever B2+B3+B4+B5+B6. Se a lista tiver 500 linhas, só muda o intervalo.`,
    `Em B7 escreva =SOMA( e depois selecione de B2 até B6 (ou digite B2:B6), feche o parêntese e confirme: =SOMA(B2:B6).`,
    `Vai aparecer o total das vendas da semana: 645 reais.`],
  'xl-1-09': [
    `MÉDIA soma os números do intervalo e divide pela quantidade deles, como a média das notas da escola.`,
    `Serve para saber o valor "do meio" de uma lista: a nota média de um aluno, o preço médio dos produtos, as vendas médias por dia.`,
    `Em E2 escreva =MÉDIA(B2:D2): o intervalo vai da Prova 1 até a Prova 3 do aluno, na mesma linha. Copie para baixo.`,
    `As médias: Ana 8,00, Bruno 6,17 e Carla 9,50.`],
  'xl-1-10': [
    `MÁXIMO procura o maior número de uma lista e MÍNIMO procura o menor. Você não precisa olhar os números um por um.`,
    `Serve para achar o melhor e o pior resultado: a maior venda, o dia mais quente, a menor nota.`,
    `Em B9 escreva =MÁXIMO(B2:B8) e em B10 escreva =MÍNIMO(B2:B8). Os dois olham para os mesmos dias da semana.`,
    `Duas respostas: 30 graus de máxima e 19 graus de mínima.`],
  'xl-1-11': [
    `CONT.NÚM conta quantas células têm número. CONT.VALORES conta quantas células não estão vazias, sejam elas número ou texto.`,
    `Serve para contar coisas: quantas notas já foram lançadas, quantas pessoas estão na lista, quantas vendas houve.`,
    `Em B8 escreva =CONT.NÚM(B2:B7) para contar as notas. Em B9 escreva =CONT.VALORES(A2:A7) para contar os nomes. Duas células da coluna de notas estão vazias, de propósito.`,
    `Dois números: 4 notas lançadas e 6 alunos na lista.`],
  'xl-1-12': [
    `Quando você copia uma fórmula, as células dela "andam". Para uma célula ficar parada, coloque o cifrão ($) antes da coluna e da linha: $B$1 sempre aponta para B1, não importa para onde a fórmula for copiada.`,
    `Serve para contas que usam sempre o mesmo número, como a cotação do dólar, uma taxa ou um imposto, que fica numa célula só.`,
    `Em C3 escreva =B3*$B$1 (o preço em dólar vezes a cotação travada) e copie para baixo. Dica: com o cursor em B1 na fórmula, toque no botão $ para travar.`,
    `Os preços em reais: Mouse 78, Teclado 208, Monitor 936 e Webcam 286.`],
  'xl-1-13': [
    `A participação de um item no total é o valor dele dividido pelo total. Se o total fica numa célula só, você a trava com $ para a conta poder ser copiada para baixo.`,
    `Serve para saber quanto cada produto pesa nas vendas: "o notebook é metade do que vendemos".`,
    `Em C2 escreva =B2/$B$6 e copie até C5. A célula B6 já tem o total pronto. A coluna está formatada como porcentagem.`,
    `As porcentagens: Notebook 52,5%, Mouse 7,5%, Teclado 11,3% e Monitor 28,8%.`],
  'xl-1-14': [
    `ARRED arredonda um número para a quantidade de casas que você escolher, como na escola: 5 ou mais sobe. ARREDONDAR.PARA.CIMA sempre sobe e ARREDONDAR.PARA.BAIXO sempre desce.`,
    `Serve para cortar números com muitas casas depois da vírgula (dinheiro tem duas casas) e para decidir se um número deve sempre sobrar ou faltar.`,
    `Em B2 escreva =ARRED(A2;2). Em C2, =ARREDONDAR.PARA.CIMA(A2;0) e em D2, =ARREDONDAR.PARA.BAIXO(A2;0). O número depois do ponto e vírgula é a quantidade de casas.`,
    `Para o valor 12,3456: 12,35, 13 e 12. Os outros valores seguem a mesma ideia.`],
  'xl-1-15': [
    `SE é a função que decide. Você dá três coisas: uma pergunta (condição), o que mostrar se a resposta for sim e o que mostrar se for não. Textos precisam de aspas.`,
    `Serve para o Excel escolher uma resposta sozinho: aprovado ou reprovado, tem estoque ou não, pagou ou deve.`,
    `Em C2 escreva =SE(B2>=7;"Aprovado";"Reprovado"). Leia assim: se a nota for 7 ou mais, mostre Aprovado; senão, Reprovado. Copie para baixo.`,
    `Palavras em cada linha: Ana Aprovado, Bruno Reprovado, Carla Aprovado e Davi Reprovado.`],
  'xl-1-16': [
    `Dentro do SE, você pode comparar números e também textos. Os sinais de comparação são = (igual), <> (diferente), > (maior), < (menor), >= (maior ou igual) e <= (menor ou igual).`,
    `Serve para tratar casos diferentes: quem é do Sul ganha bônus, quem é de outra região não.`,
    `Em D2 escreva =SE(B2="Sul";C2*10%;0). Repare nas aspas em volta do Sul. Se a região for Sul, o bônus é 10% das vendas; se não, é 0.`,
    `Bônus: Ana 100, Bruno 0, Carla 120 e Davi 0.`],
  'xl-1-17': [
    `E e OU juntam várias condições. E só dá "sim" se todas forem verdadeiras. OU dá "sim" se pelo menos uma for. Você usa os dois dentro do SE.`,
    `Serve para regras com mais de uma exigência: "nota alta E poucas faltas" ou "nota baixa OU muitas faltas".`,
    `Em D2 escreva =SE(E(B2>=7;C2<=5);"Sim";"Não"). Em E2 escreva =SE(OU(B2<5;C2>8);"Sim";"Não"). Copie as duas para baixo.`,
    `Duas colunas de Sim e Não. Só a Ana é aprovada; Bruno, Carla e Davi ficam em recuperação.`],
  'xl-1-18': [
    `Quando há mais de duas respostas, um SE pode ficar dentro do outro: se não for A, o Excel pergunta se é B; se não for B, pergunta se é C, e assim por diante.`,
    `Serve para classificar em faixas: conceito A, B, C ou D; preço barato, médio ou caro; pequeno, médio ou grande.`,
    `Em C2 escreva =SE(B2>=9;"A";SE(B2>=7;"B";SE(B2>=5;"C";"D"))). Conte os parênteses: três SE precisam de três fechamentos no final. Copie para baixo.`,
    `Os conceitos: Ana A, Bruno B, Carla C, Davi D e Elisa B.`],
  'xl-1-19': [
    `SOMASE é uma soma com filtro. Você diz onde procurar (as regiões), o que procurar (Sul, por exemplo) e o que somar (os valores), e ela soma só as linhas que combinam.`,
    `Serve para responder "quanto vendeu cada região?", "quanto gastei só com mercado?" sem separar a lista na mão.`,
    `Em F2 escreva =SOMASE($B$2:$B$7;E2;$C$2:$C$7): procura a região escrita em E2 dentro de B2:B7 e soma os valores de C2:C7. Copie para baixo.`,
    `Os totais por região: Sul 3.200, Norte 1.500 e Leste 500 reais.`],
  'xl-1-20': [
    `CONT.SE conta as linhas que combinam com uma condição. MÉDIASE faz a média só dessas linhas. Condições com números levam o sinal entre aspas, como ">1000".`,
    `Serve para responder perguntas como "quantas vendas passaram de mil?" e "qual a média das vendas só do Sul?".`,
    `Em F2 escreva =CONT.SE(C2:C7;">1000"). Em F3 escreva =MÉDIASE(B2:B7;"Sul";C2:C7): região em B, só do Sul, média dos valores de C.`,
    `Dois resultados: 2 vendas acima de 1000 e média do Sul de 1.066,67 reais.`],
  'xl-1-21': [
    `O sinal & (e comercial) cola textos. Você pode colar o conteúdo de células e também textos fixos entre aspas, como um espaço (" ").`,
    `Serve para juntar pedaços: nome e sobrenome, rua e número, ou montar uma frase com dados da planilha.`,
    `Em C2 escreva =A2&" "&B2: o nome, um espaço entre aspas e o sobrenome. Copie para baixo.`,
    `Os nomes completos: Ana Lima, Bruno Cardoso, Carla Dias e Davi Souza.`],
  'xl-1-22': [
    `ARRUMAR tira os espaços a mais do começo, do fim e do meio. PRI.MAIÚSCULA põe a primeira letra de cada palavra em maiúscula. MAIÚSCULA deixa tudo em letras grandes e MINÚSCULA em letras pequenas.`,
    `Serve para limpar listas bagunçadas, onde cada pessoa escreveu o nome de um jeito.`,
    `Em B2 escreva =PRI.MAIÚSCULA(ARRUMAR(A2)): primeiro arruma os espaços, depois ajeita as letras. Em C2 escreva =MAIÚSCULA(B2). Funções podem ficar uma dentro da outra.`,
    `Nomes arrumados, como Ana Lima, e a versão em maiúsculas, como ANA LIMA.`],
  'xl-1-23': [
    `ESQUERDA pega letras do começo de um texto, DIREITA pega as do fim e EXT.TEXTO pega um pedaço do meio: você diz em que posição começa e quantas letras quer.`,
    `Serve para tirar informação de códigos: nas três primeiras letras está a categoria, no meio está o ano, no fim o número.`,
    `Em B2 escreva =ESQUERDA(A2;3). Em C2, =EXT.TEXTO(A2;5;4) (começa na 5ª letra e pega 4). Em D2, =DIREITA(A2;4). Copie as três para baixo.`,
    `Para NOT-2024-0042: NOT, 2024 e 0042. Todos eles são textos, não números.`],
  'xl-1-24': [
    `TEXTO transforma um número em texto já formatado. O segundo argumento é o molde: "R$ 0,00" quer dizer "R$, um espaço e o número com duas casas".`,
    `Serve para colocar números dentro de frases sem perder a formatação (sem ela, 5,5 apareceria no meio do texto como 5,5 em vez de R$ 5,50).`,
    `Em C2 escreva =A2&" custa "&TEXTO(B2;"R$ 0,00"). Aqui você usa o & para colar o nome, o texto " custa " e o preço formatado.`,
    `As etiquetas: Caneta custa R$ 5,50, Caderno custa R$ 18,00 e Mochila custa R$ 120,90.`],
  'xl-1-25': [
    `Para o Excel, uma data é um número: o dia 1 é o primeiro dia de 1900 e cada dia novo soma 1. Por isso dá para subtrair datas (e obter dias). ANO, MÊS e DIA tiram um pedaço da data e DATA(ano;mês;dia) cria uma.`,
    `Serve para organizar vendas por mês, saber quantos dias faltam para um prazo e calcular vencimentos.`,
    `Em C2 escreva =ANO(B2), em D2 =MÊS(B2) e em E2 =DATA(2025;12;31)-B2. Copie as três para baixo.`,
    `Para o pedido de 12/03/2025: ano 2025, mês 3 e 294 dias até o fim do ano.`],
  'xl-1-26': [
    `PROCV é a função de "procurar numa tabela". Ela olha a primeira coluna da tabela, acha o valor que você procura e devolve o que está na coluna que você pediu, na mesma linha. O último argumento FALSO quer dizer "só o valor exato".`,
    `Serve para trazer informação de outra lista: o nome e o preço do produto a partir do código, o nome do cliente a partir do número.`,
    `Em F2 escreva =PROCV(E2;$A$2:$C$5;2;FALSO). O 2 é a coluna do nome na tabela; para o preço, troque por 3. A tabela leva $ para ficar parada ao copiar.`,
    `O nome e o preço de cada pedido: o código 103 traz Monitor e 900 reais, e assim por diante.`],
  'xl-1-27': [
    `Quando uma fórmula não consegue responder, ela mostra um erro, como #N/D (não encontrado). SEERRO é uma rede de proteção: se a fórmula der erro, ela mostra o que você escolheu no lugar.`,
    `Serve para a planilha não ficar cheia de erros feios quando falta um dado.`,
    `Em E2 escreva =SEERRO(PROCV(D2;$A$2:$B$4;2;FALSO);"Não encontrado"). O PROCV vai dentro do SEERRO. Copie para baixo.`,
    `Os pedidos 103 e 101 acham Monitor e Mouse; os códigos 999 e 105 mostram "Não encontrado".`],
  'xl-1-28': [
    `CORRESP diz em qual posição da lista está um valor (o terceiro da lista, por exemplo). ÍNDICE faz o contrário: dá uma posição e devolve o que está lá. Juntos, eles procuram até para a esquerda.`,
    `Serve quando o PROCV não dá conta: ele só devolve o que está à direita da coluna procurada. Aqui o preço está à esquerda do nome.`,
    `Em E2 escreva =ÍNDICE($A$2:$A$5;CORRESP(D2;$B$2:$B$5;0)). O CORRESP acha a posição do nome (o 0 é "exato") e o ÍNDICE traz o preço dessa posição.`,
    `Os preços: Webcam 150, Mouse 50 e Monitor 900.`],
  'xl-1-29': [
    `PROCX é o procurador novo do Excel. Você diz o que procurar, em que lista procurar, de qual lista devolver e o que mostrar se não achar. Não precisa contar colunas. Existe no Excel 365 e no Excel 2021 ou mais novo.`,
    `Serve para o mesmo que o PROCV, mas mais fácil e seguro: procura em qualquer direção e já trata o "não achei".`,
    `Em F2 escreva =PROCX(E2;$A$2:$A$4;$B$2:$B$4;"Não encontrado"). Em G2, a mesma ideia devolvendo os preços ($C$2:$C$4) e 0 se não achar.`,
    `O 999 mostra "Não encontrado" e preço 0; os outros códigos trazem nome e preço.`],
  'xl-1-30': [
    `É uma lição de revisão: você junta o PROCV (para achar a taxa de cada região), contas com células, SOMA, SOMASE e CONT.SE no mesmo relatório.`,
    `Serve para mostrar que as funções se combinam. Um relatório de verdade quase sempre usa várias delas juntas.`,
    `Em D2 escreva =C2*PROCV(B2;$F$2:$G$4;2;FALSO) e copie até D7. Depois: D9 com SOMA das comissões, D10 com SOMASE do Sul e D11 com CONT.SE das vendas acima de 1000.`,
    `Comissões por vendedor e, embaixo, três resumos: o total de comissões, as vendas do Sul e a quantidade de vendas acima de 1000.`]
};
