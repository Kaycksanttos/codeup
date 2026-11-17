// PROJETOS DE HACKER E CIBERSEGURANÇA (nível Básico): um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// Cada projeto é um estudo de caso em forma de quiz (várias perguntas numa tela, sobre a mesma situação). Conferidos por `npm run check:pbi`.
const H = require('./ci-h');
const { mc, multi, order, match, num, write, tab, caesar } = H;
const { Q } = require('./hp')('ciber', 1);
const { base } = require('./pj');

let k = 0;
// pjQ(título, tarefa, [perguntas], [o que é, para que serve, como se faz, retorno esperado], [3 dicas])
const pjQ = (title, task, quiz, info, hints) => {
  k++;
  const q = Q('x', '', '', task, quiz, {});
  return { ...base('ciber', 1, k, title, task, info, hints), type: 'quiz', quiz: q.quiz, need: [], solution: '', exLang: 'text' };
};

const CONTAS = tab(['Conta', 'Senha', 'MFA'], [['E-mail', 'marina1990', 'Não'], ['Banco', 'Tr4nsp0rte!Azul#27', 'Sim'], ['Rede social', 'marina1990', 'Não'], ['Loja online', 'marina1990', 'Não']], { title: 'Contas da Marina' });
const MSG = tab(['Mensagem', 'Remetente', 'Pede', 'Link vai para'], [['A', 'suporte@meubanco.com.br', 'Nada: só avisa de uma nova fatura no aplicativo', 'Nenhum link'], ['B', 'atendimento@meubanco.com-seguro.net', 'Confirmar a senha em 1 hora', 'meubanco.com-seguro.net/entrar'], ['C', 'rh@empresa.com.br', 'Abrir a planilha do bônus (anexo .exe)', 'Anexo'], ['D', 'amigo@exemplo.com', 'Compartilhar a foto da viagem', 'Álbum no site oficial']], { title: 'Caixa de entrada' });
const FW = tab(['Regra', 'Porta', 'Ação'], [[1, 443, 'Permitir'], [2, 80, 'Permitir'], [3, 53, 'Permitir'], [4, 'Todas as outras', 'Bloquear']], { title: 'Regras do firewall do café' });
const PERM = tab(['Arquivo', 'Permissão', 'Conteúdo'], [['senhas.txt', '-rw-------', 'Senhas dos sistemas'], ['cardapio.pdf', '-rw-r--r--', 'Cardápio público'], ['backup.sh', '-rwxrwxrwx', 'Script de backup'], ['notas.txt', '-rw-rw----', 'Notas da equipe']], { title: 'Arquivos do servidor da loja' });
const LOG = tab(['Hora', 'Usuário', 'IP', 'Resultado'], [['03:10', 'admin', '203.0.113.88', 'Falha'], ['03:10', 'admin', '203.0.113.88', 'Falha'], ['03:11', 'root', '203.0.113.88', 'Falha'], ['03:11', 'admin', '203.0.113.88', 'Falha'], ['03:12', 'suporte', '203.0.113.88', 'Falha'], ['03:12', 'admin', '203.0.113.88', 'Sucesso'], ['09:00', 'ana', '198.51.100.30', 'Sucesso']], { title: 'Registro de logins do servidor' });

