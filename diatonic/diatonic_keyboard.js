/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Keyboard = function ( keyMap, pedalInfo, options ) {
    
    this.render_opts = {};
    this.setRenderOptions( options, true );
    
    this.pedalInfo = pedalInfo;
    this.layout = keyMap.layout;
    this.keys = keyMap.keys;
    this.basses = keyMap.basses;
    this.noteToButtonsOpen = {};
    this.noteToButtonsClose = {};
    this.legenda = {};
    this.baseLine = {}; // linha decorativa
    
    this.limits = {minX:10000, minY:10000, maxX:0, maxY:0};
    
    this.radius = 26;
    this.size = this.radius * 2 + 4;
    
    this.setup(keyMap);
};

DIATONIC.map.Keyboard.prototype.setup = function (keyMap) {

    var x, y, yi;

    var nIlheiras = keyMap.keys.open.length;
    var nIlheirasBaixo = keyMap.basses.open.length;
    
    this.keyMap = new Array();
    this.modifiedItems = new Array();

    // ilheiras da mao direita
    var maiorIlheira = 0;
    for (i = 0; i < nIlheiras; i++) {
        this.keyMap[i] = new Array(keyMap.keys.open[i].length);
        maiorIlheira = Math.max( keyMap.keys.open[i].length, maiorIlheira);
    }

    // ilheiras da mao esquerda
    var maiorIlheiraBaixo = keyMap.basses.open[0].length;
    for (i = nIlheiras; i < nIlheiras + nIlheirasBaixo; i++) {
        this.keyMap[i] = new Array(keyMap.basses.open[i - nIlheiras].length);
    }

    this.width = (nIlheiras + nIlheirasBaixo + 1) * (this.size) +2;
    this.height = (maiorIlheira) * (this.size) +2;
    
    var bassY = (maiorIlheira - (maiorIlheiraBaixo/2) ) / 2 * this.size;
    var openRow, closeRow, bass, noteVal;
    
    for (var j = 0; j < this.keyMap.length; j++) {

        if (j < nIlheiras) {
            x = (j + 0.5) * (this.size);
            yi = this.getLayout(j) * this.size;
            openRow = keyMap.keys.open[j];
            closeRow = keyMap.keys.close[j];
            bass = false;
        } else {
            x = (j + 1.5) * (this.size);
            yi = bassY;
            openRow = keyMap.basses.open[j - nIlheiras];
            closeRow = keyMap.basses.close[j - nIlheiras];
            bass = true;
        }

        for (var i = 0; i < this.keyMap[j].length; i++) {

            y = yi + (i+0.5) * this.size;
            
            this.limits.minX = Math.min(this.limits.minX, x );
            this.limits.minY = Math.min(this.limits.minY, y );
            this.limits.maxX = Math.max(this.limits.maxX, x );
            this.limits.maxY = Math.max(this.limits.maxY, y );

            var btn = new DIATONIC.map.Button( this, x-this.radius, y-this.radius, { radius: this.radius, isPedal: this.isPedal(i,j) } );
            
            btn.tabButton = (i + 1) + Array(j + 1).join("'");
            btn.openNote = this.parseNote(openRow[i], bass);
            btn.closeNote = this.parseNote(closeRow[i], bass);
            
            noteVal = this.getNoteVal(btn.openNote);
            if (!this.noteToButtonsOpen[ noteVal ]) this.noteToButtonsOpen[ noteVal ] = [];
            this.noteToButtonsOpen[ noteVal ].push(btn.tabButton);

            noteVal = this.getNoteVal(btn.closeNote);
            if (!this.noteToButtonsClose[ noteVal ]) this.noteToButtonsClose[ noteVal ] = [];
            this.noteToButtonsClose[ noteVal ].push(btn.tabButton);
            
            
            this.keyMap[j][i] = btn;
        }
    }
    // posiciona linha decorativa
    x = (nIlheiras+0.5) * (this.size);
    y = bassY - 0.5 * this.size;
    this.baseLine = {x: x, yi:y, yf:y + 5 * this.size};
    
    // adiciona o botão de legenda
    var raio=40;
    this.legenda = new DIATONIC.map.Button( this, this.limits.maxX-(raio+this.radius), this.limits.minY+raio, { radius: raio, borderWidth: 2 } );
};

DIATONIC.map.Keyboard.prototype.setRenderOptions = function ( options, force ) {
    
    var opt = options || {};

    this.render_opts.transpose = opt.transpose || (force? false : this.render_opts.transpose );
    this.render_opts.mirror = opt.mirror || (force? false : this.render_opts.mirror );
    this.render_opts.scale = opt.scale || (force? 1 : this.render_opts.scale );
    this.render_opts.draggable = opt.draggable || (force? false : this.render_opts.draggable );
    this.render_opts.show = opt.show || (force? false : this.render_opts.show );
    this.render_opts.label = opt.label || (force? false : this.render_opts.label );

    this.render_opts.fillColor = opt.fillColor || ( force? 'none' : this.render_opts.fillColor );
    this.render_opts.backgroundColor = opt.backgroundColor || ( force? 'none' : this.render_opts.backgroundColor );
    this.render_opts.openColor = opt.openColor || ( force? '#00ff00' : this.render_opts.openColor );
    this.render_opts.closeColor = opt.closeColor || ( force? '#00b2ee' : this.render_opts.closeColor ); 
    
};

