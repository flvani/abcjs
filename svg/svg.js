/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SVG)
    window.SVG= {};

SVG = function (d, x, y) {
    this.topDiv = d;
    this.svg_pages = [];
    this.currentPage = 0;
    this.abc_glyphs = new ABCXJS.write.Glyphs();
};

SVG.prototype.initPage = function(pageNumber, wid, hei, scl) {
    var head = '<div class="nobrk">\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '
                    +'xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" '
                    +'color="black" width="'+wid*scl+'px" height="'+hei*scl+'px">\n';
    this.scale = scl;
    this.currentPage = pageNumber;
    this.svg_pages[this.currentPage] = head;
    this.setDefs();
    if( this.scale && this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage] += '<g transform="scale( '+ this.scale +')">';
    }
};

SVG.prototype.setDefs = function () {
    this.def_use('clefs.G');
    this.def_use('clefs.F');
    this.def_use('clefs.C');
    this.def_use('clefs.tab');
    this.def_use('noteheads.quarter');
    this.def_use('noteheads.half');
    this.def_use('brace2');
    this.svg_pages[this.currentPage] += '<defs>'+SVG.defs+'</defs>\n';
};

SVG.prototype.beginGroup = function () {
    this.svg_pages[this.currentPage] += '<g class="e_301_1_">\n';  
};
SVG.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
};
SVG.prototype.printStem = function (x,dx, y1, y2) {
    
    if (y1>y2) { // correct path "handedness" for intersection with other elements
    var tmp = y2;
    y2 = y1;
    y1 = tmp;
  }
  
  this.path('m'+x+' '+y1+'v-'+(y2-y1)+'');
};

SVG.prototype.print_hq = function (x, y) {
  this.svg_pages[this.currentPage] +='<use x="'+x+'" y="'+y+'" xlink:href="#hq" />\n';
};

SVG.prototype.print_teste = function (x, y, s) {
  this.svg_pages[this.currentPage] +='<use x="'+x+'" y="'+y+'" xlink:href="#'+s+'" />\n';
};


SVG.prototype.endPage = function() {
    if( this.scale && this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage] += '</g>';
    }
    this.svg_pages[this.currentPage] += '</sgv></div>';
};

SVG.prototype.path = function(str) {
   this.svg_pages[this.currentPage] += '<path class="stroke"	d="'+str+'"/>\n';
};

SVG.prototype.text = function( x, y, str, clss, anch ) {
   anch = anch || 'start';
   this.svg_pages[this.currentPage] += '<text class="'+clss+'" x="'+x+'" y="'+y+'" text-anchor="'+anch+'">'+str+'</text>\n';
};


SVG.prototype.arc = function(startX, startY, endX, endY, radius1, radius2, angle) {
  var arcSVG = [radius1, radius2, angle, 0, 1, endX, endY].join(' ');
  return this.path('M'+startX+' '+startY + " a " + arcSVG);
};

SVG.prototype.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
  var startX = centerX+radius*Math.cos(startAngle*Math.PI/180); 
  var startY = centerY+radius*Math.sin(startAngle*Math.PI/180);
  var endX = centerX+radius*Math.cos(endAngle*Math.PI/180); 
  var endY = centerY+radius*Math.sin(endAngle*Math.PI/180);
  return this.arc(startX, startY, endX-startX, endY-startY, radius, radius, 0);
};




