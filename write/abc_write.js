//    abc_write.js: Prints an abc file parsed by abc_parse.js
//    Copyright (C) 2010 Gregory Dyke (gregdyke at gmail dot com)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.


/*global window, ABCXJS, Math */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.write)
	window.ABCXJS.write = {};

ABCXJS.write.spacing = function() {};
ABCXJS.write.spacing.FONTEM = 360;
ABCXJS.write.spacing.FONTSIZE = 30;
ABCXJS.write.spacing.STEP = ABCXJS.write.spacing.FONTSIZE*(93)/720;
ABCXJS.write.spacing.SPACE = 10;
ABCXJS.write.spacing.TOPNOTE = 10; 
ABCXJS.write.spacing.STAVEHEIGHT = 100;


//--------------------------------------------------------------------PRINTER

ABCXJS.write.Printer = function(paper, params ) {
  params = params || {};
  this.y = 0;
  this.pageNumber = 1;
  this.estimatedPageLength = 0;
  this.paper = paper;
  this.space = 3*ABCXJS.write.spacing.SPACE;
  this.glyphs = new ABCXJS.write.Glyphs();
  this.listeners = [];
  this.selected = [];
  this.ingroup = false;
  this.scale = params.scale || 1;
  this.staffwidth = params.staffwidth || 1024;
  this.paddingtop = params.paddingtop || 15;
  this.paddingbottom = params.paddingbottom || 15;
  this.paddingleft = params.paddingleft || 15;
  this.paddingright = params.paddingright || 30;
  this.editable = params.editable || false;
  this.staffgroups = [];
  
};

// notify all listeners that a graphical element has been selected
ABCXJS.write.Printer.prototype.notifySelect = function (abselem) {
  this.selected[this.selected.length]=abselem;
  abselem.highlight();
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].highlight(abselem.abcelem);
  }
};

// notify all listeners that a graphical element has been selected
ABCXJS.write.Printer.prototype.notifyClearNSelect = function (abselem) {
  this.clearSelection();
  this.notifySelect(abselem);
};

ABCXJS.write.Printer.prototype.notifyChange = function (abselem) {
  for (var i=0; i<this.listeners.length;i++) {
    this.listeners[i].modelChanged();
  }
};

ABCXJS.write.Printer.prototype.clearSelection = function () {
  for (var i=0;i<this.selected.length;i++) {
    this.selected[i].unhighlight();
  }
  this.selected = [];
};

ABCXJS.write.Printer.prototype.addSelectListener = function (listener) {
  this.listeners[this.listeners.length] = listener;
};

ABCXJS.write.Printer.prototype.rangeHighlight = function(start,end)
{
    this.clearSelection();
    for (var line=0;line<this.staffgroups.length; line++) {
	var voices = this.staffgroups[line].voices;
	for (var voice=0;voice<voices.length;voice++) {
	    var elems = voices[voice].children;
	    for (var elem=0; elem<elems.length; elem++) {
		// Since the user can highlight more than an element, or part of an element, a hit is if any of the endpoints
		// is inside the other range.
		var elStart = elems[elem].abcelem.startChar;
		var elEnd = elems[elem].abcelem.endChar;
		if ((end>elStart && start<elEnd) || ((end===start) && end===elEnd)) {
		    //		if (elems[elem].abcelem.startChar>=start && elems[elem].abcelem.endChar<=end) {
		    this.selected[this.selected.length]=elems[elem];
		    elems[elem].highlight();
		}
	    }
	}
    }
    return this.selected;
};

ABCXJS.write.Printer.prototype.beginGroup = function () {
    this.ingroup = true;
    this.paper.beginGroup();
};

ABCXJS.write.Printer.prototype.addPath = function (path) {
  path = path || [];
  if (path.length===0) return;
  path[0][0]="m";
  path[0][1]-=this.lastM[0];
  path[0][2]-=this.lastM[1];
  this.lastM[0]+=path[0][1];
  this.lastM[1]+=path[0][2];
  this.path.push(path[0]);
  for (var i=1,ii=path.length;i<ii;i++) {
    if (path[i][0]==="m") {
      this.lastM[0]+=path[i][1];
      this.lastM[1]+=path[i][2];
    }
    this.path.push(path[i]);
  }
};

