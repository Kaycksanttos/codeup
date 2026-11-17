// PYTHON — NÍVEL AUTOMAÇÕES: a 2ª atividade de cada lição (ler o código). Veja content/rdh.js para o formato.
// Os códigos criam os próprios arquivos (o "computador de treino" de public/lab.py), então dá para ler tudo sem precisar de arquivo pronto.
// `pre: true` faz o `npm run check:ler` rodar cada código dentro do computador de treino, sem tocar em nenhum arquivo de verdade.
const { mc, ty, mo, to, me } = require('./rdh');
const R = String.raw;
const Q = { out: 'O que aparece na tela quando o código roda?', saida: 'Qual é a saída desse código?', dig: 'Digite o que aparece na tela.', oque: 'O que acontece quando o código roda?' };
const P = { pre: true };

module.exports = {
  'py-4-01': mo(R`with open('nomes.txt', 'w') as f:
    f.write('ana\nbia\ncaio\n')
with open('nomes.txt') as f:
    texto = f.read()
print(len(texto))
print(texto.splitlines()[1])`, Q.out, '13\nbia', ['3\nbia', '13\nana', '12\nbia'],
    'Primeiro o código escreve o arquivo: ana, bia e caio, cada um seguido de \\n (a quebra de linha).\nO `read()` devolve o texto inteiro: 3 + 1 + 3 + 1 + 4 + 1 = 13 letras, contando as quebras de linha.\nO `splitlines()` corta o texto em uma lista, e a posição 1 é o segundo item (a contagem começa em 0): bia.', P),
  'py-4-02': to(R`with open('c.txt', 'w') as f:
    f.write('10\n20\n30\n')
soma = 0
with open('c.txt') as f:
    for linha in f:
        soma += int(linha)
print(soma)`, Q.dig, '60',
    'O arquivo tem os números 10, 20 e 30, um em cada linha.\nO `for` entrega uma linha de cada vez, e o `int(linha)` transforma o texto em número (ele ignora a quebra de linha no final).\nA soma vai acumulando: 10 + 20 + 30 = 60.', P),
  'py-4-03': mo(R`with open('x.txt', 'w') as f:
    f.write('um\n')
with open('x.txt', 'w') as f:
    f.write('dois\n')
print(open('x.txt').read().split())`, Q.out, "['dois']", ["['um', 'dois']", "['um']", "['dois', 'um']"],
    'O modo `"w"` apaga o que já existia antes de escrever. A segunda abertura jogou fora o "um".\nNo arquivo sobrou só `dois` com a quebra de linha.\nO `split()` corta o texto nos espaços e quebras de linha e devolve a lista com um item só: [\'dois\'].', P),
  'py-4-04': mo(R`with open('x.txt', 'w') as f:
    f.write('a')
    f.write('b')
with open('x.txt', 'a') as f:
    f.write('c\n')
print(open('x.txt').read().splitlines())`, Q.out, "['abc']", ["['a', 'b', 'c']", "['ab', 'c']", "['c']"],
    'O `write()` não pula de linha sozinho: escrever "a" e depois "b" deixa `ab` na mesma linha.\nO modo `"a"` acrescenta no final, sem apagar: ficou `abc` e então a quebra de linha.\nO `splitlines()` separa por linhas, e só existe uma: [\'abc\'].', P),
  'py-4-05': mo(R`from pathlib import Path
p = Path('docs') / 'ano' / 'relatorio.final.pdf'
print(p.stem)
print(p.suffix)
print(p.parent.name)`, Q.out, 'relatorio.final\n.pdf\nano', ['relatorio\n.final.pdf\nano', 'relatorio.final.pdf\n.pdf\ndocs', 'relatorio.final\n.pdf\ndocs'],
    'O `stem` é o nome sem a extensão. A extensão é só o que vem depois do último ponto, então o stem é `relatorio.final`.\nO `suffix` é a extensão, com o ponto: `.pdf`.\nO `parent` é a pasta onde o arquivo está (`docs/ano`), e o `.name` dela é só o último pedaço: `ano`.', P),
  'py-4-06': mo(R`from pathlib import Path
Path('d').mkdir()
for n in ['b.csv', 'a.csv', 'c.txt']:
    Path('d', n).write_text('x')
print([p.name for p in sorted(Path('d').glob('*.csv'))])`, Q.out, "['a.csv', 'b.csv']", ["['b.csv', 'a.csv']", "['a.csv', 'b.csv', 'c.txt']", "['c.txt']"],
    'O código cria a pasta `d` e três arquivos dentro dela.\nO `glob("*.csv")` fica só com os que terminam em .csv: b.csv e a.csv (o c.txt não combina).\nO `sorted()` coloca em ordem alfabética, então a.csv vem antes de b.csv.', P),
  'py-4-07': me(R`from pathlib import Path
Path('pasta').mkdir()
Path('pasta').mkdir()
print('pronto')`, Q.oque, 'Dá erro, porque a pasta já existe', ['Cria a pasta de novo e imprime pronto', 'Apaga a pasta e cria outra', 'Não faz nada e imprime pronto'],
    'O primeiro `mkdir()` cria a pasta. O segundo tenta criar uma pasta que já existe, e o Python avisa com um erro (FileExistsError).\nPor isso o `print` nunca chega a rodar.\nPara evitar o erro, escreva `mkdir(exist_ok=True)`: se a pasta já existir, tudo bem.', 'FileExistsError', P),
  'py-4-08': to(R`from pathlib import Path
Path('p/sub').mkdir(parents=True)
Path('p/a.txt').write_text('abcd')
Path('p/sub/b.txt').write_text('xy')
print(sum(f.stat().st_size for f in Path('p').rglob('*') if f.is_file()))`, Q.dig, '6',
    'O `rglob("*")` entra em todas as pastas, e o `is_file()` deixa passar só os arquivos (a pasta `sub` fica de fora).\nO arquivo a.txt tem 4 letras (4 bytes) e o b.txt tem 2.\nO `sum` soma os tamanhos: 4 + 2 = 6.', P),
  'py-4-09': mo(R`from pathlib import Path
for n in ['b.txt', 'a.txt']:
    Path(n).write_text(n)
for i, p in enumerate(sorted(Path('.').glob('*.txt')), 1):
    p.rename(f'doc_{i:02d}.txt')
print(sorted(x.name for x in Path('.').iterdir()))
print(Path('doc_01.txt').read_text())`, Q.out, "['doc_01.txt', 'doc_02.txt']\na.txt", ["['doc_01.txt', 'doc_02.txt']\nb.txt", "['a.txt', 'b.txt']\na.txt", "['doc_00.txt', 'doc_01.txt']\na.txt"],
    'O `sorted()` coloca a.txt antes de b.txt. O `enumerate(..., 1)` conta a partir de 1.\nO a.txt vira `doc_01.txt` (o `:02d` completa com zero) e o b.txt vira `doc_02.txt`.\nO texto de dentro continua o mesmo: o arquivo que guardava "a.txt" agora se chama doc_01.txt, então é isso que aparece.', P),
  'py-4-10': mo(R`import csv
with open('v.csv', 'w', newline='') as f:
    f.write('produto,qtd\nmouse,3\nteclado,2\n')
with open('v.csv', newline='') as f:
    linhas = list(csv.DictReader(f))
print(linhas[1]['produto'], sum(int(l['qtd']) for l in linhas))`, Q.out, 'teclado 5', ['mouse 5', 'teclado 2', 'teclado 3'],
    'O `DictReader` usa a primeira linha (produto,qtd) como nomes das colunas e devolve uma lista de dicionários, um por linha.\nA posição 1 é o segundo registro, o teclado.\nO `sum` soma as quantidades (convertidas com `int`): 3 + 2 = 5.', P),
  'py-4-11': to(R`import json
dados = {'nome': 'Ana', 'ativo': True, 'notas': [8, 9]}
with open('d.json', 'w') as f:
    json.dump(dados, f)
print(open('d.json').read())`, Q.dig, '{"nome": "Ana", "ativo": true, "notas": [8, 9]}',
    'O `json.dump` grava o dicionário como texto JSON. O JSON usa aspas duplas e escreve `true` em letras minúsculas (no Python é `True`).\nA lista continua uma lista: [8, 9].\nAo ler o arquivo de volta, é esse texto que aparece.', P),
  'py-4-12': mo(R`from collections import Counter
cores = ['azul', 'verde', 'azul', 'azul', 'verde', 'rosa']
c = Counter(cores)
print(c.most_common(1))
print(c['rosa'])`, Q.out, "[('azul', 3)]\n1", ["[('verde', 2)]\n1", "[('azul', 3)]\n0", "[('azul', 3), ('verde', 2)]\n1"],
    'O `Counter` conta quantas vezes cada item aparece: azul 3, verde 2 e rosa 1.\nO `most_common(1)` devolve só o mais comum, como uma lista com um par (item, quantidade).\nO `c["rosa"]` consulta a contagem de uma cor: 1.', P),
  'py-4-13': mo(R`nome, valor = 'mouse', 5.5
print(f'[{nome:<7}]')
print(f'[{valor:>7.2f}]')`, Q.out, '[mouse  ]\n[   5.50]', ['[  mouse]\n[   5.50]', '[mouse  ]\n[5.50   ]', '[mouse]\n[5.5]'],
    'O `:<7` reserva 7 espaços e alinha o texto à esquerda: `mouse` e mais 2 espaços.\nO `:>7.2f` reserva 7 espaços, alinha o número à direita e mostra 2 casas decimais: 5.50 com 3 espaços antes.\nOs colchetes mostram onde começa e onde termina cada campo.', P),
  'py-4-14': mo(R`import re
t = 'ref 12, ref 345 e ref 6'
print(re.findall(r'\d+', t))
print(len(re.findall(r'ref \d{2,}', t)))`, Q.out, "['12', '345', '6']\n2", ["['12', '345']\n2", "['12', '345', '6']\n3", "['1', '2', '3', '4', '5', '6']\n2"],
    'O `\\d+` pega sequências de um ou mais dígitos: 12, 345 e 6 (sempre como texto).\nO `\\d{2,}` exige dois ou mais dígitos seguidos, e por isso "ref 6" não combina. Sobram "ref 12" e "ref 345": dois resultados.\nO `len` conta quantos itens a lista tem.', P),
  'py-4-15': mo(R`import re
linha = 'ana:30'
m = re.match(r'(\w+):(\d+)', linha)
print(m.group(2), m.group(1))
print(re.sub(r'\d', '#', 'cod 123'))`, Q.out, '30 ana\ncod ###', ['ana 30\ncod ###', '30 ana\ncod #', '30 ana\ncod 123'],
    'Cada parênteses vira um grupo: o grupo 1 é `ana` (letras) e o grupo 2 é `30` (dígitos).\nO `print` mostra primeiro o grupo 2 e depois o 1: 30 ana.\nO `re.sub` troca cada dígito por `#`: "cod 123" vira "cod ###".', P),
  'py-4-16': mo(R`from datetime import datetime, timedelta
d = datetime(2025, 1, 31, 8, 30)
print((d + timedelta(days=1)).strftime('%d/%m'))
print((datetime(2025, 3, 1) - datetime(2025, 2, 1)).days)`, Q.out, '01/02\n28', ['32/01\n28', '01/02\n31', '31/01\n28'],
    'Somar 1 dia a 31 de janeiro dá 1º de fevereiro. O `%d/%m` mostra dia e mês: 01/02.\nSubtrair duas datas dá um timedelta, e o `.days` conta os dias. De 1º de fevereiro a 1º de março de 2025 são 28 dias (fevereiro tem 28).', P),
  'py-4-17': mo(R`agora = 1000000
modificado = 1000000 - 5 * 86400
dias = (agora - modificado) / 86400
if dias > 3:
    print('apagar')
else:
    print('manter')
print(dias)`, Q.out, 'apagar\n5.0', ['manter\n5.0', 'apagar\n5', 'apagar\n432000.0'],
    'Um dia tem 86400 segundos. O arquivo foi alterado 5 dias (5 * 86400 segundos) antes do "agora".\nA divisão `/ 86400` devolve os dias: 5.0 (a divisão com `/` sempre dá número com ponto).\nComo 5.0 é maior que 3, o `if` escolhe apagar.', P),
  'py-4-18': mo(R`import hashlib
a = hashlib.sha256(b'ola').hexdigest()
b = hashlib.sha256(b'ola').hexdigest()
c = hashlib.sha256(b'Ola').hexdigest()
print(a == b, a == c, len(a))`, Q.out, 'True False 64', ['True True 64', 'False False 64', 'True False 32'],
    'O mesmo conteúdo (`ola`) sempre gera o mesmo hash, então a == b é True.\nUma letra diferente (`Ola` com O maiúsculo) muda o hash por completo, então a == c é False.\nO sha256 sempre gera 64 caracteres em hexadecimal.', P),
  'py-4-19': mo(R`import zipfile
with zipfile.ZipFile('z.zip', 'w') as z:
    z.writestr('a.txt', 'um')
    z.writestr('pasta/b.txt', 'dois')
with zipfile.ZipFile('z.zip') as z:
    print(z.namelist())
    print(z.read('pasta/b.txt'))`, Q.out, "['a.txt', 'pasta/b.txt']\nb'dois'", ["['a.txt', 'b.txt']\nb'dois'", "['a.txt', 'pasta/b.txt']\ndois", "['pasta/b.txt', 'a.txt']\nb'dois'"],
    'O `writestr` grava um texto direto dentro do zip, com o nome que você escolher (`pasta/b.txt` inclui a pasta).\nO `namelist()` mostra os nomes na ordem em que foram gravados.\nO `read()` devolve o conteúdo em bytes, e por isso aparece com b na frente: b\'dois\'.', P),
  'py-4-20': mo(R`a = {'x.txt': 'v1', 'y.txt': 'v2'}
b = {'x.txt': 'v1', 'y.txt': 'v1'}
copiar = [n for n in a if n not in b or a[n] != b[n]]
print(copiar)`, Q.out, "['y.txt']", ["['x.txt']", "['x.txt', 'y.txt']", '[]'],
    'O dicionário `a` é a origem e o `b` é o backup. A lista pega o nome quando ele não está no backup ou quando o conteúdo é diferente.\nO x.txt existe nos dois com o mesmo conteúdo (v1), então fica de fora.\nO y.txt tem v2 na origem e v1 no backup: mudou, então precisa ser copiado.', P),
  'py-4-21': mo(R`from string import Template
t = Template('Preco: R$$ $valor ($pct%)')
print(t.substitute(valor=10, pct=5))
print(t.safe_substitute(valor=10))`, Q.out, 'Preco: R$ 10 (5%)\nPreco: R$ 10 ($pct%)', ['Preco: R$$ 10 (5%)\nPreco: R$ 10 ($pct%)', 'Preco: R$ 10 (5%)\nErro', 'Preco: R$ 10 (5%)\nPreco: R$ 10 (5%)'],
    'O `$$` escreve um cifrão de verdade. O `$valor` e o `$pct` são trocados pelos valores que você mandou.\nO `safe_substitute` não reclama quando falta um valor: ele deixa o `$pct` como está, em vez de dar erro.\nO `substitute` exige todos os valores, e aqui eles foram dados.', P),
  'py-4-22': mo(R`from email.message import EmailMessage
m = EmailMessage()
m['Subject'] = 'Oi'
m.set_content('Texto')
print(m['Subject'], m['Cc'])
print(m.get_content().strip())
print(m.is_multipart())`, Q.out, 'Oi None\nTexto\nFalse', ['Oi\nTexto\nFalse', 'Oi None\nTexto\nTrue', 'Oi Cc\nTexto\nFalse'],
    'O assunto foi preenchido e o `Cc` não: pedir um cabeçalho que não existe devolve `None` (não dá erro).\nO `get_content()` devolve o texto do corpo (`strip()` tira a quebra de linha do final).\nSem anexos, a mensagem é de uma parte só, então `is_multipart()` é False.', P),
  'py-4-23': mo(R`import smtplib
try:
    with smtplib.SMTP('smtp.exemplo.com', 587) as s:
        s.starttls()
        s.login('robo@exemplo.com', 'errada')
        print('entrou')
except smtplib.SMTPAuthenticationError:
    print('senha recusada')
print('fim')`, Q.out, 'senha recusada\nfim', ['entrou\nfim', 'senha recusada', 'entrou\nsenha recusada\nfim'],
    'O servidor recusa a senha errada, e o `login` levanta um erro (SMTPAuthenticationError).\nAs linhas seguintes do `with` não rodam, então o `entrou` nunca aparece.\nO `except` captura o erro e imprime a mensagem. Depois o programa segue normalmente até o `fim`.', P),
  'py-4-24': mo(R`import logging, sys
logging.basicConfig(level=logging.WARNING, format='%(levelname)s:%(message)s', stream=sys.stdout)
logging.info('a')
logging.warning('b')
logging.error('c')`, Q.out, 'WARNING:b\nERROR:c', ['INFO:a\nWARNING:b\nERROR:c', 'WARNING:b', 'b\nc'],
    'O `level=WARNING` diz: só mostre WARNING ou mais grave. A mensagem de nível INFO (`a`) fica de fora.\nO `format` escreve o nível, dois-pontos e a mensagem.\nSobram as duas mensagens mais graves: WARNING:b e ERROR:c.', P),
  'py-4-25': mo(R`import time
for i in range(3):
    try:
        if i < 2:
            raise ValueError('x')
        print('ok na tentativa', i + 1)
        break
    except ValueError:
        print('falhou', i + 1)
        time.sleep(1)`, Q.out, 'falhou 1\nfalhou 2\nok na tentativa 3', ['falhou 1\nok na tentativa 2', 'ok na tentativa 1', 'falhou 1\nfalhou 2\nfalhou 3'],
    'Nas voltas 0 e 1 (`i < 2`) o código levanta um erro, e o `except` imprime falhou 1 e falhou 2 (i + 1) e espera um segundo.\nNa volta 2 não há erro: imprime a tentativa de sucesso, que é a número 3.\nO `break` encerra o laço, então não há uma quarta volta.', P),
  'py-4-26': mo(R`import json
texto = '{"moeda": "USD", "valor": 5.2, "ok": true}'
dados = json.loads(texto)
print(dados['valor'] * 2)
print(type(dados['ok']).__name__)`, Q.out, '10.4\nbool', ['5.25.2\nstr', '10.4\nstr', '10\nbool'],
    'O `json.loads` transforma o texto JSON em dicionário. É o que o `resposta.json()` do requests faz por você.\nO valor 5.2 vira número, então `* 2` dá 10.4.\nO `true` do JSON vira o `True` do Python, que é do tipo bool.', P),
  'py-4-27': mo(R`paginas = {1: {'itens': ['a', 'b'], 'proxima': 2}, 2: {'itens': ['c'], 'proxima': None}}
pagina, todos = 1, []
while pagina:
    dados = paginas[pagina]
    todos += dados['itens']
    pagina = dados['proxima']
print(todos)`, Q.out, "['a', 'b', 'c']", ["['a', 'b']", "['c']", "[['a', 'b'], ['c']]"],
    'O laço começa na página 1 e junta os itens (`+=` soma listas). Depois `pagina` vira o número da próxima: 2.\nNa página 2, junta o `c` e a próxima é `None`.\nO `None` é falso, então o `while` termina. A lista final tem tudo, em ordem.', P),
  'py-4-28': mo(R`from html.parser import HTMLParser
class P(HTMLParser):
    def handle_starttag(self, tag, attrs):
        print(tag, dict(attrs).get('id'))
P().feed('<div id="topo"><b>oi</b></div>')`, Q.out, 'div topo\nb None', ['div topo', 'div topo\nb oi', 'div topo\nb topo'],
    'O `handle_starttag` roda uma vez para cada tag que abre: primeiro o `div` e depois o `b`. As tags de fechamento não passam por ele.\nO `attrs` chega como lista de pares, e o `dict(attrs)` transforma em dicionário.\nO `div` tem id topo. O `b` não tem id, então o `.get("id")` devolve None.', P),
  'py-4-29': mo(R`import argparse
ap = argparse.ArgumentParser()
ap.add_argument('nome')
ap.add_argument('--vezes', type=int, default=1)
ap.add_argument('--alto', action='store_true')
a = ap.parse_args(['ana', '--alto'])
print(a.nome, a.vezes, a.alto)`, Q.out, 'ana 1 True', ['ana 1 False', 'ana 0 True', 'ana None True'],
    'O `ana` vai para o argumento posicional `nome`.\nO `--vezes` não apareceu na lista, então fica com o padrão (default): 1.\nO `--alto` com `store_true` vale True quando aparece na lista, e False quando não aparece. Ele apareceu: True.', P),
  'py-4-30': mo(R`import sched, time
t0 = time.time()
ag = sched.scheduler(time.time, time.sleep)
for nome, atraso in [('c', 30), ('a', 10), ('b', 20)]:
    ag.enter(atraso, 1, print, (nome,))
ag.run()
print(int(time.time() - t0))`, Q.out, 'a\nb\nc\n30', ['c\na\nb\n30', 'a\nb\nc\n60', 'a\nb\nc\n10'],
    'O agendador executa as tarefas na ordem do horário e não na ordem em que foram marcadas: a (10 s), b (20 s) e c (30 s).\nAs esperas não se somam: todas contam a partir do mesmo começo.\nQuando a última roda, passaram 30 segundos, e é isso que o último `print` mostra.', P)
};
