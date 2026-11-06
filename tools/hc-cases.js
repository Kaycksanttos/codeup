// páginas de teste do tools/hc-diff.js (HTML completo ou { html, layout, only })
module.exports = [
  // padrões do navegador
  '<h1>a</h1><h2>b</h2><h3>c</h3><h4>d</h4><h5>e</h5><h6>f</h6><p>par<b>neg<i>itl</i></b> <em>e</em> <strong>s</strong> <small>sm</small> <u>u</u> <s>s</s> <sub>x</sub><sup>y</sup> <mark>m</mark> <code>c</code> <kbd>k</kbd></p>',
  '<ul><li>a<ul><li>b<ul><li>c</ul></ul></ul><ol><li>1<li>2</ol><dl><dt>t<dd>d</dl><blockquote>q</blockquote><pre>p</pre><hr><a href="#">l</a><a>nolink</a>',
  '<table><caption>c</caption><thead><tr><th>h<th>h2<tbody><tr><td>a<td>b</table><button>b</button><input type=text><img src=x alt=y><textarea>t</textarea><select><option>o</select>',
  '<nav><header><main><section><article><aside><footer><figure><figcaption>x</figcaption></figure></footer></aside></article></section></main></header></nav><div><span>s</span></div>',
  // cascata, especificidade e herança
  '<style>p{color:red}.a{color:blue}#x{color:green}p.a{color:orange}</style><p>1</p><p class=a>2</p><p class=a id=x>3</p><p class=a id=x style="color:purple">4</p>',
  '<style>p{color:red!important}p.a{color:blue}.b{color:green}</style><p class="a b" style="color:purple">1</p>',
  '<style>div p{color:red}div>p{color:blue}div p.z{color:green} p:first-child{background:yellow} li:nth-child(2n+1){color:red} li:last-child{color:blue}</style><div><p>1<p class=z>2</div><ul><li>a<li>b<li>c<li>d</ul>',
  '<style>body{color:#336;font-size:20px;line-height:1.5;font-family:Arial,sans-serif} h1{font-size:1.5em} p{font-size:80%} span{font-size:.5em}</style><h1>t</h1><p>a<span>b</span></p>',
  '<style>html{font-size:20px} p{font-size:2rem;margin:1.5rem 2em;padding:.5em 10px} div{font-size:10px} div p{font-size:3em}</style><p>a</p><div><p>b</p></div>',
  // atalhos
  '<style>p{margin:10px 20px 30px;padding:5px 15px;border:2px dashed #f00;border-radius:8px 4px} .b{border-top:3px solid blue;border-bottom:none} .c{margin:0 auto;border:thin solid} .d{border-width:1px 2px;border-style:solid dotted;border-color:red green blue}</style><p>a</p><p class=b>b</p><p class=c>c</p><p class=d>d</p>',
  '<style>p{background:#f00 url(a.png) no-repeat center/cover} .a{background:blue} .b{background:linear-gradient(red,blue)} .c{background-color:rgba(0,0,0,.5)} .d{background:rgb(10 20 30 / 40%)}</style><p>a</p><p class=a>b</p><p class=b>c</p><p class=c>d</p><p class=d>e</p>',
  '<style>p{font:italic bold 18px/1.4 "Open Sans",Arial,sans-serif} .a{font:14px serif} .b{font-weight:700;font-style:oblique;font-family:Georgia,"Times New Roman",serif}</style><p>a</p><p class=a>b</p><p class=b>c</p>',
  '<style>div{display:flex;flex:1;flex-direction:column;flex-wrap:wrap;gap:10px 20px;justify-content:space-between;align-items:center} .a{flex:1 1 200px} .b{flex:none} .c{flex:auto} .d{flex:2}</style><div><p class=a>a<p class=b>b<p class=c>c<p class=d>d</div>',
  '<style>p{text-align:center;text-decoration:underline;text-transform:uppercase;letter-spacing:2px;line-height:30px;font-weight:bolder;opacity:.5} a{text-decoration:none} .a{text-decoration:underline overline;list-style:square inside} </style><p>a</p><a href="#">b</a><ul class=a><li>x</ul>',
  '<style>p{color:rgb(255 0 0);background:hsl(120,100%,50%);border-color:#abc;outline:2px solid red} .a{color:HSL(210deg 50% 40% / .5)} .b{color:#ABCD} .c{color:currentColor;border:1px solid} .d{color:transparent}</style><p>a</p><p class=a>b</p><p class=b>c</p><p class=c>d</p><p class=d>e</p>',
  // declarações inválidas e tipos de valor
  '<style>p{color:redd;font-size:20;margin:10;width:50;display:flexx;padding:-5px;border:1px;opacity:2;z-index:1.5;colour:red}</style><p>a</p>',
  '<style>p{color:red;color:notacolor;font-size:20px;font-size:abc} .a{margin:5px;margin:bad}</style><p>a</p><p class=a>b</p>',
  // variáveis e calc
  '<style>:root{--c:#09f;--sp:8px;--f:Arial} p{color:var(--c);margin:var(--sp);font-family:var(--f),serif;padding:calc(var(--sp)*2);width:calc(100% - 20px)} .a{--c:red} .b{color:var(--zzz,green)} .c{color:var(--zzz)}</style><p>a</p><p class=a>b</p><p class=b>c</p><p class=c>d</p>',
  '<style>p{font-size:calc(10px + 1em);margin:calc(2 * 5px) min(10px,5px) max(1rem,2px) clamp(1px,50px,10px)} </style><p>a</p>',
  // seletores
  '<style>[href]{color:red} [href^="https"]{color:blue} a[target=_blank]{color:green} a[href$=".pdf"]{color:orange} [class~=x]{background:#eee} [lang|=pt]{color:purple} input:checked{color:red} li:not(.z){color:blue} p:empty{color:red} h1+p{color:green} h1~p{background:#ddd} li:nth-of-type(odd){color:orange}</style><a href="https://x.com">1</a><a href="a.pdf" target=_blank>2</a><p class="x y" lang="pt-BR">3</p><h1>t</h1><p>4</p><p></p><ul><li>a<li class=z>b<li>c</ul><input type=checkbox checked>',
  '<style>*{margin:0} body *{padding:1px} .a .b{color:red} .a>.b{color:blue} .a + .b{color:green} :root{color:#111} html body p::before{content:"x"}</style><div class=a><span class=b>1</span><div><span class=b>2</span></div></div><div class=b>3</div>',
  // estrutura HTML (omissões e aninhamento)
  '<p>um<p>dois<div>três</div><p>quatro',
  '<ul><li>a<li>b<ol><li>c<li>d</ol><li>e</ul><dl><dt>a<dt>b<dd>c<dd>d</dl><table><tr><td>1<td>2<tr><td>3</table>',
  '<h1>a<h2>b</h2></h1><b>x<i>y</b>z</i><div><p>w</div>',
  '<!DOCTYPE html><html lang="pt"><head><title>t</title><meta charset="utf-8"><style>h1{color:red}</style></head><body><h1>a</h1></body></html>',
  'texto solto <b>negrito</b><style>b{color:red}</style>',
  // @media (iframe visível 1024)
  { layout: true, vw: 1024, only: ['color', 'font-size', 'display', 'background-color'], html: '<style>p{color:red;font-size:20px} @media (max-width:600px){p{color:blue}} @media (min-width:800px){p{color:green;font-size:30px}} @media (min-width:800px) and (max-width:1100px){p{background:#eee}} @media print{p{color:black}}</style><p>a</p>' },
  { layout: true, vw: 500, only: ['color', 'font-size', 'display', 'background-color'], html: '<style>p{color:red;font-size:20px} @media (max-width:600px){p{color:blue}} @media (min-width:800px){p{color:green;font-size:30px}} @media (orientation:landscape){p{background:#eee}}</style><p>a</p>' },
  // overflow, tabela, float/absolute, flex/grid, monospace e tamanhos de fonte
  '<style>.a{overflow-x:hidden}.b{overflow-y:scroll}.c{overflow-x:clip}.d{overflow:clip}.e{overflow:auto visible}table{overflow:hidden}</style><div class=a>1</div><div class=b>2</div><div class=c>3</div><div class=d>4</div><div class=e>5</div><table><tr><td>x</table>',
  '<style>.f{float:left;position:absolute}.g{float:right}.h{position:fixed;display:inline}.i{display:flex}.j{display:inline-grid}</style><span class=f>1</span><span class=g>2</span><span class=h>3</span><div class=i><span>a</span><b>b</b><em style="position:relative">c</em></div><div class=j><i>x</i></div>',
  '<style>html{display:inline-block}code{font-size:xx-large}.m{font-family:monospace}.n{font-family:monospace;font-size:2em}.o{font-family:Arial,monospace}.p{font-family:monospace,monospace}</style><div class=m>m<span style="font-size:2em">e</span><span style="font-size:larger">l</span><span style="font-size:small">s</span><span style="font-family:Arial">a</span></div><div class=n>n</div><div class=o>o</div><div class=p>p</div><code>c</code><pre>p</pre><h1 class=m>h</h1><div style="font-size:20px" class=m>z</div><div style="font-size:2rem" class=m>r</div><div style="font-size:calc(10px + 1em)" class=m>k</div>',
  '<style>div{font-size:smaller}</style><div><div><div><div><h2>x</h2><p style="margin:.83em 1.37em;padding:.11em">y</p></div></div></div></div>',
  '<style>:root{font-size:62.5%}h1{font-size:2.4rem;margin:1.2rem 0}p{font-size:1.6rem;line-height:1.7;margin:0 0 .75em}small{font-size:70%}</style><h1>t</h1><p>a <small>b</small></p>',
  '<style>.a{font-size:.1em}.b{font-size:10%}.c{font-size:4px}.d{font-size:calc(1em - 15px)}.e{font-size:0}.f{font-size:.2rem}.g{font-size:5.9px}</style><div class=a>1<span style="font-size:smaller">s</span></div><div class=b>2</div><div class=c>3<span style="font-size:smaller">s</span></div><div class=d>4</div><div class=e>5</div><div class=f>6</div><div class=g>7<b style="font-size:smaller">s</b></div><div style="font-size:40px"><div style="font-size:10%"><div style="font-size:50%">a</div></div></div>',
];
