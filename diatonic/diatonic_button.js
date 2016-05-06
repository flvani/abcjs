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
    this.openNote = null;
    this.closeNote = null;
    this.tabButton = null;
    this.SVG  = {gid: 0}; // futuro identificador
    
    this.openColor = opt.openColor || '#00ff00';
    this.closeColor = opt.closeColor || '#00b2ee';
    this.radius = opt.radius || 26;
    this.kls = opt.kls || 'button';

};

DIATONIC.map.Button.prototype.draw = function( id, printer, limits, options ) {
    
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
   
    this.SVG.gid = printer.printButton( id, currX, currY, this.radius, this.kls );

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

DIATONIC.map.Button.prototype.setSVG = function(showLabel, open, close ) {
    var b = this.SVG;
    this.SVG.button = document.getElementById(b.gid);
    this.SVG.openText = document.getElementById(b.gid+'_to');
    this.SVG.closeText = document.getElementById(b.gid+'_tc');
    this.setText(showLabel, open, close ); 
};

DIATONIC.map.Button.prototype.setText = function( showLabel, open, close ) {
    if(this.SVG.openText) {
        this.SVG.openText.textContent = open ? open : this.getLabel( this.openNote, showLabel );
        this.SVG.closeText.textContent = close ? close : this.getLabel( this.closeNote, showLabel );
    }    
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

