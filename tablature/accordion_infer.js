/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - Bug quando ligaduras de expressão estão presentes
 *   - Tratar inversões de fole e inTie (+/-)
 *   - Verificar currInterval e suas implicações quando se está no último compasso
 *   - Tratar adequadamente os acordes de baixo
 *   - OK inverter o movimento do fole baseado no tempo do compasso
 *   - OK tratar ligaduras de expressão (como se fossem ligaduras de articulacao)
 *   - OK acertar a posição dos elementos de pausa (quando presentes na tablatura)
 *   - OK garantir que não ocorra erro quando as pausas não forem incluídas na tablatura, mas a pausa é a única nota do intervalo.
 *
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.tablature)
	window.ABCXJS.tablature = {};
    
ABCXJS.tablature.Infer = function( accordion, tune, strTune, vars ) {
    this.accordion = accordion;
    this.abcText = strTune;
    this.vars = vars || {} ;
    this.tune = tune;
    this.offset = 8.9;
    this.reset();
    
    this.addWarning = function(str) {
        if (!this.vars.warnings) this.vars.warnings = [];
        this.vars.warnings.push(str);
    };
};

ABCXJS.tablature.Infer.prototype.reset = function() {
    this.tuneCurrLine = 0;
    this.voice = [];
    this.bassBarAcc = [];
    this.trebBarAcc = [];
    this.producedLine = "";
    this.count = 0;
    this.lastButton = -1;
    this.closing = true;
    this.currInterval = 0;
    
    // limite para inversão o movimento do fole - baseado no tempo de um compasso
    if( this.tune.lines &&
        this.tune.lines[0].staffs &&      
        this.tune.lines[0].staffs[0].meter.type === 'specified' ) {
        var ritmo = this.tune.lines[0].staffs[0].meter.value[0];
        this.limit = ritmo.num / ritmo.den;
    } else {
      this.limit = 1; 
    }
};

ABCXJS.tablature.Infer.prototype.inferTabVoice = function(line) {
    
    if( this.tune.tabStaffPos < 1 || ! this.tune.lines[line].staffs ) 
        return; // we expect to find at least the melody line above tablature, otherwise, we cannot infer it.
    
    this.reset();
    this.tuneCurrLine = line;
    
    var voices = [];
     
    var trebStaff  = this.tune.lines[this.tuneCurrLine].staffs[0];
    var trebVoices = trebStaff.voices;
    this.accTrebKey = trebStaff.key.accidentals;
    for( var i = 0; i < trebVoices.length; i ++ ) {
        voices.push( { voz:trebVoices[i], pos:-1, st:'waiting for data', bass:false, wi: {}, ties:[], slurs:[] } ); // wi - work item
    }
    
    if( this.tune.tabStaffPos === 2 ) {
        var bassStaff  = this.tune.lines[this.tuneCurrLine].staffs[1];
        if(bassStaff) { 
            var bassVoices = bassStaff.voices;
            this.accBassKey = bassStaff.key.accidentals;
            for( var i = 0; i < bassVoices.length; i ++ ) {
                voices.push({ voz:bassVoices[i], pos:-1, st:'waiting for data', bass:true, wi: {}, ties:[], slurs:[] } ); // wi - work item
            }
        } else {
            this.addWarning('Possível falta da definição da linha de baixos.') ;
        }
    }  
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    while( st > 0 ) {
        
        st = 0; // 0 para garantir a saida, caso não haja nada para ler

        for( var j = 0; j < voices.length; j ++ ) {
            st = Math.max(this.read( voices, j ), st);
        }

        for( var j = 0; j < voices.length-1; j ++ ) {
            if( voices[j].st !== voices[j+1].st ) {
                var n = parseInt(this.currInterval);
                this.addWarning('Possível falta de sincronismo no compasso ' + n + '.' ) ;
                j = voices.length;
            }
        }

        switch(st){
            case 1: // incluir a barra na tablatura
                // neste caso, todas as vozes são "bar", mesmo que algumas já terminaram 
                var i = 0;
                while ( i < voices.length) {
                    if(voices[i].wi.el_type && voices[i].wi.el_type === "bar" )     {
                        this.addTABChild(ABCXJS.parse.clone(voices[i].wi));
                        i = voices.length;
                    } else {
                        i++;
                    }
                }

                for( var i = 0; i < voices.length; i ++ ) {
                    if(voices[i].st !== 'closed')
                      voices[i].st = 'waiting for data';
                }
                this.bassBarAcc = [];
                this.trebBarAcc = [];

                break;
            case 2:
                this.addTABChild(this.extraiIntervalo(voices));
                break;
        }
    } 
    
    this.accordion.setTabLine(this.producedLine);
    
    return this.voice;
};

