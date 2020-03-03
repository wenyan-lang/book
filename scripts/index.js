var constants = `
QL2 = "『"
QR2 = "』"
QL1 = "「"
QR1 = "」"

PRD = "。"
RED = "#BB705AEE";
BLACK = "#2B2B2B";
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
  iden: "#357",
  quot: BLACK,
  num: "#872",
  import: BLACK,
  try: BLACK,
  macro: RED,
};
`;

var ICONS = {//for iconify failures
	OPEN_IN_NEW:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="vertical-align: -0.125em;-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="iconify" data-icon="mdi:open-in-new"><path d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" fill="currentColor"></path></svg>`
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
				 .replace(/# /g,"#")
	if (i % 2 == 1){
		sem[i] = semantic(bl[i]);
	}else{
		sem[i] = [];
	}
}

function matrix(bl,sem,H){

	var T = [];
	var x = 0;
	var y = 0;
	var w = 1;
	var F = [];
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
	return {T,F};
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
					document.getElementById('editor').contentWindow.postMessage({action:'code',value:BLOCKS[_i].slice(1)},'*')
					document.getElementById('editor').contentWindow.postMessage({action:'run'},'*')
				})()
				`).replace(/\n/g,';')
				O += `<div class="box" style="top:${-2}px; left:${F[i][1]*w-l-10}px; width:${(F[i][0]-F[i][1])*w+20}px; height:${ymax+h+4}px; transform:;"></div>`
				O += `<div class="popbtn" onclick="${run}" style="top:${Math.round(ymax+h-18)}px; left:${Math.round(F[i][1]*w-l-10)}px; width:${20}px; height:${20}px;">${ICONS.OPEN_IN_NEW}</div>`
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
	    elmnt.style.right = (window.innerWidth-(elmnt.offsetLeft - pos1 + elmnt.offsetWidth)) + "px";
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
	function calcSlider(){
		var ww = window.innerWidth*(r-l)/(-M.T[M.T.length-1].x*w)
		S.style.width = ww+"px";
		S.style.right = (-window.innerWidth*r/(-M.T[M.T.length-1].x*w))+"px";
	}

	function review(){
		l = ((window.innerWidth-S.offsetLeft)/window.innerWidth)*M.T[M.T.length-1].x*w;
		r = ((window.innerWidth-(S.offsetLeft+S.offsetWidth))/window.innerWidth)*M.T[M.T.length-1].x*w;
		
		O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
	}

	function reflow(){
		var n = Math.round((window.innerHeight-200-h-40)/h);
		M = matrix(bl,sem,n);
		calcSlider();
		var O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
	}
	reflow();
	document.body.onresize = reflow;

	document.getElementById("render").addEventListener('wheel', (e)=> {
		l += e.deltaX;
		r += e.deltaX;
		l -= e.deltaY;
		r -= e.deltaY;

		calcSlider();
		var O = typeset(M.T,M.F,l,r,w,h);
		R.innerHTML = `<div style="position:absolute;top:20px;">${O}</div>`;
	})
}

var html = `
<!--GENERATED FILE DO NOT EDIT-->
<head>
	<meta charset="UTF-8">
</head>
<script src="https://code.iconify.design/1/1.0.4/iconify.min.js"></script>
<style id="style">
@font-face {
	font-family: QIJI;
	font-display: swap;
	src: url('font.woff2') format('woff2'), url('font.ttf') format('truetype');
}
body{
	background:#EFEFEF;
	overflow: hidden;
	overscroll-behavior-x: none; /* disable THE worst feature on chrome */
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
}
#slider{
	position:absolute;
	background: #BBB;
	border: 1px solid #AEAEAE;
	height:20px;
	top:calc(100% - 18px);
}
iframe{
	border-radius: 2px;
	border: 1px solid grey;
	box-shadow: 2px 2px 2px rgba(0,0,0,0.1);
}
</style>
<body>
<div id="render"></div>
<div id="slider"></div>
<iframe frameBorder="0" src="https://ide.wy-lang.org/embed?autorun&code=注曰「「文言備矣」」" id="editor"></iframe>
</body>
<script>
${constants}
var BLOCKS = ${JSON.stringify(BLOCKS)};
var ICONS = ${JSON.stringify(ICONS)}
var bl = ${JSON.stringify(bl)};
var sem = ${JSON.stringify(sem)}
var matrix = ${matrix.toString()};
var typeset = ${typeset.toString()};
(${main.toString()})();
</script>
`

fs.writeFileSync("../site/index.html",html)