// "Experimente" do nível Automações: uma mudança sugerida para o exemplo de cada lição. { q: o convite, code: o exemplo já alterado, why: o que aconteceu }.
// O código usa String.raw para o `\n` do Python continuar sendo barra + n. O teste (tools/check-tente.js) roda cada `code` no computador de treino e exige uma saída diferente da do exemplo.
const R = String.raw;
module.exports = {
  'py-4-01': { q: 'Mostre só a primeira linha e quantas linhas o recado tem.', code: R`with open('recado.txt') as f:
    texto = f.read()
print(texto.splitlines()[0])
print(len(texto.splitlines()))`, why: 'O `splitlines()` corta o texto em uma lista, uma linha em cada item. A posição 0 é a primeira linha.' },
  'py-4-02': { q: 'Troque a palavra procurada por `almoco`.', code: R`with open('agenda.txt') as f:
    for linha in f:
        linha = linha.strip()
        if 'almoco' in linha:
            print(linha)`, why: 'O `if` deixa passar só as linhas que têm a palavra. Mudou a palavra, mudou a linha que aparece.' },
  'py-4-03': { q: 'Acrescente `cafe` na lista de itens.', code: R`itens = ['pao', 'leite', 'cafe']
with open('compras.txt', 'w') as f:
    for item in itens:
        f.write(item + '\n')
with open('compras.txt') as f:
    print(f.read())`, why: 'O `for` escreve cada item da lista numa linha. Com um item a mais, o arquivo ganha uma linha a mais.' },
  'py-4-04': { q: 'Acrescente também o nome `davi`.', code: R`with open('presenca.txt', 'a') as f:
    f.write('caio\n')
    f.write('davi\n')
with open('presenca.txt') as f:
    print(f.read().split())`, why: 'O modo `"a"` acrescenta no final. Dois `write` seguidos acrescentam duas linhas, e as antigas continuam lá.' },
  'py-4-05': { q: 'Troque o nome do arquivo para `lucros.csv`, que não existe.', code: R`from pathlib import Path
p = Path('relatorios') / '2025' / 'lucros.csv'
print(p)
print(p.name, p.suffix)
print(p.parent)
print(p.exists())`, why: 'O Path só monta o endereço. O `exists()` vai até o disco conferir, e como o lucros.csv não existe, mostra False.' },
  'py-4-06': { q: 'Liste os arquivos `.txt` em vez dos `.csv`.', code: R`from pathlib import Path
for arq in sorted(Path('dados').glob('*.txt')):
    print(arq.name)`, why: 'O padrão do `glob` escolhe os arquivos pelo final do nome. Com `*.txt` só aparece o leia-me.txt.' },
  'py-4-07': { q: 'Copie dando um novo nome: `backup/copia.txt`.', code: R`from pathlib import Path
import shutil
Path('backup').mkdir(exist_ok=True)
shutil.copy('relatorio.txt', 'backup/copia.txt')
print(sorted(p.name for p in Path('backup').iterdir()))`, why: 'Se o destino é um nome de arquivo, o `shutil.copy` copia já com esse nome novo.' },
  'py-4-08': { q: 'Procure os arquivos `.py` em vez dos `.txt`.', code: R`from pathlib import Path
for p in sorted(Path('projeto').rglob('*.py')):
    print(p, p.stat().st_size)`, why: 'O `rglob` olha em todas as subpastas. O padrão `*.py` acha o c.py que está dentro de src.' },
  'py-4-09': { q: 'Use três dígitos no número: `viagem_001.jpg`.', code: R`from pathlib import Path
for i, p in enumerate(sorted(Path('fotos').glob('*.jpg')), 1):
    p.rename(p.with_name(f'viagem_{i:03d}.jpg'))
print(sorted(x.name for x in Path('fotos').iterdir()))`, why: 'O `:03d` completa o número com zeros até ter 3 dígitos: 001, 002, 003.' },
  'py-4-10': { q: 'Mostre o preço de cada produto em vez do total.', code: R`import csv
with open('vendas.csv', newline='') as f:
    for linha in csv.DictReader(f):
        print(linha['produto'], linha['preco'])`, why: 'O `DictReader` entrega cada linha como dicionário: é só pedir a coluna que você quer, pelo nome.' },
  'py-4-11': { q: 'Troque o limite para `10`.', code: R`import json
with open('config.json') as f:
    cfg = json.load(f)
cfg['limite'] = 10
with open('config.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print(open('config.json').read())`, why: 'O `json.load` traz o arquivo para um dicionário. Você muda o valor e o `json.dump` grava de volta.' },
  'py-4-12': { q: 'Some por produto em vez de por loja.', code: R`import csv
totais = {}
with open('vendas.csv', newline='') as f:
    for l in csv.DictReader(f):
        totais[l['produto']] = totais.get(l['produto'], 0) + int(l['valor'])
print(totais)`, why: 'A chave do dicionário decide como os valores são agrupados. Com o produto como chave, os dois mouses somam juntos.' },
  'py-4-13': { q: 'Alinhe a quantidade à esquerda trocando `>` por `<`.', code: R`itens = [('mouse', 3, 80.0), ('teclado', 2, 150.5)]
linhas = []
for nome, qtd, preco in itens:
    linhas.append(f'{nome:<10}{qtd:<3}{preco:>9.2f}')
with open('relatorio.txt', 'w') as f:
    f.write('\n'.join(linhas) + '\n')
print(open('relatorio.txt').read())`, why: 'O `<` encosta o valor na esquerda do campo e o `>` encosta na direita. Mudou o lado, mudaram os espaços.' },
  'py-4-14': { q: 'Procure só os números com 3 dígitos ou mais.', code: R`import re
texto = 'Pedido 123 pago, pedido 45 pendente, pedido 6789 pago'
print(re.findall(r'\d{3,}', texto))`, why: 'O `{3,}` quer dizer "no mínimo 3". O 45 tem só 2 dígitos e fica de fora.' },
  'py-4-15': { q: 'Corte outra linha de log em quatro grupos.', code: R`import re
linha = '2025-03-14 10:15:00 INFO tudo certo'
m = re.match(r'(\S+) (\S+) (\w+) (.*)', linha)
print(m.groups())
print(m.group(3))`, why: 'Cada parênteses do padrão vira um grupo. O `group(3)` pega o terceiro: o nível da mensagem.' },
  'py-4-16': { q: 'Calcule a data de daqui a 90 dias.', code: R`from datetime import datetime, timedelta
agora = datetime.now()
print(agora.strftime('%d/%m/%Y %H:%M'))
vence = agora + timedelta(days=90)
print(vence.strftime('%d/%m/%Y'))`, why: 'O `timedelta` é um pedaço de tempo. Somar 90 dias a 14 de março leva até 12 de junho.' },
  'py-4-17': { q: 'Mostre a idade em semanas, com uma casa decimal.', code: R`import time
from pathlib import Path
for p in sorted(Path('logs').glob('*.log')):
    idade = (time.time() - p.stat().st_mtime) / 86400
    print(p.name, round(idade / 7, 1))`, why: 'Uma semana tem 7 dias. Dividir a idade em dias por 7 dá a idade em semanas.' },
  'py-4-18': { q: 'Mostre os 12 primeiros caracteres do hash.', code: R`import hashlib
from pathlib import Path
for p in sorted(Path('.').glob('*.txt')):
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    print(p.name, h[:12])`, why: 'O hash é um texto longo. O `[:12]` mostra só o começo. O a.txt e o b.txt continuam iguais.' },
  'py-4-19': { q: 'Escreva um terceiro arquivo direto dentro do zip.', code: R`import zipfile
with zipfile.ZipFile('docs.zip', 'w') as z:
    z.write('a.txt')
    z.write('b.txt')
    z.writestr('novo.txt', 'texto novo')
with zipfile.ZipFile('docs.zip') as z:
    print(z.namelist())`, why: 'O `writestr` grava um texto dentro do zip sem precisar existir um arquivo de verdade.' },
  'py-4-20': { q: 'Avise também quando o arquivo já existe no backup.', code: R`import shutil
from pathlib import Path
for p in sorted(Path('origem').iterdir()):
    destino = Path('backup') / p.name
    if not destino.exists():
        shutil.copy(p, destino)
        print('copiado', p.name)
    else:
        print('ja existe', p.name)`, why: 'O `else` cuida do outro caminho: quando o arquivo já está no backup, o robô só avisa e não copia.' },
  'py-4-21': { q: 'Preencha o modelo com outros valores.', code: R`from string import Template
modelo = Template('Ola, $nome! Seu pedido $pedido saiu hoje.')
print(modelo.substitute(nome='Davi', pedido=999))
print(modelo.substitute({'nome': 'Eva', 'pedido': 1000}))`, why: 'O mesmo modelo serve para qualquer pessoa: o `substitute` só troca os buracos pelos valores novos.' },
  'py-4-22': { q: 'Mude o assunto e o texto do e-mail.', code: R`from email.message import EmailMessage
msg = EmailMessage()
msg['From'] = 'robo@exemplo.com'
msg['To'] = 'ana@exemplo.com'
msg['Subject'] = 'Backup pronto'
msg.set_content('Oi, Ana. O backup terminou.')
print(msg['To'], '|', msg['Subject'])
print(msg.get_content())`, why: 'O assunto e o corpo são só textos que você escolhe. O `msg["Subject"]` devolve o que foi guardado.' },
  'py-4-23': { q: 'Envie a mensagem duas vezes.', code: R`import smtplib
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
    s.send_message(msg)
print(len(smtplib.caixa), 'enviado(s)')`, why: 'Cada `send_message` entrega uma mensagem. Com duas chamadas, o servidor de treino guarda duas.' },
  'py-4-24': { q: 'Mostre só de WARNING para cima.', code: R`import logging, sys
logging.basicConfig(level=logging.WARNING, format='%(levelname)s: %(message)s', stream=sys.stdout)
logging.info('robo iniciado')
logging.debug('detalhe que nao aparece')
logging.warning('disco quase cheio')`, why: 'O `level` é o filtro do diário. Com WARNING, as mensagens de INFO (menos importantes) somem.' },
  'py-4-25': { q: 'Faça a função só funcionar na 4ª tentativa.', code: R`import time
tentativas = 0
def instavel():
    global tentativas
    tentativas += 1
    if tentativas < 4:
        raise ConnectionError('sem rede')
    return 'ok'
for n in range(1, 6):
    try:
        print(instavel())
        break
    except ConnectionError as e:
        print('falhou:', e)
        time.sleep(2)`, why: 'A função agora falha três vezes antes de funcionar. O laço de tentativas aguenta, porque ainda tem voltas sobrando.' },
  'py-4-26': { q: 'Consulte o euro em vez do dólar.', code: R`import requests
r = requests.get('https://api.exemplo.com/cotacao', params={'moeda': 'EUR'})
print(r.status_code)
dados = r.json()
print(dados['moeda'], dados['valor'])`, why: 'O `params` monta a pergunta da internet (?moeda=EUR). A resposta muda conforme a pergunta.' },
  'py-4-27': { q: 'Mostre quantos produtos foram coletados.', code: R`import requests
itens, pagina = [], 1
while pagina:
    r = requests.get('https://api.exemplo.com/produtos', params={'pagina': pagina})
    dados = r.json()
    itens += dados['itens']
    pagina = dados['proxima']
print(len(itens))`, why: 'O laço junta os itens das três páginas numa lista só. O `len` conta quantos há no total.' },
  'py-4-28': { q: 'Conte os links e mostre só o primeiro.', code: R`from html.parser import HTMLParser
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs)['href'])
p = Links()
p.feed('<p><a href="/a">A</a> e <a href="/b">B</a></p>')
print(len(p.links))
print(p.links[0])`, why: 'O leitor guarda cada href numa lista. Depois é só usar `len` e a posição 0, como em qualquer lista.' },
  'py-4-29': { q: 'Mude a pasta e os dias que você manda para o programa.', code: R`import argparse
ap = argparse.ArgumentParser(description='Limpa arquivos velhos')
ap.add_argument('pasta')
ap.add_argument('--dias', type=int, default=30)
ap.add_argument('--simular', action='store_true')
args = ap.parse_args(['fotos', '--dias', '90'])
print(args.pasta, args.dias, args.simular)`, why: 'Sem o `--simular` na lista, a chave fica False. O `--dias 90` troca o padrão de 30 por 90.' },
  'py-4-30': { q: 'Marque as tarefas para 1 e 10 segundos.', code: R`import sched, time
inicio = time.time()
agenda = sched.scheduler(time.time, time.sleep)
def tarefa(nome):
    print(f'{int(time.time() - inicio)}s: {nome}')
agenda.enter(10, 1, tarefa, ('backup',))
agenda.enter(1, 1, tarefa, ('relatorio',))
agenda.run()`, why: 'O agendador executa na ordem do horário, não na ordem em que foram marcadas: o de 1 segundo vem primeiro.' }
};
