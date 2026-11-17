// PROVAS DO CURSO HACKER E CIBERSEGURANÇA (nível Básico): checkpoint depois da lição 10 (fundamentos e golpes), checkpoint depois da 20 (redes e criptografia)
// e prova final depois da 30 (defesa na prática). Mesmas regras de chances do resto do app (lessons.js). Conferidas por `npm run check:pbi`.
const H = require('./ci-h');
const { mc, multi, order, match, num, write, tab, info, caesar } = H;
const { Q } = require('./hp')('ciber', 1);

const strip = ({ explain, example, ...b }) => b;
const cp = (k, title, task, base, inf, o = {}) => ({ ...strip(base), id: `cp-ci-1-${k * 10}`, cp: true, k, after: k * 10, n: k * 10, xp: 60, title, task, test: true, info: info(inf), ...o });
const fin = (title, task, base, inf, o = {}) => ({ ...strip(base), id: 'fin-ci-1', fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, test: true, info: info(inf), ...o });

const FW = tab(['Regra', 'Porta', 'Ação'], [[1, 443, 'Permitir'], [2, 22, 'Permitir'], [3, 'Todas as outras', 'Bloquear']], { title: 'Regras do firewall' });
const LOG = tab(['Hora', 'Usuário', 'IP', 'Resultado'], [['22:01', 'root', '203.0.113.77', 'Falha'], ['22:01', 'admin', '203.0.113.77', 'Falha'], ['22:02', 'root', '203.0.113.77', 'Falha'], ['22:02', 'user', '203.0.113.77', 'Falha'], ['22:03', 'root', '203.0.113.77', 'Falha'], ['22:40', 'vera', '198.51.100.12', 'Sucesso']], { title: 'Logins da madrugada' });
const SCAN = tab(['Porta', 'Estado', 'Serviço'], [[21, 'aberta', 'ftp'], [22, 'aberta', 'ssh'], [23, 'aberta', 'telnet'], [443, 'aberta', 'https'], [3389, 'fechada', 'rdp']], { title: 'Varredura do servidor' });

