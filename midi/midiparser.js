/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - tratar endings sem marca de final ??
 *   - tratar endings em compassos com repeat bar
 *   - implementar: segno, coda, capo e fine
 *     Nota: aparentemente o ABC não implementa simbolos como D.S al fine
 *   OK - tratar notas longas - tanto quanto possível, as notas longas serão reiniciadas
 *        porém a qualidade não é boa pois o reinício é perceptível
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Parse = function( map, options  ) {
    this.map = map;
    this.gaita = map? map.gaita : null;
    this.options =  options || {};
    this.vars = { warnings: [] };
    this.scale = [0, 2, 4, 5, 7, 9, 11];
    
    this.wholeNote = 16;
    this.minNote = 1 / this.wholeNote;
    this.oneMinute = 60000;
    
    this.reset();
    
    this.addWarning = function(str) {
        this.vars.warnings.push(str);
    };
    
    this.getWarnings = function() {
        return this.vars.warnings;    
    };
};

ABCXJS.midi.Parse.prototype.reset = function() {
    
    this.vars.warnings = [];
    
    this.multiplier = 1;
    this.timecount = 0;
    this.alertedMin = false;
    this.repeating = false;
    this.skiping = false;
    this.next = null;
    this.visited = {};
    this.lastMark = {};       
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    
    this.startTieInterval = [];
    this.lastTabElem = [];
    this.baraccidentals = [];
    this.channel = -1;
    this.parsedElements = [];
    
    this.midiTune = { 
        tempo: this.oneMinute/ 640 // duração de cada intervalo em mili
       ,printer: null
       ,playlist: [] // nova strutura, usando 2 elementos de array por intervalo de tempo (um para ends e outro para starts) 
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

ABCXJS.midi.Parse.prototype.parse = function(tune) {
    
    var self = this;
    var currBar = 0;
    
    this.reset();

    this.abctune = tune;
    
    this.midiTune.map = this.map;
    this.midiTune.gaita = this.gaita;

    if ( tune.metaText && tune.metaText.tempo) {
        var bpm = tune.metaText.tempo.bpm || 80;
        var duration = tune.metaText.tempo.duration[0] || 0.25;
        this.midiTune.tempo = this.oneMinute / (bpm * duration * this.wholeNote);
    }

    //faz o parse dos elementos abcx 
    this.staffcount = 1; 
    for (this.staff = 0; this.staff < this.staffcount; this.staff++) {
        this.voicecount = 1;
        for (this.voice = 0; this.voice < this.voicecount; this.voice++) {
            this.startTrack();
            for (this.line = 0; this.line < this.abctune.lines.length; this.line++) {
                this.writeABCLine();
            }
            this.endTrack();
        }
    }
    
    //cria a playlist a partir dos elementos obtidos acima  
    this.parsedElements.forEach( function( item, time ) {
        if( item.end.pitches.length + item.end.abcelems.length + item.end.buttons.length > 0 ) {
            self.midiTune.playlist.push( {item: item.end, time: time, start: false } );
        }
        
        if( item.start.pitches.length + item.start.abcelems.length + item.start.buttons.length > 0 ) {
            if( item.start.barNumber && item.start.barNumber > currBar ) {
                currBar = item.start.barNumber;
                delete item.start.barNumber;
                self.midiTune.measures[currBar] = self.midiTune.playlist.length;
                self.midiTune.playlist.push( {item: item.start, time: time, barNumber: currBar, start: true } );
            } else {
                delete item.start.barNumber;
                self.midiTune.playlist.push( {item: item.start, time: time, start: true } );
            }
        }
    });
    
    tune.midi = this.midiTune;
    
    return this.midiTune;
};

ABCXJS.midi.Parse.prototype.writeABCLine = function() {
    
    if ( this.abctune.lines[this.line].staffs ) {
        this.staffcount = this.getLine().staffs.length;
        if( ! this.getStaff() ) return;
        this.voicecount = this.getStaff().voices.length;
        this.setKeySignature(this.getStaff().key);
        this.writeABCVoiceLine();
    }    
};

ABCXJS.midi.Parse.prototype.writeABCVoiceLine = function() {
    this.pos = 0;
    this.next = null;
    while (this.pos < this.getVoice().length) {
        this.writeABCElement(this.getElem());
        if (this.next) {
            this.line = this.next.line;
            this.staff = this.next.staff;
            this.voice = this.next.voice;
            this.pos = this.next.pos;
            this.next = null;
        } else {
            this.pos++;
        }
    }
};

ABCXJS.midi.Parse.prototype.writeABCElement = function(elem) {
    switch (elem.el_type) {
        case "note":
            if (this.getStaff().clef.type !== "accordionTab") {
              this.writeNote(elem);
            } else {
              this.selectButtons(elem);
            }
            break;
        case "key":
            this.setKeySignature(elem);
            break;
        case "bar":
            this.handleBar(elem);
            break;
        case "meter":
        case "clef":
            break;
        default:
    }
};

ABCXJS.midi.Parse.prototype.writeNote = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet === 2) ? 3 / 2 : (elem.startTriplet - 1) / elem.startTriplet;
    }

    var mididuration = this.checkMinNote(elem.duration * this.wholeNote * this.multiplier);

    var intervalo = { totalDur:0, elem:null, midipitch:null };
    
    if (elem.pitches) {
        var midipitch;
        for (var i = 0; i < elem.pitches.length; i++) {
            var note = elem.pitches[i];
            var pitch = note.pitch;
            if (note.accidental) {
              // change that pitch (not other octaves) for the rest of the bar
              this.baraccidentals[pitch] = this.getAccOffset(note.accidental);
            }

            midipitch = 60 + 12 * this.extractOctave(pitch) + this.scale[this.extractNote(pitch)];

            if (this.baraccidentals[pitch] !== undefined) {
                midipitch += this.baraccidentals[pitch];
            } else { // use normal accidentals
                midipitch += this.accidentals[this.extractNote(pitch)];
            }
            
            if (note.tie && note.tie.id_end) { // termina
                var startInterval = this.startTieInterval[midipitch][0];
                // elem será inserido - this.startNote(elem, this.timecount);
                if( note.tie.id_start ) { // se termina e recomeça, empilhe a nota
                    //TIES EM SERIE: PASSO 1 - empilha mais um intervalo
                    var mp = {channel:this.channel, midipitch:midipitch, mididuration:mididuration};
                    elem.openTies = elem.openTies? elem.openTies+1: 1;
                    intervalo = { totalDur:mididuration, elem:elem, midipitch:mp }; 
                    this.startTieInterval[midipitch].push(intervalo);
                }  else {
                    startInterval.elem.openTies --;
                    startInterval.totalDur += mididuration;
                    startInterval.midipitch.mididuration = startInterval.totalDur;
                    this.addEnd( this.timecount+mididuration, startInterval.midipitch, null, null );
                    
                    if( startInterval.elem.openTies === 0 ) {
                        delete startInterval.elem.openTies;
                        this.addEnd( this.timecount+mididuration, null, startInterval.elem, null );
                    } 
                    
                    //TIES EM SERIE: PASSO 2 - trar intervalos intermediários
                    for( var j = 1; j < this.startTieInterval[midipitch].length; j++ ) {
                        var interInter = this.startTieInterval[midipitch][j];
                        interInter.elem.openTies --;
                        interInter.totalDur += mididuration;
                        if( interInter.elem.openTies === 0 ) {
                            delete interInter.elem.openTies;
                            this.addEnd( this.timecount+mididuration, null, interInter.elem, null );
                        } 
                    }
                    
                    this.startTieInterval[midipitch] = [false];
                    
                }
            } else if (note.tie && note.tie.id_start ) { // só inicia
                var mp = {channel:this.channel, midipitch:midipitch, mididuration:mididuration};
                elem.openTies = elem.openTies? elem.openTies+1: 1;
                intervalo = { totalDur:mididuration, elem:elem, midipitch:mp }; 
                this.addStart( this.timecount, mp, null, null );
                this.startTieInterval[midipitch] = [intervalo];
            } else { // elemento sem tie
                if( this.startTieInterval[midipitch] && this.startTieInterval[midipitch][0] ) { 
                  // já está em tie - continua e elem será inserido abaixo
                } else { // o básico - inicia e termina a nota
                  var mp = {channel:this.channel, midipitch:midipitch, mididuration:mididuration};
                  intervalo = { totalDur:mididuration, elem:elem, midipitch:mp }; 
                  this.addStart( this.timecount, mp, null, null );
                  this.addEnd( this.timecount+mididuration, mp, null, null );
                }
            } 
        }
    }

    this.addStart( this.timecount, null, elem, null );
    if( ! elem.openTies ) {
        this.addEnd( this.timecount+mididuration, null, elem, null );
    }
    
    this.timecount += mididuration;

    if (elem.endTriplet) {
        this.multiplier = 1;
    }
};

