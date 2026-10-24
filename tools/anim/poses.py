# Ferramenta de manutenção (não roda no servidor): recorta as expressões da folha tools/anim/src/expressoes.png
# e gera as poses que o personagem animado usa (public/img/pose/<guia>-<pose>.webp) e a tabela public/poses.js.
# Precisa de: pip install numpy opencv-python pillow scipy pymatting
# Uso: python3 poses.py            (escreve em public/img/pose/ e public/poses.js)
#      python3 poses.py --preview  (também salva uma prévia sobre fundo claro e escuro em /tmp)
# Cada arquivo tem a pose no alto e, logo abaixo, os rabiscos do desenho (corações, "?", faíscas...) já recortados um a um:
# assim o app pode animar o rabisco separado do personagem.
import os, sys, json, tempfile
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
from pymatting import estimate_alpha_cf, estimate_foreground_ml
import matplotlib.colors as mc

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src', 'expressoes.png')
PUB = os.path.join(HERE, '..', '..', 'public')
OUT = os.path.join(PUB, 'img', 'pose')
BG = np.array([13.4, 28.0, 66.0], np.float32) / 255      # o fundo azul-marinho da folha é uma cor só
SCALE = 1.5                                              # a folha é pequena (cada pose tem ~300 px): amplia na geração, com Lanczos
PAD = 3

# nome da pose, guia, caixa aproximada (x0, y0, x1, y1) onde ela está na folha, e tipo: full (corpo inteiro), sit (sentada/agachada) ou bust (busto)
POSES = [
    ('tay', 'jump',  (20, 20, 335, 490),    'full'), ('cut', 'jump',  (335, 25, 655, 470),  'full'),
    ('tay', 'peace', (655, 30, 985, 490),   'full'), ('cut', 'peace', (975, 25, 1300, 480), 'full'),
    ('tay', 'love',  (15, 485, 250, 735),   'bust'), ('tay', 'laugh', (250, 485, 462, 735), 'bust'), ('tay', 'wink', (462, 485, 695, 735), 'bust'),
    ('cut', 'cool',  (700, 485, 886, 735),  'bust'), ('cut', 'thumbs', (886, 485, 1094, 735), 'bust'), ('cut', 'shy', (1094, 485, 1300, 735), 'bust'),
    ('tay', 'angry', (15, 735, 243, 955),   'bust'), ('tay', 'think', (243, 735, 446, 955), 'bust'), ('tay', 'clap', (446, 735, 665, 955), 'bust'),
    ('cut', 'wow',   (690, 735, 906, 955),  'bust'), ('cut', 'think', (906, 735, 1110, 955), 'bust'), ('cut', 'angry', (1110, 735, 1300, 955), 'bust'),
    ('tay', 'peace2', (10, 955, 245, 1199), 'sit'),  ('tay', 'sit', (245, 955, 465, 1199), 'sit'),   ('tay', 'back', (465, 955, 655, 1199), 'full'),
    ('cut', 'dab',   (655, 955, 905, 1199), 'full'), ('cut', 'peace2', (905, 955, 1100, 1199), 'sit'), ('cut', 'back', (1100, 955, 1312, 1199), 'full'),
]

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32) / 255
H, W, _ = im.shape
d = np.sqrt(((im - BG) ** 2).sum(2)) * 255
dm = cv2.medianBlur(np.clip(d, 0, 255).astype(np.uint8), 3).astype(np.float32)
hsv = mc.rgb_to_hsv(im)


def matte(mask_core, mask_zone):
    """alfa fino e cor sem a franja azul do fundo. mask_core: certamente é do objeto; mask_zone: onde pode haver borda."""
    ys, xs = np.where(mask_zone)
    y0, y1, x0, x1 = max(0, ys.min() - 8), min(H, ys.max() + 9), max(0, xs.min() - 8), min(W, xs.max() + 9)
    sub = im[y0:y1, x0:x1].astype(np.float64)
    core, zone = mask_core[y0:y1, x0:x1], mask_zone[y0:y1, x0:x1]
    fgd = ndi.binary_erosion(core, iterations=3)
    if fgd.sum() < 30: fgd = ndi.binary_erosion(core, iterations=1)
    bgd = ~ndi.binary_dilation(zone, iterations=2)
    bgd |= (dm[y0:y1, x0:x1] < 5.5) & ~fgd                # vão com a cor exata do fundo: transparente
    tri = np.full(core.shape, .5)
    tri[fgd] = 1; tri[bgd] = 0
    a = estimate_alpha_cf(sub, tri)
    a = np.clip((a - .08) / .84, 0, 1)                    # tira o "véu" de transparência fraca em volta do contorno
    F = estimate_foreground_ml(sub, a)
    rgba = np.zeros((H, W, 4), np.float32)
    rgba[y0:y1, x0:x1, :3] = np.clip(F, 0, 1); rgba[y0:y1, x0:x1, 3] = a
    return rgba