ABCXJS.write.Printer.prototype.endGroup = function () {
  
  this.ingroup = false;
  this.paper.endGroup();
  return;
  
  if (this.path.length===0) return null;
  var ret = this.paper.path().attr({path:this.path, stroke:"none", fill:"#000000"});
  if (this.scale!==1) {
    ret.scale(this.scale, this.scale, 0, 0);
  }
  return ret;
};

ABCXJS.write.Printer.prototype.printStave = function (startx, endx, staff ) {
    if(staff.numLines === 4) {
      this.printStaveLine(startx,endx,0); // 2
      this.printStaveLine(startx,endx,7.5, {stroke:"#666666", strokeDashArray:'.', strokeWidth:0.3, fill:"white"}); // 8.5
      this.printStaveLine(startx,endx,15, {stroke:"black", strokeDashArray:'.', strokeWidth:1, fill:"black"}); // 15
      this.printStaveLine(startx,endx,19.5, {stroke:"#666666", strokeDashArray:'.', strokeWidth:0.3, fill:"white"}); // 19.5
    } else {
      for (var i = 0; i < staff.numLines; i++) {
        this.printStaveLine(startx,endx,(i+1)*2);
      }
    }
};

ABCXJS.write.Printer.prototype.printDebugLine = function (x1,x2, y, fill ) {
   this.doPrintStaveLine(x1,x2, y, {fill:fill} ) ; 
};

ABCXJS.write.Printer.prototype.printStaveLine = function (x1,x2, pitch, attrs) {
    return  this.doPrintStaveLine(x1, x2, this.calcY(pitch), attrs || {} );
};

ABCXJS.write.Printer.prototype.printLedger = function (x1, x2, pitch, attrs) {
    if( pitch < 2 || pitch > 10 ) {
      return this.doPrintStaveLine(x1, x2, this.calcY(pitch), attrs || {stroke:"black", strokeDashArray:'--', strokeWidth:0.3, fill:"white"} );
    } else {
      return null;
    }  
};

ABCXJS.write.Printer.prototype.doPrintStaveLine = function (x1,x2, y, attrs ) {
  var dy = .3;
  var fill = attrs.fill || "#000000";
  var stroke = attrs.stroke || "none";
  var strokeWidth = attrs.strokeWidth || 1;
  var strokeDashArray = attrs.strokeDashArray || "";
  
  //var y = this.calcY(pitch);
  var pathString = ABCXJS.write.sprintf("M %f %f L %f %f L %f %f L %f %f z", x1, y-dy, x2, y-dy, x2, y+dy, x1, y+dy);
  var ret = this.paper.path().attr({path:pathString, fill:fill, stroke: stroke, 'stroke-width':strokeWidth, 'stroke-dasharray':strokeDashArray}).toBack();

  if (this.scale!==1) {
    ret.scale(this.scale, this.scale, 0, 0);
  }
  return ret;
};

ABCXJS.write.Printer.prototype.printStem = function (x, dx, y1, y2) {
  
  this.paper.printStem(x, dx, y1, y2);
  return;
  
  if (y1>y2) { // correct path "handedness" for intersection with other elements
    var tmp = y2;
    y2 = y1;
    y1 = tmp;
  }
  var isIE=/*@cc_on!@*/false;//IE detector
  var fill = "#000000";
  if (isIE && dx<1) {
    dx = 1;
    fill = "#666666";
  }
  if (~~x === x) x+=0.05; // raphael does weird rounding (for VML)
  var pathArray = [["M",x,y1],["L", x, y2],["L", x+dx, y2],["L",x+dx,y1],["z"]];
  if (!isIE && this.ingroup) {
    this.addPath(pathArray);
  } else {
    var ret = this.paper.path().attr({path:pathArray, stroke:"none", fill:fill}).toBack();
    if (this.scale!==1) {
      ret.scale(this.scale, this.scale, 0, 0);
    }
    return ret;
  }
};

