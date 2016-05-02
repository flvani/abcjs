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
  //this.ingroup = false;
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

ABCXJS.write.Printer.prototype.beginGroup = function (abselem) {
    //this.ingroup = true;
    this.paper.beginGroup();
    abselem.gid = this.paper.gid; // associa o elemento absoluto com o futuro elemento sgv selecionavel
};

//ABCXJS.write.Printer.prototype.addPath = function (path) {
//  path = path || [];
//  if (path.length===0) return;
//  path[0][0]="m";
//  path[0][1]-=this.lastM[0];
//  path[0][2]-=this.lastM[1];
//  this.lastM[0]+=path[0][1];
//  this.lastM[1]+=path[0][2];
//  this.path.push(path[0]);
//  for (var i=1,ii=path.length;i<ii;i++) {
//    if (path[i][0]==="m") {
//      this.lastM[0]+=path[i][1];
//      this.lastM[1]+=path[i][2];
//    }
//    this.path.push(path[i]);
//  }
//};

ABCXJS.write.Printer.prototype.endGroup = function () {
  
  //this.ingroup = false;
  this.paper.endGroup();
  return;
  
//  if (this.path.length===0) return null;
//  var ret = this.paper.path().attr({path:this.path, stroke:"none", fill:"#000000"});
//  if (this.scale!==1) {
//    ret.scale(this.scale, this.scale, 0, 0);
//  }
//  return ret;
};

ABCXJS.write.Printer.prototype.printStave = function (startx, endx, staff ) {
    if(staff.numLines === 4) {
      this.paper.printStaveLine(startx,endx,this.calcY(19.5), 'ledger' ); 
      
      // imprimo duas linhas para efeito
      this.paper.printStaveLine(startx,endx,this.calcY(15)-0.5 ); 
      this.paper.printStaveLine(startx,endx,this.calcY(15) ); 
      
      this.paper.printStaveLine(startx,endx,this.calcY(7.5), 'ledger' ); 
      
      this.paper.printStaveLine(startx,endx,this.calcY(0)); 
    } else {
      for (var i = 0; i < staff.numLines; i++) {
        this.paper.printStaveLine(startx,endx,this.calcY((i+1)*2));
      }
    }
};

ABCXJS.write.Printer.prototype.printDebugLine = function (x1,x2, y, fill ) {
   this.paper.printStaveLine(x1,x2, y, 'stave', fill ) ; 
};

ABCXJS.write.Printer.prototype.printLedger = function (x1, x2, pitch) {
    if( pitch < 2 || pitch > 10 ) {
      this.paper.printStaveLine(x1, x2, this.calcY(pitch), 'ledger' );
    } else {
      return null;
    }  
};

ABCXJS.write.Printer.prototype.printText = function (x, offset, text, anchor) {
    anchor = anchor || "start";
    this.paper.text(x, this.calcY(offset), text, 'abc_text', anchor);
};
ABCXJS.write.Printer.prototype.printTabText = function (x, offset, text, klass) {
    klass = klass || 'abc_tabtext';
    this.paper.tabText(x, this.calcY(offset)+5, text, klass, 'middle');
};

ABCXJS.write.Printer.prototype.printTabText2 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext2');
};

ABCXJS.write.Printer.prototype.printTabText3 = function (x, offset, text) {
    return this.printTabText(x, offset, text, 'abc_tabtext3');
};

ABCXJS.write.Printer.prototype.printStem = function (x, dx, y1, y2) {
    this.paper.printStem(x, dx, y1, y2);
};

ABCXJS.write.Printer.prototype.printSymbol = function (x, offset, symbol ) {
    if (!symbol) return null;
    try {
        this.paper.printSymbol(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), symbol);
    } catch(e){
        this.paper.text(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), e );
    }
};

//ABCXJS.write.Printer.prototype.drawArcForStaffGroup = function(x1, x2, y1, y2, above) {
//
//  x1 = x1 + 6;
//  x2 = x2 + 4;
//  y1 = y1 + ((above)?1.5:-1.5);
//  y2 = y2 + ((above)?1.5:-1.5);
//
//  //unit direction vector
//  var dx = x2-x1;
//  var dy = y2-y1;
//  var norm= Math.sqrt(dx*dx+dy*dy);
//  var ux = dx/norm;
//  var uy = dy/norm;
//
//  var flatten = norm/3.5;
//  var curve = ((above)?-1:1)*Math.min(25, Math.max(4, flatten));
//
//  var controlx1 = x1+flatten*ux-curve*uy;
//  var controly1 = y1+flatten*uy+curve*ux;
//  var controlx2 = x2-flatten*ux-curve*uy;
//  var controly2 = y2-flatten*uy+curve*ux;
//  var thickness = 3;
//  var pathString = ABCXJS.write.sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", x1, y1,
//			   controlx1, controly1, controlx2, controly2, x2, y2, 
//			   controlx2-thickness*uy, controly2+thickness*ux, controlx1-thickness*uy, controly1+thickness*ux, x1, y1);
//  var ret = this.paper.path().attr({path:pathString, stroke:"none", fill:"#000000"});
//  if (this.scale!==1) {
//    ret.scale(this.scale, this.scale, 0, 0);
//  }
//  return ret;
//};


ABCXJS.write.Printer.prototype.drawTieArc = function(x1, x2, pitch1, pitch2, above) {

  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  this.paper.printTieArc(x1,y1,x2,y2,above);
};

ABCXJS.write.Printer.prototype.printDebugMsg = function(x, y, msg ) {
  return this.paper.text(x, y, msg, 'abc_ending', 'start');
};

