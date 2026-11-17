// PROJETOS DE HACKER E CIBERSEGURANÇA (nível Avançado): um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// Cada projeto é um estudo de caso em forma de quiz (várias perguntas numa tela, sobre a mesma situação). Conferidos por `npm run check:pbi`.
const H = require('./ci-h');
const { mc, multi, order, match, num, write, tab } = H;
const { Q } = require('./hp')('ciber', 3);
const { base } = require('./pj');

let k = 0;
// pjQ(título, tarefa, [perguntas], [o que é, para que serve, como se faz, retorno esperado], [3 dicas])
const pjQ = (title, task, quiz, info, hints) => {
  k++;
  const q = Q('x', '', '', task, quiz, {});
  return { ...base('ciber', 3, k, title, task, info, hints), type: 'quiz', quiz: q.quiz, need: [], solution: '', exLang: 'text' };
};

const FLUXO = tab(['Fluxo de dados', 'Atravessa uma fronteira de confiança?'], [['Navegador → Servidor web', 'Sim'], ['Servidor web → API interna', 'Não'], ['API interna → Banco de dados', 'Sim'], ['API interna → Serviço de pagamento externo', 'Sim'], ['Painel → Log local', 'Não']], { title: 'Diagrama de fluxo de dados da loja' });
const COB = tab(['Tática do ATT&CK', 'Técnicas testadas', 'Técnicas detectadas'], [['Acesso inicial', 10, 7], ['Persistência', 8, 4], ['Acesso a credenciais', 6, 6], ['Exfiltração', 4, 1]], { title: 'Cobertura das regras de detecção' });
const ZT = tab(['Pedido', 'Usuário verificado', 'Aparelho saudável', 'MFA feito'], [[1, 'Sim', 'Sim', 'Sim'], [2, 'Sim', 'Não', 'Sim'], [3, 'Sim', 'Sim', 'Não'], [4, 'Sim', 'Sim', 'Sim'], [5, 'Não', 'Sim', 'Sim']], { title: 'Pedidos de acesso ao sistema financeiro' });
const CONTAS = tab(['Conta', 'Tipo', 'MFA ativo?'], [['marta.adm', 'Administrador', 'Sim'], ['bruno.adm', 'Administrador', 'Não'], ['svc-backup', 'Administrador (serviço)', 'Não'], ['lia', 'Comum', 'Sim'], ['teo', 'Comum', 'Não']], { title: 'Revisão de contas' });
const MAILS = tab(['Mensagem', 'SPF', 'DKIM'], [[1, 'Passou', 'Passou'], [2, 'Falhou', 'Passou'], [3, 'Falhou', 'Falhou'], [4, 'Passou', 'Falhou'], [5, 'Falhou', 'Falhou']], { title: 'Resultado da verificação de cada e-mail' });
const SOC = tab(['Incidente', 'Tempo até detectar (min)', 'Tempo até responder (min)'], [['A', 20, 60], ['B', 40, 90], ['C', 30, 120], ['D', 10, 30]], { title: 'Incidentes do mês' });
const WEV = tab(['Hora', 'ID do evento', 'Conta', 'IP de origem'], [['09:00', 4625, 'adm.ana', '203.0.113.5'], ['09:01', 4625, 'adm.ana', '203.0.113.5'], ['09:02', 4625, 'adm.ana', '203.0.113.5'], ['09:03', 4625, 'adm.ana', '203.0.113.5'], ['09:04', 4624, 'adm.ana', '203.0.113.5'], ['09:05', 4672, 'adm.ana', '203.0.113.5'], ['09:30', 4624, 'lia', '198.51.100.8']], { title: 'Registro de segurança do Windows' });
const SAND = tab(['Comportamento observado na análise', 'Suspeito?'], [['Mostra uma janela com o logotipo de uma empresa', 'Não'], ['Copia a si mesmo para a pasta de inicialização', 'Sim'], ['Tenta apagar as cópias de segurança do sistema', 'Sim'], ['Abre conexão com um endereço desconhecido', 'Sim'], ['Lê muitos documentos pessoais e os reescreve', 'Sim'], ['Consulta a hora do sistema', 'Não']], { title: 'Relatório do sandbox' });
const CAPAC = tab(['Capacidade encontrada no programa "Calculadora"', 'Normal para uma calculadora?'], [['Desenhar janelas e botões', 'Sim'], ['Ler as teclas digitadas em outros programas', 'Não'], ['Enviar dados para um servidor desconhecido', 'Não'], ['Guardar o histórico de contas', 'Sim'], ['Apagar as cópias de segurança do sistema', 'Não']], { title: 'Análise do programa' });
const ART = tab(['Arquivo', 'Criado às'], [['relatorio.docx', '08:50'], ['update.exe', '10:14'], ['tmp1.dat', '10:15'], ['agenda.txt', '09:10'], ['svc.dll', '10:16']], { title: 'Arquivos do disco (o incidente começou às 10:10)' });
const CAP = tab(['Hora', 'Destino', 'Bytes enviados'], [['10:00:00', '198.51.100.77', 312], ['10:01:00', '198.51.100.77', 310], ['10:02:00', '198.51.100.77', 315], ['10:03:00', '198.51.100.77', 311], ['10:04:00', '198.51.100.77', 313], ['10:12:41', '192.0.2.10', 48200]], { title: 'Conexões de saída de um computador' });
const RAN = tab(['Servidor', 'Criptografado?', 'Backup limpo e testado?'], [['SRV-01', 'Sim', 'Sim'], ['SRV-02', 'Sim', 'Não'], ['SRV-03', 'Não', 'Sim'], ['SRV-04', 'Sim', 'Sim'], ['SRV-05', 'Sim', 'Não']], { title: 'Situação dos servidores após o ataque' });
const BUCK = tab(['Armazenamento', 'Acesso público?', 'Tem dados pessoais?'], [['fotos-do-site', 'Sim', 'Não'], ['clientes-backup', 'Sim', 'Sim'], ['relatorios-rh', 'Não', 'Sim'], ['exportacao-pedidos', 'Sim', 'Sim'], ['logos', 'Sim', 'Não']], { title: 'Armazenamentos na nuvem' });
const CONT = tab(['Contêiner', 'Roda como root?', 'Imagem de fonte confiável?', 'Tem segredo dentro da imagem?'], [['web', 'Não', 'Sim', 'Não'], ['api', 'Sim', 'Sim', 'Sim'], ['fila', 'Não', 'Não', 'Não'], ['relatorio', 'Sim', 'Não', 'Não']], { title: 'Revisão de contêineres' });
const SBOM = tab(['Componente', 'Versão', 'Vulnerabilidade conhecida?'], [['biblioteca-datas', '2.1.0', 'Não'], ['biblioteca-imagens', '1.4.2', 'Sim'], ['biblioteca-login', '3.0.1', 'Sim'], ['biblioteca-texto', '0.9.8', 'Não'], ['biblioteca-xml', '4.2.0', 'Sim']], { title: 'SBOM do aplicativo (lista de componentes)' });
const APIQ = tab(['Cliente', 'Pedidos por minuto'], [['app-loja', 40], ['parceiro-a', 95], ['robo-desconhecido', 1800], ['parceiro-b', 70], ['script-teste', 400]], { title: 'Uso da API (limite: 100 pedidos por minuto por cliente)' });
const CERTS = tab(['Site', 'Dias até o certificado vencer'], [['loja.exemplo.com.br', 92], ['api.exemplo.com.br', 11], ['painel.exemplo.com.br', 27], ['blog.exemplo.com.br', 60], ['pagamentos.exemplo.com.br', 5]], { title: 'Validade dos certificados' });
const IOT = tab(['Dispositivo', 'Senha padrão trocada?', 'Firmware atualizado?'], [['Câmera da entrada', 'Não', 'Não'], ['Termostato', 'Sim', 'Sim'], ['Impressora', 'Sim', 'Não'], ['Roteador de visitantes', 'Não', 'Sim'], ['Fechadura inteligente', 'Sim', 'Sim']], { title: 'Inventário de dispositivos IoT' });

