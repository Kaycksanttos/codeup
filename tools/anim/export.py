import numpy as np, cv2
from PIL import Image
from masks import *
from masks import IMG_DIR
out=IMG_DIR
def save(n,r,g,b,size,name,blur=0):
    arr=np.stack([r,g,b],-1)
    if blur: arr=cv2.GaussianBlur(arr,(0,0),blur)
    arr=cv2.resize(arr,size,interpolation=cv2.INTER_AREA)
    Image.fromarray((np.clip(arr,0,1)*255+.5).astype('uint8'),'RGB').save(out+name,optimize=True)
# --- partes da roupa (320x480): R moletom, G calça, B tênis
for n,fn in (('tay',tay_masks),('cut',cut_masks)):
    h,p,s=fn(); save(n,h,p,s,(320,480),f'{n}-parts.png')
# --- pesos do movimento (160x240): R cabeça (e tudo que gira junto), G cabelo comprido, B braço
HEAD={'tay':[(60,200),(100,100),(190,20),(300,0),(450,30),(560,130),(585,260),(545,335),(440,352),(340,352),(250,347),(170,332),(90,300),(60,260)],
      'cut':[(80,130),(130,20),(200,0),(380,0),(480,40),(505,200),(515,300),(482,352),(400,352),(350,352),(290,347),(240,322),(150,302),(80,300)]}
HAIR={'tay':[[(45,300),(150,290),(250,330),(250,450),(140,470),(60,420)],[(440,320),(560,300),(585,420),(565,610),(450,615),(440,450)]],'cut':[]}
ARM={'tay':[(395,315),(440,315),(500,360),(535,430),(530,500),(480,545),(430,540),(415,420)],
     'cut':[(455,350),(548,350),(562,420),(566,500),(540,548),(480,548),(430,500),(430,400)]}
for n in ('tay','cut'):
    head=poly(HEAD[n],14); hair=np.zeros((H,W),np.float32)
    for pl in HAIR[n]: hair=np.maximum(hair,poly(pl,12))
    arm=poly(ARM[n],12)
    save(n,head,hair,arm,(160,240),f'{n}-rig.png')
print('ok')
