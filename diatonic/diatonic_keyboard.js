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
    this.pedalInfo = pedalInfo;
    this.layout = keyMap.layout;
    this.noteToButtonsOpen = {};
    this.noteToButtonsClose = {};
    this.legenda = {};
    
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

    this.keyboard = new Array();
    this.modifiedItems = new Array();

    // ilheiras da mao direita
    var maiorIlheira = 0;
    for (i = 0; i < nIlheiras; i++) {
        this.keyboard[i] = new Array(keyMap.keys.open[i].length);
        maiorIlheira = Math.max( keyMap.keys.open[i].length, maiorIlheira);
    }

    // ilheiras da mao esquerda
    var maiorIlheiraBaixo = keyMap.basses.open[0].length;
    for (i = nIlheiras; i < nIlheiras + nIlheirasBaixo; i++) {
        this.keyboard[i] = new Array(keyMap.basses.open[i - nIlheiras].length);
    }

    this.width = (nIlheiras + nIlheirasBaixo + 1) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSPACE*2;
    this.height = (maiorIlheira) * (this.BTNSIZE + this.BTNSPACE) + this.BTNSIZE/2;
    
    bassY = this.BTNSPACE * 4 + (((maiorIlheira - maiorIlheiraBaixo) / 2)) * (this.BTNSIZE + this.BTNSPACE);
    
    var openRow, closeRow, bass, noteName;
    
    for (var j = 0; j < this.keyboard.length; j++) {

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

        for (var i = 0; i < this.keyboard[j].length; i++) {

            y = yi + i * (this.BTNSIZE + this.BTNSPACE);

            this.keyboard[j][i] = {};

            this.keyboard[j][i].notaOpen = this.parseNote(openRow[i], bass);
            noteName = this.keyboard[j][i].notaOpen.key + (bass?'':this.keyboard[j][i].notaOpen.octave);
            if (!this.noteToButtonsOpen[ noteName ]) this.noteToButtonsOpen[ noteName ] = [];
            this.noteToButtonsOpen[ noteName ].push((i + 1) + Array(j + 1).join("'"));

            this.keyboard[j][i].notaClose = this.parseNote(closeRow[i], bass);
            noteName = this.keyboard[j][i].notaClose.key + (bass?'':this.keyboard[j][i].notaClose.octave);
            if (!this.noteToButtonsClose[ noteName ]) this.noteToButtonsClose[ noteName ] = [];
            this.noteToButtonsClose[ noteName ].push((i + 1) + Array(j + 1).join("'"));
            
            this.limits.minX = Math.min(this.limits.minX, x );
            this.limits.minY = Math.min(this.limits.minY, y );
            this.limits.maxX = Math.max(this.limits.maxX, x );
            this.limits.maxY = Math.max(this.limits.maxY, y );

            this.keyboard[j][i].btn = new DIATONIC.map.Button(x, y
                , this.keyboard[j][i].notaOpen.key + (this.keyboard[j][i].notaOpen.isMinor ? '-' : '')
                , this.keyboard[j][i].notaClose.key + (this.keyboard[j][i].notaClose.isMinor ? '-' : '')
                , {pedal: this.isPedal(i, j)}
            );
        }
    }
    // adiciona linha decorativa
    x = this.BTNSPACE + (nIlheiras+0.5) * (this.BTNSIZE + this.BTNSPACE);
    y = bassY - 0.5 * (this.BTNSIZE + this.BTNSPACE);
    this.baseLine = {x: x, yi:y, yf:y + 5 * (this.BTNSIZE + this.BTNSPACE)};
    
    // adiciona o botão de legenda - acertar textos de legenda
    this.legenda = new DIATONIC.map.Button(
             this.limits.maxX-30, this.limits.minY+30 , 'Abre', 'Fecha', //DR.getResource("DR_pull"), DR.getResource("DR_push"),
            {radius: 36, pedal: true, fontsize: 14, xLabel: 0, textAnchor: 'middle', color: '#828282'});

};

DIATONIC.map.Keyboard.prototype.print = function (paper, div, options ) {
    
    options = options || {};
    
    this.paper = paper;
    this.paper.clear();
    
    options.scale = options.scale || 1;
    options.mirror = options.mirror || false;
    options.transpose = options.transpose || false;
    
    this.legenda.draw(this.paper, this.limits, options);
    this.legenda.setOpen();
    this.legenda.setClose();
    
    if(options.transpose) {
        this.paper.setSize(this.height*options.scale,this.width*options.scale);
        div.style.height = this.width*options.scale + "px";
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
    
    for (var j = 0; j < this.keyboard.length; j++) {
        for (var i = 0; i < this.keyboard[j].length; i++) {
            this.keyboard[j][i].btn.draw(this.paper, this.limits, options );
        }
    }
    
//    if (this.renderedTune)
//        this.renderedTune.midi = this.map.editor.midiParser.parse(this.renderedTune.abc/*, this.songPrinter*/);
//    if (this.renderedPractice)
//        this.renderedPractice.midi = this.map.editor.midiParser.parse(this.renderedPractice.abc/*, this.practicePrinter*/);
//    if (this.renderedChord)
//        this.renderedChord.midi = this.map.editor.midiParser.parse(this.renderedChord.abc/*, this.chordPrinter*/);

};

DIATONIC.map.Keyboard.prototype.drawLine = function(xi,yi,xf,yf) {
    this.paper.path( ["M", xi, yi, "L", xf, yf ] )
            .attr({"fill": "none", "stroke": "black", "stroke-width": 1});
};

DIATONIC.map.Keyboard.prototype.getLayout = function (r) {
    return this.layout[r] || 0;
};

DIATONIC.map.Keyboard.prototype.isPedal = function (i,j) {
    return (this.pedalInfo[1]) === i && (this.pedalInfo[0]) === j;
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
      throw new Error( 'Nota inválida: ' + txtNota );
  };

  return this.setKeyLabel( nota );
};

DIATONIC.map.Keyboard.prototype.setKeyLabel = function(nota) {
  if( nota.isChord )  {
    nota.key = DIATONIC.map.number2key[nota.value ].toLowerCase() ;
  } else {
      if( this.showLabel) {
        nota.key = DIATONIC.map.number2key_br[nota.value ] ;
      } else {
        nota.key = DIATONIC.map.number2key[nota.value ];
      }
  }
  return nota;
};
