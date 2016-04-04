/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - implementar: segno, coda, capo e fine
 *     Nota: aparentemente o ABC não implementa simbolos como D.S al fine
 *   - Ok - imprimir endings somente no compasso onde ocorrem
 *   - Ok - tratar endings em compassos com repeat bar (tratar adequadamente endings/skippings)
 *   - Ok - tratar notas longas - tanto quganto possível, as notas longas serão reiniciadas
 *          porém a qualidade não é boa pois o reinício é perceptível
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Parse = function( options ) {
    options = options || {};
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
    
    this.vars = { warnings: [] };
    this.globalJumps = [];
    
    this.channel = -1;
    this.timecount = 0;
    this.playlistpos = 0;
    this.pass = 1;
    this.maxPass = 2;
    this.countBar = 0;
    this.currEnding = null;
    this.afterRepeatBlock = false;
    this.next = null;
    this.restarting = false;
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    this.startSegno = null;
    this.segnoUsed = false;
    
    this.multiplier = 1;
    this.alertedMin = false;
    
    this.startTieInterval = [];
    this.lastTabElem = [];
    this.baraccidentals = [];
    this.parsedElements = [];
    
    this.midiTune = { 
        tempo: this.oneMinute/640 // duração de cada intervalo em mili
       ,playlist: [] // nova strutura, usando 2 elementos de array por intervalo de tempo (um para ends e outro para starts) 
       ,measures: [] // marks the start time for each measure - used for learning mode playing
    }; 
};

ABCXJS.midi.Parse.prototype.parse = function(tune, keyboard) {
    
    var self = this;
    var currBar = 0; // marcador do compasso corrente - não conta os compassos repetidos por ritornellos
    
    this.reset();

    this.abctune = tune;
    
    this.transposeTab = 0;
    if(tune.hasTablature){
        this.transposeTab = tune.lines[0].staffs[tune.tabStaffPos].clef.transpose || 0;
    }
    
    this.midiTune.keyboard = keyboard;

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
            var pl = {item: null, time: time, start: true };
            if( item.start.barNumber ) {
                this.lastBar = null; // identifica o compasso onde os botões da tablatura não condizem com a partitura
                if( item.start.barNumber > currBar ) {
                    currBar = this.lastBar = item.start.barNumber;
                    self.midiTune.measures[currBar] = self.midiTune.playlist.length;
                }
                pl.barNumber = item.start.barNumber;
            } 
            delete item.start.barNumber;
            self.handleButtons(item.start.pitches, item.start.buttons );
            pl.item = item.start;
            self.midiTune.playlist.push( pl );
        }
    });
    
    
    tune.midi = this.midiTune;
    
    return this.midiTune;
};

ABCXJS.midi.Parse.prototype.handleButtons = function(pitches, buttons ) {
    var note, midipitch, key, pitch;
    var self = this;
    buttons.forEach( function( item ) {
        if(!item.button.button) {
            //console.log( 'ABCXJS.midi.Parse.prototype.handleButtons: botão não encontrado.');
            return;
        }
        if( item.button.closing )  {
            note = ABCXJS.parse.clone(item.button.button.closeNote);
        } else {
            note = ABCXJS.parse.clone(item.button.button.openNote);
        }
        if(note.isBass) {
            if(note.isChord){
                key = note.key.toUpperCase();
            } else{
                key = note.key;
            }
        } else {
            
            if( self.transposeTab ) {
                switch(self.transposeTab){
                    case 8: note.octave --; break;
                    case -8: note.octave ++; break;
                    default:
                        this.addWarning('Possível transpor a tablatura uma oitava acima ou abaixo +/-8. Ignorando transpose.') ;
                }
            }
            
            midipitch = 12 + 12 * note.octave + DIATONIC.map.key2number[ note.key ];
        }
        
        // TODO:  no caso dos baixos, quando houver o baixo e o acorde simultaneamente
        // preciso garantir que estou atribuindo o botão à nota certa, visto que  podem ter tempos diferentes
        // por hora, procuro a primeira nota que corresponda e não esteja com botão associado (! pitches[r].button)
        var hasBass=false, hasTreble=false;
        for( var r = 0; r < pitches.length; r ++ ) {
            if(note.isBass && pitches[r].midipitch.clef === 'bass') {
                pitch = pitches[r].midipitch.midipitch % 12;
                hasBass=true;
                if( pitch === DIATONIC.map.key2number[ key ] && ! pitches[r].button ){
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            } else if(!note.isBass && pitches[r].midipitch.clef !== 'bass') { 
                hasTreble=true;
                if( pitches[r].midipitch.midipitch === midipitch ) {
                    pitches[r].button = item.button;
                    item.button = null;
                    return;
                }
            }
        }
        if(this.lastBar && ((note.isBass && hasBass) || (!note.isBass && hasTreble /* flavio && this.lastBar */))) {
            self.addWarning( 'Compasso '+this.lastBar+': Botao '+item.button.button.tabButton+' ('+item.button.button.closeLabel+'/'+item.button.button.openLabel+') não corresponde a nenhuma nota em execução.');
        }    
    });
    
    
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
            if( this.skipping ) return;
            if (this.getStaff().clef.type !== "accordionTab") {
              this.writeNote(elem);
            } else {
              this.selectButtons(elem);
            }
            break;
        case "key":
            if( this.skipping ) return;
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

    //var mididuration = this.checkMinNote(parseFloat(Number(elem.duration * this.wholeNote * this.multiplier).toFixed(7)));
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
                    this.addEnd( this.timecount+mididuration, startInterval.midipitch, null/*, null*/ );
                    
                    if( startInterval.elem.openTies === 0 ) {
                        delete startInterval.elem.openTies;
                        this.addEnd( this.timecount+mididuration, null, startInterval.elem/*, null*/ );
                    } 
                    
                    //TIES EM SERIE: PASSO 2 - trar intervalos intermediários
                    for( var j = 1; j < this.startTieInterval[midipitch].length; j++ ) {
                        var interInter = this.startTieInterval[midipitch][j];
                        interInter.elem.openTies --;
                        interInter.totalDur += mididuration;
                        if( interInter.elem.openTies === 0 ) {
                            delete interInter.elem.openTies;
                            this.addEnd( this.timecount+mididuration, null, interInter.elem/*, null*/ );
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
                  this.addEnd( this.timecount+mididuration, mp, null/*, null*/ );
                }
            } 
        }
    }

    this.addStart( this.timecount, null, elem, null );
    if( ! elem.openTies ) {
        this.addEnd( this.timecount+mididuration, null, elem/*, null*/ );
    }
    
    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
};

