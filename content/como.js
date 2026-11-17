// "Como funciona" de todas as lições com exemplo (SQL, Python, Excel e DAX), juntando os arquivos por curso.
module.exports = { ...require('./como-sql'), ...(() => { try { return require('./como-py'); } catch { return {}; } })(), ...require('./como-py4'), ...(() => { try { return require('./como-xl'); } catch { return {}; } })() };
