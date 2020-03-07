import cairosvg
import cv2; cv = cv2
import numpy as np
import random
import math
from glob import glob

def makeold(pth):

    cairosvg.svg2png(url=pth, write_to='../tmp/tmp.png')

    im = cv2.imread("../tmp/tmp.png",cv2.IMREAD_UNCHANGED).astype(np.float32)/255
    H,W = im.shape[0],im.shape[1]


    im = cv2.resize(im,(W*2,H*2))
    sl = random.random()*20-10
    sr = random.random()*20-10
    pl = random.random()*math.pi
    pr = random.random()*math.pi
    ml = random.random()*10
    mr = random.random()*10
    dl = 20*random.random()-5
    dr = -20*random.random()+5
    for i in range(0,W):
        x = math.sin(i/W*5+pl)*ml
        d = int(x+sl+dl*i/W)
        im[40:-40,i] = im[40+d:-40+d,i]
    for i in range(0,W):
        x = math.sin(i/W*5+pr)*mr
        d = int(x+sr+dr*i/W)
        im[40:-40,i+W] = im[40+d:-40+d,i+W]

    im = cv2.resize(im,(W,H))

    wh = np.ones([H,W])
    imw = np.zeros([H,W,3])
    imw[:,:,0] = wh * (1-im[:,:,3]) + im[:,:,0] * (im[:,:,3])
    imw[:,:,1] = wh * (1-im[:,:,3]) + im[:,:,1] * (im[:,:,3])
    imw[:,:,2] = wh * (1-im[:,:,3]) + im[:,:,2] * (im[:,:,3])


    bg = np.ones([H,W,3])
    bg[:,:,0]*=0.9
    bg[:,:,1]*=0.93
    bg[:,:,2]*=0.95


    a = cv2.getGaussianKernel(W,800)
    b = cv2.getGaussianKernel(H,800)
    c = b*a.T
    d = (c-c.min())/(c.max()-c.min())

    e = np.clip(d*30,0,1)*0.9+0.1
    e = cv2.GaussianBlur(e,(11,11),0)
    em = np.random.random([int(H/200),int(W/200)])
    em =cv2.resize(em,(W,H),interpolation=cv2.INTER_CUBIC)
    e = np.clip(e+em,0,1)

    d = d*0.5+0.5


    n = np.random.random([int(H/300),int(W/300)])
    n =cv2.resize(n,(W,H),interpolation=cv2.INTER_CUBIC)
    n1 = np.random.random([int(H/50),int(W/50)])
    n1 =cv2.resize(n1,(W,H),interpolation=cv2.INTER_CUBIC)
    nn = (n*0.5+n1*0.5)*0.3+0.7
    # cv2.imshow('',nn);cv2.waitKey(0)

    d = (d * nn)*0.5+0.5
    d*=e

    m = cv2.getGaussianKernel(W,10).T
    m = cv2.resize(m,(W,H),interpolation=cv2.INTER_CUBIC)
    m = 1-(m-m.min())/(m.max()-m.min())
    m = m*0.3+0.7


    # cv2.imshow('',d);cv2.waitKey(0)

    bg[:,:,0] *= d
    bg[:,:,1] = bg[:,:,1]* d*0.4+bg[:,:,1]*0.6
    bg[:,:,2] = bg[:,:,2]* d*0.3+bg[:,:,2]*0.7

    bg[:,:,0] *= bg[:,:,1]* m *0.5+bg[:,:,1]*0.5
    bg[:,:,1] *= bg[:,:,1]* m *0.45+bg[:,:,1]*0.55
    bg[:,:,2] *= bg[:,:,2]* m *0.4+bg[:,:,2]*0.6

    r = np.random.random([H,W])*0.05+0.95
    bg[:,:,0]*=r
    bg[:,:,1]*=r
    bg[:,:,2]*=r

    cr = np.random.random([int(H/10),int(W/10)])
    cr =cv2.resize(cr,(W,H),interpolation=cv2.INTER_CUBIC)
    cr = np.clip(cr+0.8,0,1)
    cr = np.clip(cr-0.2,0,1)*1.25
    cr = np.clip(cr+np.random.random([H,W])*0.3,0,1)

    crm = np.random.random([int(H/200),int(W/200)])
    crm =cv2.resize(crm,(W,H),interpolation=cv2.INTER_CUBIC)
    cr = np.clip(cr+crm*0.2,0,1)

    # cv2.imshow('',cr);cv2.waitKey(0)

    bg[:,:,0]*=0.4+cr*0.6
    bg[:,:,1]*=0.5+cr*0.5
    bg[:,:,2]*=0.6+cr*0.4

    k = np.copy(im[:,:,3])

    knm = np.random.random([int(H/200),int(W/200)])
    knm =cv2.resize(knm,(W,H),interpolation=cv2.INTER_CUBIC)
    knm = np.clip((knm-0.5)*2+0.5-0.1,0,1)

    kn = np.clip(1.25-np.random.random([H,W])*knm,0,1)

    k *= kn*0.9

    k[:,W//2-2:W//2+2]=0.2
    k[:,W//2-1:W//2+1]=0.3
    k[:,W//2]=0.4

    im[:,:,0] = bg[:,:,0] * (1-k) + im[:,:,0] * k
    im[:,:,1] = bg[:,:,1] * (1-k) + im[:,:,1] * k
    im[:,:,2] = bg[:,:,2] * (1-k) + im[:,:,2] * k


    rr = cv2.flip(imw,1);
    rr = cv2.GaussianBlur(rr,(5,5),0)


    rrm = np.random.random([int(H/100),int(W/100)])
    rrm =cv2.resize(rrm,(W,H),interpolation=cv2.INTER_CUBIC)

    rr[:,:,0] += rrm*0.3
    rr[:,:,1] += rrm*0.3
    rr[:,:,2] += rrm*0.3
    rr = np.clip(rr,0,1)

    im = (rr*0.1+0.9)*im[:,:,0:3]

    # cv2.imshow('',rr);cv2.waitKey(0)
    # cv2.imshow('',im);cv2.waitKey(0)

    cv2.imwrite((".".join(pth.split(".")[:-1]))+".png",(im*255).astype(np.uint8))

for x in glob("../tmp/*.svg"):
    print(x)
    try:
        makeold(x)
    except:
        pass
