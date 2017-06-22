/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};

ABCXJS.tablature.Accordion = function( params ) {
    
    this.selected     = -1;
    this.tabLines     = [];
    this.accordions   = params.accordionMaps || [] ;
    this.transposer   = new window.ABCXJS.parse.Transposer();
    
    if( this.accordions.length === 0 ) {
        throw new Error( 'No accordionMap found!');
    }
    
    for (var g = 0; g < this.accordions.length; g ++)
        this.accordions[g].keyboard.setRenderOptions(params.render_keyboard_opts);
    
    if( params.id )
        this.loadById( params.id );
    else
        this.load( 0 );
    
};

ABCXJS.tablature.Accordion.prototype.loadById = function (id) {
    for (var g = 0; g < this.accordions.length; g ++)
        if (this.accordions[g].id === id) {
            return this.load(g);
        }
        console.log( 'Accordion not found. Loading the first one.');
        return this.load(0);
};

ABCXJS.tablature.Accordion.prototype.load = function (sel) {
    this.selected = sel;
    this.loaded = this.accordions[this.selected];
    this.loadedKeyboard = this.loaded.keyboard;
    return this.loaded;
};

ABCXJS.tablature.Accordion.prototype.accordionExists = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id) ret  = true;
    }
    return ret;
};

ABCXJS.tablature.Accordion.prototype.accordionIsCurrent = function(id) {
    var ret = false;
    for(var a = 0; a < this.accordions.length; a++ ) {
        if( this.accordions[a].id === id && this.selected === a) ret = true;
    }
    return ret;
};

ABCXJS.tablature.Accordion.prototype.clearKeyboard = function(full) {
    this.loadedKeyboard.clear(full);
};

ABCXJS.tablature.Accordion.prototype.changeNotation = function() {
    var k = this.loadedKeyboard;
    k.render_opts.label = ! k.render_opts.label;
    k.redraw();
};

ABCXJS.tablature.Accordion.prototype.rotateKeyboard = function(div) {
    var o = this.loadedKeyboard.render_opts;
    
    if( o.transpose ) {
        o.mirror=!o.mirror;
    }
    o.transpose=!o.transpose;
    
    this.printKeyboard(div);
};

ABCXJS.tablature.Accordion.prototype.scaleKeyboard = function(div_id) {
    var k = this.loadedKeyboard;
    if( k.render_opts.scale < 1.2 ) {
        k.render_opts.scale += 0.2;
    } else {
        k.render_opts.scale = 0.8;
    }
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.layoutKeyboard = function( div_id, options ) {
    var k = this.loadedKeyboard;
    if(options.transpose!==undefined)
        k.render_opts.transpose = options.transpose;
    if(options.mirror!==undefined)
        k.render_opts.mirror = options.mirror;
    this.printKeyboard(div_id);
};

ABCXJS.tablature.Accordion.prototype.printKeyboard = function(div_id, options) {
    
    var k = this.loadedKeyboard;
    var div =( typeof(div_id) === "string" ? document.getElementById(div_id) : div_id );

    k.setRenderOptions(options);

    if( k.render_opts.show ) {
        div.style.display="inline-block";
        k.print(div);
    } else {
        div.style.display="none";
    }
};

ABCXJS.tablature.Accordion.prototype.getFullName = function () {
    return this.loaded.getFullName();
};

ABCXJS.tablature.Accordion.prototype.getTxtModel = function () {
    return this.loaded.getTxtModel();
};

ABCXJS.tablature.Accordion.prototype.getTxtNumButtons = function () {
    return this.loaded.getTxtNumButtons();
};

ABCXJS.tablature.Accordion.prototype.getTxtTuning = function () {
    return this.loaded.getTxtTuning();
};


ABCXJS.tablature.Accordion.prototype.getNoteName = function( item, keyAcc, barAcc, bass ) {
    
    // mapeia 
    //  de: nota da pauta + acidentes (tanto da clave, quanto locais)
    //  para: valor da nota cromatica (com oitava)

    var n = this.transposer.staffNoteToCromatic(this.transposer.extractStaffNote(item.pitch));
    var oitava = this.transposer.extractStaffOctave(item.pitch);
    var staffNote = this.transposer.numberToKey(n);
    
    if(item.accidental) {
        barAcc[item.pitch] = this.transposer.getAccOffset(item.accidental);
        n += barAcc[item.pitch];
    } else {
        if(typeof(barAcc[item.pitch]) !== "undefined") {
          n += barAcc[item.pitch];
        } else {
          n += this.transposer.getKeyAccOffset(staffNote, keyAcc);
        }
    }
    
    oitava   += (n < 0 ? -1 : (n > 11 ? 1 : 0 ));
    n         = (n < 0 ? 12+n : (n > 11 ? n%12 : n ) );
    
    var key   = this.transposer.numberToKey(n);
    var value = n;
    
    if (item.chord) key = key.toLowerCase();    
    
    return { key: key, octave:oitava, isBass:bass, isChord: item.chord, value:value };
};

ABCXJS.tablature.Accordion.prototype.inferTablature = function(tune, vars, addWarning ) {

    var inferer = new ABCXJS.tablature.Infer( this, tune, vars );
    
    vars.missingButtons = {};
    vars.invalidBasses = '';
    
    for (var t = 0; t < tune.lines.length; t++) {
       if (tune.lines[t].staffs ) {
          var voice = inferer.inferTabVoice( t );
          if (voice.length > 0) {
              tune.lines[t].staffs[tune.tabStaffPos].voices[0] = voice;
          }
       }  
    }
    
    if(vars.invalidBasses.length > 0){
        addWarning('Baixo incompatível com o movimento do fole no(s) compasso(s): ' + vars.invalidBasses.substring(1,vars.invalidBasses.length-1) + '.' ) ;
    }
    
    if(vars.missingButtons){
        for( var m in vars.missingButtons ) {
            addWarning('Nota "' + m + '" não disponível no(s) compasso(s): ' + vars.missingButtons[m].join(", ") + '.' ) ;
        }
    }
    
    delete vars.missingButtons;
    delete vars.invalidBasses;
   
    
};

ABCXJS.tablature.Accordion.prototype.parseTabVoice = function(str, vars ) {
    var p = new ABCXJS.tablature.Parse( this,  str, vars);
    return p.parseTabVoice();
};

ABCXJS.tablature.Accordion.prototype.setTabLine = function (line) {
    this.tabLines[this.tabLines.length] = line.trim();
};

ABCXJS.tablature.Accordion.prototype.updateEditor = function () {
    var ret = "\n";
    if(this.tabLines.length === 0) return "";
    for(var l = 0; l < this.tabLines.length; l ++ ) {
        if(this.tabLines[l].length>0){
            ret += this.tabLines[l]+"\n";
        }
    }
    this.tabLines = [];
    return ret;
};
