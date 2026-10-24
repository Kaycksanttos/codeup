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
    tay: { pivot: [340, 345], arm: [482, 535], armAmp: 0.05, hair: 6, eyeL: [277, 224, 42, 40], eyeR: [406, 256, 33, 38], lash: [.3, .03, .16], gate: [0.30, 0.38],
      hl: [.3, .03, .16], mouth: [340, 287, 21, 15], tilt: .2, mi: [.40, .03, .18], tg: [.96, .40, .55], ck: [[263, 292, 26, 17], [418, 300, 24, 16]] },
    cut: { pivot: [340, 345], arm: [492, 535], armAmp: 0.09, hair: 0, eyeL: [276, 230, 38, 37], eyeR: [405, 262, 35, 38], lash: [.3, .33, .42], gate: [0.52, 0.62],
      hl: [.62, .68, .84], mouth: [335, 288, 21, 15], tilt: .3, mi: [.30, .02, .04], tg: [.78, .24, .30], ck: null }
  };

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform sampler2D uTex,uPar,uRig,uLid;',
    'uniform vec2 uRes,uOrg,uPivot,uArmP;uniform float uK,uHop,uSy,uSway,uHead,uArm,uHair,uBlink,uTime,uStyle,uShine,uFlash,uHap,uMouth,uCheek,uTilt;',
    'uniform vec4 uEL,uER,uMo,uCk1,uCk2;uniform vec2 uGate;uniform vec3 uMain,uAlt,uLref,uLash,uFx,uMi,uTg;',
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
    ' float up=e.y-e.w+uBlink*(e.w+off)+cv*uBlink*e.w*mix(.24,-.3,uHap);',
    ' float lo=e.y+e.w-uBlink*(e.w-off)+cv*uBlink*e.w*mix(.1,-.3,uHap);',
    ' float cov=max(1.-smoothstep(up-1.,up+1.,q.y),smoothstep(lo-1.,lo+1.,q.y));',
    ' float ln=(1.-smoothstep(mix(1.2,2.1,uHap),mix(3.4,5.,uHap),abs(q.y-up)))*smoothstep(.1,.35,uBlink)*smoothstep(.2,.7,lid.a);',
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
    '  if(uCheek>.01&&uCk1.z>.5){',                                                               // bochechas coradas (quando está feliz)
    '   vec2 d1=(q-uCk1.xy)/uCk1.zw,d2=(q-uCk2.xy)/uCk2.zw;',
    '   float bk=max(exp(-dot(d1,d1)*2.4),exp(-dot(d2,d2)*2.4));',
    '   rgb=mix(rgb,vec3(1.,.36,.5)*max(.6,dot(rgb,vec3(.34))*1.2),bk*uCheek*.45);',
    '  }',
    '  if(uMouth>.01){',                                                                          // sorriso aberto: borda, dentes em cima e língua embaixo
    '   vec2 m=rot(q-uMo.xy,-uTilt);m=vec2(m.x/uMo.z,m.y/max(uMo.w*uMouth,1.));',
    '   float lip=-.38*m.x*m.x;',
    '   float r=length(vec2(m.x,max(m.y,0.)));',
    '   float ins=(1.-smoothstep(.92,1.,r))*smoothstep(lip-.08,lip+.03,m.y);',
    '   vec3 mc=mix(uMi,uMi*.65,smoothstep(.72,.95,r));',
    '   float tg=1.-smoothstep(.0,.6,length(vec2(m.x*.85,(m.y-.85)*1.2)));',
    '   mc=mix(mc,uTg,tg*.95);',
    '   float te=(1.-smoothstep(.2,.36,m.y-lip))*(1.-smoothstep(.62,.86,abs(m.x)));',
    '   mc=mix(mc,vec3(.98,.97,.95),te);',
    '   rgb=mix(rgb,mc,ins*clamp(uMouth*1.5,0.,1.));',
    '  }',
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
    ' if(uShine>-2.||uFlash>.001){',                                                               // brilho diagonal (conquista) e pulso de cor
    '  float tt=(q.x*.45+(960.-q.y)*.55)/(640.*.45+960.*.55);float bd=(tt-uShine)/.085;',
    '  rgb=min(rgb+uFx*(exp(-bd*bd)*.65+uFlash*.13),vec3(1.));',
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
      var U = {}; ['uTex', 'uPar', 'uRig', 'uLid', 'uRes', 'uOrg', 'uPivot', 'uArmP', 'uK', 'uHop', 'uSy', 'uSway', 'uHead', 'uArm', 'uHair', 'uBlink', 'uTime', 'uStyle', 'uHap', 'uMouth', 'uCheek', 'uTilt', 'uMo', 'uMi', 'uTg', 'uCk1', 'uCk2', 'uEL', 'uER', 'uGate', 'uMain', 'uAlt', 'uLref', 'uLash', 'uFx', 'uShine', 'uFlash'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
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
  // ---- movimentos extras. move(tipo, T) devolve o quanto cada parte se mexe (T = segundos desde o início). Tudo é função pura do tempo.
  //      hap = olhos de sorriso (^ ^), mo = boca aberta, ck = bochechas. Valem tanto para o modo da tela (data-mode) quanto para o toque/botão.
  var DUR = { jump: 2.6, clap: 3.2, wave: 2.8, dance: 3.2, hop: .62 };
  var KINDS = ['hop', 'wave', 'jump', 'dance', 'clap'];
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function move(k, T, g) {
    var TAU = 6.2832, d = { hop: 0, sy: 0, sway: 0, head: 0, arm: 0, hair: 0, hap: 0, mo: 0, ck: 0 }, ar = g == 'cut' ? .6 : .34, D = DUR[k];
    var en = smooth(T / .25) * smooth((D - T) / .3);
    if (k == 'jump') {                                           // PULADA SORRINDO: agacha, três pulos (o último bem alto), braço pra cima, olhos de sorriso no ar
      var pre = T < .3 ? Math.sin(Math.PI * T / .3) : 0, air = 0;
      d.sy -= .05 * pre; d.head += .04 * pre; d.arm -= .1 * pre;
      [[.3, 46], [1.05, 46], [1.8, 66]].forEach(function (j) {
        var u = (T - j[0]) / .62;
        if (u >= 0 && u <= 1) { var b = Math.sin(Math.PI * u); d.hop += j[1] * b; d.sy += .055 * b - (u < .12 ? .075 * (1 - u / .12) : 0) - (u > .88 ? .065 * ((u - .88) / .12) : 0); d.head -= .08 * b; air = Math.max(air, b); }
      });
      d.arm += ar * en * (.55 + .45 * air) + .09 * Math.sin(TAU * 3 * T) * en;
      d.hap = clamp(air * 2.4 - .5, 0, 1); d.mo = en; d.ck = en;
    } else if (k == 'clap') {                                    // PALMAS: bate no ritmo (2,5 vezes por segundo), cabeça balançando, antebraço subindo e descendo
      var ph = (T / .4) % 1, bt = Math.sin(Math.PI * ph);
      d.hop += 8 * bt * en; d.sy += .02 * (bt - .5) * en; d.head += .05 * Math.sin(TAU * ph) * en;
      d.arm += ar * en * (.3 + .7 * (.5 + .5 * Math.cos(TAU * ph)));
      d.hap = en * .92; d.mo = en; d.ck = en;
    } else if (k == 'wave') {                                    // TCHAU / OI: levanta o braço e balança de um lado para o outro, sorrindo
      var ew = smooth((T - .15) / .35) * smooth((D - .1 - T) / .35), wv = Math.sin(TAU * 2.6 * T);
      d.arm += ew * (g == 'cut' ? .3 + .36 * wv : .3 * wv);          // o antebraço é uma peça só: balança de um lado para o outro (o limite é o desenho)
      d.head += ew * (.06 + .05 * Math.sin(TAU * 1.3 * T)); d.sway += ew * 9 * Math.sin(TAU * 1.3 * T); d.hop += ew * 4 * Math.abs(Math.sin(TAU * 1.3 * T));
      d.mo = .7 * ew; d.ck = .8 * ew; d.hap = ew * clamp((Math.sin(TAU * .9 * T + 2) - .5) * 4, 0, 1);
    } else if (k == 'dance') {                                   // DANÇA: balança o corpo de um lado para o outro e quica no ritmo (120 batidas por minuto), braço bombando
      var w = TAU * T;
      d.sway += 22 * Math.sin(w) * en; d.hop += 12 * Math.abs(Math.sin(Math.PI * T / .5)) * en; d.sy += .035 * (Math.abs(Math.sin(Math.PI * T / .5)) - .5) * en;
      d.head += .1 * Math.sin(w + 1) * en; d.arm += ar * en * (.45 + .55 * Math.sin(TAU * T / .5)); d.hair += 8 * en;
      d.hap = en * clamp(Math.sin(w) * 3, 0, 1); d.mo = en; d.ck = en;
    }
    return d;
  }
  function addMove(o, d, k) {
    o.hop += d.hop * k; o.sy += d.sy * k; o.sway += d.sway * k; o.head += d.head * k; o.arm += d.arm * k; o.hair += d.hair * k;
    o.hap = Math.max(o.hap, d.hap * k); o.mo = Math.max(o.mo, d.mo * k); o.ck = Math.max(o.ck, d.ck * k);
  }
  // ------------------------------------------------------------------ poses (folha de expressões)
  // Cada expressão é uma imagem pronta (public/img/pose/<guia>-<pose>.webp, tabela em poses.js). O personagem "troca de pose" por cima do corpo animado:
  // a pose entra com um pulinho elástico, se mexe (pula, balança, treme, inclina) e os rabiscos do desenho (corações, "?", faíscas) pipocam um a um.
  // A cor escolhida vale também aqui: a imagem colorida do corpo foi feita girando o matiz (HSV), e o app faz o mesmo nas poses ao carregar.
  var TAU2 = 6.2832, PZ = root.CodeUpPoses && root.CodeUpPoses.poses, pzC = {}, pzQ = [], pzPre = {};
  var KIND = { full: [700, 915], sit: [620, 720], bust: [620, 700] }, BASE = 952;     // caixa (largura, altura) em px da imagem 640×960 e linha do chão
  // as 18 expressões da folha da Tay (o Cut tem as mesmas, mais 7 só dele: serio, celular, tedio, deitado, dab, correndo, chorando; 'oi' e 'aponta2' dele repetem tchau e estiloso):
  // oi, piscada, pulo, apaixonado, pensando, ideia, codando, vitoria, coracao, apontando, estiloso, bravo, ops, dormindo, tchau, aponta2, explica, joinha
  var DEF = { oi: 'bob', piscada: 'hop', pulo: 'jump2', apaixonado: 'bob', pensando: 'tilt', ideia: 'startle', codando: 'bob', vitoria: 'jump2', coracao: 'beat', apontando: 'bob', estiloso: 'snap', bravo: 'shake', ops: 'startle', dormindo: 'snooze', tchau: 'wave', aponta2: 'nod', explica: 'bob', joinha: 'nod',
    serio: 'bob', celular: 'bob', tedio: 'bob', deitado: 'bob', dab: 'snap', correndo: 'hop', chorando: 'shake' };
  var FXP = { pulo: 'jump', vitoria: 'jump', piscada: 'star', ideia: 'star', estiloso: 'star', joinha: 'star', coracao: 'star', tchau: 'star', dab: 'star' };
  var FXN = { jump: [[.98, 8, 0], [1.76, 14, 1]], star: [[.2, 10, 0]], clap: [[.3, 5, 0], [1.2, 5, 0]] };
  // sequências de pose por situação: [pose, segundos, movimento, faíscas, balão]
  // win/cp/big: fim de lição, checkpoint e conquistas · ok/perfect: acerto e acerto de primeira · pass: prova aprovada · streak/streak7: dias seguidos
  // think/oops/intro/mapa: telas de apoio · sleep/wake: aluno que voltou depois de muito tempo · idea: dica · explain: teoria
  var SEQ = {
    win: [[['pulo', 2.1, 'jump2', 'jump'], ['joinha', 1.6, 'nod', 'star']], [['vitoria', 2.1, 'jump2', 'jump'], ['piscada', 1.5, 'hop', 'star']], [['apaixonado', 1.2, 'bob'], ['coracao', 1.8, 'beat', 'star'], ['joinha', 1.4, 'nod', 'star']]],
    cp: [[['vitoria', 2.1, 'jump2', 'jump'], ['estiloso', 1.6, 'snap', 'star'], ['joinha', 1.4, 'nod', 'star']]],
    big: [[['ops', 1, 'startle'], ['pulo', 2.1, 'jump2', 'jump'], ['vitoria', 1.9, 'jump2', 'jump'], ['estiloso', 1.7, 'snap', 'star']]],
    think: [[['pensando', 3.2, 'tilt']]], oops: [[['ops', 3.4, 'startle']]], intro: [[['joinha', 2.6, 'nod', 'star']], [['oi', 2.4, 'bob', 'star']]],
    mapa: [[['piscada', 1.7, 'hop', 'star']], [['joinha', 1.6, 'nod', 'star']], [['explica', 1.7, 'bob']], [['aponta2', 1.6, 'nod']]],
    ok: [[['joinha', 1.5, 'nod', 'star']], [['piscada', 1.5, 'hop', 'star']], [['estiloso', 1.5, 'snap', 'star']], [['apontando', 1.5, 'bob', 'star']]],
    perfect: [[['ops', .9, 'startle'], ['vitoria', 2.1, 'jump2', 'jump']]],
    pass: [[['vitoria', 2.1, 'jump2', 'jump'], ['pulo', 1.9, 'jump2', 'jump'], ['coracao', 1.5, 'beat', 'star'], ['estiloso', 1.6, 'snap', 'star'], ['joinha', 1.6, 'nod', 'star']]],
    streak: [[['piscada', 1.4, 'hop', 'star'], ['apaixonado', 1.5, 'bob']], [['coracao', 1.4, 'beat', 'star'], ['pulo', 1.9, 'jump2', 'jump']]],
    streak7: [[['ops', 1, 'startle'], ['vitoria', 2.1, 'jump2', 'jump'], ['estiloso', 1.7, 'snap', 'star']]],
    sleep: [[['dormindo', 600, 'snooze']]],                                              // aluno sumiu por dias: dorme com o travesseiro (os "zzz" aparecem)
    wake: [[['ops', 1, 'startle'], ['tchau', 2.6, 'wave', 'star', 'Oi!']]],             // ele acorda assustado e já dá tchau/oi
    idea: [[['ideia', 3, 'startle', 'star']]], explain: [[['explica', 3.4, 'bob']]]
  };
  // o Cut tem poses a mais, que entram nas mesmas situações: dab (vitórias grandes), correndo (sequência de dias), celular (mapa), serio (acerto "de boa"),
  // tedio → deitado → dormindo (aluno que sumiu: ele cansa de esperar, deita e dorme)
  var SEQ_CUT = (function () {
    var c = {}, k; for (k in SEQ) c[k] = SEQ[k];
    c.win = [SEQ.win[0], SEQ.win[1], [['coracao', 1.8, 'beat', 'star'], ['joinha', 1.4, 'nod', 'star']], [['dab', 1.9, 'snap', 'star'], ['joinha', 1.4, 'nod', 'star']]];
    c.big = [[['ops', 1, 'startle'], ['pulo', 2.1, 'jump2', 'jump'], ['vitoria', 1.9, 'jump2', 'jump'], ['dab', 1.8, 'snap', 'star']]];
    c.pass = [[['vitoria', 2.1, 'jump2', 'jump'], ['pulo', 1.9, 'jump2', 'jump'], ['coracao', 1.5, 'beat', 'star'], ['dab', 1.7, 'snap', 'star'], ['joinha', 1.6, 'nod', 'star']]];
    c.streak = [[['correndo', 1.7, 'hop'], ['piscada', 1.4, 'hop', 'star']], [['coracao', 1.4, 'beat', 'star'], ['pulo', 1.9, 'jump2', 'jump']]];
    c.mapa = [[['piscada', 1.7, 'hop', 'star']], [['joinha', 1.6, 'nod', 'star']], [['explica', 1.7, 'bob']], [['celular', 1.8, 'bob']]];
    c.ok = SEQ.ok.concat([[['serio', 1.5, 'bob']]]);
    c.sleep = [[['tedio', 3.4, 'bob'], ['deitado', 3.4, 'bob'], ['dormindo', 600, 'snooze']]];
    return c;
  })();
  var REELS = { tay: SEQ, cut: SEQ_CUT };
  var ROPT = { win: { delay: .25 }, cp: { delay: .25 }, big: { delay: 1.9 }, think: { delay: .4, period: 9 }, oops: { delay: .4 }, intro: { delay: .4, period: 9 }, mapa: { delay: 2.5, period: 11 }, ok: { delay: .1, period: 'loop' }, perfect: { delay: .1, period: 'loop' }, pass: { delay: .15, period: 'loop' }, streak: { delay: .3, period: 'loop' }, streak7: { delay: .3, period: 'loop' }, sleep: { delay: .15, period: 'loop' }, wake: { delay: .1 }, idea: { delay: .2 }, explain: { delay: .6, period: 12 } };
  var TAPS = { tay: ['piscada', 'apaixonado', 'pulo', 'joinha', 'estiloso', 'ideia', 'tchau', 'coracao', 'explica', 'apontando', 'aponta2'], cut: ['piscada', 'apaixonado', 'pulo', 'joinha', 'estiloso', 'ideia', 'tchau', 'coracao', 'explica', 'apontando', 'dab', 'correndo', 'serio'] };
  var CALM = { tay: 'apontando', cut: 'joinha' };      // depois da bravinha (muitos toques seguidos), ele(a) volta a sorrir
  var lastReel = {};

  // gira o matiz de uma imagem (mesma conta HSV que gerou as cores do corpo: só o matiz muda, brilho e saturação ficam)
  function hueRotate(src, deg, keepReds) {            // keepReds: o Cut tem língua/boca vermelha que não deve virar roxa (a pele dele é preta, não tem matiz)
    var c = document.createElement('canvas'); c.width = src.naturalWidth || src.width; c.height = src.naturalHeight || src.height;
    var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
    var im = x.getImageData(0, 0, c.width, c.height), d = im.data, dh = deg / 60;
    for (var p = 0; p < d.length; p += 4) {
      if (!d[p + 3]) continue;
      var r = d[p], g = d[p + 1], b = d[p + 2], mx = r > g ? (r > b ? r : b) : (g > b ? g : b), mn = r < g ? (r < b ? r : b) : (g < b ? g : b), df = mx - mn;
      if (!df) continue;
      var h = mx == r ? (g - b) / df : mx == g ? (b - r) / df + 2 : (r - g) / df + 4;
      if (keepReds && ((h > -.5 && h < .42) || h > 5.5) && df > .35 * mx) continue;
      h = (h + dh) % 6; if (h < 0) h += 6;
      var k = h | 0, f = h - k, pp = mx - df, q = mx - df * f, tt = mx - df * (1 - f);
      switch (k) { case 0: r = mx; g = tt; b = pp; break; case 1: r = q; g = mx; b = pp; break; case 2: r = pp; g = mx; b = tt; break; case 3: r = pp; g = q; b = mx; break; case 4: r = tt; g = pp; b = mx; break; default: r = mx; g = pp; b = q; }
      d[p] = r; d[p + 1] = g; d[p + 2] = b;
    }
    x.putImageData(im, 0, 0); return c;
  }
  // carrega (e recolore, se a cor escolhida não for a de fábrica) uma pose; guarda as últimas 40
  function poseLoad(g, id, hue) {
    var k = g + '/' + id + '/' + hue, e = pzC[k]; if (e) return e;
    var m = PZ && PZ[g] && PZ[g][id]; if (!m) return Promise.reject(new Error('sem pose'));
    var p = loadImg('/img/pose/' + g + '-' + id + '.webp').then(function (im) { return { img: hue ? hueRotate(im, hue, g == 'cut') : im, m: m }; });
    pzC[k] = p; pzQ.push(k); while (pzQ.length > 40) delete pzC[pzQ.shift()];
    p.catch(function () { if (pzC[k] === p) { delete pzC[k]; var j = pzQ.indexOf(k); if (j >= 0) pzQ.splice(j, 1); } });
    return p;
  }
  function preload(g, hue) {                                     // com o app parado, deixa as poses desse personagem prontas (a vitória não espera a internet)
    if (!PZ || !PZ[g] || reduce) return; var key = g + '/' + hue; if (pzPre[key]) return; pzPre[key] = 1;
    var ids = Object.keys(PZ[g]);
    function next() { if (ids.length) poseLoad(g, ids.shift(), hue).then(idle, idle); }
    function idle() { (root.requestIdleCallback || function (f) { return setTimeout(f, 80); })(next, { timeout: 900 }); }
    next();
  }

  // movimento de cada pose: função pura de (segundos desde que a pose entrou) → deslocamento (px da imagem), giro (rad) e esticada
  function sm(x) { return smooth(x); }
  function mot(n, u, d, kind) {
    var a = kind == 'bust' ? .5 : 1, TAU = 6.2832, o = { x: 0, y: 0, r: 0, sx: 1, sy: 1 }, b, ph, q;
    if (n == 'hop') { ph = (u % .62) / .62; b = Math.sin(Math.PI * ph); o.y = -52 * a * b; o.sy = 1 + .05 * b - (ph < .12 ? .07 * (1 - ph / .12) : 0) - (ph > .88 ? .06 * ((ph - .88) / .12) : 0); o.r = .02 * Math.sin(TAU * u / 1.24); }
    else if (n == 'jump2') {                                     // agacha, dois pulos (o segundo mais alto) com os braços pra cima e pousa balançando
      if (u < .28) o.sy -= .09 * Math.sin(Math.PI * u / .28);
      [[.28, 92], [1, 122]].forEach(function (j) { var w = (u - j[0]) / .7; if (w >= 0 && w <= 1) { var bb = Math.sin(Math.PI * w); o.y -= j[1] * bb; o.sy += .06 * bb - (w < .1 ? .08 * (1 - w / .1) : 0) - (w > .9 ? .09 * ((w - .9) / .1) : 0); o.r += .045 * Math.sin(TAU * w); } });
      if (u > 1.7) { o.sy += .012 * Math.sin(TAU * (u - 1.7) / 1.4); o.r += .02 * Math.sin(TAU * (u - 1.7) / 1.8); }
    } else if (n == 'beat') {                                     // bate no ritmo (2,5 batidas por segundo), balançando de lado
      ph = (u / .4) % 1; b = Math.sin(Math.PI * ph); q = Math.floor(u / .4) % 2 ? 1 : -1;
      o.y = -22 * a * b; o.sy = 1 + .035 * (b - .5); o.r = q * .035 * b;
    } else if (n == 'shake') {                                    // brava: treme de raiva e vai se acalmando
      var am = u < 1 ? 1 : Math.max(.3, 1 - (u - 1) / 1.5);
      o.r = .032 * am * Math.sin(TAU * 13 * u); o.x = 5 * am * Math.sin(TAU * 17 * u); o.sy = 1 + .012 * am * Math.sin(TAU * 9 * u);
    } else if (n == 'tilt') {                                     // pensando: inclina a cabeça e fica balançando devagar
      var e = sm(u / .35); o.r = -.075 * e + .018 * Math.sin(TAU * u / 1.7); o.x = -6 * e; o.y = -5 * (.5 + .5 * Math.sin(TAU * u / 1.7));
    } else if (n == 'nod') {                                      // joinha: balança a cabeça concordando
      o.y = -12 * a * (.5 + .5 * Math.sin(TAU * u * 1.8 - 1.57)); o.r = .04 * Math.sin(TAU * u * .9);
    } else if (n == 'snap') {                                     // dab: encaixa a pose rápido e segue no balanço
      o.r = .13 * (1 - sm(u / .2)) - .05 + .03 * Math.sin(TAU * u / .9); o.y = -14 * a * Math.abs(Math.sin(Math.PI * u / .45)); o.sy = 1 - .02 * (1 - sm(u / .2));
    } else if (n == 'startle') {                                  // susto de alegria: pula de uma vez, treme e relaxa
      var s0 = Math.min(u / .42, 1); o.y = -58 * Math.sin(Math.PI * s0); o.sy = 1 + .07 * Math.sin(Math.PI * s0); o.r = .035 * Math.exp(-4 * u) * Math.sin(TAU * 14 * u);
      if (u > .42) { o.sy += .012 * Math.sin(TAU * (u - .42) / 1.3); o.r += .015 * Math.sin(TAU * (u - .42) / 1.7); }
    } else if (n == 'snooze') {                                   // dormindo: respira fundo, devagar, e a cabeça balança bem de leve
      var br = Math.sin(TAU * u / 3.6); o.sy = 1 + .02 * br; o.r = .014 * Math.sin(TAU * u / 5.2) - .01; o.y = 3 * br; o.x = 1.5 * Math.sin(TAU * u / 5.2);
    } else if (n == 'wave') {                                     // tchau/oi: balança de um lado pro outro no ritmo do aceno
      o.r = .05 * Math.sin(TAU * u * 1.4); o.x = 7 * Math.sin(TAU * u * 1.4 + .6); o.y = -8 * Math.abs(Math.sin(TAU * u * .7)); o.sy = 1 + .012 * Math.sin(TAU * u * 2.8);
    } else if (n == 'walk') {                                     // andando (de costas): sobe e desce a cada passo, balançando de um pé pro outro
      ph = (u / .56) % 1; o.y = -22 * Math.abs(Math.sin(Math.PI * ph)); o.r = .07 * Math.sin(Math.PI * 2 * ph); o.x = 8 * Math.sin(TAU * u / 1.12); o.sy = 1 + .02 * Math.cos(Math.PI * 2 * ph);
    } else {                                                      // bob: respirando
      o.sy = 1 + .014 * Math.sin(TAU * u / 1.5); o.r = .018 * Math.sin(TAU * u / 2.4); o.y = -5 * a * (.5 + .5 * Math.sin(TAU * u / 1.5));
    }
    o.sx = 1 + (1 - o.sy) * .55;                                  // massa constante: esticou na altura, afina na largura
    return o;
  }
  function popIn(u, c) { if (u >= .34) return 1; var k = u / .34 - 1, e = 1 + (c + 1) * k * k * k + c * k * k; return .55 + .45 * e; }

  // escolhe uma das variações da situação (sem repetir a anterior) e converte em passos
  function reelSteps(g, name) {
    var L = REELS[g] && REELS[g][name]; if (!L) return null;
    var k = 0; if (L.length > 1) { do { k = Math.floor(Math.random() * L.length); } while (k == lastReel[g + name]); lastReel[g + name] = k; }
    return L[k];
  }
  function mkSteps(raw) { return raw.map(function (s) { return { p: s[0], d: s[1], m: s[2] || DEF[s[0]] || 'bob', f: s[3] || FXP[s[0]] || null, b: s[4] || null }; }); }
  function attachFx(i) {
    ensureFx(i); if (i.fcv && !i.fcv.parentNode && i.el) { i.el.insertBefore(i.fcv, i.cv ? i.cv.nextSibling : i.el.firstChild); size(i); }
  }
  // toca uma sequência de poses nesse personagem. o = { delay (s, contado a partir de quando ele apareceu), period (repete a cada N s), keep (não vira a base) }
  function startReel(i, raw, o) {
    if (reduce || !PZ || !raw || !PZ[i.g]) return false;
    o = o || {}; var steps = mkSteps(raw), R = { steps: steps, pics: {}, ready: false, t0: 0, total: 0, period: o.period == 'loop' ? 0 : (o.period || 0), req: now() };
    steps.forEach(function (s) { R.total += s.d; if (!PZ[i.g][s.p]) steps = null; });
    if (o.period == 'loop') { R.period = R.total; R.loop = true; }                 // fica repetindo a sequência (telas de comemoração que esperam o toque)
    if (!steps) return false;
    i.rl = R; attachFx(i);
    Promise.all(steps.map(function (s) { return poseLoad(i.g, s.p, i.hue).then(function (pic) { R.pics[s.p] = pic; }); })).then(function () {
      if (i.rl !== R) return;
      var tn = now(), st = Math.max(tn, (o.delay ? (i.t0 || tn) + o.delay : tn));
      if (o.delay && tn - ((i.t0 || tn) + o.delay) > 8) { i.rl = null; return; }     // chegou tarde demais (internet lenta): a comemoração já passou
      R.t0 = st; R.ready = true; loop();
    }, function () { if (i.rl === R) { i.rl = null; if (o.fail) o.fail(); } });
    return true;
  }
  function endReel(i, t) {                                        // acabou: o corpo animado volta com um pulinho, e a sequência de base (se houver) recomeça depois
    i.rl = null; i.tap = t; i.tapFx = -1;
    if (i.base && i.base.o.period) i.baseAt = t + 7;
  }
  // estado da pose agora (ou null se o corpo animado é quem aparece): { p, m, d, u, a, sc, f, b, k, kind }
  function pzState(i, t) {
    var R = i.rl; if (!R || !R.ready) return null;
    var T = t - R.t0; if (T < 0) return null;
    if (R.period) T %= R.period;
    var ex = T - R.total;
    if (ex > .2) { if (!R.period) endReel(i, t); return null; }
    var k = 0, acc = 0, n = R.steps.length, s;
    for (; k < n; k++) { if (T < acc + R.steps[k].d) break; acc += R.steps[k].d; }
    if (k >= n) { k = n - 1; acc -= R.steps[k].d; }
    s = R.steps[k];
    var a = Math.min(1, (R.loop ? t - R.t0 : T) / .1), sc = 1;
    if (ex > 0) { a = Math.min(a, 1 - ex / .2); sc = 1 - .08 * ex / .2; }
    return { p: s.p, m: s.m, d: s.d, u: Math.min(T - acc, s.d), a: a, sc: sc, f: s.f, b: s.b, k: k, R: R };
  }
  function pzDraw(i, cx, r, s, ox, oy) {
    var ps = i.ps; if (!ps) return;
    var pic = ps.R.pics[ps.p]; if (!pic) return;
    var m = pic.m, img = pic.img, kd = KIND[m.k] || KIND.full, sc = Math.min(kd[0] / m.w, kd[1] / m.h);
    var u = ps.u, mo = mot(ps.m, u, ps.d, m.k), pp = popIn(u, 2.6), Z = sc * s * r;
    var X0 = (ox + (320 + mo.x) * s) * r, Y0 = (oy + (BASE + mo.y) * s) * r;
    cx.save(); cx.globalAlpha = Math.max(0, ps.a); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.translate(X0, Y0); cx.rotate(mo.r);
    cx.save(); cx.scale(Z * mo.sx * pp * ps.sc, Z * mo.sy * pp * ps.sc); cx.drawImage(img, 0, 0, m.w, m.h, -m.w / 2, -m.h, m.w, m.h); cx.restore();
    var dl = m.d || [], fade = ps.d > 100 ? 1 : Math.max(0, Math.min(1, (ps.d - u) / .2));
    for (var j = 0; j < dl.length; j++) {                          // rabiscos: pipocam um a um, sobem um pouquinho e ficam pulsando
      var dd = dl[j], age = u - .12 - j * .07; if (age < 0) continue;
      var lx = dd[4] + dd[2] / 2 - m.w / 2, ly = dd[5] + dd[3] / 2 - m.h, vx = lx, vy = ly + m.h * .5, vn = Math.sqrt(vx * vx + vy * vy) || 1;
      var po = popIn(age, 3.2), off = (1 - Math.min(1, age / .3)) * 26;
      cx.save(); cx.globalAlpha = Math.max(0, ps.a) * Math.min(1, age / .08) * fade;
      cx.translate((lx + vx / vn * off) * Z, (ly + vy / vn * off) * Z); cx.rotate(.1 * Math.sin(TAU2 * 1.2 * age + j * 1.7)); var zz = Z * po * (1 + .07 * Math.sin(TAU2 * 2.2 * age + j)) * ps.sc;
      cx.scale(zz, zz); cx.drawImage(img, dd[0], dd[1], dd[2], dd[3], -dd[2] / 2, -dd[3] / 2, dd[2], dd[3]); cx.restore();
    }
    cx.restore();
    if (ps.b) {                                                   // balãozinho de fala ("Oi!")
      var ag = u - .3, du = ps.d - .5; if (ag >= 0 && u < du + .3) {
        var bp = ag < .14 ? ag / .14 * 1.12 : 1.12 - .12 * Math.min(1, (ag - .14) / .1), bl = u > du ? Math.max(0, 1 - (u - du) / .3) : 1;
        cx.save(); cx.globalAlpha = bl; bubble(cx, (ox + 545 * s) * r, (oy + (BASE - m.h * sc + 54) * s) * r, Math.max(9, 62 * s * 1.35) * r * bp, ps.b); cx.restore();
      }
    }
  }

  // ---- faíscas (estrelinhas e confete) ao redor do personagem, calculadas só pelo tempo: [instante, quantidade, anel?]
  var BURSTS = { good: [[.5, 10, 0]], pop: [[.2, 9, 0]], jump: [[.62, 8, 0], [1.37, 8, 0], [2.12, 16, 1]], clap: [[.3, 5, 0]], dance: [[.5, 5, 0], [1.5, 5, 0], [2.5, 7, 0]], epic1: [[.75, 24, 1], [1.65, 14, 0]], epic2: [[.75, 34, 1], [1.65, 26, 1], [2.4, 20, 0]] };
  function bursts(i) { return i.mode == 'epic' ? (i.fx > 1 ? BURSTS.epic2 : BURSTS.epic1) : BURSTS[i.mode] || null; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hex(c) { var n = parseInt(c.slice(1), 16); return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function star(cx, x, y, R, rot) { cx.beginPath(); for (var k = 0; k < 8; k++) { var r = k % 2 ? R * .26 : R, a = rot + k * Math.PI / 4; cx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } cx.closePath(); cx.fill(); }
  // ícones do "aplauso" e da "dança": mãozinhas batendo palma e notas musicais que sobem ao redor do personagem
  function clapIcon(cx, x, y, R, rot) {
    cx.save(); cx.translate(x, y); cx.rotate(rot); cx.lineJoin = 'round'; cx.lineCap = 'round';
    [-1, 1].forEach(function (h) {
      cx.save(); cx.translate(h * R * .3, R * .12); cx.rotate(-h * .48);
      cx.beginPath(); cx.moveTo(-R * .33, R * .6); cx.lineTo(-R * .33, -R * .3); cx.quadraticCurveTo(-R * .33, -R * .68, 0, -R * .68); cx.quadraticCurveTo(R * .33, -R * .68, R * .33, -R * .3); cx.lineTo(R * .33, R * .6); cx.quadraticCurveTo(R * .33, R * .82, 0, R * .82); cx.quadraticCurveTo(-R * .33, R * .82, -R * .33, R * .6); cx.closePath();
      cx.fillStyle = h < 0 ? '#fbbf24' : '#fcd34d'; cx.fill(); cx.lineWidth = R * .09; cx.strokeStyle = '#b45309'; cx.stroke();
      cx.beginPath(); cx.moveTo(-R * .11, -R * .58); cx.lineTo(-R * .11, -R * .1); cx.moveTo(R * .11, -R * .58); cx.lineTo(R * .11, -R * .1); cx.lineWidth = R * .05; cx.strokeStyle = 'rgba(180,83,9,.55)'; cx.stroke();
      cx.restore();
    });
    cx.strokeStyle = '#fff'; cx.lineWidth = R * .11;
    [-.75, 0, .75].forEach(function (a) { var ca = Math.cos(a - 1.5708), sa = Math.sin(a - 1.5708); cx.beginPath(); cx.moveTo(ca * R * 1.05, sa * R * 1.05 - R * .45); cx.lineTo(ca * R * 1.45, sa * R * 1.45 - R * .45); cx.stroke(); });
    cx.restore();
  }
  function noteIcon(cx, x, y, R, rot, col) {
    cx.save(); cx.translate(x, y); cx.rotate(rot); cx.fillStyle = col; cx.strokeStyle = col; cx.lineCap = 'round'; cx.lineWidth = R * .16;
    cx.beginPath(); cx.ellipse(-R * .2, R * .55, R * .36, R * .26, -.45, 0, 6.2832); cx.fill();
    cx.beginPath(); cx.moveTo(R * .12, R * .45); cx.lineTo(R * .12, -R * .75); cx.quadraticCurveTo(R * .15, -R * .3, R * .62, -R * .1); cx.stroke();
    cx.restore();
  }
  function bubble(cx, X, Y, R, txt) {                            // balãozinho de fala ("Oi!") com a fonte do app
    var w = R * 2.2, h = R * 1.4, x = -w / 2, y = -h / 2, rd = h / 2;
    cx.save(); cx.translate(X, Y); cx.fillStyle = '#fff'; cx.strokeStyle = 'rgba(15,23,42,.28)'; cx.lineWidth = Math.max(1, R * .06); cx.lineJoin = 'round';
    cx.beginPath(); cx.moveTo(x + rd, y); cx.lineTo(x + w - rd, y); cx.arcTo(x + w, y, x + w, y + rd, rd); cx.arcTo(x + w, y + h, x + w - rd, y + h, rd);
    cx.lineTo(x + w * .36, y + h); cx.lineTo(x + w * .16, y + h + R * .42); cx.lineTo(x + w * .2, y + h);
    cx.lineTo(x + rd, y + h); cx.arcTo(x, y + h, x, y + h - rd, rd); cx.arcTo(x, y, x + rd, y, rd); cx.closePath(); cx.fill(); cx.stroke();
    cx.fillStyle = '#1e293b'; cx.font = '900 ' + Math.round(R * .92) + 'px Nunito, system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(txt, 0, R * .04);
    cx.restore();
  }
  function icons(i, t) {                                         // efeitos de ícones ativos: [tipo, tempo desde o início, sal]
    var L = [];
    if (i.mode == 'clap' || i.mode == 'dance') L.push([i.mode, t - i.t0, 1]);
    if (i.mode == 'wave') L.push(['wave', (t - i.t0) % 12, 1]);
    if (i.react && (i.react.k == 'clap' || i.react.k == 'dance' || i.react.k == 'wave')) L.push([i.react.k, t - i.react.t, 2]);
    return L;
  }
  function fxDraw(i, t) {
    var cx = i.fx2d; if (!cx) return;
    var cv = i.fcv; cx.clearRect(0, 0, cv.width, cv.height);
    if (reduce) return;
    var r = cv.width / (2.4 * i.bw), s = i.bh / H, ox = .7 * i.bw, oy = .45 * i.bh;
    if (i.ps) pzDraw(i, cx, r, s, ox, oy);                       // a pose da folha (e os rabiscos dela) por baixo das faíscas
    var list = (bursts(i) || []).map(function (b) { return [b[0], b[1], b[2], t - i.t0]; });
    if (i.ps && i.ps.f && FXN[i.ps.f]) FXN[i.ps.f].forEach(function (b) { list.push([b[0], b[1], b[2], i.ps.u, 40 + i.ps.k]); });
    if (i.tapFx >= 0) { if (t - i.tapFx > 2) i.tapFx = -1; else list.push([0, 8, 0, t - i.tapFx, 7]); }
    if (i.react && BURSTS[i.react.k]) BURSTS[i.react.k].forEach(function (b) { list.push([b[0], b[1], b[2], t - i.react.t, 11]); });
    var ics = icons(i, t);
    if (!list.length && !ics.length) return;
    var pal = [i.fxc, '#ffffff', '#ffd43b', i.fxl];
    list.forEach(function (b) {
      var age = b[3] - b[0]; if (age < 0 || age > 2) return;
      var rnd = rng(7919 * (b[4] || 1) + Math.round(b[0] * 100) + 13 * i.fxs);
      if (b[2] && age < .9) {                                   // anel que se abre a partir do corpo
        cx.save(); cx.globalAlpha = (1 - age / .9) * .55; cx.strokeStyle = i.fxc; cx.lineWidth = Math.max(1, 7 * (1 - age / .9)) * r;
        cx.beginPath(); cx.ellipse((ox + 320 * s) * r, (oy + 560 * s) * r, (60 + age * 520) * s * r, (30 + age * 260) * s * r, 0, 0, 6.2832); cx.stroke(); cx.restore();
      }
      for (var k = 0; k < b[1]; k++) {
        var ang = rnd() * 6.2832, rx = 175 + rnd() * 170, ry = 230 + rnd() * 230, sp = 30 + rnd() * 120, life = .9 + rnd() * .9, kind = rnd(), sz = 7 + rnd() * 11, col = pal[Math.floor(rnd() * pal.length)], ph = rnd() * 6.2832, rt = rnd() * 6.2832;
        var u = age / life; if (u > 1) continue;
        var x = 320 + Math.cos(ang) * rx + Math.cos(ang) * sp * age, y = 480 + Math.sin(ang) * ry * .85 + Math.sin(ang) * sp * age - 50 * age + (kind > .86 ? 140 * age * age : 0);
        cx.save(); cx.globalAlpha = Math.max(0, (u < .15 ? u / .15 : 1 - (u - .15) / .85) * (.65 + .35 * Math.sin(age * 18 + ph))); cx.fillStyle = col;
        var X = (ox + x * s) * r, Y = (oy + y * s) * r, R = sz * r * (1 - u * .35) * Math.max(1.1, s * 4);
        if (kind > .86) { cx.translate(X, Y); cx.rotate(rt + age * 6); cx.fillRect(-R * .55, -R * .3, R * 1.1, R * .6); }
        else if (kind > .62) { cx.beginPath(); cx.arc(X, Y, R * .45, 0, 6.2832); cx.fill(); }
        else star(cx, X, Y, R * 1.15, rt + age * 1.5);
        cx.restore();
      }
    });
    ics.forEach(function (e) {
      if (e[0] == 'wave') {                                       // "Oi!" aparece enquanto ela acena
        var T0 = e[1], u0 = (T0 - .2) / (DUR.wave - .5); if (u0 < 0 || u0 > 1) return;
        var pp = u0 < .12 ? u0 / .12 * 1.12 : 1.12 - .12 * Math.min(1, (u0 - .12) / .1), al = u0 > .85 ? (1 - u0) / .15 : 1;
        cx.save(); cx.globalAlpha = al; bubble(cx, (ox + 548 * s) * r, (oy + 70 * s) * r, Math.max(9, 62 * s * 1.35) * r * pp, 'Oi!'); cx.restore(); return;
      }
      var kind = e[0], T = e[1], per = kind == 'clap' ? .4 : .5, life = kind == 'clap' ? 1.15 : 1.4, n = Math.floor(Math.min(T, DUR[kind] - .2) / per);
      for (var k = Math.max(0, n - 4); k <= n; k++) {
        var age = T - k * per, u = age / life; if (age < 0 || u > 1) continue;
        var rn = rng(500 * e[2] + k * 17 + 13 * i.fxs), side = k % 2 ? 1 : -1;
        var x = 320 + side * (300 + rn() * 90) + 14 * Math.sin(age * 5 + k), y = 640 - rn() * 260 - 200 * u, sz = (kind == 'clap' ? 66 : 52) * (.85 + rn() * .4);
        var sc = u < .2 ? u / .2 * 1.15 : 1.15 - .15 * Math.min(1, (u - .2) / .2), X = (ox + x * s) * r, Y = (oy + y * s) * r, R = Math.max(7, sz * s * 1.35) * r * sc;
        cx.save(); cx.globalAlpha = u < .7 ? 1 : (1 - u) / .3;
        if (kind == 'clap') clapIcon(cx, X, Y, R, side * .18 * Math.sin(age * 9)); else noteIcon(cx, X, Y, R, side * .15, k % 2 ? '#ffffff' : i.fxl);
        cx.restore();
      }
    });
  }

  function pose(i, t) {
    var c = CH[i.g] || CH.tay, TAU = 6.2832, s = i.seed, mode = i.mode;
    var o = { hop: 0, sy: 1, sway: 0, head: 0, arm: 0, hair: c.hair, blink: 0, hap: 0, mo: 0, ck: 0 };
    var calm = mode == 'bad' ? .5 : 1;
    o.sy = 1 + .009 * Math.sin(TAU * t / 3.4 + s) * calm;
    o.sway = 5 * Math.sin(TAU * t / 5.2 + s * 1.3) * calm;
    o.head = .03 * Math.sin(TAU * t / 4.1 + 1 + s) + .013 * Math.sin(TAU * t / 2.3 + s);
    o.arm = c.armAmp * Math.sin(TAU * t / (i.g == 'cut' ? 2.0 : 2.8) + s);
    o.blink = blinkAt(t, s);
    var T = t - i.t0;                                           // tempo desde que o personagem apareceu
    var bs = bursts(i); if (bs) { var fl = 0; bs.forEach(function (b) { var d = (T - b[0]) / .2; fl += Math.exp(-d * d); }); o.flash = Math.min(1, fl) * (mode == 'epic' ? .9 : .5); }
    if (mode == 'epic') {                                       // CONQUISTA: agacha, pula bem alto com os braços para cima, brilho passa pelo corpo, mais dois pulos e segue comemorando
      var pre = T < .45 ? Math.sin(Math.PI * T / .45) : 0;
      o.sy -= .07 * pre; o.head += .06 * pre; o.arm -= .15 * pre;
      [[.45, 58], [1.4, 36], [2.15, 22]].forEach(function (j) {
        var uu = (T - j[0]) / .62;
        if (uu >= 0 && uu <= 1) { var b = Math.sin(Math.PI * uu); o.hop += j[1] * b; o.sy += .055 * b - (uu < .12 ? .075 * (1 - uu / .12) : 0) - (uu > .88 ? .065 * ((uu - .88) / .12) : 0); o.head -= .09 * b; }
      });
      var up = clamp((T - .3) / .4, 0, 1) * (T < 3.2 ? 1 : clamp(1 - (T - 3.2) / .8, 0, 1));
      o.arm += ((i.g == 'cut' ? .6 : .34) + .14 * Math.sin(TAU * 3.2 * T)) * up;
      o.head += .04 * Math.sin(TAU * 1.3 * t);
      var sp = (T - .55) / .8, sq = (T - 1.8) / .8;
      if (sp >= 0 && sp <= 1) o.shine = -.25 + 1.5 * sp; else if (i.fx > 1 && sq >= 0 && sq <= 1) o.shine = -.25 + 1.5 * sq;
      if (T >= 3.2) { mode = 'good'; T = T - 3.2 + 2.4; }       // depois disso, comemora de vez em quando como no "good"
    } else if (mode == 'pop') {                                 // acabou de trocar um item: pulinho e um brilho
      var up2 = T / .6;
      if (up2 >= 0 && up2 <= 1) { var b2 = Math.sin(Math.PI * up2); o.hop += 20 * b2; o.sy += .04 * b2 - (up2 < .15 ? .05 * (1 - up2 / .15) : 0); o.head += .05 * Math.sin(TAU * up2); o.shine = -.25 + 1.5 * up2; }
    }
    if (mode == 'jump' || mode == 'clap' || mode == 'dance' || mode == 'wave') {      // movimentos extras (pulo sorrindo, palmas, dança, tchau)
      var m0 = mode, MT = m0 == 'wave' ? T % 12 : T;               // "wave" (oi da tela inicial) se repete a cada 12 s
      if (MT < DUR[m0]) addMove(o, move(m0, MT, i.g), 1);
      else if (m0 != 'wave') { mode = 'good'; T = T - DUR[m0] + 2.4; }   // depois de terminar, segue comemorando como no "good"
    }
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
    if (i.react) {                                              // movimento pedido por toque/botão (pulo, palmas, tchau, dança), com entrada e saída suaves
      var RT = t - i.react.t;
      if (RT >= DUR[i.react.k]) i.react = null; else addMove(o, move(i.react.k, RT, i.g), 1);
    }
    o.blink = Math.max(o.blink, o.hap);
    return o;
  }

  // ------------------------------------------------------------------ desenho
  function draw(i, t, forced) {
    if (!i.spr && (!E || !i.as)) return;
    i.ps = reduce ? null : pzState(i, t);                          // pose da folha em cena? (null = só o corpo animado)
    var pa = i.ps ? Math.max(0, Math.min(1, i.ps.a)) : 0;
    if (i.cv) { var op = pa >= 1 ? 0 : 1 - pa; if (i.op !== op) { i.cv.style.opacity = op >= 1 ? '' : String(op); i.op = op; } }
    else if (i.el) { var hid = pa > .5; if (hid !== i.hid) { var im0 = i.el.querySelector('img'); if (im0) im0.style.visibility = hid ? 'hidden' : ''; i.hid = hid; } }
    if (!i.spr && pa < 1) drawRig(i, t, forced);                   // com a pose cobrindo tudo, nem gasta o WebGL
    if (i.fx2d) fxDraw(i, t);
  }
  function drawRig(i, t, forced) {
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
    gl.uniform1f(U.uHap, p.hap || 0); gl.uniform1f(U.uMouth, p.mo || 0); gl.uniform1f(U.uCheek, p.ck || 0); gl.uniform1f(U.uTilt, c.tilt);
    gl.uniform4f(U.uMo, c.mouth[0], c.mouth[1], c.mouth[2], c.mouth[3]); gl.uniform3f(U.uMi, c.mi[0], c.mi[1], c.mi[2]); gl.uniform3f(U.uTg, c.tg[0], c.tg[1], c.tg[2]);
    var ck = c.ck; gl.uniform4f(U.uCk1, ck ? ck[0][0] : 0, ck ? ck[0][1] : 0, ck ? ck[0][2] : 0, ck ? ck[0][3] : 1); gl.uniform4f(U.uCk2, ck ? ck[1][0] : 0, ck ? ck[1][1] : 0, ck ? ck[1][2] : 1, ck ? ck[1][3] : 1);
    gl.uniform1f(U.uShine, p.shine === undefined ? -5 : p.shine); gl.uniform1f(U.uFlash, p.flash || 0); gl.uniform3f(U.uFx, i.fxr[0], i.fxr[1], i.fxr[2]);
    var hp = p.hap || 0; gl.uniform3f(U.uLash, c.lash[0] + (c.hl[0] - c.lash[0]) * hp, c.lash[1] + (c.hl[1] - c.lash[1]) * hp, c.lash[2] + (c.hl[2] - c.lash[2]) * hp); gl.uniform3f(U.uLref, a.st.lref[0], a.st.lref[1], a.st.lref[2]);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    i.cx.clearRect(0, 0, cw, chh);
    i.cx.drawImage(en.cv, 0, en.cv.height - chh, cw, chh, 0, 0, cw, chh);
  }

  function size(i) {
    var r = i.el.getBoundingClientRect(), h = r.height || parseFloat(i.el.style.height) || 200, dpr = Math.min(root.devicePixelRatio || 1, 2);
    var k = Math.min(h * dpr / H, KMAX), w = Math.round((W + 2 * PX) * k), hh = Math.round((H + PT) * k);
    if (i.cv && (i.cv.width != w || i.cv.height != hh)) { i.cv.width = w; i.cv.height = hh; i.dirty = true; }
    i.bw = r.width || h * 2 / 3; i.bh = h;
    if (i.fcv) { var rr = Math.min(dpr, 1000 / (2.4 * i.bw), 800 / (1.5 * i.bh)), fw = Math.round(2.4 * i.bw * rr), fh = Math.round(1.5 * i.bh * rr); if (i.fcv.width != fw || i.fcv.height != fh) { i.fcv.width = fw; i.fcv.height = fh; i.dirty = true; } }
  }

  function release(i) {
    var j = insts.indexOf(i); if (j >= 0) insts.splice(j, 1);
    if (i.io) { try { i.io.disconnect(); } catch (e) {} }
    if (i.cv && i.cv.parentNode) i.cv.parentNode.removeChild(i.cv);
    if (i.fcv && i.fcv.parentNode) i.fcv.parentNode.removeChild(i.fcv);
    if (i.el) { i.el.classList.remove('on'); i.el.removeAttribute('data-on'); var im = i.el.querySelector('img'); if (im) im.style.visibility = ''; }
  }

  function mount(el) {
    if (el.getAttribute('data-on')) return;
    var g = el.getAttribute('data-g'); if (!CH[g]) return;
    var rn = el.getAttribute('data-reel') || '', rigless = el.getAttribute('data-rig') == '0';
    var en = rigless || failed ? null : engine();
    if (!en && !(rn && PZ && !reduce)) return;                     // sem WebGL (e sem pose para mostrar): fica a <img> parada
    el.setAttribute('data-on', '1');
    var i = { el: el, g: g, src: el.getAttribute('data-src'), style: +el.getAttribute('data-o') || 0, mode: el.getAttribute('data-mode') || '', seed: Math.random() * 6, t0: now(), tap: -1, tapFx: -1, vis: true, dirty: true, as: null, spr: !en, hue: +el.getAttribute('data-hue') || 0, reelName: rn, taps: [] };
    if (rn && PZ && !reduce && i.mode == 'wave') i.mode = '';       // com as poses da folha, quem cumprimenta é a pose (o aceno do corpo fica de reserva)
    var fxc = el.getAttribute('data-fxc'); i.fxc = /^#[0-9a-f]{6}$/i.test(fxc || '') ? fxc : '#ffd43b'; i.fx = +el.getAttribute('data-fx') || 1; i.fxs = Math.floor(Math.random() * 1000);
    var fx3 = hex(i.fxc).map(function (v) { return v + (1 - v) * .35; }); i.fxr = fx3; i.fxl = 'rgb(' + fx3.map(function (v) { return Math.round(v * 255); }).join(',') + ')';
    if (i.spr) {                                                  // só a pose (ex.: o personagem andando no mapa): sem WebGL e sem canvas do corpo
      insts.push(i); size(i); i.t0 = now(); attachFx(i); kick(i); preloadLater(i); loop();
    } else {
      i.cv = document.createElement('canvas'); i.cv.className = 'ac'; i.cv.setAttribute('aria-hidden', 'true'); i.cx = i.cv.getContext('2d');
      insts.push(i); size(i);
      if (/^(epic|good|pop|jump|clap|dance|wave)$/.test(i.mode) && !reduce) ensureFx(i);
      assets(i.src, g).then(function (a) {
        if (!el.isConnected) { release(i); return; }
        i.as = a; i.t0 = now(); el.insertBefore(i.cv, el.firstChild); if (i.fcv) el.insertBefore(i.fcv, i.cv.nextSibling); size(i);
        draw(i, i.t0, reduce ? STILL : null); i.dirty = false;                       // primeiro quadro já na mesma hora, antes de esconder a <img> (sem piscar)
        el.classList.add('on'); var im = el.querySelector('img'); if (im) im.style.visibility = 'hidden';
        i.dirty = reduce; kick(i); preloadLater(i); loop();
      }).catch(function () { release(i); });
    }
    if ('IntersectionObserver' in root) { i.io = new IntersectionObserver(function (es) { i.vis = es[es.length - 1].isIntersecting; if (i.vis) { i.dirty = true; loop(); } }); i.io.observe(el); }
    if (!i.spr) el.addEventListener('pointerdown', function () { trigger(i, null, false); });
  }
  function preloadLater(i) { if (PZ && !reduce) setTimeout(function () { preload(i.g, i.hue); }, 900); }
  // a tela pediu uma sequência (data-reel): começa quando o personagem aparece; as que se repetem (period) viram a "base" e recomeçam sozinhas
  function kick(i) {
    var nm = i.reelName; if (!nm || !PZ || reduce) return;
    var o = ROPT[nm] || {}, raw = reelSteps(i.g, nm); if (!raw) return;
    if (o.period) i.base = { name: nm, o: o };
    startReel(i, raw, o);
  }
  // toque no personagem (ou botão do Perfil): faz uma expressão da folha (sem repetir a última). Muitos toques seguidos o deixam bravinho — e ele ri de volta.
  // Sem as poses (ou 'wave'/'dance'… pedidos de propósito), faz o movimento do corpo animado: pulinho, tchau, pulo, dança ou palmas.
  function trigger(i, k, force) {
    var tn = now();
    if (PZ && PZ[i.g] && !reduce && (!k || k.indexOf('p:') == 0)) {
      if (!force && i.rl && !i.rl.period && tn - i.rl.req < .45) return;
      var id = k ? k.slice(2) : null, raw;
      i.taps = (i.taps || []).filter(function (x) { return tn - x < 3.5; }); if (!k) i.taps.push(tn);
      if (!k && i.taps.length >= 5) { i.taps = []; id = 'bravo'; raw = [['bravo', 1.7, 'shake'], [CALM[i.g], 1.5, DEF[CALM[i.g]] || 'bob', 'star']]; }
      else {
        if (!id) { do { id = TAPS[i.g][Math.floor(Math.random() * TAPS[i.g].length)]; } while (id == i.lastP); }
        raw = [[id, 2.4, DEF[id] || 'bob', FXP[id] || null]];
      }
      i.lastP = id; i.react = null; i.tap = -1;
      if (startReel(i, raw, { fail: function () { i.tap = i.tapFx = now(); loop(); } })) { if (root.CodeUpSfx) CodeUpSfx.play('pop'); loop(); return; }
    }
    if (!force && i.react && tn - i.react.t < DUR[i.react.k] - .3) return;
    if (!k || k.indexOf('p:') == 0) { k = null; do { k = KINDS[Math.floor(Math.random() * KINDS.length)]; } while (k == i.lastK); }
    i.lastK = k;
    if (k == 'hop') { i.tap = i.tapFx = tn; i.react = null; } else { i.react = { k: k, t: tn }; i.tap = -1; }
    if (!reduce) { ensureFx(i); if (i.fcv && !i.fcv.parentNode && i.as) { i.el.insertBefore(i.fcv, i.cv.nextSibling); size(i); } }
    loop();
  }
  function ensureFx(i) {
    if (i.fcv) return; i.fcv = document.createElement('canvas'); i.fcv.className = 'afx'; i.fcv.setAttribute('aria-hidden', 'true'); i.fx2d = i.fcv.getContext('2d'); size(i);
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
        if (!i.as && !i.spr) continue;
        alive++;
        if (!i.vis) continue;
        if (!i.rl && i.base && i.baseAt && t >= i.baseAt) { i.baseAt = 0; startReel(i, reelSteps(i.g, i.base.name), { period: i.base.o.period }); }
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
    return '<span class="abody ' + (o.cls || '') + '" data-g="' + o.g + '" data-src="' + o.src + '" data-o="' + (o.o || 0) + '"' + (o.mode ? ' data-mode="' + o.mode + '"' : '') + (o.fx ? ' data-fx="' + (+o.fx || 1) + '"' : '') + (/^#[0-9a-f]{6}$/i.test(o.fxc || '') ? ' data-fxc="' + o.fxc + '"' : '') + (/^[a-z]+$/.test(o.reel || '') ? ' data-reel="' + o.reel + '"' : '') + (+o.hue ? ' data-hue="' + Math.round(+o.hue) + '"' : '') + (o.rig === 0 ? ' data-rig="0"' : '') + ' style="height:' + h + 'px"><img class="body" src="' + o.src + '" alt="' + (o.alt || '') + '" style="height:100%"></span>';
  }

  root.CodeUpAnim = {
    html: html, scan: scan, ok: function () { return !!E; },
    // faz o personagem desse elemento fazer um movimento: 'hop' | 'wave' | 'jump' | 'dance' | 'clap' (sem nome, sorteia). Devolve false se ele ainda não está na tela.
    // 'p:<pose>' mostra uma expressão da folha (ex.: 'p:love'); 'hop'|'wave'|'jump'|'dance'|'clap' são movimentos do corpo animado. Devolve false se não deu.
    play: function (el, k) {
      if (reduce) return false; var i = insts.filter(function (x) { return x.el == el; })[0]; if (!i || (!i.as && !i.spr)) return false;
      if (k && k.indexOf('p:') == 0) { if (!PZ || !PZ[i.g] || !PZ[i.g][k.slice(2)]) return false; } else if (k && KINDS.indexOf(k) < 0) return false;
      trigger(i, k || null, true); return true;
    },
    poses: function (g) { return PZ && PZ[g] ? Object.keys(PZ[g]) : []; },
    preload: preload,
    // para testes: desenha um quadro fixo (sem esperar o relógio)
    _frame: function (el, t, over) {
      var i = insts.filter(function (x) { return x.el == el; })[0]; if (!i || !i.as) return false;
      size(i); var p = pose(i, t); if (over) for (var k in over) p[k] = over[k]; draw(i, t, p); return true;
    },
    // para testes: mostra uma pose parada no instante u (segundos) do movimento; devolve uma Promise (a pose precisa carregar)
    _pose: function (el, id, u, mv, bub) {
      var i = insts.filter(function (x) { return x.el == el; })[0]; if (!i || !PZ) return Promise.resolve(false);
      return poseLoad(i.g, id, i.hue).then(function (pic) {
        var R = { steps: [{ p: id, d: 99, m: mv || DEF[id] || 'bob', f: null, b: bub || null }], pics: {}, ready: true, t0: 0, total: 99, period: 0, req: 0 }; R.pics[id] = pic;
        i.rl = R; attachFx(i); size(i); draw(i, u, null); return true;
      }, function () { return false; });
    },
    _pause: function () { paused = true; }, _resume: function () { paused = false; loop(); },
    _inst: function () { return insts; }
  };
  if (document.readyState == 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})(window);
