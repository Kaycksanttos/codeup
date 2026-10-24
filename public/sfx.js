/* Efeitos sonoros do CodeUp — sintetizados na hora com a Web Audio API (nenhum arquivo de áudio, nada para baixar).
   CodeUpSfx.play('ok' | 'perfect' | 'combo' | 'bad' | 'done' | 'cp' | 'pass' | 'fail' | 'streak' | 'streak7' | 'level' | 'pop' | 'tick' [, n])
   A preferência (ligado/desligado) fica no aparelho (localStorage 'cu_sfx'); o Perfil tem o botão. O som só toca depois do primeiro toque na página
   (regra dos navegadores) e nunca com a aba escondida. */
(function (root) {
  'use strict';
  var KEY = 'cu_sfx', on = true, ctx = null, master = null, unlocked = false;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) { }

  function ac() {
    if (ctx) return ctx;
    var C = root.AudioContext || root.webkitAudioContext; if (!C) return null;
    try { ctx = new C(); } catch (e) { return null; }
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .2;
    master = ctx.createGain(); master.gain.value = .6; master.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function unlock() {                                        // 1º toque do usuário: cria/acorda o áudio (iOS e Chrome exigem)
    if (unlocked) return; var c = ac(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) { } }
    if (c.state === 'running' || c.state === 'suspended') unlocked = true;
  }
  ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) { root.addEventListener(ev, unlock, { capture: true, passive: true }); });

  var mf = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };      // nota MIDI → Hz (60 = dó central)
  // uma nota: tipo de onda, frequência (com glissando opcional), envelope curto, filtro passa-baixa opcional
  function tone(f, t, d, o) {
    o = o || {}; var c = ctx, os = c.createOscillator(), g = c.createGain(), v = o.v == null ? .22 : o.v, at = o.a == null ? .006 : o.a, last = o.node || master;
    os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d);
    if (o.vib) { var lf = c.createOscillator(), lg = c.createGain(); lf.frequency.value = o.vib; lg.gain.value = f * .018; lf.connect(lg); lg.connect(os.frequency); lf.start(t); lf.stop(t + d + .05); }
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + at);
    if (o.hold) g.gain.setValueAtTime(v, t + o.hold);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    if (o.lp) { var fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; os.connect(fl); fl.connect(g); } else os.connect(g);
    g.connect(last); os.start(t); os.stop(t + d + .05);
  }
  // sino/xilofone: fundamental + harmônico agudo que some rápido
  function bell(m, t, d, v) { tone(mf(m), t, d, { v: (v || .2), type: 'sine' }); tone(mf(m + 12), t, d * .5, { v: (v || .2) * .35, type: 'sine' }); tone(mf(m + 19), t, d * .25, { v: (v || .2) * .15, type: 'sine' }); }
  // metais de fanfarra: dente-de-serra suavizado
  function brass(m, t, d, v) { tone(mf(m), t, d, { v: v || .13, type: 'sawtooth', lp: 1700, a: .02 }); tone(mf(m) * 1.004, t, d, { v: (v || .13) * .7, type: 'square', lp: 1100, a: .03 }); }
  function noise(t, d, o) {
    o = o || {}; var c = ctx, n = Math.max(1, Math.floor(c.sampleRate * d)), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
    for (var i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), v = o.v == null ? .12 : o.v;
    s.buffer = b; fl.type = o.type || 'bandpass'; fl.Q.value = o.q || 1.2; fl.frequency.setValueAtTime(o.f0 || 3000, t); if (o.f1) fl.frequency.exponentialRampToValueAtTime(o.f1, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.a || .01)); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + d + .02);
  }
  var chord = function (ms, t, d, v, kind) { ms.forEach(function (m) { (kind == 'brass' ? brass : bell)(m, t, d, v); }); };

  var SND = {
    // acertou: "ding-ding" de sino subindo
    ok: function (t) { bell(76, t, .5, .22); bell(83, t + .1, .75, .24); noise(t + .1, .18, { f0: 6000, f1: 9000, v: .03, type: 'highpass' }); },
    // acertou de primeira: arpejo brilhante
    perfect: function (t) { [72, 76, 79, 84, 88].forEach(function (m, k) { bell(m, t + k * .075, .55 + k * .05, .2); }); noise(t + .3, .35, { f0: 5000, f1: 10000, v: .04, type: 'highpass' }); },
    // combo: sobe um tom a cada acerto seguido
    combo: function (t, n) { var b = 74 + Math.min(n || 2, 8); [0, 4, 7, 12].forEach(function (s, k) { bell(b + s, t + k * .06, .5, .2); }); tone(mf(b + 24), t + .22, .35, { v: .06 }); },
    // errou: "uh-oh" curtinho, sem assustar
    bad: function (t) { tone(mf(62), t, .2, { v: .3, type: 'triangle', to: mf(60), lp: 1400 }); tone(mf(55), t + .17, .34, { v: .33, type: 'triangle', to: mf(52), lp: 1200 }); },
    // lição concluída: fanfarra curta
    done: function (t) { brass(67, t, .13); brass(72, t + .13, .13); brass(76, t + .26, .13); chord([72, 76, 79, 84], t + .42, .95, .09, 'brass'); chord([84, 88], t + .42, .7, .14); noise(t + .4, .6, { f0: 7000, f1: 4000, v: .035, type: 'highpass' }); },
    // checkpoint: mesma ideia, uma terça acima
    cp: function (t) { brass(69, t, .12); brass(74, t + .12, .12); brass(78, t + .24, .12); chord([74, 78, 81, 86], t + .4, 1, .09, 'brass'); chord([86, 90], t + .4, .75, .13); },
    // prova aprovada: "ta-ta-ta-TAAA" de vitória + brilho
    pass: function (t) {
      [0, .2, .4].forEach(function (d) { brass(67, t + d, .17, .15); });
      brass(72, t + .62, .55, .16); brass(71, t + .62, .55, .08);
      brass(74, t + 1.2, .18, .15); brass(76, t + 1.4, .18, .15);
      chord([72, 76, 79, 84], t + 1.65, 1.5, .1, 'brass'); chord([84, 88, 91, 96], t + 1.65, 1.2, .13);
      noise(t + 1.6, 1.3, { f0: 9000, f1: 3500, v: .06, type: 'highpass' });
      for (var k = 0; k < 7; k++) bell(88 + (k * 5) % 9, t + 2 + k * .09, .5, .1);
    },
    // não passou: trombone triste, devagar
    fail: function (t) { [[64, 0], [62, .32], [60, .64], [55, .96]].forEach(function (p, k) { tone(mf(p[0]), t + p[1], k == 3 ? .9 : .38, { v: .2, type: 'triangle', lp: 1500, vib: 5, to: k == 3 ? mf(53) : null, a: .03 }); }); },
    // sequência de dias: chama que acende (sopro) + sinos subindo
    streak: function (t) {
      noise(t, .55, { f0: 350, f1: 3800, v: .16, q: .9, a: .12 }); tone(90, t, .5, { v: .3, to: 45 });
      [79, 83, 86, 91].forEach(function (m, k) { bell(m, t + .42 + k * .11, .7, .2); });
      noise(t + .5, .5, { f0: 6000, f1: 9500, v: .04, type: 'highpass' });
    },
    // marco da sequência (3, 7, 14, 30…): a chama + fanfarra
    streak7: function (t) {
      SND.streak(t); brass(72, t + .95, .14); brass(76, t + 1.08, .14); brass(79, t + 1.21, .14);
      chord([72, 76, 79, 84], t + 1.36, 1.2, .1, 'brass'); chord([84, 88, 91], t + 1.36, 1, .13); noise(t + 1.3, 1, { f0: 9000, f1: 3500, v: .05, type: 'highpass' });
    },
    // subiu de nível / título novo: escala subindo e acorde
    level: function (t) { [60, 64, 67, 72, 76, 79, 84].forEach(function (m, k) { bell(m, t + k * .07, .45, .17); }); chord([72, 76, 79, 84], t + .55, 1.1, .12); noise(t + .5, .8, { f0: 8000, f1: 4000, v: .04, type: 'highpass' }); },
    pop: function (t) { tone(520, t, .1, { v: .26, to: 880 }); },
    tick: function (t) { tone(1300, t, .04, { v: .08, type: 'triangle' }); }
  };

  function play(name, n) {
    if (!on || !SND[name] || root.document && document.hidden) return false;
    var c = ac(); if (!c) return false;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) { } }
    try { SND[name](c.currentTime + .03, n); return true; } catch (e) { return false; }
  }
  root.CodeUpSfx = {
    play: play, unlock: unlock, enabled: function () { return on; }, names: Object.keys(SND),
    set: function (v) { on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { } if (on) { unlock(); } return on; }
  };
})(window);
