/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Keyboard = function ( keyMap, pedalInfo ) {
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

            var btn  = new DIATONIC.map.Button( x-this.radius, y-this.radius, {kls: this.isPedal(i, j)? 'bpedal' : 'button' } );
            
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
    var raio=36;
    this.legenda = new DIATONIC.map.Button( this.limits.maxX-(raio+this.radius), this.limits.minY+(raio), {radius: 36, kls: 'blegenda' } );
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
    return DIATONIC.map.key2number[note.key.toUpperCase()] + (note.isBass?(note.isChord?-12:0):note.octave*12);
};

DIATONIC.map.Keyboard.prototype.print = function (div, options ) {
    
    var sz;
    options = options || {};
    
    options.fillColor = options.fillColor || 'none';
    options.backgroundColor = options.backgroundColor || 'none';
    options.openColor = options.openColor || '#00ff00';
    options.closeColor = options.closeColor || '#00b2ee';
    options.scale = options.scale || 1;
    options.mirror = options.mirror || false;
    options.transpose = options.transpose || false;
    options.label = options.label|| false;
    
    var estilo = 
'   .bpedal,\n\
   .blegenda,\n\
    .button {\n\
        font-family: serif;\n\
        text-anchor: middle;\n\
        font-size: 16px;\n\
        font-weight: bold;\n\
    }\n\
    .normal {\n\
        fill: none;\n\
        stroke: black;\n\
        stroke-width: 1px;\n\
    }\n\
    .pedal {\n\
        fill: none;\n\
        stroke: red;\n\
        stroke-width: 2px;\n\
    }\n\
    .bopen {\n\
        fill: '+options.openColor+';\n\
    }\n\
    .bclose {\n\
        fill: '+options.closeColor+';\n\
    }\n\
    .nofill {\n\
        fill: none;\n\
    }\n\
    .blegenda {\n\
        font-weight: normal;\n\
        font-size: 13px;\n\
    }';

    this.paper = new SVG.Printer( div ); 
    
    this.paper.initDoc( 'keyb', 'Diatonic Map Keyboard', estilo, options );
    
    this.paper.initPage( options.scale );
    
    var legenda_opt = ABCXJS.parse.clone( options );
    legenda_opt.kls = 'blegenda';
    
    this.legenda.draw('l00', this.paper, this.limits, legenda_opt, true );
    
    if(options.transpose) {
        sz = {w:this.height, h:this.width};
        var mirr = options.mirror ? this.baseLine.x : this.limits.maxX - (this.baseLine.x - this.limits.minX);
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(this.baseLine.yi, x, this.baseLine.yf, x);
        }
    } else {
        sz = {w:this.width, h:this.height};
        var mirr = options.mirror ? this.limits.maxX - (this.baseLine.x - this.limits.minX) : this.baseLine.x;
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(x, this.baseLine.yi, x, this.baseLine.yf);
        }
    }
 
    var btn_opt = ABCXJS.parse.clone( options );
    btn_opt.kls = 'button';
    btn_opt.openColor = btn_opt.closeColor = 'none';
     
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].draw('b'+j+i, this.paper, this.limits, btn_opt, this.isPedal(i,j) );
        }
    }
    
    this.paper.endPage(sz);
    this.paper.endDoc();

    //binds SVG elements
    this.legenda.setSVG(options.label, 'Abre', 'Fecha');
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].setSVG(options.label); 
        }
    }
};

DIATONIC.map.Keyboard.prototype.drawLine = function(xi,yi,xf,yf) {
    this.paper.printLine(xi, yi, xf, yf );
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
  nota.value      = DIATONIC.map.key2number[ nota.key.toUpperCase() ];
  nota.isChord    = ( nota.key === nota.key.toLowerCase() );
  nota.isBass     = isBass;
  nota.isMinor    = nota.complement.substr(0,2).indexOf( 'm' ) >= 0;
  nota.isSetima   = nota.complement.substr(0,2).indexOf( '7' ) >= 0;
  
  if (typeof (nota.value) === "undefined" ) {
      // para debug veja this.abctune.lines[this.line].staffs[this.staff].voices[this.voice][this.pos]
      throw new Error( 'Nota inválida: ' + txtNota );
  };

  return nota;
};

DIATONIC.map.Keyboard.prototype.redraw = function(opts) {
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            var key = this.keyMap[j][i];
            key.setText( opts.label );
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
