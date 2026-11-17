// PYTHON — AUTOMAÇÕES, lições 1 a 10: arquivos, pastas e CSV
const R = String.raw;
module.exports = (L, F) => [
  L('Ler um arquivo de texto', 'Para o programa ler um arquivo, abra com open() dentro de um with: o with fecha o arquivo sozinho no final. O método read() devolve o texto inteiro.',
    R`with open('recado.txt') as f:
    texto = f.read()
print(texto)
print(len(texto))`,
    'O arquivo tarefas.txt tem uma tarefa por linha. Abra o arquivo com with, leia tudo com read() e imprima quantas linhas ele tem (use splitlines()). Na linha de baixo, imprima a primeira tarefa.',
    R`with open('tarefas.txt') as f:
    linhas = f.read().splitlines()
print(len(linhas))
print(linhas[0])`, ['with', 'open(', 'read('], "with open('tarefas.txt') as f:",
    F({ 'recado.txt': 'Reuniao as 10h\nTrazer o relatorio\n', 'tarefas.txt': 'Enviar relatorio\nResponder emails\nAtualizar planilha\nFazer backup\n' })),

  L('Ler linha por linha', 'Um arquivo aberto pode ser percorrido com for: a cada volta você recebe uma linha, que termina com a quebra de linha. Use strip() para tirar essa quebra antes de usar o texto.',
    R`with open('agenda.txt') as f:
    for linha in f:
        linha = linha.strip()
        if 'reuniao' in linha:
            print(linha)`,
    'O arquivo sistema.log tem uma mensagem por linha. Percorra o arquivo com for e imprima só as linhas que começam com ERRO (sem a quebra de linha). No final, imprima: Total de erros: 2 (com o número certo).',
    R`total = 0
with open('sistema.log') as f:
    for linha in f:
        linha = linha.strip()
        if linha.startswith('ERRO'):
            print(linha)
            total += 1
print(f'Total de erros: {total}')`, ['for ', 'open(', 'strip('], 'for linha in f:',
    F({ 'agenda.txt': '09:00 reuniao\n12:00 almoco\n15:00 reuniao\n18:00 academia\n', 'sistema.log': 'INFO inicio\nERRO disco cheio\nINFO copia ok\nERRO sem rede\nINFO fim\n' })),

  L('Escrever um arquivo', 'O modo "w" cria o arquivo (ou apaga o que havia nele) e deixa você escrever com write(). O write() não coloca a quebra de linha sozinho: você escreve o \\n.',
    R`itens = ['pao', 'leite']
with open('compras.txt', 'w') as f:
    for item in itens:
        f.write(item + '\n')
with open('compras.txt') as f:
    print(f.read())`,
    'A lista produtos já existe: ["mouse", "teclado", "monitor"]. Grave cada produto numa linha do arquivo estoque.txt (modo "w"). Depois leia o arquivo e imprima o conteúdo.',
    R`with open('estoque.txt', 'w') as f:
    for p in produtos:
        f.write(p + '\n')
with open('estoque.txt') as f:
    print(f.read())`, ['open(', 'write('], "f.write(p + '\\n')",
    F({}, { depois: "produtos = ['mouse', 'teclado', 'monitor']" })),

  L('Acrescentar ao arquivo', 'O modo "a" (append) escreve no final, sem apagar o que já existe. Já o "w" apaga tudo antes de escrever: cuidado, é fácil perder dados.',
    R`with open('presenca.txt', 'a') as f:
    f.write('caio\n')
with open('presenca.txt') as f:
    print(f.read().split())`,
    'O arquivo diario.txt já tem 2 linhas. Acrescente no final a linha: Dia 3: aprendi a acrescentar (com a quebra de linha). Depois leia o arquivo e imprima quantas linhas ele tem e, embaixo, a última linha.',
    R`with open('diario.txt', 'a') as f:
    f.write('Dia 3: aprendi a acrescentar\n')
with open('diario.txt') as f:
    linhas = f.read().splitlines()
print(len(linhas))
print(linhas[-1])`, ['open(', 'write('], "open('diario.txt', 'a')",
    F({ 'presenca.txt': 'ana\nbia\n', 'diario.txt': 'Dia 1: comecei o curso\nDia 2: aprendi a ler arquivos\n' })),

  L('Caminhos com Path', 'O Path representa o endereço de um arquivo ou pasta. A barra / junta as partes e name, stem, suffix e parent separam o nome, o nome sem extensão, a extensão e a pasta. exists() diz se o arquivo existe.',
    R`from pathlib import Path
p = Path('relatorios') / '2025' / 'vendas.csv'
print(p)
print(p.name, p.suffix)
print(p.parent)
print(p.exists())`,
    'Monte o caminho Path("contratos") / "2024" / "cliente_a.pdf" e imprima, uma por linha: o name, o stem, o suffix, o parent e o resultado de exists().',
    R`from pathlib import Path
p = Path('contratos') / '2024' / 'cliente_a.pdf'
print(p.name)
print(p.stem)
print(p.suffix)
print(p.parent)
print(p.exists())`, ['path(', 'stem', 'suffix', 'parent'], "p = Path('contratos') / '2024' / 'cliente_a.pdf'",
    F({ 'relatorios/2025/vendas.csv': 'produto,qtd\nmouse,3\n', 'contratos/2024/cliente_a.pdf': 'pdf', 'contratos/2024/cliente_b.pdf': 'pdf' })),

  L('Listar e filtrar arquivos', 'iterdir() lista o que há numa pasta e glob("*.csv") traz só o que combina com o padrão. A ordem não é garantida: use sorted() para o resultado ser sempre o mesmo.',
    R`from pathlib import Path
for arq in sorted(Path('dados').glob('*.csv')):
    print(arq.name)`,
    'A pasta fotos tem vários arquivos. Liste só os .jpg, em ordem (um nome por linha, sem a pasta). No final, imprima: Total: 3 (com o número certo).',
    R`from pathlib import Path
fotos = sorted(Path('fotos').glob('*.jpg'))
for f in fotos:
    print(f.name)
print(f'Total: {len(fotos)}')`, ['glob(', 'sorted('], "sorted(Path('fotos').glob('*.jpg'))",
    F({ 'dados/janeiro.csv': 'a', 'dados/fevereiro.csv': 'b', 'dados/leia-me.txt': 'c', 'fotos/ferias2.jpg': '1', 'fotos/ferias1.jpg': '2', 'fotos/notas.txt': '3', 'fotos/logo.png': '4', 'fotos/ferias3.jpg': '5' })),

  L('Criar, copiar, mover e apagar', 'mkdir(exist_ok=True) cria a pasta sem dar erro se ela já existir. shutil.copy copia, shutil.move move e unlink() apaga um arquivo. Apagar não tem volta: confira duas vezes.',
    R`from pathlib import Path
import shutil
Path('backup').mkdir(exist_ok=True)
shutil.copy('relatorio.txt', 'backup')
print(sorted(p.name for p in Path('backup').iterdir()))`,
    'Crie a pasta antigos. Mova rascunho.txt para dentro dela e copie final.txt para dentro dela; depois apague o final.txt original. Imprima a lista ordenada de nomes dentro de antigos e, embaixo, a lista ordenada dos arquivos (só arquivos) que sobraram na pasta atual.',
    R`from pathlib import Path
import shutil
Path('antigos').mkdir(exist_ok=True)
shutil.move('rascunho.txt', 'antigos')
shutil.copy('final.txt', 'antigos')
Path('final.txt').unlink()
print(sorted(p.name for p in Path('antigos').iterdir()))
print(sorted(p.name for p in Path('.').iterdir() if p.is_file()))`, ['mkdir(', 'shutil', 'unlink('], "Path('antigos').mkdir(exist_ok=True)",
    F({ 'relatorio.txt': 'vendas do mes', 'rascunho.txt': 'versao 1', 'final.txt': 'versao final', 'leia-me.txt': 'oi' })),

  L('Subpastas e tamanhos', 'rglob("*") entra em todas as subpastas. is_file() separa arquivos de pastas e stat().st_size diz o tamanho em bytes.',
    R`from pathlib import Path
for p in sorted(Path('projeto').rglob('*.txt')):
    print(p, p.stat().st_size)`,
    'A pasta docs tem arquivos e subpastas. Para cada arquivo (não conte as pastas), em ordem, imprima: caminho: N bytes. No final, imprima: Total: N bytes (a soma de todos).',
    R`from pathlib import Path
total = 0
for p in sorted(Path('docs').rglob('*')):
    if p.is_file():
        tam = p.stat().st_size
        print(f'{p}: {tam} bytes')
        total += tam
print(f'Total: {total} bytes')`, ['rglob(', 'st_size'], "for p in sorted(Path('docs').rglob('*')):",
    F({ 'projeto/a.txt': 'abc', 'projeto/src/b.txt': 'hello', 'projeto/src/c.py': 'print(1)', 'docs/relatorio.txt': 'abcdef', 'docs/2024/atas.txt': 'ata de janeiro', 'docs/2024/foto.jpg': 'xx', 'docs/2025/plano.txt': 'plano' })),

  L('Renomear em lote', 'rename() muda o nome de um arquivo. Com um for dá para renomear dezenas de uma vez: monte o nome novo com f-string e use {i:02d} para completar com zeros (01, 02, 03...).',
    R`from pathlib import Path
for i, p in enumerate(sorted(Path('fotos').glob('*.jpg')), 1):
    p.rename(p.with_name(f'viagem_{i:02d}.jpg'))
print(sorted(x.name for x in Path('fotos').iterdir()))`,
    'A pasta notas tem três arquivos .txt com nomes bagunçados. Em ordem alfabética do nome antigo, renomeie para nota_01.txt, nota_02.txt e nota_03.txt (use enumerate e with_name). Imprima a lista ordenada dos nomes novos e, embaixo, o texto dentro de nota_01.txt.',
    R`from pathlib import Path
for i, p in enumerate(sorted(Path('notas').glob('*.txt')), 1):
    p.rename(p.with_name(f'nota_{i:02d}.txt'))
print(sorted(x.name for x in Path('notas').iterdir()))
print(Path('notas/nota_01.txt').read_text())`, ['rename(', 'enumerate('], "p.rename(p.with_name(f'nota_{i:02d}.txt'))",
    F({ 'fotos/img_a.jpg': '1', 'fotos/img_b.jpg': '2', 'fotos/img_c.jpg': '3', 'notas/nota fiscal 7.txt': 'compra de mouse', 'notas/compra janeiro.txt': 'compra de teclado', 'notas/zz final.txt': 'compra de cabo' })),

  L('Ler e escrever CSV', 'O módulo csv lê tabelas: o DictReader entrega cada linha como um dicionário (a 1ª linha do arquivo vira os nomes das colunas) e o DictWriter grava. Abra com newline="" para o csv cuidar das quebras de linha.',
    R`import csv
with open('vendas.csv', newline='') as f:
    for linha in csv.DictReader(f):
        print(linha['produto'], int(linha['qtd']) * int(linha['preco']))`,
    'O arquivo estoque.csv tem as colunas produto, qtd e preco. Leia o arquivo e grave reposicao.csv só com os produtos de qtd menor que 5, com as colunas produto e qtd (e o cabeçalho). No final, leia reposicao.csv e imprima o conteúdo.',
    R`import csv
with open('estoque.csv', newline='') as f:
    baixos = [l for l in csv.DictReader(f) if int(l['qtd']) < 5]
with open('reposicao.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['produto', 'qtd'])
    w.writeheader()
    for l in baixos:
        w.writerow({'produto': l['produto'], 'qtd': l['qtd']})
print(open('reposicao.csv').read())`, ['csv.', 'dictreader', 'dictwriter'], "w = csv.DictWriter(f, fieldnames=['produto', 'qtd'])",
    F({ 'vendas.csv': 'produto,qtd,preco\nmouse,3,80\nteclado,2,150\n', 'estoque.csv': 'produto,qtd,preco\nmouse,10,80\nteclado,0,150\nmonitor,3,900\ncabo,25,12\n' }))
];
