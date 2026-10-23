# Ferramenta de manutenção (não roda no servidor): gera as máscaras que o personagem animado (public/anim.js) usa.
# Precisa de: pip install numpy opencv-python pillow matplotlib scipy scikit-image
# Ordem: python3 export.py (roupas e movimento) · python3 eyemask.py (olhos). Escrevem em public/img/<guia>-{parts,rig,eye}.png
import os, tempfile
IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'img') + os.sep
import numpy as np, cv2
from PIL import Image
import matplotlib.colors as mc
base=IMG_DIR
W,H=640,960
def load(n):
    im=Image.open(base+n+'.webp').convert('RGBA'); return np.array(im).astype(np.float32)/255
def poly(pts,blur=0):
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[np.array(pts,np.int32)],255); m=m.astype(np.float32)/255
    if blur: m=cv2.GaussianBlur(m,(0,0),blur)
    return m
def hsv(a): return mc.rgb_to_hsv(a[...,:3])

# ---------------- Tay (monocromática: máscaras por polígonos, sempre um pouco para dentro da borda com cabelo/pele/notebook) ----------------
TAY_HOODIE=[(175,386),(200,384),(230,380),(256,376),(262,360),(272,348),(298,347),(322,353),(338,362),(346,374),(352,367),(375,357),(395,354),(402,362),(403,378),(410,386),(426,392),(443,379),(470,367),(482,376),(493,388),(510,392),(525,414),(532,440),(532,468),(525,494),(510,518),(488,536),(462,543),(452,552),(463,560),(467,574),(463,590),(455,598),(457,607),(452,614),(400,613),(330,613),(312,611),(314,585),(314,567),(308,540),(299,500),(288,450),(278,410),(268,396),(250,402),(220,414),(190,427),(172,436),(159,446),(171,507),(184,533),(190,545),(185,575),(165,610),(130,615),(95,560),(88,500),(96,474),(108,452),(120,436),(135,420),(150,405),(165,393)]
TAY_PANTS=[(140,652),(205,642),(262,634),(300,623),(445,621),(700,621),(700,818),(140,818)]
TAY_SHOES=[(100,818),(700,818),(700,960),(100,960)]
def tay_masks():
    a=load('tay'); al=a[...,3]
    hood=poly(TAY_HOODIE)*al; pants=poly(TAY_PANTS)*al; shoes=poly(TAY_SHOES)*al
    return hood,pants,shoes

# ---------------- Cut (azul sobre pele preta: separa por matiz/saturação + linhas de corte) ----------------
LAPTOP=[(181,445),(274,420),(311,562),(313,585),(262,606),(205,626),(140,642),(135,628),(185,600),(200,545)]
def cut_masks():
    a=load('cut'); h=hsv(a); al=a[...,3]; hue=h[...,0]*360
    yy,xx=np.mgrid[0:H,0:W]
    blue=((hue>190)&(hue<255)&(h[...,1]>0.5)&(h[...,2]>0.10)).astype(np.uint8)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)); blue=cv2.morphologyEx(blue,cv2.MORPH_CLOSE,k).astype(np.float32)
    blue=blue*(al>0.5)*(1-poly(LAPTOP))
    head=((yy<300)|((xx>410)&(yy<338))).astype(np.float32)
    # pele preta e luvas: escuras e sem saturação alta (V<0.10 já fica fora); a luva e o polegar ficam de fora por serem grandes demais para o fechamento
    hood=blue*(1-head)*(yy<632); pants=blue*(yy>=632)*(yy<818); shoes=blue*(yy>=818)
    sm=lambda m: cv2.GaussianBlur(m.astype(np.float32),(0,0),1.1)
    return sm(hood)*al,sm(pants)*al,sm(shoes)*al
if __name__=='__main__':
    for n,fn in (('tay',tay_masks),('cut',cut_masks)):
        a=load(n); bg=np.zeros((H,W,3),np.float32)+np.array([40,60,110])/255
        im=a[...,:3]*a[...,3:4]+bg*(1-a[...,3:4])
        hood,pants,shoes=fn()
        out=im.copy()
        for m,c in ((hood,(0,1,0)),(pants,(1,1,0)),(shoes,(0,1,1))):
            out=out*(1-0.55*m[...,None])+np.array(c)*0.55*m[...,None]
        Image.fromarray((out*255).astype('uint8')).save(os.path.join(tempfile.gettempdir(), f'{n}-maskov.png'))
        Image.fromarray((out*255).astype('uint8')).crop((0,280,640,660)).resize((1280,760)).save(os.path.join(tempfile.gettempdir(), f'{n}-maskov-t.png'))
        Image.fromarray((out*255).astype('uint8')).crop((0,600,640,960)).resize((1280,720)).save(os.path.join(tempfile.gettempdir(), f'{n}-maskov-b.png'))
    print('ok')
