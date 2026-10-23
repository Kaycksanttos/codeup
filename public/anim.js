/* CodeUp — personagem animado (WebGL).
 *
 * Um único contexto WebGL "motor" (fora da tela) desenha o personagem em cada <canvas> 2D do app.
 * A imagem do personagem é deformada por um shader (respirar, balançar, inclinar a cabeça, mexer o cabelo e o braço),
 * os olhos piscam e as roupas recebem estampas (listrado, bolinhas, estrelas, galáxia…) usando as máscaras
 * `<guia>-parts.png` (R capuz, G calça, B tênis) e `<guia>-rig.png` (R cabeça, G cabelo, B braço).
 * Se o WebGL não existir (ou falhar), fica a <img> normal. Com "reduzir movimento" o personagem fica parado (só com a estampa).
 *
 * Uso: <span class="abody" data-g="tay" data-src="/img/tay-azul.webp" data-o="3" data-mode="good|bad"><img class="body" ...></span>
 *      O `scan()` roda sozinho quando o DOM muda e troca a <img> pelo canvas animado.
 */
(function (root) {
  'use strict';
  var W = 640, H = 960, PX = 51.2, PT = 96;       // espaço da imagem e margem extra (pulo e balanço)
  var KMAX = 1.0;                                    // máx. de pixels reais por pixel da imagem
  var CH = {
    tay: { pivot: [340, 345], arm: [482, 535], armAmp: 0.05, hair: 6, eyeL: [277, 224, 42, 40], eyeR: [406, 256, 33, 38], lash: [.3, .03, .16], gate: [0.30, 0.38] },
    cut: { pivot: [340, 345], arm: [492, 535], armAmp: 0.09, hair: 0, eyeL: [276, 230, 38, 37], eyeR: [405, 262, 35, 38], lash: [.3, .33, .42], gate: [0.52, 0.62] }
  };

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform sampler2D uTex,uPar,uRig,uLid;',
    'uniform vec2 uRes,uOrg,uPivot,uArmP;uniform float uK,uHop,uSy,uSway,uHead,uArm,uHair,uBlink,uTime,uStyle;',
    'uniform vec4 uEL,uER;uniform vec2 uGate;uniform vec3 uMain,uAlt,uLref,uLash;',
    'const vec2 SZ=vec2(640.,960.);',
    'vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){return .5*vnoise(p)+.25*vnoise(p*2.03+7.1)+.125*vnoise(p*4.1+3.7)+.0625*vnoise(p*8.3+1.3);}',
    'vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(fract(h+vec3(0.,.6667,.3333))*6.-3.)-1.,0.,1.);return v*mix(vec3(1.),k,s);}',
    // olho piscando: a máscara do olho (uLid.a) é preenchida com a pele em volta; duas pálpebras fecham e uma linha de cílios aparece
    'vec3 blink(vec3 col,vec2 q,vec4 e,vec4 lid){',
    ' if(uBlink<.001||lid.a<.004)return col;',
    ' vec2 d=(q-e.xy)/(e.zw*1.5);if(length(d)>1.)return col;',
    ' vec3 lc=lid.rgb/lid.a;',
    ' float dx=(q.x-e.x)/e.z;float cv=1.-min(dx*dx,1.);',
    ' float off=.18*e.w;',
    ' float up=e.y-e.w+uBlink*(e.w+off)+cv*uBlink*e.w*.24;',
    ' float lo=e.y+e.w-uBlink*(e.w-off)+cv*uBlink*e.w*.1;',
    ' float cov=max(1.-smoothstep(up-1.,up+1.,q.y),smoothstep(lo-1.,lo+1.,q.y));',
    ' float ln=(1.-smoothstep(1.2,3.4,abs(q.y-up)))*smoothstep(.1,.35,uBlink)*smoothstep(.2,.7,lid.a);',
    ' col=mix(col,lc,lid.a*cov);',
    ' return mix(col,uLash,ln*.95);}',
    // estampas
    'vec3 pattern(vec2 q,float st,vec3 m){',
    ' vec3 lt=mix(m,vec3(1.),.8),dk=m*.55;',
    ' if(st<1.5){return mix(m,lt,step(.5,fract(q.y/34.)));}',                                    // 1 listrado
    ' if(st<2.5){vec2 g=q/40.;g.x+=.5*mod(floor(g.y),2.);vec2 f=(fract(g)-.5)*40.;',            // 2 bolinhas
    '  return mix(m,lt,1.-smoothstep(9.,10.5,length(f)));}',
    ' if(st<3.5){float a=step(.5,fract(q.x/34.)),b=step(.5,fract(q.y/34.));float s=a+b;',        // 3 xadrez
    '  return s<.5?lt:(s<1.5?mix(lt,m,.55):mix(m,dk,.2));}',
    ' if(st<4.5){float t=smoothstep(330.,830.,q.y+14.*sin(q.x*.02));return mix(mix(m,lt,.25),uAlt,t);}', // 4 degradê
    ' if(st<5.5){vec2 g=q/50.;g.x+=.5*mod(floor(g.y),2.);vec2 f=fract(g)-.5;',                   // 5 estrelas
    '  float an=atan(f.y,f.x)-1.5708;float rr=length(f);float rad=.17+.12*cos(5.*an);',
    '  float s=1.-smoothstep(rad-.025,rad+.02,rr);return mix(m,vec3(1.,.93,.5),s);}',
    ' if(st<6.5){float n1=fbm(q/46.),n2=fbm(q/38.+17.),n3=fbm(q/30.+41.);',                       // 6 camuflado
    '  vec3 c=m*.75;c=mix(c,m*1.15,step(.5,n1));c=mix(c,m*.45,step(.58,n2));c=mix(c,mix(m,lt,.35),step(.62,n3));return c;}',
    ' if(st<7.5){vec2 d=q-vec2(320.,540.);float a=atan(d.y,d.x);float r=length(d);',               // 7 tie-dye
    '  float h=fract(r/170.+a/6.2832*2.+fbm(q/55.)*.55);return hsv(h,.62,1.);}',
    ' if(st<8.5){float n=fbm(q/95.+vec2(uTime*.02,0.));float n2=fbm(q/60.+9.);',                   // 8 galáxia
    '  vec3 c=vec3(.05,.03,.2)+vec3(.42,.12,.7)*smoothstep(.3,.8,n)+vec3(.05,.35,.8)*smoothstep(.45,.9,n2)*.8+vec3(.9,.25,.6)*smoothstep(.62,.95,n*n2*2.)*.55;',
    '  vec2 g=q/13.;vec2 cid=floor(g);float h=hash(cid);vec2 cp=fract(g)-.5-(vec2(hash(cid+3.1),hash(cid+7.7))-.5)*.5;',
    '  float tw=.5+.5*sin(uTime*3.+h*40.);float s=step(.84,h)*(1.-smoothstep(.03,.2,length(cp)))*(.4+.6*tw);',
    '  return c+vec3(.9,.95,1.)*s;}',
    ' if(st<9.5){float s=sin((q.x+q.y)*.04+fbm(q/70.)*3.+uTime*.9);',                             // 9 ouro
    '  vec3 c=mix(vec3(.62,.4,.06),vec3(1.,.84,.34),.5+.5*s);',
    '  float gl=smoothstep(.94,1.,sin((q.x*.8-q.y)*.022-uTime*1.7));return c+vec3(.55,.5,.3)*gl;}',
    ' float h=fract((q.x*.55+q.y)/280.+uTime*.07+fbm(q/80.)*.35);',                                // 10 holográfico
    ' return mix(hsv(h,.5,1.),vec3(1.),.22+.2*sin(uTime*1.3+q.y*.02));}',
    'void main(){',
    ' vec2 fc=gl_FragCoord.xy;',
    ' vec2 P=vec2(uOrg.x+fc.x/uK,uOrg.y+(uRes.y-fc.y)/uK);',
    ' P.y+=uHop;',
    ' vec2 q=vec2(320.+(P.x-320.)*(1.+.6*(uSy-1.)),950.-(950.-P.y)/uSy);',
    ' q.x-=uSway*pow(clamp((960.-q.y)/960.,0.,1.),1.5);',
    ' vec3 w=texture2D(uRig,q/SZ).rgb;',
    ' q=uPivot+rot(q-uPivot,-uHead*w.r);',
    ' q.x-=uHair*w.g*sin(q.y*.012+uTime*2.4)*clamp((q.y-300.)/300.,0.,1.);',
    ' q=uArmP+rot(q-uArmP,-uArm*w.b);',
    ' vec2 uv=q/SZ;',
    ' vec4 c=texture2D(uTex,uv);',
    ' if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)c=vec4(0.);',
    ' vec3 rgb=c.a>.004?c.rgb/c.a:c.rgb;',
    ' if(c.a>.004){',
    '  vec4 lid=texture2D(uLid,uv);rgb=blink(rgb,q,uEL,lid);rgb=blink(rgb,q,uER,lid);',
    '  if(uStyle>.5){',
    '   vec3 pm=texture2D(uPar,uv).rgb;float msum=pm.r+pm.g+pm.b;',
    '   if(msum>.01){',
    '    float mx=max(rgb.r,max(rgb.g,rgb.b)),mn=min(rgb.r,min(rgb.g,rgb.b));',
    '    float g=smoothstep(uGate.x,uGate.y,(mx-mn)/max(mx,.001))*clamp(msum,0.,1.);',
    '    float lref=(pm.r*uLref.x+pm.g*uLref.y+pm.b*uLref.z)/msum;',
    '    float sh=clamp(dot(rgb,vec3(.299,.587,.114))/lref,.35,1.5);',
    '    rgb=mix(rgb,clamp(pattern(q,uStyle,uMain)*sh,0.,1.),g);',
    '   }',
    '  }',
    ' }',
    ' gl_FragColor=vec4(rgb*c.a,c.a);',
    '}'
  ].join('\n');

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb2hsv(r, g, b) { var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0; if (d) { if (mx == r) h = ((g - b) / d) % 6; else if (mx == g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; if (h < 0) h += 1; } return [h, mx ? d / mx : 0, mx]; }
  function hsv2rgb(h, s, v) { var f = function (n) { var k = (n + h * 6) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)]; }

  // ------------------------------------------------------------------ motor
  var STILL = { hop: 0, sy: 1, sway: 0, head: 0, arm: 0, hair: 0, blink: 0 };
  var E = null, failed = false, paused = false, insts = [], raf = 0, lastT = 0, reduce = false, texCache = [];
  try { var mq = root.matchMedia('(prefers-reduced-motion: reduce)'); reduce = mq.matches; mq.addEventListener && mq.addEventListener('change', function (e) { reduce = e.matches; insts.forEach(function (i) { i.dirty = true; }); loop(); }); } catch (e) {}

  function engine() {
    if (E || failed) return E;
    try {
      var cv = document.createElement('canvas'); cv.width = 744; cv.height = 1056;
      var o = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false };
      var gl = cv.getContext('webgl2', o), v2 = !!gl; if (!gl) gl = cv.getContext('webgl', o) || cv.getContext('experimental-webgl', o);
      if (!gl) throw new Error('sem webgl');
      function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
      var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var U = {}; ['uTex', 'uPar', 'uRig', 'uLid', 'uRes', 'uOrg', 'uPivot', 'uArmP', 'uK', 'uHop', 'uSy', 'uSway', 'uHead', 'uArm', 'uHair', 'uBlink', 'uTime', 'uStyle', 'uEL', 'uER', 'uGate', 'uMain', 'uAlt', 'uLref', 'uLash'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uPar, 1); gl.uniform1i(U.uRig, 2); gl.uniform1i(U.uLid, 3);
      gl.disable(gl.BLEND); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      try { gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE); } catch (e) {}
      cv.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); E = null; failed = true; texCache = []; insts.slice().forEach(function (i) { release(i); }); }, false);
      E = { cv: cv, gl: gl, U: U, v2: v2 };
    } catch (e) { failed = true; E = null; }
    return E;
  }

  function loadImg(src) {
    return new Promise(function (ok, no) { var im = new Image(); im.decoding = 'async'; im.onload = function () { ok(im); }; im.onerror = no; im.src = src; });
  }
  function mkTex(gl, im, unit, mip) {
    var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    var mm = mip && E && E.v2; if (mm) gl.generateMipmap(gl.TEXTURE_2D);   // mipmap de imagem não potência de 2 só no WebGL2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mm ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  // cores médias de cada peça (para a estampa respeitar o brilho/sombra original e a cor escolhida)
  function stats(im, par, gate) {
    var w = 160, h = 240, a = document.createElement('canvas'); a.width = w; a.height = h; var x = a.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, w, h); var d1 = x.getImageData(0, 0, w, h).data; x.clearRect(0, 0, w, h); x.drawImage(par, 0, 0, w, h); var d2 = x.getImageData(0, 0, w, h).data;
    var L = [0, 0, 0], N = [0, 0, 0], M = [0, 0, 0], MN = 0;
    for (var i = 0; i < w * h; i++) {
      var o = i * 4; if (d1[o + 3] < 250) continue;
      var r = d1[o] / 255, g = d1[o + 1] / 255, b = d1[o + 2] / 255, hv = rgb2hsv(r, g, b); if (hv[1] < gate[1]) continue;
      var lum = .299 * r + .587 * g + .114 * b;
      for (var k = 0; k < 3; k++) if (d2[o + k] > 230) { L[k] += lum; N[k]++; if (k < 2) { M[0] += r; M[1] += g; M[2] += b; MN++; } }
    }
    var lref = [0, 1, 2].map(function (k) { return N[k] ? L[k] / N[k] : .5; });
    var main = MN ? [M[0] / MN, M[1] / MN, M[2] / MN] : [.5, .5, .5];
    var hv = rgb2hsv(main[0], main[1], main[2]); var alt = hsv2rgb((hv[0] + .2) % 1, clamp(hv[1] + .1, 0, 1), clamp(hv[2] * 1.25 + .12, 0, 1));
    return { lref: lref, main: main, alt: alt };
  }
  // pele que "preenche" o olho fechado: copia a imagem colorida, tira a máscara do olho e espalha a pele em volta (difusão)
  function lidCanvas(im, eye) {
    var w = 320, h = 480, c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, w, h); var img = x.getImageData(0, 0, w, h), d = img.data;
    var e = document.createElement('canvas'); e.width = w; e.height = h; var ex = e.getContext('2d', { willReadFrequently: true }); ex.drawImage(eye, 0, 0, w, h); var m = ex.getImageData(0, 0, w, h).data;
    var x0 = w, x1 = 0, y0 = h, y1 = 0, i, j;
    for (j = 0; j < h; j++) for (i = 0; i < w; i++) if (m[(j * w + i) * 4] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; }
    var out = x.createImageData(w, h);
    if (x1 > x0) {
      x0 = Math.max(0, x0 - 10); y0 = Math.max(0, y0 - 10); x1 = Math.min(w - 1, x1 + 10); y1 = Math.min(h - 1, y1 + 10);
      var bw = x1 - x0 + 1, bh = y1 - y0 + 1, R = new Float32Array(bw * bh), G = new Float32Array(bw * bh), B = new Float32Array(bw * bh), K = new Uint8Array(bw * bh), sr = 0, sg = 0, sb = 0, sn = 0;
      for (j = 0; j < bh; j++) for (i = 0; i < bw; i++) { var o = ((j + y0) * w + i + x0) * 4, k = j * bw + i; if (m[o] < 14 && d[o + 3] > 200) { K[k] = 1; R[k] = d[o]; G[k] = d[o + 1]; B[k] = d[o + 2]; sr += d[o]; sg += d[o + 1]; sb += d[o + 2]; sn++; } }
      sn = sn || 1; for (i = 0; i < bw * bh; i++) if (!K[i]) { R[i] = sr / sn; G[i] = sg / sn; B[i] = sb / sn; }
      for (var it = 0; it < 90; it++) for (j = 1; j < bh - 1; j++) for (i = 1; i < bw - 1; i++) { var k2 = j * bw + i; if (K[k2]) continue; R[k2] = (R[k2 - 1] + R[k2 + 1] + R[k2 - bw] + R[k2 + bw]) / 4; G[k2] = (G[k2 - 1] + G[k2 + 1] + G[k2 - bw] + G[k2 + bw]) / 4; B[k2] = (B[k2 - 1] + B[k2 + 1] + B[k2 - bw] + B[k2 + bw]) / 4; }
      for (j = 0; j < bh; j++) for (i = 0; i < bw; i++) { var o2 = ((j + y0) * w + i + x0) * 4, k3 = j * bw + i; out.data[o2] = R[k3]; out.data[o2 + 1] = G[k3]; out.data[o2 + 2] = B[k3]; out.data[o2 + 3] = m[o2]; }
    }
    x.putImageData(out, 0, 0); return c;
  }
  // texturas por (imagem colorida, personagem); guarda as últimas 8 e libera o resto
  function assets(src, g) {
    var key = src; for (var i = 0; i < texCache.length; i++) if (texCache[i].key == key) { var e = texCache.splice(i, 1)[0]; texCache.push(e); return e.p; }
    var base = '/img/' + g, p = Promise.all([loadImg(src), loadImg(base + '-parts.png'), loadImg(base + '-rig.png'), loadImg(base + '-eye.png')]).then(function (r) {
      var en = engine(); if (!en) throw new Error('sem motor');
      var gl = en.gl; return { tex: mkTex(gl, r[0], 0, 1), par: mkTex(gl, r[1], 1, 1), rig: mkTex(gl, r[2], 2, 0), lid: mkTex(gl, lidCanvas(r[0], r[3]), 3, 0), st: stats(r[0], r[1], CH[g].gate) };
    });
    var ent = { key: key, p: p }; texCache.push(ent);
    p.catch(function () { var j = texCache.indexOf(ent); if (j >= 0) texCache.splice(j, 1); });
    while (texCache.length > 8) { var old = texCache.shift(); old.p.then(function (a) { if (E) { E.gl.deleteTexture(a.tex); E.gl.deleteTexture(a.par); E.gl.deleteTexture(a.rig); E.gl.deleteTexture(a.lid); } }, function () {}); }
    return p;
  }

  // ------------------------------------------------------------------ pose (pura: tempo → números)
  function tri(x, d) { return x < 0 || x > d ? 0 : (x < d / 2 ? x / (d / 2) : 2 - x / (d / 2)); }
  function blinkAt(t, seed) {
    // piscadas a cada ~3,6 s (com pequena variação por instância); às vezes pisca duas vezes
    var per = 3.6, k = Math.floor((t + seed) / per), ph = (t + seed) - k * per, jit = (Math.sin(k * 12.9898 + seed) * 43758.5453) % 1; jit = Math.abs(jit);
    var start = .9 + jit * 1.7, b = tri(ph - start, .18);
    if (jit > .62) b = Math.max(b, tri(ph - start - .3, .18));
    return b;
  }
  function pose(i, t) {
    var c = CH[i.g] || CH.tay, TAU = 6.2832, s = i.seed, mode = i.mode;
    var o = { hop: 0, sy: 1, sway: 0, head: 0, arm: 0, hair: c.hair, blink: 0 };
    var calm = mode == 'bad' ? .5 : 1;
    o.sy = 1 + .009 * Math.sin(TAU * t / 3.4 + s) * calm;
    o.sway = 5 * Math.sin(TAU * t / 5.2 + s * 1.3) * calm;
    o.head = .03 * Math.sin(TAU * t / 4.1 + 1 + s) + .013 * Math.sin(TAU * t / 2.3 + s);
    o.arm = c.armAmp * Math.sin(TAU * t / (i.g == 'cut' ? 2.0 : 2.8) + s);
    o.blink = blinkAt(t, s);
    var T = t - i.t0;                                           // tempo desde que o personagem apareceu
    if (mode == 'good') {                                       // comemora: 3 pulinhos, braço balançando e depois pula de vez em quando
      var per = T < 2.4 ? .8 : 4, ph = T < 2.4 ? T % .8 : (T - 2.4) % 4, u = ph / .8, a = T < 2.4 ? 22 : 16;
      if (u < 1) { o.hop = a * Math.sin(Math.PI * u); o.sy += .035 * Math.sin(Math.PI * u) - (u < .14 ? .05 * (1 - u / .14) : 0) - (u > .88 ? .045 * ((u - .88) / .12) : 0); }
      o.arm += (i.g == 'cut' ? .28 : .16) * Math.sin(TAU * 2.2 * t);
      o.head += .05 * Math.sin(TAU * 1.25 * t);
    } else if (mode == 'bad') {                                 // triste: cabeça baixa, nega com a cabeça e fica de olho meio fechado
      var dec = Math.exp(-T / 1.8);
      o.head += .07 + .1 * dec * Math.sin(TAU * 2.6 * T);
      o.sy -= .012;
      o.blink = Math.max(o.blink, .3);
      o.arm *= .3;
    }
    if (i.tap >= 0) {                                           // toque: pulinho com "squash & stretch", aceno e movimento de cabeça
      var u2 = (t - i.tap) / .62;
      if (u2 >= 1) i.tap = -1; else {
        var bell = Math.sin(Math.PI * u2);
        o.hop += 26 * bell;
        o.sy += .04 * bell - (u2 < .12 ? .06 * (1 - u2 / .12) : 0) - (u2 > .9 ? .05 * ((u2 - .9) / .1) : 0);
        o.head += .1 * Math.sin(TAU * 1.5 * u2) * (1 - u2);
        o.arm += (i.g == 'cut' ? .38 : .22) * Math.sin(TAU * 3 * u2) * (1 - u2);
        o.blink = Math.max(o.blink, tri(u2 - .55, .22));
      }
    }
    return o;
  }

  // ------------------------------------------------------------------ desenho
  function draw(i, t, forced) {
    var en = E; if (!en || !i.as) return;
    var gl = en.gl, U = en.U, c = CH[i.g] || CH.tay, a = i.as, p = forced || pose(i, t);
    var cw = i.cv.width, chh = i.cv.height, k = cw / (W + 2 * PX);
    gl.viewport(0, 0, cw, chh);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, a.par);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, a.rig);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, a.lid);
    gl.uniform2f(U.uRes, cw, chh); gl.uniform2f(U.uOrg, -PX, -PT); gl.uniform1f(U.uK, k);
    gl.uniform2f(U.uPivot, c.pivot[0], c.pivot[1]); gl.uniform2f(U.uArmP, c.arm[0], c.arm[1]);
    gl.uniform4f(U.uEL, c.eyeL[0], c.eyeL[1], c.eyeL[2], c.eyeL[3]); gl.uniform4f(U.uER, c.eyeR[0], c.eyeR[1], c.eyeR[2], c.eyeR[3]);
    gl.uniform1f(U.uHop, p.hop); gl.uniform1f(U.uSy, p.sy); gl.uniform1f(U.uSway, p.sway); gl.uniform1f(U.uHead, p.head);
    gl.uniform1f(U.uArm, p.arm); gl.uniform1f(U.uHair, p.hair); gl.uniform1f(U.uBlink, p.blink); gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uStyle, i.style); gl.uniform2f(U.uGate, c.gate[0], c.gate[1]);
    gl.uniform3f(U.uMain, a.st.main[0], a.st.main[1], a.st.main[2]); gl.uniform3f(U.uAlt, a.st.alt[0], a.st.alt[1], a.st.alt[2]);
    gl.uniform3f(U.uLash, c.lash[0], c.lash[1], c.lash[2]); gl.uniform3f(U.uLref, a.st.lref[0], a.st.lref[1], a.st.lref[2]);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    i.cx.clearRect(0, 0, cw, chh);
    i.cx.drawImage(en.cv, 0, en.cv.height - chh, cw, chh, 0, 0, cw, chh);
  }

  function size(i) {
    var r = i.el.getBoundingClientRect(), h = r.height || parseFloat(i.el.style.height) || 200, dpr = Math.min(root.devicePixelRatio || 1, 2);
    var k = Math.min(h * dpr / H, KMAX), w = Math.round((W + 2 * PX) * k), hh = Math.round((H + PT) * k);
    if (i.cv.width != w || i.cv.height != hh) { i.cv.width = w; i.cv.height = hh; i.dirty = true; }
  }

  function release(i) {
    var j = insts.indexOf(i); if (j >= 0) insts.splice(j, 1);
    if (i.io) { try { i.io.disconnect(); } catch (e) {} }
    if (i.cv && i.cv.parentNode) i.cv.parentNode.removeChild(i.cv);
    if (i.el) { i.el.classList.remove('on'); i.el.removeAttribute('data-on'); var im = i.el.querySelector('img'); if (im) im.style.visibility = ''; }
  }

  function mount(el) {
    if (el.getAttribute('data-on') || failed) return;
    var g = el.getAttribute('data-g'); if (!CH[g]) return;
    var en = engine(); if (!en) return;
    el.setAttribute('data-on', '1');
    var i = { el: el, g: g, src: el.getAttribute('data-src'), style: +el.getAttribute('data-o') || 0, mode: el.getAttribute('data-mode') || '', seed: Math.random() * 6, t0: now(), tap: -1, vis: true, dirty: true, as: null };
    i.cv = document.createElement('canvas'); i.cv.className = 'ac'; i.cv.setAttribute('aria-hidden', 'true'); i.cx = i.cv.getContext('2d');
    insts.push(i); size(i);
    assets(i.src, g).then(function (a) {
      if (!el.isConnected) { release(i); return; }
      i.as = a; i.t0 = now(); el.insertBefore(i.cv, el.firstChild); size(i);
      draw(i, i.t0, reduce ? STILL : null); i.dirty = false;                       // primeiro quadro já na mesma hora, antes de esconder a <img> (sem piscar)
      el.classList.add('on'); var im = el.querySelector('img'); if (im) im.style.visibility = 'hidden';
      i.dirty = reduce; loop();
    }).catch(function () { release(i); });
    if ('IntersectionObserver' in root) { i.io = new IntersectionObserver(function (es) { i.vis = es[es.length - 1].isIntersecting; if (i.vis) { i.dirty = true; loop(); } }); i.io.observe(el); }
    el.addEventListener('pointerdown', function () { i.tap = now(); loop(); });
  }
  function now() { return (root.performance ? root.performance.now() : Date.now()) / 1000; }

  function loop() {
    if (raf || paused || !insts.length || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }
  function frame() {
    raf = 0; if (paused) return;
    var t = now(), alive = 0;
    if (t - lastT >= .032) {                                   // ~30 quadros/s (economiza bateria)
      lastT = t;
      for (var n = insts.length - 1; n >= 0; n--) {
        var i = insts[n];
        if (!i.el.isConnected) { release(i); continue; }
        if (!i.as) continue;
        alive++;
        if (!i.vis) continue;
        size(i);
        if (reduce) { if (i.dirty) { draw(i, 0, STILL); i.dirty = false; } continue; }
        draw(i, t); i.dirty = false;
      }
    } else alive = insts.length;
    if (insts.length && !(reduce && !insts.some(function (i) { return i.dirty; }))) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) loop(); });

  function scan(rootEl) {
    var l = (rootEl || document).querySelectorAll('.abody:not([data-on])');
    for (var n = 0; n < l.length; n++) mount(l[n]);
  }
  function watch() {
    scan();
    if (!root.MutationObserver) return;
    var pend = false;
    new MutationObserver(function () { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; scan(); }); }).observe(document.body, { childList: true, subtree: true });
  }

  // HTML do personagem animado: guia (tay|cut), arquivo colorido, estilo da roupa (número), altura em px, classes e modo (good|bad)
  function html(o) {
    var h = o.h || 200;
    return '<span class="abody ' + (o.cls || '') + '" data-g="' + o.g + '" data-src="' + o.src + '" data-o="' + (o.o || 0) + '"' + (o.mode ? ' data-mode="' + o.mode + '"' : '') + ' style="height:' + h + 'px"><img class="body" src="' + o.src + '" alt="' + (o.alt || '') + '" style="height:100%"></span>';
  }

  root.CodeUpAnim = {
    html: html, scan: scan, ok: function () { return !!E; },
    // para testes: desenha um quadro fixo (sem esperar o relógio)
    _frame: function (el, t, over) {
      var i = insts.filter(function (x) { return x.el == el; })[0]; if (!i || !i.as) return false;
      size(i); var p = pose(i, t); if (over) for (var k in over) p[k] = over[k]; draw(i, t, p); return true;
    },
    _pause: function () { paused = true; }, _resume: function () { paused = false; loop(); },
    _inst: function () { return insts; }
  };
  if (document.readyState == 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})(window);
