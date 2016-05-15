/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* TODO: 
 *      - Acertar as chamadas de callBack no Mapa - midplayer
 *      - Acertar chamada de posicionamento de scroll do editor - workspace
 *      - Verificar os impactos da alteração do textarea.appendstring - abc_editor
 *      - Verificar os impactos da mudança em - abc_graphelements
 *      - Verificar se é possível manter um pequeno delay antes de selecionar um botão para que seja
 *          perceptivel que o mesmo foi pressionado mais de uma vez
 *        NOTA: para isso é necessário na tablatura tenha informação de quanto tempo o botão ficará pressionado  
 *      - ok Modificar a execução nota a nota (antes estava melhor) ou verificar se é possível manter 
 *          os botões selecionados alem de verificar a questão do start/stop na play list
 *          NOTA: voltei ao padrão anterior
 *      - ok Enviar para o editor o sinal de  end of music (para mudar o label do botão play)
*/

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Player = function( options ) {
    
    this.reset(options);
    
    this.playableClefs = "TB"; // indica que baixo (B) e melodia (T) serao executadas.
    this.ticksPerInterval = 1;
    
    this.callbackOnStart = null;
    this.callbackOnEnd = null;
    this.callbackOnPlay = null;
    this.callbackOnScroll = null;
    this.callbackOnChangeBar = null;
    
};

ABCXJS.midi.Player.prototype.setPlayableClefs = function(letters) {
    this.playableClefs = letters;
};

ABCXJS.midi.Player.prototype.playClef = function(letter) {
    return this.playableClefs.indexOf( letter.toUpperCase() )>=0;
};

ABCXJS.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.playlist = [];
    this.playInterval = null;
    this.currentAndamento = 1;
    
    this.onError = null;
    this.warnings = [];
    
    this.printer = {};
    this.currChannel = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    
    this.currAbsElem = null;   
};

ABCXJS.midi.Player.prototype.addWarning = function(str) {
    this.warnings.push(str);
};

ABCXJS.midi.Player.prototype.getWarnings = function() {
    return this.warnings.length>0?this.warnings:null;    
};

ABCXJS.midi.Player.prototype.defineCallbackOnStart = function( cb ) {
    this.callbackOnStart = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnEnd = function( cb ) {
    this.callbackOnEnd = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnPlay = function( cb ) {
    this.callbackOnPlay = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnScroll = function( cb ) {
    this.callbackOnScroll = cb;
};
ABCXJS.midi.Player.prototype.defineCallbackOnChangeBar = function( cb ) {
    this.callbackOnChangeBar = cb;
};

ABCXJS.midi.Player.prototype.resetAndamento = function(mode) {
    if( mode==="normal" ){
        this.currentTime = this.currentTime * this.currentAndamento;
    } else {
        this.currentTime = this.currentTime * (1/this.currentAndamento);
    }
};

ABCXJS.midi.Player.prototype.adjustAndamento = function() {
    switch(this.currentAndamento) {
        case 1:
            this.currentAndamento = 0.5;
            this.currentTime = this.currentTime * 2;
            break;
        case 0.5:
            this.currentTime = this.currentTime * 2;
            this.currentAndamento = 0.25;
            break;
        case 0.25:
            this.currentAndamento = 1;
            this.currentTime = this.currentTime/4;
            break;
    }
    return this.currentAndamento;
};

ABCXJS.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
    if( this.callbackOnEnd ) this.callbackOnEnd(this);
    return this.getWarnings();
};

ABCXJS.midi.Player.prototype.pausePlay = function(nonStop) {
    if(!(false||nonStop)) MIDI.stopAllNotes();
    window.clearInterval(this.playInterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.startPlay = function(what) {

    if(this.playing || !what ) return false;
    
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.type     = null; // definido somente para o modo didatico

    this.playing = true;
    this.onError = null;
  
    var self = this;
    this.doPlay();
    this.playInterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.clearDidacticPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.pausePlay(true);
};

ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value, valueF ) {

    if(this.playing) return false;
    
    this.playlist = what.playlist;
    this.tempo    = what.tempo;
    this.printer  = what.printer;
    this.type     = type;

    this.playing  = true;
    this.onError  = null;
    
    var criteria = null;
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            what.printer.clearSelection();
            what.keyboard.clear(true);
            if(!that.playlist[that.i]) return false;
            that.initTime = that.playlist[that.i].time;
            criteria = function () { 
                return that.initTime === that.playlist[that.i].time;
            };
            break;
        case 'goto':   //goto-measure or goto-interval
        case 'repeat': // repeat-measure or repeat-interval
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.endMeasure = parseInt(valueF)? parseInt(valueF): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(what.measures[that.currentMeasure] !== undefined ) {
                that.i = that.currentMeasure === 1 ? 0 : what.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return (that.initMeasure <= that.currentMeasure) && (that.currentMeasure <= that.endMeasure);
                };
            } else {
               console.log('goto-measure or repeat-measure:  measure \''+value+'\' not found!');
               this.pausePlay(true);
               return;
            }   
            break;
        case 'measure': // play-measure
            that.currentMeasure = parseInt(value)? parseInt(value): that.currentMeasure;
            that.initMeasure = that.currentMeasure;
            if(what.measures[that.currentMeasure] !== undefined ) {
                that.i = that.currentMeasure === 1 ? 0 : what.measures[that.currentMeasure];
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                criteria = function () { 
                    return that.initMeasure === that.currentMeasure;
                };
            } else {
               console.log('play-measure: measure \''+value+'\' not found!');
               this.pausePlay(true);
               return false;
            }   
            break;
    }
  
    this.doDidacticPlay(criteria);
    this.playInterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, this.tempo);
    return true;
};

