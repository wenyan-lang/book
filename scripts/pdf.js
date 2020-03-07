const CVT_PDF = true

QL2 = "『"
QR2 = "』"
QL1 = "「"
QR1 = "」"

PRD = "。"
RED = "#BB705A";
BLACK = "#000";
BLUE = "#357";
FONT = "QIJIC"

COLORS = {
  ctrl: RED,
  lop: BLACK,
  name: BLACK,
  cmp: BLACK,
  decl: BLACK,
  print: BLACK,
  rassgn: BLACK,
  ctnr: BLACK,
  comment: "#888",
  type: BLACK,
  call: BLACK,
  assgn: BLACK,
  discard: BLACK,
  endl: BLACK,
  ans: BLACK,
  expr: BLACK,
  op: BLACK,
  not: BLACK,
  operand: BLACK,
  bool: BLACK,
  data: RED,
  iden: BLUE,
  quot: BLACK,
  num: "#872",
  import: BLACK,
  try: BLACK,
  macro: RED,
};

const fs = require('fs');
const semantic = require('./semantic')
var { num2hanzi } = require("@wenyanlang/core")

var execSync = require('child_process').execSync;


var fnames = fs.readdirSync("../").filter(x=>x.endsWith(".md")&&x.includes(" "))
fnames.sort();
var ftexts = fnames.map(x=>fs.readFileSync("../"+x).toString())

for (var i = 0; i < ftexts.length; i++){
	ftexts[i] = ftexts[i].replace(/  /g,"　").replace(/\t/g,"　")//U+3000 ideograph sapce
}
var txt = ftexts.join("\n");
txt = "文言陰符內篇\n　　"+fnames.map((x,i)=>x.split(" ")[1].split(".")[0]+(i%2==1?"\n　":(i>=10?"":"　"))).join("　")+"\n"+txt;