ABCXJS.tablature.Infer.prototype.read = function(p_source, item) {
    var source = p_source[item];
    switch( source.st ) {
        case "waiting for data":
            source.pos ++;
            break;
        case "waiting end of interval":
            return 1;
            break;
        case "closed":
            return 0;
            break;
        case "processing":
            return 2;
            break;
               
    }
    
    while( source.voz[source.pos] &&  source.pos < source.voz.length 
            && (source.voz[source.pos].direction || source.voz[source.pos].title) ) {
       source.pos ++;
    }
    
    if( source.pos < source.voz.length ) {
        source.wi = ABCXJS.parse.clone(source.voz[source.pos]);
        if( source.wi.barNumber && source.wi.barNumber !== this.currInterval ) {
            this.currInterval = source.wi.barNumber;
        }
        this.checkTies(source);
        source.st = (source.wi.el_type && source.wi.el_type === "bar") ? "waiting end of interval" : "processing";
        return (source.wi.el_type && source.wi.el_type === "bar") ? 1 : 2;
    } else {
        source.st = "closed";
        return 0;
    }
       
};

ABCXJS.tablature.Infer.prototype.extraiIntervalo = function(voices) {
    var minDur = 100;
    
    for( var i = 0; i < voices.length; i ++ ) {
        if( voices[i].st === 'processing' && voices[i].wi.duration && voices[i].wi.duration > 0  && voices[i].wi.duration < minDur ) {
            minDur = voices[i].wi.duration;
        }
    }
    
    var wf = { el_type: 'note', duration: minDur, startChar: 0, endChar: 0, pitches:[], bassNote: [] }; // wf - final working item
    
    for( var i = 0; i < voices.length; i ++ ) {
        if(voices[i].st !== 'processing' ) continue;
        var elem = voices[i].wi;
        if( elem.rest ) {
            switch (elem.rest.type) {
                case "rest":
                    if( voices[i].bass ) 
                        wf.bassNote[wf.bassNote.length] = ABCXJS.parse.clone(elem.rest);
                    else    
                        wf.pitches[wf.pitches.length] = ABCXJS.parse.clone(elem.rest);
                    break;
                case "invisible":
                case "spacer":
                    break;
            }        
        }else if( elem.pitches ) {
            ABCXJS.write.sortPitch(elem.pitches);
            if( voices[i].bass ) {
                //todo: tratar adequadamente os acordes
                var isChord = elem.pitches.length>1;
                elem.pitches.splice(1, elem.pitches.length - 1);
                elem.pitches[0].chord=isChord;
                wf.bassNote[wf.bassNote.length] = ABCXJS.parse.clone(elem.pitches[0]);
            } else {
                for( var j = 0; j < elem.pitches.length; j ++  ) {
                    wf.pitches[wf.pitches.length] = ABCXJS.parse.clone(elem.pitches[j]);
                }
            }
        }
        
        this.setTies(voices[i]);
        
        if( voices[i].wi.duration ) {
            voices[i].wi.duration -= minDur;
            if( voices[i].wi.duration <= 0 ) {
               voices[i].st = 'waiting for data';
            } else {
                if(voices[i].wi.pitches) {
                    for( var j = 0; j < voices[i].wi.pitches.length; j ++  ) {
                        voices[i].wi.pitches[j].inTie = true;
                    }
                }
            }
        }
    }
    
    //trata intervalo vazio (quando há pausa em todas as vozes e não são visíveis)
    if(wf.pitches.length === 0 && wf.bassNote.length === 0 )
        wf.pitches[0] = {type:'rest'}; 
    
    return wf;
    
};

ABCXJS.tablature.Infer.prototype.setTies = function(voice) {
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            if( voice.wi.pitches[j].tie ) {
                if(voice.wi.pitches[j].tie.id_end){
                    voice.ties[voice.wi.pitches[j].tie.id_end] = false;
                }
                if(voice.wi.pitches[j].tie.id_start){
                    voice.ties[voice.wi.pitches[j].tie.id_start] = 100+voice.wi.pitches[j].pitch;
                }
            }
        }
    }
};

ABCXJS.tablature.Infer.prototype.checkTies = function(voice) {
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var i = 1; i < voice.ties.length; i ++ ) {
            var found = false;
            for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
                found = found || (100+voice.wi.pitches[j].pitch === voice.ties[i]);
            }      
            if(!found && voice.ties[i] ) {
                voice.wi.pitches.push({pitch: voice.ties[i], verticalPos: voice.ties[i], inTie:true});
            }    
        }
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            if(voice.wi.pitches[j].tie){
                if(voice.wi.pitches[j].tie.id_end) {
                    voice.wi.pitches[j].inTie = true;
                } 
            }      
        }       
    }    
};

