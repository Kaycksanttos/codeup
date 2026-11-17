// PROJETOS DE HACKER E CIBERSEGURANÇA (nível Intermediário): um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// Cada projeto é um estudo de caso em forma de quiz (várias perguntas numa tela, sobre a mesma situação). Conferidos por `npm run check:pbi`.
const H = require('./ci-h');
const { mc, multi, order, match, num, write, tab, caesar } = H;
const { Q } = require('./hp')('ciber', 2);
const { base } = require('./pj');

let k = 0;
// pjQ(título, tarefa, [perguntas], [o que é, para que serve, como se faz, retorno esperado], [3 dicas])
const pjQ = (title, task, quiz, info, hints) => {
  k++;
  const q = Q('x', '', '', task, quiz, {});
  return { ...base('ciber', 2, k, title, task, info, hints), type: 'quiz', quiz: q.quiz, need: [], solution: '', exLang: 'text' };
};

const SUB = tab(['Setor', 'Rede', 'Aparelhos previstos'], [['Recepção', '10.0.1.0/26', 40], ['Consultórios', '10.0.2.0/27', 25], ['Laboratório', '10.0.3.0/28', 20], ['Visitantes', '10.0.4.0/24', 150]], { title: 'Sub-redes da clínica' });
const LOGH = tab(['Hora', 'IP', 'Pedido', 'Status'], [['14:00', '198.51.100.4', 'GET /inicio', 200], ['14:01', '203.0.113.9', 'POST /entrar', 401], ['14:01', '203.0.113.9', 'POST /entrar', 401], ['14:01', '203.0.113.9', 'POST /entrar', 401], ['14:02', '203.0.113.9', 'POST /entrar', 401], ['14:02', '203.0.113.9', 'POST /entrar', 200], ['14:05', '198.51.100.4', 'GET /exames', 200]], { title: 'Registro do servidor web da clínica' });
const USERS = tab(['Usuário', 'UID', 'Shell', 'Usa sudo?'], [['root', 0, '/bin/bash', 'Sim'], ['marta', 1002, '/bin/bash', 'Sim'], ['joao', 1003, '/bin/bash', 'Não'], ['mysql', 105, '/usr/sbin/nologin', 'Não'], ['www-data', 33, '/usr/sbin/nologin', 'Não']], { title: 'Usuários do servidor' });
const SERV = tab(['Endereço', 'Porta', 'Programa'], [['0.0.0.0', 443, 'nginx'], ['0.0.0.0', 22, 'sshd'], ['127.0.0.1', 3306, 'mysqld'], ['0.0.0.0', 23, 'telnetd'], ['127.0.0.1', 6379, 'redis']], { title: 'Serviços em escuta no servidor' });
const PED = tab(['Quem pede', 'Pedido', 'Dono do pedido'], [['lia', 'pedido 101', 'lia'], ['lia', 'pedido 102', 'teo'], ['teo', 'pedido 102', 'teo'], ['teo', 'pedido 103', 'bia'], ['bia', 'pedido 103', 'bia'], ['bia', 'pedido 104', 'ivo']], { title: 'Pedidos feitos à loja' });
const CVES = tab(['Identificador', 'Nota CVSS', 'Exposta à internet?', 'Explorada ativamente?'], [['CVE-2099-0001', 9.8, 'Sim', 'Sim'], ['CVE-2099-0002', 9.1, 'Não', 'Não'], ['CVE-2099-0003', 7.5, 'Sim', 'Não'], ['CVE-2099-0004', 5.3, 'Sim', 'Não'], ['CVE-2099-0005', 3.1, 'Não', 'Não']], { title: 'Relatório do pentest (identificadores fictícios)' });
const ACC = tab(['IP', 'Pedido', 'Status'], [['198.51.100.7', 'GET /inicio', 200], ['203.0.113.50', 'GET /admin', 404], ['203.0.113.50', 'GET /login.php', 404], ['203.0.113.50', 'GET /backup.zip', 404], ['198.51.100.9', 'GET /produtos', 200], ['203.0.113.50', 'GET /painel', 404], ['203.0.113.50', 'GET /config.bak', 404], ['198.51.100.7', 'GET /contato', 200]], { title: 'Registro de acessos do servidor web' });
const EVT = tab(['Hora', 'IP', 'Evento'], [['10:00', '203.0.113.5', 'Falha de login'], ['10:01', '203.0.113.5', 'Falha de login'], ['10:02', '203.0.113.5', 'Falha de login'], ['10:03', '203.0.113.5', 'Falha de login'], ['10:04', '203.0.113.5', 'Falha de login'], ['10:05', '203.0.113.5', 'Login com sucesso'], ['10:06', '198.51.100.40', 'Falha de login'], ['10:30', '198.51.100.40', 'Login com sucesso']], { title: 'Eventos de login reunidos pelo SIEM' });

