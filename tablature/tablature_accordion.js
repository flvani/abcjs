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
    this.paper        = null;
    this.keyboardDiv  = null;
    this.accordions   = params.accordionMaps || [] ;
    
    if( this.accordions.length === 0 ) {
        throw new Error( 'No accordionMap found!');
    }
    
    this.render_keyboard_opts = params.render_keyboard_opts || {transpose:false, mirror: false, scale:1, draggable:false, show:false};

    if(params.keyboardDiv_id) {
        this.setKeyboardCanvas(params.keyboardDiv_id);
    }
    
    if( params.id )
        this.loadById( params.id );
    else
        this.load( 0 );
};

ABCXJS.tablature.Accordion.prototype.setKeyboardCanvas = function (div_id) {

    this.topDiv = document.getElementById(div_id);

    if(this.render_keyboard_opts.draggable) {
        
        this.topDiv.setAttribute( "style", 
                "display:none; position: fixed; top:100px; left:900px; width:0px; height:0px; z-index: 700;" +
                "background-color: #ffe; border-style: groove; border-color: #ffd;" ); 

        var self = this;

        var div = document.createElement("DIV");
        this.keyboardMenu = div;
        div.setAttribute("id", "keyboardMenu" ); 
        div.setAttribute("style", "top:0; width:100%; min-height:20px; background-color: black; color: white;"); 
        div.innerHTML = '<input id="rotateBtn" type="button"  value="Rotate" /><input id="scaleBtn" type="button" value="Scale" />&nbsp;&nbsp;<span>Key Map</span>';
        this.topDiv.appendChild( div );
        div = document.createElement("DIV");
        div.setAttribute("id", "keyboardData"); 
        div.setAttribute("style", "width:100%; height:100%;"); 
        this.definePaper(div);
        this.topDiv.appendChild( div );

        document.getElementById("rotateBtn").addEventListener("click", function() {
            self.rotateKeyboard();
        }, false);
        
        document.getElementById("scaleBtn").addEventListener("click", function() {
            self.scaleKeyboard();
        }, false);

        this.mouseUp = function () {
            window.removeEventListener('mousemove', self.divMove, true);
        };

        this.mouseDown = function (){
          window.addEventListener('mousemove', self.divMove, true);
        };

        this.divMove = function(e){
            this.keyboardDiv.style.position = "fixed";
            this.keyboardDiv.style.top = (e.movementY + this.keyboardDiv.offsetTop) + "px";
            this.keyboardDiv.style.left = (e.movementX + this.keyboardDiv.offsetLeft) + "px";              
        };

        this.keyboardMenu.addEventListener( 'mousedown', this.mouseDown, false);
        window.addEventListener('mouseup', this.mouseUp, false);
    } else {
        this.definePaper(this.topDiv);
    }
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
    this.printKeyboard();
    return this.accordions[this.selected];
};

ABCXJS.tablature.Accordion.prototype.getLoaded = function () {
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

ABCXJS.tablature.Accordion.prototype.changeNotation = function() {
    this.getLoaded().keyboard.changeNotation();
};

ABCXJS.tablature.Accordion.prototype.clearKeyboard = function(full) {
    this.getLoaded().keyboard.clear(full);
};

ABCXJS.tablature.Accordion.prototype.redrawKeyboard = function() {
    this.getLoaded().keyboard.redraw();
};

ABCXJS.tablature.Accordion.prototype.rotateKeyboard = function () {
    var o = this.render_keyboard_opts;
    
    if( o.transpose ) {
        o.mirror=!o.mirror;
    }
    o.transpose=!o.transpose;
    
    this.printKeyboard();
};

ABCXJS.tablature.Accordion.prototype.scaleKeyboard = function () {
    if( this.render_keyboard_opts.scale < 1.2 ) {
        this.render_keyboard_opts.scale += 0.2;
    } else {
        this.render_keyboard_opts.scale = 0.8;
    }
    this.printKeyboard();
};

ABCXJS.tablature.Accordion.prototype.layoutKeyboard = function(options) {
    if(options.transpose!==undefined)
        this.render_keyboard_opts.transpose = options.transpose;
    if(options.mirror!==undefined)
        this.render_keyboard_opts.mirror = options.mirror;
    this.printKeyboard();
};

ABCXJS.tablature.Accordion.prototype.printKeyboard = function() {
    if (this.keyboardDiv) {
        if( this.render_keyboard_opts.show ) {
            this.topDiv.style.display="inline-block";
            this.getLoaded().keyboard.print(this.paper, this.keyboardDiv, this.render_keyboard_opts);
            if (this.render_keyboard_opts.draggable) {
                this.topDiv.style.width = this.keyboardDiv.clientWidth + "px";
                this.topDiv.style.height = (this.keyboardDiv.clientHeight+20) + "px";
            }
        } else {
            this.topDiv.style.display="none";
        }
    }
};
        
ABCXJS.tablature.Accordion.prototype.getKeyboard = function () {
    return this.getLoaded().keyboard;
};

ABCXJS.tablature.Accordion.prototype.getName = function () {
    return this.getLoaded().getName();
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

ABCXJS.tablature.Accordion.prototype.getButtons = function (note) {
  return {
       open:this.getLoaded().keyboard.noteToButtonsOpen[note.isBass?note.key:note.key+note.octave]
      ,close:this.getLoaded().keyboard.noteToButtonsClose[note.isBass?note.key:note.key+note.octave]
  };    
};

ABCXJS.tablature.Accordion.prototype.inferTabVoice = function( line, tune, strTUne, vars ) {
    var i = new ABCXJS.tablature.Infer( this, tune, strTUne, vars );
    return i.inferTabVoice( line );

};

ABCXJS.tablature.Accordion.prototype.parseTabVoice = function(str, vars ) {
    var p = new ABCXJS.tablature.Parse(str, vars);
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

ABCXJS.tablature.Accordion.prototype.definePaper = function(div)  {
  this.keyboardDiv = div || this.keyboardDiv;
  if(!this.paper) {
     this.paper = Raphael(this.keyboardDiv, "100%", "100%");
  }  
};
