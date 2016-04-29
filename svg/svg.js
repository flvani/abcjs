/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.SVG)
    window.SVG = {};

if (! window.SVG.Printer )
    window.SVG.Printer = {};

SVG.Printer = function (d, w, h) {
    this.topDiv = d;
    this.width = w;
    this.height = h;
    
    this.scale = 1;
    
    this.defines = "";
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    
    this.glyphs = new SVG.Glyphs();
    
    this.init();
};

SVG.Printer.prototype.init = function() {
    this.scale = 1.0;
    
    this.defines = "";
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    this.output = "";
};

SVG.Printer.prototype.initPage = function( pageNumber, wid, hei, scl) {
    var head = '<div class="nobrk">\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '
                    +'xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" '
                    +'color="black" width="'+wid*scl+'px" height="'+hei*scl+'px">\n';
    this.scale = scl || this.scale;
    this.currentPage = pageNumber;
    this.output = head;
    if( this.scale !== 1.0 ) {
        this.output += '<g transform="scale( '+ this.scale +')">';
    }
};

SVG.Printer.prototype.endPage = function() {
    if(this.defines.length > 0 ) {
        this.output += '<defs>'+this.defines+'</defs>\n';
    }
    this.output += this.svg_pages[this.currentPage];  
    if( this.scale && this.scale !== 1.0 ) {
        this.output += '</g>';
    }
    this.output += '</sgv></div>';
};

SVG.Printer.prototype.beginGroup = function () {
    this.svg_pages[this.currentPage] += '<g class="">\n';  
};

SVG.Printer.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {

    if (y1 > y2) { // correct path "handedness" for intersection with other elements
        var tmp = y2;
        y2 = y1;
        y1 = tmp;
    }

    this.path('m' + x + ' ' + y1 + 'v-' + (y2 - y1) + '');
};

SVG.Printer.prototype.printPath = function (atr) {
  console.log('ignoring');
  //var ret = this.paper.path().attr({path:pathString, fill:fill, stroke: stroke, 'stroke-width':strokeWidth, 'stroke-dasharray':strokeDashArray}).toBack();
  
};


SVG.Printer.prototype.setDefine = function (s) {
    var p =  this.glyphs.getDefinition(s);
    
    if(p.length === 0 ) return false;
  
    this.defines += p;
    
    return true;
};


SVG.Printer.prototype.printSymbol = function (x, y, s) {
    if (this.setDefine(s)) {
        this.svg_pages[this.currentPage] += '<use x="' + x + '" y="' + y + '" xlink:href="#' + s + '" />\n';
    } else {
        this.endPage();
        this.flush();
        console.log('Simbolo não definido: ' + s + '.');
        throw 'simobolo indefinido'
    }
};

SVG.Printer.prototype.print_hq = function (x, y) {
  this.printSymbol(x,y, 'hq');
};


SVG.Printer.prototype.flush = function() {
    this.topDiv.innerHTML = this.output;
};


SVG.Printer.prototype.path = function(str) {
   this.svg_pages[this.currentPage] += '<path class="stroke"	d="'+str+'"/>\n';
};

SVG.Printer.prototype.text = function( x, y, str, clss, anch ) {
   var t; 
   str = ""+str;
   if( str.length===0) return;
   
   t = str.split('\n');
   
   anch = anch || 'start';
   
   if(t.length < 2) {
       this.svg_pages[this.currentPage] += '<text class="'+clss+'" x="'+x+'" y="'+y+'" text-anchor="'+anch+'">'+t[0]+'</text>\n';
   } else {
       this.svg_pages[this.currentPage] += '<g transform="translate('+x+' '+y+')">\n';
       this.svg_pages[this.currentPage] += '<text class="'+clss+'"  text-anchor="'+anch+'" x="0" y="0">\n';
       for(var i = 0; i < t.length; i++ )
           this.svg_pages[this.currentPage] += '<tspan x="0" dy="1.2em" >'+t[i]+'</tspan>\n';
       this.svg_pages[this.currentPage] += '</text></g>\n';
   }
};

SVG.Printer.prototype.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
  var angle = 0;
  var startX = centerX+radius*Math.cos(startAngle*Math.PI/180); 
  var startY = centerY+radius*Math.sin(startAngle*Math.PI/180);
  var endX = centerX+radius*Math.cos(endAngle*Math.PI/180); 
  var endY = centerY+radius*Math.sin(endAngle*Math.PI/180);
  var arcSVG = [radius, radius, angle, 0, 1, endX-startX, endY-startY].join(' ');
  return this.arc(startX, startY, arcSVG);
};

SVG.Printer.prototype.arc = function(startX, startY, arcSVG) {
  return this.path('M'+startX+' '+startY + " a " + arcSVG);
};