ABCXJS.tablature.Infer.prototype.addTABChild = function(token) {

    if (token.el_type !== "note") {
        var xi = this.getXi();
        var xf = this.registerLine(this.abcText.substr(token.startChar, token.endChar - token.startChar) + " ");
        this.add(token, xi, xf - 1 );
        return;
    }
    
    var child = {
         el_type: token.el_type 
        ,startChar: 0
        ,endChar: 0
        ,pitches: []
        ,duration: token.duration
        ,bellows: ""
    };

    var bass = token.bassNote.length>0;
    var column = token.pitches;
    var allOpen = true;
    var allClose = true;
    var baixoClose = true;
    var baixoOpen = true;
    var inTie = false;

    var qtd = column.length;
    
    // inicialmente as notas estão na posição "fechando". Se precisar alterar para "abrindo" este é offset da altura
    var offset = (qtd>=3?-(this.offset-(2.8*(qtd-2))):-this.offset);

    var pitchBase = 18;
    var tt = "tabText";

    if(token.bassNote.length>1) {
       pitchBase = 21.3;
       tt = "tabText2";
       ABCXJS.write.sortPitch(token.bassNote);
    }
    
    for (var b = 0; b < token.bassNote.length; ++b) {
        inTie = (token.bassNote.inTie|| inTie);
        switch(token.bassNote[b].type) {
            case 'rest':
            case 'invisible':
            case 'spacer':
                child.pitches[b] = {bass: true, type: token.bassNote[b].type, c: '', pitch: 0.7 + pitchBase - (b * 3)};
                this.registerLine('z');
                break;
            default:
                child.pitches[b] = this.getBassNote(token.bassNote[b], tt, pitchBase - (b * 3) - 0.5);
                this.registerLine(child.pitches[b].c === '-->' ? '>' : child.pitches[b].c);
                baixoOpen  = baixoOpen  ? typeof (child.pitches[b].buttons.open) !== "undefined" : false;
                baixoClose = baixoClose ? typeof (child.pitches[b].buttons.close) !== "undefined" : false;
        }
    }


    var xi = this.getXi();
    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        inTie = (item.inTie || inTie);
        switch(item.type) {
            case 'invisible':
            case 'spacer':
            case 'rest':
                item.c = '';
                item.pitch = 13.2;
                break
            default:
                var note = this.getNoteName(item, this.accTrebKey, this.trebBarAcc);
                item.buttons = this.accordion.getButtons(note, false);
                item.note = note;
                item.c = item.inTie ? '-->' :  note;
                item.pitch = (qtd === 1 ? 11.7 : 13.4 -( c * 2.8));
                item.type = "tabText" + (qtd > 1 ? 2 : "");

                allOpen = allOpen ? typeof (item.buttons.open) !== "undefined" : false;
                allClose = allClose ? typeof (item.buttons.close) !== "undefined" : false;
        }
        
        child.pitches[child.pitches.length] = item;
    }
    
    if( inTie ) {
        // inversão impossível
        this.count += child.duration;
    } else {
        // verifica tudo: baixo e melodia
        if ((this.closing && baixoClose && allClose) || (!this.closing && baixoOpen && allOpen)) {
            // manteve o rumo, mas verifica o fole, virando se necessario (e possivel)
            if ( this.count < this.limit) {
                this.count += child.duration;
            } else {
                // neste caso só muda se é possível manter baixo e melodia    
                if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
                    this.count = child.duration;
                    this.closing = !this.closing;
                } else {
                    this.count += child.duration;
                }
            }
        } else if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
            //mudou o rumo, mantendo baixo e melodia
            this.count = child.duration;
            this.closing = !this.closing;
        } else {
            // não tem teclas de melodia e baixo simultaneamente: privilegia o baixo, se houver.
            if ((this.closing && ((bass && baixoClose) || allClose)) || (!this.closing && ((bass && baixoOpen) || allOpen))) {
                this.count += child.duration;
            } else if ((!this.closing && ((bass && baixoClose) || allClose)) || (this.closing && ((bass && baixoOpen) || allOpen))) {
                if (  this.count < this.limit) {
                    this.count += child.duration;
                } else {
                    // neste caso só muda se é possível manter baixo ou melodia    
                    if ((!this.closing && (bass && baixoClose) && allClose) || (this.closing && (bass && baixoOpen) && allOpen)) {
                        this.count = child.duration;
                        this.closing = !this.closing;
                    } else {
                        this.count += child.duration;
                    }
                }
            }
        }
    }

    child.bellows = this.closing ? "+" : "-";
    this.registerLine(child.bellows);
    this.registerLine(qtd > 1 ? "[" : "");

    // segunda passada: altera o que será exibido, conforme definições da primeira passada
    column = child.pitches;
    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        if (!item.bass) {
            if (!this.closing)
                item.pitch += offset;
            switch(item.type) {
                case 'rest':
                case 'invisible':
                case 'spacer':
                    this.registerLine('z');
                    break;
                default:
                    if ( item.inTie  ) {
                        this.registerLine('>');
                    } else {
                        item.c = this.elegeBotao(this.closing ? item.buttons.close : item.buttons.open);
                        this.registerLine(this.button2Hex(item.c));
                    }
            }
        }
    }
    var dur = child.duration / this.vars.default_length;
    var xf = this.registerLine((qtd > 1 ? "]" : "") + (dur !== 1 ? dur.toString() : "") + " ");
    this.add(child, xi, xf-1);
};