ABCXJS.midi.Player.prototype.handleBar = function() {
    if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
        this.currentMeasure = this.playlist[this.i].barNumber;
        if( this.callbackOnChangeBar ) {
            this.callbackOnPlay(this);
        }
    }    
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }
    
    while (!this.onError && this.playlist[this.i] &&
           this.playlist[this.i].time <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();
    }
    if (!this.onError && this.playlist[this.i]) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.stopPlay();
    }
};

ABCXJS.midi.Player.prototype.doDidacticPlay = function(criteria) {
    
    if( this.callbackOnPlay ) {
        this.callbackOnPlay(this);
    }
    
    while (!this.onError && this.playlist[this.i] && criteria() &&
            (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        this.handleBar();
    }
    if(this.onError) {
        this.stopPlay();
    } else if( this.playlist[this.i] && criteria() ) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.pausePlay(true);
    }
};

ABCXJS.midi.Player.prototype.executa = function(pl) {
    
    var self = this;
    var loudness = 256;
    var delay = 0;

    //try {
        if( pl.start ) {
            
            //pl.item.pitches.forEach( function( elem ) {
            for( var e=0; e < pl.item.pitches.length; e++) {
                var elem = pl.item.pitches[e];
                
                delay = self.calcTempo( elem.delay );
                
                if(  self.playClef( elem.midipitch.clef.charAt(0) ) ) {
                    MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, delay);
                    var k = 2.2, t = k, resto = self.calcTempo( elem.midipitch.mididuration ) - k;

                    // a nota midi dura k segundos (k), então notas mais longas são reiniciadas quantas vezes forem necessárias
                    while( resto > 0 ) {
                        MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch,  t+delay);
                        MIDI.noteOn(elem.midipitch.channel, elem.midipitch.midipitch, loudness, t+delay);
                        t += k;
                        resto -= k;
                    }
                }
                
                if( !debug && elem.button && elem.button.button && elem.button.button.SVG && elem.button.button.SVG.button !==null) {
                    if(elem.button.closing) {
                        elem.button.button.setClose(delay);
                    }else{
                        elem.button.button.setOpen(delay);
                    }
                    if( self.type !== 'note' ) {
                        //o andamento é considerado somente para o modo didatico
                        var andamento = self.type?(1/self.currentAndamento):1;
                        //limpa o botão uma fração de tempo antes do fim da nota - para dar ideia visual de botão pressionado/liberado antes da proxima nota
                        elem.button.button.clear( self.calcTempo( (elem.midipitch.mididuration-0.5)*andamento ) + delay );
                    }    
                }
                
            //});
            }
            pl.item.abcelems.forEach( function( elem ) {
                
                delay = self.calcTempo( elem.delay );
                if( self.callbackOnScroll ) {
                    self.currAbsElem = elem.abcelem.parent;
                    self.currChannel = elem.channel;
                    self.callbackOnScroll(self);
                }
                self.highlight(elem.abcelem.parent, true, delay);
            });
        } else {
            pl.item.pitches.forEach( function( elem ) {
                //if(  self.playClef( elem.midipitch.clef.charAt(0) ) ) {
                delay = self.calcTempo( elem.delay );
                MIDI.noteOff(elem.midipitch.channel, elem.midipitch.midipitch, delay);
                //}
           });
            pl.item.abcelems.forEach( function( elem ) {
                delay = self.calcTempo( elem.delay );
                self.highlight(elem.abcelem.parent, false, delay);
            });
        }
    //} catch( err ) {
    //    this.onError = { erro: err.message, idx: this.i, item: pl };
    //    console.log ('PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '.');
    //    this.addWarning( 'PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '.' );
    //}
};

ABCXJS.midi.Player.prototype.calcTempo = function( val ) {
  return  val * this.tempo / 1000;   
}
ABCXJS.midi.Player.prototype.highlight = function( abselem, select, delay ) {
    if(debug) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.highlight(abselem, select); }, delay*1000);
        return;
    }   
    if(select) {
        if( that.printer ) that.printer.notifySelect(abselem);
    } else {
        abselem.unhighlight();
    }
};


ABCXJS.midi.Player.prototype.getTime = function() {
    var pad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    
    var time = this.playlist[this.i].time*this.tempo*(1/this.currentAndamento);
    var secs  = Math.floor(time/1000);
    var ms    = Math.floor((time - secs*1000)/10);
    var mins  = Math.floor(secs/60);
    var secs  = secs - mins*60;
    var cTime  = pad(mins,2) + ':' + pad(secs,2) + '.' + pad(ms,2);
    return {cTime: cTime, time: time };
};
