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
                    +'color="black" width="'+wid*scl+'px" height="'+hei*scl*10+'px">\n';
    this.scale = scl || this.scale;
    this.currentPage = pageNumber;
    this.svg_pages[this.currentPage] = '';  
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

SVG.Printer.prototype.printLine = function (x,y,dx,dy,stroke) {
    stroke = stroke || 'black';
    var pathString = ABCXJS.write.sprintf('<path stroke="%s" d="M %.3f %.3f L %.3f %.3f"/>\n', stroke, x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStaveLine = function (x1, x2, y, klass, debug) {
    
    klass = klass || 'stave';
    
    if( debug){ // debug
        klass='debug';
    }
    
    var pathString = ABCXJS.write.sprintf('<path class="%s" d="M %.3f %.3f L %.3f %.3f"/>\n', klass, x1, y, x2, y);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect class="fill" x="%.3f" y="%.3f" width="%.3f" height="%.3f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBeam = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    var pathString = ABCXJS.write.sprintf('<path class="fill" d="M %.3f %.3f L %.3f %.3f L %.3f %.3f L %.3f %.3f z"/>\n',  x1, y1, x2, y2, x3, y3, x4, y4);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printTieArc = function (x1,y1,x2,y2,up) {
    
    //unit direction vector
    var dx = x2-x1;
    var dy = y2-y1;
    var norm= Math.sqrt(dx*dx+dy*dy);
    var ux = dx/norm;
    var uy = dy/norm;

    var flatten = norm/3.5;
    var curve = (up?-1:1)*Math.min(25, Math.max(4, flatten));

    var controlx1 = x1+flatten*ux-curve*uy;
    var controly1 = y1+flatten*uy+curve*ux;
    var controlx2 = x2-flatten*ux-curve*uy;
    var controly2 = y2-flatten*uy+curve*ux;
    var thickness = 2;
    
    var pathString = ABCXJS.write.sprintf('<path class="fill" d="M %.3f %.3f C %.3f %.3f %.3f %.3f %.3f %.3f C %.3f %.3f %.3f %.3f %.3f %.3f z"/>\n', 
                            x1, y1,
                            controlx1, controly1, controlx2, controly2, x2, y2, 
                            controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1 );
    
    this.svg_pages[this.currentPage] += pathString;
};

//SVG.Printer.prototype.addDefine = function (s) {
//};
    
SVG.Printer.prototype.setDefine = function (s) {
    var p =  this.glyphs.getDefinition(s);
    
    if(p.length === 0 ) return false;
    
    if(!this.defined_glyph[s]) {
        this.defines += p;
        this.defined_glyph[s] = true;
    }
    return true;
};

SVG.Printer.prototype.printBrace = function (x, y1, y2) {
    var sz = Math.abs(y1-y2); // altura esperada
    var rh = 1027; // altura real do simbolo
    var scale = sz/rh;
    this.printSymbol(x,y1,'bbrace', scale);
};

SVG.Printer.prototype.printSymbol = function (x, y, symbol, scale) {
    if (this.setDefine(symbol)) {
        var pathString = ABCXJS.write.sprintf('<svg x="100" y=1000"><use x="%.3f" y="%.3f" xlink:href="#%s" transform="scale(%.5f)"></use></svg>\n', 0, 0, symbol, scale );
        this.svg_pages[this.currentPage] += pathString;
    } else {
        this.endPage();
        this.flush();
        console.log('Simbolo não definido: ' + s + '.');
        throw 'simobolo indefinido';
    }
};

SVG.Printer.prototype.print_hq = function (x, y) {
  this.printSymbol(x,y, 'hq');
};


SVG.Printer.prototype.flush = function() {
    this.topDiv.innerHTML = this.output;
};


SVG.Printer.prototype.path = function(str) {
   this.svg_pages[this.currentPage] += '<path class="stroke" d="'+str+'"/>\n';
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




