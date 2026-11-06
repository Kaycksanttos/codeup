// PROVAS DE JAVASCRIPT: 2 checkpoints (depois das lições 10 e 20) e a prova final (depois da 30) de cada nível. Mesmas regras de chances do resto do app (lessons.js).
// cp(título, tarefa, solução, [palavras obrigatórias], [o que é, para que serve, como se faz, retorno esperado], {prelude})   ·   fin(...) igual
const XP = [60, 80, 100];                                      // XP de cada checkpoint (a prova final dá o bônus de 50 x nível, no servidor)
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];

const factory = lv => {
  let k = 0;
  const base = o => { const r = { type: 'js', track: 'js', level: LEVELS[lv - 1], lv, test: true, starter: '// escreva seu código aqui\n' }; if (o.prelude) r.prelude = o.prelude; if (o.peek) r.peek = o.peek; return r; };
  const info = a => ({ oque: a[0], serve: a[1], como: a[2], retorno: a[3] });
  return {
    cp: (title, task, solution, need, inf, o = {}) => { k++; const after = k * 10; return { id: `cp-js-${lv}-${after}`, cp: true, k, after, n: after, xp: XP[lv - 1], title, task, ...base(o), need, solution, info: info(inf) }; },
    fin: (title, task, solution, need, inf, o = {}) => ({ id: `fin-js-${lv}`, fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, ...base(o), need, solution, info: info(inf) })
  };
};

const out = [];

// ---------------------------------------------------------------- Básico
{
  const P = factory(1);
  out.push(
    P.cp('Checkpoint: contas e textos',
      'Crie const produto = "Camiseta", const preco = 40 e let qtd = 3. Some mais 2 unidades com +=. Mostre 3 linhas: (1) o total, que é preco * qtd; (2) o texto Camiseta: 5 unidades, montado juntando textos e variáveis com + (sem template literal); (3) o tipo de qtd, usando typeof.',
      'const produto = "Camiseta";\nconst preco = 40;\nlet qtd = 3;\nqtd += 2;\nconsole.log(preco * qtd);\nconsole.log(produto + ": " + qtd + " unidades");\nconsole.log(typeof qtd);',
      ['const produto', 'const preco', 'let qtd', '+=', '*', 'typeof'],
      [`É a sua primeira provinha de JavaScript! Você vai escrever um programa completo usando o que aprendeu nas lições 1 a 10: console.log, contas, let e const, mudar valores, tipos, conversão e juntar textos.`,
        `Serve para mostrar que você já consegue escrever um programa sozinho, sem um exemplo pronto para copiar.`,
        `Crie as três variáveis, use qtd += 2 para mudar a quantidade e depois use três console.log: a conta, o texto montado com + e o typeof.`,
        `Três linhas: 200, depois Camiseta: 5 unidades e, por fim, number.`]),
    P.cp('Checkpoint: decisões e textos',
      'Crie const nome = "  maria silva  " e const nota = 7.5. Mostre 3 linhas: (1) com template literal, Aluno: MARIA SILVA (o nome sem os espaços das pontas e em maiúsculas); (2) Aprovado se nota >= 7, Recuperacao se nota >= 5 e Reprovado nos outros casos (use if / else if / else); (3) com o operador ternário, Bolsista se nota >= 9 e Regular nos outros casos.',
      'const nome = "  maria silva  ";\nconst nota = 7.5;\nconsole.log(`Aluno: ${nome.trim().toUpperCase()}`);\nif (nota >= 7) {\n  console.log("Aprovado");\n} else if (nota >= 5) {\n  console.log("Recuperacao");\n} else {\n  console.log("Reprovado");\n}\nconsole.log(nota >= 9 ? "Bolsista" : "Regular");',
      ['`', 'trim()', 'touppercase()', 'else if', '?'],
      [`Aqui você junta as lições 11 a 20: template literal, métodos de texto, comparações, if, else if, else e o operador ternário.`,
        `Montar uma frase com dados limpos e tomar decisões com regras é o que quase todo sistema faz: ficha de aluno, pedido, cadastro.`,
        `Limpe o nome com trim() e toUpperCase() dentro de ${'$'}{ } no template. Use if / else if / else para a situação e um ternário para a última linha.`,
        `Três linhas: Aluno: MARIA SILVA, Aprovado e Regular.`]),
    P.fin('Prova final: placar da turma',
      'O array notas guarda as notas da turma. Crie a função classificar(nota), que devolve "Aprovado" se a nota for 7 ou mais e "Reprovado" nos outros casos. Percorra as notas com for...of: mostre uma linha para cada nota no formato Nota 8: Aprovado, some tudo em total e conte quantos foram aprovados. No final, crie o objeto resumo com as chaves total, media (total dividido pela quantidade de notas) e aprovados, e mostre o objeto com console.log.',
      'function classificar(nota) {\n  return nota >= 7 ? "Aprovado" : "Reprovado";\n}\nlet total = 0;\nlet aprovados = 0;\nfor (const nota of notas) {\n  const situacao = classificar(nota);\n  console.log(`Nota ${nota}: ${situacao}`);\n  total += nota;\n  if (situacao === "Aprovado") {\n    aprovados++;\n  }\n}\nconst resumo = { total: total, media: total / notas.length, aprovados: aprovados };\nconsole.log(resumo);',
      ['function classificar', 'return', 'for (', ' of ', 'resumo', 'aprovados', 'length'],
      [`É a PROVA FINAL do nível Básico: um programa completo que usa quase tudo o que você aprendeu: funções, laços, decisões, arrays, contas e objetos.`,
        `É assim que se resume dados de verdade: percorrer uma lista, classificar cada item, acumular totais e entregar um resumo. Passando aqui, você abre o nível Intermediário!`,
        `Escreva a função classificar. Crie total e aprovados em 0 e percorra as notas com for...of: mostre a linha, some a nota e conte os aprovados com um if. Depois monte o objeto resumo.`,
        `Cinco linhas, uma para cada nota (de Nota 8: Aprovado até Nota 10: Aprovado), e uma sexta linha com o objeto: { total: 38, media: 7.6, aprovados: 3 }.`],
      { prelude: 'const notas = [8, 5, 9, 6, 10];', peek: 'console.log(notas);' })
  );
}

module.exports = out;
