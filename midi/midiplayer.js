/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
    window.ABCXJS = {};

if (!window.ABCXJS.midi) 
    window.ABCXJS.midi = {}; 

ABCXJS.midi.Player = function(map, options ) {

    this.map = map;
    this.reset( options );
    this.currentAndamento = 1;
};

ABCXJS.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 250;
    this.playing = false;
    this.ticksperinterval = 1;
    
    this.printer = {};
    this.playlist = [];
    this.currentTime = 0;
    this.currentMeasure = 1;
    this.lastMeasurePos = 0;
    this.currentMeasurePos = 0;
    
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

ABCXJS.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currentTime = 0;
    this.pausePlay();
};

ABCXJS.midi.Player.prototype.pausePlay = function() {
    MIDI.stopAllNotes();
    window.clearInterval(this.playinterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.startPlay = function(what) {

    if(this.playing || !what ) return false;
    
    this.playlist = what.playlist;
    this.tempo  = what.tempo;
    this.printer = what.printer;

    this.playing = true;
  
    var self = this;
    this.doPlay();
    this.playinterval = window.setInterval(function() { self.doPlay(); }, this.tempo);
    
    return true;
};

ABCXJS.midi.Player.prototype.doPlay = function() {
    while (this.playlist[this.i] &&
           this.playlist[this.i].time <= this.currentTime) {
        this.executa(this.playlist[this.i]);
        this.i++;
    }
    if (this.playlist[this.i]) {
        this.currentTime += this.ticksperinterval;
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
    this.pauseDidacticPlay();
};


ABCXJS.midi.Player.prototype.pauseDidacticPlay = function(nonStop) {
    if(!nonStop) MIDI.stopAllNotes();
    window.clearInterval(this.didacticPlayinterval);
    this.playing = false;
};

ABCXJS.midi.Player.prototype.startDidacticPlay = function(what, type, value) {

    if(this.playing) return false;
    
    this.playlist = what.playlist;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    
    this.playing = true;
    
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            var curr = (that.playlist[that.i].time*(1/that.currentAndamento));
            var criteria = function () { 
                return curr === (that.playlist[that.i].time*(1/that.currentAndamento));
            };
            break;
        case 'goto': // goto and play measure
            that.currentMeasure = parseInt(value);
            if(what.measures[that.currentMeasure] !== undefined )
                that.lastMeasurePos = what.measures[that.currentMeasure];
            else {
               this.pauseDidacticPlay();
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
    this.didacticPlayinterval = window.setInterval(function() { that.doDidacticPlay(criteria); }, this.tempo);
    return true;
};

ABCXJS.midi.Player.prototype.doDidacticPlay = function(criteria) {
    while (this.playlist[this.i] && criteria() &&
            (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currentTime ) {
        this.executa(this.playlist[this.i]);
        this.i++;
        if(this.playlist[this.i] && this.playlist[this.i].barNumber) {
            this.lastMeasurePos = this.currentMeasurePos;
            this.currentMeasurePos = this.i;
            this.currentMeasure = this.playlist[this.i].barNumber;
            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
        }
    }
   
    if( this.playlist[this.i] && criteria() ) {
        this.currentTime += this.ticksperinterval;
    } else {
        this.pauseDidacticPlay(true);
    }
};

ABCXJS.midi.Player.prototype.executa = function(pl) {
    
    var self = this;
    var loudness = 256;
    
    if( pl.start ) {
        pl.item.pitches.forEach( function( pitch ) {
            MIDI.noteOn(pitch.channel, pitch.pitch, loudness, 0);
            // a nota do midi só dura 2 segundos, então deveria reiniciar a nota o tempo extrapolasse esse valor
            //this.midiTune.tempo  * duracao do midi = tempo_soando tempo_maximo_suportado
            //250ms                * 8                 2000ms       2000ms
            //if( mididuration * self.tempo >= 2000 ) { 
            //    this.endNote(startElem, this.timecount, midipitch );
            //    this.startNote(startElem, this.timecount, midipitch );
            //    this.endNote(startElem, this.timecount + mididuration, midipitch );
            //}
            
        });
        pl.item.abcelems.forEach( function( elem ) {
            if( self.map ) self.map.setScrolling(elem.abcelem.abselem.y, elem.channel);
            if( self.printer ) self.printer.notifySelect(elem.abcelem.abselem);
        });
        pl.item.buttons.forEach( function( button ) {
            if(button.button) {
                if(button.abcelem.bellows === '+')
                    button.button.setClose();
                else
                    button.button.setOpen();
            }
        });
    } else {
        pl.item.pitches.forEach( function( pitch ) {
            MIDI.noteOff(pitch.channel, pitch.pitch, pitch.delay||0);
        });
        pl.item.abcelems.forEach( function( elem ) {
            elem.abcelem.abselem.unhighlight();
        });
        pl.item.buttons.forEach( function( button ) {
            if (button.button ) {
                button.button.clear();
            }
        });
    }
};
