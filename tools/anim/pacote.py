# Ferramenta de manutenção (não roda no servidor): recorta as 18 expressões de cada personagem das folhas
#   tools/anim/src/cut-expressoes.jpg  (Cut, azul)   e   tools/anim/src/tay-expressoes.png  (Tay, rosa)
# e gera as poses do app: public/img/pose/<guia>-<pose>.webp (a pose no alto e os rabiscos do desenho — corações, "?", lâmpada, zzz — recortados um a um logo abaixo)
# e a tabela public/poses.js. As folhas são fotos de tela: o script tira o fundo (rembg/ISNet), refaz o contorno (pymatting), limpa o ruído, amplia x2,4,
# leva as cores para a paleta do app e corta o que sobra dos personagens vizinhos e o borrão do chão.
# Precisa de: pip install numpy opencv-python pillow scipy pymatting rembg onnxruntime   (o rembg baixa o modelo "isnet-general-use" na primeira vez)
# Uso:  python3 pacote.py            (escreve em public/img/pose/ e public/poses.js)
#       python3 pacote.py --prev     (também salva as folhas de prévia em /tmp/codeup-poses-prev-*.png, fundo claro e escuro)
# Se trocar as folhas, confira as constantes SHEETS (cortes das colunas e linhas, em px da folha), CUTS (onde um personagem encosta no vizinho) e DB (caixa de cada rabisco).
import os, sys, json, tempfile
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.join(HERE, '..', '..', 'public'); OUT = os.path.join(PUB, 'img', 'pose'); SRC = os.path.join(HERE, 'src')
TMP = tempfile.mkdtemp(prefix='codeup-poses-')

SHEETS={'cut':(os.path.join(SRC,'cut-expressoes.jpg'),[0,305,555,843,1080,1315,1600],[0,408,722,1027]),
        'tay':(os.path.join(SRC,'tay-expressoes.png'),[0,310,552,845,1075,1310,1600],[0,412,730,1051])}
IDS=['oi','piscada','pulo','apaixonado','pensando','ideia','codando','vitoria','coracao','apontando','estiloso','bravo','ops','dormindo','tchau','aponta2','explica','joinha']
KIND={'codando':'sit','dormindo':'sit'}
M=48
k=lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*r+1,2*r+1))
def cells(g):
    f,xs,ys=SHEETS[g]; im=np.array(Image.open(f).convert('RGB'))
    H,W=im.shape[:2]
    for r in range(3):
        for c in range(6):
            nx0,nx1,ny0,ny1=xs[c],xs[c+1],ys[r],ys[r+1]
            x0,y0,x1,y1=max(0,nx0-M),max(0,ny0-M),min(W,nx1+M),min(H,ny1+M)
            yield IDS[r*6+c],(r,c),im[y0:y1,x0:x1],(nx0-x0,ny0-y0,nx1-x0,ny1-y0),(x0,y0)
def rembg_masks():
    from rembg import remove, new_session
    s = new_session('isnet-general-use')
    for g in SHEETS:
        for pid, rc, crop, nom, off in cells(g):
            remove(Image.fromarray(crop), session=s, only_mask=True).save(f'{TMP}/m_{g}_{pid}.png')
        print('máscaras', g)

def largest_sel(b,nom,minarea=1200):
    lab,n=ndi.label(b,structure=np.ones((3,3)))
    if n==0: return b
    out=np.zeros_like(b); x0,y0,x1,y1=nom
    for i in range(1,n+1):
        m=lab==i; a=m.sum()
        if a<minarea: continue
        ys,xs=np.where(m); cx,cy=xs.mean(),ys.mean()
        if x0<=cx<=x1 and y0<=cy<=y1: out|=m
    if not out.any():
        sz=ndi.sum(b,lab,range(1,n+1)); out=lab==(1+int(np.argmax(sz)))
    return out
def main_mask(g,pid,crop,nom):
    m=np.array(Image.open(f'{TMP}/m_{g}_{pid}.png').convert('L'))
    b=m>120; sel=largest_sel(b,nom)
    # pedaços pequenos colados (fios de cabelo, dedos) fazem parte
    near=cv2.dilate(sel.astype(np.uint8),k(5))>0
    lab,n=ndi.label(b,structure=np.ones((3,3)))
    for i in range(1,n+1):
        mm=lab==i
        if not (mm&sel).any() and (mm&near).any() and mm.sum()<1200: sel|=mm
    holes=ndi.binary_fill_holes(sel)&~sel; hl,hn=ndi.label(holes)
    for i in range(1,hn+1):
        if (hl==i).sum()<260: sel|=(hl==i)
    return sel