ABCXJS.midi.Parse.prototype.checkMinNote = function(dur) {
    if( dur < 1 ) {
        dur = 1;
        if( !this.alertedMin ) {
            this.addWarning( 'Nota(s) com duração menor que o mínimo suportado: 1/' + this.wholeNote + '.');
            this.alertedMin = true;
        }    
    }
    
    return dur;
    
};

ABCXJS.midi.Parse.prototype.selectButtons = function(elem) {
    
    var mididuration = this.checkMinNote(elem.duration * this.wholeNote);
    
    
    if (elem.pitches) {
        
        var button;
        var bassCounter = 0; // gato para resolver o problema de agora ter um ou dois botões de baixos
        for (var i = 0; i < elem.pitches.length; i++) {
            var tie = false;
            if (elem.pitches[i].bass ) 
                bassCounter++;
            
            if (elem.pitches[i].type === "rest") 
                continue;
            
            if (elem.pitches[i].bass) {
                if (elem.pitches[i].c === '-->') {
                    button = this.lastTabElem[i];
                    tie = true;
                } else {
                    button = this.getBassButton(elem.bellows, elem.pitches[i].c);
                    this.lastTabElem[i] = button;
                }
            } else {
                if ( elem.pitches[i].c === '-->') {
                    button = this.lastTabElem[10+i-bassCounter];
                    tie = true;
                } else {
                    button = this.getButton(elem.pitches[i].c);
                    this.lastTabElem[10+i-bassCounter] = button;
                }
            }
            //if( ! tie ) {
                this.addStart( this.timecount, null, null, { button: button, closing: (elem.bellows === '+'), duration: elem.duration } );
                this.addEnd( this.timecount+mididuration, null, null, { button: button, closing: (elem.bellows === '+') } );
            //}    
        }
    }
    
    this.addStart( this.timecount, null, elem, null );
    this.addEnd( this.timecount+mididuration, null, elem, null );
    this.timecount += mididuration;
};

