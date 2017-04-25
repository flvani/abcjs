/* abc_selectors.js
   Implenta alguns objetos para controle de tela, tais como o um seletor de acordeons e um seletor de tonalidades
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.AccordionSelector = function (id, editor) {
    this.selector = document.getElementById(id);
    if (editor) {
        this.addChangeListener(editor);
        if(editor.accordion)
            this.accordion = editor.accordion;
    }
};

ABCXJS.edit.AccordionSelector.prototype.updateAccordionList = function() {
    while(this.selector.options.length > 0){                
        this.selector.remove(0);
    }    
    this.populate();
};

ABCXJS.edit.AccordionSelector.prototype.addChangeListener = function(editor) {
  this.selector.onchange = function() {
    editor.accordion.load(parseInt(this.value));
    editor.accordion.printKeyboard('keyboardDiv' );
    editor.fireChanged( 0, {force: true} );
  };
};
    
ABCXJS.edit.AccordionSelector.prototype.populate = function() {
    for (var i = 0; i < this.accordion.accordions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = this.accordion.accordions[i].getFullName();
        opt.value = i;
        this.selector.appendChild(opt);
    }
};

ABCXJS.edit.AccordionSelector.prototype.set = function(val) {
    this.selector.value = val;
};

ABCXJS.edit.KeySelector = function(id, listener) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }
    if(listener)
        this.addChangeListener(listener);
    
};

ABCXJS.edit.KeySelector.prototype.populate = function(offSet) {
    
    while( this.selector.options.length > 0 ) {
        this.selector.remove(0);
    }            
        
    for (var i = this.cromaticLength+offSet; i >= -this.cromaticLength+2+offSet; i--) {
        var opt = document.createElement('option');
        if(i-1 > offSet) 
            opt.innerHTML = ABCXJS.parse.number2keysharp[(i+this.cromaticLength-1)%this.cromaticLength] ;
        else
            opt.innerHTML = ABCXJS.parse.number2keyflat[(i+this.cromaticLength-1)%this.cromaticLength] ;
        opt.value = (i+this.cromaticLength-1);
        this.selector.appendChild(opt);
    }
    this.oldValue = offSet+this.cromaticLength;
    this.selector.value = offSet+this.cromaticLength;
};

ABCXJS.edit.KeySelector.prototype.set = function(value) {
    this.populate(value);
};

ABCXJS.edit.KeySelector.prototype.addChangeListener = function(editor) {
  this.selector.onchange = function() {
    editor.fireChanged( this.value - editor.keySelector.oldValue, {force: true} );
  };
};