var BLOCKS = txt.split("```");
var bl = txt.split("```");
var sem = [];
for (var i = 0; i < bl.length; i++){
	if (i % 2 == 0){
		bl[i] = bl[i].replace(/`(.+?)`/g,"「$1」")
		bl[i] = bl[i].replace(/\n+/g,"$").replace(/\n/g,'').replace(/\$/g,'\n')

	}else{
		BLOCKS[i] = BLOCKS[i].replace("為是千遍","為是十遍");
	}
	bl[i] = bl[i].replace(/「「「「/g,"『 『").replace(/「「「/g,"『 「").replace(/「「/g,QL2)
				 .replace(/」」」」/g,"』 』").replace(/」」」/g,"」 』").replace(/」」/g,QR2)
				 .replace(/- /g,"-")
				 .replace(/# (.*?第(.+?)\n)/gm, '#文言陰符內篇卷$2\n　　$1')
	if (i % 2 == 1){
		sem[i] = semantic(bl[i]);
	}else{
		sem[i] = [];
	}
}

var CODEMETA = fs.readFileSync("../assets/code-fragment-meta.txt").toString().split("\n")
	.filter(x=>!x.startsWith("#")&&x.length).map(x=>x.trim())
	.map(x=>x.split(" ").map(y=>isNaN(parseInt(y))?y:parseInt(y)));

function matrix(bl,sem,C,R){

	var T = [];
	var x = 0;
	var y = 0;
	var w = 1;
	var p = 1;

	var F = [];
	var A = [];

	for (var i = 0; i < bl.length; i++){
		var fen = [p,x];
		var ind = 0;

		for (var j = 0; j < bl[i].length; j++){
			var t = bl[i][j] 
			var s = sem[i][j] || w
			if (([QL2,QL1]).includes(t)){
				T.push({t,s,x,y,p})

			}else if (([QR2,QR1]).includes(t)){
				if (y == 0){
					T.push({t,s,x:x+w,y:R-w,p})
				}else{
					T.push({t,s,x:x,y:y-w,p})
				}
			}else if (t == PRD){
				if (y == 0){
					if (x == 0){
						T.push({t,s,x:-C+w,y:R-w,p:p-1})
					}else{
						T.push({t,s,x:x+w,y:R-w,p})
					}
				}else{
					T.push({t,s,x:x,y:y-w,p})
				}
			}else if (t == "\n"){
				if (y != 0){
					x -= w;
					y = 0;
					w = 1
					if (x <= -C){
						x = 0;
						y = 0;
						p += 1;
					}
				}
				ind = 0;
			}else if (t == "#"){
				w = 1;
				A.push([p,x])
				if (x == 0 && y == 0){

				}else{
					// console.log(x,C)
					for (var k = x; k > -C; k--){
						T.push({t:'',s,x:k,y:0,p})
						// console.log(k)
					}
					x = 0;
					y = 0;
					p += 1;
				}
			}else if (t == "-"){
				ind = 2;
				T.push({t:"一",s,x,y,p})
				y += w*2;
			}else{
				T.push({t,s,x,y,p})
				y += w;
				if (y >= R){
					y = ind;
					x -= w;
					if (x <= -C){
						x = 0;
						y = 0;
						p += 1;
					}
				}
			}
		}
		F.push([fen,[p,x]])
	}
	return {T,F,A};
}

function typeset(T,F,C,R,W,H,pl,pr,pt,pb){
	var P = []
	var w = (W-pl-pr)/C;
	var h = (H-pt-pb)/R;
	var ra = []
	var PA = []

	for (var i = 0; i < T.length; i++){
		if (!P[T[i].p]){
			P[T[i].p]=""
			ra[T[i].p]=[]
		}
		var f = parseInt(T[i].s) || 1;
		var ox = w*T[i].x;
		var oy = h*T[i].y;
		var ff = 1.15
		var t = T[i].t;
		var d = 3
		var dx = (w-h)/3
		var dy = -h/5

		var cstr = `fill="${BLACK}"`;
		if (COLORS[T[i].s]){
			cstr = `fill="${COLORS[T[i].s]}"`
		}
		var sstrql = `stroke="${RED}" stroke-width="1.5" fill="none" transform="translate(0 5)"`
		var sstrqr = `stroke="${RED}" stroke-width="1.5" fill="none" transform="translate(2 4.5)"`
		if (t == QL1){
			P[T[i].p] += `<path ${sstrql} d="M${ox+h/2+dx} ${oy+dy} L${ox+h+dx} ${oy+dy} L${ox+h+dx} ${oy+h/2+dy}"></path>`
		}else if (t == QL2){
			P[T[i].p] += `<path ${sstrql} d="M${ox+h/2+dx} ${oy+dy} L${ox+h+dx} ${oy+dy} L${ox+h+dx} ${oy+h/2+dy}"></path>`
			P[T[i].p] += `<path ${sstrql} d="M${ox+h/2+dx} ${oy-d+dy} L${ox+h+d+dx} ${oy-d+dy} L${ox+h+d+dx} ${oy+h/2+dy}"></path>`
		}else if (t == QR1){
			P[T[i].p] += `<path ${sstrqr} d="M${ox+dx} ${oy+h/2+dy} L${ox+dx} ${oy+h+dy} L${ox+h/2+dx} ${oy+h+dy}"></path>`
		}else if (t == QR2){
			P[T[i].p] += `<path ${sstrqr} d="M${ox+dx} ${oy+h/2+dy} L${ox+dx} ${oy+h+dy} L${ox+h/2+dx} ${oy+h+dy}"></path>`
			P[T[i].p] += `<path ${sstrqr} d="M${ox-d+dx} ${oy+h/2+dy} L${ox-d+dx} ${oy+h+d+dy} L${ox+h/2+dx} ${oy+h+d+dy}"></path>`
		}else if (t == PRD){
			P[T[i].p] += `<text font-family="${FONT}" y="${oy+h/4+h+dy}" x="${ox+h/2+dx}" font-size="${h*f*ff}" fill="${RED}">${t}</text>`
		}else{
			var iso = (t=="〇");
			if (iso){
				P[T[i].p] += `<circle cy="${oy+(f>1?h/2:0)+h+dy-h/2+h/10}" cx="${ox+dx+h/2+h/20}" r="${h/3.5}" fill="none" stroke-width="1.5" stroke="${COLORS[T[i].s]}"></circle>`
			}else{
				P[T[i].p] += `<text font-family="${FONT}" y="${oy+(f>1?h/2:0)+h+dy}" x="${ox+dx}" font-size="${h*f*ff}" ${cstr}>${t}</text>`

			}
		}

		if (PA[T[i].p] == undefined || PA[T[i].p] == -1){
			PA[T[i].p]=-1
			for (var j = A.length-1; j>=0; j--){
				var m = -T[i].p*C+T[i].x
				var a = -A[j][0]*C+A[j][1]
				if (m+1 < a){
					PA[T[i].p]=j
					break;
				}
			}
		}

		var isc = false;
		var isl = false;
		var isr = false;
		for (var j = 1; j < F.length; j+=2){
			var l = -F[j][1][0]*C+F[j][1][1]
			var r = -F[j][0][0]*C+F[j][0][1]
			var m = -T[i].p*C+T[i].x
			if (l == m-1){
				isl = true;
				break;
			}
			if (m == r+1){
				isr = true;
				break;
			}
			if (l < m && m < r+2){
				isc = true;
				break;
			}
		}
		if (!ra[T[i].p].includes(T[i].x)){
			if (!isc && !isl && !isr && T[i].x != -C+1){
				P[T[i].p]+=`<line x1="${ox}" y1="${0}" x2="${ox}" y2="${H-pt-pb}" stroke="${BLACK}" stroke-width="1" fill="none"></line>`
				ra[T[i].p].push(T[i].x)
			}

			if ((isl || isr) && T[i].x != -C+1){
				P[T[i].p]+=`<line x1="${ox-2}" y1="${0}" x2="${ox-2}" y2="${H-pt-pb}" stroke="${BLACK}" stroke-width="1" fill="none"></line>`
				P[T[i].p]+=`<line x1="${ox+2}" y1="${0}" x2="${ox+2}" y2="${H-pt-pb}" stroke="${BLACK}" stroke-width="1" fill="none"></line>`
				ra[T[i].p].push(T[i].x)
			}
		}
		
	}
	var P2 = []
	// console.log(PA,P.length,PA.length)
	for (var i = 0; i < P.length/2; i++){
		var p = P[i*2];
		var q = P[i*2+1];
		// console.log(PA[i*2+1])
		if (PA[i*2+1] == undefined){
			PA[i*2+1] = fnames.length-1
		}
		if (PA[i*2]==undefined){
			PA[i*2] = 0
		}

		P2[i] = `<svg xmlns="http://www.w3.org/2000/svg" width="${W*2}" height="${H}">`;
		P2[i] += `<g transform="translate(${W*2-pr-w} ${pt})">${p}</g>`
		P2[i] += `<g transform="translate(${W-pl-w} ${pt})">${q}</g>`

		
if(i!=0)P2[i] += `<path fill="none" stroke-width="3" stroke="${BLACK}" d="M${W*2} ${pt} L${W+pl} ${pt} L${W+pl} ${H-pb} L${W*2} ${H-pb} "></path>`
		P2[i] += `<path fill="none" stroke-width="3" stroke="${BLACK}" d="M${0} ${pt} L${W-pl} ${pt} L${W-pl} ${H-pb} L${0} ${H-pb} "></path>`
		P2[i] += `<rect fill="none" stroke-width="1" stroke="${BLACK}" x="${W}" y="${0}" width="${W}" height="${H}"></rect>`
		P2[i] += `<rect fill="none" stroke-width="1" stroke="${BLACK}" x="${0}" y="${0}" width="${W}" height="${H}"></rect>`
if(i!=0)P2[i] += `<line x1="${W*2-pr}" y1="${pt}" x2="${W*2-pr}" y2="${H-pb}" stroke="${BLACK}" stroke-width="1" fill="none"></line>`
		P2[i] += `<line x1="${pr}" y1="${pt}" x2="${pr}" y2="${H-pb}" stroke="${BLACK}" stroke-width="1" fill="none"></line>`
		

		var Ht = H*0.08
		var Hs = H*0.55


if(i!=0)P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${W*2} ${pt+Ht} L${W*2-pr} ${pt+Ht} L${W*2-pr} ${pt+Ht+pr} L${W*2} ${pt+Ht+pr*0.5} "></path>`
		P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${0} ${pt+Ht} L${pr} ${pt+Ht} L${pr} ${pt+Ht+pr} L${0} ${pt+Ht+pr*0.5} "></path>`

		var d = 5;
if(i!=0)P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${W*2} ${pt+Ht-d} L${W*2-pr} ${pt+Ht-d}"></path>`
		P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${0} ${pt+Ht-d} L${pr} ${pt+Ht-d}"></path>`
if(i!=0)P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${W*2} ${pt+Hs-d} L${W*2-pr} ${pt+Hs-d}"></path>`
		P2[i] += `<path fill="none" stroke="${BLACK}" stroke-width="${1}" d="M${0} ${pt+Hs-d} L${pr} ${pt+Hs-d}"></path>`


		var t = "文言陰符內篇卷"
		var _tp = fnames[PA[i*2]].split(" ")[1].split(".")[0]
		var _tq = fnames[PA[i*2+1]].split(" ")[1].split(".")[0]
		var tp = t+_tp.split("第")[1]
		var tq = t+_tq.split("第")[1]

		var ttp = num2hanzi(i*2-1);
		var ttq = num2hanzi(i*2);

		if (i == 0){
			tp = tq =  "文言陰符內篇目錄"
			ttp = ttq = "";
			_tp =  _tq = "";
			P2[i] += `<g transform="translate(${W} 0)">${titlepage(W,H,pl,pr,pt,pb)}</g>`;
		}


if(i!=0)for (var j = 0; j < tp.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*1.8+Ht+j*20}" x="${W*2-pr}" font-size="${20}" fill="${BLACK}">${tp[j]}</text>`
		}
		for (var j = 0; j < tq.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*1.8+Ht+j*20}" x="${0}" font-size="${20}" fill="${BLACK}">${tq[j]}</text>`	
		}

if(i!=0)for (var j = 0; j < _tp.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*0.5+Hs+j*20}" x="${W*2-pr}" font-size="${20}" fill="${BLACK}">${_tp[j]}</text>`
		}
		for (var j = 0; j < _tq.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*0.5+Hs+j*20}" x="${0}" font-size="${20}" fill="${BLACK}">${_tq[j]}</text>`	
		}

		var Hp = H-pb-pt-ttp.length*20;
		var Hq = H-pb-pt-ttq.length*20;
		// console.log(ttp,ttq,Hp,Hq)
