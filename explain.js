// Correção da 3ª atividade da lição (Python/SQL, níveis Intermediário e Avançado): EXPLICAR o código com as próprias palavras.
// Texto livre não dá para corrigir letra por letra, então o servidor confere CONCEITOS: cada item tem 2 ou 3 "grupos", cada grupo é uma ideia que a explicação precisa ter
// (por exemplo "ordena do maior para o menor") escrita como várias raízes de palavras que dizem a mesma coisa. Passa quem cobre os grupos pedidos.
// É um corretor honesto, mas não perfeito: pode recusar uma explicação certa escrita de um jeito muito diferente (por isso mostra o que faltou e, depois de 3 tentativas,
// uma explicação de exemplo) e pode aceitar quem só empilhar palavras. Nada é gasto por errar. O mesmo arquivo é usado pelo servidor e por `npm run check:explicar`.
//
// Formato de um grupo (texto):  '!rótulo :: raiz1|raiz2|raiz3'
//   • rótulo: o que ainda falta explicar, escrito como pista ("o que ele faz com a lista") sem entregar a resposta; começa com ! se o grupo é obrigatório
//   • raiz: início de palavra, sem acento nem maiúscula ("ordena" vale para ordena, ordenar, ordenada…); termina com $ se tem de ser a palavra inteira ("50$"); pode ter
//     mais de uma palavra ("do maior")
const MINW = 4, MAXC = 600;
const plain = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = s => plain(s).replace(/[^a-z0-9_]+/g, ' ').trim();

function compile(raw) {                          // transforma o item escrito à mão no item que o servidor usa (grupos já separados e normalizados)
  const groups = (raw.groups || []).map(g => {
    const [head, tail] = String(g).split('::'), req = /^\s*!/.test(head), label = head.replace(/^\s*!/, '').trim();
    const stems = String(tail || '').split('|').map(x => x.trim()).filter(Boolean).map(x => ({ w: words(x.replace(/\$$/, '')), whole: /\$$/.test(x) })).filter(x => x.w);
    return { label, req, stems };
  });
  const n = groups.length, need = raw.need ?? (n <= 2 ? n : n - 1);
  return { ...raw, groups, need };
}
const hit = (t, g) => g.stems.some(s => s.whole ? t.includes(' ' + s.w + ' ') : t.includes(' ' + s.w));

// responde { ok, short?, copy?, miss: [rótulos do que falta], got, total }
function grade(item, answer) {
  const text = String(answer ?? '').slice(0, MAXC), t = ' ' + words(text) + ' ', ws = t.trim() ? t.trim().split(' ') : [];
  const total = item.groups.length;
  if (ws.length < MINW) return { ok: false, short: true, got: 0, total, miss: [] };
  const code = new Set(words(item.code || '').split(' ').filter(Boolean));
  if (ws.length >= 3 && ws.filter(w => code.has(w)).length / ws.length >= 0.85) return { ok: false, copy: true, got: 0, total, miss: [] };      // copiou o próprio código
  const ok = item.groups.map(g => hit(t, g)), got = ok.filter(Boolean).length;
  const pass = got >= item.need && item.groups.every((g, i) => !g.req || ok[i]);
  const lack = item.groups.filter((g, i) => !ok[i]).sort((a, b) => b.req - a.req);
  return { ok: pass, got, total, miss: pass ? [] : lack.slice(0, 2).map(g => g.label) };
}
module.exports = { compile, grade, words, MINW, MAXC };
