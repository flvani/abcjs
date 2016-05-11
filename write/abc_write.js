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

ABCXJS.write.Printer = function (paper, params) {

    params = params || {};
    this.y = 0;
    this.pageNumber = 1;
    this.estimatedPageLength = 0;
    this.paper = paper;
    this.space = 3 * ABCXJS.write.spacing.SPACE;
    this.glyphs = new ABCXJS.write.Glyphs();
    this.listeners = [];
    this.selected = [];
    this.scale = params.scale || 1;
    this.paddingtop = params.paddingtop || 15;
    this.paddingbottom = params.paddingbottom || 15;
    this.paddingleft = params.paddingleft || 15;
    this.paddingright = params.paddingright || 30;
    this.editable = params.editable || false;
    this.staffgroups = [];

};

ABCXJS.write.Printer.prototype.printABC = function(abctunes, options) {
  if (abctunes[0]===undefined) {
    abctunes = [abctunes];
  }
  this.y=0;
  this.totalY = 0;
  
  //options = options || {};
  //options.color='red';
  
  for (var i = 0; i < abctunes.length; i++) {
    this.printTune( abctunes[i], options /*, {color:'red', backgroundColor:'#ffd'}*/ );
  }

};

ABCXJS.write.Printer.prototype.printTune = function(abctune, options) {
    
    options = options || {};
    options.color = options.color ||'black';
    options.backgroundColor = options.backgroundColor ||'none';
    
    
    if( abctune.lines.length === 0 ) return;
    
    var estilo = 
'\n\
   .abc_title {\n\
        font-size: 20px;\n\
        font-family: serif;\n\
    }\n\
    \n\
    .abc_subtitle {\n\
        font-size: 16px;\n\
        font-family: serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_author {\n\
        font-size: 14px;\n\
        font-family: serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_rhythm {\n\
        font-size: 12px;\n\
        font-family: serif;\n\
        font-style: italic;\n\
    }\n\
    \n\
    .abc_voice_header {\n\
        font-size: 12px;\n\
        font-family: serif;\n\
        font-style: italic;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_tempo {\n\
        font-size: 12px;\n\
        font-family: serif;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_text {\n\
        font-size: 12px;\n\
        font-family: serif;\n\
    }\n\
    \n\
    .abc_lyrics {\n\
        font-size: 13px;\n\
        font-family: serif;\n\
        font-weight: bold;\n\
    }\n\
    \n\
    .abc_ending {\n\
        font-size: 10px;\n\
        font-family: serif;\n\
    }\n\
    \n\
    .abc_tabtext\n\
    ,.abc_tabtext2\n\
    ,.abc_tabtext3 {\n\
        font-family: arial;\n\
        font-weight: bold;\n\
        text-anchor:middle;\n\
        font-size: 14px;\n\
    }\n\
    .abc_tabtext2 {\n\
        font-size: 12px;\n\
    }\n\
    \n\
    .abc_tabtext3 {\n\
        font-size: 10px;\n\
    }   ';
    
    ABCXJS.write.unhighLightColor = options.color;
    
//     svg { --fill-color:'+options.color+'; } \n\
//    .bar { fill: var(--fill-color, black); stroke:'+'none'+'; stroke-width:0.6; }\n\
//    .stem { fill:'+'black'+'; stroke:'+'none'+'; stroke-width:0.6; }\n\
//    .beam { fill:'+options.color+'; stroke:'none; }\n\
//    .ledger { fill:white; stroke:'+options.color+'; stroke-width:0.6; stroke-dasharray: 1 1; }\n\
//    .stave { fill:'+'none'+'; stroke:'+options.color+'; stroke-width:0.6; }\n  

    var svg_title = 'Partitura ' + abctune.metaText.title + ' criada por ABCXJS.';
    
    if( abctune.midi) {
        abctune.midi.printer = this;
    }
    this.pageratio = abctune.formatting.pageratio;
    this.pagenumbering = abctune.formatting.pagenumbering;
    this.staffsep = abctune.formatting.staffsep ||  ABCXJS.write.spacing.STEP*8;
    this.paddingtop = abctune.formatting.landscape? 15 : 15;
    this.scale = abctune.formatting.scale ? abctune.formatting.scale: this.scale;
    this.width = Math.min( abctune.formatting.staffwidth, abctune.formatting.usablewidth) - this.paddingright;
    this.maxwidth = this.width;
    
    this.y = this.paddingtop;
    this.totalY = 0;
    
    this.layouter = new ABCXJS.write.Layout( this, abctune.formatting.bagpipes );
    
    
    this.calcPageLength();
    
    this.paper.initDoc( 'tune', svg_title, estilo, options );
    this.paper.initPage( this.scale );

    if (abctune.metaText.title) {
        this.paper.text(this.width/2, this.y, abctune.metaText.title, "abc_title", "middle" );
        this.y += 20;
    }    

    if (abctune.lines[0].staffs[0].subtitle) {
        this.printSubtitleLine(abctune.lines[0].staffs[0].subtitle);
    }
    
    var composerLine = "";
    
    if (abctune.metaText.composer)
        composerLine += abctune.metaText.composer;
    if (abctune.metaText.origin)
        composerLine += ' (' + abctune.metaText.origin + ')';
    if (abctune.metaText.author) 
        composerLine += (composerLine.length> 0?'\n':'') + abctune.metaText.author;

    if (composerLine.length > 0) {
        var n = composerLine.split('\n').length;
        var dy = (n>1?(n>2?0:15):30);
        this.paper.text(this.width, dy, composerLine, 'abc_author', 'end' );
    } 
    
    var xtempo ;
    if (abctune.metaText.tempo && !abctune.metaText.tempo.suppress) {
        xtempo = this.printTempo(this.paddingleft*2, abctune.metaText.tempo );
    }
    if (abctune.metaText.rhythm) {
        this.paper.text( xtempo || this.paddingleft*3+5, this.y, abctune.metaText.rhythm, 'abc_rhythm', 'start');
    }
    
    this.y += 20;

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
            this.maxwidth = Math.max(staffgroup.w, this.maxwidth);
            this.calcPageLength();
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
        height = ABCXJS.write.spacing.STEP*3 + h1*1.5*17; 
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
    
//    for(var r=0; r < 10; r++) // para debug: testar a posição do número ao final da página
//        this.skipPage();
    
    this.skipPage(true); 
    
    this.paper.endDoc(abctune);
    
    this.formatPage(abctune);
    
    //binds SVG elements
    var lines = abctune.lines;
    for(var l=0; l<lines.length;l++){
        for(var s=0; lines[l].staffs && s <lines[l].staffs.length;s++){
            for(var v=0; v <lines[l].staffs[s].voices.length;v++){
                for(var a=0; a <lines[l].staffs[s].voices[v].length;a++){
                   var abs = lines[l].staffs[s].voices[v][a].parent;
                   if( !abs || !abs.gid ) continue;
                   abs.setMouse(this);
                }
            }
        }
    }

    
//    // Correct for IE problem in calculating height
//    if (ABCXJS.misc.isIE()) {
//        this.paper.canvas.parentNode.style.width = "" +  sizetoset.w + "px";
//        this.paper.canvas.parentNode.style.height = "" + sizetoset.h + "px";
//    } else {
//        this.paper.canvas.parentNode.setAttribute("style", "width:" + sizetoset.w + "px"); 
//       // this.paper.canvas.parentNode.setAttribute("style", "height:" + sizetoset.h + "px");
//       // this.paper.canvas.setAttribute("style", "background-color: #ffe"); 
//    }

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


ABCXJS.write.Printer.prototype.printSymbol = function (x, offset, symbol ) {
    if (!symbol) return null;
    try {
        this.paper.printSymbol(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), symbol);
    } catch(e){
        this.paper.text(x, this.calcY(offset + this.glyphs.getYCorr(symbol)), e );
    }
};

