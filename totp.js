// Código de 6 dígitos do aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy, 1Password...), padrão TOTP (RFC 6238).
// Sem dependências: usa só o módulo crypto do Node. O segredo é guardado em base32, que é o formato que os aplicativos pedem.
'use strict';
const crypto = require('crypto');

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32enc(buf) {
  let bits = 0, v = 0, out = '';
  for (const b of buf) { v = ((v << 8) | b) & 0xfffff; bits += 8; while (bits >= 5) { out += ABC[(v >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits) out += ABC[(v << (5 - bits)) & 31];
  return out;
}
function b32dec(s) {
  let bits = 0, v = 0; const out = [];
  for (const c of String(s).toUpperCase().replace(/[^A-Z2-7]/g, '')) { v = ((v << 5) | ABC.indexOf(c)) & 0xfffff; bits += 5; if (bits >= 8) { out.push((v >>> (bits - 8)) & 255); bits -= 8; } }
  return Buffer.from(out);
}

const STEP = 30e3;                                                     // um código novo a cada 30 segundos
const step = (t = Date.now()) => Math.floor(t / STEP);
function hotp(key, counter, digits = 6) {
  const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', key).update(b).digest(), o = h[19] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** digits).padStart(digits, '0');
}
const code = (secret, t = Date.now()) => hotp(b32dec(secret), step(t));

// Confere o código digitado. Aceita o passo anterior e o seguinte (relógio do celular um pouco fora). Devolve o número do passo que bateu, ou -1.
function check(secret, typed, t = Date.now(), win = 1) {
  const c = String(typed || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return -1;
  const key = b32dec(secret), s = step(t); let hit = -1;
  for (let d = -win; d <= win; d++) if (crypto.timingSafeEqual(Buffer.from(hotp(key, s + d)), Buffer.from(c))) hit = s + d;   // testa todos, sempre
  return hit;
}
const newSecret = () => b32enc(crypto.randomBytes(20));                // 160 bits
const uri = (secret, account, issuer) => `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
const pretty = s => String(s).replace(/(.{4})/g, '$1 ').trim();         // "ABCD EFGH ..." para digitar à mão

module.exports = { b32enc, b32dec, hotp, code, check, step, newSecret, uri, pretty, STEP };
