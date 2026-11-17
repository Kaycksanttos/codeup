// Python — NÍVEL AUTOMAÇÕES: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
// Os arquivos das lições moram no "computador de treino": um computador de mentira, só para você praticar sem estragar nada de verdade.
module.exports = {
  'py-4-01': [
    `Um arquivo de texto é como um caderno guardado no computador. Para ler o que está escrito nele, o programa precisa "abrir o caderno": é o open(). O with fecha o caderno sozinho quando você termina.`,
    `Serve para o programa pegar informações que estão guardadas: uma lista de tarefas, um recado, um relatório. Sem ler arquivos, o robô não sabe o que fazer.`,
    `Escreva with open('tarefas.txt') as f: e, dentro (com 4 espaços), use f.read() para pegar o texto todo. O splitlines() corta o texto em uma lista, uma linha em cada item.`,
    `Dois resultados: o número de linhas do arquivo (4) e, embaixo, a primeira tarefa.`],
  'py-4-02': [
    `Um arquivo aberto pode ser percorrido com o for, como uma lista: a cada volta você ganha uma linha. Cada linha vem com uma "quebrinha" invisível no final, e o strip() tira essa quebrinha.`,
    `Serve para arquivos grandes (milhares de linhas), porque o programa lê uma de cada vez em vez de carregar tudo. É assim que se procura erros dentro de um arquivo de registro (log).`,
    `Use for linha in f: dentro do with. Limpe a linha com linha.strip() e use um if para escolher só as que começam com ERRO. Conte as erradas numa variável que começa em 0.`,
    `As linhas de erro, uma embaixo da outra, e no final a frase Total de erros: 2.`],
  'py-4-03': [
    `Abrir um arquivo no modo "w" (de write, escrever) cria um arquivo novo. Se ele já existia, o conteúdo antigo é apagado. O write() escreve o texto, mas não pula de linha sozinho: você precisa escrever o \\n.`,
    `Serve para o programa guardar resultados: uma lista, um relatório, uma cópia de dados. O que está só na memória some quando o programa termina; o que está no arquivo fica.`,
    `Abra com open('estoque.txt', 'w'), percorra os produtos com for e escreva cada um com f.write(produto + '\\n'). Depois abra de novo (sem o 'w') para ler e imprimir.`,
    `Os três produtos, um embaixo do outro: mouse, teclado e monitor.`],
  'py-4-04': [
    `O modo "a" (de append, acrescentar) abre o arquivo e escreve no fim dele, sem apagar nada. É a diferença para o "w", que apaga tudo antes de começar.`,
    `Serve para diários, históricos e registros que só crescem: cada vez que o robô roda, ele acrescenta mais uma linha ao final.`,
    `Use open('diario.txt', 'a') e escreva a nova linha com f.write(...), lembrando do \\n no final. Depois leia o arquivo, conte as linhas e mostre a última com linhas[-1].`,
    `O número 3 (agora são três linhas) e, embaixo, a linha nova: Dia 3: aprendi a acrescentar.`],
  'py-4-05': [
    `O Path é o "endereço" de um arquivo ou pasta, guardado de um jeito que o Python entende. Ele sabe separar o nome, a extensão e a pasta, e responder se o arquivo existe de verdade.`,
    `Serve para montar endereços sem erro (a barra certa no lugar certo) e para funcionar igual no Windows, no Mac e no Linux.`,
    `Escreva from pathlib import Path e monte o endereço com barras: Path('contratos') / '2024' / 'cliente_a.pdf'. Depois peça p.name, p.stem, p.suffix, p.parent e p.exists().`,
    `Cinco linhas: o nome com extensão, o nome sem extensão, a extensão com ponto, a pasta onde ele está e True (porque o arquivo existe).`],
  'py-4-06': [
    `Uma pasta é uma gaveta com arquivos dentro. O glob('*.jpg') abre a gaveta e traz só os arquivos cujo nome combina com o padrão: o * quer dizer "qualquer coisa".`,
    `Serve para o robô achar sozinho todos os arquivos de um tipo (fotos, planilhas, relatórios) e trabalhar em cada um.`,
    `Use Path('fotos').glob('*.jpg') e coloque dentro do sorted() para a ordem ser sempre a mesma. Percorra com for e mostre f.name (só o nome). Conte com len().`,
    `Os três nomes de foto, um por linha, em ordem, e no final a frase Total: 3.`],
  'py-4-07': [
    `Organizar arquivos é criar pastas, copiar, mover e apagar. O mkdir cria a pasta, o shutil.copy tira uma cópia, o shutil.move muda de lugar e o unlink() apaga de vez.`,
    `Serve para o robô arrumar a bagunça sozinho: guardar versões antigas, separar documentos, fazer cópias de segurança.`,
    `Crie com Path('antigos').mkdir(exist_ok=True). Mova com shutil.move('rascunho.txt', 'antigos'). Copie com shutil.copy e apague com Path('final.txt').unlink(). Apagar não tem volta, confira duas vezes!`,
    `Duas listas: os dois arquivos que ficaram dentro de antigos e os arquivos que sobraram na pasta de fora.`],
  'py-4-08': [
    `Pastas podem ter pastas dentro, que têm mais pastas... O rglob('*') entra em todas elas e traz tudo o que encontrar. O stat() conta detalhes de um arquivo, como o tamanho em bytes.`,
    `Serve para o robô somar o espaço usado, achar o arquivo gigante ou listar tudo o que existe dentro de um projeto, não importa a profundidade.`,
    `Percorra sorted(Path('docs').rglob('*')) e use if p.is_file() para pular as pastas. O tamanho vem de p.stat().st_size. Vá somando numa variável.`,
    `Uma linha por arquivo, com o caminho e o tamanho, e no final o total em bytes.`],
  'py-4-09': [
    `Renomear é trocar o nome de um arquivo. Com um for, o robô renomeia dezenas de arquivos de uma vez, seguindo uma regra: nota_01, nota_02, nota_03...`,
    `Serve para deixar as coisas organizadas: arrumar nomes bagunçados, numerar fotos de uma viagem, padronizar relatórios.`,
    `Use enumerate(lista, 1) para contar a partir de 1 e p.rename(p.with_name(f'nota_{i:02d}.txt')). O :02d completa com zero para dar 01, 02, 03.`,
    `A lista com os três nomes novos e, embaixo, o texto que estava dentro do primeiro arquivo.`],
  'py-4-10': [
    `CSV é uma tabela guardada em texto: uma linha por registro e valores separados por vírgula. A primeira linha tem os nomes das colunas. O módulo csv lê e escreve esse formato.`,
    `Serve para trocar dados com planilhas (Excel e Google Planilhas abrem e salvam CSV) e com sistemas de lojas, bancos e relatórios.`,
    `Leia com csv.DictReader(f): cada linha vira um dicionário (l['produto']). Escreva com csv.DictWriter(f, fieldnames=[...]), chamando writeheader() e writerow({...}). Abra sempre com newline=''.`,
    `O conteúdo do novo arquivo: o cabeçalho produto,qtd e as duas linhas dos produtos com pouco estoque.`],
  'py-4-11': [
    `JSON é um jeito de guardar dicionários e listas num arquivo de texto. Muitos programas guardam suas configurações assim. Variáveis de ambiente são "bilhetes" que o computador entrega ao programa, bons para guardar senhas fora do código.`,
    `Serve para o robô ter configurações que podem ser mudadas sem mexer no código (pasta, dias, limite) e para não deixar senhas escritas no programa.`,
    `Leia com json.load(f), mude o valor do dicionário e grave com json.dump(cfg, f, indent=2). Para as variáveis, use os.environ.get('NOME', 'padrao').`,
    `O dicionário já com dias valendo 30 e, embaixo, o valor de MODO (producao) e o texto nao definida.`],
  'py-4-12': [
    `Agrupar é juntar itens parecidos e somar: o total de cada cliente, de cada loja, de cada mês. Um dicionário faz isso: a chave é o grupo e o valor é o total.`,
    `Serve para responder "quem comprou mais?" ou "qual loja vendeu menos?" a partir de uma tabela com milhares de linhas.`,
    `Use totais[cliente] = totais.get(cliente, 0) + valor. Depois ordene com sorted(totais.items(), key=lambda x: x[1], reverse=True) e mostre o ranking.`,
    `Três linhas de ranking, do maior total para o menor, e a frase Maior cliente: ana.`],
  'py-4-13': [
    `Relatório formatado é um texto organizado em colunas alinhadas. No f-string, {nome:<10} reserva 10 espaços e alinha à esquerda, e {valor:>10.2f} alinha à direita com duas casas decimais.`,
    `Serve para o robô produzir relatórios bonitos e fáceis de ler, que podem ser guardados em arquivo, impressos ou mandados por e-mail.`,
    `Monte cada linha com uma f-string e guarde numa lista. No fim, junte tudo com '\\n'.join(linhas) e grave com write(). Calcule a soma enquanto lê as linhas.`,
    `Quatro linhas alinhadas em colunas: três produtos com o total de cada um e a linha TOTAL com a soma.`],
  'py-4-14': [
    `Regex (expressão regular) é uma "máscara" que descreve um padrão de texto: três dígitos seguidos, algo parecido com um e-mail... O re.findall procura no texto tudo o que combina com a máscara.`,
    `Serve para tirar e-mails, telefones, códigos e datas de textos bagunçados, sem precisar ler tudo na mão.`,
    `Use re.findall(r'[\\w.]+@[\\w.]+', texto) para e-mails e re.findall(r'\\d{2}-\\d{5}-\\d{4}', texto) para telefones. O r antes das aspas protege as barras invertidas.`,
    `Duas listas: a dos três e-mails achados e a dos três telefones.`],
  'py-4-15': [
    `Com parênteses, a regex separa o texto em grupos: cada parênteses guarda um pedaço. O re.match devolve um objeto de onde você tira cada grupo com group(1), group(2)... O re.sub troca um padrão por outra coisa.`,
    `Serve para transformar uma linha de registro (log) em dados organizados, e para limpar textos, como trocar vários espaços por um só.`,
    `Use re.match(r'(\\S+) (\\S+) (\\w+) (\\w+)', linha) e pegue m.group(2), m.group(3) e m.group(4). Guarde num dicionário e filtre as linhas da ana.`,
    `As ações da ana com a hora de cada uma e, no final, Eventos de ana: 3.`],
  'py-4-16': [
    `O datetime guarda uma data e uma hora. O timedelta é um pedaço de tempo (7 dias, 3 horas). Dá para somar, subtrair e transformar em texto com strftime ou ler de um texto com strptime.`,
    `Serve para calcular prazos, vencimentos, "faltam quantos dias?", nomes de arquivo com a data e relatórios do dia.`,
    `Leia a data com datetime.strptime('10/04/2025', '%d/%m/%Y'). Subtraia as datas e pegue .days. Some com agora + timedelta(days=7) e escreva com .strftime('%d/%m/%Y').`,
    `A frase Faltam 26 dias e, embaixo, a data de daqui a 7 dias: 21/03/2025.`],
  'py-4-17': [
    `Cada arquivo lembra quando foi mexido pela última vez. Esse momento fica em st_mtime, contado em segundos. Com a conta (agora - st_mtime) / 86400 você descobre há quantos dias ele está parado.`,
    `Serve para a faxina automática: apagar registros velhos, esvaziar a pasta de downloads, guardar só os arquivos do último mês.`,
    `Use time.time() para o agora e p.stat().st_mtime para a data do arquivo. Se a idade passar de 30 dias, chame p.unlink() e guarde o nome numa lista.`,
    `A lista dos dois arquivos apagados e, embaixo, a lista dos dois que ficaram.`],
  'py-4-18': [
    `O hash é uma "impressão digital" do conteúdo: o mesmo conteúdo sempre dá o mesmo código, e conteúdos diferentes dão códigos diferentes. Dois arquivos com a mesma impressão são cópias iguais.`,
    `Serve para achar arquivos repetidos que ocupam espaço à toa, mesmo quando os nomes são diferentes, e para conferir se um arquivo mudou.`,
    `Use hashlib.sha256(p.read_bytes()).hexdigest() e guarde os nomes num dicionário cuja chave é o hash: grupos.setdefault(h, []).append(nome).`,
    `Uma linha para cada grupo de arquivos iguais (como a.jpg = c.jpg) e no final o número de grupos de duplicados.`],
  'py-4-19': [
    `Um arquivo zip é uma "mala" que guarda vários arquivos juntos e ainda os deixa menores. O módulo zipfile cria a mala, coloca coisas e abre depois.`,
    `Serve para fazer cópias de segurança, mandar muitos arquivos de uma vez e guardar relatórios antigos ocupando pouco espaço.`,
    `Crie com zipfile.ZipFile('relatorios.zip', 'w') e coloque cada arquivo com z.write(p, arcname=p.name). Para abrir, use ZipFile sem o 'w', veja o z.namelist() e use z.extractall('restaurado').`,
    `A lista dos três arquivos dentro do zip e, embaixo, a lista dos três arquivos restaurados na pasta nova.`],
  'py-4-20': [
    `Um backup inteligente só copia o que é novo ou mudou. Para saber se mudou, o robô compara o conteúdo do arquivo da origem com o do destino.`,
    `Serve para o backup rodar rápido todos os dias, sem copiar de novo o que já está guardado, e para você saber o que foi atualizado.`,
    `Para cada arquivo da origem, monte o destino com Path('backup') / p.name. Se destino.exists() e o conteúdo é igual, só conte; senão use shutil.copy e conte como copiado.`,
    `Uma linha para cada arquivo (igual ou copiado) e o resumo com os números de cada um.`],
  'py-4-21': [
    `Um modelo de mensagem é um texto com buracos para preencher, como "Olá, $nome!". O Template guarda o modelo e o substitute() preenche os buracos com os dados de cada pessoa.`,
    `Serve para a mala direta: mandar a mesma mensagem para centenas de pessoas, cada uma com o seu nome, o seu valor e a sua data.`,
    `Leia o modelo do arquivo com Template(open('modelo.txt').read()). Para cada linha do CSV, chame modelo.substitute(l). Um cifrão de verdade se escreve $$.`,
    `Três mensagens preenchidas, cada uma com os dados de um cliente, separadas por linhas de ---.`],
  'py-4-22': [
    `Um e-mail é um objeto com partes: quem manda (From), para quem (To), o assunto (Subject), o texto e, às vezes, anexos. O EmailMessage monta tudo isso, mas ainda não envia.`,
    `Serve para o robô preparar avisos, relatórios e boletos prontos para serem mandados, com o arquivo anexado.`,
    `Crie msg = EmailMessage(), preencha msg['To'] e msg['Subject'], escreva o corpo com set_content(...) e junte o arquivo com add_attachment(dados, maintype='text', subtype='plain', filename='relatorio.txt').`,
    `Os dados do e-mail (de, para, assunto), o texto do corpo e a lista com o nome do anexo.`],
  'py-4-23': [
    `O SMTP é a "agência dos correios" dos e-mails. Para mandar uma carta você se conecta na agência, protege a conversa (starttls), mostra quem é (login) e entrega a mensagem (send_message).`,
    `Serve para o robô mandar e-mails sozinho: avisos de boleto, relatórios do dia, alertas de erro.`,
    `Use with smtplib.SMTP('smtp.exemplo.com', 587) as s:, depois s.starttls(), s.login(usuario, senha) e s.send_message(msg) para cada cliente. A senha vem de os.environ['SENHA_SMTP'], nunca escrita no código.`,
    `O número de e-mails enviados (3) e, embaixo, o destinatário e o assunto do último.`],
  'py-4-24': [
    `Log é o "diário de bordo" do programa. Cada anotação tem um nível de importância: info (só informando), warning (atenção) e error (deu problema).`,
    `Serve para entender o que o robô fez quando ninguém estava olhando, e descobrir onde deu errado sem precisar adivinhar.`,
    `Configure uma vez com logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s', stream=sys.stdout). Depois use logging.info(...) e logging.warning(...).`,
    `Uma linha para cada arquivo, começando por INFO ou WARNING, e a linha final com o total de arquivos.`],
  'py-4-25': [
    `Às vezes um erro passa sozinho: a internet cai por um instante, o servidor está ocupado. Em vez de desistir, o robô espera um pouco e tenta de novo, esperando mais a cada falha.`,
    `Serve para o robô ser teimoso na medida certa: não trava na primeira falha, mas também não tenta para sempre.`,
    `Faça um for com o número de tentativas. Dentro, try: return funcao() e except ConnectionError: imprima, durma com time.sleep(espera) e dobre a espera com espera *= 2.`,
    `Duas linhas de tentativas que falharam, depois a palavra dados e a soma do tempo esperado: 3.0 segundos.`],
  'py-4-26': [
    `A internet é cheia de "balcões" (APIs) onde um programa faz um pedido e recebe a resposta em JSON. O requests.get faz o pedido. O status_code diz se deu certo: 200 é sucesso e 404 é "não achei".`,
    `Serve para buscar dados atualizados: cotação do dólar, previsão do tempo, preços, lista de produtos de uma loja.`,
    `Use r = requests.get(url, params={'moeda': 'USD'}). Se r.status_code == 200, pegue os dados com r.json()['valor']. Senão, mostre que está indisponível.`,
    `Três linhas: o valor do dólar, o do euro e o aviso de que uma moeda que não existe está indisponível (404).`],
  'py-4-27': [
    `Quando há muita coisa para entregar, a API manda aos poucos, em páginas, e avisa qual é a próxima. O raise_for_status() transforma uma resposta de erro (como 500) numa exceção do Python.`,
    `Serve para buscar todos os resultados de uma lista grande e para o robô reagir direito quando o servidor está com problemas.`,
    `Use um while pagina: que pede a página, soma os itens com pedidos += dados['itens'] e troca pagina por dados['proxima']. Para o erro, use try / except requests.exceptions.HTTPError.`,
    `A quantidade de pedidos (3), o total (400) e a linha erro: 500.`],
  'py-4-28': [
    `Uma página da internet é um texto com "etiquetas" chamadas tags, como <span class="preco">80.50</span>. O HTMLParser percorre o texto e avisa o seu programa a cada tag aberta e a cada pedaço de texto.`,
    `Serve para tirar informações de páginas que não têm uma API: preços, títulos, links. Sempre respeite os termos de uso de cada site.`,
    `Crie uma classe que herda de HTMLParser. Em handle_starttag, guarde a class do span; em handle_data, guarde o nome ou o preço conforme a class. Chame p.feed(html) para rodar.`,
    `Uma linha para cada produto com o nome e o preço e, no final, a soma dos preços.`],
  'py-4-29': [
    `Programa de linha de comando é aquele que você roda com parâmetros, como limpar logs --dias 30. O argparse lê esses parâmetros e ainda cria a ajuda (--help) de graça.`,
    `Serve para o mesmo programa ser usado de jeitos diferentes sem mexer no código, e para o agendador do computador chamar o robô com as opções certas.`,
    `Crie um ArgumentParser, adicione add_argument('pasta'), add_argument('--dias', type=int, default=30) e add_argument('--simular', action='store_true'). Use parse_args(argv) e o if __name__ == '__main__'.`,
    `Primeiro o ensaio (apagaria...), depois a faxina de verdade (apagado...) e, no final, a lista do que sobrou na pasta.`],
  'py-4-30': [
    `O agendador guarda uma agenda de tarefas com a hora de cada uma e as executa na ordem certa. Uma tarefa pode agendar a si mesma de novo, e assim se repete.`,
    `Serve para o robô rodar sozinho no horário certo: o relatório toda manhã, o backup toda noite. No computador de verdade, esse papel é do cron ou do Agendador de Tarefas.`,
    `Crie sched.scheduler(time.time, time.sleep), marque com agenda.enter(atraso, 1, funcao, (argumentos,)) e rode com agenda.run(). Dentro da tarefa, agende a próxima vez.`,
    `A hora de cada execução (30s, 45s, 60s e 90s) e a frase final com o total de segundos.`]
};
