// Executor de JavaScript (public/jsrun.js + jsrunner.js + tools/jsrun.js): a saída do console é igual à do Node, o relógio é virtual e os ataques são barrados.
const test = require('node:test'), assert = require('node:assert/strict');
const vm = require('node:vm'), util = require('node:util');
const JSRUN = require('../public/jsrun.js'), jsrunner = require('../jsrunner');

// cada caso é uma expressão; o inspect do Node e o nosso precisam escrever igual (o aluno vê a mesma coisa que veria no Node)
const CASES = [
  '1', '-0', '"abc"', 'null', 'undefined', 'true', '10n', 'Symbol("x")', '[1,2,3]', '[]', '{}', '({a:1,b:"x"})', '({a:{b:{c:{d:1}}}})', '[[1,[2,[3,[4]]]]]',
  '["maca","banana","uva","pera","kiwi","manga","melao","figo"]', 'Array.from({length:30},(_, i)=>i*3)', 'Array.from({length:120},(_, i)=>i)',
  '({a:"x".repeat(30),b:"y".repeat(30),c:"z".repeat(10)})', 'new Map([["a",1],["b",{x:1}]])', 'new Set([1,2,"3"])', 'new Map()', 'new Set()',
  'class A{}', '(class B extends Array{})', 'function f(){}', '()=>1', 'async()=>1', 'function*g(){}',
  '(()=>{class P{constructor(){this.x=1;this.y=[1,2]}}; return new P()})()', '(()=>{class P{constructor(){this.x=1}}; return [new P(), new P()]})()', 'Object.create(null)',
  '[1,,3]', '[undefined,null]', '({"a-b":1,2:3,[Symbol("s")]:4})', 'new Date(0)', '/ab+c/gi', 'new Number(3)', 'new String("hi")',
  '(()=>{const o={a:1}; o.self=o; return o})()', '"it\'s"', '"say \\"hi\\""', '["it\'s"]', '({s:"linha1\\nlinha2"})',
  '[ {nome:"Ana",idade:20,cidade:"Recife"}, {nome:"Bia",idade:25,cidade:"Olinda"}, {nome:"Caio",idade:31,cidade:"Natal"} ]',
  '({ nome: "Ana", notas: [7, 8.5, 10], endereco: { rua: "A", numero: 10, extra: { x: 1 } } })', '[1.5,2.25,-3,1e21,0.1+0.2]', 'Array(5)', '[ "a".repeat(80) ]', '"x".repeat(100)',
  '({a:"x".repeat(100)})', '({get a(){return 1}, set b(v){}, get c(){return 1}, set c(v){}})', '[function foo(){}, class Z{}]', 'Object.assign(()=>1,{x:1})', 'new (class Foo extends Map{})([[1,2]])',
  'Array.from({length:10},(_, i)=>"item"+i)', 'Array.from({length:7},(_, i)=>({id:i}))', 'new Uint8Array([1,2,3])', '[[1,2],[3,4]]', '({a:[{b:1},{c:[1,2,{d:1}]}]})',
  '[0.1, -5, 100000, 7, 8, 9, 10, 11]', '({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16 })', '(function*(){})()'
];
test('console do JavaScript: o inspect escreve igual ao util.inspect do Node (objetos, arrays, classes, Map, Set, quebras de linha)', () => {
  let out = ''; const ctx = vm.createContext({}), api = vm.runInContext(JSRUN.src, ctx)(s => { out += s; });
  for (const c of CASES) { const v = vm.runInContext('(' + c + ')', ctx); assert.equal(api.inspect(v), util.inspect(v), c); }
  // util.format: %s %d %i %f %j %o %O %%
  const fmt = (...a) => api.format(a);
  for (const a of [['%s e %s', 'a', 'b'], ['%d%%', 50], ['%i', '42.9'], ['%f', '1.5x'], ['%j', { a: 1 }], ['total:', 3, 'x'], ['%s', 5], ['sobra', { a: 1 }, [1]]]) assert.equal(fmt(...a), util.format(...a), JSON.stringify(a));
});