DIATONIC.map.Keyboard.prototype.print = function ( div  ) {
    
    var sz;
    
    var estilo = 
'   .keyboardPane {\n\
        padding:4px;\n\
        background-color:none;\n\
    }\n\
    .blegenda,\n\
    .button {\n\
        font-family: serif;\n\
        text-anchor: middle;\n\
        font-size: 16px;\n\
        font-weight: bold;\n\
    }\n\
    .blegenda {\n\
        font-weight: normal;\n\
        font-size: 13px;\n\
    }';

    var keyboardPane = document.createElement("div");
    keyboardPane.setAttribute( "class", 'keyboardPane' );
    div.innerHTML = "";
    div.appendChild(keyboardPane);
    
    this.paper = new SVG.Printer( keyboardPane ); 
    this.paper.initDoc( 'keyb', 'Diatonic Map Keyboard', estilo, this.render_opts );
    this.paper.initPage( this.render_opts.scale );
    
    var legenda_opt = ABCXJS.parse.clone( this.render_opts );
    legenda_opt.kls = 'blegenda';
    
    this.legenda.draw('l00', this.paper, this.limits, legenda_opt );
    
    if(this.render_opts.transpose) {
        sz = {w:this.height, h:this.width};
        var mirr = this.render_opts.mirror ? this.baseLine.x : this.limits.maxX - (this.baseLine.x - this.limits.minX);
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(this.baseLine.yi, x, this.baseLine.yf, x);
        }
    } else {
        sz = {w:this.width, h:this.height};
        var mirr = this.render_opts.mirror ? this.limits.maxX - (this.baseLine.x - this.limits.minX) : this.baseLine.x;
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(x, this.baseLine.yi, x, this.baseLine.yf);
        }
    }
 
    var btn_opt = ABCXJS.parse.clone( this.render_opts );
    btn_opt.kls = 'button';
     
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].draw('b'+j+i, this.paper, this.limits, btn_opt );
        }
    }
    
    this.paper.endPage(sz);
    this.paper.endDoc();

    //binds SVG elements
    this.legenda.setSVG(this.render_opts.label, 'Abre', 'Fecha');
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].setSVG(this.render_opts.label); 
        }
    }
};

DIATONIC.map.Keyboard.prototype.drawLine = function(xi,yi,xf,yf) {
    this.paper.printLine(xi, yi, xf, yf );
};


DIATONIC.map.Keyboard.prototype.getButtons = function (note) {
    var noteVal = this.getNoteVal(note);
    return {
        open: this.noteToButtonsOpen[noteVal]
        , close: this.noteToButtonsClose[noteVal]
    };
};

DIATONIC.map.Keyboard.prototype.getNoteVal = function ( note ) {
    //noteVal will be a numeric product of the key + octave (to avoid #/b problem)
    return ABCXJS.parse.key2number[note.key.toUpperCase()] + (note.isBass?(note.isChord?-12:0):note.octave*12);
};

DIATONIC.map.Keyboard.prototype.getLayout = function (r) {
    return this.layout[r] || 0;
};

DIATONIC.map.Keyboard.prototype.isPedal = function (i,j) {
    return (this.pedalInfo[1] === (i+1)) && (this.pedalInfo[0] === (j+1));
};

DIATONIC.map.Keyboard.prototype.parseNote = function(txtNota, isBass) {

  var nota = {};
  var s = txtNota.split(":");
  var k = s[0].charAt(s[0].length-1);
  
  nota.key        = parseInt(k) ? s[0].replace( k, '' ) : s[0];
  nota.octave     = parseInt(k) ? parseInt(k) : 4;
  nota.complement = s[1] ? s[1] : "";
  nota.value      = ABCXJS.parse.key2number[ nota.key.toUpperCase() ];
  nota.isChord    = ( nota.key === nota.key.toLowerCase() );
  nota.isBass     = isBass;
  nota.isMinor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;
  
//  if( nota.key.indexOf( '♯' ) >= 0 || nota.key.indexOf( '♭' ) >= 0 ) {
//      if(nota.key.indexOf( '♯' ) >= 0) {
//            window.ABCXJS.parse.number2key[nota.value] = window.ABCXJS.parse.number2keysharp[nota.value];
//            window.ABCXJS.parse.number2key_br[nota.value] = window.ABCXJS.parse.number2keysharp_br[nota.value];
//      } else {
//            window.ABCXJS.parse.number2key[nota.value] = window.ABCXJS.parse.number2keyflat[nota.value];
//            window.ABCXJS.parse.number2key_br[nota.value] = window.ABCXJS.parse.number2keyflat_br[nota.value];
//      }
//  }
  
  if (typeof (nota.value) === "undefined" ) {
      // para debug veja this.abctune.lines[this.line].staffs[this.staff].voices[this.voice][this.pos]
      throw new Error( 'Nota inválida: ' + txtNota );
  };

  return nota;
};

DIATONIC.map.Keyboard.prototype.redraw = function() {
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].setText( this.render_opts.label );
        }
    }
};

DIATONIC.map.Keyboard.prototype.clear = function (full) {
    full = true; // modificação em andamento
    if (full) {
        for (var j = 0; j < this.keyMap.length; j++) {
            for (var i = 0; i < this.keyMap[j].length; i++) {
                this.keyMap[j][i].clear();
            }
        }
    } else {
        for (var i = 0; i < this.modifiedItems.length; i++) {
            this.modifiedItems[i].clear();
        }
    }
    this.modifiedItems = new Array();
};
