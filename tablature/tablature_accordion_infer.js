/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * TODO:
 *   - Verificar currInterval e suas implicações quando se está no último compasso
 *   - Tratar adequadamente os acordes de baixo
 *   - OK Tratar inversões de fole e inTie 
 *   - OK Bug quando ligaduras de expressão estão presentes
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
    
ABCXJS.tablature.Infer = function( accordion, tune, vars ) {
    this.multiplier = 1;
    this.accordion = accordion;
    this.vars = vars || {} ;

    // esta variavel conta o tempo ante de propor a inversão do fole 
    // em geral o count=1 equivale ao tempo de um compasso.
    // não esta no reset para que entre as linhas o contador seja mantido
    this.count = 0; 
    
    this.tune = tune;
    this.offset = 8.9;
    this.reset();
    
    this.transposeTab = tune.lines[0].staffs[tune.tabStaffPos].clef.transpose || 0;
    
    this.addWarning = function(str) {
        if (!this.vars.warnings) this.vars.warnings = [];
        this.vars.warnings.push(str);
    };
    
    this.barTypes = { 
        "bar"              :  "|"
      , "bar_thin"         :  "|"
      , "bar_thin_thin"    : "||"
      , "bar_thick_thin"   : "[|"
      , "bar_thin_thick"   : "|]"
      , "bar_dbl_repeat"   : ":|:"
      , "bar_left_repeat"  :  "|:"
      , "bar_right_repeat" : ":|"
    };
    
};

