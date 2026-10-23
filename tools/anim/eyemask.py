import os, tempfile
from masks import IMG_DIR
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from skimage.morphology import convex_hull_image
import matplotlib.colors as mc
IMG=IMG_DIR
E={'tay':[(277,224,42,40),(406,256,33,38)],'cut':[(276,230,38,37),(405,262,35,38)]}
def build(g):
    im=Image.open(IMG+g+'.webp').convert('RGBA'); a=np.asarray(im).astype(float)/255
    rgb=a[...,:3]; hsv=mc.rgb_to_hsv(rgb); mx=rgb.max(2); S=hsv[...,1]; Hh=hsv[...,0]
    H,W=mx.shape; yy,xx=np.mgrid[0:H,0:W]
    out=np.zeros((H,W),bool)
    for (cx,cy,rx,ry) in E[g]:
        ell=((xx-cx)/(rx*1.08))**2+((yy-cy)/(ry*1.08))**2<=1
        if g=='tay':
            m=((S<.25)&(mx>.8))|((Hh>.8)&(Hh<.95)&(S>.75)&(mx>.5))|(mx<.3)
        else:
            m=((S<.25)&(mx>.75))|((Hh>.55)&(Hh<.7)&(S>.5)&(mx>.3))
        m&=ell
        m=ndi.binary_opening(m,iterations=1)
        lab,n=ndi.label(m)
        if n==0: continue
        sizes=ndi.sum(m,lab,range(1,n+1)); keep=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>60])
        hull=convex_hull_image(keep)
        out|=hull
    out=ndi.binary_dilation(out,iterations=2)
    return out,a
for g in E:
    m,a=build(g)
    f=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.3))
    f=f.resize((320,480),Image.LANCZOS)
    Image.merge('RGB',(f,f,f)).save(IMG+g+'-eye.png',optimize=True)
    ov=(a[...,:3]*255).astype(np.uint8).copy(); mm=np.asarray(f.resize((640,960)))>128; ov[mm]=(ov[mm]*.4+np.array([0,255,0])*.6).astype(np.uint8)
    Image.fromarray(ov).crop((190,130,520,340)).resize((990,630)).save(os.path.join(tempfile.gettempdir(), f'eyemask-{g}.png'))
    print(g,mm.sum())
