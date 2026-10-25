// Ajudante para escrever as atividades de EXPLICAR o código (3ª atividade das lições do Intermediário e do Avançado de Python e SQL).
// O aluno vê um código e escreve com as palavras dele o que o código FAZ ('faz') ou o que ele TRAZ/MOSTRA como resultado ('traz'). O servidor confere conceitos (veja explain.js).
//   e(código, tipo, grupos, modelo, alternativa, fatos?, opções?)
//     grupos:      lista de textos '!rótulo :: raiz|raiz|raiz'. Cada grupo é uma ideia que a explicação precisa ter. O rótulo é a PISTA mostrada se faltar (sem entregar a resposta);
//                  começar com ! = obrigatório. Raízes: sem acento, minúsculas, início de palavra ('ordena' vale para ordenar/ordenado); 'x$' = a palavra inteira.
//                  Passa quem cobre todos os grupos obrigatórios e pelo menos `need` grupos (padrão: todos se são 2, todos menos 1 se são 3).
//     modelo:      uma boa explicação (aparece depois de acertar e depois de 3 tentativas); `npm run check:explicar` prova que ela passa
//     alternativa: outro jeito, mais curto e com outras palavras, de dizer o mesmo (a conferência prova que também passa: pega raízes que faltam)
//     fatos:       (só 'traz') textos que PRECISAM aparecer no que o código realmente mostra; a conferência roda o código e prova que o modelo diz a verdade
//   opções: { need, q (pergunta própria), seed (SQL com banco próprio) }
const e = (code, kind, groups, model, alt, facts, o = {}) => ({ code, kind, groups, model, alt, ...(facts && facts.length ? { facts } : {}), ...o });
module.exports = { e };