if(i!=0)for (var j = 0; j < ttp.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*0.2+Hp+j*20}" x="${W*2-pr}" font-size="${20}" fill="${BLACK}">${ttp[j]}</text>`
		}
		for (var j = 0; j < ttq.length; j++){
			P2[i] += `<text font-family="${FONT}" y="${pt+pl*0.2+Hq+j*20}" x="${0}" font-size="${20}" fill="${BLACK}">${ttq[j]}</text>`	
		}
	

		P2[i] += `</svg>`
	}
	return P2;
}

function titlepage(W,H,pl,pr,pt,pb){
	var WM = (W-pl-pr)*0.6;
	var WL = ((W-pl-pr)-WM)/2;

	var tw = WL/1.8;
	var sw = WL/2.5;
	var tr = [0,0]
	var sr = [0,0]

	var ti = fs.readFileSync("../assets/title-alt.svg").toString().replace(/width="(.*?)" height="(.*?)"/,function(_,w,h){
		var hh = (H-pt-pb)*0.9;
		var ww = hh*w/h;
		tr = [pl+WL+(WM-ww)/2,pt+(H-pt-pb-hh)/2]
		return `width="${ww}" height="${hh}"`
	})

	var se = fs.readFileSync("../assets/exlibris.svg").toString().replace(/width="(.*?)" height="(.*?)"/,function(_,w,h){
		var ww = WL*0.8;
		var hh = ww*h/w;
		sr = [pl+WL+WM+(WL-ww)/2,H-pb-hh-sw*0.25]
		return `width="${ww}" height="${hh}"`
	})

	return `
	<rect fill="none" stroke-width="3" stroke="${BLACK}" x="${pl}" y="${pt}" width="${W-pl-pr}" height="${H-pt-pb}"></rect>
	<rect fill="none" stroke-width="1" stroke="${BLACK}" x="${pl+WL}" y="${pt}" width="${WM}" height="${H-pt-pb}"></rect>

	<g transform="translate(${tr[0]} ${tr[1]})">${ti}</g>
	<g transform="translate(${sr[0]} ${sr[1]})">${se}</g>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*1}px">文</text>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*2}px">言</text>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*3}px">編</text>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*4}px">程</text>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*5}px">入</text>
	<text font-family="${FONT}" font-size="${tw}" x="${pl+WL+WM+(WL-tw)/2}" y="${pt+tw*6}px">門</text>

	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl+sw}" y="${H-pb-sw*0.5-sw*3}">庚</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl+sw}" y="${H-pb-sw*0.5-sw*2}">子</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl+sw}" y="${H-pb-sw*0.5-sw*1}">年</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl+sw}" y="${H-pb-sw*0.5-sw*0}">春</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl}"    y="${H-pb-sw*0.5-sw*3}">黃</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl}"    y="${H-pb-sw*0.5-sw*2}">令</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl}"    y="${H-pb-sw*0.5-sw*1}">東</text>
	<text font-family="${FONT}" font-size="${sw}" x="${(WL-sw*2)/2+pl}"    y="${H-pb-sw*0.5-sw*0}">編</text>

	

	`.replace(/xmlns.*?=".*?"/g,"").replace(/<\?xml.*?>/g,"").replace(/<!DOCTYPE.*?>/g,"")
	
}



