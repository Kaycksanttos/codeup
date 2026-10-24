# Ferramenta de manutenção (não roda no servidor): recorta as expressões de cada personagem das folhas com fundo transparente
#   tools/anim/src/cut-expressoes.png  (Cut, azul: 22 poses)   e   tools/anim/src/tay-expressoes.png  (Tay, rosa: 18 poses)
# e gera as poses do app: public/img/pose/<guia>-<pose>.webp (a pose no alto e os rabiscos do desenho — corações, "?", lâmpada, zzz, notas — recortados um a um logo abaixo)
# e a tabela public/poses.js. As folhas já vêm sem fundo e com boa resolução: o script separa as poses que se encostam (watershed a partir de um ponto de cada pose),
# agrupa os rabiscos, tira o halo de cor das bordas, amplia (Lanczos) e leva as cores para a paleta do corpo do app.
# Precisa de: pip install numpy opencv-python pillow scipy scikit-image
# Uso:  python3 pacote.py            (escreve em public/img/pose/ e public/poses.js)
#       python3 pacote.py --prev     (também salva prévias em /tmp/codeup-poses-prev-*.png e a segmentação em /tmp/codeup-poses-seg-*.png)
# Se trocar as folhas, confira CELLS (um ponto dentro do corpo de cada pose: x, y em px da folha), ROUTE (rabiscos que ficam entre duas poses) e KEEP (pedaços soltos que fazem parte do corpo).
import os, sys, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
from skimage.segmentation import watershed
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.join(HERE, '..', '..', 'public'); OUT = os.path.join(PUB, 'img', 'pose'); SRC = os.path.join(HERE, 'src')
S0 = 2.0          # escala da folha para o arquivo final (a pose fica com ~750 px de altura)
Q = 80            # qualidade do webp
k = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))

# (pose, x, y) = um ponto no meio do corpo de cada pose, na ordem da folha (linha por linha)
CELLS = {
 'tay': [('oi', 138, 220), ('piscada', 400, 200), ('pulo', 665, 200), ('apaixonado', 933, 200), ('pensando', 1161, 200), ('ideia', 1403, 200),
         ('codando', 140, 540), ('vitoria', 400, 540), ('coracao', 665, 560), ('apontando', 903, 546), ('estiloso', 1150, 545), ('bravo', 1405, 545),
         ('ops', 128, 848), ('dormindo', 386, 856), ('tchau', 643, 850), ('aponta2', 905, 860), ('explica', 1168, 860), ('joinha', 1410, 860)],
 'cut': [('tchau', 116, 211), ('apontando', 312, 211), ('pulo', 516, 210), ('serio', 716, 211), ('pensando', 903, 217), ('ops', 1085, 221), ('estiloso', 1280, 220), ('joinha', 1450, 220),
         ('celular', 138, 556), ('codando', 381, 554), ('apaixonado', 619, 556), ('tedio', 837, 545), ('deitado', 1080, 559), ('dormindo', 1388, 557),
         ('vitoria', 110, 855), ('piscada', 320, 860), ('dab', 528, 860), ('correndo', 710, 852), ('bravo', 905, 860), ('chorando', 1085, 860), ('explica', 1252, 860), ('coracao', 1430, 860)]}
# rabiscos que ficam entre duas poses: (caixa x0,y0,x1,y1 da folha) -> pose. O resto vai para a pose mais perto.
ROUTE = {
 'tay': [((800, 40, 845, 125), 'apaixonado'), ((1235, 10, 1285, 100), 'pensando'), ((1460, 10, 1540, 95), 'ideia'), ((265, 375, 335, 435), 'vitoria'), ((485, 380, 550, 435), 'vitoria'),
         ((540, 380, 800, 560), 'coracao'), ((1010, 440, 1060, 520), 'apontando'), ((1275, 390, 1535, 445), 'bravo'), ((440, 715, 530, 775), 'dormindo')],
 'cut': [((960, 0, 1010, 70), 'pensando'), ((1120, 0, 1195, 65), 'ops'), ((1330, 160, 1370, 200), 'estiloso'), ((490, 440, 745, 610), 'apaixonado'), ((1430, 430, 1536, 535), 'dormindo'),
         ((970, 695, 1005, 745), 'bravo'), ((1340, 730, 1536, 870), 'coracao')]}
