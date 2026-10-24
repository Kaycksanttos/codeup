# Recorta as logos do Python e do SQL da imagem original (fundo branco) e gera as duas logos com fundo transparente.
# Uso: python3 tools/anim/logos.py   ->  public/img/logo-python.webp e public/img/logo-sql.webp
import os, numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,'..','..','public','img')
im=np.array(Image.open(os.path.join(HERE,'src','logos-python-sql.png')).convert('RGB')).astype(np.float32)/255
H,W,_=im.shape
# fundo = quase branco ligado à borda (os brancos de dentro das logos ficam cercados pelo contorno azul escuro)
near=(im.min(axis=2)>0.90)
lab,n=ndi.label(near)
edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
# alfa suave: distância ao fundo (0 no fundo, sobe até 1 em ~2 px para dentro)
d=ndi.distance_transform_edt(~bg)
a=np.clip(d/2.2,0,1); a=a*a*(3-2*a)
a=cv2.GaussianBlur(a.astype(np.float32),(0,0),0.6)
a[bg & (d==0)]=0
# tira o halo branco das bordas: cor = (c - (1-a)*branco)/a
a3=np.maximum(a[...,None],1e-3)
col=np.clip((im-(1-a[...,None])*1.0)/a3,0,1)
col=np.where(a[...,None]>0.02,col,im)
rgba=np.dstack([col,a])
out=(rgba*255+.5).astype(np.uint8)
# separa as duas logos pelo vazio no meio
cols=(a>0.05).any(axis=0); 
gaps=[]; s=None
for x in range(W):
    if not cols[x]:
        if s is None: s=x
    else:
        if s is not None: gaps.append((s,x)); s=None
mid=max([g for g in gaps if 300<g[0]<1400],key=lambda g:g[1]-g[0]); print('vazio',mid, W,H)
for name,(x0,x1) in {'sql':(0,mid[0]),'python':(mid[1],W)}.items():
    sub=out[:,x0:x1]; ys,xs=np.where(sub[...,3]>12)
    bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    pad=6; crop=sub[max(0,by0-pad):by1+pad,max(0,bx0-pad):bx1+pad]
    img=Image.fromarray(crop,'RGBA'); img.thumbnail((360,360),Image.LANCZOS)
    img.save(os.path.join(OUT,f'logo-{name}.webp'),'WEBP',quality=92,method=6,alpha_quality=100); print(name,img.size)
