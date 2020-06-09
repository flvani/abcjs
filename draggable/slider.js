/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, slideId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
DRAGGABLE.ui.Slider = function (topDiv, opts ) {

   //min, max, start, step, pcolor, pbgcolor, callback ) {
    
    var self = this;
    var leftInterval, rightInterval;
    var mozStyle, webkStyle, btStyle;
    var color = opts.color || 'black';
    var bgcolor = opts.bgcolor || 'gray';
    var speed = opts.speed || 100;
    var callback = opts.callback;
    var rules = [];
    
    // identifica elementos de CSS padrão que podem ser alterados
    for( var i in document.styleSheets ) {
        if(document.styleSheets[i].href && document.styleSheets[i].href.includes('styles4abcx')){
            rules=document.styleSheets[i].cssRules? document.styleSheets[i].cssRules: document.styleSheets[i].rules;
            break;
        }
    }

    for (var r=0; r < rules.length; r++){
        if(rules[r].selectorText===".slidebuttonDiv:hover") 
            btStyle=rules[r].style;
        if(rules[r].selectorText===".slider::-webkit-slider-thumb") 
            webkStyle=rules[r].style;
        if(rules[r].selectorText===".slider::-moz-range-thumb") 
            mozStyle=rules[r].style;
    }
    
    if(btStyle) 
        btStyle.backgroundColor = color;
    
    if(webkStyle) 
        webkStyle.backgroundColor = color;
    
    if( mozStyle )
        mozStyle.backgroundColor = color;
    
    
    this.step = opts.step || 1;
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
    d2.appendChild(l);
    
    this.rightButton = document.createElement('div');
    var rlabel = document.createElement('label');
    this.rightButton.appendChild(rlabel);
    d2.appendChild(this.rightButton);
    this.rightButton.className = 'slidebuttonDiv';
    rlabel.className = 'slidebutton normal';
    rlabel.innerHTML = '<i class="ico-open-right" data-toggle="toggle"></i>';
    
    this.slider.type="range";
    this.slider.className = "slider";
    this.slider.min = opts.min || 0;
    this.slider.max = opts.max || 100;
    this.slider.value = opts.start || 100;
    this.slider.step = 1;
    self.label.innerHTML = (opts.start || 100) + '%';
    
    var setV = function (v, call) {
        self.slider.value = v;
        self.label.innerHTML = self.slider.value+"%";
        (call) && (callback) && callback(v);
    };
    
    this.slider.oninput = function(e) {
        self.slider.step = self.step;
        setV(parseInt(this.value), true);
        e.stopPropagation();
        e.preventDefault();
        self.slider.step = 1;
    };
    
    this.leftButton.onclick = function(e) {
        setV(parseInt(self.slider.value)-1, true);
        e.stopPropagation();
        e.preventDefault();
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
        (callback) && callback(self.slider.value);
    };
    this.leftButton.onmouout = function(e) {
        clearInterval(leftInterval);    
        (callback) && callback(self.slider.value);
    };
    
    this.rightButton.onclick = function(e) {
        setV(parseInt(self.slider.value)+1, true);
        e.stopPropagation();
        e.preventDefault();
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
        (callback) && callback(self.slider.value);
    };
    this.rightButton.onmouseout = function(e) {
        clearInterval(rightInterval);    
        (callback) && callback(self.slider.value);
    };
    
};

DRAGGABLE.ui.Slider.prototype.enable = function( ) {
    this.container.style.pointerEvents = 'all';
    this.container.style.backgroundColor = 'transparent';
    this.container.style.opacity = '1';
};

DRAGGABLE.ui.Slider.prototype.disable = function( ) {
    this.container.style.pointerEvents = 'none';
    this.container.style.backgroundColor = 'gray';
    this.container.style.opacity = '0.3';
};

DRAGGABLE.ui.Slider.prototype.getValue = function( ) {
    return this.slider.value;
};