# pedaços soltos que fazem parte do corpo (não pipocam): as lágrimas do Cut
# pontos extras dentro do corpo (um pé que encosta na pose de baixo): sem eles a pose de baixo "rouba" o pé
EXTRA = {'tay': [('piscada', 428, 354), ('pulo', 650, 356)], 'cut': []}
KEEP = {'tay': [], 'cut': [((995, 810, 1050, 870), 'chorando'), ((1140, 820, 1175, 855), 'chorando')]}
KIND = {'tay': {'codando': 'sit', 'dormindo': 'sit'}, 'cut': {'codando': 'sit', 'dormindo': 'sit', 'celular': 'sit', 'apaixonado': 'sit', 'tedio': 'sit', 'deitado': 'sit'}}
# poses que repetem outra (o app usa as 18 poses dos dois personagens; a folha do Cut não tem uma para cada): pose nova = pose existente [+ rabisco de outro lugar]
ALIAS = {'cut': {'oi': 'tchau', 'aponta2': 'estiloso'}}

def load(g):
    im = np.array(Image.open(os.path.join(SRC, f'{g}-expressoes.png')).convert('RGBA')).astype(np.float32) / 255
    a = np.clip((im[..., 3] - 6 / 255) / (248 / 255 - 6 / 255), 0, 1); a[a < .04] = 0
    return im[..., :3], a
def segment(g, a):
    cells = CELLS[g]; H, W = a.shape
    body = a > .5; lab, n = ndi.label(body, structure=np.ones((3, 3))); sz = ndi.sum(body, lab, range(1, n + 1))
    big = np.isin(lab, [i + 1 for i in range(n) if sz[i] > 3000])
    mk = np.zeros((H, W), np.int32)
    for i, (pid, cx, cy) in enumerate(cells):
        x0, x1, y0, y1 = max(0, cx - 40), min(W, cx + 40), max(0, cy - 60), min(H, cy + 60)
        sd = big[y0:y1, x0:x1]; assert sd.any(), f'sem corpo no ponto de {g}/{pid}'
        sub = mk[y0:y1, x0:x1]; sub[sd & (sub == 0)] = i + 1
    pix = {p: i + 1 for i, (p, _, _) in enumerate(cells)}
    for p, cx, cy in EXTRA[g]:
        x0, x1, y0, y1 = max(0, cx - 12), min(W, cx + 12), max(0, cy - 12), min(H, cy + 12)
        sub = mk[y0:y1, x0:x1]; sub[big[y0:y1, x0:x1] & (sub == 0)] = pix[p]
    dist = ndi.distance_transform_edt(big)
    L = watershed(-dist, mk, mask=big)
    # a borda mole (alfa baixo) vai para a pose mais perto
    d, idx = ndi.distance_transform_edt(L == 0, return_indices=True)
    rim = (a > 0) & (L == 0) & (d <= 4)
    L2 = L.copy(); L2[rim] = L[idx[0][rim], idx[1][rim]]
    # pedaços soltos
    rest = (a > .12) & (L2 == 0)
    cl = cv2.dilate(rest.astype(np.uint8), k(6)) > 0; cl &= (a > 0); clab, cn = ndi.label(cl, structure=np.ones((3, 3)))
    pose_ix = {p: i + 1 for i, (p, _, _) in enumerate(cells)}
    near_d, near_i = ndi.distance_transform_edt(L2 == 0, return_indices=True)
    doodles = {p: [] for p, _, _ in cells}
    for c in range(1, cn + 1):
        m = (clab == c) & (a > 0) & (L2 == 0); area = int(((clab == c) & rest).sum())
        if area < 60: continue
        ys, xs = np.where(m); cxm, cym = xs.mean(), ys.mean(); bb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        who = None
        for (x0, y0, x1, y1), p in KEEP[g] + ROUTE[g]:
            if x0 <= cxm <= x1 and y0 <= cym <= y1: who = (p, (x0, y0, x1, y1) in [r for r, _ in KEEP[g]]); break
        if who is None:
            j = L2[near_i[0][int(cym), int(cxm)], near_i[1][int(cym), int(cxm)]]; dd = near_d[int(cym), int(cxm)]
            if dd > 120: continue
            who = (cells[j - 1][0], dd <= 8)           # colado no corpo: faz parte dele
        p, keep = who
        if keep: L2[m] = pose_ix[p]
        else: doodles[p].append((m, bb))
    return L2, doodles
def fgcolor(rgb, a):
    solid = a > .85; _, idx = ndi.distance_transform_edt(~solid, return_indices=True)
    F = rgb[idx[0], idx[1]]; return np.where(solid[..., None], rgb, F)