ABCXJS.write.Printer.prototype.printTabText = function (x, offset, text, size, anchor) {
  //anchor = anchor || "start"; 
  anchor = anchor || "middle";
  size = size || 14;
  if(text==="-->") anchor = "middle";
  var ret = this.paper.text(x, this.calcY(offset), text).attr({"text-anchor":anchor, "font-size":size});
  return ret;
};

    ABCXJS.write.Printer.prototype.printTabText2 = function (x, offset, text, size, anchor) {
    return this.printTabText(x, offset, text, 12, anchor);
};

ABCXJS.write.Printer.prototype.printTabText3 = function (x, offset, text, size, anchor) {
    return this.printTabText(x, offset, text, 10, anchor);
};

ABCXJS.write.Printer.prototype.printText = function (x, offset, text, anchor) {
  anchor = anchor || "start";
  var ret = this.paper.text(x, this.calcY(offset), text).attr({"text-anchor":anchor, "font-size":12});
  return ret;
};

// assumes this.y is set appropriately
// if symbol is a multichar string without a . (as in scripts.staccato) 1 symbol per char is assumed
// not scaled if not in printgroup
ABCXJS.write.Printer.prototype.printSymbol = function(x, offset, symbol, scalex, scaley) {
	var el;
  if (!symbol) return null;
  if (symbol.length>0 && symbol.indexOf(".")<0) {
    var elemset = this.paper.set();
    var dx =0;
    for (var i=0; i<symbol.length; i++) {
      var ycorr = this.glyphs.getYCorr(symbol.charAt(i));
      el = this.glyphs.printSymbol(x+dx, this.calcY(offset+ycorr), symbol.charAt(i), this.paper);
      if (el) {
	elemset.push(el);
	dx+=this.glyphs.getSymbolWidth(symbol.charAt(i));
      } else {
	this.printDebugMsg(x, this.calcY(offset), "no symbol:" +symbol);
      }
    }
    if (this.scale!==1) {
      elemset.scale(this.scale, this.scale, 0, 0);
    }
    return elemset;
  } else {
    var ycorr = this.glyphs.getYCorr(symbol);
    if (this.ingroup) {
      //this.addPath(this.glyphs.getPathForSymbol(x, this.calcY(offset+ycorr), symbol, scalex, scaley));
      this.paper.print_hq(x,this.calcY(offset+ycorr));
    } else {
      el = this.glyphs.printSymbol(x, this.calcY(offset+ycorr), symbol, this.paper);
      if (el) {
	if (this.scale!==1) {
	  el.scale(this.scale, this.scale, 0, 0);
	}
	return el;
      } else
	this.printDebugMsg(x, this.calcY(offset), "no symbol:" +symbol);
    }
    return null;    
  }
};

ABCXJS.write.Printer.prototype.printPath = function (attrs) {
  var ret = this.paper.path().attr(attrs);
  if (this.scale!==1) ret.scale(this.scale, this.scale, 0, 0);
  return ret;
};

ABCXJS.write.Printer.prototype.drawArcForStaffGroup = function(x1, x2, y1, y2, above) {

  x1 = x1 + 6;
  x2 = x2 + 4;
  y1 = y1 + ((above)?1.5:-1.5);
  y2 = y2 + ((above)?1.5:-1.5);

  //unit direction vector
  var dx = x2-x1;
  var dy = y2-y1;
  var norm= Math.sqrt(dx*dx+dy*dy);
  var ux = dx/norm;
  var uy = dy/norm;

  var flatten = norm/3.5;
  var curve = ((above)?-1:1)*Math.min(25, Math.max(4, flatten));

  var controlx1 = x1+flatten*ux-curve*uy;
  var controly1 = y1+flatten*uy+curve*ux;
  var controlx2 = x2-flatten*ux-curve*uy;
  var controly2 = y2-flatten*uy+curve*ux;
  var thickness = 3;
  var pathString = ABCXJS.write.sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", x1, y1,
			   controlx1, controly1, controlx2, controly2, x2, y2, 
			   controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1);
  var ret = this.paper.path().attr({path:pathString, stroke:"none", fill:"#000000"});
  if (this.scale!==1) {
    ret.scale(this.scale, this.scale, 0, 0);
  }
  return ret;
};