module.exports = [
  pjQ('as contas da Marina',
    'A Marina quer ficar mais segura na internet. Ajude-a a entender os princípios, classificar riscos, ler endereços e analisar as senhas das contas dela.',
    [
      match('Ligue cada situação ao princípio da tríade CIA:', [['Um desconhecido lê as mensagens privadas da Marina', 'Confidencialidade'], ['Um golpista altera o valor do boleto que ela vai pagar', 'Integridade'], ['O aplicativo do banco fica fora do ar por um ataque', 'Disponibilidade']], 'Cada situação fere **um pilar** diferente: quem vê, o que mudou e o que funciona.'),
      mc('Quem faz um teste de invasão num site, com contrato e permissão, é:', 'Um hacker de chapéu branco (ético)', ['Um hacker de chapéu preto, que ataca por crime', 'Um hacker de chapéu cinza, que invade sem pedir', 'Um criminoso que ataca para ganhar dinheiro'], 'Com **autorização**, o teste é ético. Sem ela, mesmo com boa intenção, é invasão.'),
      mc('Qual destes é uma VULNERABILIDADE?', 'A senha "marina1990" repetida em três contas', ['Um criminoso que quer roubar as contas dela', 'O banco em que a Marina tem conta corrente', 'A foto de perfil da Marina nas redes sociais'], 'A senha repetida é a **fraqueza**. O criminoso é a ameaça e as contas são os ativos.', { table: CONTAS }),
      num('Quantas contas da Marina usam a senha "marina1990"?', 3, 'E-mail, rede social e loja online: **3 contas**. Se uma vazar, as três caem.', { table: CONTAS, calc: () => 3 }),
      mc('Qual conta da Marina é a mais bem protegida?', 'O banco: senha longa e única, com MFA', ['O e-mail, que usa a senha marina1990', 'A rede social, que usa a senha marina1990', 'A loja online, que usa a senha marina1990'], 'A conta do banco tem **senha única, longa e MFA**. As outras três repetem uma senha fraca.', { table: CONTAS }),
      num('Quantas combinações tem uma senha de 4 dígitos?', 10000, '10⁴ = **10.000**. Por isso senhas curtas de números são fracas.', { calc: () => 10 ** 4 }),
      order('Coloque na ordem o caminho para abrir um site:', ['A pessoa digita o nome do site', 'O DNS traduz o nome em IP', 'O navegador pede a página', 'O servidor envia a página'], 'O nome só serve para as pessoas: as máquinas usam o **IP**, e o DNS faz a tradução.')
    ],
    [`O primeiro projeto de Hacker e Cibersegurança: as contas da Marina. Ele junta as lições 1 a 5: tríade CIA, ética, ativos, ameaças e vulnerabilidades, caminho de um site na internet e senhas fortes.`,
      `Antes de se proteger, é preciso saber o que se protege, do quê e onde estão as fraquezas. Uma senha repetida é uma das fraquezas mais comuns.`,
      `Leia a tabela das contas com calma e relacione cada situação com o pilar certo. Faça as contas de combinações e ordene o caminho do site.`,
      `Sete perguntas numa só tela (ligar, escolher, número e ordenar). Acertando tudo, o projeto está concluído.`],
    ['Confidencialidade é quem vê, integridade é o dado continuar certo e disponibilidade é o serviço funcionar.',
      'Vulnerabilidade é a fraqueza (senha repetida), ameaça é quem pode explorar e ativo é o que tem valor. Combinações = 10 elevado ao número de dígitos.',
      'Conte as linhas da tabela com a mesma senha. A conta do banco é a única que tem senha longa e MFA.']),

  pjQ('a caixa de entrada suspeita',
    'A Marina recebeu quatro mensagens. Descubra quais são golpes, leia os endereços dos links e decida o que fazer. Depois, pense em MFA, malware e backup.',
    [
      mc('Qual mensagem é a mais segura da caixa de entrada?', 'A: só avisa de uma fatura e manda conferir pelo aplicativo', ['B: pede a senha em 1 hora e traz um link para entrar', 'C: pede para abrir um arquivo .exe como se fosse planilha', 'Todas as quatro mensagens são seguras e podem ser abertas sem receio'], 'A **A** não pede dados nem traz link. A B tem pressa e link falso, e a C tem um anexo executável.', { table: MSG }),
      mc('Qual é o domínio verdadeiro do link da mensagem B?', 'meubanco.com-seguro.net', ['meubanco.com.br/entrar', 'meubanco.com-seguro.br', 'entrar.meubanco.com.net'], 'O domínio termina antes da primeira barra: **com-seguro.net**. O "meubanco" ali é só um enfeite.', { table: MSG }),
      multi('Quais sinais de phishing aparecem na mensagem B?', ['Pressa: "em 1 hora"', 'Pede a senha', 'O endereço do remetente não é o do banco'], ['Mensagem escrita em português', 'Tem um assunto'], 'Pressa, pedido de senha e **domínio diferente** formam o roteiro clássico do golpe.', { table: MSG }),
      mc('A mensagem C vem do RH e traz uma planilha de bônus em um arquivo .exe. O que fazer?', 'Não abrir e confirmar com o RH por outro canal', ['Abrir logo, porque é um bônus e não pode esperar', 'Encaminhar para os colegas verem também', 'Responder ao RH pedindo a senha dele para conferir'], 'Uma planilha **não é um .exe**. Esse arquivo é um programa e pode ser um trojan.', { table: MSG }),
      mc('Se a senha da Marina vazar, qual proteção ainda impede o acesso à conta?', 'A verificação em duas etapas (MFA)', ['O papel de parede do celular dela', 'O tamanho da tela do computador dela', 'O modelo do celular que ela usa hoje'], 'O **MFA** exige uma segunda prova, que o criminoso não tem.'),
      match('Ligue cada malware ao seu comportamento:', [['Ransomware', 'Tranca os arquivos e pede resgate'], ['Trojan', 'Finge ser um programa útil'], ['Worm', 'Se espalha sozinho pela rede'], ['Keylogger', 'Registra o que se digita']], 'Cada tipo tem um **jeito de agir**. Saber qual é ajuda a reagir.'),
      num('Pela regra 3-2-1, quantas cópias dos dados são necessárias no total?', 3, 'O primeiro número da regra é **3**: o original e mais duas cópias.', { calc: () => 3 })
    ],
    [`O segundo projeto de Hacker e Cibersegurança: a caixa de entrada suspeita. Ele junta as lições 6 a 10: gerenciador de senhas e MFA, phishing, engenharia social, malware, atualizações e backup.`,
      `Golpes por mensagem são o jeito mais comum de começar um ataque. Quem sabe ler o remetente, o link e o pedido corta o golpe antes de ele acontecer.`,
      `Compare as quatro mensagens na tabela, procure sinais de golpe em cada uma e leia o domínio dos links com cuidado.`,
      `Sete perguntas numa só tela (escolher, marcar, ligar e número). Acertando tudo, o projeto está concluído.`],
    ['Desconfie de pressa, pedido de senha e remetente com nome parecido, mas diferente.',
      'O domínio é o que vem antes da primeira barra. Um arquivo .exe é um programa, e não uma planilha.',
      'MFA = segunda prova. Backup 3-2-1: 3 cópias, 2 mídias, 1 fora do local.']),

  pjQ('a rede do café',
    'O Café Beira-Rio quer oferecer Wi-Fi sem colocar a loja em risco. Ajude o dono com endereços, padrões de Wi-Fi, portas, firewall e criptografia.',
    [
      mc('Qual destes endereços é um IP privado, usado só dentro da rede do café?', '192.168.1.50', ['203.0.113.9', '8.8.8.8', '198.51.100.3'], 'A faixa **192.168.x.x** é privada.'),
      order('Coloque os padrões de Wi-Fi do mais fraco ao mais forte:', ['WEP', 'WPA', 'WPA2', 'WPA3'], 'O **WPA3** é o mais forte, e o WEP, que está quebrado, é o pior.'),
      mc('O dono quer que os clientes usem uma rede separada da rede do caixa. Por quê?', 'Para que um cliente mal-intencionado não alcance os computadores do café', ['Porque o Wi-Fi fica mais bonito', 'Porque a lei exige duas redes', 'Para gastar menos energia'], 'Separar as redes **limita o estrago**: a rede dos clientes não enxerga o caixa.'),
      num('Cinco pacotes chegam nas portas 443, 80, 23, 53 e 3389. Quantos o firewall permite?', 3, 'Passam 443, 80 e 53: **3 pacotes**. A 23 e a 3389 caem na regra 4 e são bloqueadas.', { table: FW, calc: () => [443, 80, 23, 53, 3389].filter(p => [443, 80, 53].includes(p)).length }),
      mc('Qual política de firewall é a mais segura?', 'Bloquear tudo e liberar só o necessário, como na regra 4 da tabela', ['Liberar tudo e bloquear só o que for perigoso', 'Desligar o firewall', 'Liberar todas as portas acima de 1000'], 'A regra final **"bloquear o resto"** é o que deixa o firewall seguro.', { table: FW }),
      mc('Qual cuidado ajuda um cliente a usar o Wi-Fi do café com mais segurança?', 'Usar sites com HTTPS e, se possível, uma VPN', ['Entrar em todas as contas bancárias para testar a rede', 'Desligar as atualizações do celular', 'Usar a mesma senha em tudo'], 'O **HTTPS** e a VPN protegem o que passa por uma rede compartilhada.'),
      mc('Cifrando CAFE com a cifra de César e chave 3, qual é o resultado?', 'FDIH', ['BZEB', 'CAFE', 'GEJI'], 'C→F, A→D, F→I, E→H: **FDIH**.', { calc: () => caesar('CAFE', 3) })
    ],
    [`O terceiro projeto de Hacker e Cibersegurança: a rede do café. Ele junta as lições 11 a 15: IP público e privado, Wi-Fi seguro, portas e serviços, firewall e criptografia básica.`,
      `Uma rede de cliente é uma rede em que você não conhece ninguém. Por isso, separar redes, usar padrões fortes e limitar as portas é essencial.`,
      `Veja a tabela de regras do firewall, confira cada porta e descubra o que passa. Ordene os padrões de Wi-Fi e cifre a palavra com a chave pedida.`,
      `Sete perguntas numa só tela (escolher, ordenar e número). Acertando tudo, o projeto está concluído.`],
    ['A faixa 192.168 é privada. WPA3 é o mais novo e mais forte.',
      'Leia o firewall de cima para baixo: o primeiro que combina decide. A última regra bloqueia o resto.',
      'César com chave 3: cada letra anda 3 casas. A→D, C→F, E→H, F→I.']),

  pjQ('mensagens secretas e certificados',
    'A equipe de um aplicativo precisa guardar senhas, enviar mensagens secretas e provar a identidade do site. Ajude com hash, chaves, HTTPS, permissões e a LGPD.',
    [
      mc('Como o aplicativo deve guardar as senhas dos usuários?', 'Guardar só o hash das senhas, e não as senhas em si', ['Guardar as senhas em texto puro, num arquivo do servidor', 'Guardar cada senha apenas com as letras invertidas', 'Guardar as senhas dos usuários em e-mails enviados a eles'], 'Com o **hash**, um vazamento do banco não entrega as senhas.'),
      num('O SHA-256 gera 256 bits e cada caractere hexadecimal vale 4 bits. Quantos caracteres tem o hash?', 64, '256 ÷ 4 = **64** caracteres.', { calc: () => 256 / 4 }),
      mc('Para mandar uma mensagem secreta ao servidor, o aplicativo cifra com:', 'A chave pública do servidor', ['A chave privada do servidor', 'A senha do administrador', 'A chave privada do aplicativo'], 'O que a pública cifra, **só a privada do servidor** abre.'),
      mc('O que o certificado digital do site garante?', 'Que o site é dono do endereço que aparece no navegador', ['Que o dono do site é uma pessoa totalmente honesta e confiável', 'Que o site nunca será invadido por nenhum criminoso', 'Que o site está livre de qualquer tipo de erro técnico'], 'O certificado prova o **endereço**, e não a honestidade do dono.'),
      match('Ligue cada conceito à pergunta que responde:', [['Autenticação', 'Quem é você?'], ['Autorização', 'O que você pode fazer?'], ['Registro (auditoria)', 'O que você fez?']], 'São **três perguntas** diferentes, e cada uma depende de um mecanismo.'),
      mc('O app coleta nome, e-mail, o exame de saúde e a religião do usuário só para criar uma conta. O que há de errado?', 'Coletou dados demais, inclusive sensíveis, sem necessidade', ['Nada de errado, porque mais dados coletados são sempre melhores', 'O e-mail nunca pode ser coletado por nenhum aplicativo do mercado', 'Só o nome é problema, e os outros dados podem ficar à vontade'], 'A LGPD pede que se colete **só o necessário** para a finalidade.'),
      multi('Quais destes são direitos do titular na LGPD?', ['Saber quais dados a empresa guarda', 'Corrigir dados incorretos', 'Pedir a exclusão dos dados em certos casos'], ['Receber dinheiro a cada acesso', 'Ver os dados de qualquer outro usuário'], 'O titular tem **controle** sobre os próprios dados.')
    ],
    [`O quarto projeto de Hacker e Cibersegurança: mensagens secretas e certificados. Ele junta as lições 16 a 20: hash, criptografia de chave única e de par de chaves, HTTPS e certificados, autenticação e autorização, e a LGPD.`,
      `Quem desenvolve um aplicativo guarda dados de outras pessoas. Saber o que usar para cada coisa (hash, chave pública, certificado) evita erros graves.`,
      `Para cada pergunta, pense qual ferramenta resolve: hash para senha, chave pública para cifrar, certificado para provar o endereço.`,
      `Sete perguntas numa só tela (escolher, número, ligar e marcar). Acertando tudo, o projeto está concluído.`],
    ['Hash é de mão única. Quem guarda senhas deve guardar só o hash.',
      'Chave pública cifra, privada decifra. O certificado prova o endereço do site.',
      'LGPD: coletar só o necessário. Dados de saúde e religião são sensíveis.']),

  pjQ('o servidor da loja',
    'A loja de roupas Fio Dourado teve um alerta de segurança. Analise o terminal, as permissões, o registro de logins e o resultado de uma varredura.',
    [
      match('Ligue cada comando ao que ele faz:', [['pwd', 'Mostra a pasta atual'], ['ls', 'Lista os arquivos'], ['cd', 'Entra numa pasta'], ['cat', 'Mostra o conteúdo de um arquivo']], 'São os **quatro comandos** que mais se usam ao investigar um servidor.'),
      mc('Qual arquivo da tabela tem a permissão mais perigosa para o que ele guarda?', 'backup.sh, com permissão 777 (rwxrwxrwx)', ['senhas.txt, com permissão 600 (só o dono acessa)', 'cardapio.pdf, com permissão 644 (todos leem)', 'notas.txt, com permissão 660 (dono e grupo)'], 'O **777** deixa qualquer usuário alterar o script. O senhas.txt (600) está bem protegido.', { table: PERM }),
      num('Qual é o número do chmod do arquivo cardapio.pdf (-rw-r--r--)? Digite os três dígitos.', 644, 'rw- = 6, r-- = 4, r-- = 4: **644**.', { table: PERM, calc: () => 600 + 40 + 4 }),
      num('Quantas tentativas de login FALHARAM no registro?', 5, 'As cinco primeiras linhas são falhas do IP 203.0.113.88: **5**.', { table: LOG, calc: () => 5 }),
      mc('O que o registro mostra às 03:12 de preocupante?', 'Depois de 5 falhas, alguém acertou a senha do admin: pode ter sido invasão', ['Nada de importante: o admin apenas errou a senha', 'O servidor foi atualizado e reiniciado de madrugada', 'O firewall foi desligado por um administrador distraído'], 'Muitas falhas e **depois um sucesso**, do mesmo IP, é o sinal clássico de uma senha adivinhada.', { table: LOG }),
      multi('Quais medidas ajudam depois desse alerta?', ['Trocar a senha do admin e ligar o MFA', 'Bloquear o IP e limitar as tentativas de login', 'Guardar os logs em lugar protegido'], ['Apagar os logs para não assustar', 'Dar a todos a senha do admin'], 'Corrigir, **conter** e **preservar as provas** é o caminho certo.', { table: LOG }),
      mc('Em qual caso é permitido fazer uma varredura de portas no servidor?', 'Quando o servidor é da própria loja ou há autorização por escrito', ['Quando a varredura é feita de madrugada, para ninguém ver', 'Quando ninguém da empresa está olhando para o servidor', 'Em qualquer servidor conhecido e famoso da internet'], 'A **autorização** é o que torna a varredura legal.')
    ],
    [`O quinto projeto de Hacker e Cibersegurança: o servidor da loja. Ele junta as lições 21 a 25: comandos do terminal, permissões no Linux, leitura de logs, pegada digital e varredura de portas.`,
      `Investigar um servidor é ler sinais: permissões frouxas, tentativas de login e portas abertas. Quem aprende a ler esses sinais se defende melhor.`,
      `Veja a tabela de permissões, converta as letras em números e leia o registro de logins procurando falhas e o acerto depois delas.`,
      `Sete perguntas numa só tela (ligar, escolher, número e marcar). Acertando tudo, o projeto está concluído.`],
    ['r vale 4, w vale 2 e x vale 1. O 777 dá todas as permissões a todos.',
      'Conte as linhas com "Falha" do mesmo IP. Falhas seguidas de um acerto são um sinal forte.',
      'Contenção, correção e provas guardadas: troque a senha, ligue o MFA, bloqueie o IP e proteja os logs.']),

  pjQ('o plano de segurança da empresa',
    'A empresa Rota Azul vai lançar um site de vendas. Monte o plano: riscos comuns, defesa contra injeção de SQL, resposta a um incidente, checklist e ética.',
    [
      match('Ligue cada risco ao exemplo:', [['Controle de acesso quebrado', 'Mudar o número na URL e ver o pedido de outra pessoa'], ['Injeção', 'O texto digitado vira parte de um comando no banco'], ['Configuração incorreta', 'Painel com a senha de fábrica'], ['Componente desatualizado', 'Biblioteca com falha já corrigida']], 'Cada exemplo mostra **um tipo de erro** da lista de riscos mais comuns em sistemas web.'),
      mc('Qual é a defesa correta contra injeção de SQL?', 'Consultas parametrizadas', ['Esconder o formulário', 'Usar maiúsculas nos comandos', 'Aumentar a tela do site'], 'Com **parâmetros**, o dado nunca vira comando.'),
      order('Coloque as etapas da resposta a incidentes na ordem:', ['Preparação', 'Identificação', 'Contenção', 'Erradicação', 'Recuperação', 'Lições aprendidas'], 'Prepare antes, e depois de resolver, **aprenda** com o caso.'),
      mc('Um vazamento expôs dados de clientes e há risco relevante. O que a LGPD prevê?', 'Comunicar a ANPD e os titulares dos dados', ['Esconder o caso para não perder clientes', 'Esperar um ano para falar do caso', 'Avisar só os diretores'], 'A lei pede **transparência** quando há risco ou dano relevante.'),
      multi('Quais itens fazem parte de um bom checklist de segurança?', ['Senhas únicas com gerenciador de senhas', 'MFA nas contas importantes', 'Atualizações e backup 3-2-1'], ['Uma senha forte igual para tudo', 'Desligar as atualizações automáticas'], 'O checklist junta **hábitos simples** que fecham as portas mais usadas.'),
      mc('Um pesquisador acha uma falha no site da empresa sem ter sido autorizado. Qual é o jeito responsável de agir?', 'Avisar pelo canal oficial, sem explorar a falha nem divulgá-la antes da correção', ['Publicar a falha nas redes', 'Usar a falha para ver os dados dos clientes', 'Vender a falha para outra empresa'], 'A **divulgação responsável** dá tempo para a empresa corrigir.'),
      write('Escreva uma frase dizendo por que a empresa deve ter um plano de resposta a incidentes antes de qualquer problema.', ['!qual a ideia :: plano|prepar|antes|organiz|ensai', '!por que :: rapid|calma|reag|estrago|prejuiz|ordem|caos|perder tempo|conter|minimiz|menor'], 'Com um plano pronto a equipe reage com calma e rapidez, e o estrago do incidente é menor', 'Quem já sabe o que fazer **reage mais rápido** e com menos erros.')
    ],
    [`O sexto projeto de Hacker e Cibersegurança: o plano de segurança da empresa. Ele junta as lições 26 a 30: riscos mais comuns de sistemas web, injeção de SQL, resposta a incidentes, checklist pessoal e carreira e ética.`,
      `Um plano junta o que se aprendeu: prevenir os erros comuns, saber reagir a um incidente e agir sempre dentro da lei e da ética.`,
      `Ligue cada risco ao exemplo certo, ordene as etapas do incidente e escreva a última resposta com as suas palavras.`,
      `Sete perguntas numa só tela (ligar, escolher, ordenar, marcar e escrever). Acertando tudo, o projeto está concluído.`],
    ['Cada risco é um tipo de erro. Injeção = o texto do usuário vira comando.',
      'Ordem do incidente: preparar, identificar, conter, erradicar, recuperar, aprender.',
      'Um plano pronto faz a equipe reagir com calma, mais rápido e com menos estrago.'])
];
