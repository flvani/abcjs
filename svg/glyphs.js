/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SVG)
    window.SVG= {};

SVG.defined_glyph = [];
SVG.defs = "";

SVG.glyphs = {
  "clefs.G": '<path id="clefsG" class="fill" transform="scale(0.4)"\nd="@@"/>',
  "noteheads.quarter": '<path id="hq" transform="scale(0.7)" class="fill" \nd="@@"/>',
  "noteheads.half": '<path id="hh" class="fill" \nd="@@"/>',
  "noteheads.whole": '<path id="hw" class="fill" \nd="@@"/>',
  "notehesad.dbl": '<g id="hd">\n\
	<use xlink:href="#dw"/>\n\
	<path d="m-6 -4v8m12 0v-8" class="stroke"/>\n\
        </g>',
  bbrace: '<path id="bbrace" class="fill"\n\
  	d="M-20 -515v-2\n\
	c35 -16 53 -48 53 -91\n\
	c0 -34 -11 -84 -35 -150\n\
	c-13 -41 -18 -76 -18 -109\n\
	c0 -69 29 -121 87 -160\n\
	c-44 35 -63 77 -63 125\n\
	c0 26 8 56 21 91\n\
	c27 71 37 130 37 174\n\
	c0 62 -26 105 -77 121\n\
	c52 16 77 63 77 126\n\
	c0 46 -10 102 -37 172\n\
	c-13 35 -21 68 -21 94\n\
	c0 48 19 89 63 124\n\
	c-58 -39 -87 -91 -87 -160\n\
	c0 -33 5 -68 18 -109\n\
	c24 -66 35 -116 35 -150\n\
	c0 -44 -18 -80 -53 -96z"/>',
    brace: '<use id="brace" class="fill" transform="scale(0.0235)"\n\\n\
            xlink:href="#bbrace"/>',    
    brace2: '<use id="brace2" class="fill" transform="scale(0.05)"\n\\n\
            xlink:href="#bbrace"/>',    
  "clefs.G.old": '<path id="utclef" class="fill" transform="scale(0.045)"\n\
	d="m-50 44\n\
	c-72 -41 -72 -158 52 -188\n\
	150 -10 220 188 90 256\n\
	-114 52 -275 0 -293 -136\n\
	-15 -181 93 -229 220 -334\n\
	88 -87 79 -133 62 -210\n\
	-51 33 -94 105 -89 186\n\
	17 267 36 374 49 574\n\
	6 96 -19 134 -77 135\n\
	-80 1 -126 -93 -61 -133\n\
	85 -41 133 101 31 105\n\
	23 17 92 37 90 -92\n\
	-10 -223 -39 -342 -50 -617\n\
	0 -90 0 -162 96 -232\n\
	56 72 63 230 22 289\n\
	-74 106 -257 168 -255 316\n\
	9 153 148 185 252 133\n\
	86 -65 29 -192 -80 -176\n\
	-71 12 -105 67 -59 124"/>',
  tclef: '<use id="tclef" xlink:href="#utclef"/>',
  stclef: '<use id="stclef" transform="scale(0.8)"\n\
	xlink:href="#utclef"/>',
  "clefs.F": '<path id="ubclef" class="fill" transform="scale(0.045)"\n\
	d="m-200 312\n\
	c124 -35 222 -78 254 -236\n\
	43 -228 -167 -246 -192 -103\n\
	59 -80 157 22 92 78\n\
	-62 47 -115 -22 -106 -88\n\
	21 -141 270 -136 274 52\n\
	-1 175 -106 264 -322 297\n\
	m357 -250\n\
	c0 -36 51 -34 51 0\n\
	0 37 -51 36 -51 0\n\
	m-2 -129\n\
	c0 -36 51 -34 51 0\n\
	0 38 -51 37 -51 0"/>',
  bclef: '<use id="bclef" xlink:href="#ubclef"/>',
  sbclef: '<use id="sbclef" transform="scale(0.8)"\n\
	xlink:href="#ubclef"/>',
  "clefs.C": '<path id="ucclef" class="fill" transform="scale(0.045)"\n\
	d="m-51 3\n\
	v262\n\
	h-13\n\
	v-529\n\
	h13\n\
	v256\n\
	c25 -20 41 -36 63 -109\n\
	14 31 13 51 56 70\n\
	90 34 96 -266 -41 -185\n\
	52 19 27 80 -11 77\n\
	-90 -38 33 -176 139 -69\n\
	72 79 1 241 -134 186\n\
	l-16 39 16 38\n\
	c135 -55 206 107 134 186\n\
	-106 108 -229 -31 -139 -69\n\
	38 -3 63 58 11 77\n\
	137 81 131 -219 41 -185\n\
	-43 19 -45 30 -56 64\n\
	-22 -73 -38 -89 -63 -109\n\
	m-99 -267\n\
	h57\n\
	v529\n\
	h-57\n\
	v-529"/>',
  cclef: '<use id="cclef" xlink:href="#ucclef"/>',
  scclef: '<use id="scclef" transform="scale(0.8)"\n\
	xlink:href="#ucclef"/>',
  pclef: '<path id="pclef" class="stroke" style="stroke-width:1.4"\n\
	d="m-4 10h5.4v-20h-5.4v20"/>',
  breve: '<g id="breve" class="stroke">\n\
	<path d="m-6 -2.7h12m0 5.4h-12" style="stroke-width:2.5"/>\n\
	<path d="m-6 -5v10m12 0v-10"/>\n\
        </g>',
  longa: '<g id="longa" class="stroke">\n\
	<path d="m-6 2.7h12m0 -5.4h-12" style="stroke-width:2.5"/>\n\
	<path d="m-6 5v-10m12 0v16"/>\n\
        </g>',
  ghd: '<use id="ghd" transform="translate(4.5,0) scale(0.5)" xlink:href="#hd"/>',
  r00: '<rect id="r00" class="fill"\n\
	x="-1.6" y="-6" width="3" height="12"/>',
  r0: '<rect id="r0" class="fill"\n\
	x="-1.6" y="-6" width="3" height="6"/>',
  r1: '<rect id="r1" class="fill"\n\
	x="-3.5" y="-6" width="7" height="3"/>',
  r2: '<rect id="r2" class="fill"\n\
	x="-3.5" y="-3" width="7" height="3"/>',
  r4: '<path id="r4" class="fill" d="m-1 -8.5\n\
	l3.6 5.1 -2.1 5.2 2.2 4.3\n\
	c-2.6 -2.3 -5.1 0 -2.4 2.6\n\
	-4.8 -3 -1.5 -6.9 1.4 -4.1\n\
	l-3.1 -4.5 1.9 -5.1 -1.5 -3.5"/>',
  r8e: '<path id="r8e" class="fill" d="m 0 0\n\
	c-1.5 1.5 -2.4 2 -3.6 2\n\
	2.4 -2.8 -2.8 -4 -2.8 -1.2\n\
	0 2.7 4.3 2.4 5.9 0.6"/>',
  r8: '<g id="r8">\n\
	<path d="m3.3 -4l-3.4 9.6" class="stroke"/>\n\
	<use x="3.4" y="-4" xlink:href="#r8e"/>\n\
        </g>',
  r16: '<g id="r16">\n\
	<path d="m3.3 -4l-4 15.6" class="stroke"/>\n\
	<use x="3.4" y="-4" xlink:href="#r8e"/>\n\
	<use x="1.9" y="2" xlink:href="#r8e"/>\n\
        </g>',
  r32: '<g id="r32">\n\
	<path d="m4.8 -10l-5.5 21.6" class="stroke"/>\n\
	<use x="4.9" y="-10" xlink:href="#r8e"/>\n\
	<use x="3.4" y="-4" xlink:href="#r8e"/>\n\
	<use x="1.9" y="2" xlink:href="#r8e"/>\n\
        </g>',
  r64: '<g id="r64">\n\
	<path d="m4.8 -10 l-7 27.6" class="stroke"/>\n\
	<use x="4.9" y="-10" xlink:href="#r8e"/>\n\
	<use x="3.4" y="-4" xlink:href="#r8e"/>\n\
	<use x="1.9" y="2" xlink:href="#r8e"/>\n\
	<use x="0.4" y="8" xlink:href="#r8e"/>\n\
        </g>',
  r128: '<g id="r128">\n\
	<path d="m5.8 -16 l-8.5 33.6" class="stroke"/>\n\
	<use x="5.9" y="-16" xlink:href="#r8e"/>\n\
	<use x="4.4" y="-10" xlink:href="#r8e"/>\n\
	<use x="2.9" y="-4" xlink:href="#r8e"/>\n\
	<use x="1.4" y="2" xlink:href="#r8e"/>\n\
	<use x="0.1" y="8" xlink:href="#r8e"/>\n\
        </g>',
  mrest: '<g id="mrest" class="stroke">\n\
	<path d="m-10 6v-12m20 0v12"/>\n\
	<path d="m-10 0h20" style="stroke-width:5"/>\n\
        </g>',
  usharp: '<path id="usharp" class="fill" d="m136 -702\n\
	v890\n\
	h32\n\
	v-890\n\
	m128 840\n\
	h32\n\
	v-888\n\
	h-32\n\
	m-232 286\n\
	v116\n\
	l338 -96\n\
	v-116\n\
	m-338 442\n\
	v116\n\
	l338 -98\n\
	v-114"/>',
  uflat: '<path id="uflat" class="fill" d="m100 -746\n\
	h32\n\
	v734\n\
	l-32 4\n\
	m32 -332\n\
	c46 -72 152 -90 208 -20\n\
	100 110 -120 326 -208 348\n\
	m0 -28\n\
	c54 0 200 -206 130 -290\n\
	-50 -60 -130 -4 -130 34"/>',
  unat: '<path id="unat" class="fill" d="m96 -750\n\
	h-32\n\
	v716\n\
	l32 -8\n\
	l182 -54\n\
	v282\n\
	h32\n\
	v-706\n\
	l-34 10\n\
	l-180 50\n\
	v-290\n\
	m0 592\n\
	v-190\n\
	l182 -52\n\
	v188"/>',
  udblesharp: '<path id="udblesharp" class="fill" d="m240 -282\n\
	c40 -38 74 -68 158 -68\n\
	v-96\n\
	h-96\n\
	c0 84 -30 118 -68 156\n\
	-40 -38 -70 -72 -70 -156\n\
	h-96\n\
	v96\n\
	c86 0 120 30 158 68\n\
	-38 38 -72 68 -158 68\n\
	v96\n\
	h96\n\
	c0 -84 30 -118 70 -156\n\
	38 38 68 72 68 156\n\
	h96\n\
	v-96\n\
	c-84 0 -118 -30 -158 -68"/>',
  udbleflat: '<path id="udbleflat" class="fill" d="m20 -746\n\
	h24\n\
	v734\n\
	l-24 4\n\
	m24 -332\n\
	c34 -72 114 -90 156 -20\n\
	75 110 -98 326 -156 348\n\
	m0 -28\n\
	c40 0 150 -206 97 -290\n\
	-37 -60 -97 -4 -97 34\n\
	m226 -450\n\
	h24\n\
	v734\n\
	l-24 4\n\
	m24 -332\n\
	c34 -72 114 -90 156 -20\n\
	75 110 -98 326 -156 348\n\
	m0 -28\n\
	c40 0 150 -206 97 -290\n\
	-37 -60 -97 -4 -97 34"/>',
  acc1: '<use id="acc1" transform="translate(-4,5) scale(0.018)" xlink:href="#usharp"/>',
 "acc-1": '<use id="acc-1" transform="translate(-3.5,3.5) scale(0.018)" xlink:href="#uflat"/>',
  acc3: '<use id="acc3" transform="translate(-3,5) scale(0.018)" xlink:href="#unat"/>',
  acc2: '<use id="acc2" transform="translate(-4,5) scale(0.018)"\n\
	xlink:href="#udblesharp"/>',
 "acc-2": '<use id="acc-2" transform="translate(-4,3.5) scale(0.018)"\n\
	xlink:href="#udbleflat"/>',
  acc1_1_4: '<g id="acc1_1_4">\n\
	<path d="m0 7.8v-15.4" class="stroke"/>\n\
	<path class="fill" d="M-1.8 2.7l3.6 -1.1v2.2l-3.6 1.1v-2.2z\n\
		M-1.8 -3.7l3.6 -1.1v2.2l-3.6 1.1v-2.2"/>\n\
</g>',
  acc1_3_4: '<g id="acc1_3_4">\n\
	<path d="m-2.5 8.7v-15.4M0 7.8v-15.4M2.5 6.9v-15.4" class="stroke"/>\n\
	<path class="fill" d="m-3.7 3.1l7.4 -2.2v2.2l-7.4 2.2v-2.2z\n\
		M-3.7 -3.2l7.4 -2.2v2.2l-7.4 2.2v-2.2"/>\n\
</g>',
 "acc-1_1_4": '<g id="acc-1_1_4" transform="scale(-1,1)">\n\
	<use xlink:href="#acc-1"/>\n\
</g>',
 "acc-1_3_4": '<g id="acc-1_3_4">\n\
    <path class="fill" d="m0.6 -2.7\n\
	c-5.7 -3.1 -5.7 3.6 0 6.7c-3.9 -4 -4 -7.6 0 -5.8\n\
	M1 -2.7c5.7 -3.1 5.7 3.6 0 6.7c3.9 -4 4 -7.6 0 -5.8"/>\n\
    <path d="m1.6 3.5v-13M0 3.5v-13" class="stroke" style="stroke-width:.6"/>\n\
</g>',
  pshhd: '<use id="pshhd" xlink:href="#acc2"/>',
  pfthd: '<g id="pfthd">\n\
	<use xlink:href="#acc2"/>\n\
	<circle r="4" class="stroke"/>\n\
</g>',
  csig: '<path id="csig" class="fill" transform="scale(0.0235, 0.0235)"\n\
	d="M303 -161\n\
	c8 1 12 2 18 3\n\
	c3 -4 4 -9 4 -13\n\
	c0 -28 -52 -54 -91 -54\n\
	c-61 2 -115 58 -115 210\n\
	c0 76 7 151 39 193\n\
	c23 29 49 42 81 42\n\
	c26 0 55 -10 83 -34\n\
	s47 -64 70 -112\n\
	c0 3 18 6 17 9\n\
	c-33 103 -76 164 -198 166\n\
	c-50 0 -100 -20 -138 -57\n\
	c-39 -38 -60 -91 -63 -159\n\
	c0 -4 -1 -43 -1 -47\n\
	c0 -168 88 -231 219 -232\n\
	c52 0 97 27 117 50\n\
	s34 49 34 75\n\
	c0 47 -25 94 -64 94\n\
	c-45 0 -73 -39 -73 -74\n\
	c2 -26 23 -60 60 -60h1z"/>',
  ctsig: '<g id="ctsig">\n\
	<use xlink:href="#csig"/>\n\
	<path d="m5 8v-16" class="stroke"/>\n\
</g>',
  pmsig: '<path id="pmsig" class="stroke" style="stroke-width:0.8"\n\
	d="m0 -7a5 5 0 0 1 0 -10a5 5 0 0 1 0 10"/>',
  pMsig: '<g id="pMsig">\n\
	<use xlink:href="#pmsig"/>\n\
	<path class="fill" d="m0 -10a2 2 0 0 1 0 -4a2 2 0 0 1 0 4"/>\n\
</g>',
  imsig: '<path id="imsig" class="stroke" style="stroke-width:0.8"\n\
	d="m0 -7a5 5 0 1 1 0 -10"/>',
  iMsig: '<g id="iMsig">\n\
	<use xlink:href="#imsig"/>\n\
	<path class="fill" d="m0 -10a2 2 0 0 1 0 -4a2 2 0 0 1 0 4"/>\n\
</g>',
  hl: '<path id="hl" class="stroke" d="m-6 0h12"/>',
  hl1: '<path id="hl1" class="stroke" d="m-7 0h14"/>',
  hl2: '<path id="hl2" class="stroke" d="m-9 0h18"/>',
  ghl: '<path id="ghl" class="stroke" d="m-3 0h6"/>',
  rdots: '<g id="rdots" class="fill">\n\
	<circle cx="0" cy="-9" r="1.2"/>\n\
	<circle cx="0" cy="-15" r="1.2"/>\n\
</g>',
  srep: '<path id="srep" class="fill" d="m-1 -6l11 -12h3l-11 12h-3"/>',
  mrep: '<path id="mrep" class="fill"\n\
    d="m-5 -16.5a1.5 1.5 0 0 1 0 3a1.5 1.5 0 0 1 0 -3\n\
	M4.5 -10a1.5 1.5 0 0 1 0 3a1.5 1.5 0 0 1 0 -3\n\
	M-7 -6l11 -12h3l-11 12h-3"/>',
  mrep2: '<g id="mrep2">\n\
    <path d="m-5.5 -19.5a1.5 1.5 0 0 1 0 3a1.5 1.5 0 0 1 0 -3\n\
	M5 -7.5a1.5 1.5 0 0 1 0 3a1.5 1.5 0 0 1 0 -3" class="fill"/>\n\
    <path d="m-7 -4l14 -10m-14 4l14 -10" class="stroke" style="stroke-width:1.8"/>\n\
</g>',
  accent: '<g id="accent" class="stroke">\n\
	<path d="m-4 0l8 -2l-8 -2" style="stroke-width:1.2"/>\n\
</g>',
  marcato: '<path id="marcato" d="m-3 0l3 -7l3 7l-1.5 0l-1.8 -4.2l-1.7 4.2"/>',
  umrd: '<path id="umrd" class="fill" d="m0 -4\n\
	l2.2 -2.2 2.1 2.9 0.7 -0.7 0.2 0.2\n\
	-2.2 2.2 -2.1 -2.9 -0.7 0.7\n\
	-2.2 2.2 -2.1 -2.9 -0.7 0.7 -0.2 -0.2\n\
	2.2 -2.2 2.1 2.9 0.7 -0.7"/>',
  lmrd: '<g id="lmrd">\n\
	<use xlink:href="#umrd"/>\n\
	<line x1="0" y1="0" x2="0" y2="-8" class="stroke" style="stroke-width:.6"/>\n\
</g>',
  grm: '<path id="grm" class="fill" d="m-5 -2.5\n\
	c5 -8.5 5.5 4.5 10 -2\n\
	-5 8.5 -5.5 -4.5 -10 2"/>',
  stc: '<circle id="stc" class="fill" cx="0" cy="-3" r="1.2"/>',
  sld: '<path id="sld" class="fill" d="m-7.2 4.8\n\
	c1.8 0.7 4.5 -0.2 7.2 -4.8\n\
	-2.1 5 -5.4 6.8 -7.6 6"/>',
  emb: '<path id="emb" d="m-2.5 -3h5" style="stroke-width:1.2; stroke-linecap:round" class="stroke"/>',
  hld: '<g id="hld" class="fill">\n\
    <circle cx="0" cy="-3" r="1.3"/>\n\
    <path d="m-7.5 -1.5\n\
	c0 -11.5 15 -11.5 15 0\n\
	h-0.25\n\
	c-1.25 -9 -13.25 -9 -14.5 0"/>\n\
</g>',
  brth: '<text id="brth" y="-6" style="font:bold italic 30px serif">,</text>',
  cpu: '<path id="cpu" class="fill" d="m-6 0\n\
	c0.4 -7.3 11.3 -7.3 11.7 0\n\
	-1.3 -6 -10.4 -6 -11.7 0"/>',
  upb: '<path id="upb" class="stroke" d="m-2.6 -9.4\n\
	l2.6 8.8\n\
	l2.6 -8.8"/>',
  dnb: '<g id="dnb">\n\
	<path d="M-3.2 -2v-7.2m6.4 0v7.2" class="stroke"/>\n\
	<path d="M-3.2 -6.8v-2.4l6.4 0v2.4" class="fill"/>\n\
</g>',
  sgno: '<g id="sgno">\n\
    <path class="fill" d="m0 -3\n\
	c1.5 1.7 6.4 -0.3 3 -3.7\n\
	-10.4 -7.8 -8 -10.6 -6.5 -11.9\n\
	4 -1.9 5.9 1.7 4.2 2.6\n\
	-1.3 0.7 -2.9 -1.3 -0.7 -2\n\
	-1.5 -1.7 -6.4 0.3 -3 3.7\n\
	10.4 7.8 8 10.6 6.5 11.9\n\
	-4 1.9 -5.9 -1.7 -4.2 -2.6\n\
	1.3 -0.7 2.9 1.3 0.7 2"/>\n\
    <line x1="-6" y1="-4.2" x2="6.6" y2="-16.8" class="stroke"/>\n\
    <circle cx="-6" cy="-10" r="1.2"/>\n\
    <circle cx="6" cy="-11" r="1.2"/>\n\
</g>',
  coda: '<g id="coda" class="stroke">\n\
	<path d="m0 -2v-20m-10 10h20"/>\n\
	<circle cx="0" cy="-12" r="6" style="stroke-width:1.7"/>\n\
</g>',
  dplus: '<path id="dplus" class="stroke" style="stroke-width:1.7"\n\
	d="m0 -0.5v-6m-3 3h6"/>',
  lphr: '<path id="lphr" class="stroke" style="stroke-width:1.2"\n\
	d="m0 0v18"/>',
  mphr: '<path id="mphr" class="stroke" style="stroke-width:1.2"\n\
	d="m0 0v12"/>',
  sphr: '<path id="sphr" class="stroke" style="stroke-width:1.2"\n\
	d="m0 0v6"/>',
  sfz: '<text id="sfz" x="-5" y="-7" style="font:italic 14px serif">\n\
	s<tspan font-size="16" font-weight="bold">f</tspan>z</text>',
  trl: '<text id="trl" x="-2" y="-4"\n\
	style="font:bold italic 16px serif">tr</text>',
  opend: '<circle id="opend" class="stroke"\n\
	cx="0" cy="-3" r="2.5"/>',
  snap: '<path id="snap" class="stroke" d="m-3 -6\n\
	c0 -5 6 -5 6 0\n\
	0 5 -6 5 -6 0\n\
	M0 -5v6"/>',
  thumb: '<path id="thumb" class="stroke" d="m-2.5 -7\n\
	c0 -6 5 -6 5 0\n\
	0 6 -5 6 -5 0\n\
	M-2.5 -9v4"/>',
  turn: '<path id="turn" class="fill" d="m5.2 -8\n\
	c1.4 0.5 0.9 4.8 -2.2 2.8\n\
	l-4.8 -3.5\n\
	c-3 -2 -5.8 1.8 -3.6 4.4\n\
	1 1.1 2 0.8 2.1 -0.1\n\
	0.1 -0.9 -0.7 -1.2 -1.9 -0.6\n\
	-1.4 -0.5 -0.9 -4.8 2.2 -2.8\n\
	l4.8 3.5\n\
	c3 2 5.8 -1.8 3.6 -4.4\n\
	-1 -1.1 -2 -0.8 -2.1 0.1\n\
	-0.1 0.9 0.7 1.2 1.9 0.6"/>',
  turnx: '<g id="turnx">\n\
	<use xlink:href="#turn"/>\n\
	<path d="m0 -1.5v-9" class="stroke"/>\n\
</g>',
  wedge: '<path id="wedge" class="fill" d="m0 -1l-1.5 -5h3l-1.5 5"/>',
  ltr: '<path id="ltr" class="fill"\n\
	d="m0 -0.4c2 -1.5 3.4 -1.9 3.9 0.4\n\
	c0.2 0.8 0.7 0.7 2.1 -0.4\n\
	v0.8c-2 1.5 -3.4 1.9 -3.9 -0.4\n\
	c-0.2 -0.8 -0.7 -0.7 -2.1 0.4z"/>',
  custos: '<g id="custos">\n\
	<path d="m-4 0l2 2.5 2 -2.5 2 2.5 2 -2.5\n\
		-2 -2.5 -2 2.5 -2 -2.5 -2 2.5" class="fill"/>\n\
	<path d="m3.5 0l5 -7" class="stroke"/>\n\
</g>',
  oct: '<text id="oct" style="font:12px serif">8</text>i'
};