ABCXJS.write.Printer.prototype.printTieArc = function(x1, x2, pitch1, pitch2, above) {

  x1 = x1 + 6;
  x2 = x2 + 4;
  pitch1 = pitch1 + ((above)?1.5:-1.5);
  pitch2 = pitch2 + ((above)?1.5:-1.5);
  var y1 = this.calcY(pitch1);
  var y2 = this.calcY(pitch2);

  this.paper.printTieArc(x1,y1,x2,y2,above);
};

ABCXJS.write.Printer.prototype.printStave = function (startx, endx, staff ) {
    if(staff.numLines === 4) {
      this.printLedger(startx,endx, 19.5); 
      
      // imprimo duas linhas para efeito
      this.paper.printStaveLine(startx,endx,this.calcY(15)-0.5 ); 
      this.paper.printStaveLine(startx,endx,this.calcY(15) ); 
      
      this.printLedger(startx,endx, 7.5 ); 
      
      this.paper.printStaveLine(startx,endx,this.calcY(0)); 
    } else {
      for (var i = 0; i < staff.numLines; i++) {
        this.paper.printStaveLine(startx,endx,this.calcY((i+1)*2));
      }
    }
};

ABCXJS.write.Printer.prototype.printDebugLine = function (x1,x2, y, fill ) {
   this.paper.printStaveLine(x1,x2, y, fill ) ; 
};