from pymatting import estimate_alpha_cf, estimate_foreground_ml
def char_rgba(g,pid,crop,sel,sr=False,scale=2.4):
    H,W=sel.shape
    fg=cv2.erode(sel.astype(np.uint8),k(3))>0; bgz=~(cv2.dilate(sel.astype(np.uint8),k(6))>0)
    tri=np.full((H,W),.5); tri[fg]=1; tri[bgz]=0
    I=crop.astype(np.float64)/255
    a=estimate_alpha_cf(I,tri); a=np.clip((a-.1)/.8,0,1); a[bgz]=0
    F=np.clip(estimate_foreground_ml(I,a),0,1)
    # fora do personagem, a cor é a do personagem mais perto (a ampliação não enxerga o fundo)
    solid=a>.5; _,idx=ndi.distance_transform_edt(~solid,return_indices=True)
    Fe=F[idx[0],idx[1]]; Fe=np.where(solid[...,None],F,Fe)
    u8=(Fe*255+.5).astype(np.uint8)
    u8=cv2.fastNlMeansDenoisingColored(u8,None,4,4,5,15); u8=cv2.GaussianBlur(u8,(0,0),.7)
    if sr:
        up=sr4(u8)                                              # 4x (EDSR)
    else:
        up=cv2.resize(u8,None,fx=4,fy=4,interpolation=cv2.INTER_CUBIC)
    au=cv2.resize(a.astype(np.float32),(up.shape[1],up.shape[0]),interpolation=cv2.INTER_CUBIC)
    au=cv2.GaussianBlur(au,(0,0),1.6); au=np.clip((au-.45)/.1+.5,0,1) if False else np.clip((au-.3)/.4,0,1); au=au*au*(3-2*au)
    f=scale/4; nw,nh=int(round(up.shape[1]*f)),int(round(up.shape[0]*f))
    rgb=cv2.resize(up,(nw,nh),interpolation=cv2.INTER_AREA).astype(np.float32)/255; al=cv2.resize(au,(nw,nh),interpolation=cv2.INTER_AREA)
    bl=cv2.GaussianBlur(rgb,(0,0),1.2); rgb=np.clip(rgb+.5*(rgb-bl),0,1)
    return np.dstack([rgb,al])

# caixas (x0,y0,x1,y1 na folha) de cada rabisco, por pose
DB={'cut':{
 'apaixonado':[(840,100,885,140),(1040,72,1080,110)],
 'pensando':[(1268,30,1318,104)],
 'ideia':[(1480,24,1550,98)],
 'vitoria':[(330,420,395,475),(520,415,580,470)],
 'coracao':[(592,545,630,580),(770,436,810,474),(780,480,815,510)],
 'apontando':[(1030,474,1075,540)],
 'bravo':[(1308,432,1357,474),(1496,428,1542,474)],
 'dormindo':[(470,734,555,795)]},
'tay':{
 'apaixonado':[(834,56,874,92),(1034,50,1074,86),(834,92,862,116)],
 'pensando':[(1256,30,1300,78),(1262,82,1296,110)],
 'ideia':[(1484,28,1564,104)],
 'vitoria':[(314,414,366,466),(520,418,574,472)],
 'coracao':[(774,428,814,464),(584,540,616,576),(784,490,812,516)],
 'apontando':[(1020,474,1062,530)],
 'bravo':[(1310,430,1356,474),(1500,426,1548,474)],
 'dormindo':[(474,736,552,794)]}}

def grade(c,o):
    hsv=cv2.cvtColor(c,cv2.COLOR_RGB2HSV_FULL).astype(np.float32); H=hsv[...,0]*360/255; S=hsv[...,1]/255; V=hsv[...,2]/255
    if o=='tay':
        w=np.clip((S-0.18)/0.2,0,1)*(((H>300)|(H<22)).astype(np.float32))
        H=(H-9*w)%360; S=np.clip(S*(1+0.32*w),0,1); V=V*(1-0.02*w)
    else:
        w=np.clip((S-0.55)/0.25,0,1)*((H>195)&(H<255)).astype(np.float32)
        H=H+3*w; V=V*(1-0.14*w)
    hsv[...,0]=(H%360)*255/360; hsv[...,1]=S*255; hsv[...,2]=np.clip(V,0,1)*255
    return cv2.cvtColor(hsv.astype(np.uint8),cv2.COLOR_HSV2RGB_FULL)