module.exports = [
  pjQ('a rede da clínica',
    'A Clínica Vida Nova está montando a rede. Ajude a equipe de TI a dividir os endereços em setores, entender como os aparelhos recebem IP e escolher o protocolo certo.',
    [
      num('Quantos endereços tem a rede da Recepção (10.0.1.0/26)?', 64, '2⁶ = **64** endereços (62 usáveis).', { table: SUB, calc: () => 2 ** (32 - 26) }),
      num('Quantos aparelhos cabem na rede do Laboratório (/28)? Tire o endereço da rede e o de broadcast.', 14, '2⁴ = 16 endereços, menos 2: **14** aparelhos.', { table: SUB, calc: () => 2 ** (32 - 28) - 2 }),
      mc('Qual setor NÃO comporta os aparelhos previstos?', 'Laboratório: só cabem 14 e estão previstos 20', ['Recepção: cabem 62 e estão previstos 40', 'Consultórios: cabem 30 e estão previstos 25', 'Visitantes: cabem 254 e estão previstos 150'], 'Compare os **aparelhos usáveis** (2 elevado a n, menos 2) com os previstos.', { table: SUB }),
      order('Coloque as etapas do DHCP na ordem:', ['Discover: o aparelho procura um servidor', 'Offer: o servidor oferece um IP', 'Request: o aparelho pede o IP oferecido', 'Acknowledge: o servidor confirma'], 'Lembre-se do nome **DORA**: Discover, Offer, Request, Acknowledge.'),
      match('Ligue cada protocolo ao seu trabalho:', [['ARP', 'Descobre o endereço físico de um IP na rede local'], ['DHCP', 'Entrega um endereço IP a quem chega'], ['ICMP', 'Leva mensagens de teste, como o ping'], ['DNS', 'Traduz nomes em endereços IP']], 'Cada um resolve **uma pergunta** diferente da rede.'),
      mc('Para a telemedicina, com voz e vídeo ao vivo, qual protocolo de transporte costuma ser o mais indicado?', 'UDP: é rápido e tolera pequenas perdas', ['TCP, porque reenvia tudo e nunca atrasa a imagem', 'ICMP, porque foi feito para transmitir vídeo', 'ARP, porque conhece o endereço físico de todos'], 'Num vídeo ao vivo, uma **pequena falha** é melhor do que esperar o reenvio e travar.'),
      mc('Em qual camada do modelo OSI trabalha um firewall que filtra por porta?', 'Camada 4 (transporte)', ['Camada 1 (física)', 'Camada 2 (enlace)', 'Camada 7 (aplicação)'], 'As **portas** pertencem à camada de transporte, com o TCP e o UDP.')
    ],
    [`O primeiro projeto do Intermediário de Hacker e Cibersegurança: a rede da clínica. Ele junta as lições 1 a 5: modelo OSI, endereçamento e CIDR, DHCP, ARP e ICMP, DNS e TCP e UDP.`,
      `Quem protege uma rede precisa saber como ela é montada. Dividir a rede em setores do tamanho certo é o primeiro passo para organizá-la e isolá-la.`,
      `Calcule os endereços com potências de 2, compare com os aparelhos previstos na tabela, ordene o DHCP e escolha o protocolo certo para cada uso.`,
      `Sete perguntas numa só tela (números, escolher, ordenar e ligar). Acertando tudo, o projeto está concluído.`],
    ['Endereços = 2 elevado a (32 menos o número depois da barra). Usáveis = endereços menos 2.',
      'DHCP: Discover, Offer, Request, Acknowledge. Voz e vídeo ao vivo preferem o UDP.',
      'Portas e filtros de porta ficam na camada de transporte (camada 4).']),

  pjQ('o tráfego suspeito',
    'O servidor web da clínica recebeu pedidos estranhos. Leia o registro, identifique o que aconteceu e escolha as defesas de rede mais adequadas.',
    [
      num('Quantos pedidos de login FALHARAM (401) no registro?', 4, 'As quatro linhas com 401 vieram do IP 203.0.113.9: **4 falhas**.', { table: LOGH, calc: () => LOGH.rows.filter(r => r[3] === 401).length }),
      mc('O que o padrão das 14:01 e 14:02 sugere?', 'Várias tentativas de senha seguidas, e a última deu certo: pode ser força bruta', ['Um cliente comum navegando na página inicial', 'Uma atualização automática do servidor web', 'Um erro de digitação sem nenhuma importância'], '**Quatro falhas seguidas** e um acerto, do mesmo IP, em dois minutos, é um sinal clássico.', { table: LOGH }),
      match('Ligue cada código HTTP ao seu significado:', [['200', 'Deu certo'], ['301', 'A página mudou de endereço'], ['403', 'Proibido: sem permissão'], ['404', 'Página não encontrada'], ['500', 'Erro no servidor']], 'Os 4xx são erros do **cliente** e os 5xx, do **servidor**.'),
      match('Ligue cada ataque de rede à defesa mais adequada:', [['Escuta do tráfego (sniffing)', 'Criptografar com HTTPS'], ['ARP spoofing', 'Inspeção dinâmica de ARP no switch'], ['DDoS', 'Filtros e serviços que absorvem o excesso de tráfego'], ['Man-in-the-middle', 'Certificados válidos e HSTS']], 'A defesa **muda** conforme o ataque. Nenhuma sozinha cobre tudo.'),
      mc('Onde deve ficar o servidor web que atende o público?', 'Na DMZ, separado da rede interna', ['Na rede interna, junto aos prontuários dos pacientes', 'No mesmo segmento das impressoras', 'Na rede Wi-Fi dos pacientes, sem filtros'], 'A **DMZ** limita o que o invasor alcança se o servidor for comprometido.'),
      mc('Qual é o limite de uma VPN para um funcionário que trabalha de casa?', 'Ela protege o caminho, mas não protege contra um aparelho já infectado', ['Ela deixa o funcionário totalmente invisível', 'Ela impede qualquer tipo de golpe por e-mail', 'Ela substitui a necessidade de antivírus e atualizações'], 'A VPN **criptografa o túnel**. O aparelho continua precisando de proteção.'),
      num('O IDS gerou 300 alertas, e 45 eram alarmes falsos. Qual a porcentagem de falsos positivos?', 15, '45 ÷ 300 = 0,15, ou **15%**.', { unit: '%', calc: () => 45 / 300 * 100 })
    ],
    [`O segundo projeto do Intermediário de Hacker e Cibersegurança: o tráfego suspeito. Ele junta as lições 6 a 10: HTTP e seus códigos, ataques de rede e defesas, segmentação e DMZ, VPN e proxy e IDS e IPS.`,
      `Ler o que o servidor registra é o primeiro passo para perceber um ataque. Conhecer o ataque e a defesa certa evita medidas inúteis.`,
      `Conte os códigos 401 no registro, ligue os códigos HTTP e cada ataque à sua defesa e decida onde o servidor público deve ficar.`,
      `Sete perguntas numa só tela (número, escolher e ligar). Acertando tudo, o projeto está concluído.`],
    ['Vários 401 seguidos e depois um 200 do mesmo IP são um sinal forte de tentativa de adivinhar a senha.',
      'Escuta pede HTTPS, ARP spoofing pede inspeção de ARP, DDoS pede filtros e absorção do excesso.',
      'Servidor público na DMZ. Falsos positivos = alarmes falsos ÷ total de alertas.']),

  pjQ('os servidores e as contas',
    'A equipe de TI vai revisar um servidor Linux e o ambiente Windows da clínica. Analise os usuários, os serviços em escuta e as boas práticas de configuração.',
    [
      num('Quantas contas da tabela podem fazer login interativo (têm um shell de verdade)?', 3, 'Root, marta e joao usam /bin/bash: **3 contas**. As contas de serviço usam nologin.', { table: USERS, calc: () => USERS.rows.filter(r => !r[2].includes('nologin')).length }),
      mc('Por que contas como mysql e www-data usam o shell nologin?', 'Porque são contas de serviço e ninguém precisa entrar por elas', ['Porque o Linux não permite mais de três contas com login', 'Porque o nologin deixa o serviço mais rápido', 'Porque assim a senha do root fica protegida pelo mysql'], 'Contas de serviço sem login **reduzem o risco** se alguma delas for invadida.', { table: USERS }),
      num('Quantos serviços aceitam conexões de qualquer lugar (endereço 0.0.0.0)?', 3, 'Nginx, sshd e telnetd: **3 serviços**. O mysqld e o redis só aceitam a própria máquina.', { table: SERV, calc: () => SERV.rows.filter(r => r[0] === '0.0.0.0').length }),
      mc('Qual serviço deve ser desativado primeiro?', 'telnetd, porque trafega tudo sem criptografia e está aberto a todos', ['nginx, porque é o site da clínica', 'mysqld, que só escuta na própria máquina', 'redis, que só escuta na própria máquina'], 'O **SSH** substitui o Telnet com criptografia.', { table: SERV }),
      multi('Quais medidas fazem parte do hardening do SSH?', ['Desativar o login direto do root', 'Usar chaves no lugar de senhas', 'Limitar as tentativas de login'], ['Permitir senhas vazias para facilitar', 'Deixar a senha padrão do sistema'], 'Cada medida **fecha uma brecha** comum.'),
      match('Ligue cada termo do Active Directory à sua função:', [['Controlador de domínio', 'Guarda o cadastro central de usuários e computadores'], ['GPO', 'Aplica regras de configuração a muitos computadores'], ['Kerberos', 'Prova quem é o usuário com tíquetes'], ['Grupo', 'Reúne usuários para dar permissões de uma vez']], 'Dar permissão a **grupos** é mais seguro e organizado do que dar a cada pessoa.'),
      mc('Qual conjunto de flags deixa o cookie de sessão mais protegido?', 'HttpOnly, Secure e SameSite', ['Apenas o nome do cookie em letras maiúsculas', 'Um tempo de vida de vários anos', 'Nenhuma flag, para o cookie funcionar em todo lugar'], 'As flags escondem o cookie dos scripts, exigem **HTTPS** e limitam o envio entre sites.')
    ],
    [`O terceiro projeto do Intermediário de Hacker e Cibersegurança: os servidores e as contas. Ele junta as lições 11 a 15: usuários e permissões, serviços em escuta, hardening do SSH, Active Directory e sessões e cookies.`,
      `Um servidor mal configurado é uma porta aberta. Rever contas e serviços é uma das rotinas mais importantes de quem cuida de sistemas.`,
      `Conte as contas com login e os serviços abertos a todos nas tabelas, escolha o serviço a desativar e ligue os termos do AD.`,
      `Sete perguntas numa só tela (número, escolher, marcar e ligar). Acertando tudo, o projeto está concluído.`],
    ['Contas de serviço usam nologin. Conte só as que têm um shell de verdade.',
      '0.0.0.0 aceita conexões de qualquer lugar, e 127.0.0.1 só da própria máquina.',
      'Hardening: sem login root, com chaves e com limite de tentativas. Cookie: HttpOnly, Secure e SameSite.']),

  pjQ('a loja virtual',
    'A loja Rota Azul lançou o site e o aplicativo de pedidos. Procure falhas comuns de aplicações web e escolha as defesas certas para cada uma.',
    [
      num('Quantos pedidos da tabela deveriam ser NEGADOS pela loja?', 3, 'Lia→pedido 102 (do teo), teo→pedido 103 (da bia) e bia→pedido 104 (do ivo): **3 pedidos**.', { table: PED, calc: () => PED.rows.filter(r => r[0] !== r[2]).length }),
      mc('Qual é o nome da falha em que mudar um número no pedido abre o dado de outra pessoa?', 'IDOR, um tipo de controle de acesso quebrado', ['XSS, que roda scripts no navegador', 'DDoS, que derruba o servidor com excesso de acessos', 'ARP spoofing, que engana a rede local'], 'O servidor precisa **conferir o dono** do pedido a cada requisição.', { table: PED }),
      mc('Um cliente escreve <b>ótimo</b> num comentário, e o site mostra a palavra em negrito. Qual é o problema e a defesa?', 'O site não escapou a saída: a defesa é escapar tudo o que vem de fora', ['O site funcionou certo e não há nenhum problema', 'O problema é o tamanho do comentário, e a defesa é limitar as letras', 'O problema é a cor do texto, e a defesa é trocar a fonte'], 'Se o HTML do cliente é **interpretado**, também seria um script. É o XSS.'),
      order('Coloque o caminho de um ataque CSRF na ordem:', ['O usuário está logado no site da loja', 'Ele abre uma página maliciosa', 'A página dispara um pedido ao site da loja', 'O navegador envia o cookie junto', 'O site da loja executa a ação'], 'O navegador **envia o cookie sozinho**, e é isso que o CSRF explora. O token anti-CSRF e o SameSite protegem.'),
      mc('Qual é o problema deste trecho de código?', 'Junta o texto digitado ao comando do banco, o que permite injeção de SQL', ['Usa aspas simples, que o banco não aceita', 'Escreve SELECT em maiúsculas, o que é proibido pelas regras de qualquer banco de dados', 'Não tem o comando WHERE, que é obrigatório'], 'O certo é usar **parâmetros**, e não juntar texto ao comando.', { code: 'consulta = "SELECT * FROM clientes WHERE nome = \'" + nome + "\'"', lang: 'text' }),
      match('Ligue cada código de status da API ao seu significado:', [['401', 'Não autenticado: falta provar quem é'], ['403', 'Sem permissão para esse recurso'], ['429', 'Muitas requisições em pouco tempo']], 'Cada código **conta uma história** diferente: quem é, o que pode e quanto pode.'),
      mc('Com o OAuth 2.0, o que o aplicativo recebe para acessar os dados do usuário?', 'Um token com escopo limitado, sem a senha do usuário', ['A senha do usuário, guardada para uso futuro', 'Acesso total e permanente a todos os dados', 'Uma cópia do banco de dados do serviço'], 'O token limita **o que** o aplicativo pode fazer e pode ser revogado.')
    ],
    [`O quarto projeto do Intermediário de Hacker e Cibersegurança: a loja virtual. Ele junta as lições 16 a 20: XSS, CSRF, controle de acesso e IDOR, injeção e validação, e APIs e OAuth.`,
      `Quase todo vazamento começa em uma falha comum de aplicação web. Reconhecer a falha e a defesa certa é o coração da segurança de aplicações.`,
      `Compare dono e quem pede na tabela, ordene o caminho do CSRF e leia o código procurando o que permite a injeção.`,
      `Sete perguntas numa só tela (número, escolher, ordenar e ligar). Acertando tudo, o projeto está concluído.`],
    ['IDOR: o servidor não confere se o pedido pertence a quem pede. A defesa é checar o dono.',
      'XSS: escapar a saída. CSRF: token e SameSite. Injeção: consultas parametrizadas.',
      '401 é "não autenticado", 403 é "sem permissão" e 429 é "limite de requisições".']),

  pjQ('o relatório do pentest',
    'A equipe de segurança terminou um teste autorizado na Rota Azul. Organize o trabalho, leia o relatório de vulnerabilidades e decida o que corrigir primeiro.',
    [
      order('Coloque as fases do pentest na ordem:', ['Planejamento e escopo', 'Reconhecimento', 'Varredura e enumeração', 'Análise de vulnerabilidades', 'Validação controlada', 'Relatório'], 'O **escopo** vem primeiro e o relatório, por último.'),
      mc('Qual técnica é de reconhecimento PASSIVO?', 'Pesquisar certificados públicos do domínio', ['Varrer as portas dos servidores da empresa', 'Testar senhas num painel de login', 'Enviar pedidos de teste aos servidores'], 'A consulta a **registros públicos** não toca nos sistemas do alvo.'),
      num('Quantas vulnerabilidades do relatório são CRÍTICAS (nota de 9,0 a 10)?', 2, 'As notas 9,8 e 9,1: **2 vulnerabilidades**.', { table: CVES, calc: () => CVES.rows.filter(r => r[1] >= 9).length }),
      match('Ligue cada nota CVSS à gravidade:', [['3,1', 'Baixa'], ['5,3', 'Média'], ['7,5', 'Alta'], ['9,8', 'Crítica']], 'Baixa até 3,9, média até 6,9, alta até 8,9 e **crítica a partir de 9,0**.'),
      mc('Qual falha deve ser corrigida primeiro?', 'CVE-2099-0001: nota 9,8, exposta e já explorada', ['CVE-2099-0002: nota 9,1, mas interna e sem ataque', 'CVE-2099-0003: nota 7,5, exposta, sem ataque', 'CVE-2099-0005: nota 3,1, interna e sem ataque'], 'Junta **gravidade, exposição e ataque real**.', { table: CVES }),
      mc('Qual é a forma mais adequada de a Rota Azul guardar as senhas dos clientes?', 'Hash lento com salt, como Argon2 ou bcrypt', ['O hash MD5 sem salt', 'A senha em Base64', 'A senha em texto puro, num arquivo protegido'], 'O **salt** faz senhas iguais gerarem hashes diferentes, e o hash lento encarece o teste em massa.'),
      mc('Uma chave de API foi enviada por engano para um repositório público. O que fazer?', 'Revogar a chave, gerar outra e guardar os segredos fora do código', ['Apagar o commit e continuar usando a mesma chave', 'Esperar que ninguém tenha visto o repositório', 'Trocar só o nome da variável no código'], 'Chave exposta é sempre tratada como **comprometida**, mesmo depois de apagada.')
    ],
    [`O quinto projeto do Intermediário de Hacker e Cibersegurança: o relatório do pentest. Ele junta as lições 21 a 25: metodologia de pentest, reconhecimento, CVE e CVSS, priorização das correções e criptografia aplicada.`,
      `O relatório é o produto mais importante de um teste: ele diz o que consertar e em que ordem. Saber ler as notas e o contexto evita corrigir a coisa errada primeiro.`,
      `Ordene as fases, conte as falhas críticas, ligue as notas às gravidades e monte a fila de correção combinando nota, exposição e ataque real.`,
      `Sete perguntas numa só tela (ordenar, número, ligar e escolher). Acertando tudo, o projeto está concluído.`],
    ['Escopo primeiro, relatório por último. O reconhecimento passivo só lê informações públicas.',
      'Crítica a partir de 9,0. A fila de correção combina nota, exposição à internet e exploração real.',
      'Senhas: hash lento com salt. Segredo vazado: revogar e trocar.']),

  pjQ('a investigação do incidente',
    'A Rota Azul foi alvo de uma tentativa de invasão. Leia os registros, decodifique as pistas, preserve as evidências e decida como agir com ética.',
    [
      mc('Uma pista escondida diz Y2liZXI=. Decodificando em Base64, o que aparece?', 'ciber', ['Y2liZXI', 'cibernetica', 'seguro'], 'Base64 **não tem chave**: basta decodificar.', { calc: () => Buffer.from('Y2liZXI=', 'base64').toString() }),
      mc('A pista ALVO foi cifrada com César e chave 4. Qual é o resultado?', 'EPZS', ['ALVO', 'WHRK', 'CHEUD'], 'Cada letra anda 4 casas: A→E, L→P, V→Z, O→S.', { calc: () => caesar('ALVO', 4) }),
      order('Coloque a coleta de evidências na ordem de volatilidade:', ['Memória (RAM)', 'Conexões de rede', 'Disco', 'Backups'], 'O que **some mais rápido** é coletado primeiro.'),
      num('Quantos pedidos do IP 203.0.113.50 deram "não encontrado" (404) no registro de acessos?', 5, 'Foram **5 pedidos** a caminhos que não existem, como /admin e /backup.zip: ele procurava arquivos esquecidos.', { table: ACC, calc: () => ACC.rows.filter(r => r[0] === '203.0.113.50' && r[2] === 404).length }),
      num('Pela regra do SIEM (5 ou mais falhas seguidas de um sucesso, do mesmo IP), quantos IPs disparam o alerta?', 1, 'Só o IP **203.0.113.5**. O 198.51.100.40 errou uma vez só.', { table: EVT, calc: () => 1 }),
      mc('Para que serve a cadeia de custódia?', 'Registrar quem manuseou a evidência e quando, para que ela seja confiável', ['Criptografar todos os arquivos da empresa', 'Acelerar a coleta apagando os logs antigos', 'Dar acesso total a todos os funcionários'], 'Sem esse registro, a evidência pode ser **contestada** e perder o valor.'),
      write('Explique por que uma falha deve ser divulgada de forma coordenada, e não publicada na hora.', ['!qual a ideia :: avis|comunic|contat|combin|prazo|respons|inform', '!por que :: corrig|conserta|antes|usuari|pessoa|ataque|risco|prejuiz|prote'], 'Porque é preciso avisar o responsável e dar um prazo para corrigir antes de publicar, para que criminosos não usem a falha contra os usuários', 'A **divulgação coordenada** dá tempo para a correção antes de a falha virar uma arma.')
    ],
    [`O sexto projeto do Intermediário de Hacker e Cibersegurança: a investigação do incidente. Ele junta as lições 26 a 30: codificações, CTF, forense digital, SIEM e correlação, e ética e leis.`,
      `Investigar um incidente é juntar pistas de vários lugares, preservar as provas e agir dentro da lei. Esse é o trabalho diário de quem atua na defesa.`,
      `Decodifique as pistas, ordene a coleta de evidências, conte as falhas nos registros e escreva a última resposta com as suas palavras.`,
      `Sete perguntas numa só tela (escolher, ordenar, número e escrever). Acertando tudo, o projeto está concluído.`],
    ['Base64 e César são codificações e cifras simples: sem chave forte, qualquer pessoa desfaz.',
      'Coleta por volatilidade: memória, rede, disco e backups. A cadeia de custódia registra quem tocou na prova.',
      'Divulgação coordenada: avisar, dar prazo, e só depois publicar os detalhes.'])
];