// mark a glyph as used and add it in <defs>
// return generated by PS function or not
SVG.prototype.def_use = function (gl) {
	var	i, j, g;

	if (SVG.defined_glyph[gl])
		return;
	SVG.defined_glyph[gl] = true;
	g = SVG.glyphs[gl].replace('@@', this.abc_glyphs.getTextSymbol(gl));
	if (!g) {
                throw new Error("unknown glyph: " + gl);
		//error(1, null, "unknown glyph: " + gl)
		//return;	// fixme: the xlink is set
	}
	j = 0;
	while (1) {
		i = g.indexOf('xlink:href="#', j);
		if (i < 0)
			break
		i += 13;
		j = g.indexOf('"', i);
		this.def_use(g.slice(i, j));
	}
	SVG.defs += '\n' + g;
};

// add user defs from %%beginsvg
SVG.prototype.defs_add = function (text) {
	var	i, j, gl, tag, is, ie = 0;

	while (1) {
		is = text.indexOf('<', ie);
		if (is < 0)
			break
		if (text.slice(is, is + 4) === "<!--") {
			ie = text.indexOf('-->', is + 4);
			if (ie < 0)
				break
			continue
		}
		i = text.indexOf('id="', is);
		if (i < 0)
			break
		i += 4;
		j = text.indexOf('"', i);
		if (j < 0)
			break
		gl = text.slice(i, j);
		ie = text.indexOf('>', j);
		if (ie < 0)
			break
		if (text[ie - 1] === '/') {
			ie++;
		} else {
			i = text.indexOf(' ', is);
			if (i < 0)
				break
			tag = text.slice(is + 1, i);
			ie = text.indexOf('</' + tag + '>', ie);
			if (ie < 0)
				break;
			ie += 3 + tag.length;
		}
		SVG.glyphs[gl] = text.slice(is, ie);
	}
};