ABCXJS.write.Printer.prototype.drawArc = function(x1, x2, pitch1, pitch2, above) {


  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  //unit direction vector
  var dx = x2-x1;
  var dy = y2-y1;
  var norm= Math.sqrt(dx*dx+dy*dy);
  var ux = dx/norm;
  var uy = dy/norm;

  var flatten = norm/3.5;
  var curve = ((above)?-1:1)*Math.min(25, Math.max(4, flatten));

  var controlx1 = x1+flatten*ux-curve*uy;
  var controly1 = y1+flatten*uy+curve*ux;
  var controlx2 = x2-flatten*ux-curve*uy;
  var controly2 = y2-flatten*uy+curve*ux;
  var thickness = 2;
  var pathString = ABCXJS.write.sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", x1, y1,
			   controlx1, controly1, controlx2, controly2, x2, y2, 
			   controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1);
  var ret = this.paper.path().attr({path:pathString, stroke:"none", fill:"#000000"});
  if (this.scale!==1) {
    ret.scale(this.scale, this.scale, 0, 0);
  }
  return ret;
};

ABCXJS.write.Printer.prototype.printDebugMsg = function(x, y, msg ) {
  return this.paper.text(x, y, msg).scale(this.scale, this.scale, 0, 0);
};

ABCXJS.write.Printer.prototype.printLyrics = function(x, ypos, msg) {
    var y = this.calcY(ypos);
    // para manter alinhado, quando uma das linhas for vazia, imprimo 3 pontos
    var i = msg.indexOf( "\n " );
    if( i >= 0) msg = msg.substr(0, i) + "\n...";
    
    var el = this.paper.text(x, y, msg).attr({"font-family":"Times New Roman", "font-weight":'bold', "font-size":14, "text-anchor":"start"}).scale(this.scale, this.scale, 0, 0);
    el[0].setAttribute("class", "abc-lyric");
    return el;
};

ABCXJS.write.Printer.prototype.calcY = function(ofs) {
  return this.y+((ABCXJS.write.spacing.TOPNOTE-ofs)*ABCXJS.write.spacing.STEP); // flavio
};

ABCXJS.write.Printer.prototype.printABC = function(abctunes) {
  if (abctunes[0]===undefined) {
    abctunes = [abctunes];
  }
  this.y=0;

  for (var i = 0; i < abctunes.length; i++) {
    this.printTune(abctunes[i]);
  }

};

ABCXJS.write.Printer.prototype.printTempo = function (tempo, x, y) {
    
	if (tempo.preString) {
            this.paper.text(x, y, tempo.preString, 'abc_tempo', 'start');
            //x += (text.getBBox().width + 20*printer.scale);
            //fixme: obter a largura do texto
            x+=10;
	}
        
	if (tempo.duration) {
            var temposcale = 0.9;
            var tempopitch = 5;
            var duration = tempo.duration[0]; // TODO when multiple durations
            var abselem = new ABCXJS.write.AbsoluteElement(tempo, duration, 1);
            var durlog = ABCXJS.write.getDurlog(duration);
            var dot = 0;
            for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2);
            var c = ABCXJS.write.chartable.note[-durlog];
            var flag = ABCXJS.write.chartable.uflags[-durlog];
            var temponote = this.layouter.printNoteHead( abselem, c, {verticalPos:tempopitch}, "up", 0, 0, flag, dot, 0, temposcale );
            abselem.addHead(temponote);
            if (duration < 1) {
                var dx = 6.4;
                var width = 0.6;
                abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, 0, {type:"stem", pitch2:tempopitch, linewidth:width}));
            }
            abselem.x = x;
            abselem.draw(this, null);

            x += (abselem.w+2 );
            this.paper.text(x, y, "= " + tempo.bpm, 'abc_tempo', 'start');
            x += 20; //fixme:obter a largura do texto // text.getBBox().width + 10*printer.scale;
	}
        
	if (tempo.postString) {
            this.paper.text( x, y, tempo.postString, 'abc_tempo', 'start');
	}
        
	return y-5;
};

