/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
    Created on : 27/04/2016, 10:55:16
    Author     : flavio.vani@gmail.com
*/

/*

Main document structure:

<div style"..." >

    Header:
     Contains a title, the style definitions for the entire document and the defined symbols.
    <svg id="tune" ... >
        <title>Música criada por ABCXJS.</title><style type="text/css">
        <style type="text/css">
            @media print {
                div.nobrk {page-break-inside: avoid} 
                div.newpage {page-break-before: always} 
            }    
        </style>
        <defs>
        </defs>
    </svg>

    Page1:
      Class nobrk, an optional group to control aspects like scaling and the content of the page 
    <div class="nobrk" >
        <svg id="page1"  ... >
            <g id="gpage1" ... ></g>
        </svg>
    </div>

    Page2 and subsequents:
      Class newpage, an optional group to control aspects like scaling and the content of the page 
    <div class="newpage" >
        <svg id="page2"  ...>
            <g id="gpage2" ... ></g>
        </svg>
    </div>

</div>
*/

if (!window.SVG)
    window.SVG = {};

if (! window.SVG.misc )
    window.SVG.misc = { printerId: 0 };

if (! window.SVG.Printer )
    window.SVG.Printer = { printerId: 0 };

SVG.Printer = function ( d ) {
    this.topDiv = d;
    this.scale = 1;
    this.gid=0;
    this.printerId = ++SVG.misc.printerId;
   
    this.title;
    this.styles = '';
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = 0;
    
    this.glyphs = new SVG.Glyphs();
    
    this.initDoc();
    
    this.svgHead = function( id, kls, size ) {
        var w = size? size.w*this.scale + 'px' : '0';
        var h = size? size.h*this.scale + 'px' : '0';
        var d = size? '' : 'display: none; ';
        kls = kls? 'class="'+kls+'"' : '' ;
        
        return '<svg id="'+id+'" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="'+d+'width:'+w+'; height: '+h+';" >\n';
    };
};

SVG.Printer.prototype.initDoc = function( docId, title, add_styles, options ) {
    options = options || {};
    this.docId = docId || 'dcto';
    this.title = title || '';
    this.backgroundColor = options.backgroundColor || 'none';
    this.color = options.color || 'black';
    this.scale = 1.0;
    this.defines = '';
    this.defined_glyph = [];

    this.svg_pages = [];
    this.currentPage = -1;
    this.gid=0;
    this.styles = 
'<style type="text/css">\n\
    @media print {\n\
        div.nobrk {page-break-inside: avoid}\n\
        div.newpage {page-break-before: always}\n\
    }\n'+(add_styles||'')+'\n</style>\n';
    
//<![CDATA[\n\
//]]>\n
    
};

SVG.Printer.prototype.endDoc = function( owner ) {

    var output = '<div style="display:block; margin:0; padding: 0; width: fit-content; --fill-color:'+this.color+';  background-color:'+this.backgroundColor+'; ">\n' + this.svgHead( this.docId );
    
    output += '<title>'+this.title+'</title>\n';
    output += this.styles;
    
    if(this.defines.length > 0 ) {
        output += '<defs>'+this.defines+'</defs>\n';
    }
    
    output += '</svg>\n';
    
    for( var p=0; p <=  this.currentPage; p++ ) {
        output += '<div class="'+(p>0?'newpage':'nobrk')+'">'+this.svg_pages[p]+'</div>\n';  
    }
    
    output +='</div>';
    
    this.topDiv.innerHTML = output;
    
    if( owner && owner.afterPrint ) {
//    setTimeout(function(){
        owner.afterPrint();
//    }, 300);
    }
};

SVG.Printer.prototype.initPage = function( scl ) {
    this.scale = scl || this.scale;
    this.currentPage++;
    this.svg_pages[this.currentPage] = '';
    var g = 'g' + this.docId + (this.currentPage+1);
    if( this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '<g id="'+g+'" transform="scale( '+ this.scale +')">';
    }
};

SVG.Printer.prototype.endPage = function( size ) {
    if( this.scale && this.scale !== 1.0 ) {
        this.svg_pages[this.currentPage]  += '</g>';
    }
    var pg = this.docId + (this.currentPage+1);
    this.svg_pages[this.currentPage] = this.svgHead( pg, this.currentPage < 1 ? 'nobrk':'newpage', size ) + this.svg_pages[this.currentPage] + '</svg>\n';
};

SVG.Printer.prototype.beginGroup = function (el_type) {
    var kls = "" ; //var kls = el_type==='bar'?' class="bar"':'';
    var id = 'p'+this.printerId+'g'+(++this.gid); 
    this.svg_pages[this.currentPage] += '<g id="'+id+'"'+kls+'>\n';  
    return id;
};