CUTS={('tay','piscada'):('below',402),('tay','vitoria'):('above',402),('tay','estiloso'):('above',403),('tay','aponta2'):('above',733),
      ('cut','vitoria'):('above',398),('cut','coracao'):('below',732)}
def clean_alpha(ch,pid,nom,g,off):
    a=ch[...,3].copy(); rgb=ch[...,:3]; h,w=a.shape
    # 0) o que passa da fileira da folha (tênis do personagem de cima, cabeça do de baixo) não é desse personagem
    cl=0
    if (g,pid) in CUTS:
        how,ys=CUTS[(g,pid)]; yc=int(round((ys-off[1])*S0))
        if how=='above': a[:max(0,yc)]=0
        else: a[max(0,yc):]=0
    # 1) tira o borrão de fundo que ficou embaixo dos tênis (faixa de brilho da tela): nada abaixo da sola branca mais baixa
    if pid!='dormindo':
        yy=np.arange(h)[:,None]
        white=(rgb.min(2)>.74)&(a>.6); white[:int(h*.8)]=False
        allw=(rgb.min(2)>.74)&(a>.6); allw[:int(h*.55)]=False
        if allw.sum()>40:
            g=np.where(allw.any(1))[0].max()
            ym=np.full(w,-1)
            for x in range(w):
                ys=np.where(white[:,x])[0]
                if len(ys): ym[x]=ys.max()
            lim=np.full(w,g); xs=np.where(ym>=0)[0]
            for x in range(w):
                near=xs[np.abs(xs-x)<=22]
                if len(near): lim[x]=ym[near].max()
            lim=np.minimum(lim,g)
            a=np.where(yy>(lim+7)[None,:],0,a)
    # 2) só o personagem desta célula: o maior pedaço, mais pedaços grandes cujo centro cai dentro da célula (sobras de vizinhos ficam de fora)
    b=(a>.3).astype(np.uint8); b=cv2.dilate(b,k(2)); lab,n=ndi.label(b,structure=np.ones((3,3)))
    if n>1:
        sz=ndi.sum(b,lab,range(1,n+1)); big=int(np.argmax(sz)); keep=lab==(1+big)
        for i in range(n):
            if i==big or sz[i]<.03*sz[big]: continue
            ys,xs=np.where(lab==i+1); cx,cy=xs.mean()/S0,ys.mean()/S0
            if nom[0]-12<=cx<=nom[2]+12 and nom[1]-12<=cy<=nom[3]+12: keep|=lab==i+1
        a=a*keep
    mo=cv2.morphologyEx((a>.3).astype(np.uint8),cv2.MORPH_OPEN,k(6 if (g,pid) in CUTS else 3)); a=a*(cv2.dilate(mo,k(3 if (g,pid) in CUTS else 2))>0)
    return a
