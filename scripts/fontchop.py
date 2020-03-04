# -*- coding: utf-8 -*-

from glob import glob
import os
import sys
import json
import fontforge
import os

corp = "".join([open(x,'r').read() for x in glob("../../wenyan-book/*.md")])
# scorp = "".join(sorted(list(set([x for x in list(corp) if (0x4e00 < ord(x) < 0x9fff)]))))+"。、 "
scorp = "".join(sorted(list(set([x for x in list(corp)]))))+"卷撰"
keep = [x for x in scorp]



odd = [x.split("\t") for x in open("../../qiji-font/data/variant_map.txt",'r').read().split("\n") if len(x)]
simp = json.loads(open("../../qiji-font/data/TC2SC.json",'r').read())
simp = [[x,simp[x]] for x in simp]
version = json.loads(open("../../qiji-font/package.json", "r").read())["version"]

font = fontforge.font()
font.familyname = "QIJISUBSET"
font.fontname = "QIJISUBSET"
font.fullname= "QIJISUBSET"
font.copyright = "Copyright (c) 2020, Lingdong Huang"

font.version = version

care = {x.split("\t")[0].split("/")[-1].split(".")[0]:x.split("\t")[1] for x in open("../../qiji-font/data/labels_all.txt",'r').read().split("\n") if len(x)}


for pth in care:

    char = care[pth]

    f = "../../qiji-font/output/stage/"+pth+".svg"

    other = set()
    for o in odd:
        if o[0] == char:
            other.add(o[1])
        elif o[1] == char:
            other.add(o[0])

    for o in simp:
        if o[0] == char:
            other.add(o[1])
        elif o[1] == char:
            other.add(o[0])

    ok = False
    if char in keep:
        ok = True
    else:
        for o in other:
            if o in keep:
                ok = True
                continue
    if not ok:
        # print('no',char)
        continue

    hx = ord(char)
    # print(hx,char,list(other))
    glyph = font.createChar(hx)
    try:
        glyph.importOutlines(f)
    except:
        print("lack",f) 
        exit()
        continue
    glyph.width=800
    glyph.simplify()

    other = other - set(care.values())
    if len(other) > 0:
        glyph.altuni = [ ord(o) for o in other ]
# exit()

glyph = font.createChar(0x3001)
glyph.importOutlines("../../qiji-font/output/singles/、f.svg")
glyph.width=800
glyph = font.createChar(0x3002)
glyph.importOutlines("../../qiji-font/output/singles/。f.svg")
glyph.width=800
glyph = font.createChar(0x3000)
glyph.width=800
glyph = font.createChar(0x20)
glyph.width=800


done = [x.unicode for x in list(font.glyphs())]
for x in list(font.glyphs()):
    if x.altuni:
        done += [y[0] for y in x.altuni]
done = list(set(done))

for f in glob("../../qiji-font/output/fallback_stage/*.svg"):
    char = f.split("/")[-1].split(".")[0]
    if char not in keep:
        continue

    hx = ord(char)
    print(hx,char)
    if hx in done:
        print("done")
        continue
    
    glyph = font.createChar(hx)
    
    glyph.importOutlines(f)
    glyph.width=800
    glyph.simplify()


print(len(list(font.glyphs())))

font.generate("../assets/font.ttf")
os.system("rm ../assets/font.woff2; cat ../assets/font.ttf | ttf2woff2 >> ../assets/font.woff2")
