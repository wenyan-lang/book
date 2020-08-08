var constants = `
QL2 = "『"
QR2 = "』"
QL1 = "「"
QR1 = "」"

PRD = "。"
RED = "#BB705AEE";
BLACK = "#2B2B2B";
BLUE = "#357";

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
`;

var ICONS = {//for iconify failures
	OPEN_IN_NEW:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="iconify" data-icon="mdi:open-in-new"><path d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" fill="currentColor"></path></svg>`
	,CLOSE:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="iconify" data-icon="mdi:close" data-inline="false"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z" fill="currentColor"></path></svg>`
	,PLAY:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="iconify" data-icon="mdi:play" data-inline="false"><path d="M8 5.14v14l11-7l-11-7z" fill="currentColor"></path></svg>`
}

eval(constants)
const fs = require('fs');
const semantic = require('./semantic')


var fnames = fs.readdirSync("../").filter(x=>x.endsWith(".md")&&x.includes(" "))
fnames.sort();
var ftexts = fnames.map(x=>fs.readFileSync("../"+x).toString())

for (var i = 0; i < ftexts.length; i++){
	ftexts[i] = ftexts[i].replace(/  /g,"　").replace(/\t/g,"　")//U+3000 ideograph sapce
}
var txt = ftexts.join("\n");
txt = "文言陰符內篇\n　　"+fnames.map((x,i)=>x.split(" ")[1].split(".")[0]+(i%2==1?"\n　":(i>=10?"":"　"))).join("　")+"\n"+txt;

ICONS.CHAPTERS = []
for (var i = 0; i < fnames.length; i++){
	ICONS.CHAPTERS[i] = fs.readFileSync("../assets/chapter-icons/"+fnames[i].split(" ")[0]+".svg").toString()
	.replace(/width=".*?" height=".*?"/,`width="36" height="36"`)
	// .replace(/<path/g,`<path vector-effect="non-scaling-stroke"`)
	.replace(/stroke=".*?"/g,`stroke="currentColor"`)
}


var BLOCKS = txt.split("```");
var bl = txt.split("```");
var sem = [];
for (var i = 0; i < bl.length; i++){
	if (i % 2 == 0){
		bl[i] = bl[i].replace(/`(.+?)`/g,"「$1」")
		bl[i] = bl[i].replace(/\n+/g,"$").replace(/\n/g,'').replace(/\$/g,'\n')
		bl[i] = bl[i].replace(/」 「/g,"」「")

	}else{
		BLOCKS[i] = BLOCKS[i].replace("為是千遍","為是十遍");
	}
	bl[i] = bl[i].replace(/「「「「/g,"『 『").replace(/「「「/g,"『 「").replace(/「「/g,QL2)
				 .replace(/」」」」/g,"』 』").replace(/」」」/g,"」 』").replace(/」」/g,QR2)
				 .replace(/- /g,"-")
				 .replace(/# /g,"#")
	if (i % 2 == 1){
		sem[i] = semantic(bl[i]);
	}else{
		sem[i] = [];
	}
}

var CODEMETA = fs.readFileSync("../assets/code-fragment-meta.txt").toString().split("\n")
	.filter(x=>!x.startsWith("#")&&x.length).map(x=>x.trim())
	.map(x=>x.split(" ").map(y=>y.includes("[")?y:(isNaN(parseInt(y))?y:parseInt(y))));

function matrix(bl,sem,H){

	var T = [];
	var x = -10;
	var y = 0;
	var w = 1;
	var F = [];
	var A = [];
	for (var i = 0; i < bl.length; i++){
		// if (i % 2 == 1){
			x -= w;	
		// }

		var fen = x;
		var ind = 0;

		for (var j = 0; j < bl[i].length; j++){
			var t = bl[i][j] 
			var s = sem[i][j] || w
			if (([QL2,QL1]).includes(t)){
				T.push({t,s,x,y})
			}else if (([QR2,QR1]).includes(t)){
				if (y == 0){
					T.push({t,s,x:x+w,y:H-w})
				}else{
					T.push({t,s,x:x,y:y-w})
				}
			}else if (t == PRD){
				if (y == 0){
					T.push({t,s,x:x+w,y:H-w})
				}else{
					T.push({t,s,x:x,y:y-w})
				}
			}else if (t == "\n"){
				if (y != 0){
					x -= w;
					y = 0;
					w = 1
				}
				ind = 0;
			}else if (t == "#"){
				w = 2;
				A.push(x)
				x -= 1;
			}else if (t == "-"){
				ind = 2;
				T.push({t:"一",s,x,y})
				y += w*2;
			}else{
				T.push({t,s,x,y})
				y += w;
				if (y >= H){
					y = ind;
					x -= w;
				}
			}
		}
		F.push([fen,x])
	}
	return {T,F,A};
}


function typeset(T,F,l,r,w,h){
	var p = w-h;
	var O = "";
	var ymax = 0;
	for (var i = 0; i < T.length; i++){
		var f = parseInt(T[i].s) || 1;
		var ff = 1.1
		var x = T[i].x*w-w*f;
		var t = T[i].t;
		var cstr = "";
		if (COLORS[T[i].s]){
			cstr = `color:${COLORS[T[i].s]};`
		}

		if (l < x+w && x < r){
			var d = 3
			var ox = x-l;
			var oy = h*T[i].y;
			ymax = Math.max(oy,ymax);
			if (t == QL1){
				O += `<div class="ql" style="top:${oy}px; left:${ox+h/2}px; width:${h/2}px; height:${h/2}px;">「</div>`
			}else if (t == QL2){
				O += `<div class="ql" style="top:${oy}px; left:${ox+h/2}px; width:${h/2}px; height:${h/2}px;">「</div>`
				O += `<div class="ql" style="top:${oy-d}px; left:${ox+h/2}px; width:${h/2+d}px; height:${h/2+d}px;">「</div>`
			}else if (t == QR1){
				O += `<div class="qr" style="top:${oy+h/2}px; left:${ox}px; width:${h/2}px; height:${h/2}px;">」</div>`
			}else if (t == QR2){
				O += `<div class="qr" style="top:${oy+h/2}px; left:${ox}px; width:${h/2}px; height:${h/2}px;">」</div>`
				O += `<div class="qr" style="top:${oy+h/2}px; left:${ox-d}px; width:${h/2+d}px; height:${h/2+d}px;">」</div>`
			}else if (t == PRD){
				O += `<div class="punc" style="top:${oy+h/2}px; left:${ox+h/2}px; font-size:${h*f*ff}px; ${(cstr.length)?cstr:"color:"+RED};">${t}</div>`
			}else{
				var iso = (t=="〇");
				O += `<div class="text" style="top:${oy+(f>1?h/2:0)}px; left:${ox+iso*h*0.15}px; font-size:${h*f*(iso?0.8:ff)}px; ${cstr}">${t}</div>`
			}
		}
	}
	for (var i = 0; i < F.length; i++){
		if (l < F[i][0]*w && F[i][1]*w < r){
			if (i % 2 == 1){
				var run = (`
				(function (){
					var _i = ${i};
					var m = CODEMETA[(_i-1)/2];
					var c = '';
					for (var j = 0; j < m.length; j++){
						if (typeof m[j] == 'string'){
							if (m[j].includes('[')){
								var i0 = parseInt(m[j].split('[')[0]);
								var i1 = parseInt(m[j].split('[')[1].split(':')[0]);
								var i2 = parseInt(m[j].split(':')[1].split(']')[0]);
								if (isNaN(i2)){
									i2 = undefined;
								}
								if (isNaN(i0)){
									i1 = 0;
								}
								c += BLOCKS[_i+i0*2].slice(1).split('\\n').slice(i1,i2).join('\\n');
							}else{
								c += m[j];
							}
						}else{
							c += BLOCKS[_i+m[j]*2].slice(1);
						}
						c += '\\n'
					}
					window.currentCode = c;
					document.getElementById('editor-wrap').style.left='10px';
					document.getElementById('editor').contentWindow.postMessage({action:'code',value: c},'*')
					document.getElementById('editor').contentWindow.postMessage({action:'run'},'*')
					document.getElementById('editor').contentWindow.postMessage({action:'set-view',value:50},'*')
				})()
				`).replace(/\n/g,';')
				O += `<div class="box" style="top:${-2}px; left:${F[i][1]*w-l-10}px; width:${(F[i][0]-F[i][1])*w+20}px; height:${ymax+h+4}px; transform:;"></div>`
				if (CODEMETA[(i-1)/2][0] != 'X'){
					O += `<div class="popbtn" onclick="${run}" style="top:${Math.round(ymax+h-18)}px; left:${Math.round(F[i][1]*w-l-10)}px; width:${20}px; height:${20}px;">${ICONS.OPEN_IN_NEW}</div>`
				}
			}else{
				for (var j = F[i][1]; j < F[i][0]; j++){
					O += `<div class="rail${(j==F[i][0]-1)?'f':''}" style="top:${-2}px; left:${j*w-l}px; width:${w}px; height:${ymax+h+4}px;"></div>`

				}
			}
		}
	}
	return O;
}


function main(){
	var w = 36;
	var h = 28;
	var R = document.getElementById("render");
	var S = document.getElementById("slider")
	var M;

	dragElement(S);
	function dragElement(elmnt) {
	  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	  if (document.getElementById(elmnt.id + "header")) {
	    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	  } else {
	    elmnt.onmousedown = dragMouseDown;
	  }
	  function dragMouseDown(e) {
	    e = e || window.event;
	    e.preventDefault();
	    pos3 = e.clientX;
	    pos4 = e.clientY;
	    document.onmouseup = closeDragElement;
	    document.onmousemove = elementDrag;
	  }

	  function elementDrag(e) {
	    e = e || window.event;
	    e.preventDefault();
	    pos1 = pos3 - e.clientX;
	    pos2 = pos4 - e.clientY;
	    pos3 = e.clientX;
	    pos4 = e.clientY;
	    elmnt.style.right = Math.min(Math.max(window.innerWidth-(elmnt.offsetLeft - pos1 + elmnt.offsetWidth),0),window.innerWidth-elmnt.offsetWidth) + "px";
	    review();
	  }
	  function closeDragElement() {
	    document.onmouseup = null;
	    document.onmousemove = null;
	  }
	}

	var l = -window.innerWidth;
	var r = 0;
	var O;
	var ll = 0;
	var H = window.innerHeight-200;

	function calcSlider(){
		var ww = window.innerWidth*(r-l)/(-ll*w)
		S.style.width = ww+"px";
		S.style.right = (-window.innerWidth*r/(-ll*w))+"px";
	}

	function getCurrChap(){
		for (var i = M.A.length-1; i >= 0;i--){
			if (r < M.A[i]*w){
				return i;
			}
		}
		return -1;
	}

	function calcCover(){
		var _ra = document.getElementsByClassName("rail")[0];
		if (!_ra){
			_ra = document.getElementsByClassName("box")[0];
		}
		if (!_ra){
			return;
		}

		var _h = (_ra.offsetHeight-2);
		var _t = 204;

		var cov = document.getElementById("cover");
		cov.style.position = "absolute"
		cov.style.height = (_h-3)+"px";
		cov.style.top = _t+"px"
		cov.style.right = (r+40)+"px"
		cov.style.width =(w*9)+"px"
		cov.style.border = `3px solid ${BLACK}`
		cov.style.fontFamily = "QIJI"
		cov.style.fontSize="100px"
		cov.style.pointerEvents="none"
		if (cov.offsetLeft > window.innerWidth){
			cov.style.display = "none";
		}else{
			cov.style.display = "block";
		}


		var bar = document.getElementById("bar");
		bar.style.position = "absolute"
		bar.style.height = _h+"px";
		bar.style.top = _t+"px"
		bar.style.right = "0px";
		bar.style.width = "20px";
		bar.style.borderLeft = `1px solid ${BLACK}`;
		bar.style.borderTop = `1px solid ${BLACK}`;
		bar.style.borderBottom = `1px solid ${BLACK}`;
		bar.style.boxShadow = `-1px 0px 2px rgba(0,0,0,0.1)`
		// bar.style.background = `#EFEFEF`
		bar.style.color = BLACK
		bar.style.zIndex = 10000
		bar.style.fontFamily="QIJI";
		bar.style.cursor="pointer";

		var o = `
			<div style="
				position:absolute;
				top:20px;
				left:0px;
				height:10px;
				width:20px;
				border-top:1px solid ${BLACK};
			"></div>
			<div style="
				top:25px;
				left:0px;
				position:absolute;
				width: 0;
				height: 0;
				border-left: 0px solid transparent;
				border-right: 35px solid transparent;
				border-top: 20px solid ${BLACK};
			"></div>
			<div style="
				position:absolute;
				height:20px;
				width:35px;
				top:30px;
				left:0px;
		     	background: 
		        linear-gradient(to top left,
		            rgba(0,0,0,0) 0%,
		            rgba(0,0,0,0) calc(50% - 0.8px),
		            rgba(0,0,0,1) 50%,
		            rgba(0,0,0,0) calc(50% + 0.8px),
		            rgba(0,0,0,0) 100%);
			"></div>
			<div style="
				position:absolute;
				top:${Math.max(H*0.5,240)}px;
				left:0px;
				height:10px;
				width:20px;
				border-top:1px solid ${BLACK};
			"></div>
		`
		var i = getCurrChap();

		if (i != -1){
			var t = fnames[i].split(" ")[1].split(".")[0];
			var s = "文言陰符內篇卷"+t.split("第")[1];
			for (var j = 0; j < s.length; j++){
				o += `<div style="position:absolute; font-size:20px; left:1px; top:${60+j*20}px">${s[j]}</div>`
			}
			for (var j = 0; j < t.length; j++){
				o += `<div style="position:absolute; font-size:20px; left:1px; top:${Math.max(H*0.5,240)+j*20}px">${t[j]}</div>`
			}
			bar.onclick = function(){
				setR(M.A[i]*w-w/2);
			}
			
			bar.innerHTML = o;
			bar.style.display = "block"

			var tis = document.getElementById("toc-inner").children;
			for (var j = 0; j < tis.length; j++){
				tis[j].classList.remove("tocitem-curr");
			}
			tis[i].classList.add("tocitem-curr");
			var tin = document.getElementById("toc-inner");
			// console.log(tis[i].offsetLeft)
			if (tis[i].offsetLeft+tin.offsetLeft < 10){
				tin.style.left = (-tis[i].offsetLeft+10)+"px";
			}
			var tr = document.getElementById("toc").offsetWidth-180;
			if (tis[i].offsetLeft+tin.offsetLeft > tr){
				tin.style.left = -(tis[i].offsetLeft-tr)+"px";
			}
		}else{
			bar.style.display = "none"
		}
	}

	function setR(_r){
		r = _r;
		l = r-window.innerWidth;
		calcSlider();
		var O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
		calcCover()
		rewheel({deltaX:1,deltaY:1,preventDefault:_=>0})
	}
	function slowSetR(_r){
		for (var i = 0; i < 10; i++){
			var t = i/10+0.1;
			;;(function(){
				var s = i*100;
				var rr = r * (1-t) + _r * t;
				setTimeout(function(){setR(rr)},s);
			})()
		}
	}

	function review(){
		l = ((window.innerWidth-S.offsetLeft)/window.innerWidth)*ll*w;
		r = ((window.innerWidth-(S.offsetLeft+S.offsetWidth))/window.innerWidth)*ll*w;
		// r = Math.max(Math.min(0,r),M.T[M.T.length-1].x*w);
		// l = r-window.innerWidth;
		O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
		calcCover()
	}

	function reflow(){
		makeTOC();
		H = Math.min(Math.max(window.innerHeight-200,h*15),h*50);

		var n = Math.round((H-h-40)/h);
		M = matrix(bl,sem,n);
		ll = M.T[M.T.length-1].x-2;
		calcSlider();
		var O = typeset(M.T,M.F,l,r,w,h);

		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
		calcCover()
		rewheel({deltaX:1,deltaY:1,preventDefault:_=>0})
		
	}
	reflow();
	document.body.onresize = reflow;

	function rewheel(e){
		l += e.deltaX;
		r += e.deltaX;
		l -= e.deltaY;
		r -= e.deltaY;
		r = Math.max(Math.min(0,r),ll*w+window.innerWidth);
		l = r-window.innerWidth;

		calcSlider();
		var O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
		calcCover();
		e.preventDefault();
	}

	document.getElementById("render").addEventListener('wheel', rewheel)

	var touchX;
    document.getElementById("render").addEventListener('touchstart', function(e){
        touchX = e.changedTouches[0].clientX
        e.preventDefault()
    }, false)
    document.getElementById("render").addEventListener('touchmove', function(e){
       var dist = parseInt(e.changedTouches[0].clientX) - touchX;
       setR(r-dist);
       // e.preventDefault();
    }, false)
    document.getElementById("render").addEventListener('touchend', function(e){
        e.preventDefault()
    }, false)

    document.getElementById("toc").addEventListener('touchstart', function(e){
        touchX = e.changedTouches[0].clientX
    }, false)
    document.getElementById("toc").addEventListener('touchmove', function(e){
       var dist = parseInt(e.changedTouches[0].clientX) - touchX;
       rewheelTOC({deltaX:-dist,deltaY:0,preventDefault:_=>0})
       // e.preventDefault();
    }, false)
    document.getElementById("toc").addEventListener('touchend', function(e){
    }, false)

	function makeTOC(){
		document.getElementById("toc-inner").innerHTML = "";
		for (var i = 0; i < fnames.length; i++){
			var ti = document.createElement("div");
			ti.classList.add("tocitem")
			ti.style.left = (document.getElementById("toc").offsetWidth-180-i*180)+"px";
			var t = fnames[i].split(" ")[1].split(".")[0].split("").reverse().join("");
			if (t.length > 4){
				t = t.replace("第","")
			}
			ti.innerHTML = `<div style="position:absolute;left:12px;top:9px">${t}</div><div style="position:absolute;right:10px;top:5px;">`+ICONS.CHAPTERS[i]+"</div>";
			;;(function(){
				var _i = i;
				ti.onclick = function(){
					setR(M.A[_i]*w-w/2);
				}
			})();
			document.getElementById("toc-inner").appendChild(ti)
		}
	}
	makeTOC();

	function rewheelTOC(e){
		var tir = document.getElementById("toc-inner").offsetLeft;
		tir -= e.deltaX;
		tir += e.deltaY;
		
		if (tir < 0){
			tir = 0;
		}
		if (tir > fnames.length*180-document.getElementById("toc").offsetWidth+10){
			tir = fnames.length*180-document.getElementById("toc").offsetWidth+10
		}
		document.getElementById("toc-inner").style.left = tir+"px";
		e.preventDefault();
	}

	document.getElementById("toc").addEventListener('wheel', rewheelTOC)

	window.addEventListener('message', (e) => {window.currentCode=e.data.value.code})

}
var tw = 40;
var html = `
<!--GENERATED FILE DO NOT EDIT-->
<head>
  <meta charset="UTF-8">
  <meta name="description" content="An Introduction to Programming in Wenyan Language">
  <title>wenyan-book</title>
</head>
<script src="https://code.iconify.design/1/1.0.4/iconify.min.js"></script>
<style id="style">
@font-face {
	font-family: QIJI;
	font-display: swap;
	src: url('https://cdn.jsdelivr.net/gh/wenyan-lang/book@3899aad7a917d0f000716ca97fe29221fe4b56d6/assets/font.woff2') format('woff2'), url('https://cdn.jsdelivr.net/gh/wenyan-lang/book@3899aad7a917d0f000716ca97fe29221fe4b56d6/assets/font.ttf') format('truetype');
}
:root{
	background:white;
	overflow:hidden;
}
body{
	margin:0px;
	background:#EFEFEF;
	overflow: hidden;
	overscroll-behavior-x: none; /* fix worst feature on Chrome */
	overflow:hidden;
}
#body{ /* mobile safari ugh! */
	width:100%;
	overflow:hidden;
	overflow-x:hidden;
	overflow-y:hidden;
}
.text{
	position:absolute;
	color: ${BLACK};
	font-family: QIJI;
	line-height: 45px;
	/* border-left: 1px solid ${RED}; */
}
.punc{
	position:absolute;
	font-family: QIJI;
	z-index: 200;
}
.ql{
	position:absolute;
	border-top: 1.5px solid ${RED};
	border-right: 1.5px solid ${RED};
	transform: translate(-2px,5px);
	color:rgba(0,0,0,0);
}
.qr{
	position:absolute;
	border-bottom: 1.5px solid ${RED};
	border-left: 1.5px solid ${RED};
	transform: translate(2px,4.5px);
	color:rgba(0,0,0,0);
}
.box{
	position:absolute;
	border:1px solid black;
	transform: translate(-4px,5px);
	pointer-events:none;
}
.popbtn{
	position:absolute;
	transform: translate(0px,7px);
	z-index:1000;
	color:rgba(0,0,0,0.3);
	cursor:pointer;
}
.popbtn:hover{
	color:rgba(0,0,0,0.5);
}
.rail{
	position:absolute;
	border-left:1px solid rgba(0,0,0,0.1);
	border-top:1px solid rgba(0,0,0,0.1);
	border-bottom:1px solid rgba(0,0,0,0.1);
	pointer-events:none;
	transform: translate(-4px,5px);
}
.railf{
	position:absolute;
	border:1px solid rgba(0,0,0,0.1);
	pointer-events:none;
	transform: translate(-4px,5px);	
}

#render{
	position:absolute;
	top:180px;
	left:0px;
	height:calc(100% - 200px);
	width:100%;
	border-top: 1px solid lightgrey;
	border-bottom: 1px solid lightgrey;
	overflow:hidden;
}
#slider{
	position:absolute;
	background: #BBB;
	height:20px;
	top:calc(100% - 18px);
	cursor:ew-resize;
}
#editor-wrap{
	position:absolute;
	width: 320px;
	height: 160px;
	top: 10px;
	z-index: 20000;
	border-radius: 2px;
	border: 1px solid grey;
	box-shadow: 2px 2px 2px rgba(0,0,0,0.1);
}
#editor{
	width:320px;
	height:100%;
}
.editor-btn{
	position:absolute;
	left:100%;
	background: whitesmoke;
	border: 1px solid grey;
	border-radius: 2px;
	width: 20px;
	height: 18px;
	transform: translate(5px, 0px);
	text-align:center;
	cursor: pointer;
	padding-top:2px;
	color:rgba(0,0,0,0.6);
}
.editor-btn:hover{
	color:rgba(0,0,0,1);
}
#editor-close{
	top:0px;
}
#editor-run{
	top:25px;
}
#editor-goto{
	top:50px;
}
#cover:after{
	content:"";
	position:absolute;
	left:0px;
	right:0px;
	top:0px;
	bottom:0px;
	/*background-image: url(bg.png);*/
	/*background-repeat: repeat;*/
	opacity:0.05;
	z-index: -1;
}
#bar{
	background:#EFEFEF;
}
#bar:hover{
	background:#E7E7E7;
}
#toc{
	position:absolute;
	right:0px;
	top:90px;
	width:100%;
	height:90px;
	overflow:hidden;
}
#toc-inner{
	position:absolute;
}
.tocitem{
	position:absolute;
	width:170px;
	height:50px;
	border-radius: 3px;
	border: 1px solid silver;
	color: silver;
	font-family:QIJI;
	font-size:32px;
	cursor:pointer;
	top:20px;
}
.tocitem-curr{
	color: dimgrey;
	border: 1px solid dimgrey;
}
.tocitem:hover{
	color:${BLUE};
	border: 1px solid ${BLUE};
	background: rgba(32,64,128,0.03);
}
#title{
	font-family: Helvetica, Arial, sans-serif;
	color: grey;
	width:400px;
	height:70px;
	position:absolute;
	right:20px;
	padding:10px;
	text-align:right;
	font-size:12px;
	top:5px;
}
h1{
	font-weight: normal;
	padding:0px;
	margin:0px;
	font-size:16px;
}
h2{
	font-weight: normal;
	padding:0px;
	margin:0px;
	font-style: italic;
	font-size:12px;
}
a:link{
	color:grey;
}
a:hover{
	color:black !important;
}
a:visited{
	color:grey;
}
a:active{
	color:black;
}
.text-btn{
	cursor:pointer;
}
.text-btn:hover{
	text-decoration:underline;
	color:black;
}
#help{
	font-family: Helvetica, Arial, sans-serif;
	font-size:14px;
	width:300px;
	height:300px;
	position:absolute;
	left:calc(50% - 180px);
	top:calc(50% - 180px);
	background: whitesmoke;
	border: 1px solid grey;
	box-shadow: 2px 2px 2px rgba(0,0,0,0.1);
	z-index: 10000;
	border-radius: 2px;
	padding: 30px;
}
#help>div{
	padding:3px;
}
</style>
<body><div id="body" style="position:absolute;left:0px;right:0px;top:0px;bottom:0px">

<div id="title">
<h1>wenyan-book / 文言陰符</h1>
<h2>An Introduction to Programming in Wenyan Language / 文言文編程入門</h2>
<a href="https://github.com/wenyan-lang/book/releases">pdf</a> | <a href="https://github.com/wenyan-lang/book">github</a> | <a href="https://wy-lang.org/">wenyan-lang</a> | <a href="https://github.com/wenyan-lang/wenyan/wiki">wiki</a> | <a href="https://lingdong.works/">lingdong</a>
<br>
<span class="text-btn" onclick="document.documentElement.style.filter=document.documentElement.style.filter.length?'':'invert(95%)';this.innerHTML={'[light]':'[dark]','[dark]':'[light]'}[this.innerHTML]">[dark]</span>
<span class="text-btn" onclick="document.getElementById('help').style.display={'block':'none','none':'block'}[document.getElementById('help').style.display];">[help]</span>
</div>
<div style="position:absolute;left:20px;top:15px;opacity:0.5">${fs.readFileSync("../assets/wy-logo.svg").toString().replace(/<g>[^]*?<\/g>/,"")}</div>
<div id="render"></div>
<div id="cover">
	<div style="position:absolute;left:72px;width:calc(100% - 144px);top:0px;height:100%;border-left:2px solid ${BLACK};border-right:2px solid ${BLACK}">
		${fs.readFileSync("../assets/title-alt.svg").toString().replace("<svg ",`<svg style="height:85%;width:100%;position:absolute;top:5%;"`)}
	</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*0}px">文</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*1}px">言</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*2}px">語</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*3}px">言</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*4}px">編</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*5}px">程</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*6}px">入</div>
	<div style="position:absolute; font-size:${tw}px; right:20px; top:${10+tw*7}px">門</div>


	<div style="position:absolute; font-size:28px; left:37px; top:calc(100% - 122px)">庚</div>
	<div style="position:absolute; font-size:28px; left:37px; top:calc(100% - 94px)">子</div>
	<div style="position:absolute; font-size:28px; left:37px; top:calc(100% - 66px)">年</div>
	<div style="position:absolute; font-size:28px; left:37px; top:calc(100% - 38px)">春</div>

	<div style="position:absolute; font-size:28px; left:7px; top:calc(100% - 122px)">黃</div>
	<div style="position:absolute; font-size:28px; left:7px; top:calc(100% - 94px)">令</div>
	<div style="position:absolute; font-size:28px; left:7px; top:calc(100% - 66px)">東</div>
	<div style="position:absolute; font-size:28px; left:7px; top:calc(100% - 38px)">編</div>

	${fs.readFileSync("../assets/exlibris.svg").toString().replace("<svg ",`<svg style="position:absolute;left:-9px;bottom:10px;height:80px;"`)}
</div>
<div id="slider"></div>
<div id="editor-wrap" style="left:-1000px;">
	<iframe frameBorder="0" src="https://ide.wy-lang.org/embed?autorun&code=注曰「「文言備矣」」" id="editor"></iframe>
	<div class="editor-btn" id="editor-close" onclick="document.getElementById('editor-wrap').style.left='-10000px'">${ICONS.CLOSE}</div>
	<div class="editor-btn" id="editor-run" onclick="document.getElementById('editor').contentWindow.postMessage({action:'run'},'*')">${ICONS.PLAY}</div>
	<div class="editor-btn" id="editor-goto" onclick="newwindow=window.open('http://ide.wy-lang.org/embed?autorun&show-bars&code='+encodeURI(window.currentCode),'','height=800,width=600,toolbar=no,menubar=no,location=no,addressbar=no,');if(window.focus){newwindow.focus()}">${ICONS.OPEN_IN_NEW}</div>
</div>

<div id="bar">

</div>
<div id="toc"><div id="toc-inner"></div></div>


<div id="help" style="display:none">
<div style="font-size:20px">Help</div>
<div style="color:dimgrey;">
You're viewing an online version of the book, <i>An Introduction to Programming in Wenyan Language</i>.
Wenyan is a programming language in Classical Chinese. Coincidentally, this book is also written in Classical Chinese.
</div><div>
How to navigate?
</div><div style="color:dimgrey;">
Scroll with scrollwheel or trackpad, or drag the scrollbar at the bottom.
To jump to a chapter, click on the tab bearing its title.
</div><div>
Slow with vertical text?
</div><div style="color:dimgrey;">
Read the <a href="https://github.com/wenyan-lang/book">markdowns</a> directly on Github, or download the <a href="https://github.com/wenyan-lang/book/releases">PDF</a>.
</div><div>
Don't know Classical Chinese?
</div><div style="color:dimgrey;">
Check out the <a href="https://github.com/wenyan-lang/wenyan/wiki">wenyan-wiki</a> (English).
<div class="editor-btn" id="editor-close" onclick="document.getElementById('help').style.display='none'">${ICONS.CLOSE}</div>
</div>

</div></body>
<script>
${constants}
var BLOCKS = ${JSON.stringify(BLOCKS)};
var CODEMETA = ${JSON.stringify(CODEMETA)};
var ICONS = ${JSON.stringify(ICONS)}
var fnames = ${JSON.stringify(fnames)}
var bl = ${JSON.stringify(bl)};
var sem = ${JSON.stringify(sem)}
var matrix = ${matrix.toString()};
var typeset = ${typeset.toString()};
(${main.toString()})();
</script>
`

fs.writeFileSync("../site/index.html",html)

fs.copyFileSync("../assets/font.ttf","../site/font.ttf")
fs.copyFileSync("../assets/font.woff2","../site/font.woff2")
