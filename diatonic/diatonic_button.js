/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Button = function( x, y, options ) {

    var opt = options || {};
    
    this.x = x;
    this.y = y;
    this.paper = null;
    this.openNote = null;
    this.closeNote = null;
    //this.closeSide = null;
    //this.openSide = null;
    //this.closeNoteKey = null;
    //this.openNoteKey = null;
    this.tabButton = null;
    
    this.openColor = opt.openColor || '#00ff00';
    this.closeColor = opt.closeColor || '#00b2ee';
    this.openLabel = opt.openLabel|| '';
    this.closeLabel = opt.closeLabel|| '';
    this.xLabel = opt.xLabel || 0;
    this.pedal = opt.pedal || false;
    this.stroke = this.pedal ? 2 : 1;
    this.textAnchor = opt.textAnchor || 'middle';
    this.color = opt.color || (opt.pedal? 'red' :'black');
    this.radius = opt.radius || 26;
    this.kls = opt.kls || 'button_font';

};

DIATONIC.map.Button.prototype.draw = function( id, paper, limits, options ) {
    
    var currX, currY;

    if( options.transpose ) {
        //horizontal
        currX = this.y;
        currY = options.mirror ? this.x : limits.maxX - this.radius*2 - (this.x - limits.minX);
    } else {
        //vertical
        currX = options.mirror ? limits.maxX - this.radius*2 - (this.x - limits.minX): this.x;
        currY = this.y;
    }
    
    this.paper = paper || this.paper;
   
    this.paper.printButton( id, currX, currY, this.radius, this.closeLabel, this.openLabel, this.kls );

};

DIATONIC.map.Button.prototype.clear = function(delay) {
    if(!this.SVG) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.clear(); }, delay*1000);
        return;
    }    
    this.SVG.button.style.setProperty( '--close-color', 'none' );
    this.SVG.button.style.setProperty( '--open-color', 'none' );
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.SVG) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setOpen();}, delay*1000 );
        return;
    } 
    this.SVG.button.style.setProperty( '--open-color', this.openColor );
};

DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.SVG) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setClose();}, delay*1000);
        return;
    } 
    this.SVG.button.style.setProperty( '--close-color', this.closeColor );
};

DIATONIC.map.Button.prototype.getLabel = function(nota, showLabel) {
    var l = '';
    if (showLabel) {
        l= DIATONIC.map.number2key_br[nota.value];
    } else {
        l = DIATONIC.map.number2key[nota.value];
    }
    
    if( showLabel )  {
        l = l.toUpperCase() + '';
    }
    
    if ( nota.isChord ) {
       l = l.toLowerCase() + '';
    }    
    
    if( nota.isMinor ) {
        l+='-';
    }
    return l;
};

DIATONIC.map.Button.prototype.setText = function( showLabel ) {
    if(this.SVG.openText) {
        this.SVG.openText.textContent = this.getLabel( this.openNote, showLabel );
        this.SVG.closeText.textContent = this.getLabel( this.closeNote, showLabel );
    }    
};

//DIATONIC.map.Button.prototype.setTextClose = function(t) {
//    this.closeLabel = t;
//    if(this.closeNoteKey)
//        this.closeNoteKey.attr('text', this.closeLabel );
//};
//
//DIATONIC.map.Button.prototype.setTextOpen = function(t) {
//    this.openLabel = t;
//    if(this.openNoteKey)
//        this.openNoteKey.attr('text', this.openLabel );
//};