module.exports = [
  cp(1, 'Checkpoint: fundamentos e golpes',
    'Responda as perguntas sobre o que você aprendeu nas lições 1 a 10: tríade CIA, ética, risco, senhas, MFA, phishing, engenharia social, malware e backup.',
    Q('x', '', '', 'x', [
      match('Ligue cada situação ao princípio da tríade CIA:', [['Alguém lê o e-mail de outra pessoa', 'Confidencialidade'], ['O valor de um boleto é trocado no caminho', 'Integridade'], ['O site de uma loja cai por excesso de acessos', 'Disponibilidade']], '**Confidencialidade** é quem vê, **integridade** é o dado não ser alterado e **disponibilidade** é o serviço estar de pé.'),
      mc('Qual é a regra de ouro de quem faz testes de segurança?', 'Só testar o que é seu ou o que tem autorização por escrito', ['Testar qualquer site que pareça fraco ou mal protegido', 'Testar o que quiser e avisar a empresa só depois', 'Testar apenas durante a madrugada, para ninguém perceber'], 'A **autorização** é o que separa o teste da invasão.'),
      num('Uma falha tem 20% de chance de acontecer e causaria R$ 10.000 de prejuízo. Qual é o risco esperado, em reais?', 2000, '0,20 × 10.000 = **R$ 2.000**.', { unit: 'reais', calc: () => 0.2 * 10000 }),
      num('Quantas senhas existem com 3 dígitos (de 000 a 999)?', 1000, '10 × 10 × 10 = **1.000**. Poucos dígitos significam poucas combinações.', { calc: () => 10 ** 3 }),
      mc('Por que o MFA protege a conta mesmo se a senha vazar?', 'Porque o criminoso ainda precisa do segundo fator', ['Porque a senha passa a ser apagada pelo próprio site', 'Porque o site fica fora do ar até o dono voltar', 'Porque o MFA troca a senha sozinho a cada acesso'], 'O segundo fator (algo que você **tem** ou **é**) barra quem só conseguiu a senha.'),
      mc('Qual é o domínio verdadeiro deste link? entrar.meubanco.com.br.promo-urgente.net/login', 'promo-urgente.net', ['meubanco.com.br.promo', 'entrar.meubanco.com.br', 'login/promo-urgente.net'], 'O domínio termina antes da primeira barra: **promo-urgente.net**. O resto é só enfeite para enganar.'),
      mc('Uma pessoa liga dizendo ser do banco e pede o código que chegou por SMS. O que fazer?', 'Desligar e ligar para o número oficial do banco', ['Passar o código para ela confirmar', 'Pedir o nome e o CPF dela e passar o código', 'Dar só a metade do código'], 'O banco **nunca pede** o código. A pressa é a arma do golpista.'),
      mc('Seus arquivos ficaram trancados e aparece um pedido de pagamento. Qual medida mais ajuda a se recuperar sem pagar?', 'Ter um backup recente guardado fora do computador', ['Instalar um segundo antivírus logo depois do ataque', 'Reiniciar o computador várias vezes seguidas', 'Avisar os amigos pelas redes sociais do ocorrido'], 'Um **backup** (de preferência pela regra 3-2-1) devolve os arquivos sem negociar com criminosos.')
    ]),
    [`É o primeiro checkpoint do curso de Hacker e Cibersegurança: um quiz que junta as lições 1 a 10. Você mostra que entendeu os pilares da segurança, a ética, as senhas e os golpes mais comuns.`,
      `Serve para conferir se a base está firme antes de entrar em redes e criptografia, que usam tudo o que você viu até aqui.`,
      `Leia cada pergunta com calma, faça as contas e ligue as ideias. Se o endereço de um link aparecer, procure o domínio verdadeiro.`,
      `Oito perguntas numa só tela. Passando, você libera as lições 11 a 20.`]),

  cp(2, 'Checkpoint: redes e criptografia',
    'Responda as perguntas sobre as lições 11 a 20: IP, Wi-Fi, portas, firewall, cifra de César, hash, chaves, HTTPS, autenticação e LGPD.',
    Q('x', '', '', 'x', [
      mc('Qual destes endereços é um IP privado?', '172.20.5.8', ['8.8.8.8', '203.0.113.5', '1.1.1.1'], 'A faixa **172.16 a 172.31** é privada, assim como 10.x.x.x e 192.168.x.x.'),
      order('Coloque os padrões de Wi-Fi do mais fraco para o mais forte:', ['WEP', 'WPA', 'WPA2', 'WPA3'], 'Cada geração corrigiu falhas da anterior. O **WEP** está quebrado.'),
      num('Seis pacotes chegam nas portas 22, 23, 80, 443, 443 e 3389. Quantos passam pelas regras do firewall?', 3, 'Passam a 22 (regra 2) e as duas de 443 (regra 1): **3 pacotes**. A 23, a 80 e a 3389 caem na regra 3 e são bloqueadas.', { table: FW, calc: () => [22, 23, 80, 443, 443, 3389].filter(p => p === 443 || p === 22).length }),
      mc('Cifrando HOJE com a cifra de César e chave 2, qual é o resultado?', 'JQLG', ['FMHC', 'IPKF', 'HOJE'], 'H→J, O→Q, J→L, E→G: **JQLG**.', { calc: () => caesar('HOJE', 2) }),
      multi('Quais destas propriedades são do hash?', ['Tamanho fixo', 'Não dá para desfazer', 'Qualquer mudança no dado muda o hash'], ['Dá para recuperar o dado com a chave', 'Só serve para fotos'], 'O hash é **mão única**, de tamanho fixo e muito sensível a mudanças.'),
      mc('Para enviar uma mensagem secreta a uma amiga, qual chave você usa para cifrar?', 'A chave pública dela', ['A chave privada dela', 'A sua chave privada', 'A senha do e-mail dela'], 'Só a **privada dela** abre o que foi cifrado com a pública.'),
      mc('O cadeado de HTTPS num site garante que:', 'A conexão é protegida, mas não que o dono do site é honesto', ['O site é 100% confiável', 'O site não tem vírus', 'O site foi aprovado pelo governo'], 'O cadeado fala do **caminho**, e não da boa-fé do dono.'),
      match('Ligue cada conceito à pergunta que responde:', [['Autenticação', 'Quem é você?'], ['Autorização', 'O que você pode fazer?'], ['Registro (auditoria)', 'O que você fez?']], 'São etapas diferentes: **provar, permitir e registrar**.'),
      mc('Qual destes é um dado pessoal sensível pela LGPD?', 'Informação sobre a saúde da pessoa', ['O endereço de e-mail', 'O nome da cidade', 'O apelido no jogo'], 'Saúde, religião, biometria e opinião política são **sensíveis**.')
    ]),
    [`É o segundo checkpoint de Hacker e Cibersegurança: um quiz que junta as lições 11 a 20. Você mostra que entende redes, firewall, criptografia, hash, HTTPS, permissões e proteção de dados.`,
      `Serve para conferir a parte técnica antes de entrar na prática: ler logs, permissões, varreduras e falhas de sistemas.`,
      `Faça as contas com calma, ligue os termos, ordene os padrões e escolha a chave certa para cada situação.`,
      `Nove perguntas numa só tela. Passando, você libera as lições 21 a 30.`]),

  fin('Prova final: defesa na prática',
    'Responda as perguntas finais do curso: terminal, permissões, logs, varredura de portas, falhas de sistemas, resposta a incidentes e ética. Algumas pedem que você escreva com as suas palavras.',
    Q('x', '', '', 'x', [
      num('Qual é o número do chmod para rwxr-xr-- (dono tudo, grupo lê e executa, outros só leem)? Digite os três dígitos.', 754, 'rwx = 7, r-x = 5, r-- = 4: **754**.', { calc: () => 700 + 50 + 4 }),
      mc('Por que dar permissão 777 a um arquivo de senhas é uma péssima ideia?', 'Porque qualquer usuário poderia ler, alterar e executar o arquivo', ['Porque o arquivo fica bem mais pesado para abrir', 'Porque só administradores conseguem ver o número 777', 'Porque o sistema Linux não entende o número 777'], '777 contraria o **menor privilégio**: dá todas as permissões a todos.'),
      num('Quantas tentativas de login FALHARAM nesse registro?', 5, 'As cinco primeiras linhas são falhas do mesmo IP: **5**.', { table: LOG, calc: () => 5 }),
      mc('O padrão do registro (várias falhas em sequência, com root, admin e user) indica:', 'Uma tentativa de força bruta contra o servidor', ['Um backup agendado para rodar de madrugada', 'Uma atualização automática do sistema operacional', 'Um usuário muito distraído com a senha'], 'Falhas rápidas, do mesmo endereço, com **nomes comuns**, são a marca da força bruta.', { table: LOG }),
      mc('Qual serviço da varredura é o mais urgente de desativar?', 'Telnet (porta 23): trafega sem criptografia', ['HTTPS (porta 443)', 'SSH (porta 22)', 'RDP (porta 3389): está fechada, então não há nada a fazer'], 'O **Telnet** expõe senhas e comandos. O SSH é o substituto seguro.', { table: SCAN }),
      mc('Em qual caso é permitido varrer as portas de uma rede?', 'Quando a rede é sua ou há autorização por escrito', ['Quando a empresa é grande e muito conhecida', 'Quando a varredura é feita bem devagar, sem chamar atenção', 'Sempre, porque varrer portas não é considerado invasão'], 'A **autorização** é o que torna o teste legal.'),
      mc('Qual defesa protege contra injeção de SQL?', 'Consultas parametrizadas, que separam os dados do comando', ['Esconder o formulário do site dos visitantes', 'Escrever os comandos do banco em letras maiúsculas', 'Aumentar o tamanho da senha do banco de dados'], 'A **consulta parametrizada** nunca deixa o texto do usuário virar comando.'),
      order('Coloque as etapas da resposta a incidentes na ordem:', ['Preparação', 'Identificação', 'Contenção', 'Erradicação', 'Recuperação', 'Lições aprendidas'], 'Um plano antes, depois conter, remover a causa, restaurar e aprender.'),
      write('Explique, com as suas palavras, por que o princípio do menor privilégio ajuda a segurança.', ['!qual a ideia :: so o necess|menos|minim|apenas|limit|precis|restrit', '!por que ajuda :: estrago|dano|invad|erro|vaz|risco|prejuiz|compromet|proteg|menor'], 'Cada pessoa tem só o acesso de que precisa, então se uma conta for invadida ou errar, o estrago é menor', 'Menos permissão significa **menos estrago** quando algo dá errado.'),
      write('Descreva o que você faria ao descobrir, sem ter autorização, uma falha no site de uma empresa.', ['!o que fazer :: avis|comunic|reporta|contat|inform', '!como :: respons|oficial|canal|sem explor|discret|nao divulg|nao public|sem public|nao usar|nao explor'], 'Eu avisaria a empresa pelo canal oficial, sem explorar a falha e sem divulgá-la antes da correção', 'A **divulgação responsável** avisa a empresa sem explorar a falha nem expô-la ao público.')
    ]),
    [`É a prova final do curso Básico de Hacker e Cibersegurança: um quiz que junta as lições 21 a 30. Você mostra que sabe aplicar o que aprendeu: permissões, logs, varreduras, falhas comuns, resposta a incidentes e ética.`,
      `Serve para fechar o nível Básico e provar que você sabe agir com cuidado e dentro da lei, a base para os próximos passos na área.`,
      `Faça as contas, leia os registros e a varredura com atenção, ordene as etapas do incidente e escreva as duas respostas com as suas palavras.`,
      `Dez perguntas numa só tela. Passando, você conclui o nível Básico.`])
];
