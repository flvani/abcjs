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
    
    this.transposer   = new window.ABCXJS.parse.Transposer();
    this.selected     = -1;
    this.tabLines     = [];
    this.accordions   = params.accordionMaps || [] ;
    
    if( this.accordions.length === 0 ) {
        throw new Error( 'No accordionMap found!');
    }
    
    this.render_keyboard_opts = params.render_keyboard_opts || {transpose:false, mirror: false, scale:1, draggable:false, show:false, label:false};

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
    return this.accordions[this.selected];
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
        if( this.accordions[a].id === id && this.selected === a) ret  = true;
    }
    return ret;
};

ABCXJS.tablature.Accordion.prototype.clearKeyboard = function(full) {
    this.accordions[this.selected].keyboard.clear(full);
};

ABCXJS.tablature.Accordion.prototype.changeNotation = function() {
    this.render_keyboard_opts.label = ! this.render_keyboard_opts.label;
    this.redrawKeyboard();
};

ABCXJS.tablature.Accordion.prototype.redrawKeyboard = function() {
    this.getKeyboard().redraw(this.render_keyboard_opts);
};

ABCXJS.tablature.Accordion.prototype.rotateKeyboard = function(div) {
    var o = this.render_keyboard_opts;
    
    if( o.transpose ) {
        o.mirror=!o.mirror;
    }
    o.transpose=!o.transpose;
    
    this.printKeyboard(div);
};

ABCXJS.tablature.Accordion.prototype.scaleKeyboard = function(div) {
    if( this.render_keyboard_opts.scale < 1.2 ) {
        this.render_keyboard_opts.scale += 0.2;
    } else {
        this.render_keyboard_opts.scale = 0.8;
    }
    this.printKeyboard(div);
};

ABCXJS.tablature.Accordion.prototype.layoutKeyboard = function(options, div) {
    if(options.transpose!==undefined)
        this.render_keyboard_opts.transpose = options.transpose;
    if(options.mirror!==undefined)
        this.render_keyboard_opts.mirror = options.mirror;
    this.printKeyboard(div);
};

ABCXJS.tablature.Accordion.prototype.printKeyboard = function(div_id, options) {
    
    var div =( typeof(div_id) === "string" ? document.getElementById(div_id) : div_id );

    options = options || {};
    
    this.render_keyboard_opts.fillColor = options.fillColor || this.render_keyboard_opts.fillColor;
    this.render_keyboard_opts.backgroundColor = options.backgroundColor || this.render_keyboard_opts.backgroundColor;
    this.render_keyboard_opts.openColor = options.openColor || this.render_keyboard_opts.openColor;
    this.render_keyboard_opts.closeColor = options.closeColor || this.render_keyboard_opts.closeColor;
    

    if( this.render_keyboard_opts.show ) {
        div.style.display="inline-block";
        this.getKeyboard().print(div, this.render_keyboard_opts);
    } else {
        div.style.display="none";
    }
};
        
ABCXJS.tablature.Accordion.prototype.getKeyboard = function () {
    return this.accordions[this.selected].keyboard;
};

ABCXJS.tablature.Accordion.prototype.getFullName = function () {
    return this.accordions[this.selected].getFullName();
};

ABCXJS.tablature.Accordion.prototype.getTxtModel = function () {
    return this.accordions[this.selected].getTxtModel();
};

ABCXJS.tablature.Accordion.prototype.getTxtNumButtons = function () {
    return this.accordions[this.selected].getTxtNumButtons();
};

ABCXJS.tablature.Accordion.prototype.getTxtTuning = function () {
    return this.accordions[this.selected].getTxtTuning();
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
    
    for (var t = 0; t < tune.lines.length; t++) {
       if (tune.lines[t].staffs ) {
          var voice = inferer.inferTabVoice( t );
          if (voice.length > 0) {
              tune.lines[t].staffs[tune.tabStaffPos].voices[0] = voice;
          }
       }  
    }
    
    if(vars.missingButtons){
        for( var m in vars.missingButtons ) {
            addWarning('Nota "' + m + '" não disponível no(s) compasso(s): ' + vars.missingButtons[m].join(", ") + '.' ) ;
        }
    }
    
    delete vars.missingButtons;
   
    
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