def stroke(m, zone):
    """rabisco de uma cor só (traço): alfa = quanto o pixel já se afastou do fundo em direção à cor do traço."""
    P = im.copy()
    F = np.median(P[m & (dm > 60)], axis=0) if (m & (dm > 60)).sum() > 20 else np.median(P[m], axis=0)
    v = F - BG; den = float((v ** 2).sum())
    a = np.clip(((P - BG) @ v) / den, 0, 1)
    a = np.clip((a - .06) / .86, 0, 1) * ndi.binary_dilation(zone, iterations=1)
    rgba = np.zeros((H, W, 4), np.float32); rgba[..., :3] = F; rgba[..., 3] = a
    return rgba


def resize(rgba, s):
    pm = rgba.copy(); pm[..., :3] *= pm[..., 3:4]            # redimensiona com alfa pré-multiplicado (sem franja)
    h, w = pm.shape[:2]; nw, nh = int(round(w * s)), int(round(h * s))
    pm = cv2.resize(pm, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    a = np.clip(pm[..., 3:4], 0, 1)
    rgb = np.where(a > 1e-4, pm[..., :3] / np.maximum(a, 1e-4), 0)
    rgb = np.clip(rgb, 0, 1)
    blur = cv2.GaussianBlur(rgb, (0, 0), 1.1); rgb = np.clip(rgb + .45 * (rgb - blur), 0, 1)   # leve nitidez para compensar a ampliação
    return np.dstack([rgb, a])


def build():
    weak = dm > 7
    strong = dm > 20
    # um marcador no meio de cada pose; a "bacia" de cada um (watershed) separa personagens que se encostam por um fio de cabelo
    from skimage.segmentation import watershed
    mk = np.zeros((H, W), np.int32)
    for i, p in enumerate(POSES):
        x0, y0, x1, y1 = p[2]; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        sub = strong[y0:y1, x0:x1]; ys, xs = np.where(sub)
        j = np.argmin((ys + y0 - cy) ** 2 + (xs + x0 - cx) ** 2)           # ponto do personagem mais perto do centro da caixa
        mk[ys[j] + y0 - 2:ys[j] + y0 + 3, xs[j] + x0 - 2:xs[j] + x0 + 3] = i + 1
    ws = watershed(-ndi.distance_transform_edt(strong), mk, mask=strong)
    lab, n = ndi.label(strong, structure=np.ones((3, 3)))
    area = ndi.sum(strong, lab, range(1, n + 1))
    chars, small = [], []
    for k in range(n):
        if area[k] > 8000: chars.append(k + 1)
        elif area[k] >= 70: small.append(k + 1)
    print('componentes grandes:', len(chars), '· rabiscos candidatos:', len(small))
    owner = {}
    char_mask = {i: (ws == i + 1) for i in range(len(POSES))}
    dist = {i: ndi.distance_transform_edt(~m) for i, m in char_mask.items()}
    # pedaços pequenos colados no personagem (fios de cabelo, brilhos) fazem parte dele; os longe são rabiscos
    deco_of = {i: [] for i in range(len(POSES))}
    for c in small:
        m = lab == c; ys, xs = np.where(m)
        dmin = {i: dist[i][ys, xs].min() for i in dist}
        i0 = min(dmin, key=dmin.get)
        if '--debug' in sys.argv: print('pedaço', POSES[i0][0], POSES[i0][1], 'área', int(m.sum()), 'dist %.1f' % dmin[i0], 'centro', int(xs.mean()), int(ys.mean()))
        if dmin[i0] < 4.5 and m.sum() < 150: char_mask[i0] |= m; continue     # fiozinho de cabelo ou brilho colado: parte do personagem
        hue = np.median(hsv[ys, xs, 0]) * 360; sat = np.median(hsv[ys, xs, 1])
        guide = 'tay' if (hue > 300 or hue < 20) else 'cut'
        cands = [i for i in dist if POSES[i][0] == guide]
        i1 = min(cands, key=lambda i: dmin[i])
        deco_of[i1].append(m)
    res = {}
    for i, (g, nm, box, kind) in enumerate(POSES):
        core = char_mask[i]
        if g == 'cut':
            # as almofadas escuras do fone e os vãos da roupa do Cut são quase da cor do fundo: tudo que está cercado pelo personagem e não é exatamente a cor do fundo fica opaco
            holes = ndi.binary_fill_holes(core) & ~core
            core = core | (holes & (dm >= 6))
            core = ndi.binary_closing(core, structure=np.ones((3, 3)), iterations=3) | core
        zone = ndi.binary_dilation(core, iterations=4) & weak
        zone |= core
        rgba = matte(core, zone)
        if g == 'tay':
            # a Tay não tem nada azul-marinho: o que sobrou dessa cor é fundo que ficou preso entre mechas de cabelo
            Fd = np.sqrt(((rgba[..., :3] - BG) ** 2).sum(2)) * 255
            rgba[..., 3] *= (Fd > 48).astype(np.float32)
            rgba[..., 3] = cv2.GaussianBlur(rgba[..., 3], (0, 0), .6)
        # rabiscos: cada um com o seu recorte
        dec = []
        for m in sorted(deco_of[i], key=lambda m: (np.where(m)[0].min() // 40, np.where(m)[1].min())):
            z = ndi.binary_dilation(m, iterations=4) & weak & ~ndi.binary_dilation(core, iterations=1)
            z |= m
            dr = stroke(m, ndi.binary_dilation(m, iterations=3) & z)
            dec.append(dr)
        res[i] = (rgba, dec)
    return res


def crop_alpha(rgba, thr=.02, pad=PAD):
    ys, xs = np.where(rgba[..., 3] > thr)
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(H, ys.max() + 1 + pad), max(0, xs.min() - pad), min(W, xs.max() + 1 + pad)
    return rgba[y0:y1, x0:x1], (x0, y0)


def to_img(a): return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA')


def main():
    os.makedirs(OUT, exist_ok=True)
    res = build(); meta = {'tay': {}, 'cut': {}}; preview = '--preview' in sys.argv
    tmp = tempfile.gettempdir(); sheets = []
    for i, (g, nm, box, kind) in enumerate(POSES):
        rgba, decs = res[i]
        ch, (ox, oy) = crop_alpha(rgba)
        chs = resize(ch, SCALE); cw, chh = chs.shape[1], chs.shape[0]
        pieces = []                                              # (imagem ampliada, posição relativa à pose em px da pose ampliada)
        for dr in decs:
            dc, (dx0, dy0) = crop_alpha(dr, pad=2)
            if dc.shape[0] * dc.shape[1] < 40: continue
            pieces.append((resize(dc, SCALE), (int(round((dx0 - ox) * SCALE)), int(round((dy0 - oy) * SCALE)))))
        # atlas: pose em cima, rabiscos em fileiras logo abaixo
        rows, x, y, rh = [], 0, 0, 0; place = []
        for pim, pos in pieces:
            ph, pw = pim.shape[:2]
            if x + pw > max(cw, 220) and x > 0: x = 0; y += rh + 2; rh = 0
            place.append((x, y, pw, ph, pos)); x += pw + 2; rh = max(rh, ph)
        at_h = chh + (4 + y + rh if pieces else 0)
        atlas = np.zeros((at_h, cw, 4), np.float32); atlas[:chh, :cw] = chs
        dlist = []
        for (px, py, pw, ph, pos), (pim, _) in zip(place, pieces):
            atlas[chh + 4 + py:chh + 4 + py + ph, px:px + pw] = pim[:, :min(pw, cw - px)] if px + pw > cw else pim
            dlist.append([px, chh + 4 + py, pw, ph, pos[0], pos[1]])
        f = os.path.join(OUT, '%s-%s.webp' % (g, nm))
        to_img(atlas).save(f, 'WEBP', quality=86, alpha_quality=92, method=6)
        meta[g][nm] = {'w': cw, 'h': chh, 'k': kind, 'd': dlist}
        print('%s-%s  %dx%d  rabiscos=%d  %d KB' % (g, nm, cw, chh, len(dlist), os.path.getsize(f) // 1024))
        if preview:
            # prévia: pose + rabiscos nas posições originais, sobre fundo claro e escuro
            cvw, cvh = int(box[2] - box[0] + 80) * 2, int(box[3] - box[1] + 80) * 2
            for nm2, col in (('claro', (246, 247, 252)), ('escuro', (24, 28, 52))):
                canvas = Image.new('RGB', (cvw, cvh), col)
                full = to_img(atlas)
                canvas.paste(full.crop((0, 0, cw, chh)).resize((int(cw / SCALE * 2), int(chh / SCALE * 2))), (int((ox - box[0] + 40) * 2), int((oy - box[1] + 40) * 2)), full.crop((0, 0, cw, chh)).resize((int(cw / SCALE * 2), int(chh / SCALE * 2))))
                for (sx, sy, sw, sh, dx, dy) in dlist:
                    pc = full.crop((sx, sy, sx + sw, sy + sh)).resize((int(sw / SCALE * 2), int(sh / SCALE * 2)))
                    canvas.paste(pc, (int((ox - box[0] + 40) * 2 + dx / SCALE * 2), int((oy - box[1] + 40) * 2 + dy / SCALE * 2)), pc)
                canvas.save(os.path.join(tmp, 'pose-%s-%s-%s.png' % (g, nm, nm2)))
    js = ('// Gerado por tools/anim/poses.py a partir da folha de expressões. Não editar à mão.\n'
          '// Cada pose: w,h = tamanho da pose no arquivo (px), k = tipo (full corpo inteiro, sit sentada/agachada, bust busto),\n'
          '// d = rabiscos do desenho (corações, "?", faíscas...) que estão no arquivo logo abaixo da pose: [x, y, largura, altura no arquivo, x, y de destino relativos ao canto da pose].\n'
          'window.CodeUpPoses = ' + json.dumps({'scale': SCALE, 'poses': meta}, separators=(',', ':')) + ';\n')
    open(os.path.join(PUB, 'poses.js'), 'w').write(js)
    print('ok · poses.js', len(js), 'bytes')


if __name__ == '__main__':
    main()
