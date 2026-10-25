// ============================================================================
// MODELOS DE DADOS DO CURSO POWER BI E DAX (os mesmos no navegador e no servidor).
// Cada modelo é um conjunto pequeno de tabelas, relacionamentos "muitos → um" e (às vezes) colunas calculadas e medidas já prontas.
//   tables:  { Nome: { cols: [{ n, t: 'int'|'dec'|'text'|'date'|'bool', key?, m? }], rows: [[...]] } }
//            m = true marca números que mudam na "planilha alternativa" (a conferência recalcula com outros números para pegar valor digitado à mão)
//   rels:    [['Vendas[ProdutoID]', 'Produtos[ProdutoID]', { active?: false, both?: true }]]  (lado "muitos" primeiro)
//   calc:    colunas calculadas   measures: medidas prontas (o aluno pode usá-las)
// Os dados são gerados por uma sequência fixa (sempre os mesmos).
// ============================================================================
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./dax.js')); else root.DAXDATA = factory(root.DAX); })(typeof self !== 'undefined' ? self : this, function (DAX) {
  'use strict';
  const { serial, ymd, MESES, dow } = DAX;
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const dec = (n, k = 2) => Math.round(n * Math.pow(10, k)) / Math.pow(10, k);
  const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  // calendário diário de 2023 a 2024
  function calendario(y0 = 2023, y1 = 2024) {
    const rows = [];
    for (let d = serial(y0, 1, 1); d <= serial(y1, 12, 31); d++) { const [y, m] = ymd(d); rows.push([d, y, m, MESES[m - 1].slice(0, 3), Math.ceil(m / 3), SEM[dow(d)]]); }
    return { cols: [{ n: 'Data', t: 'date', key: true }, { n: 'Ano', t: 'int' }, { n: 'MesNum', t: 'int' }, { n: 'Mes', t: 'text' }, { n: 'Trimestre', t: 'int' }, { n: 'DiaSemana', t: 'text' }], rows };
  }

  // ---------------------------------------------------------------- LOJA: lanchonete (Produtos, Clientes, Calendario, Vendas)
  const PRODUTOS = [[1, 'Suco de Laranja', 'Bebidas', 6, 3.5], [2, 'Refrigerante', 'Bebidas', 5, 3], [3, 'Água Mineral', 'Bebidas', 3, 1], [4, 'Sanduíche', 'Lanches', 12, 7], [5, 'Pizza Fatia', 'Lanches', 9, 5], [6, 'Pastel', 'Lanches', 7, 3.5], [7, 'Brigadeiro', 'Doces', 4, 1.5], [8, 'Pudim', 'Doces', 8, 3.5]];
  const CLIENTES = [[1, 'Ana Souza', 'São Paulo'], [2, 'Bruno Lima', 'Rio de Janeiro'], [3, 'Carla Dias', 'São Paulo'], [4, 'Diego Alves', 'Belo Horizonte'], [5, 'Elisa Costa', 'Rio de Janeiro'], [6, 'Fábio Rocha', 'São Paulo']];
  function vendas() {
    const r = rng(2024), rows = [];
    for (let i = 0; i < 48; i++) {
      const y = 2023 + Math.floor(i / 24), m = Math.floor((i % 24) / 2) % 12 + 1, d = 1 + Math.floor(r() * 28);
      const p = pick(r, PRODUTOS), c = pick(r, CLIENTES), q = 1 + Math.floor(r() * 5), canal = r() < 0.6 ? 'Loja' : 'Online';
      rows.push({ k: serial(y, m, d) * 100 + i, data: serial(y, m, d), p: p[0], c: c[0], canal, q, v: dec(q * p[3]) });
    }
    rows.sort((a, b) => a.k - b.k);
    return rows.map((x, i) => [i + 1, x.data, x.p, x.c, x.canal, x.q, x.v]);
  }
  const loja = () => ({
    tables: {
      Produtos: { cols: [{ n: 'ProdutoID', t: 'int', key: true }, { n: 'Produto', t: 'text' }, { n: 'Categoria', t: 'text' }, { n: 'Preco', t: 'dec', m: true }, { n: 'Custo', t: 'dec', m: true }], rows: PRODUTOS },
      Clientes: { cols: [{ n: 'ClienteID', t: 'int', key: true }, { n: 'Cliente', t: 'text' }, { n: 'Cidade', t: 'text' }], rows: CLIENTES },
      Calendario: calendario(),
      Vendas: { cols: [{ n: 'VendaID', t: 'int', key: true }, { n: 'Data', t: 'date' }, { n: 'ProdutoID', t: 'int' }, { n: 'ClienteID', t: 'int' }, { n: 'Canal', t: 'text' }, { n: 'Qtd', t: 'int', m: true }, { n: 'Valor', t: 'dec', m: true }], rows: vendas() }
    },
    rels: [['Vendas[ProdutoID]', 'Produtos[ProdutoID]'], ['Vendas[ClienteID]', 'Clientes[ClienteID]'], ['Vendas[Data]', 'Calendario[Data]']],
    dateCol: 'Calendario[Data]',
    fmt: { Valor: 'moeda', Preco: 'moeda', Custo: 'moeda', Data: 'data' }
  });

  // ---------------------------------------------------------------- RH: funcionários e departamentos
  const FUNC = [
    [1, 'Marta Pires', 1, 'Analista', 5200, serial(2019, 3, 4), 'F'], [2, 'João Mota', 1, 'Gerente', 9800, serial(2016, 7, 18), 'M'], [3, 'Lívia Reis', 2, 'Analista', 4800, serial(2021, 1, 11), 'F'],
    [4, 'Pedro Gomes', 2, 'Assistente', 3100, serial(2022, 5, 2), 'M'], [5, 'Sara Neves', 3, 'Gerente', 10500, serial(2015, 9, 21), 'F'], [6, 'Tiago Luz', 3, 'Analista', 5600, serial(2020, 10, 5), 'M'],
    [7, 'Vera Costa', 3, 'Assistente', 3300, serial(2023, 2, 13), 'F'], [8, 'Caio Barros', 4, 'Analista', 5000, serial(2018, 6, 25), 'M'], [9, 'Dora Lins', 4, 'Gerente', 9200, serial(2017, 4, 3), 'F'], [10, 'Hugo Sales', 2, 'Analista', 4900, serial(2022, 11, 14), 'M']
  ];
  const rh = () => ({
    tables: {
      Deptos: { cols: [{ n: 'DeptoID', t: 'int', key: true }, { n: 'Depto', t: 'text' }, { n: 'Meta', t: 'dec', m: true }], rows: [[1, 'Financeiro', 20000], [2, 'Vendas', 18000], [3, 'Tecnologia', 30000], [4, 'Marketing', 16000]] },
      Funcionarios: { cols: [{ n: 'FuncID', t: 'int', key: true }, { n: 'Nome', t: 'text' }, { n: 'DeptoID', t: 'int' }, { n: 'Cargo', t: 'text' }, { n: 'Salario', t: 'dec', m: true }, { n: 'Admissao', t: 'date' }, { n: 'Sexo', t: 'text' }], rows: FUNC }
    },
    rels: [['Funcionarios[DeptoID]', 'Deptos[DeptoID]']],
    fmt: { Salario: 'moeda', Meta: 'moeda', Admissao: 'data' }
  });

  // multiplica os números marcados com m:true (cada linha por um fator diferente): a mesma fórmula tem que continuar certa
  const FACTORS = [2, 3, 1.5, 0.5, 4, 2.5, 1.2];
  function alt(spec) {
    const o = { ...spec, tables: {} };
    for (const [name, t] of Object.entries(spec.tables)) {
      const ms = t.cols.map((c, i) => c.m ? i : -1).filter(i => i >= 0);
      o.tables[name] = { cols: t.cols, rows: t.rows.map((r, ri) => r.map((v, ci) => ms.includes(ci) && typeof v === 'number' ? dec(v * FACTORS[(ri * 5 + ci * 3 + 1) % FACTORS.length]) : v)) };
    }
    return o;
  }
  const BUILD = { loja, rh };
  const cache = new Map();
  // modelo pronto (com as colunas calculadas e medidas extras da lição): get('loja', { calc, measures }, alt?)
  function get(id, extra, isAlt) {
    const k = id + '|' + JSON.stringify(extra || {}) + '|' + (isAlt ? 'a' : ''); if (cache.has(k)) return cache.get(k);
    if (!BUILD[id]) throw new Error('modelo desconhecido: ' + id);
    let spec = BUILD[id](); if (isAlt) spec = alt(spec);
    spec = { ...spec, calc: { ...(spec.calc || {}), ...((extra && extra.calc) || {}) }, measures: { ...(spec.measures || {}), ...((extra && extra.measures) || {}) } };
    if (extra && extra.rels) spec.rels = spec.rels.concat(extra.rels);
    const m = new DAX.Model(spec); if (cache.size > 200) cache.clear(); cache.set(k, m); return m;
  }
  return { get, ids: Object.keys(BUILD), spec: (id) => BUILD[id](), alt, fmtOf: id => BUILD[id]().fmt };
});