ABCXJS.tablature.Infer.prototype.getBassNote = function(token, tt, pitch) {
    var item = { bass:true, type: tt, c: "", pitch: pitch, inTie: token.inTie || false };
    
    var note = this.getNoteName(token, this.accBassKey, this.bassBarAcc);
    if (token.chord)
        note = note.toLowerCase();
    // retira a oitava, mas deveria incluir complementos, tais como menor, 7th, etc.
    item.buttons = this.accordion.getButtons(note, true);
    note = note.substr(0, note.length - 1);
    item.note = note;
    item.c = item.inTie ? '-->' :  note;
    
    return item;
};

ABCXJS.tablature.Infer.prototype.getNoteName = function(item, keyAcc, barAcc ) {
    // mapeia 
    //  de: nota da pauta + acidentes (tanto da clave, quanto locais)
    //  para: valor da nota cromatica (com oitava)

    var n = this.accordion.transposer.staffNoteToCromatic(this.accordion.transposer.extractStaffNote(item.pitch));
    var oitava = this.accordion.transposer.extractStaffOctave(item.pitch);
    var staffNote = this.accordion.transposer.numberToKey(n);
    
    if(item.accidental) {
        barAcc[item.pitch] = this.accordion.transposer.getAccOffset(item.accidental);
        n += barAcc[item.pitch];
    } else {
        if(typeof(barAcc[item.pitch]) !== "undefined") {
          n += barAcc[item.pitch];
        } else {
          n += this.accordion.transposer.getKeyAccOffset(staffNote, keyAcc);
        }
    }
    
    oitava += (n < 0 ? -1 : (n > 11 ? 1 : 0 ));
    n       = (n < 0 ? 12+n : (n > 11 ? n%12 : n ) );
    
    return this.accordion.transposer.numberToKey(n) + oitava;
};

ABCXJS.tablature.Infer.prototype.getXi = function() {
  return this.producedLine.length;
};

ABCXJS.tablature.Infer.prototype.registerLine = function(appendStr) {
  this.producedLine += appendStr;
  return this.producedLine.length;
};

ABCXJS.tablature.Infer.prototype.add = function(child, xi, xf) {
  child.startChar = this.vars.iChar+xi;
  child.endChar = this.vars.iChar+xf;
  this.voice.push(child);
};

ABCXJS.tablature.Infer.prototype.button2Hex = function( b ) {
    if(b === 'x') return b;
    var p = parseInt( isNaN(b.substr(0,2)) || b.length === 1 ? 1 : 2 );
    var n = b.substr(0, p);
    return (+n).toString(16) + b.substr(p);
};

// tenta encontrar o botão mais próximo do último
ABCXJS.tablature.Infer.prototype.elegeBotao = function( array ) {
    if(typeof(array) === "undefined" ) return "x";

    var b     = array[0];
    var v,l,i = b.indexOf("'");
    
    if( i >= 0 ) {
        v = b.substr(0, i);
        l = b.length - i;
    } else {
        v = parseInt(b);
        l = 0;
    }
    
    var min  = Math.abs((l>1?v+12:v)-this.lastButton);
    
    for( var a = 1; a < array.length; a ++ ) {
        i = array[a].indexOf("'");

        if( i >= 0 ) {
            v = array[a].substr(0, i);
            l = array[a].length - i;
        } else {
            v = parseInt(array[a]);
            l = 0;
        }
        
        if( Math.abs((l>1?v+12:v)-this.lastButton) < min ) {
           b = array[a];
           min = Math.abs((l>1?v+12:v)-this.lastButton);
        }
    }
    this.lastButton = parseInt(isNaN(b.substr(0,2))? b.substr(0,1): b.substr(0,2));
    return b;
};