def up(rgb, a, s=S0):
    h, w = a.shape; nh, nw = int(round(h * s)), int(round(w * s))
    c = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_LANCZOS4); c = np.clip(c, 0, 1)
    bl = cv2.GaussianBlur(c, (0, 0), 1.0); c = np.clip(c + .35 * (c - bl), 0, 1)
    al = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_CUBIC); al = np.clip((al - .2) / .6, 0, 1); al = al * al * (3 - 2 * al)
    return np.dstack([c, al])
def grade(c, o):
    hsv = cv2.cvtColor((c * 255 + .5).astype(np.uint8), cv2.COLOR_RGB2HSV_FULL).astype(np.float32); H = hsv[..., 0] * 360 / 255; S = hsv[..., 1] / 255; V = hsv[..., 2] / 255
    if o == 'tay':
        w = np.clip((S - .15) / .2, 0, 1) * (((H > 300) | (H < 30)).astype(np.float32)); H = (H - 8 * w) % 360; S = np.clip(S * (1 + .06 * w), 0, 1); V = V * (1 - .04 * w)
    else:
        w = np.clip((S - .55) / .25, 0, 1) * ((H > 195) & (H < 255)).astype(np.float32); H = H - 3 * w; V = V * (1 - .10 * w)
    hsv[..., 0] = (H % 360) * 255 / 360; hsv[..., 1] = S * 255; hsv[..., 2] = np.clip(V, 0, 1) * 255
    return cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2RGB_FULL).astype(np.float32) / 255

def build(g):
    rgb, a = load(g); L, dood = segment(g, a); F = fgcolor(rgb, a); out = {}
    for i, (pid, _, _) in enumerate(CELLS[g]):
        m = L == i + 1; ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        pa = (a * m)[y0:y1, x0:x1]; pc = F[y0:y1, x0:x1]
        pose = up(pc, pa); pose[..., :3] = grade(pose[..., :3], g)
        pcs = []
        for mm, (bx0, by0, bx1, by1) in dood[pid]:
            X0, Y0, X1, Y1 = max(0, bx0 - 3), max(0, by0 - 3), min(a.shape[1], bx1 + 3), min(a.shape[0], by1 + 3)
            sub = cv2.dilate(mm.astype(np.uint8), k(2))[Y0:Y1, X0:X1] > 0
            piece = up(F[Y0:Y1, X0:X1], a[Y0:Y1, X0:X1] * sub); piece[..., :3] = grade(piece[..., :3], g)
            pcs.append((piece, ((X0 - x0) * S0, (Y0 - y0) * S0)))
        out[pid] = (pose, pcs)
    return out, L

def rs(rgba): return rgba
def compose(pose, dp, bg, H=330):                  # prévia: pose + rabiscos nas posições certas sobre um fundo
    PAD = 80; h, w = pose.shape[:2]; cvs = np.zeros((h + 2 * PAD, w + 2 * PAD, 4), np.float32)
    def put(img, x, y):
        hh, ww = img.shape[:2]; X0, Y0 = max(0, x), max(0, y); X1, Y1 = min(cvs.shape[1], x + ww), min(cvs.shape[0], y + hh)
        if X1 <= X0 or Y1 <= Y0: return
        s = img[Y0 - y:Y1 - y, X0 - x:X1 - x]; al = s[..., 3:4]; d = cvs[Y0:Y1, X0:X1]; oa = al + d[..., 3:4] * (1 - al)
        d[..., :3] = np.where(oa > 0, (s[..., :3] * al + d[..., :3] * d[..., 3:4] * (1 - al)) / np.maximum(oa, 1e-6), 0); d[..., 3:4] = oa
    put(pose, PAD, PAD)
    for p, (x, y) in dp: put(p, int(PAD + x), int(PAD + y))
    o = np.zeros(cvs.shape[:2] + (3,), np.float32); o[:] = np.array(bg) / 255; o = cvs[..., :3] * cvs[..., 3:4] + o * (1 - cvs[..., 3:4])
    sc = H / o.shape[0]; return (cv2.resize(o, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) * 255).astype(np.uint8)
