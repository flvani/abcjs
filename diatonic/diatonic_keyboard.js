/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Keyboard = function (keyMap, pedalInfo) {
    //this.showLabel = false;
    this.pedalInfo = pedalInfo;
    this.layout = keyMap.layout;
    this.keys = keyMap.keys;
    this.basses = keyMap.basses;
    this.noteToButtonsOpen = {};
    this.noteToButtonsClose = {};
    this.legenda = {};
    this.baseLine = {}; // linha decorativa
    
    this.limits = {minX:10000, minY:10000, maxX:0, maxY:0};
    
    this.BTNRADIUS = DIATONIC.map.Units.BTNRADIUS;
    this.BTNSIZE = DIATONIC.map.Units.BTNSIZE;
    this.BTNSPACE = DIATONIC.map.Units.BTNSPACE;
    this.FONTSIZE = DIATONIC.map.Units.FONTSIZE;
    
    this.setup(keyMap);
};

DIATONIC.map.Keyboard.prototype.setup = function (keyMap) {

    var x, y, yi, bassY;

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

    this.width = (nIlheiras + nIlheirasBaixo + 1) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSPACE*2;
    this.height = (maiorIlheira) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSIZE/2;
    
    bassY = this.BTNSPACE * 4 + (((maiorIlheira - maiorIlheiraBaixo) / 2)) * (this.BTNSIZE + this.BTNSPACE);
    
    var openRow, closeRow, bass, noteVal;
    
    for (var j = 0; j < this.keyMap.length; j++) {

        if (j < nIlheiras) {
            x = this.BTNSPACE + (j + 0.6) * (this.BTNSIZE + this.BTNSPACE);
            yi = (this.BTNSPACE * 4) + (this.getLayout(j) + 0.5) * (this.BTNSIZE + this.BTNSPACE);
            openRow = keyMap.keys.open[j];
            closeRow = keyMap.keys.close[j];
            bass = false;
        } else {
            x = this.BTNSPACE + (j + 1.4) * (this.BTNSIZE + this.BTNSPACE);
            yi = bassY + 0.5 * (this.BTNSIZE + this.BTNSPACE);
            openRow = keyMap.basses.open[j - nIlheiras];
            closeRow = keyMap.basses.close[j - nIlheiras];
            bass = true;
        }

        for (var i = 0; i < this.keyMap[j].length; i++) {

            y = yi + i * (this.BTNSIZE + this.BTNSPACE);
            
            this.limits.minX = Math.min(this.limits.minX, x );
            this.limits.minY = Math.min(this.limits.minY, y );
            this.limits.maxX = Math.max(this.limits.maxX, x );
            this.limits.maxY = Math.max(this.limits.maxY, y );

            var btn  = new DIATONIC.map.Button( x, y, {pedal: this.isPedal(i, j)} );
            
            btn.tabButton = (i + 1) + Array(j + 1).join("'");
            btn.openNote = this.parseNote(openRow[i], bass);
            btn.closeNote = this.parseNote(closeRow[i], bass);
            btn.setText( false );
            
            //noteName = btn.openNote.key + (bass?'':btn.openNote.octave);
            noteVal = this.getNoteVal(btn.openNote);
            if (!this.noteToButtonsOpen[ noteVal ]) this.noteToButtonsOpen[ noteVal ] = [];
            this.noteToButtonsOpen[ noteVal ].push(btn.tabButton);

            //noteName = btn.closeNote.key + (bass?'':btn.closeNote.octave);
            noteVal = this.getNoteVal(btn.closeNote);
            if (!this.noteToButtonsClose[ noteVal ]) this.noteToButtonsClose[ noteVal ] = [];
            this.noteToButtonsClose[ noteVal ].push(btn.tabButton);
            
            this.keyMap[j][i] = btn;
        }
    }
    // posiciona linha decorativa
    x = this.BTNSPACE + (nIlheiras+0.5) * (this.BTNSIZE + this.BTNSPACE);
    y = bassY - 0.5 * (this.BTNSIZE + this.BTNSPACE);
    this.baseLine = {x: x, yi:y, yf:y + 5 * (this.BTNSIZE + this.BTNSPACE)};
    
    // adiciona o botão de legenda - acertar textos de legenda
    // DR.getResource("DR_pull"), DR.getResource("DR_push"),
    this.legenda = new DIATONIC.map.Button( 
        this.limits.maxX-(this.BTNRADIUS + this.BTNSPACE), this.limits.minY+(this.BTNRADIUS + this.BTNSPACE), 
        {openLabel: 'Abre', closeLabel: 'Fecha', radius: 36, pedal: true, fontsize: 14, xLabel: 0, textAnchor: 'middle', color: '#828282'}
    );
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
    
    options = options || {};
    
    div.innerHTML = "";
    //this.sgv = new SVG.Printer(div, "100%", "100%");
    this.paper = new SVG.Printer(div, "100%", "100%"); //this.sgv.paper; //Raphael(div, "100%", "100%");
    
    options.scale = options.scale || 1;
    options.mirror = options.mirror || false;
    options.transpose = options.transpose || false;
    options.label = options.label|| false;
    
    this.legenda.draw(this.paper, this.limits, options);
    this.legenda.setOpen();
    this.legenda.setClose();
    
    if(options.transpose) {
        this.paper.setSize(this.height*options.scale,this.width*options.scale);
        div.style.height = (this.width+8)*options.scale + "px";
        div.style.width = this.height*options.scale + "px";
        var mirr = options.mirror ? this.baseLine.x : this.limits.maxX - (this.baseLine.x - this.limits.minX);
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(this.baseLine.yi*options.scale, x*options.scale, this.baseLine.yf*options.scale, x*options.scale);
        }
    } else {
        this.paper.setSize(this.width*options.scale, this.height*options.scale);
        div.style.height = this.height*options.scale + "px";
        div.style.width = this.width*options.scale + "px";
        var mirr = options.mirror ? this.limits.maxX - (this.baseLine.x - this.limits.minX) : this.baseLine.x;
        for (var x = mirr-10; x <= mirr+10; x+=10) {
            this.drawLine(x*options.scale, this.baseLine.yi*options.scale, x*options.scale, this.baseLine.yf*options.scale);
        }
    }
    
    for (var j = 0; j < this.keyMap.length; j++) {
        for (var i = 0; i < this.keyMap[j].length; i++) {
            this.keyMap[j][i].draw(this.paper, this.limits, options );
        }
    }
};

DIATONIC.map.Keyboard.prototype.drawLine = function(xi,yi,xf,yf) {
    this.paper.path( ["M", xi, yi, "L", xf, yf ] )
            .attr({"fill": "none", "stroke": "black", "stroke-width": 1});
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

//DIATONIC.map.Keyboard.prototype.changeNotation = function() {
//    this.showLabel = !this.showLabel;
//    this.redra();
//};

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


