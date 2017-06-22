/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.Button = function( kb, x, y, options ) {

    var opt = options || {};
    
    this.kb = kb;
    this.x = x;
    this.y = y;
    
    this.openNote = null;
    this.closeNote = null;
    this.tabButton = null;
    
    this.SVG  = {gid: 0}; // futuro identificador
    
    this.radius = opt.radius;
    this.isPedal  = opt.isPedal || false;
    this.borderWidth = opt.borderWidth || (this.isPedal?2:1);
    this.borderColor = opt.borderColor || (this.isPedal?'red':'black');

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
    
    options = options || {};
    options.radius = this.radius;
    options.borderColor = this.borderColor;
    options.borderWidth = this.borderWidth;
    options.fillColor = this.kb.render_opts.fillColor;
    options.openColor = (options.kls && options.kls === 'blegenda'? this.kb.render_opts.openColor : 'none' );
    options.closeColor = (options.kls && options.kls === 'blegenda'? this.kb.render_opts.closeColor : 'none' );
    
    this.SVG.gid = printer.printButton( id, currX, currY, options );

};

DIATONIC.map.Button.prototype.clear = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.clear(); }, delay*1000);
        return;
    }    
    this.SVG.closeArc.style.setProperty( 'fill', 'none' );
    this.SVG.openArc.style.setProperty( 'fill', 'none' );
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setOpen();}, delay*1000 );
        return;
    } 
    this.SVG.openArc.style.setProperty( 'fill', this.kb.render_opts.openColor );
};

DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.SVG.button ) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setClose();}, delay*1000);
        return;
    } 
    this.SVG.closeArc.style.setProperty( 'fill', this.kb.render_opts.closeColor );
};

DIATONIC.map.Button.prototype.setSVG = function(showLabel, open, close ) {
    var b = this.SVG;
    this.SVG.button = document.getElementById(b.gid);
    this.SVG.openArc = document.getElementById(b.gid+'_ao');
    this.SVG.openText = document.getElementById(b.gid+'_to');
    this.SVG.closeArc = document.getElementById(b.gid+'_ac');
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
    var l = nota.key;
    
    if (showLabel) {
        l = l.toUpperCase() + '';
        l = ABCXJS.parse.key2br[l].toUpperCase();
    }
    
    if ( nota.isChord ) {
       l = l.toLowerCase() + '';
    }    
    
    if( nota.isMinor ) {
        l+='-';
    }
    return l;
};

