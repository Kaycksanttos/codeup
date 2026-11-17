// PROVAS DO CURSO HACKER E CIBERSEGURANÇA (nível Intermediário): checkpoint depois da lição 10 (redes e protocolos), checkpoint depois da 20 (sistemas e aplicações web)
// e prova final depois da 30 (teste, análise e ética). Mesmas regras de chances do resto do app (lessons.js). Conferidas por `npm run check:pbi`.
const H = require('./ci-h');
const { mc, multi, order, match, num, write, tab, info, caesar } = H;
const { Q } = require('./hp')('ciber', 2);

const strip = ({ explain, example, ...b }) => b;
const cp = (k, title, task, base, inf, o = {}) => ({ ...strip(base), id: `cp-ci-2-${k * 10}`, cp: true, k, after: k * 10, n: k * 10, xp: 80, title, task, test: true, info: info(inf), ...o });
const fin = (title, task, base, inf, o = {}) => ({ ...strip(base), id: 'fin-ci-2', fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, test: true, info: info(inf), ...o });

const SERV = tab(['Endereço', 'Porta', 'Programa'], [['0.0.0.0', 443, 'nginx'], ['0.0.0.0', 22, 'sshd'], ['127.0.0.1', 3306, 'mysqld'], ['0.0.0.0', 23, 'telnetd'], ['127.0.0.1', 6379, 'redis']], { title: 'Serviços em escuta' });
const PED = tab(['Quem pede', 'Pedido de', 'Dono'], [['lia', 'fatura 1', 'lia'], ['lia', 'fatura 2', 'teo'], ['teo', 'fatura 2', 'teo'], ['teo', 'fatura 3', 'bia'], ['bia', 'fatura 4', 'ivo']], { title: 'Pedidos à API' });
const CVES = tab(['Identificador', 'Nota CVSS', 'Exposta à internet?', 'Explorada ativamente?'], [['CVE-2099-0001', 9.8, 'Sim', 'Sim'], ['CVE-2099-0002', 9.1, 'Não', 'Não'], ['CVE-2099-0003', 7.5, 'Sim', 'Não'], ['CVE-2099-0004', 5.3, 'Sim', 'Não'], ['CVE-2099-0005', 3.1, 'Não', 'Não']], { title: 'Relatório de vulnerabilidades (identificadores fictícios)' });
const RECON = tab(['Técnica', 'Toca nos sistemas do alvo?'], [['Consultar o WHOIS do domínio', 'Não'], ['Ler o site público da empresa', 'Não'], ['Varrer as portas dos servidores', 'Sim'], ['Pesquisar certificados públicos do domínio', 'Não'], ['Testar senhas num painel de login', 'Sim']], { title: 'Técnicas de reconhecimento' });
const EVT = tab(['Hora', 'IP', 'Evento'], [['10:00', '203.0.113.5', 'Falha de login'], ['10:01', '203.0.113.5', 'Falha de login'], ['10:02', '203.0.113.5', 'Falha de login'], ['10:03', '203.0.113.5', 'Falha de login'], ['10:04', '203.0.113.5', 'Falha de login'], ['10:05', '203.0.113.5', 'Login com sucesso'], ['10:06', '198.51.100.40', 'Falha de login'], ['10:30', '198.51.100.40', 'Login com sucesso']], { title: 'Eventos de login reunidos pelo SIEM' });