ABCXJS.write.Printer.prototype.printTune = function(abctune) {
    
    if( abctune.lines.length === 0 ) return;
    
    if( abctune.midi) {
        abctune.midi.printer = this;
    }
    
    this.landscape = abctune.formatting.landscape;
    this.pagenumbering = abctune.formatting.pagenumbering;
    this.staffsep = abctune.formatting.staffsep ||  ABCXJS.write.spacing.STEP*8;
    
    this.paddingtop = this.landscape? 10 : 15;
    this.paddingright = this.landscape? 50 : 30;
    
    this.layouter = new ABCXJS.write.Layout( this, abctune.formatting.bagpipes );
    
    this.scale = abctune.formatting.scale ? abctune.formatting.scale: this.scale;
    
    this.width = ( abctune.formatting.staffwidth ? abctune.formatting.staffwidth : this.staffwidth ) + this.paddingleft ;
    
    this.y += this.paddingtop;
    
    this.estimatedPageLength = (this.width*abctune.formatting.pageratio) ; // ainda não consigo escalar * scalePageRatio(this.scale);
    
    this.paper.initPage(0, this.width, this.estimatedPageLength, this.scale );

    if (abctune.metaText.title) {
        this.y += 5;
        this.paper.text(this.width/2, this.y, abctune.metaText.title, "abc_title", "middle" );
        this.y += 20;
    }    

    if (abctune.lines[0].staffs[0].subtitle) {
        this.printSubtitleLine(abctune.lines[0].staffs[0].subtitle);
        this.y += 20;
    }
    
    if (abctune.metaText.rhythm) {
        this.paper.text(this.paddingleft*3, this.y, abctune.metaText.rhythm, 'abc_rhythm', 'start');
        !(abctune.metaText.author || abctune.metaText.origin || abctune.metaText.composer) && (this.y += 15);
    }

    var composerLine = "";
    var meta = false;
    if (abctune.metaText.composer)
        composerLine += abctune.metaText.composer;
    if (abctune.metaText.origin)
        composerLine += ' (' + abctune.metaText.origin + ')';

    if (composerLine.length > 0) {
        this.paper.text(this.width, this.y, composerLine, 'abc_author', 'end' );
        meta = true;
    }
    if (abctune.metaText.author) {
        this.paper.text(this.width, this.y, abctune.metaText.author, 'abc_author', 'end' );
        meta = true;
    }


    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        this.y = this.printTempo(abctune.metaText.tempo, this.paddingleft + 10, this.y+20 );
        meta = true;
    }

    this.paper.print_teste(100, 100, 'brace2');
    this.paper.print_teste(110, 100, 'clefs.G');
    this.paper.print_teste(110, 200, 'clefs.F');
    this.paper.print_teste(140, 200, 'clefs.C');
    this.paper.print_teste(140, 100, 'clefs.tab');
    
    this.paper.endPage();
    
    this.paper.topDiv.innerHTML = this.paper.svg_pages[0];
    return;
    (meta) && (this.y += 15);

    var maxwidth = this.width;
    
    // impressão dos grupos de pautas
    for (var line = 0; line < abctune.lines.length; line++) {
        var abcline = abctune.lines[line];
        if (abcline.text) {
            console.log('abcline.text should no longer exists!');
            continue;
        }
        if(abcline.newpage) {
            this.skipPage();
            continue;
        }
        if(abcline.staffs) {
            var staffgroup = this.printStaffLine(abctune, line);
            maxwidth = Math.max(staffgroup.w, maxwidth);
        }
    }
    
    var extraText1 = "", extraText2 = "",  height = 0, h1=0, h2=0;
    
    if (abctune.metaText.unalignedWords) {
        for (var j = 0; j < abctune.metaText.unalignedWords.length; j++) {
            if (typeof abctune.metaText.unalignedWords[j] === 'string') {
                extraText1 += abctune.metaText.unalignedWords[j] + "\n";
                h1 ++;
            }
        }
    }
    if (abctune.metaText.book) {
         h2 ++;
         extraText2 += "Livro: " + abctune.metaText.book + "\n";
    }    
    if (abctune.metaText.source) {
         h2 ++;
        extraText2+= "Fonte: " + abctune.metaText.source + "\n";
    }    
    if (abctune.metaText.discography) {
         h2 ++;
        extraText2 += "Discografia: " + abctune.metaText.discography + "\n";
    }    
    if (abctune.metaText.notes) {
         h2 ++;
        extraText2 += abctune.metaText.notes + "\n";
    }    
    if (abctune.metaText.transcription) {
         h2 ++;
        extraText2 += "Transcrito por " + abctune.metaText.transcription + "\n";
    }    
    if (abctune.metaText.history) {
         h2 ++;
        extraText2+= "Histórico: " + abctune.metaText.history + "\n";
    }    
    
    if(h1> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h1*1.5*17; // 1.5??? ver translate...
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.y += this.printExtraText( extraText1, this.paddingleft+50);
    }

    if(h2> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h2*1.5*17;
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.y += this.printExtraText( extraText2, this.paddingleft);
    }
    