module.exports = [
  pjQ('o desenho do sistema de pedidos',
    'A loja Rota Azul vai construir um sistema novo de pedidos. Faça a modelagem de ameaças, meça a cobertura de detecção, ordene a cadeia de ataque, calcule o risco e escolha a norma certa.',
    [
      num('Quantos fluxos do diagrama atravessam uma fronteira de confiança?', 3, 'Navegador→servidor, API→banco e API→pagamento externo: **3 fluxos**.', { table: FLUXO, calc: () => FLUXO.rows.filter(r => r[1] === 'Sim').length }),
      match('Ligue cada letra do STRIDE à ameaça:', [['Spoofing', 'Fingir ser outra pessoa ou outro sistema'], ['Tampering', 'Alterar dados ou código sem permissão'], ['Repudiation', 'Negar ter feito algo, sem prova do contrário'], ['Information disclosure', 'Expor dados a quem não deveria vê-los']], 'Cada letra aponta **um tipo de problema** que o desenho precisa evitar.'),
      mc('Uma pessoa consegue ler o pedido de outro cliente mudando um número na URL. Qual categoria do STRIDE?', 'Information disclosure (exposição de informações)', ['Denial of service (negação de serviço)', 'Spoofing (falsificação de identidade)', 'Repudiation (negação de autoria)'], 'O dado foi **exposto** a quem não podia vê-lo. A defesa é conferir a autorização a cada pedido.'),
      num('Quantas técnicas testadas NÃO foram detectadas, somando as quatro táticas da tabela?', 10, '3 + 4 + 0 + 3 = **10 técnicas** sem detecção.', { table: COB, calc: () => COB.rows.reduce((s, r) => s + r[1] - r[2], 0) }),
      order('Coloque as fases da Kill Chain na ordem:', ['Reconhecimento', 'Armamento', 'Entrega', 'Exploração', 'Instalação', 'Comando e controle', 'Ações sobre o objetivo'], 'O atacante precisa vencer **todas as fases**, e a defesa precisa quebrar só uma.'),
      num('O sistema de pedidos vale R$ 80.000, um incidente destruiria 50% dele e acontece 1 vez a cada 4 anos. Qual é a ALE, em reais?', 10000, 'SLE = 80.000 × 0,5 = 40.000. ALE = 40.000 × 0,25 = **R$ 10.000**.', { unit: 'reais', calc: () => 80000 * 0.5 * 0.25 }),
      mc('A Rota Azul quer um certificado, emitido após auditoria, que prove aos clientes que gerencia a segurança com um processo organizado. O que buscar?', 'A certificação ISO/IEC 27001', ['Uma cópia dos CIS Controls impressa e assinada', 'Um relatório interno sem nenhuma auditoria externa', 'Um selo de um fabricante de antivírus'], 'A ISO 27001 é a norma **auditável e certificável**. O NIST e o CIS são guias.')
    ],
    [`O primeiro projeto do Avançado de Hacker e Cibersegurança: o desenho do sistema de pedidos. Ele junta as lições 1 a 5: modelagem de ameaças e STRIDE, MITRE ATT&CK, Kill Chain, gestão de risco e frameworks e normas.`,
      `Pensar nos riscos antes de construir é mais barato do que corrigir depois. O projeto junta as ferramentas que uma equipe usa nessa fase de planejamento.`,
      `Conte as fronteiras de confiança do desenho, ligue o STRIDE, calcule a cobertura do ATT&CK, ordene a Kill Chain e calcule a perda anual esperada.`,
      `Sete perguntas numa só tela (números, ligar, escolher e ordenar). Acertando tudo, o projeto está concluído.`],
    ['Fronteira de confiança: onde os dados trocam de zona. STRIDE: fingir, alterar, negar, expor, derrubar e ganhar poder demais.',
      'Técnicas sem detecção = testadas menos detectadas, em cada tática. ALE = valor × fração perdida × frequência por ano.',
      'A ISO 27001 é a que se certifica por auditoria. A Kill Chain tem sete fases, do reconhecimento ao objetivo.']),

  pjQ('a arquitetura de defesa',
    'A Rota Azul vai reforçar acessos, aparelhos, e-mail e continuidade. Aplique Zero Trust, revise contas, escolha a ferramenta certa, configure o DMARC e calcule o RTO.',
    [
      num('A regra exige usuário verificado, aparelho saudável e MFA. Quantos pedidos da tabela são permitidos?', 2, 'Só os pedidos 1 e 4 cumprem as **três condições**.', { table: ZT, calc: () => ZT.rows.filter(r => r[1] === 'Sim' && r[2] === 'Sim' && r[3] === 'Sim').length }),
      mc('No Zero Trust, uma pessoa que está dentro da rede da empresa já pode acessar o sistema financeiro?', 'Não: o acesso é verificado em cada pedido, mesmo vindo de dentro', ['Sim: quem está dentro da rede é sempre confiável', 'Sim, desde que seja dia útil e horário comercial', 'Não: só o diretor financeiro pode acessar o sistema'], 'Estar na rede **não prova** quem é a pessoa nem se o aparelho está saudável.'),
      num('Quantas contas de ADMINISTRADOR (incluindo as de serviço) estão SEM MFA ativo?', 2, 'bruno.adm e svc-backup: **2 contas**, as mais poderosas.', { table: CONTAS, calc: () => CONTAS.rows.filter(r => r[1].startsWith('Administrador') && r[2] === 'Não').length }),
      mc('Por que a passkey (FIDO2) resiste melhor ao phishing do que uma senha?', 'Porque o par de chaves só funciona no site verdadeiro', ['Porque a passkey é uma senha mais longa que as outras', 'Porque a passkey é enviada por e-mail a cada acesso', 'Porque a passkey funciona em qualquer site parecido'], 'O navegador **confere o endereço** antes de usar a chave.'),
      num('A política DMARC é "rejeitar quando SPF E DKIM falham". Quantas mensagens da tabela seriam rejeitadas?', 2, 'As mensagens 3 e 5 falharam nos **dois** testes.', { table: MAILS, calc: () => MAILS.rows.filter(r => r[1] === 'Falhou' && r[2] === 'Falhou').length }),
      match('Ligue cada solução de proteção de aparelhos ao seu papel:', [['Antivírus tradicional', 'Compara arquivos com assinaturas conhecidas'], ['EDR', 'Observa o comportamento do aparelho e permite isolá-lo'], ['XDR', 'Reúne dados de aparelhos, e-mail, rede e nuvem'], ['MDR', 'Equipe externa que opera a detecção e a resposta']], 'O que muda é **o que cada uma enxerga** e quem opera.'),
      num('O sistema caiu às 08:00 e voltou às 13:00. O RTO era de 4 horas. Quantos minutos passou do limite?', 60, 'Ficou fora por 5 horas, e o limite era de 4: passou **60 minutos**.', { unit: 'minutos', calc: () => (13 * 60) - (8 * 60) - 4 * 60 })
    ],
    [`O segundo projeto do Avançado de Hacker e Cibersegurança: a arquitetura de defesa. Ele junta as lições 6 a 10: defesa em profundidade e Zero Trust, IAM e passkeys, proteção de endpoints, e-mail seguro e continuidade com RPO e RTO.`,
      `Uma boa arquitetura combina identidade forte, aparelhos protegidos, e-mail confiável e um plano de recuperação. Um ponto fraco em qualquer um deles pode derrubar o resto.`,
      `Aplique a regra de Zero Trust à tabela, ache as contas poderosas sem MFA, simule o DMARC e calcule o tempo que passou do RTO.`,
      `Sete perguntas numa só tela (números, escolher e ligar). Acertando tudo, o projeto está concluído.`],
    ['Zero Trust verifica o usuário, o aparelho e o MFA em cada pedido. Contas de administrador pedem as proteções mais fortes.',
      'DMARC com rejeição só pega o que falhou nos dois testes. A passkey só responde no site verdadeiro.',
      'RTO é o tempo máximo parado: calcule o tempo real de queda e subtraia o limite.']),

  pjQ('o centro de operações',
    'A Rota Azul montou um SOC. Calcule as métricas do mês, leia o registro do Windows, entenda os resultados das regras, ordene a Pirâmide da Dor e analise o relatório de um sandbox.',
    [
      num('Qual é o MTTD do mês, em minutos?', 25, '(20 + 40 + 30 + 10) ÷ 4 = **25 minutos**.', { table: SOC, unit: 'minutos', calc: () => SOC.rows.reduce((s, r) => s + r[1], 0) / SOC.rows.length }),
      num('Qual é o MTTR do mês, em minutos?', 75, '(60 + 90 + 120 + 30) ÷ 4 = **75 minutos**.', { table: SOC, unit: 'minutos', calc: () => SOC.rows.reduce((s, r) => s + r[2], 0) / SOC.rows.length }),
      match('Ligue cada ID de evento do Windows ao seu significado:', [['4624', 'Logon bem-sucedido'], ['4625', 'Falha de logon'], ['4672', 'Privilégios especiais atribuídos ao logon'], ['1102', 'Registro de auditoria apagado']], 'Os **principais IDs** aceleram a triagem.'),
      mc('O que o registro sugere: 4 falhas, depois um sucesso e privilégios especiais, da mesma conta e IP?', 'Uma conta de administrador possivelmente comprometida por adivinhação de senha', ['Um usuário comum trocando a senha como de costume', 'Uma atualização automática do sistema operacional', 'Um backup noturno em andamento no servidor'], 'Falhas em sequência e depois **privilégios altos** pedem ação imediata.', { table: WEV }),
      mc('A regra de detecção ficou em silêncio durante um ataque real. Como se chama esse resultado?', 'Falso negativo', ['Falso positivo', 'Verdadeiro positivo', 'Verdadeiro negativo'], 'O ataque **passou sem alarme**, o resultado mais perigoso.'),
      order('Coloque os indicadores na ordem da Pirâmide da Dor, do mais fácil para o atacante mudar ao mais difícil:', ['Valores de hash', 'Endereços IP', 'Nomes de domínio', 'Artefatos de rede e de máquina', 'Ferramentas', 'TTPs'], 'Quanto **mais alto**, mais difícil de mudar e mais valioso para detectar.'),
      num('Quantos comportamentos do relatório do sandbox são suspeitos?', 4, 'Copiar-se para a inicialização, apagar cópias de segurança, conectar a um endereço desconhecido e reescrever documentos: **4 comportamentos**.', { table: SAND, calc: () => SAND.rows.filter(r => r[1] === 'Sim').length })
    ],
    [`O terceiro projeto do Avançado de Hacker e Cibersegurança: o centro de operações. Ele junta as lições 11 a 15: o SOC e suas métricas, eventos do Windows, regras de detecção e Sigma, inteligência de ameaças e análise de malware.`,
      `Um SOC vive de números e de registros. Saber calcular as métricas e ler os eventos é o que separa um alerta bem tratado de um ataque que passa.`,
      `Calcule o MTTD e o MTTR, ligue os IDs do Windows, interprete o registro, classifique o resultado da regra e conte os comportamentos suspeitos do sandbox.`,
      `Sete perguntas numa só tela (números, ligar, escolher e ordenar). Acertando tudo, o projeto está concluído.`],
    ['MTTD e MTTR são médias: some os tempos e divida pelo número de incidentes.',
      '4625 é falha, 4624 é sucesso, 4672 é privilégio especial e 1102 é log apagado. Falso negativo é o ataque sem alarme.',
      'Na Pirâmide da Dor, hash é o mais fácil de mudar e TTPs o mais difícil.']),

  pjQ('a investigação',
    'Um computador da Rota Azul foi infectado. Analise o programa suspeito, os arquivos, as conexões, a situação dos servidores e a resposta ao incidente.',
    [
      num('Quantas capacidades do programa "Calculadora" NÃO são normais para uma calculadora?', 3, 'Ler teclas de outros programas, enviar dados a um servidor desconhecido e apagar cópias de segurança: **3 capacidades**.', { table: CAPAC, calc: () => CAPAC.rows.filter(r => r[1] === 'Não').length }),
      mc('O que é um "packer" (empacotador) de programas?', 'Uma técnica que comprime ou embaralha o programa para dificultar a análise', ['Um programa que cria cópias de segurança', 'Um tipo de firewall de rede', 'Uma ferramenta que aumenta a velocidade da internet'], 'O programa só mostra o conteúdo real **depois de rodar**, o que atrapalha a análise estática.'),
      num('O incidente começou às 10:10. Quantos arquivos da tabela foram criados a partir desse horário?', 3, 'update.exe, tmp1.dat e svc.dll: **3 arquivos** suspeitos.', { table: ART, calc: () => ART.rows.filter(r => r[1] >= '10:10').length }),
      num('Qual é o intervalo, em segundos, entre as conexões ao endereço 198.51.100.77?', 60, 'As conexões acontecem de minuto em minuto: **60 segundos**, um ritmo típico de programa.', { table: CAP, unit: 'segundos', calc: () => 60 }),
      mc('Qual conexão da tabela merece verificação por um possível vazamento de dados?', '10:12:41 para 192.0.2.10, com 48.200 bytes enviados de uma vez', ['As cinco conexões de cerca de 310 bytes', 'Todas as conexões, sem nenhuma diferença entre elas', 'Nenhuma conexão da tabela'], 'O envio de **48.200 bytes** é muito maior que o normal e foi para outro destino.', { table: CAP }),
      order('Coloque a resposta a um ransomware na ordem:', ['Isolar da rede os aparelhos afetados', 'Preservar as evidências e acionar o plano de incidentes', 'Identificar o alcance e a variante do ataque', 'Erradicar a causa e trocar as credenciais', 'Restaurar a partir de backups limpos e testados', 'Comunicar quem deve ser avisado e registrar as lições'], 'O **isolamento vem primeiro**, e o aprendizado fecha o ciclo.'),
      num('Quantos servidores foram criptografados E têm um backup limpo e testado, e por isso podem ser restaurados?', 2, 'SRV-01 e SRV-04: **2 servidores**.', { table: RAN, calc: () => RAN.rows.filter(r => r[1] === 'Sim' && r[2] === 'Sim').length })
    ],
    [`O quarto projeto do Avançado de Hacker e Cibersegurança: a investigação. Ele junta as lições 16 a 20: engenharia reversa, forense de memória e disco, análise de tráfego, resposta a ransomware e playbooks.`,
      `Um incidente real mistura programas suspeitos, arquivos novos, conexões estranhas e servidores doentes. Saber juntar as pistas é o trabalho de quem investiga.`,
      `Marque o que não é normal no programa, monte a linha do tempo dos arquivos, meça o ritmo das conexões e decida o que pode ser restaurado.`,
      `Sete perguntas numa só tela (números, escolher e ordenar). Acertando tudo, o projeto está concluído.`],
    ['Compare o que o programa faz com o que seria normal para ele. Procure arquivos criados depois do início do incidente.',
      'Ritmo exato e destino repetido sugerem beaconing. Um envio muito maior que o normal sugere vazamento.',
      'Só se restaura o que tem backup limpo e testado. A resposta começa pelo isolamento.']),

  pjQ('a migração para a nuvem',
    'A Rota Azul está levando os sistemas para a nuvem. Revise armazenamentos, contêineres, componentes de software, o uso da API e os certificados.',
    [
      num('Quantos armazenamentos da nuvem estão com acesso PÚBLICO e contêm dados pessoais?', 2, 'clientes-backup e exportacao-pedidos: **2 armazenamentos**.', { table: BUCK, calc: () => BUCK.rows.filter(r => r[1] === 'Sim' && r[2] === 'Sim').length }),
      num('Quantos contêineres da tabela rodam como root?', 2, 'api e relatorio: **2 contêineres**.', { table: CONT, calc: () => CONT.rows.filter(r => r[1] === 'Sim').length }),
      num('Quantos componentes do SBOM têm uma vulnerabilidade conhecida?', 3, 'biblioteca-imagens, biblioteca-login e biblioteca-xml: **3 componentes**.', { table: SBOM, calc: () => SBOM.rows.filter(r => r[2] === 'Sim').length }),
      num('O limite é de 100 pedidos por minuto por cliente. Quantos clientes da tabela passaram do limite?', 2, 'robo-desconhecido (1.800) e script-teste (400): **2 clientes**.', { table: APIQ, calc: () => APIQ.rows.filter(r => r[1] > 100).length }),
      mc('A resposta de uma API devolve o CPF e o hash da senha, mas a tela só mostra o nome. Qual é o problema?', 'Exposição excessiva de dados: a API devolve campos que a tela não precisa', ['Nenhum: quanto mais dados, melhor', 'O problema é a tela mostrar poucas informações', 'Só é um problema se o usuário abrir uma conta nova'], 'Quem lê a resposta **vê tudo o que veio**. Devolva só o necessário.'),
      order('Coloque a cadeia de confiança de um certificado na ordem, da âncora até o site:', ['Autoridade raiz (já conhecida pelo navegador)', 'Autoridade intermediária', 'Certificado do site'], 'A confiança vem **de cima para baixo**: raiz, intermediária e site.'),
      num('Quantos certificados da tabela vencem em 30 dias ou menos?', 3, 'api (11), painel (27) e pagamentos (5): **3 certificados**.', { table: CERTS, calc: () => CERTS.rows.filter(r => r[1] <= 30).length })
    ],
    [`O quinto projeto do Avançado de Hacker e Cibersegurança: a migração para a nuvem. Ele junta as lições 21 a 25: responsabilidade compartilhada, contêineres, DevSecOps e SBOM, segurança de APIs e TLS com PKI.`,
      `Quando os sistemas vão para a nuvem, a configuração passa a ser a maior fonte de risco. Revisar com tabelas é a rotina de quem cuida dessa área.`,
      `Conte os armazenamentos públicos com dados pessoais, os contêineres como root, os componentes vulneráveis, quem passou do limite da API e os certificados perto de vencer.`,
      `Sete perguntas numa só tela (números, escolher e ordenar). Acertando tudo, o projeto está concluído.`],
    ['Dados e acessos são sempre do cliente. Armazenamento público com dados pessoais é vazamento esperando acontecer.',
      'Contêiner: sem root, com imagem confiável e sem segredo dentro. API: limite por cliente e respostas enxutas.',
      'Certificado: raiz, intermediária, site. Renove antes de vencer.']),

  pjQ('o programa de segurança',
    'Para fechar o curso, a Rota Azul monta o seu programa de segurança: proteções de memória, dispositivos IoT, exercícios de equipes, LGPD e ética.',
    [
      match('Ligue cada proteção de memória ao que ela faz:', [['ASLR', 'Embaralha os endereços na memória a cada execução'], ['DEP/NX', 'Impede executar o que está em áreas marcadas como dados'], ['Canário de pilha', 'Detecta que a pilha foi alterada'], ['Fuzzing', 'Envia muitas entradas inesperadas para achar falhas']], 'Nenhuma resolve tudo: **juntas** elas encarecem o abuso de um erro.'),
      num('Quantos dispositivos IoT estão com a senha padrão NÃO trocada?', 2, 'A câmera da entrada e o roteador de visitantes: **2 dispositivos**.', { table: IOT, calc: () => IOT.rows.filter(r => r[1] === 'Não').length }),
      num('O red team executou 20 técnicas, e o blue team detectou 14. Qual foi a taxa de detecção, em porcentagem?', 70, '14 ÷ 20 = 0,70, ou **70%**.', { unit: '%', calc: () => 14 / 20 * 100 }),
      match('Ligue cada papel da LGPD à sua função:', [['Controlador', 'Decide como e para que os dados são tratados'], ['Operador', 'Trata os dados em nome do controlador'], ['Encarregado (DPO)', 'É o canal entre a empresa, os titulares e a ANPD'], ['ANPD', 'Autoridade que orienta e fiscaliza'], ['Titular', 'A pessoa a quem os dados se referem']], 'Cada papel tem **responsabilidades** próprias.'),
      mc('Dados pessoais de clientes foram expostos e há risco relevante para as pessoas. O que a LGPD prevê?', 'Comunicar a ANPD e os titulares afetados, em prazo adequado, com as informações sobre o incidente', ['Esconder o caso para não perder clientes', 'Esperar para ver se alguém percebe', 'Avisar só os diretores da empresa'], 'A **comunicação** é uma obrigação, e o prazo é definido em regulamentação da ANPD.'),
      mc('Um pesquisador acha uma falha grave no site da Rota Azul sem ter sido contratado. Qual é a atitude correta?', 'Não explorar a falha e avisar a empresa pelo canal indicado', ['Divulgar a falha num fórum público na mesma hora', 'Vender a informação sobre a falha ao maior lance', 'Usar a falha para ver os dados dos clientes'], 'A **divulgação responsável** protege as pessoas e o próprio pesquisador.'),
      write('Escreva, com as suas palavras, por que a ética é tão importante para quem trabalha com segurança.', ['!qual a ideia :: etic|autoriz|confian|respeit|respons|honest|sigilo|lei|legal', '!por que :: poder|acesso|dado|pessoa|proteg|dano|prejuiz|crime|confian|risco'], 'Porque quem trabalha com segurança tem poder e acesso a dados de outras pessoas, e só a ética, com autorização e respeito à lei, garante que isso proteja as pessoas em vez de causar dano', 'Quem tem **acesso e poder** precisa de limites claros. A confiança é o que sustenta a profissão.')
    ],
    [`O sexto projeto do Avançado de Hacker e Cibersegurança: o programa de segurança. Ele junta as lições 26 a 30: segurança de memória, mobile e IoT, red, blue e purple team, governança e LGPD, e carreira e ética.`,
      `Um programa de segurança junta tecnologia, pessoas, leis e ética. Este projeto fecha o curso com as peças que dão sustentação a tudo o que você aprendeu.`,
      `Ligue as proteções e os papéis da LGPD, faça o inventário dos dispositivos, calcule a taxa de detecção e escreva a última resposta com as suas palavras.`,
      `Sete perguntas numa só tela (ligar, número, escolher e escrever). Acertando tudo, o projeto está concluído.`],
    ['ASLR embaralha endereços, DEP impede executar dados, canário detecta alteração e fuzzing busca falhas.',
      'Senhas de fábrica são públicas: troque sempre. Taxa de detecção = técnicas detectadas ÷ técnicas executadas.',
      'Controlador decide, operador trata, encarregado fala com as pessoas e a ANPD fiscaliza. Falha achada sem autorização: avisar, e não explorar.'])
];
