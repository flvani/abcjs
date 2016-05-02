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
    this.gid=0;
   
    this.defines = "";
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    
    this.glyphs = new SVG.Glyphs();
    
    this.init();
};

SVG.Printer.prototype.init = function() {
    this.scale = 1.0;
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    this.output = "";
    this.gid=0;
};

SVG.Printer.prototype.initPage = function( pageNumber, wid, hei, scl) {
    var stillo = '<style type="text/css">\n\
.stave { stroke:black; }\n\
.ledger { stroke:gray; fill:white; stroke-dasharray: 1 1; }\n\
</style>\n';
    var head = '<div width="auto" height="auto" class="nobrk">\n\
<svg id="master" xmlns="http://www.w3.org/2000/svg" version="1.1"\n\
xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" width="'+wid*scl+'px" height="'+hei*scl+'px">\n';
    
    this.scale = scl || this.scale;
    this.currentPage = pageNumber;
    this.svg_pages[this.currentPage] = '';  
    this.output = head;
    this.output += stillo;
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
    this.svg_pages[this.currentPage] += '<g id="g'+(++this.gid)+'">\n';  
};

SVG.Printer.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
};

SVG.Printer.prototype.printLine = function (x,y,dx,dy,stroke) {
    stroke = stroke || 'black';
    var pathString = ABCXJS.write.sprintf('<path stroke="%s" d="M %.2f %.2f L %.2f %.2f"/>\n', stroke, x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStaveLine = function (x1, x2, y, klass, debug) {
    
    klass = klass || 'stave';
    
    if( debug){ // debug
        klass='debug';
    }
    
    var pathString = ABCXJS.write.sprintf('<path class="%s" d="M%.2f %.2f H%.2f"/>\n', klass, x1, y, x2);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBeam = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    var pathString = ABCXJS.write.sprintf('<path d="M %.2f %.2f L %.2f %.2f L %.2f %.2f L %.2f %.2f z"/>\n',  x1, y1, x2, y2, x3, y3, x4, y4);
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
    
    var pathString = ABCXJS.write.sprintf('<path d="M %.2f %.2f C %.2f %.2f %.2f %.2f %.2f %.2f C %.2f %.2f %.2f %.2f %.2f %.2f z"/>\n', 
                            x1, y1,
                            controlx1, controly1, controlx2, controly2, x2, y2, 
                            controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1 );
    
    this.svg_pages[this.currentPage] += pathString;
};
    
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
    this.setDefine('scripts.lbrace');
    var pathString = ABCXJS.write.sprintf('<use x="0" y="0" xlink:href="#scripts.lbrace" transform="translate(%.2f %.2f) scale(0.13 %.5f)" />\n',
         x, y2, scale );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printSymbol = function (x, y, symbol) {
    if (this.setDefine(symbol)) {
        var pathString = ABCXJS.write.sprintf('<use x="%.2f" y="%.2f" xlink:href="#%s" />\n', x, y, symbol );
        this.svg_pages[this.currentPage] += pathString;
    } else {
        throw 'Undefined: ' + symbol;
    }
};

SVG.Printer.prototype.flush = function(lines) {
    this.topDiv.innerHTML = this.output;
    //fixme: mover isso para quem criou a impressora
//    setTimeout(function(){
        for(var l=0; l<lines.length;l++){
            for(var s=0; lines[l].staffs && s <lines[l].staffs.length;s++){
                for(var v=0; v <lines[l].staffs[s].voices.length;v++){
                    for(var a=0; a <lines[l].staffs[s].voices[v].length;a++){
                       var abs = lines[l].staffs[s].voices[v][a].abselem;
                       if( !abs || !abs.gid ) continue;
                       abs.setMouse(document.getElementById('g'+abs.gid));
                    }
                }
            }
        }
//    }, 300);
};


SVG.Printer.prototype.tabText = function( x, y, str, clss, anch ) {
   str = ""+str;
   if( str.length===0) return;
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<text class="'+clss+'" x="'+x+'" y="'+y+'" >'+str+'</text>\n';
};

SVG.Printer.prototype.text = function( x, y, str, clss, anch ) {
   var t; 
   str = ""+str;
   if( str.length===0) return;
   
   t = str.split('\n');
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
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