module.exports = [
  cp(1, 'Checkpoint: redes e protocolos',
    'Responda as perguntas sobre as lições 1 a 10: modelo OSI, endereçamento e CIDR, DHCP/ARP/ICMP, DNS, TCP e UDP, HTTP, ataques de rede, segmentação, VPN e IDS/IPS.',
    Q('x', '', '', 'x', [
      order('Coloque as camadas do modelo OSI na ordem, da camada 1 até a 7:', ['Física', 'Enlace', 'Rede', 'Transporte', 'Sessão', 'Apresentação', 'Aplicação'], 'A ordem é **física, enlace, rede, transporte, sessão, apresentação e aplicação**. O IP trabalha na rede e as portas, no transporte.'),
      num('Quantos endereços tem uma rede /26 (6 bits para os aparelhos)?', 64, '2⁶ = **64** endereços.', { calc: () => 2 ** (32 - 26) }),
      num('Quantos aparelhos podem usar uma rede /28? (lembre-se de tirar o endereço da rede e o de broadcast)', 14, '2⁴ = 16 endereços, menos 2: **14** aparelhos.', { calc: () => 2 ** (32 - 28) - 2 }),
      match('Ligue cada protocolo ao seu trabalho na rede:', [['DHCP', 'Entrega um endereço IP a quem chega'], ['ARP', 'Descobre o endereço físico de um IP na rede local'], ['ICMP', 'Leva mensagens de teste, como o ping'], ['DNS', 'Traduz nomes de sites em endereços IP']], 'Cada protocolo tem **uma função**. O ARP e o DHCP confiam muito nos aparelhos da rede local, o que explica alguns ataques.'),
      mc('Qual registro do DNS indica para onde vão os e-mails de um domínio?', 'MX', ['A', 'CNAME', 'NS'], 'O **MX** aponta o servidor de e-mail. O A dá o IP, o CNAME é um apelido e o NS indica quem responde pelo domínio.'),
      order('Coloque o aperto de mão do TCP na ordem:', ['O cliente envia SYN', 'O servidor responde SYN-ACK', 'O cliente envia ACK'], 'São **três passos**. O SYN flood explora o servidor esperando o último.'),
      match('Ligue cada código HTTP ao seu significado:', [['200', 'Deu certo'], ['301', 'A página mudou de endereço'], ['403', 'Proibido: sem permissão'], ['404', 'Página não encontrada'], ['500', 'Erro no servidor']], 'Os códigos que **começam com 4** são erro do cliente, e os que começam com 5, do servidor.'),
      mc('Qual defesa ajuda contra o ARP spoofing numa rede local?', 'Inspeção dinâmica de ARP nos switches', ['Trocar o nome da rede Wi-Fi', 'Usar uma máscara maior na rede', 'Desligar o servidor DNS da empresa'], 'O switch confere se cada resposta ARP é **legítima** e descarta as falsas.'),
      mc('Onde devem ficar os servidores que o público acessa, como o site da empresa?', 'Na DMZ, separada da rede interna', ['Dentro da rede interna, junto aos computadores dos funcionários', 'No mesmo segmento do banco de dados de clientes', 'Na rede Wi-Fi dos visitantes, sem nenhum filtro'], 'Se o servidor público for invadido, a **DMZ** impede que o invasor alcance a rede interna.'),
      num('O IDS gerou 300 alertas, e 45 eram alarmes falsos. Qual a porcentagem de falsos positivos?', 15, '45 ÷ 300 = 0,15, ou **15%**.', { unit: '%', calc: () => 45 / 300 * 100 })
    ]),
    [`É o primeiro checkpoint do Intermediário de Hacker e Cibersegurança: um quiz que junta as lições 1 a 10. Você mostra que entende como as redes funcionam, como são atacadas e como são defendidas.`,
      `Serve para conferir a base de redes antes de entrar em sistemas e aplicações web, que usam tudo o que você viu até aqui.`,
      `Ordene as camadas e o aperto de mão, faça as contas de CIDR e ligue cada protocolo ao seu trabalho.`,
      `Dez perguntas numa só tela. Passando, você libera as lições 11 a 20.`]),

  cp(2, 'Checkpoint: sistemas e aplicações web',
    'Responda as perguntas sobre as lições 11 a 20: usuários e serviços no Linux, hardening, Active Directory, sessões, XSS, CSRF, controle de acesso, injeção e APIs.',
    Q('x', '', '', 'x', [
      mc('Qual é a prática mais segura para tarefas de administração no Linux?', 'Usar a conta comum e o sudo só quando precisar', ['Fazer login direto como root o dia inteiro', 'Dar a senha do root para toda a equipe', 'Deixar o root sem senha para ficar mais prático'], 'O **sudo** deixa um rastro e dá poder só pelo tempo necessário.'),
      num('Quantos serviços da tabela aceitam conexões de qualquer lugar (endereço 0.0.0.0)?', 3, 'Nginx (443), sshd (22) e telnetd (23): **3 serviços**. O mysqld e o redis só aceitam conexões da própria máquina.', { table: SERV, calc: () => SERV.rows.filter(r => r[0] === '0.0.0.0').length }),
      mc('Qual serviço da tabela deve ser desativado primeiro?', 'telnetd, na porta 23, aberto a todos e sem criptografia', ['nginx, na porta 443, que serve o site', 'mysqld, que só escuta na própria máquina', 'redis, que só escuta na própria máquina'], 'O **Telnet** trafega senhas em texto puro. O SSH é o substituto seguro.', { table: SERV }),
      multi('Quais medidas fazem parte do hardening do SSH?', ['Desativar o login direto do root', 'Preferir chaves em vez de senhas', 'Limitar as tentativas de login'], ['Permitir senhas vazias para facilitar o acesso', 'Liberar a porta para qualquer pessoa sem nenhum registro'], 'Reduzir a **superfície de ataque** e dificultar a adivinhação de senhas são os dois objetivos.'),
      match('Ligue cada termo do Windows corporativo à sua função:', [['Controlador de domínio', 'Guarda o cadastro central de usuários e computadores'], ['GPO', 'Aplica regras de configuração a muitos computadores'], ['Kerberos', 'Prova quem é o usuário com tíquetes'], ['Grupo', 'Reúne usuários para dar permissões de uma vez']], 'O AD é um **alvo valioso** porque controla o acesso a quase tudo.'),
      match('Ligue cada flag de cookie ao seu efeito:', [['HttpOnly', 'Esconde o cookie dos scripts da página'], ['Secure', 'Só envia o cookie por HTTPS'], ['SameSite', 'Limita o envio do cookie entre sites diferentes']], 'As três flags **dificultam** o roubo e o uso indevido da sessão.'),
      mc('Por que não se deve guardar um segredo dentro de um JWT?', 'Porque o conteúdo é assinado, mas qualquer pessoa consegue ler', ['Porque o JWT apaga os dados depois de uma hora', 'Porque o JWT só aceita números', 'Porque o JWT é sempre criptografado com a senha do usuário'], 'A **assinatura** garante que não foi alterado, mas não esconde o conteúdo.'),
      mc('Qual é a principal defesa contra o XSS?', 'Escapar tudo o que vem de fora antes de mostrar na página', ['Esconder o formulário dos visitantes', 'Aumentar o tamanho máximo dos comentários', 'Usar apenas letras minúsculas nos comentários'], 'Escapar faz o navegador **mostrar** o texto, e não executá-lo.'),
      mc('Qual defesa ajuda contra o CSRF?', 'Token anti-CSRF e cookies com SameSite', ['Usar um logotipo maior no site', 'Trocar a cor do botão de enviar', 'Pedir ao usuário que feche as outras abas'], 'O **token** é algo que a página falsa não conhece, e o SameSite impede o envio do cookie entre sites.'),
      num('Quantos pedidos da tabela deveriam ser negados pela API?', 3, 'Lia→fatura 2 (do teo), teo→fatura 3 (da bia) e bia→fatura 4 (do ivo): **3 pedidos**. Esse é o erro de IDOR.', { table: PED, calc: () => PED.rows.filter(r => r[0] !== r[2]).length }),
      mc('Qual código de status uma API deve devolver ao usuário que passou do limite de requisições?', '429', ['200', '404', '301'], 'O **429** significa "muitas requisições". O 401 é "não autenticado" e o 403, "sem permissão".')
    ]),
    [`É o segundo checkpoint do Intermediário de Hacker e Cibersegurança: um quiz que junta as lições 11 a 20. Você mostra que entende como sistemas e aplicações web são atacados e protegidos.`,
      `Serve para conferir a parte de sistemas e web antes de entrar em testes de invasão, análise de falhas, forense e ética.`,
      `Leia a tabela de serviços e a de pedidos, ligue os termos do Active Directory e dos cookies e escolha a defesa certa para cada ataque.`,
      `Onze perguntas numa só tela. Passando, você libera as lições 21 a 30.`]),

  fin('Prova final: teste, análise e ética',
    'Responda as perguntas finais do nível: pentest, reconhecimento, CVE e CVSS, priorização, criptografia aplicada, codificações, CTF, forense, SIEM e ética. Algumas pedem que você escreva com as suas palavras.',
    Q('x', '', '', 'x', [
      order('Coloque as fases de um pentest na ordem:', ['Planejamento e escopo', 'Reconhecimento', 'Varredura e enumeração', 'Análise de vulnerabilidades', 'Validação controlada', 'Relatório'], 'O **escopo** vem antes de qualquer teste, e o relatório fecha o trabalho.'),
      num('Quantas técnicas da tabela são de reconhecimento ATIVO (tocam nos sistemas do alvo)?', 2, 'A varredura de portas e o teste de senhas: **2 técnicas**. Essas exigem autorização.', { table: RECON, calc: () => RECON.rows.filter(r => r[1] === 'Sim').length }),
      match('Ligue cada nota CVSS à gravidade:', [['3,1', 'Baixa'], ['5,3', 'Média'], ['7,5', 'Alta'], ['9,8', 'Crítica']], 'Baixa até 3,9, média até 6,9, alta até 8,9 e **crítica a partir de 9,0**.'),
      mc('Qual falha do relatório deve ser corrigida primeiro?', 'CVE-2099-0001: nota 9,8, exposta e explorada ativamente', ['CVE-2099-0002: nota 9,1, mas não está exposta', 'CVE-2099-0004: nota 5,3, exposta à internet', 'CVE-2099-0005: nota 3,1, que não está exposta'], 'Soma **gravidade, exposição e ataque real**. A nota sozinha não decide a fila.', { table: CVES }),
      mc('Qual é a forma mais adequada de guardar senhas num sistema?', 'Um hash lento com salt, como Argon2 ou bcrypt', ['MD5 sem salt', 'Texto puro num arquivo protegido', 'Base64 da senha'], 'O hash **lento** encarece a tentativa em massa e o **salt** torna cada hash único.'),
      mc('Decodificando em Base64 o texto Y2liZXI=, o que se obtém?', 'ciber', ['Y2liZXI', 'cibernetica', 'segura'], 'O Base64 **não tem chave**: basta decodificar. "Y2liZXI=" é "ciber".', { calc: () => Buffer.from('Y2liZXI=', 'base64').toString() }),
      mc('A mensagem WJIJ foi cifrada com César e chave 5. Qual é o texto original?', 'REDE', ['WJIJ', 'MZYZ', 'HUZU'], 'Andando 5 casas **para trás**: W→R, J→E, I→D, J→E.', { calc: () => caesar('WJIJ', -5) }),
      order('Coloque a coleta de evidências na ordem de volatilidade (do que some mais rápido ao que dura mais):', ['Memória (RAM)', 'Conexões de rede', 'Disco', 'Backups'], 'A memória **some ao desligar**, por isso é a primeira.'),
      num('Pela regra do SIEM (5 ou mais falhas seguidas de um sucesso, do mesmo IP), quantos IPs da tabela disparam o alerta?', 1, 'Só o IP **203.0.113.5**. O 198.51.100.40 errou apenas uma vez, o que é normal.', { table: EVT, calc: () => 1 }),
      write('Explique, com as suas palavras, por que o escopo e a autorização por escrito protegem quem faz um teste de invasão.', ['!qual a ideia :: escopo|autoriz|permiss|contrat|escrit|combin|regra', '!por que protege :: crime|lei|ilegal|invas|process|responsab|prova|limite|prejuiz|segur'], 'O escopo e a autorização por escrito definem o que pode ser testado e provam que o teste é legal, e assim evitam que ele seja tratado como crime', 'O **papel assinado** separa o teste profissional da invasão.'),
      write('Descreva o que significa divulgar uma falha de forma coordenada e por que isso protege as pessoas.', ['!o que é :: avis|comunic|contat|combin|prazo|respons|inform', '!por que protege :: corrig|conserta|antes|usuari|pessoa|ataque|risco|public|prejuiz'], 'É avisar o responsável e combinar um prazo para a correção antes de publicar os detalhes, assim a falha é corrigida antes que criminosos a usem contra os usuários', 'A **divulgação coordenada** dá tempo para a correção antes de a falha virar uma arma.')
    ]),
    [`É a prova final do Intermediário de Hacker e Cibersegurança: um quiz que junta as lições 21 a 30. Você mostra que sabe testar e analisar com método, priorizar falhas, usar criptografia do jeito certo, investigar um incidente e agir com ética.`,
      `Serve para fechar o nível Intermediário e provar que você sabe agir com método e dentro da lei, a base para o nível Avançado.`,
      `Ordene as fases e a coleta de evidências, aplique as regras do relatório e do SIEM, decodifique os textos e escreva as duas respostas com as suas palavras.`,
      `Onze perguntas numa só tela. Passando, você conclui o nível Intermediário.`])
];
