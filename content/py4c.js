// PYTHON — AUTOMAÇÕES, lições 21 a 30: mensagens, e-mail, logs, internet, linha de comando e agendamento
const R = String.raw;
module.exports = (L, F) => [
  L('Mensagens com modelo', 'string.Template guarda um texto com lugares marcados por $nome. O método substitute(dicionario) preenche todos de uma vez, e $$ escreve um cifrão de verdade. É a base da mala direta.',
    R`from string import Template
modelo = Template('Ola, $nome! Seu pedido $pedido saiu hoje.')
print(modelo.substitute(nome='Ana', pedido=123))
print(modelo.substitute({'nome': 'Bia', 'pedido': 456}))`,
    'O arquivo modelo.txt tem a mensagem (com $nome, $valor e $dia) e clientes.csv tem uma linha para cada cliente. Para cada cliente, imprima a mensagem preenchida e, embaixo, uma linha com ---. Dica: o DictReader já entrega um dicionário que o substitute() aceita.',
    R`import csv
from string import Template
modelo = Template(open('modelo.txt').read().strip())
with open('clientes.csv', newline='') as f:
    for l in csv.DictReader(f):
        print(modelo.substitute(l))
        print('---')`, ['template', 'substitute('], "print(modelo.substitute(l))",
    F({ 'modelo.txt': 'Ola, $nome!\nSeu boleto de R$$ $valor vence em $dia.\n', 'clientes.csv': 'nome,valor,dia\nAna,120,10/04\nBia,85,12/04\nCaio,300,15/04\n' })),

  L('Montar um e-mail', 'EmailMessage monta a mensagem: msg["To"], msg["Subject"] e set_content() para o texto. add_attachment() junta um arquivo. Ainda não enviamos nada: só montamos a mensagem.',
    R`from email.message import EmailMessage
msg = EmailMessage()
msg['From'] = 'robo@exemplo.com'
msg['To'] = 'ana@exemplo.com'
msg['Subject'] = 'Relatorio pronto'
msg.set_content('Oi, Ana. O relatorio esta pronto.')
print(msg['To'], '|', msg['Subject'])
print(msg.get_content())`,
    'A variável total já vale 3. Monte um e-mail de robo@exemplo.com para chefe@exemplo.com, com assunto Backup concluido e o texto Backup feito com sucesso: 3 arquivos. (use f-string com total). Anexe o arquivo relatorio.txt (add_attachment com os bytes, maintype="text", subtype="plain" e filename="relatorio.txt"). Imprima o From, o To, o Subject, o texto do corpo (msg.get_body().get_content().strip()) e a lista com o nome dos anexos (p.get_filename() para p em msg.iter_attachments()).',
    R`from email.message import EmailMessage
msg = EmailMessage()
msg['From'] = 'robo@exemplo.com'
msg['To'] = 'chefe@exemplo.com'
msg['Subject'] = 'Backup concluido'
msg.set_content(f'Backup feito com sucesso: {total} arquivos.')
dados = open('relatorio.txt', 'rb').read()
msg.add_attachment(dados, maintype='text', subtype='plain', filename='relatorio.txt')
print(msg['From'])
print(msg['To'])
print(msg['Subject'])
print(msg.get_body().get_content().strip())
print([p.get_filename() for p in msg.iter_attachments()])`, ['emailmessage', 'set_content(', 'add_attachment('], "msg.add_attachment(dados, maintype='text', subtype='plain', filename='relatorio.txt')",
    F({ 'relatorio.txt': 'vendas do mes: 1440' }, { depois: 'total = 3' })),

  L('Enviar e-mails', 'smtplib.SMTP conecta no servidor de e-mail: starttls() protege a conversa, login() entra e send_message() envia. Neste treino o servidor é de mentira e guarda tudo em smtplib.caixa; no mundo real, só muda o endereço do servidor e a senha, que deve vir de uma variável de ambiente.',
    R`import smtplib
from email.message import EmailMessage
msg = EmailMessage()
msg['From'] = 'robo@exemplo.com'
msg['To'] = 'ana@exemplo.com'
msg['Subject'] = 'Oi'
msg.set_content('Teste')
with smtplib.SMTP('smtp.exemplo.com', 587) as s:
    s.starttls()
    s.login('robo@exemplo.com', 'senha123')
    s.send_message(msg)
print(len(smtplib.caixa), 'enviado(s)')`,
    'O arquivo clientes.csv tem nome, email e valor. Conecte em smtp.exemplo.com na porta 587, use starttls() e entre com robo@exemplo.com e a senha que está na variável de ambiente SENHA_SMTP. Envie um e-mail para cada cliente, com assunto Seu boleto e o texto Ola, NOME! Valor: R$ VALOR. (com os dados da linha). Depois imprima quantos e-mails foram enviados (len(smtplib.caixa)) e, embaixo, o destinatário e o assunto do último, separados por " | ".',
    R`import csv, os, smtplib
from email.message import EmailMessage
with smtplib.SMTP('smtp.exemplo.com', 587) as s:
    s.starttls()
    s.login('robo@exemplo.com', os.environ['SENHA_SMTP'])
    with open('clientes.csv', newline='') as f:
        for c in csv.DictReader(f):
            msg = EmailMessage()
            msg['From'] = 'robo@exemplo.com'
            msg['To'] = c['email']
            msg['Subject'] = 'Seu boleto'
            msg.set_content(f"Ola, {c['nome']}! Valor: R$ {c['valor']}.")
            s.send_message(msg)
ultimo = smtplib.caixa[-1]
print(len(smtplib.caixa), 'enviados')
print(ultimo['To'], '|', ultimo['Subject'])`, ['smtplib', 'starttls(', 'login(', 'send_message('], "s.login('robo@exemplo.com', os.environ['SENHA_SMTP'])",
    F({ 'clientes.csv': 'nome,email,valor\nAna,ana@exemplo.com,120\nBia,bia@exemplo.com,85\nCaio,caio@exemplo.com,300\n' }, { env: { SENHA_SMTP: 'senha123' } })),

  L('Diário do robô: logging', 'logging é o diário de bordo do programa, com níveis: debug, info, warning, error. basicConfig(level=..., format=..., stream=sys.stdout) escolhe o que aparece e como. Quando o robô roda sozinho, é o log que conta o que aconteceu.',
    R`import logging, sys
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s', stream=sys.stdout)
logging.info('robo iniciado')
logging.debug('detalhe que nao aparece')
logging.warning('disco quase cheio')`,
    'Configure o logging para mostrar de INFO para cima no formato NIVEL - mensagem (%(levelname)s - %(message)s), saindo em sys.stdout. Leia arquivos.txt (um nome por linha). Para cada nome que termina com .tmp, registre um warning: temporario: NOME. Para os outros, um info: ok: NOME. No fim, registre um info: fim: N arquivos.',
    R`import logging, sys
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s', stream=sys.stdout)
with open('arquivos.txt') as f:
    nomes = f.read().split()
for n in nomes:
    if n.endswith('.tmp'):
        logging.warning('temporario: %s', n)
    else:
        logging.info('ok: %s', n)
logging.info('fim: %d arquivos', len(nomes))`, ['logging.basicconfig(', 'warning(', 'info('], "logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s', stream=sys.stdout)",
    F({ 'arquivos.txt': 'a.txt\nb.tmp\nc.csv\nd.tmp\n' })),

  L('Tentar de novo quando falha', 'Robôs falham: a rede cai, o servidor demora. Com try/except você captura o erro, espera um pouco (time.sleep) e tenta de novo. Se as tentativas acabarem, avise em vez de travar. Neste treino o time.sleep passa o tempo na hora.',
    R`import time
tentativas = 0
def instavel():
    global tentativas
    tentativas += 1
    if tentativas < 3:
        raise ConnectionError('sem rede')
    return 'ok'
for n in range(1, 5):
    try:
        print(instavel())
        break
    except ConnectionError as e:
        print('falhou:', e)
        time.sleep(2)`,
    'A função baixar() já existe: ela falha com ConnectionError nas duas primeiras chamadas e na terceira devolve "dados". Crie com_retry(funcao, tentativas=4, espera=1) que chama a função; se der ConnectionError, imprime tentativa N falhou (N começa em 1), espera com time.sleep e dobra a espera. Se as tentativas acabarem, levanta ConnectionError. Guarde time.time() antes de chamar e imprima o resultado de com_retry(baixar) e, embaixo, Esperou X segundos (a diferença de time.time()).',
    R`import time
def com_retry(funcao, tentativas=4, espera=1):
    for i in range(tentativas):
        try:
            return funcao()
        except ConnectionError:
            print(f'tentativa {i + 1} falhou')
            time.sleep(espera)
            espera *= 2
    raise ConnectionError('desisti')
inicio = time.time()
print(com_retry(baixar))
print(f'Esperou {time.time() - inicio} segundos')`, ['try', 'except', 'time.sleep('], 'except ConnectionError:',
    F({}, { depois: "_n = {'v': 0}\ndef baixar():\n    _n['v'] += 1\n    if _n['v'] < 3:\n        raise ConnectionError('sem rede')\n    return 'dados'" })),

  L('Buscar dados na internet', 'requests.get(url) pede uma página ou uma API. resposta.status_code diz se deu certo (200) e resposta.json() transforma o JSON em dicionário. O params={...} monta a pergunta (?moeda=USD). Neste treino a internet é de mentira, mas o código é o mesmo do mundo real.',
    R`import requests
r = requests.get('https://api.exemplo.com/cotacao', params={'moeda': 'USD'})
print(r.status_code)
dados = r.json()
print(dados['moeda'], dados['valor'])`,
    'Consulte a cotação das moedas USD, EUR e XXX, nessa ordem, em https://api.exemplo.com/cotacao com params={"moeda": ...}. Se o status for 200, imprima MOEDA: VALOR (a moeda e o valor que vêm no JSON). Senão, imprima MOEDA: indisponivel (STATUS).',
    R`import requests
for moeda in ['USD', 'EUR', 'XXX']:
    r = requests.get('https://api.exemplo.com/cotacao', params={'moeda': moeda})
    if r.status_code == 200:
        print(f"{moeda}: {r.json()['valor']}")
    else:
        print(f'{moeda}: indisponivel ({r.status_code})')`, ['requests.get(', 'status_code', 'json()'], "r = requests.get(url, params={'moeda': moeda})",
    F({}, { rotas: R`{'https://api.exemplo.com/cotacao?moeda=USD': {'moeda': 'USD', 'valor': 5.2}, 'https://api.exemplo.com/cotacao?moeda=EUR': {'moeda': 'EUR', 'valor': 5.6}}` })),

  L('Páginas e erros da API', 'APIs entregam os resultados em páginas: pegue uma, junte os itens e siga para a próxima até acabar. raise_for_status() transforma um erro HTTP (404, 500) em exceção, que você captura com try/except requests.exceptions.HTTPError.',
    R`import requests
itens, pagina = [], 1
while pagina:
    r = requests.get('https://api.exemplo.com/produtos', params={'pagina': pagina})
    dados = r.json()
    itens += dados['itens']
    pagina = dados['proxima']
print(itens)`,
    'A API https://api.exemplo.com/pedidos entrega os pedidos em páginas (params={"pagina": N}); cada resposta tem itens (lista de pedidos com id e valor) e proxima (o número da próxima página, ou None no final). Colete todos os pedidos e imprima: 3 pedidos e, embaixo, Total: 400 (com os números certos). Depois chame https://api.exemplo.com/falha com raise_for_status() dentro de try/except requests.exceptions.HTTPError e imprima erro: seguido do status.',
    R`import requests
pedidos, pagina = [], 1
while pagina:
    r = requests.get('https://api.exemplo.com/pedidos', params={'pagina': pagina})
    r.raise_for_status()
    dados = r.json()
    pedidos += dados['itens']
    pagina = dados['proxima']
print(len(pedidos), 'pedidos')
print('Total:', sum(p['valor'] for p in pedidos))
try:
    requests.get('https://api.exemplo.com/falha').raise_for_status()
except requests.exceptions.HTTPError as e:
    print('erro:', e.response.status_code)`, ['while', 'raise_for_status(', 'httperror'], 'pagina = dados["proxima"]',
    F({}, { rotas: R`{'https://api.exemplo.com/produtos?pagina=1': {'itens': ['mouse', 'teclado'], 'proxima': 2}, 'https://api.exemplo.com/produtos?pagina=2': {'itens': ['monitor', 'cabo'], 'proxima': 3}, 'https://api.exemplo.com/produtos?pagina=3': {'itens': ['mesa'], 'proxima': None}, 'https://api.exemplo.com/pedidos?pagina=1': {'itens': [{'id': 1, 'valor': 100}, {'id': 2, 'valor': 250}], 'proxima': 2}, 'https://api.exemplo.com/pedidos?pagina=2': {'itens': [{'id': 3, 'valor': 50}], 'proxima': None}, 'https://api.exemplo.com/falha': (500, {'erro': 'servidor fora do ar'})}` })),

  L('Extrair dados de HTML', 'Uma página web é um texto cheio de tags. O HTMLParser (módulo html.parser) percorre a página: handle_starttag recebe cada tag aberta (com seus atributos) e handle_data recebe o texto. No mundo real a página vem de requests.get(url).text; respeite sempre os termos de uso do site.',
    R`from html.parser import HTMLParser
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs)['href'])
p = Links()
p.feed('<p><a href="/a">A</a> e <a href="/b">B</a></p>')
print(p.links)`,
    'A página https://loja.exemplo.com/produtos tem uma lista de produtos: cada nome está num span de class nome e cada preço num span de class preco. Baixe a página com requests, crie uma classe que herda de HTMLParser para guardar os nomes e os preços (os preços como float) e imprima uma linha NOME: PRECO para cada produto. No final, imprima Soma: com a soma dos preços.',
    R`import requests
from html.parser import HTMLParser
class Precos(HTMLParser):
    def __init__(self):
        super().__init__()
        self.campo = None
        self.nomes = []
        self.precos = []
    def handle_starttag(self, tag, attrs):
        if tag == 'span':
            self.campo = dict(attrs).get('class')
    def handle_data(self, data):
        if self.campo == 'nome':
            self.nomes.append(data)
        elif self.campo == 'preco':
            self.precos.append(float(data))
        self.campo = None
html = requests.get('https://loja.exemplo.com/produtos').text
p = Precos()
p.feed(html)
for nome, preco in zip(p.nomes, p.precos):
    print(f'{nome}: {preco}')
print('Soma:', sum(p.precos))`, ['htmlparser', 'handle_starttag', 'handle_data'], 'class Precos(HTMLParser):',
    F({}, { rotas: R`{'https://loja.exemplo.com/produtos': '''<ul>
<li class="item"><span class="nome">Mouse</span> <span class="preco">80.50</span></li>
<li class="item"><span class="nome">Teclado</span> <span class="preco">150.00</span></li>
<li class="item"><span class="nome">Monitor</span> <span class="preco">900.00</span></li>
</ul>'''}` })),

  L('Programa de linha de comando', 'argparse transforma o script numa ferramenta de terminal: argumentos posicionais, opções como --dias 30 e chaves como --simular. parse_args(lista) lê a lista (sem lista, lê sys.argv). A função main() e o if __name__ == "__main__" deixam o programa organizado.',
    R`import argparse
ap = argparse.ArgumentParser(description='Limpa arquivos velhos')
ap.add_argument('pasta')
ap.add_argument('--dias', type=int, default=30)
ap.add_argument('--simular', action='store_true')
args = ap.parse_args(['logs', '--dias', '7', '--simular'])
print(args.pasta, args.dias, args.simular)`,
    'Crie a função main(argv=None) com argparse: pasta (posicional), --dias (inteiro, padrão 30) e --simular (liga ou desliga). Ela percorre os .log da pasta em ordem e, para os parados há mais de dias dias: com --simular, imprime apagaria NOME; sem, apaga o arquivo e imprime apagado NOME. Dentro de if __name__ == "__main__": chame main(["logs", "--dias", "30", "--simular"]), depois main(["logs", "--dias", "30"]) e imprima a lista ordenada dos arquivos que sobraram em logs.',
    R`import argparse, time
from pathlib import Path
def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('pasta')
    ap.add_argument('--dias', type=int, default=30)
    ap.add_argument('--simular', action='store_true')
    args = ap.parse_args(argv)
    for p in sorted(Path(args.pasta).glob('*.log')):
        idade = (time.time() - p.stat().st_mtime) / 86400
        if idade > args.dias:
            if args.simular:
                print('apagaria', p.name)
            else:
                p.unlink()
                print('apagado', p.name)
if __name__ == '__main__':
    main(['logs', '--dias', '30', '--simular'])
    main(['logs', '--dias', '30'])
    print(sorted(x.name for x in Path('logs').iterdir()))`, ['argparse', 'add_argument(', 'parse_args(', '__main__'], "ap.add_argument('--simular', action='store_true')",
    F({ 'logs/novo.log': 'a', 'logs/velho.log': 'b', 'logs/antigo.log': 'c' }, { dias: { 'logs/novo.log': 2, 'logs/velho.log': 60, 'logs/antigo.log': 100 } })),

  L('Agendar tarefas', 'Para o robô rodar sozinho nos horários certos, use sched.scheduler: enter(atraso, prioridade, funcao, argumentos) marca a tarefa e run() espera e executa tudo na ordem. No mundo real, quem faz esse papel é o agendador do sistema (cron no Linux, Agendador de Tarefas no Windows). Aqui o relógio é de mentira e passa na hora.',
    R`import sched, time
inicio = time.time()
agenda = sched.scheduler(time.time, time.sleep)
def tarefa(nome):
    print(f'{int(time.time() - inicio)}s: {nome}')
agenda.enter(5, 1, tarefa, ('backup',))
agenda.enter(2, 1, tarefa, ('relatorio',))
agenda.run()`,
    'Crie a função repetir(nome, intervalo, vezes): ela imprime Xs: nome (X é quantos segundos se passaram desde o início) e, se ainda restarem vezes, agenda a si mesma de novo para daqui a intervalo segundos. Agende repetir("relatorio", 30, 3) para daqui a 30 segundos e repetir("backup", 0, 1) para daqui a 45 segundos, rode a agenda e imprima no final: Total: N segundos.',
    R`import sched, time
inicio = time.time()
agenda = sched.scheduler(time.time, time.sleep)
def repetir(nome, intervalo, vezes):
    print(f'{int(time.time() - inicio)}s: {nome}')
    if vezes > 1:
        agenda.enter(intervalo, 1, repetir, (nome, intervalo, vezes - 1))
agenda.enter(30, 1, repetir, ('relatorio', 30, 3))
agenda.enter(45, 1, repetir, ('backup', 0, 1))
agenda.run()
print(f'Total: {int(time.time() - inicio)} segundos')`, ['sched', 'enter(', 'run()'], 'agenda.enter(intervalo, 1, repetir, (nome, intervalo, vezes - 1))',
    F({}))
];