ABCXJS.midi.Parse.prototype.setTimeCount = function(dur) {
    this.timecount += dur;
    // corrigir erro de arredondamento
    if( this.timecount%1.0 > 0.9999 ) {
        this.timecount = Math.round( this.timecount );
    }
};

ABCXJS.midi.Parse.prototype.checkMinNote = function(dur) {
    if( dur < 0.99 ) {
        dur = 1;
        if( !this.alertedMin ) {
            this.addWarning( 'Nota(s) com duração menor que o mínimo suportado: 1/' + this.wholeNote + '.');
            this.alertedMin = true;
        }    
    }
    
    return dur;
    
};

ABCXJS.midi.Parse.prototype.selectButtons = function(elem) {
    
    if (elem.startTriplet) {
        this.multiplier = (elem.startTriplet === 2) ? 3 / 2 : (elem.startTriplet - 1) / elem.startTriplet;
    }
    
    var mididuration = elem.duration * this.wholeNote * this.multiplier;
    
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
            if( ! tie ) {
                this.addStart( this.timecount, null, null, { button: button, closing: (elem.bellows === '+'), duration: elem.duration } );
                //this.addEnd( this.timecount+mididuration, null, null/*, { button: button, closing: (elem.bellows === '+') } */);
            }    
        }
    }
    
    this.addStart( this.timecount, null, elem, null );
    this.addEnd( this.timecount+mididuration, null, elem/*, null*/ );
    
    this.setTimeCount( mididuration );
    
    if (elem.endTriplet) {
        this.multiplier = 1;
    }
    
};