ABCXJS.write.Printer.prototype.printLyrics = function(x, ypos, msg) {
    var y = this.calcY(ypos);
    // para manter alinhado, quando uma das linhas for vazia, imprimo 3 pontos
    var i = msg.indexOf( "\n " );
    if( i >= 0) msg = msg.substr(0, i) + "\n...";
    
    this.paper.text(x, y, msg, 'abc_lyrics', 'start');
    
    //var el = this.paper.text(x, y, msg).attr({"font-family":"Times New Roman", "font-weight":'bold', "font-size":14, "text-anchor":"start"}).scale(this.scale, this.scale, 0, 0);
    //el[0].setAttribute("class", "abc-lyric");
    //return el;
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

ABCXJS.write.Printer.prototype.printTempo = function (x, tempo) {
    
    this.y -= 5;

    var tempopitch = 5;

    if (tempo.preString) {
        this.paper.text(x, this.calcY(tempopitch-0.8), tempo.preString, 'abc_tempo', 'start');
        //x += (text.getBBox().width + 20*printer.scale);
        //fixme: obter a largura do texto
        x += tempo.preString.length*5 + 5;
    }

    if (tempo.duration) {
        var temposcale = 0.9;
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
            var dx = 9.5;
            var width = -0.6;
            abselem.addExtra(new ABCXJS.write.RelativeElement(null, dx, 0, tempopitch, {type:"stem", pitch2:tempopitch+6, linewidth:width}));
        }
        abselem.x = x+4;
        abselem.draw(this, null);

        x += (abselem.w+dx );
        var tempostr = "= " + tempo.bpm;
        this.paper.text(x, this.calcY(tempopitch-0.8), tempostr, 'abc_tempo', 'start');
        //fixme: obter a largura do texto // text.getBBox().width + 10*printer.scale;
        x += tempostr.length*5 + 5;
    }

    if (tempo.postString) {
        this.paper.text( x, this.calcY(tempopitch-0.8), tempo.postString, 'abc_tempo', 'start');
    }

    this.y += 5;
    return abselem.x + abselem.w +4;
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
    this.paddingright = this.landscape? 45 : 30;
    
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
    
    var composerLine = "", meta = false;
    if (abctune.metaText.composer)
        composerLine += abctune.metaText.composer;
    if (abctune.metaText.origin)
        composerLine += ' (' + abctune.metaText.origin + ')';
    if (abctune.metaText.author) 
        composerLine += (composerLine.length> 0?'\n':'') + abctune.metaText.author;

    if (composerLine.length > 0) {
        this.paper.text(this.width, 30, composerLine, 'abc_author', 'end' );
        meta = true;
    } 
    
    var xtempo ;
    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        xtempo = this.printTempo(this.paddingleft*2, abctune.metaText.tempo );
        meta = true;
    }
    if (abctune.metaText.rhythm) {
        this.paper.text( xtempo || this.paddingleft*3, this.y, abctune.metaText.rhythm, 'abc_rhythm', 'start');
        meta = true;
    }
    
    (meta) && (this.y += 20);

    var maxwidth = this.width;
    
    // impressão dos grupos de pautas
    for (var line = 0; line < abctune.lines.length; line++) {
        var abcline = abctune.lines[line];
        if(abcline.newpage) {
            this.skipPage();
            continue;
        }
        if(abcline.staffs) {
            var staffgroup =  this.layouter.layoutABCLine(abctune, line, this.width);
            staffgroup.draw( this, line );
            this.staffgroups.push(staffgroup);
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
        this.printExtraText( extraText1, this.paddingleft+50);
        this.y += height; 
    }

    if(h2> 0) {
        height = ABCXJS.write.spacing.STEP*3 + h2*1.5*17;
        if( ( this.pageNumber - ((this.y+height)/this.estimatedPageLength) ) < 0 ) {
           this.skipPage();
        } else {
            this.y += ABCXJS.write.spacing.STEP*3; 
        }
        this.printExtraText( extraText2, this.paddingleft);
        this.y += height; 
    }
    
    for(var r=0; r < 10; r++) // para debug: testar a posição do número ao final da página
        this.skipPage();
    
    if( this.pageNumber > 1) {
        this.skipPage();
        this.y -= (this.paddingtop+5); // to avoid extra page at end of the print
    } else {
        this.y += (this.paddingbottom-5); 
    } 
    
    this.paper.endPage();
    this.paper.flush(abctune.lines);
    
    var sizetoset = {w: (maxwidth + this.paddingright) , h: this.y};
    
    var s = document.getElementById('master');
    s.style.width = "" +  sizetoset.w + "px";
    s.style.height = "" + sizetoset.h + "px";
    
    return;
    
    this.paper.setSize(sizetoset.w, sizetoset.h);
    
    // Correct for IE problem in calculating height
    if (isIE()) {
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
         this.paper.text((this.width), (this.y - this.paddingtop - 13) , "- " + this.pageNumber + " -", 'abc_tempo', 'end');
             // .attr({"text-anchor": "end", "font-size": 13 , "font-family": "serif", 'font-weight': 'bold'});
    }
    this.pageNumber++;
};

ABCXJS.write.Printer.prototype.printExtraText = function(text, x) {
    var t = this.paper.text(x, this.y , text, 'abc_title', 'start');
            //.attr({"text-anchor": "start", "font-family": "serif", "font-size": 17 });
    var height ;//= t.getBBox().height;
    if (!height)  height = 25 ; // TODO-PER: Hack! Raphael sometimes and returns NaN. Perhaps only when printing to PDF? Possibly if the SVG is hidden?
    //t.translate(0, height / 2);
    return height;
};

ABCXJS.write.Printer.prototype.printSubtitleLine = function(subtitle) {
    this.paper.text(this.width/2, this.y, subtitle, 'abc_subtitle', 'middle');
};