# escala do recorte nas poses (a folha tem ~270 px por pose)
S0=2.4   # escala do npy em relação ao recorte
def doodle_pieces(g,pid,crop,sel,off):
    """recorta cada rabisco (caixa manual) com alfa suave contra o fundo estimado; devolve [(rgba float, x0,y0 no recorte*S0)]"""
    out=[]
    boxes=DB[g].get(pid,[])
    if not boxes: return out
    big=cv2.dilate(sel.astype(np.uint8),k(7))
    inp=cv2.inpaint(crop,big*255,5,cv2.INPAINT_TELEA).astype(np.float32)
    bg=np.stack([cv2.morphologyEx(inp[...,c],cv2.MORPH_OPEN,k(26)) for c in range(3)],-1); bg=cv2.GaussianBlur(bg,(0,0),9)
    I=crop.astype(np.float32); d=np.sqrt(((I-bg)**2).sum(2))
    for (bx0,by0,bx1,by1) in boxes:
        x0,y0,x1,y1=bx0-off[0],by0-off[1],bx1-off[0],by1-off[1]
        x0,y0=max(0,x0),max(0,y0); x1,y1=min(crop.shape[1],x1),min(crop.shape[0],y1)
        dd=d[y0:y1,x0:x1].copy(); sub=I[y0:y1,x0:x1]; b=bg[y0:y1,x0:x1]
        # não pega o personagem se a caixa encostar
        dd[cv2.dilate(sel.astype(np.uint8),k(3))[y0:y1,x0:x1]>0]=0
        thr=55 if g=='cut' else 65
        core=dd>thr
        core=cv2.morphologyEx(core.astype(np.uint8),cv2.MORPH_OPEN,k(1))>0
        lab,n=ndi.label(core,structure=np.ones((3,3)))
        if n==0: continue
        sz=ndi.sum(core,lab,range(1,n+1)); keep=np.zeros_like(core)
        for i in range(n):
            if sz[i]>=max(25,.12*sz.max()): keep|=lab==i+1
        keep=cv2.dilate(keep.astype(np.uint8),k(2))>0
        a=np.clip((dd-25)/(thr+25),0,1)*keep
        a=cv2.GaussianBlur(a.astype(np.float32),(0,0),.8); a=np.clip(a*1.15,0,1)
        # cor sem o fundo: F=(I-(1-a)bg)/a ; onde a é fraco usa a cor do traço
        am=np.maximum(a,.05)[...,None]
        F=np.clip((sub-(1-a[...,None])*b)/am,0,255)
        solid=a>.55
        if solid.sum()>5:
            _,idx=ndi.distance_transform_edt(~solid,return_indices=True); Fe=F[idx[0],idx[1]]; F=np.where(solid[...,None],F,Fe)
        F=cv2.GaussianBlur(F,(0,0),.6)
        up=lambda x:cv2.resize(x,None,fx=S0,fy=S0,interpolation=cv2.INTER_CUBIC)
        Fu=np.clip(up(F)/255,0,1); au=np.clip(up(a),0,1); au=np.clip((au-.12)/.76,0,1)
        ys,xs=np.where(au>.03)
        if len(ys)<30: continue
        py0,py1,px0,px1=max(0,ys.min()-2),min(au.shape[0],ys.max()+3),max(0,xs.min()-2),min(au.shape[1],xs.max()+3)
        piece=np.dstack([Fu,au])[py0:py1,px0:px1]
        out.append((piece,(x0*S0+px0,y0*S0+py0)))
    return out

# ---- monta os arquivos ----
F = 1.0; Q = 82            # F = escala final em relação a 2,4x; Q = qualidade do webp
def rs(rgba, s):
    pm = rgba.copy(); pm[..., :3] *= pm[..., 3:4]
    h, w = pm.shape[:2]; nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
    pm = cv2.resize(pm, (nw, nh), interpolation=cv2.INTER_AREA); a = np.clip(pm[..., 3:4], 0, 1)
    rgb = np.where(a > 1e-4, pm[..., :3] / np.maximum(a, 1e-4), 0); rgb = np.clip(rgb, 0, 1)
    bl = cv2.GaussianBlur(rgb, (0, 0), .9); rgb = np.clip(rgb + .35 * (rgb - bl), 0, 1)
    return np.dstack([rgb, a])
def compose(pose, dp, bg, H=330):                  # prévia: pose + rabiscos nas posições certas sobre um fundo
    PAD = 60; h, w = pose.shape[:2]; cv = np.zeros((h + 2 * PAD, w + 2 * PAD, 4), np.float32)
    def put(img, x, y):
        hh, ww = img.shape[:2]; X0, Y0 = max(0, x), max(0, y); X1, Y1 = min(cv.shape[1], x + ww), min(cv.shape[0], y + hh)
        s = img[Y0 - y:Y1 - y, X0 - x:X1 - x]; a = s[..., 3:4]; d = cv[Y0:Y1, X0:X1]; oa = a + d[..., 3:4] * (1 - a)
        d[..., :3] = np.where(oa > 0, (s[..., :3] * a + d[..., :3] * d[..., 3:4] * (1 - a)) / np.maximum(oa, 1e-6), 0); d[..., 3:4] = oa
    put(pose, PAD, PAD)
    for p, (x, y) in dp: put(p, int(PAD + x), int(PAD + y))
    o = np.zeros(cv.shape[:2] + (3,), np.float32); o[:] = np.array(bg) / 255; o = cv[..., :3] * cv[..., 3:4] + o * (1 - cv[..., 3:4])
    sc = H / o.shape[0]; return (cv2.resize(o, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) * 255).astype(np.uint8)
