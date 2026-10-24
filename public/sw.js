// Service worker: deixa o app instalável e abre o "casco" (HTML/CSS/JS) mesmo com internet ruim.
// Sempre tenta a rede primeiro, então atualizações do app chegam na hora.
const C = 'codeup-v35';
const SHELL = ['/', '/style.css', '/app.js', '/fmt.js', '/rewards.js', '/poses.js', '/anim.js', '/bgfx.js', '/scene.js', '/img/tay.webp', '/img/tay-face.webp', '/img/cut.webp', '/img/cut-face.webp', '/manifest.webmanifest', '/icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/admin') || ['/health', '/termos', '/privacidade'].includes(u.pathname)) return;
  const cacheable = SHELL.includes(u.pathname) || u.pathname.startsWith('/img/') || u.pathname.startsWith('/icons/');   // nunca guarda páginas de certificado, links de e-mail etc.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && cacheable) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('/'))));
});
