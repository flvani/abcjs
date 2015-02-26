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
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.playlist = [];
    this.playInterval = null;
    this.ticksPerInterval = 1;
    this.currentAndamento = 1;
    
    this.warnings = [];
    
    this.printer = {};
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.lastMeasurePos = 0;
    this.currChannel = 0;
    this.currentMeasurePos = 0;
    this.currAbsElem = null;
    
    this.callbackOnStart = null;
    this.callbackOnEnd = null;
    this.callbackOnPlay = null;
    this.callbackOnScroll = null;
    this.callbackOnChangeBar = null;
    
    this.onError = null;
    
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
    this.tempo  = what.tempo;
    this.printer = what.printer;

    this.playing = true;
    this.onError = null;
  
    var self = this;
    this.doPlay();
    this.playInterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    if( this.callbackOnPlay ) this.callbackOnPlay(this);
    
    while (!this.onError && this.playlist[this.i] &&
           this.playlist[this.i].time <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
        if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
            this.lastMeasurePos = this.currentMeasurePos;
            this.currentMeasurePos = this.i;
            this.currentMeasure = this.playlist[this.i].barNumber;
            if( this.callbackOnChangeBar ) this.callbackOnPlay(this);
        }    
    }
    if (!this.onError && this.playlist[this.i]) {
        this.currentTime += this.ticksPerInterval;
    } else {
        this.stopPlay();
    }
};

ABCXJS.midi.Player.prototype.clearDidacticPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.currentMeasurePos = 0;
    this.lastMeasurePos = 0;
    this.pausePlay(true);
};

ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value ) {

    if(this.playing) return false;
    
    this.playlist = what.playlist;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.playing = true;
    this.onError = null;
    
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            var limite = that.playlist[that.i].time*(1/that.currentAndamento);
            var criteria = function () { 
                return limite === that.playlist[that.i].time*(1/that.currentAndamento);
            };
            break;
        case 'goto': // goto and play measure
            that.currentMeasure = parseInt(value);
            if(what.measures[that.currentMeasure] !== undefined )
                that.lastMeasurePos = what.measures[that.currentMeasure];
            else {
               this.pausePlay(true);
               return;
           }   
        case 'repeat': // measure
            if(that.currentMeasure === 1) {
                that.i = 0;
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                that.currentMeasurePos = that.i;
            } else {
                that.i = that.lastMeasurePos;
                that.currentTime = that.playlist[that.i].time*(1/that.currentAndamento);
                that.currentMeasure = that.playlist[that.i].barNumber;
                that.currentMeasurePos = that.i;
                
            }    
        case 'measure': // play-measure
            var curr = that.currentMeasure;
            var criteria = function () { 
                return curr === that.currentMeasure;
            };
            break;
    }
  
    this.doDidacticPlay(criteria);
    this.playInterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, this.tempo);
    return true;
};

ABCXJS.midi.Player.prototype.doDidacticPlay = function(criteria) {
    if( this.callbackOnPlay ) this.callbackOnPlay(this);
    while (!this.onError && this.playlist[this.i] && criteria() &&
            (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
            this.lastMeasurePos = this.currentMeasurePos;
            this.currentMeasurePos = this.i;
            this.currentMeasure = this.playlist[this.i].barNumber;
            if( this.callbackOnChangeBar ) this.callbackOnPlay(this);
        }
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

    try {
        if( pl.start ) {
            pl.item.pitches.forEach( function( elem ) {
                MIDI.noteOn(elem.channel, elem.midipitch, loudness, 0);

                var k = 2.2, t = k, resto = ( (elem.mididuration * self.tempo ) / 1000) - k;
                // a nota midi dura k segundos (k), então notas mais longas são reiniciadas quantas vezes forem necessárias
                while( resto > 0 ) {
                    MIDI.noteOff(elem.channel, elem.midipitch,  t);
                    MIDI.noteOn(elem.channel, elem.midipitch, loudness, t);
                    t += k;
                    resto -= k;
                }
            });
            pl.item.abcelems.forEach( function( elem ) {
                if( self.callbackOnScroll ) {
                    self.currAbsElem = elem.abcelem.abselem;
                    self.currChannel = elem.channel;
                    self.callbackOnScroll(self);
                }
                if( self.printer ) self.printer.notifySelect(elem.abcelem.abselem);
            });
            pl.item.buttons.forEach( function( elem ) {
                if(elem.button.button) {
                    if(elem.button.closing)
                        elem.button.button.setClose(/*elem.button.duration*self.tempo/8*/);
                    else
                        elem.button.button.setOpen(/*elem.button.duration*self.tempo/8*/);
                }
            });
        } else {
            pl.item.pitches.forEach( function( elem ) {
                MIDI.noteOff(elem.channel, elem.midipitch, 0);
            });
            pl.item.abcelems.forEach( function( elem ) {
                elem.abcelem.abselem.unhighlight();
            });
            pl.item.buttons.forEach( function( elem ) {
                if (elem.button.button ) {
                    elem.button.button.clear();
                }
            });
        }
    } catch( err ) {
        this.onError = { erro: err.message, idx: this.i, item: pl };
        console.log ('PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '.');
        this.addWarning( 'PlayList['+this.onError.idx+'] - Erro: ' + this.onError.erro + '.' );
    }
};

ABCXJS.midi.Player.prototype.getTime = function() {
    var pad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    
    var time = this.playlist[this.i].time*this.tempo;
    var secs  = Math.floor(time/1000);
    var ms    = Math.floor((time - secs*1000)/10);
    var mins  = Math.floor(secs/60);
    var secs  = secs - mins*60;
    var cTime  = pad(mins,2) + ':' + pad(secs,2) + '.' + pad(ms,2);
    return {cTime: cTime, time: time };
};