def main():
    os.makedirs(OUT, exist_ok=True); prev = '--prev' in sys.argv; res = {}
    rembg_masks()
    for g in SHEETS:
        for pid, rc, crop, nom, off in cells(g):
            sel = main_mask(g, pid, crop, nom)
            out = char_rgba(g, pid, crop, sel, sr=False, scale=S0)
            rgb = (np.clip(out[..., :3], 0, 1) * 255).astype(np.uint8)
            for _ in range(2): rgb = cv2.bilateralFilter(rgb, 7, 22, 5)           # alisa o que sobrou de listra/ruído nas áreas lisas sem borrar contornos
            rgb = grade(rgb, g).astype(np.float32) / 255
            ch = np.dstack([rgb, out[..., 3]]); ch[..., 3] = clean_alpha(ch, pid, nom, g, off)
            ys, xs = np.where(ch[..., 3] > .02); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            dp = doodle_pieces(g, pid, crop, sel, off); res[(g, pid)] = (ch[y0:y1, x0:x1], [(p, (x - x0, y - y0)) for p, (x, y) in dp])
    meta = {'cut': {}, 'tay': {}}; tot = 0
    for (g, pid), (pose, dp) in res.items():
        ch = rs(pose, F); cw, chh = ch.shape[1], ch.shape[0]
        pieces = [(rs(p, F), (int(round(x * F)), int(round(y * F)))) for p, (x, y) in dp]
        x = y = rh = 0; place = []
        for pim, pos in pieces:
            ph, pw = pim.shape[:2]
            if x + pw > max(cw, 220) and x > 0: x = 0; y += rh + 2; rh = 0
            place.append((x, y, pw, ph, pos)); x += pw + 2; rh = max(rh, ph)
        atlas = np.zeros((chh + (4 + y + rh if pieces else 0), cw, 4), np.float32); atlas[:chh] = ch; dl = []
        for (px, py, pw, ph, pos), (pim, _) in zip(place, pieces):
            wmax = min(pw, cw - px); atlas[chh + 4 + py:chh + 4 + py + ph, px:px + wmax] = pim[:, :wmax]; dl.append([px, chh + 4 + py, wmax, ph, pos[0], pos[1]])
        f = os.path.join(OUT, f'{g}-{pid}.webp'); Image.fromarray((np.clip(atlas, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA').save(f, 'WEBP', quality=Q, alpha_quality=90, method=6)
        kb = os.path.getsize(f) / 1024; tot += kb; meta[g][pid] = {'w': cw, 'h': chh, 'k': KIND.get(pid, 'full'), 'd': dl}
        print(f'{g}-{pid} {cw}x{chh} rabiscos={len(dl)} {kb:.0f} KB')
    js = ('// Gerado por tools/anim/pacote.py a partir das duas folhas de expressões (Cut azul e Tay rosa, 18 poses cada). Não editar à mão.\n'
          '// Cada pose: w,h = tamanho da pose no arquivo (px), k = tipo (full corpo inteiro, sit sentada/agachada, bust busto),\n'
          '// d = rabiscos do desenho (corações, "?", faíscas, zzz...) que estão no arquivo logo abaixo da pose: [x, y, largura, altura no arquivo, x, y de destino relativos ao canto da pose].\n'
          'window.CodeUpPoses = ' + json.dumps({'scale': S0 * F, 'poses': meta}, separators=(',', ':')) + ';\n')
    open(os.path.join(PUB, 'poses.js'), 'w').write(js); print('ok · poses.js', len(js), 'bytes ·', round(tot), 'KB de imagens')
    if prev:
        from PIL import ImageDraw
        for g in SHEETS:
            for bn, bg in (('claro', (246, 247, 252)), ('escuro', (24, 28, 52))):
                tiles = []
                for pid in IDS:
                    t = compose(*res[(g, pid)], bg); c = np.zeros((340, 330, 3), np.uint8); c[:] = bg; h, w = t.shape[:2]; w = min(w, 330); c[:h, :w] = t[:, :w]
                    im = Image.fromarray(c); ImageDraw.Draw(im).text((4, 4), pid, fill=(255, 0, 0)); tiles.append(np.array(im))
                Image.fromarray(np.vstack([np.hstack(tiles[r * 6:(r + 1) * 6]) for r in range(3)])).save(f'/tmp/codeup-poses-prev-{g}-{bn}.png')
        print('prévias em /tmp/codeup-poses-prev-*.png')
if __name__ == '__main__': main()