ABCXJS.midi.Parse.prototype.handleBar = function(elem) {
    this.baraccidentals = [];

    var skip       = (elem.startEnding) ? true : false;
    var repeat     = (elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat");
    var setrestart = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat" || 
                      elem.type === "bar_thick_thin" || elem.type === "bar_thin_thick" || 
                      elem.type === "bar_thin_thin" || elem.type === "bar_right_repeat");

    if ( this.isVisited() ) {
        if( ! this.repeating && this.getMarkString(this.lastMark) !== this.getMarkString() )
            this.next = this.lastMark;
    } else {
        if( this.repeating ) {
            this.repeating = false;
        } else {
            if( repeat || skip ) {
                this.setVisited();
            }
            if ( repeat ) {
                this.repeating = true;
                this.next = this.restart;
                this.lastMark = this.getMark();
                this.clearTies();
            }
            if ( setrestart ) {
                this.restart = this.getMark();
            }
        }
    }
};

ABCXJS.midi.Parse.prototype.clearTies = function() {
    var self = this;
    self.startTieInterval.forEach( function ( arr, index ) {
        if( !arr[0] ) return;
        arr[0].elem.openTies--;
        if(arr[0].elem.openTies>0) {
            self.addEnd( self.timecount, arr[0].midipitch, null, null ); 
        } else {
            self.addEnd( self.timecount, arr[0].midipitch, arr[0].elem, null ); 
            delete arr[0].elem.openTies;
        }   
        self.startTieInterval[index] = [false];
    });
};

ABCXJS.midi.Parse.prototype.setVisited = function() {
    this.visited[this.getMarkString()] = true;
};

ABCXJS.midi.Parse.prototype.isVisited = function() {
    return  this.visited[this.getMarkString()];
};

ABCXJS.midi.Parse.prototype.getParsedElement = function(time) {
    if( ! this.parsedElements[time] ) {
        this.parsedElements[time] = {
            start:{pitches:[], abcelems:[], buttons:[], barNumber: null}
            ,end:{pitches:[], abcelems:[], buttons:[]}
        };
    }
    return this.parsedElements[time];
};

