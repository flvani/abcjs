/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - inverter o movimento do fole baseado no tempo do compasso
 *   - tratar ligaduras de expressão 
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
    this.vars = vars;
    this.tune = tune;
    this.limit = 7; // inverte o movimento do fole - deveria ser baseado no tempo das notas.
    
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
};


ABCXJS.tablature.Infer.prototype.inferTabVoice = function(line) {
    
    if( this.tune.tabStaffPos < 1 || ! this.tune.lines[line].staffs ) 
        return; // we expect to find at least the melody line above tablature, otherwise, we cannot infer it.
    
    this.reset();
    this.tuneCurrLine = line;
    
    var maxIdx = 0;
    var voices = [];
     
    var trebStaff  = this.tune.lines[this.tuneCurrLine].staffs[0];
    var trebVoices = trebStaff.voices;
    this.accTrebKey = trebStaff.key.accidentals;
    for( var i = 0; i < trebVoices.length; i ++ ) {
        voices[maxIdx] = { voz:trebVoices[i], pos:-1, st:'waiting for data', bass:false, wi: {}, ties:[] }; // wi - work item
        maxIdx++;
    }
    
    if( this.tune.tabStaffPos === 2 ) {
        var bassStaff  = this.tune.lines[this.tuneCurrLine].staffs[1];
        var bassVoices = bassStaff.voices;
        this.accBassKey = bassStaff.key.accidentals;
        for( var i = 0; i < bassVoices.length; i ++ ) {
            voices[maxIdx] = { voz:bassVoices[i], pos:-1, st:'waiting for data', bass:true, wi: {}, ties:[] }; // wi - work item
            maxIdx++;
        }
    }  
    var st = 1; // 0 - fim; 1 - barra; 2 dados; - 1 para garantir a entrada
    while( st > 0 ) {
        //try {
            st = 0; // 0 para garantir a saida, caso não haja nada para ler
            for( var j = 0; j < voices.length; j ++ ) {
                try {
                  st = Math.max(this.read( voices, j ), st);
                } catch(e) {

                }
            }
            for( var j = 0; j < voices.length-1; j ++ ) {
                if( voices[j].st !== voices[j+1].st ) {
                    var n = parseInt(this.currInterval)-1;
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
        //} catch (err) {
        //    if (err !== "normal_abort")
        //        throw err;
        //}
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
    
    while( source.voz[source.pos] && (source.voz[source.pos].direction || source.voz[source.pos].title) &&  source.pos < source.voz.length) {
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

ABCXJS.tablature.Infer.prototype.checkTies = function(voice) {
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            voice.wi.pitches[j].inTie = voice.ties[100+voice.wi.pitches[j].pitch];
        }
    }    
};

ABCXJS.tablature.Infer.prototype.setTies = function(voice) {
    // add 100 to avoid negative values
    if(voice.wi.el_type && voice.wi.el_type === "note" && voice.wi.pitches )  {
        for( var j = 0; j < voice.wi.pitches.length; j ++  ) {
            if( /*voice.wi.pitches[j].endSlur ||*/ voice.wi.pitches[j].endTie )
                voice.ties[100+voice.wi.pitches[j].pitch] = false;
            if( /*voice.wi.pitches[j].startSlur || */voice.wi.pitches[j].startTie )
                voice.ties[100+voice.wi.pitches[j].pitch] = true;
        }
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
            if( voices[i].bass ) {
                //todo: tratar adequadamente os acordes
                var isChord = elem.pitches.length>1;
                ABCXJS.write.sortPitch(elem.pitches);
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
    
    //trata intervalo vazio (quando há pausa em todas as vozes)
    // e %%restsintab não está presente
    if(wf.pitches.length === 0 && wf.bassNote.length === 0 )
        wf.pitches[0] = {type:'rest'}; 
    
    return wf;
    
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
    //var inSlur = false;
    var inTie = false;

    var qtd = column.length;
    var offset = (qtd===3?-3.6:-6.4); // inicialmente as notas estão na posição "fechando". Se precisar alterar para "abrindo" este é offset da altura

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
                child.pitches[b] = {bass: true, type: token.bassNote[b].type, c: '', pitch: pitchBase - (b * 3)};
                this.registerLine('z');
                break;
            default:
                child.pitches[b] = this.getBassNote(token.bassNote[b], tt, pitchBase - (b * 3) - 0.5);
                this.registerLine(child.pitches[b].c === '-->' ? '>' : child.pitches[b].c);
                baixoOpen  = baixoOpen  ? typeof (child.pitches[b].buttons.open) !== "undefined" : false;
                baixoClose = baixoClose ? typeof (child.pitches[b].buttons.close) !== "undefined" : false;
        }
    }


    var d = qtd; // pela organização da accordion as notas graves ficam melhor se impressas antes, admitindo que foi escrito em ordem crescente no arquivo abc
    var xi = this.getXi();
    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        inTie = (item.inTie || inTie);
        switch(item.type) {
            case 'invisible':
            case 'spacer':
            case 'rest':
                item.c = '';
                item.pitch = 12.2;
                break
            default:
                var note = this.getNoteName(item, this.accTrebKey, this.trebBarAcc);
                d--;
                item.buttons = this.accordion.getButtons(note, false);
                item.note = note;
                item.c = item.inTie ? '-->' :  note;
                item.pitch = (qtd === 1 ? 11.7 : 13 -( d * 2.8));
                item.type = "tabText" + (qtd > 1 ? 2 : "");

                allOpen = allOpen ? typeof (item.buttons.open) !== "undefined" : false;
                allClose = allClose ? typeof (item.buttons.close) !== "undefined" : false;
        }
        
        child.pitches[child.pitches.length] = item;
    }

    // verifica tudo: baixo e melodia
    if ((this.closing && baixoClose && allClose) || (!this.closing && baixoOpen && allOpen)) {
        // manteve o rumo, mas verifica o fole, virando se necessario (e possivel)
        if ( inTie || /*inSlur ||*/ this.count < this.limit) {
            this.count++;
        } else {
            // neste caso só muda se é possível manter baixo e melodia    
            if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
                this.count = 1;
                this.closing = !this.closing;
            }
        }
    } else if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
        //mudou o rumo, mantendo baixo e melodia
        this.count = 1;
        this.closing = !this.closing;
    } else {
        // não tem teclas de melodia e baixo simultaneamente: privilegia o baixo, se houver.
        if ((this.closing && ((bass && baixoClose) || allClose)) || (!this.closing && ((bass && baixoOpen) || allOpen))) {
            this.count++;
        } else if ((!this.closing && ((bass && baixoClose) || allClose)) || (this.closing && ((bass && baixoOpen) || allOpen))) {
            if (  inTie || /*inSlur ||*/ this.count < this.limit) {
                this.count++;
            } else {
                // neste caso só muda se é possível manter baixo ou melodia    
                if ((!this.closing && (bass && baixoClose) && allClose) || (this.closing && (bass && baixoOpen) && allOpen)) {
                    this.count = 1;
                    this.closing = !this.closing;
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

//ABCXJS.tablature.Infer.prototype.identifyChord = function (children, aNotes, verticalPos, acc, keyAcc, transpose) {
//TODO: tratar adequadamente os acordes (de baixo)      
//    var note = this.onvertToCromaticNote(children[aNotes[0]].pitch, verticalPos, acc, keyAcc, transpose );
//    return children.length > 1 ? note.toLowerCase() : note;
//};

ABCXJS.tablature.Infer.prototype.addTABChildUnused = function(child, inTieTreb, inTieBass) {

    if (child.el_type !== "note") {
        var xi = this.getXi();
        var xf = this.registerLine(this.abcText.substr(child.startChar, child.endChar - child.startChar) + " ");
        this.add(child, xi, xf - 1);
        return;
    }

    var offset = -6.4; // inicialmente as notas estão na posição "fechando". Se precisar alterar para "abrindo" este é offset da altura

    var bass;
    var item;
    var column = child.pitches;
    var allOpen = true;
    var allClose = true;
    var baixoClose = true;
    var baixoOpen = true;
    var inSlur = false;

    child.inTieTreb = inTieTreb;
    child.inTieBass = inTieBass;

    var qtdBass = 0;
    
    for (var c = 0; c < column.length; c++) {
        inSlur = inSlur || (column[c].slur && column[c].slur>1);
        qtdBass += column[c].bass ? 1 : 0;
    }

    var qtd = column.length - qtdBass;

    var d = qtd; // pela organização da accordion as notas graves ficam melhor se impressas antes, admitindo que foi escrito em ordem crescente no arquivo abc
    var xi = this.getXi();
    for (var c = 0; c < column.length; c++) {
        item = column[c];
        bass = bass ? bass : item.bass;
        if (item.type === "rest") {
            item.pitch = item.bass ? 18 : 12.2;
        } else {
            if (item.bass) {
                //merda...preciso do valor e também da letra
                var note = this.getNoteName(item, this.accBassKey, this.bassBarAcc);
                if (item.chord)
                    note = note.toLowerCase();
                // retira a oitava, mas deveria incluir complementos, tais como menor, 7th, etc.
                item.buttons = this.accordion.getButtons(note, true);
                note = note.substr(0, note.length - 1);
                item.note = note;
                item.c = note;
                item.pitch = 17.5;
                item.type = 'tabText';
            } else {
                var note = this.getNoteName(item, this.accTrebKey, this.trebBarAcc);
                d--;
                item.buttons = this.accordion.getButtons(note, false);
                item.note = note;
                item.c = note;
                item.pitch = ((qtd === 1 ? 11.7 : (qtd === 2 ? 10.6 + d * 2.5 : 9.7 + d * 2.1)));
                item.type = "tabText" + (qtd > 1 ? qtd : "");
            }
        }

        if (item.type === "rest") {
            if (item.bass) {
                bass = item;
                this.registerLine('z');
            }
        } else if (item.type.indexOf("tabText") >=0) {
            if (item.bass) {
                bass = item;
                if (inTieBass)
                    item.c = '-->';
                this.registerLine(item.c === '-->' ? '>' : item.c);
                baixoOpen = typeof (item.buttons.open) !== "undefined";
                baixoClose = typeof (item.buttons.close) !== "undefined";
            } else {
                if (inTieTreb || (item.slur && item.slur> 1) )
                    item.c = '-->';
                allOpen = allOpen ? typeof (item.buttons.open) !== "undefined" : false;
                allClose = allClose ? typeof (item.buttons.close) !== "undefined" : false;
            }
        }
    }

    // verifica tudo: baixo e melodia
    if ((this.closing && baixoClose && allClose) || (!this.closing && baixoOpen && allOpen)) {
        // manteve o rumo, mas verifica o fole, virando se necessario (e possivel)
        if (inTieTreb || inTieBass || inSlur || this.count < this.limit) {
            this.count++;
        } else {
            // neste caso só muda se é possível manter baixo e melodia    
            if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
                this.count = 1;
                this.closing = !this.closing;
            }
        }
    } else if ((!this.closing && baixoClose && allClose) || (this.closing && baixoOpen && allOpen)) {
        //mudou o rumo, mantendo baixo e melodia
        this.count = 1;
        this.closing = !this.closing;
    } else {
        // não tem teclas de melodia e baixo simultaneamente: privilegia o baixo, se houver.
        if ((this.closing && ((bass && baixoClose) || allClose)) || (!this.closing && ((bass && baixoOpen) || allOpen))) {
            this.count++;
        } else if ((!this.closing && ((bass && baixoClose) || allClose)) || (this.closing && ((bass && baixoOpen) || allOpen))) {
            if (inTieTreb || inSlur || (bass && inTieBass) || this.count < this.limit) {
                this.count++;
            } else {
                // neste caso só muda se é possível manter baixo ou melodia    
                if ((!this.closing && (bass && baixoClose) && allClose) || (this.closing && (bass && baixoOpen) && allOpen)) {
                    this.count = 1;
                    this.closing = !this.closing;
                }
            }
        }
    }

    var qtNotes = bass ? column.length - 1 : column.length;
    this.registerLine(this.closing ? "+" : "-");
    this.registerLine(qtNotes > 1 ? "[" : "");
    child.bellows = this.closing ? "+" : "-";

    // segunda passada: altera o que será exibido, conforme definições da primeira passada
    for (var c = 0; c < column.length; c++) {
        item = column[c];
        if (!item.bass) {
            if (!this.closing)
                item.pitch += offset;
            if (/*item.c.substr(0, 4) === "dots" ||*/ item.type === "rest") {
                this.registerLine('z');
            } else {
                if (! (inTieTreb || (item.slur && item.slur> 1) ) ) {
                    item.c = this.elegeBotao(this.closing ? item.buttons.close : item.buttons.open);
                    this.registerLine(this.button2Hex(item.c));
                } else {
                    this.registerLine('>');
                }
            }
        }
    }
    var dur = child.duration / this.vars.default_length;
    var xf = this.registerLine((qtNotes > 1 ? "]" : "") + (dur !== 1 ? dur.toString() : "") + " ");
    this.add(child, xi, xf-1);
};

// tentativa de tornar iguais os compassos da melodia e do baixo, para a tablatura ficar melhor
ABCXJS.tablature.Infer.prototype.addMissingRestUnused = function(p_duration) {
    var the_elem = {
        duration: p_duration,
        el_type: 'note',
        endChar: 0,
        rest: {type: 'rest'},
        startChar: 0
    };

    return the_elem;
};

ABCXJS.tablature.Infer.prototype.abcElem2TabElemUnused = function(elem, bass) {
    var cp = ABCXJS.parse.clone(elem);
    if (cp.rest ) {
        if(!cp.pitches) {
            cp.pitches =  [];
        }
        cp.rest.pitch = 0;
        cp.rest.verticalPos = 0;
        cp.rest.type="rest";
        cp.pitches[cp.pitches.length] = ABCXJS.parse.clone(cp.rest);
        delete cp.rest;
    }
    
    if(! cp.pitches ) return cp;
    
    for(var e = 0; e < cp.pitches.length; e ++ ){
      cp.inTie = cp.pitches[e].startTie?true:cp.pitches[e].endTie?false:undefined;
      delete cp.pitches[e].startTie;
      delete cp.pitches[e].endTie;
    }
    if(bass) {
        if( cp.pitches.length > 1 ) {
          // TODO: keep track of minor chords (and 7th)
          // note = this.accordion.identifyChord(abselem.children, aNotes, verticalPos, acc, keyAcc, -7); /*transpose -1 octave for better apresentation */
          ABCXJS.write.sortPitch(cp.pitches);
          cp.pitches.splice(1, cp.pitches.length - 1);
          cp.pitches[0].chord=true;
        }
        cp.pitches[0].bass = true;
    }   
    return cp;
};

ABCXJS.tablature.Infer.prototype.checkSlurUnused = function(elem) {
    //TODO: implementar ligaduras aninhadas
    var ini = (elem.startSlur && typeof(elem.startSlur) !== undefined) || false;
    var end = (elem.endSlur && typeof(elem.endSlur) !== undefined) || false;
    if( elem.pitches ) {
       for( var p = 0; p < elem.pitches.length; p ++) {
           if( elem.pitches[p].startSlur || ini ) {
             if( elem.pitches[p].bass ) continue;
             elem.pitches[p].slur = 1;  
             this.inSlur[this.countSlur] = ABCXJS.parse.clone(elem.pitches[p]);
             this.countSlur ++;
             ini = true;
           }
           if(elem.pitches[p].endSlur || end ) {
             end = true;
           }
       }
    }
    if( (! ini ) || end ) {
        for( var s = 0; s < this.countSlur; s ++) {
            if(this.inSlur[s] && this.inSlur[s] !== undefined ) {
                var countBass = 0;
                for( var p = 0; p < elem.pitches.length; p ++) {
                    if(elem.pitches[p].bass) {
                        countBass++;
                    }

                    if(  countBass <= p && elem.pitches[p].pitch === this.inSlur[s].pitch  ) {
                        elem.pitches.splice(p,1);
                    }
                }
                elem.pitches.splice(s+countBass,0,ABCXJS.parse.clone(this.inSlur[s]));
                if( (s+countBass) < elem.pitches.length ) {
                        elem.pitches[s+countBass].slur = 2;  
                } else {
                    console.log( 'erro' );
                }
                    
            }
        }
        if( end ) {
          this.countSlur = 0 ;
          this.inSlur = [];
        }
    }
};

ABCXJS.tablature.Infer.prototype.inferTabVoiceUnused = function(line) {
    
    if( this.tune.tabStaffPos < 1 || 
        ! this.tune.lines[line].staffs    ) return; // we expect to find at least the melody line above tablature, otherwise, we cannot infer it.
    
    this.tuneCurrLine = line;
    this.producedLine = "";
    this.count = 0;
    this.limit = 7; // inverte o movimento do fole - deveria ser baseado no tempo das notas.
    this.lastButton = -1;
    this.closing = true;
    
    this.bassBarAcc = [];
    this.trebBarAcc = [];
    this.inSlur = [];
    
    var balance = 0; // só faz sentido quando há duas vozes: baixo e melodia
    var trebDuration  = 0;
    var bassDuration  = 0;
    var idxTreb       = this.voice.length;
    var idxBass       = this.voice.length;
    var remainingBass = undefined;
    var remainingTreb = undefined;
    var inTieBass     = false;
    var inTieTreb     = false;
    
    var trebVoice  = this.tune.lines[this.tuneCurrLine].staffs[0].voices[0];
    this.accTrebKey = this.tune.lines[this.tuneCurrLine].staffs[0].key.accidentals;
    //this.vposTrebStave = this.tune.lines[this.tuneCurrLine].staffs[0].clef.verticalPos;
    
    if( this.tune.tabStaffPos === 2 ) {
      var bassVoice  = this.tune.lines[this.tuneCurrLine].staffs[1].voices[0];
      this.accBassKey = this.tune.lines[this.tuneCurrLine].staffs[1].key.accidentals;
      //this.vposBassStave = this.tune.lines[this.tuneCurrLine].staffs[0].clef.verticalPos;
    }  
   
    while (idxTreb < trebVoice.length || ( bassVoice && idxBass < bassVoice.length ) ) {
        
        var abcTrebElem = {};
        var abcBassElem = {};
        var leu = false;
        
        if (idxTreb < trebVoice.length && balance >= 0 ) {
            abcTrebElem = this.abcElem2TabElem(trebVoice[idxTreb], false);
            if(abcTrebElem.title || abcTrebElem.direction ){
                idxTreb++;
                continue;
            }  
            trebDuration += abcTrebElem.duration||0;
            leu = true;
        }
        if (bassVoice && idxBass < bassVoice.length && balance <= 0 ) {
            abcBassElem = this.abcElem2TabElem(bassVoice[idxBass], true );
            if(abcBassElem.title){
                idxBass++;
                continue;
            }  
            bassDuration += abcBassElem.duration||0;
            leu = true;
        }
        if (! leu ) {
            // se chegar aqui é problema ou as linhas de melodia e baixo não são equivalentes
            idxTreb = trebVoice.length;
            idxBass = bassVoice? bassVoice.length : 0;
            continue;
        }
        if (!bassVoice || !abcBassElem ) {
            idxTreb++;
            this.checkSlur(abcTrebElem);
            this.addTABChild2(abcTrebElem, inTieTreb, inTieBass);
            if(abcTrebElem.el_type === 'bar')
                    this.trebBarAcc = [];
            inTieTreb = typeof( abcTrebElem.inTie ) === "undefined"? inTieTreb : abcTrebElem.inTie; 
        } else {
            if (balance === 0) {
                idxTreb++;
                idxBass++;
                if (abcBassElem.el_type === 'bar' && abcTrebElem.el_type === 'bar') {
                    this.addTABChild2(abcTrebElem, inTieTreb, inTieBass);
                    this.bassBarAcc = [];
                    this.trebBarAcc = [];
                } else if (bassDuration > trebDuration) {
                    if(!abcTrebElem.pitches ) {
                        var rest = this.addMissingRest(abcBassElem.duration);
                        trebVoice.splice(idxTreb-1, 0, rest);
                        var tabelem = this.abcElem2TabElem(rest, false);
                        for (var c = 0; c < abcBassElem.pitches.length; c++) {
                            tabelem.pitches.push(ABCXJS.parse.clone(abcBassElem.pitches[c]));
                        }
                        this.addTABChild2(tabelem, inTieTreb, inTieBass);
                        trebDuration += abcBassElem.duration;
                    } else {
                        remainingBass = ABCXJS.parse.clone(abcBassElem);
                        remainingBass.duration = abcBassElem.duration - abcTrebElem.duration;
                        for (var c = 0; c < abcBassElem.pitches.length; c++) {
                            abcTrebElem.pitches.splice( c, 0, abcBassElem.pitches[c] );
                        }
                        this.checkSlur(abcTrebElem);
                        this.addTABChild2(abcTrebElem, inTieTreb, inTieBass);
                    }    
                } else if( bassDuration < trebDuration) {
                    if(!abcBassElem.pitches ) {
                        var rest = this.addMissingRest(abcTrebElem.duration);
                        bassVoice.splice(idxBass-1, 0, rest);
                        var tabelem = this.abcElem2TabElem(rest, true);
                        for (var c = 0; c < abcTrebElem.pitches.length; c++) {
                            tabelem.pitches.push(ABCXJS.parse.clone(abcTrebElem.pitches[c]));
                        }
                        this.addTABChild2(tabelem, inTieTreb, inTieBass);
                        bassDuration += abcTrebElem.duration;
                    } else {
                        remainingTreb = ABCXJS.parse.clone(abcTrebElem);
                        remainingTreb.duration = abcTrebElem.duration - abcBassElem.duration;
                        for (var c = 0; c < abcTrebElem.pitches.length; c++) {
                            abcBassElem.pitches.push(abcTrebElem.pitches[c]);
                        }
                       this.addTABChild2(abcBassElem, inTieTreb, inTieBass);
                    }
                } else {
                    for (var c = 0; c < abcTrebElem.pitches.length; c++) {
                        abcBassElem.pitches.push(abcTrebElem.pitches[c]);
                        if(abcTrebElem.endSlur){
                            abcBassElem.endSlur = ABCXJS.parse.clone(abcTrebElem.endSlur);
                        }
                    }
                    this.checkSlur(abcBassElem);
                    this.addTABChild2(abcBassElem, inTieTreb, inTieBass);
                }
            } else if (balance > 0) {
                var remaining = typeof(remainingBass ) !== "undefined"; // && remainingBass.pitches.length > 0;
                var dura = 0;
                if (abcTrebElem.el_type === 'bar') {
                    // encontrou nota faltando na melodia - preenche com pausas
                    var rest = this.addMissingRest(balance);
                    dura = balance;
                    trebVoice.splice(idxTreb, 0, rest);
                    var tabelem = this.abcElem2TabElem(rest, false);
                    if( remaining ) {
                        for (var c = 0; c < remainingBass.pitches.length; c++) {
                            tabelem.pitches.push(ABCXJS.parse.clone(remainingBass.pitches[c]));
                        }
                    }
                    this.addTABChild2(tabelem, inTieTreb, inTieBass|| remaining);
                    trebDuration += balance;
                    this.trebBarAcc = [];
                } else {
                    if(remaining) {
                        if(abcTrebElem.duration > remainingBass.duration) {
                            remainingTreb = ABCXJS.parse.clone(abcTrebElem);
                            dura = remainingBass.duration;
                            abcTrebElem.duration = dura;
                            remainingTreb.duration -= dura;
                            //trebDuration -= remainingTreb.duration;
                        } else {
                            dura = abcTrebElem.duration;
                        }  
                        for (var c = 0; c < remainingBass.pitches.length; c++) {
                            abcTrebElem.pitches.splice( c, 0, ABCXJS.parse.clone(remainingBass.pitches[c]) );
                        }
                    }
                    this.checkSlur(abcTrebElem);
                    this.addTABChild2(abcTrebElem, inTieTreb, inTieBass || remaining );
                }
                idxTreb++;
                if(remaining) {
                  remainingBass.duration -= dura;
                  if(remainingBass.duration <= 0 ) remainingBass = undefined;
              }  
            } else {
                var remaining = typeof(remainingTreb) !== "undefined"; // && remainingTreb.pitches.length > 0;
                var dura = 0;
                if (abcBassElem.el_type === 'bar') {
                    // encontrou nota faltando no baixo - preenche com pausas
                    var rest = this.addMissingRest(-balance);
                    dura = -balance;
                    bassVoice.splice(idxBass, 0, rest );
                    var tabelem = this.abcElem2TabElem(rest, true);
                    if( remaining ) {
                        for (var c = 0; c < remainingTreb.pitches.length; c++) {
                            tabelem.pitches.push(ABCXJS.parse.clone(remainingTreb.pitches[c]));
                        }
                    }
                    this.addTABChild2(tabelem, inTieTreb || remaining, inTieBass);
                    bassDuration -= balance;
                    this.bassBarAcc = [];
                } else {
                    if( remaining ) {
                        if(abcBassElem.duration > remainingTreb.duration) {
                            remainingBass = ABCXJS.parse.clone(abcBassElem);
                            dura = remainingTreb.duration;
                            abcBassElem.duration = dura;
                            remainingBass.duration -= dura;
                            //bassDuration -= remainingBass.duration;
                        } else {
                            dura = abcBassElem.duration;
                        }  
                        for (var c = 0; c < remainingTreb.pitches.length; c++) {
                            abcBassElem.pitches.push(ABCXJS.parse.clone(remainingTreb.pitches[c]));
                        }
                    }
                    this.addTABChild2(abcBassElem, inTieTreb || remaining, inTieBass );
                }
                idxBass++;
                if(remaining) {
                  remainingTreb.duration -= dura;
                  if(remainingTreb.duration <= 0 ) remainingTreb = undefined;
                }  
            }
            balance = bassDuration - trebDuration;
            inTieBass = typeof( abcBassElem.inTie ) === "undefined"? inTieBass : abcBassElem.inTie; 
            inTieTreb = typeof( abcTrebElem.inTie ) === "undefined"? inTieTreb : abcTrebElem.inTie; 
        }
    }
    
    this.accordion.setTabLine(this.producedLine);

    delete this.count;
    delete this.limit;
    delete this.lastButton;
    delete this.closing;
    delete this.accTrebKey;
    delete this.accBassKey;
    //delete this.vposTrebStave;
    //delete this.vposBassStave;
    delete this.producedLine;
    delete this.bassBarAcc;
    delete this.trebBarAcc;
    
    return this.voice;
};