test('executor de JavaScript: saída, erros, temporizadores com relógio virtual, async/await e await no topo', async () => {
  const run = async c => jsrunner.run('', c);
  let r = await run('console.log("oi"); console.log(1 + 2, [1, 2], { a: 1 });'); assert.deepEqual([r.ok, r.out], [true, 'oi\n3 [ 1, 2 ] { a: 1 }\n']);
  r = await run('setTimeout(() => console.log("B"), 100); setTimeout(() => console.log("A"), 50); console.log("0"); Promise.resolve().then(() => console.log("micro"));'); assert.equal(r.out, '0\nmicro\nA\nB\n');
  r = await run('const sleep = ms => new Promise(r => setTimeout(r, ms)); console.log("a"); await sleep(5000); console.log("b");'); assert.deepEqual([r.ok, r.out], [true, 'a\nb\n']);
  r = await run('let n = 0; const id = setInterval(() => { n++; console.log("tick", n); if (n === 3) clearInterval(id); }, 1000);'); assert.equal(r.out, 'tick 1\ntick 2\ntick 3\n');
  r = await run('console.log("x"); null.foo;'); assert.equal(r.ok, false); assert.match(r.err, /^TypeError: Cannot read properties of null/); assert.equal(r.out, 'x\n');
  r = await run('let = ;'); assert.equal(r.ok, false); assert.match(r.err, /^SyntaxError/);
  r = await run('Promise.reject(new Error("falhou"))'); assert.equal(r.ok, false); assert.equal(r.err, 'Error: falhou');
  r = await run('async function f() { throw new TypeError("ruim"); } f().catch(e => console.log(e.name, e.message));'); assert.deepEqual([r.ok, r.out], [true, 'TypeError ruim\n']);
  r = await jsrunner.run('const dados = [1, 2, 3];', 'console.log(dados.length)'); assert.equal(r.out, '3\n');
  r = await run('console.log((1234.5).toLocaleString("pt-BR"), new Date("2024-03-10T00:00:00Z").toISOString(), typeof Date.now())'); assert.equal(r.out, '1.234,5 2024-03-10T00:00:00.000Z number\n');
});

test('executor de JavaScript: laço infinito, setInterval sem fim e saída enorme são interrompidos; o código não escapa do ambiente', async () => {
  let r = await jsrunner.run('', 'while (true) {}'); assert.equal(r.ok, false); assert.match(r.err, /Tempo esgotado|TIMEOUT/);
  r = await jsrunner.run('', 'Promise.resolve().then(() => { while (true) {} })'); assert.equal(r.ok, false);
  r = await jsrunner.run('', 'setInterval(() => {}, 10)'); assert.equal(r.ok, false);
  r = await jsrunner.run('', 'for (let i = 0; i < 100000; i++) console.log("linha muito longa para estourar o limite de saida " + i)'); assert.equal(r.ok, false); assert.ok(r.out.length <= 64 * 1024);
  const atk = [
    'console.log(this.constructor.constructor("return process")().pid)', 'console.log(console.log.constructor("return process")())', 'console.log((function(){}).constructor("return process")())',
    'console.log(eval("1+1"))', 'console.log(new Function("return 1")())', 'console.log(require("fs").readFileSync("/etc/passwd", "utf8"))', 'console.log(process.env)', 'import("fs").then(console.log)',
    'console.log(globalThis.process.pid)', 'console.log(Object.getPrototypeOf(async function(){}).constructor("return process")())'
  ];
  for (const c of atk) { r = await jsrunner.run('', c); assert.equal(r.ok, false, 'deveria falhar: ' + c); assert.ok(!/\b\d{3,}\b/.test(r.out) && !/root:/.test(r.out), 'vazou algo: ' + c); }
  r = await jsrunner.run('', 'console.log(typeof require, typeof process, typeof module, typeof fetch, typeof globalThis.constructor.constructor)'); assert.equal(r.out, 'undefined undefined undefined undefined function\n');
});

test('executor de JavaScript: todas as soluções do curso passam no executor do servidor', async () => {
  const lessons = require('../lessons'), all = [...lessons, ...lessons.tests, ...lessons.projects].filter(x => x.type === 'js');
  assert.ok(all.length >= 39, 'JavaScript Básico: 30 lições + 3 provas + 6 projetos');
  for (const x of all) { const r = await jsrunner.run(x.prelude || '', x.solution); assert.ok(r.ok && r.out.trim() === x.expectedOut, `${x.id} divergiu no executor: ${r.err}`); }
});
