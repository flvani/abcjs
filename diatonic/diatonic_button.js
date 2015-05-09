/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

Raphael.fn.arc = function(startX, startY, endX, endY, radius1, radius2, angle) {
  var arcSVG = [radius1, radius2, angle, 0, 1, endX, endY].join(' ');
  return this.path('M'+startX+' '+startY + " a " + arcSVG);
};

Raphael.fn.circularArc = function(centerX, centerY, radius, startAngle, endAngle) {
  var startX = centerX+radius*Math.cos(startAngle*Math.PI/180); 
  var startY = centerY+radius*Math.sin(startAngle*Math.PI/180);
  var endX = centerX+radius*Math.cos(endAngle*Math.PI/180); 
  var endY = centerY+radius*Math.sin(endAngle*Math.PI/180);
  return this.arc(startX, startY, endX-startX, endY-startY, radius, radius, 0);
};

DIATONIC.map.Button = function( x, y, options ) {

    var opt = options || {};
    
    this.x = x;
    this.y = y;
    this.paper = null;
    this.openNote = null;
    this.closeNote = null;
    this.closeSide = null;
    this.openSide = null;
    this.closeNoteKey = null;
    this.openNoteKey = null;
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
    this.BTNRADIUS = opt.radius || DIATONIC.map.Units.BTNRADIUS;
    this.FONTSIZE = opt.fontsize || DIATONIC.map.Units.FONTSIZE; 

};

DIATONIC.map.Button.prototype.draw = function( paper, limits, options ) {
    
    var currX, currY, currRadius, currFontSize;

    if( options.transpose ) {
        //horizontal
        currX = this.y;
        currY = options.mirror ? this.x : limits.maxX - (this.x - limits.minX);
    } else {
        //vertical
        currX = options.mirror ? limits.maxX - (this.x - limits.minX): this.x;
        currY = this.y;
    }
    
    currX *= options.scale;
    currY *= options.scale;
    currRadius =  this.BTNRADIUS*options.scale;
    currFontSize = this.FONTSIZE*options.scale;
    
    //background
    this.paper = paper || this.paper;
    
    this.circle = this.paper.circle(currX, currY, currRadius);
    this.circle.attr({"fill": "white", "stroke": "white", "stroke-width": 0});

    this.closeSide = this.paper.circularArc(currX, currY, currRadius, 170, 350);
    this.closeSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});

    this.openSide = this.paper.circularArc(currX, currY, currRadius, 350, 170);
    this.openSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});

    this.closeNoteKey = this.paper.text(currX + (this.xLabel*options.scale), currY-(12*options.scale), this.closeLabel)
            .attr({'text-anchor': this.textAnchor, "font-family": "Sans Serif", "font-size": currFontSize });
    
    this.openNoteKey = this.paper.text(currX + (this.xLabel*options.scale), currY+(12*options.scale), this.openLabel)
            .attr({'text-anchor': this.textAnchor, "font-family": "Sans Serif", "font-size": currFontSize });
    
    // top circle and line
    this.paper.circle(currX, currY, currRadius)
            .attr({"fill": "none", "stroke": this.color, "stroke-width": this.stroke});
    this.paper.path( ["M", currX-currRadius, currY+(5*options.scale), "L", currX+currRadius, currY-(5*options.scale) ] )
            .attr({"fill": "none", "stroke": this.color, "stroke-width": this.stroke});
    
    this.setText( options.label );
};

DIATONIC.map.Button.prototype.clear = function(delay) {
    if(!this.closeSide) return;
    var that = this;
    if(delay) {
        window.setTimeout(function(){ that.clear(); }, delay);
        return;
    }    
    this.openSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});
    this.closeSide.attr({"fill": "none", "stroke": "none", "stroke-width": 0});
};

DIATONIC.map.Button.prototype.setOpen = function(delay) {
    if(!this.openSide) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setOpen();}, delay );
        return;
    } 
    this.openSide.attr({"fill": this.openColor, "stroke": this.openColor, "stroke-width": 0});
};

DIATONIC.map.Button.prototype.setClose = function(delay) {
    if(!this.closeSide) return;
    var that = this;
    if(  delay ) {
        window.setTimeout(function(){that.setClose();}, delay);
        return;
    } 
    this.closeSide.attr({"fill": this.closeColor, "stroke": this.closeColor, "stroke-width": 0});
    
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
  

DIATONIC.map.Button.prototype.getLabelOld = function(nota, showLabel) {
    var l = '';
    if (nota.isChord) {
        l = DIATONIC.map.number2key[ nota.value ].toLowerCase() + '';
    } else {
        if (showLabel) {
            l= DIATONIC.map.number2key_br[nota.value ];
        } else {
            l = DIATONIC.map.number2key[nota.value ];
        }
    }
    if( nota.isMinor ) {
        l+='-';
    }
    return l;
};

DIATONIC.map.Button.prototype.setText = function( showLabel ) {
    if(this.openNote) {
        this.setTextOpen( this.getLabel( this.openNote, showLabel ) );
        this.setTextClose( this.getLabel( this.closeNote, showLabel ) );
    }    
};

DIATONIC.map.Button.prototype.setTextClose = function(t) {
    this.closeLabel = t;
    if(this.closeNoteKey)
        this.closeNoteKey.attr('text', this.closeLabel );
};

DIATONIC.map.Button.prototype.setTextOpen = function(t) {
    this.openLabel = t;
    if(this.openNoteKey)
        this.openNoteKey.attr('text', this.openLabel );
};