//    for(var r=0; r < 10; r++) // para debug: testar a posição do número ao final da página
//        this.skipPage();
    
    if( this.pageNumber > 1) {
        this.skipPage();
        this.y -= (this.paddingtop+5); // to avoid extra page at end of the print
    } else {
        this.y += (this.paddingbottom-5); 
    }    
    
    var sizetoset = {w: (maxwidth + this.paddingright) , h: this.y};
    
    this.paper.setSize(sizetoset.w, sizetoset.h);
    
    // Correct for IE problem in calculating height
    var isIE = /*@cc_on!@*/false;//IE detector
    if (isIE) {
        this.paper.canvas.parentNode.style.width = "" +  sizetoset.w + "px";
        this.paper.canvas.parentNode.style.height = "" + sizetoset.h + "px";
    } else {
        this.paper.canvas.parentNode.setAttribute("style", "width:" + sizetoset.w + "px"); 
       // this.paper.canvas.parentNode.setAttribute("style", "height:" + sizetoset.h + "px");
       // this.paper.canvas.setAttribute("style", "background-color: #ffe"); 
    }
};

ABCXJS.write.Printer.prototype.skipPage = function() {
    this.y = this.estimatedPageLength*this.pageNumber + this.paddingtop;
    if (this.pagenumbering) {
         this.paper.text((this.width+25), (this.y - this.paddingtop - 13) , "- " + this.pageNumber + " -")
              .attr({"text-anchor": "end", "font-size": 13 , "font-family": "serif", 'font-weight': 'bold'});
    }
    this.pageNumber++;
};

ABCXJS.write.Printer.prototype.printExtraText = function(text, x) {
    var t = this.paper.text(x, this.y , text).attr({"text-anchor": "start", "font-family": "serif", "font-size": 17 });
    var height = t.getBBox().height;
    if (!height)  height = 25 ; // TODO-PER: Hack! Raphael sometimes and returns NaN. Perhaps only when printing to PDF? Possibly if the SVG is hidden?
    t.translate(0, height / 2);
    return height;
};

ABCXJS.write.Printer.prototype.printSubtitleLine = function(subtitle) {
    this.paper.text(this.width/2, this.y, subtitle, 'abc_subtitle', 'middle');
};

ABCXJS.write.Printer.prototype.printStaffLine = function (abctune, line) {
    var n = this.staffgroups.length;
    this.staffgroups[n] = this.layouter.layoutABCLine(abctune, line, this.width);
    this.staffgroups[n].draw( this, line );
    return this.staffgroups[n];
};
