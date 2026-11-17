// PYTHON — AUTOMAÇÕES, lições 11 a 20: JSON, relatórios, regex, datas, duplicados, zip e backup
const R = String.raw;
module.exports = (L, F) => [
  L('JSON e configurações', 'JSON guarda dicionários e listas num arquivo: json.load lê e json.dump grava (indent=2 deixa bonito). Senhas e modos de uso ficam melhor em variáveis de ambiente: os.environ.get("NOME", padrao) lê sem dar erro se faltar.',
    R`import json
with open('config.json') as f:
    cfg = json.load(f)
cfg['limite'] = 5
with open('config.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print(open('config.json').read())`,
    'Leia config.json, troque o valor de dias para 30, grave de volta com indent=2 e imprima o dicionário. Depois imprima o valor da variável de ambiente MODO e, embaixo, o valor de SENHA_ENVIO com o padrão nao definida.',
    R`import json, os
with open('config.json') as f:
    cfg = json.load(f)
cfg['dias'] = 30
with open('config.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print(cfg)
print(os.environ.get('MODO'))
print(os.environ.get('SENHA_ENVIO', 'nao definida'))`, ['json.load(', 'json.dump(', 'environ'], 'cfg = json.load(f)',
    F({ 'config.json': '{"loja": "Loja do Ze", "limite": 3, "dias": 7, "ativo": false}' }, { env: { MODO: 'producao' } }), ),

  L('Somar e agrupar', 'Para totalizar por grupo, use um dicionário: totais[chave] = totais.get(chave, 0) + valor. Depois sorted(..., key=..., reverse=True) coloca o maior primeiro.',
    R`import csv
totais = {}
with open('vendas.csv', newline='') as f:
    for l in csv.DictReader(f):
        totais[l['loja']] = totais.get(l['loja'], 0) + int(l['valor'])
print(totais)`,
    'O arquivo pedidos.csv tem as colunas cliente, produto e valor. Some o valor de cada cliente e imprima o ranking, do maior para o menor, no formato cliente: total. Na última linha, imprima: Maior cliente: ana (com o nome certo).',
    R`import csv
totais = {}
with open('pedidos.csv', newline='') as f:
    for l in csv.DictReader(f):
        totais[l['cliente']] = totais.get(l['cliente'], 0) + int(l['valor'])
ranking = sorted(totais.items(), key=lambda x: x[1], reverse=True)
for cliente, total in ranking:
    print(f'{cliente}: {total}')
print('Maior cliente:', ranking[0][0])`, ['csv', 'sorted(', 'reverse'], 'ranking = sorted(totais.items(), key=lambda x: x[1], reverse=True)',
    F({ 'vendas.csv': 'produto,loja,valor\nmouse,centro,80\nteclado,centro,150\nmouse,norte,80\ncabo,norte,12\n', 'pedidos.csv': 'cliente,produto,valor\nana,mouse,80\nbia,teclado,150\nana,monitor,900\ncaio,cabo,12\nbia,mouse,80\nana,cabo,12\n' })),

  L('Relatórios formatados', 'Em f-strings dá para alinhar: {nome:<10} deixa o texto à esquerda em 10 espaços e {valor:>9.2f} alinha à direita com 2 casas. Monte as linhas numa lista e grave com "\\n".join(linhas).',
    R`itens = [('mouse', 3, 80.0), ('teclado', 2, 150.5)]
linhas = []
for nome, qtd, preco in itens:
    linhas.append(f'{nome:<10}{qtd:>3}{preco:>9.2f}')
with open('relatorio.txt', 'w') as f:
    f.write('\n'.join(linhas) + '\n')
print(open('relatorio.txt').read())`,
    'Leia vendas.csv (produto, qtd, preco) e grave relatorio.txt: uma linha por produto no formato nome com 10 espaços à esquerda, qtd com 4 à direita e total (qtd vezes preco) com 10 à direita e 2 casas. Na última linha, a palavra TOTAL com 14 espaços à esquerda e a soma com 10 à direita e 2 casas. Depois imprima o arquivo.',
    R`import csv
linhas = []
soma = 0
with open('vendas.csv', newline='') as f:
    for l in csv.DictReader(f):
        qtd, preco = int(l['qtd']), float(l['preco'])
        total = qtd * preco
        soma += total
        linhas.append(f"{l['produto']:<10}{qtd:>4}{total:>10.2f}")
linhas.append(f'{"TOTAL":<14}{soma:>10.2f}')
with open('relatorio.txt', 'w') as f:
    f.write('\n'.join(linhas) + '\n')
print(open('relatorio.txt').read())`, ['join(', '.2f'], "f'{nome:<10}{qtd:>4}{total:>10.2f}'",
    F({ 'vendas.csv': 'produto,qtd,preco\nmouse,3,80\nteclado,2,150\nmonitor,1,900\n' })),

  L('Regex: procurar padrões', 'O módulo re procura padrões em textos. re.findall(padrao, texto) devolve tudo o que combina. \\d é um dígito, + quer dizer "um ou mais", {2} quer dizer "exatamente 2" e [\\w.]+ é "letras, números, _ e ponto".',
    R`import re
texto = 'Pedido 123 pago, pedido 45 pendente, pedido 6789 pago'
print(re.findall(r'\d+', texto))
print(re.findall(r'pedido \d+ pago', texto, re.IGNORECASE))`,
    'O arquivo contatos.txt mistura nomes, e-mails e telefones. Com re.findall, imprima a lista de e-mails (padrão [\\w.]+@[\\w.]+) e, embaixo, a lista de telefones no formato 11-99999-1111 (padrão \\d{2}-\\d{5}-\\d{4}).',
    R`import re
with open('contatos.txt') as f:
    texto = f.read()
print(re.findall(r'[\w.]+@[\w.]+', texto))
print(re.findall(r'\d{2}-\d{5}-\d{4}', texto))`, ['re.findall(', 'import re'], "re.findall(r'[\\w.]+@[\\w.]+', texto)",
    F({ 'contatos.txt': 'Ana - ana@exemplo.com - 11-99999-1111\nBia - bia.souza@loja.com.br - 21-98888-2222\nCaio sem contato\nDavi - davi@teste.org - 31-97777-3333\n' })),

  L('Regex: grupos e limpeza', 're.match(padrao, texto) guarda cada parte entre parênteses num grupo: m.group(1), m.group(2)... É assim que uma linha de log vira dado. re.sub(padrao, novo, texto) troca tudo o que combina.',
    R`import re
linha = '2025-03-14 09:30:05 ERRO disco cheio'
m = re.match(r'(\S+) (\S+) (\w+) (.*)', linha)
print(m.groups())
print(re.sub(r'\s+', ' ', '  muito    espaco  aqui  ').strip())`,
    'Cada linha de acesso.log tem: data hora usuario acao. Com re.match e grupos, guarde cada linha como um dicionário com hora, usuario e acao. Depois imprima, uma por linha, a hora e a acao da usuária ana (formato 09:01 login) e, no final: Eventos de ana: 3 (com o número certo).',
    R`import re
eventos = []
with open('acesso.log') as f:
    for linha in f:
        m = re.match(r'(\S+) (\S+) (\w+) (\w+)', linha.strip())
        eventos.append({'hora': m.group(2), 'usuario': m.group(3), 'acao': m.group(4)})
ana = [e for e in eventos if e['usuario'] == 'ana']
for e in ana:
    print(e['hora'], e['acao'])
print('Eventos de ana:', len(ana))`, ['re.match(', 'group('], "m = re.match(r'(\\S+) (\\S+) (\\w+) (\\w+)', linha.strip())",
    F({ 'acesso.log': '14/03/2025 09:01 ana login\n14/03/2025 09:05 bia login\n14/03/2025 09:07 ana download\n14/03/2025 09:20 caio login\n14/03/2025 09:25 ana logout\n' })),

  L('Datas e prazos', 'datetime guarda data e hora e timedelta é um intervalo (dias, horas). strftime escreve a data como texto e strptime faz o contrário. Neste computador de treino, o "agora" é sempre 14/03/2025, 09:00, para o resultado ser igual para todo mundo.',
    R`from datetime import datetime, timedelta
agora = datetime.now()
print(agora.strftime('%d/%m/%Y %H:%M'))
vence = agora + timedelta(days=30)
print(vence.strftime('%d/%m/%Y'))`,
    'Faltam quantos dias de agora até 10/04/2025? Use strptime com o formato %d/%m/%Y e a subtração (os dias ficam em .days) e imprima: Faltam 26 dias (com o número certo). Na linha de baixo, imprima a data daqui a 7 dias no formato 21/03/2025.',
    R`from datetime import datetime, timedelta
agora = datetime.now()
prazo = datetime.strptime('10/04/2025', '%d/%m/%Y')
print(f'Faltam {(prazo - agora).days} dias')
print((agora + timedelta(days=7)).strftime('%d/%m/%Y'))`, ['strptime(', 'timedelta', 'strftime('], "prazo = datetime.strptime('10/04/2025', '%d/%m/%Y')",
    F({})),

  L('Arquivos velhos', 'Todo arquivo guarda o momento da última alteração: stat().st_mtime, em segundos. time.time() é o agora. Dividindo a diferença por 86400 (segundos de um dia) você sabe há quantos dias o arquivo está parado.',
    R`import time
from pathlib import Path
for p in sorted(Path('logs').glob('*.log')):
    idade = (time.time() - p.stat().st_mtime) / 86400
    print(p.name, round(idade))`,
    'Na pasta logs, apague os arquivos .log parados há mais de 30 dias. Guarde os nomes apagados numa lista e imprima: Apagados: [...]. Embaixo, imprima: Restaram: [...] com os nomes que sobraram na pasta, em ordem.',
    R`import time
from pathlib import Path
apagados = []
for p in sorted(Path('logs').glob('*.log')):
    idade = (time.time() - p.stat().st_mtime) / 86400
    if idade > 30:
        p.unlink()
        apagados.append(p.name)
print('Apagados:', apagados)
print('Restaram:', sorted(x.name for x in Path('logs').iterdir()))`, ['st_mtime', 'unlink(', 'time.time('], 'idade = (time.time() - p.stat().st_mtime) / 86400',
    F({ 'logs/hoje.log': 'a', 'logs/semana.log': 'b', 'logs/velho1.log': 'c', 'logs/velho2.log': 'd' }, { dias: { 'logs/semana.log': 3, 'logs/velho1.log': 45, 'logs/velho2.log': 90 } })),

  L('Achar duplicados', 'Dois arquivos com o mesmo conteúdo têm o mesmo hash. hashlib.sha256(bytes).hexdigest() gera uma "impressão digital" do conteúdo, e serve para achar duplicados mesmo quando os nomes são diferentes.',
    R`import hashlib
from pathlib import Path
for p in sorted(Path('.').glob('*.txt')):
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    print(p.name, h[:8])`,
    'Na pasta fotos, descubra quais arquivos têm o mesmo conteúdo. Agrupe os nomes pelo hash (sha256 dos bytes, na ordem alfabética dos nomes). Para cada grupo com mais de um nome, imprima os nomes ligados por " = " (por exemplo a.jpg = c.jpg). No final, imprima: Grupos de duplicados: 2 (com o número certo).',
    R`import hashlib
from pathlib import Path
grupos = {}
for p in sorted(Path('fotos').iterdir()):
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    grupos.setdefault(h, []).append(p.name)
n = 0
for nomes in grupos.values():
    if len(nomes) > 1:
        print(' = '.join(nomes))
        n += 1
print(f'Grupos de duplicados: {n}')`, ['hashlib', 'hexdigest('], 'h = hashlib.sha256(p.read_bytes()).hexdigest()',
    F({ 'a.txt': 'ola', 'b.txt': 'ola', 'c.txt': 'tchau', 'fotos/a.jpg': 'AAA', 'fotos/b.jpg': 'BBB', 'fotos/c.jpg': 'AAA', 'fotos/d.jpg': 'CCC', 'fotos/e.jpg': 'BBB' })),

  L('Compactar em zip', 'zipfile.ZipFile("nome.zip", "w") cria o arquivo compactado; write(arquivo) coloca coisas nele e namelist() lista o conteúdo. extractall(pasta) faz o caminho de volta. Ótimo para guardar ou enviar vários arquivos de uma vez.',
    R`import zipfile
with zipfile.ZipFile('docs.zip', 'w') as z:
    z.write('a.txt')
    z.write('b.txt')
with zipfile.ZipFile('docs.zip') as z:
    print(z.namelist())`,
    'Coloque todos os .txt da pasta relatorios (em ordem) dentro de relatorios.zip, usando só o nome do arquivo dentro do zip (write(p, arcname=p.name)). Depois abra o zip, imprima namelist(), extraia tudo para a pasta restaurado e imprima a lista ordenada dos nomes dessa pasta.',
    R`import zipfile
from pathlib import Path
with zipfile.ZipFile('relatorios.zip', 'w') as z:
    for p in sorted(Path('relatorios').glob('*.txt')):
        z.write(p, arcname=p.name)
with zipfile.ZipFile('relatorios.zip') as z:
    print(z.namelist())
    z.extractall('restaurado')
print(sorted(x.name for x in Path('restaurado').iterdir()))`, ['zipfile', 'extractall('], "z.write(p, arcname=p.name)",
    F({ 'a.txt': 'primeiro', 'b.txt': 'segundo', 'relatorios/jan.txt': 'janeiro', 'relatorios/fev.txt': 'fevereiro', 'relatorios/mar.txt': 'marco', 'relatorios/lixo.tmp': 'x' })),

  L('Backup que só copia o que mudou', 'Um backup bom só copia o que mudou. Compare o conteúdo do arquivo de origem com o do destino: se o destino não existe ou é diferente, copie com shutil.copy. Assim o backup roda rápido mesmo com milhares de arquivos.',
    R`import shutil
from pathlib import Path
for p in sorted(Path('origem').iterdir()):
    destino = Path('backup') / p.name
    if not destino.exists():
        shutil.copy(p, destino)
        print('copiado', p.name)`,
    'Para cada arquivo da pasta origem (em ordem), compare com o arquivo de mesmo nome da pasta backup. Se existir e tiver o mesmo conteúdo, imprima igual NOME. Senão, copie para backup e imprima copiado NOME. No final, imprima: Resumo: 3 copiados, 1 iguais (com os números certos).',
    R`import shutil
from pathlib import Path
copiados = iguais = 0
for p in sorted(Path('origem').iterdir()):
    destino = Path('backup') / p.name
    if destino.exists() and destino.read_bytes() == p.read_bytes():
        print('igual', p.name)
        iguais += 1
    else:
        shutil.copy(p, destino)
        print('copiado', p.name)
        copiados += 1
print(f'Resumo: {copiados} copiados, {iguais} iguais')`, ['shutil.copy', 'exists('], 'if destino.exists() and destino.read_bytes() == p.read_bytes():',
    F({ 'origem/a.txt': 'v1', 'origem/b.txt': 'novo', 'backup/a.txt': 'v1', 'origem/c.txt': 'conteudo C', 'origem/d.txt': 'D', 'backup/d.txt': 'D antigo' }))
];
