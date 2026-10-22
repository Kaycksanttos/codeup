// SÓ PARA TESTES: troca a verificação do token do Google por uma leitura simples,
// para podermos testar o login sem uma conta Google real. Nunca é carregado em produção
// (só o teste usa: node -r ./test/mock-google.js server.js).
const { OAuth2Client } = require('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async function ({ idToken, audience }) {
  let p; try { p = JSON.parse(Buffer.from(String(idToken), 'base64url').toString()); } catch { throw new Error('token inválido'); }
  if (p.aud !== audience) throw new Error('audiência errada');
  return { getPayload: () => p };
};