ABCXJS.midi.Parse.prototype.addStart = function( time, midipitch, abcelem, button ) {
    var pE = this.getParsedElement(time);
    if( abcelem ) {
        pE.start.abcelems.push({abcelem:abcelem,channel:this.channel});
        if(this.staff === 0 && this.voice === 0 && abcelem.barNumber ) 
            pE.start.barNumber = pE.start.barNumber || abcelem.barNumber;
    }    
    if( midipitch ) pE.start.pitches.push(midipitch);
    if( button    ) pE.start.buttons.push({button:button,abcelem:abcelem});
};

ABCXJS.midi.Parse.prototype.addEnd = function( time, midipitch, abcelem, button ) {
    var pE = this.getParsedElement(time);
    if( abcelem   ) pE.end.abcelems.push({abcelem:abcelem});
    if( midipitch ) pE.end.pitches.push(midipitch);
    if( button    ) pE.end.buttons.push({button:button,abcelem:abcelem});
};

ABCXJS.midi.Parse.prototype.getMark = function() {
    return {line: this.line, staff: this.staff,
        voice: this.voice, pos: this.pos};
};

ABCXJS.midi.Parse.prototype.getMarkString = function(mark) {
    mark = mark || this;
    return "line" + mark.line + "staff" + mark.staff +
           "voice" + mark.voice + "pos" + mark.pos;
};

ABCXJS.midi.Parse.prototype.hasTablature = function() {
    return this.abctune.hasTablature;
};

ABCXJS.midi.Parse.prototype.getLine = function() {
    return this.abctune.lines[this.line];
};

ABCXJS.midi.Parse.prototype.getStaff = function() {
    return this.getLine().staffs[this.staff];
};

ABCXJS.midi.Parse.prototype.getVoice = function() {
    return this.getStaff().voices[this.voice];
};

ABCXJS.midi.Parse.prototype.getElem = function() {
    return this.getVoice()[this.pos];
};

ABCXJS.midi.Parse.prototype.startTrack = function() {
    this.channel ++;
    this.timecount = 0;
    this.playlistpos = 0;
};

ABCXJS.midi.Parse.prototype.endTrack = function() {
    // need to do anything?
};

ABCXJS.midi.Parse.prototype.getAccOffset = function(txtAcc) {
// a partir do nome do acidente, retorna o offset no modelo cromatico
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

ABCXJS.midi.Parse.prototype.setKeySignature = function(elem) {
    this.accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (this.abctune.formatting.bagpipes) {
        elem.accidentals = [{acc: 'natural', note: 'g'}, {acc: 'sharp', note: 'f'}, {acc: 'sharp', note: 'c'}];
    }
    if (!elem.accidentals)  return;
    
    window.ABCXJS.parse.each(elem.accidentals, function(acc) {
        var d = (acc.acc === "sharp") ? 1 : (acc.acc === "natural") ? 0 : -1;
        var lowercase = acc.note.toLowerCase();
        var note = this.extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
        this.accidentals[note] += d;
    }, this);

};

ABCXJS.midi.Parse.prototype.extractNote = function(pitch) {
    pitch = pitch % 7;
    return (pitch < 0)? pitch+7 : pitch;
};

ABCXJS.midi.Parse.prototype.extractOctave = function(pitch) {
    return Math.floor(pitch / 7);
};

ABCXJS.midi.Parse.prototype.getBassButton = function( bellows, b ) {
    if( b === '-->' || !this.gaita ) return null;
    var kb = this.gaita.keyboard;
    var nota = this.gaita.parseNote(b, true );
    for( var j = kb.length; j > kb.length - 2; j-- ) {
      for( var i = 0; i < kb[j-1].length; i++ ) {
          var tecla = kb[j-1][i];
          if(bellows === '+') {
            if(tecla.notaClose.key === nota.key ) return tecla.btn;
          } else {  
            if(tecla.notaOpen.key === nota.key ) return tecla.btn;
          }
      }   
    }
    return null;
};

ABCXJS.midi.Parse.prototype.getButton = function( b ) {
    if( b === 'x' || !this.gaita ) return null;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(this.gaita.keyboard[row][button]) 
        return this.gaita.keyboard[row][button].btn;
    return null;
};