ABCXJS.write.Printer.prototype.printLedger = function (x1, x2, pitch) {
      this.paper.printLedger(x1, this.calcY(pitch), x2, this.calcY(pitch) );
      
//    if( pitch < 2 || pitch > 10 ) {
//      this.paper.printLedger(x1, this.calcY(pitch), Math.abs(x1-x2), 0.6 );
//    } else {
//      return null;
//    }  
};

ABCXJS.write.Printer.prototype.printText = function (x, offset, text, kls, anchor ) {
    anchor = anchor || "start";
    kls = kls || "abc_text";
    this.paper.text(x, this.calcY(offset), text, kls, anchor);
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

ABCXJS.write.Printer.prototype.printBar = function (x, dx, y1, y2) {
    this.paper.printBar(x, dx, y1, y2);
};

ABCXJS.write.Printer.prototype.printStem = function (x, dx, y1, y2) {
    this.paper.printStem(x, dx, y1, y2);
};
ABCXJS.write.Printer.prototype.printDebugMsg = function(x, y, msg ) {
  return this.paper.text(x, y, msg, 'abc_ending', 'start');
};

ABCXJS.write.Printer.prototype.printLyrics = function(x, staveInfo, msg) {
    //var y = staveInfo.lowest-ABCXJS.write.spacing.STEP*staveInfo.lyricsRows;
    //y += (staveInfo.lyricsRows-0.5);
    y = this.calcY(staveInfo.lowest-(staveInfo.lyricsRows>1?0:3.7));
    
    // para manter alinhado, quando uma das linhas for vazia, imprimo 3 pontos
    var i = msg.indexOf( "\n " );
    if( i >= 0) msg = msg.substr(0, i) + "\n...";
    
    this.paper.text(x, y, msg, 'abc_lyrics', 'start');
    
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
    abselem.gid = this.paper.beginGroup(abselem.abcelem.el_type); // associa o elemento absoluto com o futuro elemento sgv selecionavel
};

ABCXJS.write.Printer.prototype.endGroup = function () {
  
  this.paper.endGroup();
  return;
  
};

ABCXJS.write.Printer.prototype.calcY = function(ofs) {
  return this.y+((ABCXJS.write.spacing.TOPNOTE-ofs)*ABCXJS.write.spacing.STEP); // flavio
};

ABCXJS.write.Printer.prototype.calcPageLength = function() {
    this.estimatedPageLength = ((this.maxwidth+this.paddingright)*this.pageratio - this.paddingbottom)/this.scale;
};

ABCXJS.write.Printer.prototype.printPageNumber = function() {
    //return; // vamos usar page format
    
    this.y = this.estimatedPageLength;
    
    if (this.pagenumbering) {
         this.paper.text(this.maxwidth+this.paddingright, this.y, "- " + this.pageNumber + " -", 'abc_tempo', 'end');
             // .attr({"text-anchor": "end", "font-size": 13 , "font-family": "serif", 'font-weight': 'bold'});
    }
};

ABCXJS.write.Printer.prototype.skipPage = function(lastPage) {
    
    // se não for a última página ou possui mais de uma página
    if( ! lastPage || this.pageNumber > 1) {
        this.printPageNumber();
    }
    this.totalY += this.y;
    
    this.paper.endPage({w: (this.maxwidth + this.paddingright) , h: this.y });
    if( ! lastPage ) {
        this.y = this.paddingtop;
        this.pageNumber++;
        this.paper.initPage( this.scale );
    }
};

ABCXJS.write.Printer.prototype.formatPage = function(tune) {
    //prepara a página para impressão de acordo com os parâmetros da canção.
    var orientation = tune.formatting.landscape?'landscape':'portrait';
    var style = document.getElementById('page_format');
    
//    var pgnumber = '';
//
//    if ( tune.formatting.pagenumbering ) {
//        pgnumber = 
//'   @page: right {\n\
//        @bottom-right {\n\
//            content: "Pág. " counter(page) "/" counter(pages)".";\n\
//            }\n\
//    }\n';
//        
//    }

    var formato = 
'   @page {\n\
        margin: '+tune.formatting.defaultMargin+'; size: '+tune.formatting.papersize+' ' + orientation + ';\n\
    }\n' ; //+ pgnumber;
    
    if( ! style ) {
        style = document.createElement('style');
        style.setAttribute( "id", "page_format" ); 
        document.head.appendChild(style);
    }
    
    style.innerHTML = formato;

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

