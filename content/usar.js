// Junta o "Quando usar" e o "Como usar" de todos os cursos (cada arquivo: id -> [quando usar, molde, cuidado opcional])
const tryReq = p => { try { return require(p); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') return {}; throw e; } };
module.exports = { ...require('./usar-sql'), ...tryReq('./usar-py'), ...tryReq('./usar-xl') };