def main():
    os.makedirs(OUT, exist_ok=True); prev = '--prev' in sys.argv; res = {}; segs = {}
    for g in CELLS:
        o, L = build(g); segs[g] = L
        for pid, v in o.items(): res[(g, pid)] = v
    # a lâmpada da Tay também vale para a "ideia" do Cut (a folha do Cut não tem essa pose): mesmo desenho da pose "apontando" + o rabisco amarelo
    tay_bulb = res[('tay', 'ideia')][1]
    pose, _ = res[('cut', 'apontando')]; bx = [(p, (pose.shape[1] - 150 + (pos[0] - min(q[1][0] for q in tay_bulb)), -60 + (pos[1] - min(q[1][1] for q in tay_bulb)))) for p, pos in tay_bulb]
    res[('cut', 'ideia')] = (pose, bx)
    for g, al in ALIAS.items():
        for new, old in al.items(): res[(g, new)] = res[(g, old)]
    meta = {'cut': {}, 'tay': {}}; tot = 0
    for (g, pid), (pose, dp) in sorted(res.items()):
        ch = pose; cw, chh = ch.shape[1], ch.shape[0]; pieces = [(p, (int(round(x)), int(round(y)))) for p, (x, y) in dp]
        x = y = rh = 0; place = []
        for pim, pos in pieces:
            ph, pw = pim.shape[:2]
            if x + pw > max(cw, 220) and x > 0: x = 0; y += rh + 2; rh = 0
            place.append((x, y, pw, ph, pos)); x += pw + 2; rh = max(rh, ph)
        atlas = np.zeros((chh + (4 + y + rh if pieces else 0), cw, 4), np.float32); atlas[:chh] = ch; dl = []
        for (px, py, pw, ph, pos), (pim, _) in zip(place, pieces):
            wmax = min(pw, cw - px); atlas[chh + 4 + py:chh + 4 + py + ph, px:px + wmax] = pim[:, :wmax]; dl.append([px, chh + 4 + py, wmax, ph, pos[0], pos[1]])
        f = os.path.join(OUT, f'{g}-{pid}.webp'); Image.fromarray((np.clip(atlas, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA').save(f, 'WEBP', quality=Q, alpha_quality=90, method=6)
        kb = os.path.getsize(f) / 1024; tot += kb; meta[g][pid] = {'w': cw, 'h': chh, 'k': KIND[g].get(pid, 'full'), 'd': dl}
        print(f'{g}-{pid} {cw}x{chh} rabiscos={len(dl)} {kb:.0f} KB')
    js = ('// Gerado por tools/anim/pacote.py a partir das duas folhas de expressões (Tay rosa, 18 poses; Cut azul, 22 poses + as repetidas que o app usa). Não editar à mão.\n'
          '// Cada pose: w,h = tamanho da pose no arquivo (px), k = tipo (full corpo inteiro, sit sentada/deitada, bust busto),\n'
          '// d = rabiscos do desenho (corações, "?", faíscas, zzz...) que estão no arquivo logo abaixo da pose: [x, y, largura, altura no arquivo, x, y de destino relativos ao canto da pose].\n'
          'window.CodeUpPoses = ' + json.dumps({'scale': S0, 'poses': meta}, separators=(',', ':')) + ';\n')
    open(os.path.join(PUB, 'poses.js'), 'w').write(js); print('ok · poses.js', len(js), 'bytes ·', round(tot), 'KB de imagens')
    if prev:
        from PIL import ImageDraw
        for g in CELLS:
            ids = [p for p, _, _ in CELLS[g]] + [p for p in meta[g] if p not in [q for q, _, _ in CELLS[g]]]
            for bn, bg in (('claro', (246, 247, 252)), ('escuro', (24, 28, 52))):
                tiles = []
                for pid in ids:
                    t = compose(*res[(g, pid)], bg); c = np.zeros((340, 330, 3), np.uint8); c[:] = bg; h, w = t.shape[:2]; w = min(w, 330); c[:h, :w] = t[:, :w]
                    im = Image.fromarray(c); ImageDraw.Draw(im).text((4, 4), pid, fill=(255, 0, 0)); tiles.append(np.array(im))
                while len(tiles) % 6: tiles.append(np.full((340, 330, 3), bg, np.uint8))
                Image.fromarray(np.vstack([np.hstack(tiles[r * 6:(r + 1) * 6]) for r in range(len(tiles) // 6)])).save(f'/tmp/codeup-poses-prev-{g}-{bn}.png')
            rng = np.random.RandomState(3); pal = rng.randint(60, 255, (40, 3)).astype(np.uint8); pal[0] = 0
            Image.fromarray(pal[segs[g] % 40]).save(f'/tmp/codeup-poses-seg-{g}.png')
        print('prévias em /tmp/codeup-poses-prev-*.png e /tmp/codeup-poses-seg-*.png')
if __name__ == '__main__': main()