var C = 11
var R = 27
var [W,H]=[500,900]
var [pl,pr,pt,pb] = [25,20,125,45]
var {T,F,A} = matrix(bl,sem,C,R)
var P = typeset(T,F,C,R,W,H,pl,pr,pt,pb)

console.log("making pages...")
for (var i = 0; i < P.length; i++){
	var f = `${(i+1).toString().padStart(3,'0')}`
	fs.writeFileSync(`../tmp/${f}.svg`,P[i]);
	
	if (CVT_PDF)execSync(`cd ../tmp; cairosvg -f pdf ${f}.svg > ${f}.pdf`, { encoding: 'utf-8' });
	
	console.log(i+1,'/',P.length);
}
console.log("making covers...")
fs.copyFileSync("../assets/cover-front-alt.svg","../tmp/000.svg")
fs.copyFileSync("../assets/cover-back.svg","../tmp/999.svg")

if (CVT_PDF)execSync(`cd ../tmp; cairosvg -f pdf 000.svg > 000.pdf`, { encoding: 'utf-8' });
if (CVT_PDF)execSync(`cd ../tmp; cairosvg -f pdf 999.svg > 999.pdf`, { encoding: 'utf-8' });

console.log("making pdf...")
if (CVT_PDF) execSync(`"/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" -o ../assets/wenyan-book.pdf ../tmp/*.pdf`, { encoding: 'utf-8' });



console.log("making html...")
var svgs = fs.readdirSync("../tmp").filter(x=>x.endsWith(".svg"))
svgs.sort();
var html = `<html><head><meta charset="UTF-8"></head>
	<style>
		@font-face {
			font-family: QIJIC;
			src: url('../assets/font.woff2') format('woff2'), url('.../assets/font.ttf') format('truetype');
		}
	</style>
`+svgs.map(x=>fs.readFileSync("../tmp/"+x)).join(`<p style="page-break-before: always"></p>`)+`</html>`
fs.writeFileSync("../tmp/index.html",html);



console.log('done');