// Esta função é fundamental pois controla todo o fluxo de execução das notas do MIDI
ABCXJS.midi.Parse.prototype.handleBar = function (elem) {
    
    this.countBar++; // contagem das barras de compasso de uma linha, para auxiliar na execução de saltos como "segno".

   // bar_dbl_repeat só pode ser considerada repetição se não for encontrada após salto de repetição, caso em que será apenas, o ponto de restart.
    var repeat = (elem.type === "bar_right_repeat" || (elem.type === "bar_dbl_repeat" && !this.restarting));
    
    // todas estas barras indicam ponto de restart em caso de repetição
    var setrestart = (elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat" ||
                      elem.type === "bar_thick_thin" || elem.type === "bar_thin_thick" ||
                      elem.type === "bar_thin_thin" || elem.type === "bar_right_repeat");
              
    // salva o ponto prévio de restart (que pode ser modificado durante a interpreatação da barra corrente
    var restart_next = this.restart;

    //reset de váriaveis para o processamento das notas dentro do compasso
    this.baraccidentals = [];
    this.restarting = false;

   // este bloco trata os "endings" ou chaves de 1ª e  2ª vez  (ou chaves de finalização).
   // são importantes para determinar a quantidade de vezes que o bloco será repetido e quais compassos
   // devem ser ignorados em cada passada
   
   // encerra uma chave de finalização
    if (elem.endEnding) {
        this.currEnding = null;
    }

   // inicia uma chave de finalização e faz o parse da quantidade repetições necessarias
   // a chave de finalização imediatamente  após um bloco de repetição ter sido terminado será ignorada
   // e enquanto o bloco estiver sendo repetido, também
    if (elem.startEnding &&  !this.afterRepeatBlock &&  !repeat ) {
        var a = elem.startEnding.split('-');
        this.currEnding = {};
        this.currEnding.min = parseInt(a[0]);
        this.currEnding.max = a.length > 1 ? parseInt(a[1]) : this.currEnding.min;
        this.maxPass = Math.max(this.currEnding.max, 2);
    }

    //ignora notas em função da quantidade de vezes que o bloco foi repetido e o tipo de "ending"
    this.skipping = (this.currEnding !== null && (this.currEnding.min > this.pass || this.pass > this.currEnding.max));

    // marca um ponto de recomeço
    if (setrestart) {
        this.afterRepeatBlock = false;
        this.restart = this.getMark();
    }

    // verifica se deve encerrar a repetição do bloco
    if (repeat) {
        if (this.pass < this.maxPass) {
            this.pass++;
            this.next = restart_next;
            this.restarting = true;
            this.clearTies();
            return;
        } else {
            this.pass = 1;
            this.maxPass = 2;
            this.afterRepeatBlock = true;
        }
    }
    
/*
    Tratamento das decorações, especialmente o "segno", mas anda incompleto.
    Característica: apenas as decorações da primeira staff são consideradas e aplicadas a todas as outras
*/
    
    if ( this.staff === 0 )   {
        if (elem.decoration)  {
            for (var d = 0; d < elem.decoration.length; d++) {
                if (elem.decoration[d] === 'segno') {
                    if (this.startSegno !== null && !this.segnoUsed && this.getMarkString(this.startSegno) !== this.getMarkString()) {
                        this.globalJumps[this.countBar] = this.getMark();
                        this.next = this.startSegno;
                        this.segnoUsed = true;
                        //return;
                    } else if (this.startSegno === null ) {
                        this.startSegno = this.getMark();
                        this.globalJumps[this.countBar] = this.startSegno;
                    }
                }
            }
        }
    } else {
        if( this.globalJumps[this.countBar]) {
                if (this.startSegno !== null && !this.segnoUsed && this.getMarkString(this.startSegno) !== this.getMarkString()) {
                    this.next = this.startSegno;
                    this.segnoUsed = true;
                } else if (this.startSegno === null ) {
                    this.startSegno = this.getMark();
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
            self.addEnd( self.timecount, arr[0].midipitch, null/*, null*/ ); 
        } else {
            self.addEnd( self.timecount, arr[0].midipitch, arr[0].elem/*, null*/ ); 
            delete arr[0].elem.openTies;
        }   
        self.startTieInterval[index] = [false];
    });
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
    var delay = (time%1.0);
    time -= delay;
    
    var pE = this.getParsedElement(time);
    if( abcelem ) {
        pE.start.abcelems.push({abcelem:abcelem,channel:this.channel, delay:delay});
        if(this.staff === 0 && this.voice === 0 && abcelem.barNumber ) 
            pE.start.barNumber = pE.start.barNumber || abcelem.barNumber;
    }    
    if( midipitch ) {
        midipitch.clef = this.getStaff().clef.type;
        //midipitch.startDelay = delay;
        pE.start.pitches.push( {midipitch: midipitch, delay:delay} );
    }
    if( button) pE.start.buttons.push({button:button,abcelem:abcelem, delay:delay});
};

ABCXJS.midi.Parse.prototype.addEnd = function( time, midipitch, abcelem/*, button*/ ) {
    var delay = (time%1);
    time -= delay;
    var pE = this.getParsedElement(time);
    if( abcelem   ) pE.end.abcelems.push({abcelem:abcelem, delay:delay});
    if( midipitch ) pE.end.pitches.push({midipitch: midipitch, delay:delay});
    //if( button    ) pE.end.buttons.push({button:button,abcelem:abcelem, delay:delay});
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
    this.pass = 1;
    this.maxPass = 2;
    this.countBar = 0;
    this.currEnding = null;
    this.afterRepeatBlock = false;
    this.next = null;
    this.restarting = false;
    this.restart = {line: 0, staff: 0, voice: 0, pos: 0};
    this.startSegno = null;
    this.segnoUsed = false;
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
    if( b === '-->' || !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    var nota = kb.parseNote(b, true );
    for( var j = kb.keyMap.length; j > kb.keyMap.length - 2; j-- ) {
      for( var i = 0; i < kb.keyMap[j-1].length; i++ ) {
          var tecla = kb.keyMap[j-1][i];
          if(bellows === '+') {
            if(tecla.closeNote.key === nota.key ) return tecla;
          } else {  
            if(tecla.openNote.key === nota.key ) return tecla;
          }
      }   
    }
    return null;
};

ABCXJS.midi.Parse.prototype.getButton = function( b ) {
    if( b === 'x' || !this.midiTune.keyboard ) return null;
    var kb = this.midiTune.keyboard;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var button = b.substr(0, p) -1;
    var row = b.length - p;
    if(kb.keyMap[row][button]) 
        return kb.keyMap[row][button];
    return null;
};
