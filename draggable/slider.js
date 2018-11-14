/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Slider = function (topDiv, min, max, start, step, pcolor, pbgcolor, callback ) {
    
    var mozStyle, webkStyle, btStyle;
    var color = pcolor || 'black';
    var bgcolor = pbgcolor || 'gray';
    
    for (let {cssRules} of document.styleSheets) {
      for (let {selectorText, style} of cssRules) {
        if (selectorText === ".slidebuttonDiv:hover") {
          btStyle = style;
        }
        if (selectorText === ".slider::-webkit-slider-thumb") {
          webkStyle = style;
        }
        if (selectorText === ".slider::-moz-range-thumb") {
          mozStyle = style;
        }
      }
    }    
    
    if(btStyle) 
        btStyle.backgroundColor = color;
    
    if(webkStyle) 
        webkStyle.backgroundColor = color;
    
    if( mozStyle )
        mozStyle.backgroundColor = color;
    
    var self = this;
    var leftInterval, rightInterval, speed=100;
    this.step = step || 5;
    this.id = ++ DRAGGABLE.ui.slideId;
    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.container.className = "slidecontainer";
    this.container.id = "slider" + this.id;
    
    var d1 = document.createElement('div');
    d1.className = "layer1";
    d1.style.backgroundColor = bgcolor;
    this.container.appendChild(d1);
    
    var d2 = document.createElement('div');
    d2.className = "layer2";    
    this.container.appendChild(d2);
    
    this.label = document.createElement('label');
    d1.appendChild(this.label);
    this.label.className = "slidelabel";
    
    this.slider = document.createElement('input');
    
    this.leftButton = document.createElement('div');
    var llabel = document.createElement('label');
    this.leftButton.appendChild(llabel);
    d2.appendChild(this.leftButton);
    this.leftButton.className = 'slidebuttonDiv';
    llabel.className = 'slidebutton rev180dg';
    llabel.innerHTML = '<i class="ico-open-right" data-toggle="toggle"></i>';
    
    var l = document.createElement('div');
    l.appendChild(this.slider);
    d2.append(l);
    
    this.rightButton = document.createElement('div');
    var rlabel = document.createElement('label');
    this.rightButton.appendChild(rlabel);
    d2.appendChild(this.rightButton);
    this.rightButton.className = 'slidebuttonDiv';
    rlabel.className = 'slidebutton normal';
    rlabel.innerHTML = '<i class="ico-open-right" data-toggle="toggle"></i>';
    
    this.slider.type="range";
    this.slider.className = "slider";
    this.slider.min = min || 0;
    this.slider.max = max || 100;
    this.slider.value = start || 100;
    this.slider.step = 1;
    self.label.innerHTML = (start || 100) + '%';
    
    var setV = function (v) {
        self.slider.value = v;
        self.label.innerHTML = self.slider.value+"%";
        callback(v);
    };
    
    this.slider.oninput = function(e) {
        self.slider.step = self.step;
        setV(parseInt(this.value));
        //self.label.innerHTML = this.value+"%";
        e.stopPropagation();
        e.preventDefault();
        self.slider.step = 1;
    };
    
    this.leftButton.onmousedown = function(e) {
        leftInterval = setInterval( function() {
            setV(parseInt(self.slider.value)-1);
        }, speed);
        e.stopPropagation();
        e.preventDefault();
    };
    
    this.leftButton.onmouseup = function(e) {
        clearInterval(leftInterval);    
    };
    this.leftButton.onmouout = function(e) {
        clearInterval(leftInterval);    
    };
    
    this.rightButton.onmousedown = function(e) {
        rightInterval = setInterval( function() {
            setV(parseInt(self.slider.value)+1);
        }, speed);
        e.stopPropagation();
        e.preventDefault();
    };
    
    this.rightButton.onmouseup = function(e) {
        clearInterval(rightInterval);    
    };
    this.rightButton.onmouseout = function(e) {
        clearInterval(rightInterval);    
    };
    
};

DRAGGABLE.ui.Slider.prototype.enable = function( ) {
    this.container.style.pointerEvents = 'all';
};

DRAGGABLE.ui.Slider.prototype.disable = function( ) {
    this.container.style.pointerEvents = 'none';
};
