/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* TODO: 
 *      - Modificar a execução nota a nota (antes estava melhor) ou verificar se é possível manter 
 *          os botões selecionados alem de verificar a questão do start/stop na play list
 *      - verificar se é possível manter um pequeno delay antes de selecionar um botão para que seja
 *          perceptivel que o mesmo foi pressionado mais de uma vez
 *      - ok enviar para o editor o sinal de  end of music (para mudar o label do botão play)
*/

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Player = function(map, options ) {

    this.map = map;
    this.currentAndamento = 1;
    
    this.reset( options );

    this.addWarning = function(str) {
        this.warnings.push(str);
    };
    
    this.getWarnings = function() {
        return this.warnings.length>0?this.warnings:null;    
    };
};

ABCXJS.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.playlist = [];
    this.playInterval = null;
    this.ticksPerInterval = 1;
    
    this.warnings = [];
    
    this.printer = {};
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.lastMeasurePos = 0;
    this.currentMeasurePos = 0;
    
    this.onError = null;
    
};

ABCXJS.midi.Player.prototype.resetAndamento = function(mode) {
    if(mode==="normal"){
        this.currentTime = this.currentTime * this.currentAndamento;
    } else {
        this.currentTime = this.currentTime * (1/this.currentAndamento);
    }
};

ABCXJS.midi.Player.prototype.adjustAndamento = function() {
    if(this.currentAndamento === 1 ) {
        this.currentAndamento = 0.5;
        this.currentTime = this.currentTime * 2;
    } else if(this.currentAndamento === 0.5 ) {
        this.currentTime = this.currentTime * 2;
        this.currentAndamento = 0.25;
    } else if(this.currentAndamento === 0.25 ) {
        this.currentAndamento = 1;
        this.currentTime = this.currentTime /4;
    }    
    return this.currentAndamento;
};

ABCXJS.midi.Player.prototype.setCallbackOnEnd = function( cb ) {
    this.callbackOnEnd = cb;
};


ABCXJS.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
    if( this.callbackOnEnd ) this.callbackOnEnd();
    return this.getWarnings();
};

ABCXJS.midi.Player.prototype.pausePlay = function(nonStop) {
    if(!(false||nonStop)) MIDI.stopAllNotes();
    window.clearInterval(this.playInterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.startPlay = function(what, cb ) {

    if(this.playing || !what ) return false;
    
    this.playlist = what.playlist;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.callback = cb;

    this.playing = true;
    this.onError = null;
  
    var self = this;
    this.doPlay();
    this.playInterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    if( this.callback ) {
        this.callback(this.i, this.playlist[this.i].time*this.tempo, this.currentMeasure );
    }
    while (!this.onError && this.playlist[this.i] &&
           this.playlist[this.i].time <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
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


ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value, cb ) {

    if(this.playing) return false;
    
    this.playlist = what.playlist;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.callback = cb;
    this.playing = true;
    this.onError = null;
    
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            var limite = that.i +1; // verificar se +1 é sempre verdade.
            var criteria = function () { 
                return limite >= that.i;
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
    while (!this.onError && this.playlist[this.i] && criteria() &&
            (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
            this.lastMeasurePos = this.currentMeasurePos;
            this.currentMeasurePos = this.i;
            this.currentMeasure = this.playlist[this.i].barNumber;
            if( this.callback ) {
                this.callback(this.i, this.playlist[this.i].time*this.tempo, this.currentMeasure );
            }
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
    var endOnly = (this.playUntilTime>0 && this.playUntilTime === (pl.time*(1/this.currentAndamento)));

    try {
        if( pl.start ) {
            if( endOnly ) {
                this.playUntilTime = null;
                return;
            }
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
                if( self.map ) self.map.setScrolling(elem.abcelem.abselem.y, elem.channel);
                if( self.printer ) self.printer.notifySelect(elem.abcelem.abselem);
            });
            pl.item.buttons.forEach( function( elem ) {
                if(elem.button.button) {
                    if(elem.button.closing)
                        elem.button.button.setClose();
                    else
                        elem.button.button.setOpen();
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