ABCXJS.tablature.Infer.prototype.reset = function() {
    this.tuneCurrLine = 0;
    this.voice = [];
    this.bassBarAcc = [];
    this.trebBarAcc = [];
    this.producedLine = "";
    this.lastButton = -1;
    this.currInterval = 1;
    this.alertedMissSync = false;
    this.alertedIncompatibleBass = 0;
    
    // limite para inversão o movimento do fole - baseado no tempo de um compasso
    if( this.tune.lines &&
        this.tune.lines[0].staffs &&      
        this.tune.lines[0].staffs[0].meter &&
        this.tune.lines[0].staffs[0].meter.type === 'specified' ) {
        var ritmo = this.tune.lines[0].staffs[0].meter.value[0];
        this.limit = ritmo.num / ritmo.den;
    } else {
      this.limit = 1; 
    }
    // flavio teste
    this.limit = this.limit*2; // para mudar a cada 2 compassos
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
        voices.push( { voz:trebVoices[i], pos:-1, st:'waiting for data', bass:false, wi: {}, ties:[]} ); // wi - work item
    }
    
    if( this.tune.tabStaffPos === 2 ) {
        var bassStaff  = this.tune.lines[this.tuneCurrLine].staffs[1];
        if(bassStaff) { 
            var bassVoices = bassStaff.voices;
            this.accBassKey = bassStaff.key.accidentals;
            for( var i = 0; i < bassVoices.length; i ++ ) {
                voices.push({ voz:bassVoices[i], pos:-1, st:'waiting for data', bass:true, wi: {}, ties:[] } ); // wi - work item
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
            if( voices[j].st !== voices[j+1].st && ! this.alertedMissSync) {
                this.addWarning('Possível falta de sincronismo no compasso ' + this.currInterval + '.' ) ;
                j = voices.length;
                this.alertedMissSync = true;
            }
        }

        switch(st){
            case 1: // incluir a barra na tablatura
                // neste caso, todas as vozes são "bar", mesmo que algumas já terminaram 
                var i = 0;
                while ( i < voices.length) {
                    if(voices[i].wi.el_type && voices[i].wi.el_type === "bar" )     {
                        this.addTABChild(ABCXJS.parse.clone(voices[i].wi),line);
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
                this.addTABChild(this.extraiIntervalo(voices), line);
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
    // toda chave estranha às notas deve ser ignorada aqui
    while( source.voz[source.pos] &&  source.pos < source.voz.length 
            && (source.voz[source.pos].direction || source.voz[source.pos].title || source.voz[source.pos].root) ) {
        if(source.voz[source.pos].el_type === 'key') {
            if(source.bass) {
              this.accBassKey = source.voz[source.pos].accidentals;
            } else {
              this.accTrebKey = source.voz[source.pos].accidentals;
            }
        }
        source.pos ++;
    }
    
    if( source.pos < source.voz.length ) {
        source.wi = ABCXJS.parse.clone(source.voz[source.pos]);
        if( source.wi.barNumber && source.wi.barNumber !== this.currInterval && item === 0 ) {
            this.currInterval = source.wi.barNumber;
        }
        
        if( source.wi.startTriplet){
            source.triplet = true;
            this.startTriplet = source.wi.startTriplet;
            this.multiplier = this.startTriplet===2?1.5:(this.startTriplet-1)/this.startTriplet;
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
        if( voices[i].st === 'processing' && voices[i].wi.duration && voices[i].wi.duration > 0  
                && voices[i].wi.duration*(voices[i].triplet?this.multiplier:1) < minDur ) {
            minDur = voices[i].wi.duration*(voices[i].triplet?this.multiplier:1);
        }
    }
    ;
    var wf = { el_type: 'note', duration: Number((minDur/this.multiplier).toFixed(5)), startChar: 0, endChar: 0, line:0, pitches:[], bassNote: [] }; // wf - final working item
    
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
            voices[i].wi.duration -= minDur/(voices[i].triplet?this.multiplier:1);
            if( voices[i].wi.duration <= 0.0001 ) {
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
    
    for( var i = 0; i < voices.length; i ++ ) {
        var elem = voices[i];
        if( elem.wi.endTriplet){
            this.endTriplet = true;
            elem.triplet = false;
            this.multiplier = 1;
        }
    }    
        
    //trata intervalo vazio (quando há pausa em todas as vozes e não são visíveis)
    if(wf.pitches.length === 0 && wf.bassNote.length === 0 ) {
        wf.pitches[0] = {type:'rest', c:'scripts.tabrest'}; 
    }
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

ABCXJS.tablature.Infer.prototype.addTABChild = function(token, line ) {

    if (token.el_type !== "note") {
        var xf = 0;
        if( this.barTypes[token.type] ){
            xf = this.registerLine(this.barTypes[token.type] + 
                    (token.startEnding?token.startEnding:"") + " ");
        } else {
            throw new Error( 'ABCXJS.tablature.Infer.prototype.addTABChild(token_type): ' + token.type );
        }
        var xi = this.getXi();
        this.add(token, xi, xf - 1, line );
        return;
    }
    
    var child = {
         el_type: token.el_type 
        ,startChar: 0
        ,endChar: 0
        ,line: 0
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
    
    if( this.startTriplet ) {
        child.startTriplet = this.startTriplet;
        this.startTriplet = false;
        this.registerLine( '(' + child.startTriplet + ' ' );
    }
    
    if( this.endTriplet ) {
        child.endTriplet = true;
        this.endTriplet = false;
    }
    
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
        inTie = (token.bassNote[b].inTie|| inTie);
        switch(token.bassNote[b].type) {
            case 'rest':
            case 'invisible':
            case 'spacer':
                child.pitches[b] = {bass: true, type: token.bassNote[b].type, c: 'scripts.tabrest', pitch: 0.7 + pitchBase - (b * 3)};
                this.registerLine('z');
                break;
            default:
                var item = { bass:true, type: tt, c: "", pitch: pitchBase - (b * 3) - 0.5, inTie: token.bassNote[b].inTie || false };
                var note = this.accordion.getNoteName(token.bassNote[b], this.accBassKey, this.bassBarAcc, true);
                item.buttons = this.accordion.getKeyboard().getButtons(note);
                item.note = note.key;
                item.c = item.inTie ? 'scripts.rarrow' :  note.key;
                child.pitches[b] = item;
                this.registerLine(child.pitches[b].c === 'scripts.rarrow' ? '>' : child.pitches[b].c);
                
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
                item.c = 'scripts.tabrest';
                item.pitch = 13.2;
                break
            default:
                var note = this.accordion.getNoteName(item, this.accTrebKey, this.trebBarAcc, false);
                
                if( this.transposeTab ) {
                    switch(this.transposeTab){
                        case 8: note.octave ++; break;
                        case -8: note.octave --; break;
                        default:
                            this.addWarning('Possível transpor a tablatura uma oitava acima ou abaixo +/-8. Ignorando transpose.') ;
                    }
                }
                
                item.buttons = this.accordion.getKeyboard().getButtons(note);
                item.note = note.key + note.octave;
                item.c = item.inTie ? 'scripts.rarrow' :  item.note;
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
        if (((this.vars.closing && !baixoClose)  || (!this.vars.closing && !baixoOpen)) &&  this.alertedIncompatibleBass < this.currInterval ) {
                this.addWarning('Baixo incompatível com movimento fole no compasso ' + this.currInterval + '.' ) ;
                this.alertedIncompatibleBass = this.currInterval;
        }
    } else {
        // verifica tudo: baixo e melodia
        if ((this.vars.closing && baixoClose && allClose) || (!this.vars.closing && baixoOpen && allOpen)) {
            // manteve o rumo, mas verifica o fole, virando se necessario (e possivel)
            if ( this.count < this.limit) {
                this.count += child.duration;
            } else {
                // neste caso só muda se é possível manter baixo e melodia    
                if ((!this.vars.closing && baixoClose && allClose) || (this.vars.closing && baixoOpen && allOpen)) {
                    this.count = child.duration;
                    this.vars.closing = !this.vars.closing;
                } else {
                    this.count += child.duration;
                }
            }
        } else if ((!this.vars.closing && baixoClose && allClose) || (this.vars.closing && baixoOpen && allOpen)) {
            //mudou o rumo, mantendo baixo e melodia
            this.count = child.duration;
            this.vars.closing = !this.vars.closing;
        } else {
            // não tem teclas de melodia e baixo simultaneamente: privilegia o baixo, se houver.
            if ((this.vars.closing && ((bass && baixoClose) || allClose)) || (!this.vars.closing && ((bass && baixoOpen) || allOpen))) {
                this.count += child.duration;
            } else if ((!this.vars.closing && ((bass && baixoClose) || allClose)) || (this.vars.closing && ((bass && baixoOpen) || allOpen))) {
                if (  this.count < this.limit) {
                    this.count += child.duration;
                } else {
                    // neste caso só muda se é possível manter baixo ou melodia    
                    if ((!this.vars.closing && (bass && baixoClose) && allClose) || (this.vars.closing && (bass && baixoOpen) && allOpen)) {
                        this.count = child.duration;
                        this.vars.closing = !this.vars.closing;
                    } else {
                        this.count += child.duration;
                    }
                }
            }
        }
    }

    child.bellows = this.vars.closing ? "+" : "-";
    this.registerLine(child.bellows);
    this.registerLine(qtd > 1 ? "[" : "");

    // segunda passada: altera o que será exibido, conforme definições da primeira passada
    column = child.pitches;
    for (var c = 0; c < column.length; c++) {
        var item = column[c];
        if (!item.bass) {
            if (!this.vars.closing)
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
                        item.c = this.elegeBotao(this.vars.closing ? item.buttons.close : item.buttons.open);
                        this.registerLine(this.button2Hex(item.c));
                        if( item.c === 'x'){
                            this.registerMissingButton(item);
                       }
                    }
            }
        }
    }
    var dur = child.duration / this.vars.default_length;
    var xf = this.registerLine((qtd > 1 ? "]" : "") + (dur !== 1 ? dur.toString() : "") + " ");
    
    if( child.endTriplet ) {
        this.registerLine( ') ' );
    }
    
    this.add(child, xi, xf-1, line);
};

ABCXJS.tablature.Infer.prototype.registerMissingButton = function(item) {
    if( ! this.vars.missingButtons[item.note] )  
        this.vars.missingButtons[item.note] = [];
    var bar = parseInt(this.currInterval);
    for( var i=0; i < this.vars.missingButtons[item.note].length; i++) {
        if ( this.vars.missingButtons[item.note][i] === bar ) return; // already listed
    }
    this.vars.missingButtons[item.note].push(bar);
};

ABCXJS.tablature.Infer.prototype.getXi = function() {
  return this.producedLine.length;
};

ABCXJS.tablature.Infer.prototype.registerLine = function(appendStr) {
  this.producedLine += appendStr;
  return this.producedLine.length;
};

ABCXJS.tablature.Infer.prototype.add = function(child, xi, xf, line) {
  child.startChar = this.vars.iChar+xi;
  child.endChar = this.vars.iChar+xf;
  child.line = line;
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