SVG.Printer.prototype.endGroup = function () {
    this.svg_pages[this.currentPage] += '</g>\n';  
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

SVG.Printer.prototype.printLine = function (x,y,dx,dy) {
    var pathString = ABCXJS.write.sprintf('<path style="stroke: var(--fill-color, black); stroke-width: 0.6;" d="M %.2f %.2f L %.2f %.2f"/>\n', x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printLedger = function (x,y,dx,dy) {
    var pathString = ABCXJS.write.sprintf('<path style="fill:white; stroke: var(--fill-color, black); ; stroke-width:0.6; stroke-dasharray: 1 1; " d="M %.2f %.2f L %.2f %.2f"/>\n', x, y, dx, dy);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBeam = function (x1,y1,x2,y2,x3,y3,x4,y4) {
    var pathString = ABCXJS.write.sprintf('<path style="fill: var(--fill-color, black); stroke: none;" d="M %.2f %.2f L %.2f %.2f L %.2f %.2f L %.2f %.2f z"/>\n',  x1, y1, x2, y2, x3, y3, x4, y4);
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStaveLine = function (x1, x2, y, debug) {
    var color = debug? debug : 'var(--fill-color, black)';
    var dy =0.6;   
    var pathString = ABCXJS.write.sprintf('<rect style="fill: %s;" x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>\n', 
                                                color, x1, y, Math.abs(x2-x1), dy );
    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printBar = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect style="fill: var(--fill-color, black);" x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

    this.svg_pages[this.currentPage] += pathString;
};

SVG.Printer.prototype.printStem = function (x, dx, y1, y2) {
    
    var x2 = x+dx;
    
    if (ABCXJS.misc.isIE() && dx<1) {
      dx = 1;
    }
    
    var dy = Math.abs(y2-y1);
    dx = Math.abs(dx); 
    
    var pathString = ABCXJS.write.sprintf('<rect style="fill: var(--fill-color, black);" x="%.2f" y="%.2f" width="%.2f" height="%.2f"/>\n', Math.min(x,x2), Math.min(y1,y2), dx, dy );

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
    
    var pathString = ABCXJS.write.sprintf('<path style="fill: var(--fill-color, black);" d="M %.2f %.2f C %.2f %.2f %.2f %.2f %.2f %.2f C %.2f %.2f %.2f %.2f %.2f %.2f z"/>\n', 
                            x1, y1,
                            controlx1, controly1, controlx2, controly2, x2, y2, 
                            controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1 );
    
    this.svg_pages[this.currentPage] += pathString;
};
    
SVG.Printer.prototype.printButton = function (id, x, y, radius, button_class) {
    
    var scale = radius/26; // 26 é o raio inicial do botão
    var gid = 'p'+this.printerId+id;
    
    this.setDefine('button');
    
    var pathString = ABCXJS.write.sprintf( '<g class="%s" transform="translate(%.2f %.2f) scale(%.5f)">\n\
    <use id="%s" x="0" y="0" width="52" height="52" xlink:href="#button" />\n\
    <text id="%s_tc" x="26" y="20" >...</text>\n\
    <text id="%s_to" x="26" y="42" >...</text>\n</g>\n', button_class, x, y, scale, gid, gid, gid );
    
    this.svg_pages[this.currentPage] += pathString;
    return gid;
};

SVG.Printer.prototype.printBrace = function (x, y1, y2) {
    var sz = Math.abs(y1-y2); // altura esperada
    var scale = sz / 1027; // altura real do simbolo
    this.setDefine('scripts.lbrace');
    var pathString = ABCXJS.write.sprintf('<use x="0" y="0" xlink:href="#scripts.lbrace" transform="translate(%.2f %.2f) scale(0.13 %.5f)" />\n', x, y2, scale );
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

SVG.Printer.prototype.tabText = function( x, y, str, clss, anch ) {
   str = ""+str;
   if( str.length===0) return;
   
   anch = anch || 'start';
   x = x.toFixed(2);
   y = y.toFixed(2);
   
   this.svg_pages[this.currentPage] += '<text class="'+clss+'" style="fill: var(--fill-color, black);" x="'+x+'" y="'+y+'" >'+str+'</text>\n';
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
       this.svg_pages[this.currentPage] += '<text class="'+clss+'" style="fill: var(--fill-color, black);" x="'+x+'" y="'+y+'" text-anchor="'+anch+'">'+t[0]+'</text>\n';
   } else {
       this.svg_pages[this.currentPage] += '<g class="'+clss+'" style="fill: var(--fill-color, black);" transform="translate('+x+' '+y+')">\n';
       this.svg_pages[this.currentPage] += '<text text-anchor="'+anch+'" x="0" y="0">\n';
       for(var i = 0; i < t.length; i++ )
           this.svg_pages[this.currentPage] += '<tspan x="0" dy="1.2em" >'+t[i]+'</tspan>\n';
       this.svg_pages[this.currentPage] += '</text></g>\n';
   }
};

//SVG.Printer.prototype.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
//  var angle = 0;
//  var startX = centerX+radius*Math.cos(startAngle*Math.PI/180); 
//  var startY = centerY+radius*Math.sin(startAngle*Math.PI/180);
//  var endX = centerX+radius*Math.cos(endAngle*Math.PI/180); 
//  var endY = centerY+radius*Math.sin(endAngle*Math.PI/180);
//  var arcSVG = [radius, radius, angle, 0, 1, endX-startX, endY-startY].join(' ');
//  return this.arc(startX, startY, arcSVG);
//};
//
//SVG.Printer.prototype.arc = function(startX, startY, arcSVG) {
//    var pathString = ABCXJS.write.sprintf('<path d="M %.2f %.2f a%s"/>\n', startX, startY, arcSVG);
//    this.svg_pages[this.currentPage] += pathString;
//};
//
//SVG.Printer.prototype.circle = function(startX, startY, radius) {
//    var pathString = ABCXJS.write.sprintf('<circle cx="%.2f" cy="%.2f" r="%.2f" stroke="black" stroke-width="2" fill="white" />\n', startX, startY, radius );
//    this.svg_pages[this.currentPage] += pathString;
//};
//
