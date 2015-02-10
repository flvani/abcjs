// abc_editor.js
// window.ABCXJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
// holding the text of the tune and calling the parser and the rendering engines.
//
// EditArea is an example of using a textarea as the control that is shown to the user. As long as
// the same interface is used, window.ABCXJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(textareaid)
//		This contains the id of a textarea control that will be used.
// - addSelectionListener(listener)
//		A callback class that contains the entry point fireSelectionChanged()
// - addChangeListener(listener)
//		A callback class that contains the entry point fireChanged()
// - getSelection()
//		returns the object { start: , end: } with the current selection in characters
// - setSelection(start, end)
//		start and end are the character positions that should be selected.
// - getString()
//		returns the ABC text that is currently displayed.
// - setString(str)
//		sets the ABC text that is currently displayed, and resets the initialText variable
// - getElem()
//		returns the textarea element
// - string initialText
//		Contains the starting text. This can be compared against the current text to see if anything changed.
//

/*global document, window, clearTimeout, setTimeout */
/*global Raphael */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.edit)
	window.ABCXJS.edit = {};
    

window.ABCXJS.edit.KeySelector = function(id) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }

};

window.ABCXJS.edit.KeySelector.prototype.populate = function(offSet) {
    
    var transposer = new window.ABCXJS.parse.Transposer(0);

    while( this.selector.options.length > 0 ) {
        this.selector.remove(0);
    }            
        
    for (var i = this.cromaticLength+offSet; i >= -this.cromaticLength+2+offSet; i--) {
        var opt = document.createElement('option');
        if(i-1 > offSet) 
            opt.innerHTML = transposer.number2keysharp[(i+this.cromaticLength-1)%this.cromaticLength] ;
        else
            opt.innerHTML = transposer.number2key[(i+this.cromaticLength-1)%this.cromaticLength] ;
        opt.value = (i+this.cromaticLength-1);
        this.selector.appendChild(opt);
    }
    this.oldValue = offSet+this.cromaticLength;
    this.selector.value = offSet+this.cromaticLength;
};

window.ABCXJS.edit.KeySelector.prototype.set = function(value) {
    this.populate(value);
    
};

window.ABCXJS.edit.KeySelector.prototype.addChangeListener = function(editor) {
  this.selector.onchange = function() {
    editor.fireChanged( this.value - editor.keySelector.oldValue, "force" );
  };
};

window.ABCXJS.edit.AccordionSelector = function(id, accordion) {
  this.selector = document.getElementById(id);
  this.accordion = accordion;
};

window.ABCXJS.edit.AccordionSelector.prototype.updateAccordionList = function() {
    while(this.selector.options.length > 0){                
        this.selector.remove(0);
    }    
    this.populate();
};

window.ABCXJS.edit.AccordionSelector.prototype.addChangeListener = function(editor) {
  this.selector.onchange = function() {
    editor.accordion.load(parseInt(this.value));
    editor.fireChanged( 0, "force" );
  };
};
    
window.ABCXJS.edit.AccordionSelector.prototype.populate = function() {
    for (var i = 0; i < this.accordion.accordions.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = this.accordion.accordions[i].getName();
        opt.value = i;
        this.selector.appendChild(opt);
    }
};

window.ABCXJS.edit.AccordionSelector.prototype.set = function(val) {
    this.selector.value = val;
};

window.ABCXJS.edit.EditArea = function(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
  this.changeListener;
};

window.ABCXJS.edit.EditArea.prototype.addSelectionListener = function(listener) {
  this.textarea.onmousemove = function(ev) {
	  if (this.isDragging)
	    listener.fireSelectionChanged();
  };
};

window.ABCXJS.edit.EditArea.prototype.addChangeListener = function(listener) {
  this.changelistener = listener;
  this.textarea.onkeyup = function() {
    listener.fireChanged();
  };
  this.textarea.onmousedown = function() {
	this.isDragging = true;
    listener.fireSelectionChanged();
  };
  this.textarea.onmouseup = function() {
	this.isDragging = false;
    listener.fireChanged();
  };
  this.textarea.onchange = function() {
    listener.fireChanged();
  };
};

//TODO won't work under IE?
window.ABCXJS.edit.EditArea.prototype.getSelection = function() {
  return {start: this.textarea.selectionStart, end: this.textarea.selectionEnd};
};

window.ABCXJS.edit.EditArea.prototype.setSelection = function(start, end) {
	if(this.textarea.setSelectionRange)
	   this.textarea.setSelectionRange(start, end);
	else if(this.textarea.createTextRange) {
		// For IE8
	   var e = this.textarea.createTextRange();
	   e.collapse(true);
	   e.moveEnd('character', end);
	   e.moveStart('character', start);
	   e.select();
	}
  this.textarea.focus();
};

window.ABCXJS.edit.EditArea.prototype.getString = function() {
  return this.textarea.value;
};

window.ABCXJS.edit.EditArea.prototype.setString = function(str, noRefresh ) {
  this.textarea.value = str;
  this.initialText = this.getString();
  if (this.changelistener && typeof( noRefresh ) === 'undefined' ) {
    this.changelistener.fireChanged();
  }
};

window.ABCXJS.edit.EditArea.prototype.appendString = function(str, noRefresh ) {
  //retira \n ao final  
  while( this.textarea.value.charAt(this.textarea.value.length-1) === '\n' ) {
    this.textarea.value = this.textarea.value.substr(0,this.textarea.value.length-1);
  }
      
  this.textarea.value += str;
  this.initialText = this.getString();
  if (this.changelistener && typeof( noRefresh ) === 'undefined' ) {
    this.changelistener.fireChanged();
  }
};

window.ABCXJS.edit.EditArea.prototype.getElem = function() {
  return this.textarea;
};

//
// window.ABCXJS.Editor:
//
// constructor(editarea, params)
//		if editarea is a string, then it is an HTML id of a textarea control.
//		Otherwise, it should be an instantiation of an object that expresses the EditArea interface.
//
//		params is a hash of:
//		canvas_id: or paper_id: HTML id to draw in. If not present, then the drawing happens just below the editor.
//		generate_midi: if present, then midi is generated.
//		midi_id: if present, the HTML id to place the midi control. Otherwise it is placed in the same div as the paper.
//		generate_warnings: if present, then parser warnings are displayed on the page.
//		warnings_id: if present, the HTML id to place the warnings. Otherwise they are placed in the same div as the paper.
//		onchange: if present, the callback function to call whenever there has been a change.
//		gui: if present, the paper can send changes back to the editor (presumably because the user changed something directly.)
//		parser_options: options to send to the parser engine.
//		midi_options: options to send to the midi engine.
//		render_options: options to send to the render engine.
//		indicate_changed: the dirty flag is set if this is true.
//
// - setReadOnly(bool)
//		adds or removes the class abc_textarea_readonly, and adds or removes the attribute readonly=yes
// - setDirtyStyle(bool)
//		adds or removes the class abc_textarea_dirty
// - renderTune(abc, parserparams, div)
//		Immediately renders the tune. (Useful for creating the SVG output behind the scenes, if div is hidden)
//		string abc: the ABC text
//		parserparams: params to send to the parser
//		div: the HTML id to render to.
// - modelChanged()
//		Called when the model has been changed to trigger re-rendering
// - parseABC()
//		Called internally by fireChanged()
//		returns true if there has been a change since last call.
// - updateSelection()
//		Called when the user has changed the selection. This calls the printer to show the selection.
// - fireSelectionChanged()
//		Called by the textarea object when the user has changed the selection.
// - paramChanged(printerparams)
//		Called to signal that the printer params have changed, so re-rendering should occur.
// - fireChanged()
//		Called by the textarea object when the user has changed something.
// - setNotDirty()
//		Called by the client app to reset the dirty flag
// - isDirty()
//		Returns true or false, whether the textarea contains the same text that it started with.
// - highlight(abcelem)
//		Called by the printer to highlight an area.
// - pause(bool)
//		Stops the automatic rendering when the user is typing.
//

window.ABCXJS.Editor = function(editarea, params) {
  if (params.indicate_changed)
    this.indicate_changed = true;

  if (typeof editarea === "string") {
    this.editarea = new window.ABCXJS.edit.EditArea(editarea);
  } else {
    this.editarea = editarea;
  }

  if (params.abcText && typeof params.abcText === "string") {
     this.editarea.setString(params.abcText, "noRefresh" ) ;
  }
  
  if( params.map ) {
      this.map = params.map;
  }

  if(params.refreshController_id)  
    this.refreshController = document.getElementById(params.refreshController_id);

  if(params.accordionSelector_id)  {
    this.accordion = new window.ABCXJS.tablature.Accordion({id: undefined, accordionMaps: params.accordionMaps});
    this.accordionSelector = new window.ABCXJS.edit.AccordionSelector(params.accordionSelector_id, this.accordion);
    this.accordionSelector.populate();
    this.accordionSelector.addChangeListener(this);
  }
  if(params.keySelector_id) {  
    this.keySelector = new window.ABCXJS.edit.KeySelector(params.keySelector_id);
    this.keySelector.addChangeListener(this);
  }  

  this.editarea.addSelectionListener(this);
  this.editarea.addChangeListener(this);

  if (params.canvas_id) {
    this.div = document.getElementById(params.canvas_id);
  } else if (params.paper_id) {
    this.div = document.getElementById(params.paper_id);
  } else {
    this.div = document.createElement("DIV");
    this.editarea.getElem().parentNode.insertBefore(this.div, this.editarea.getElem());
  }
  
  if (params.generate_warnings ) {
    if (params.warnings_id) {
      this.warningsdiv = document.getElementById(params.warnings_id);
    } else {
      this.warningsdiv = this.div;
    }
  }
  
  if( params.generate_midi ) {
      this.midiParser = new ABCXJS.midi.Parse( this.map, params.midi_options );
  }
  
  this.parserparams = params.parser_options || {};

  this.onchangeCallback = params.onchange;

  this.printerparams = params.render_options || {};
  
  if (params.gui) {
    this.target = document.getElementById(editarea);
    this.printerparams.editable = true;
  } 
  
  this.oldt = "";
  this.bReentry = false;

  this.addClassName = function(element, className) {
    var hasClassName = function(element, className) {
      var elementClassName = element.className;
      return (elementClassName.length > 0 && (elementClassName === className ||
        new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    };

    if (!hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  this.removeClassName = function(element, className) {
    element.className = window.ABCXJS.parse.strip(element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };

  this.setReadOnly = function(readOnly) {
	  var readonlyClass = 'abc_textarea_readonly';
	  var el = this.editarea.getElem();
    if (readOnly) {
      el.setAttribute('readonly', 'yes');
	  this.addClassName(el, readonlyClass);
	} else {
      el.removeAttribute('readonly');
	  this.removeClassName(el, readonlyClass);
    }
  };
  
  if( this.parseABC(0) ) {
      this.showUp();
  }

};

window.ABCXJS.Editor.prototype.getString = function() {
    return this.editarea.getString();
};

window.ABCXJS.Editor.prototype.setString = function(text, noRefresh) {
    this.editarea.setString( text, noRefresh );
};

window.ABCXJS.Editor.prototype.showUp = function() {
  this.modelChanged();
};

window.ABCXJS.Editor.prototype.renderTune = function(abc, params, div) {

  var tunebook = new ABCXJS.TuneBook(abc);
  var abcParser = new window.ABCXJS.parse.Parse(this.transposer, this.accordion);
  abcParser.parse(tunebook.tunes[0].abc, params); //TODO handle multiple tunes
  var tune = abcParser.getTune();
  var paper = Raphael(div, 800, 400);
  var printer = new ABCXJS.write.Printer(paper, {});// TODO: handle printer params
  printer.printABC(tune);
 
};

window.ABCXJS.Editor.prototype.modelChanged = function() {
    
    if (this.tunes === undefined) {
        this.div.innerHTML = "";
        return;
    }

    if (this.bReentry)
        return; // TODO is this likely? maybe, if we rewrite abc immediately w/ abc2abc
    
    this.bReentry = true;
    this.timerId = null;
    this.div.innerHTML = "";
    var paper = Raphael(this.div, 1100, 700);
    this.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    this.printer.printABC(this.tunes);
    
    if (this.target) {
        var textprinter = new window.ABCXJS.transform.TextPrinter(this.target, true);
        textprinter.printABC(this.tunes[0]); //TODO handle multiple tunes
    }
    
    if (this.warningsdiv) {
        this.warningsdiv.innerHTML = '<hr>' + (this.warnings ? this.warnings.join("<br>") : "No warnings or errors.");
    }
    
    this.printer.addSelectListener(this);
    this.updateSelection();
    this.bReentry = false;
};

// Call this to reparse in response to the printing parameters changing
window.ABCXJS.Editor.prototype.paramChanged = function(printerparams) {
	this.printerparams = printerparams;
	this.oldt = "";
	this.fireChanged();
};

// return true if the model has changed
window.ABCXJS.Editor.prototype.parseABC = function(transpose, force ) {
  var t = this.editarea.getString();
  if ( (t.length === 0 || t===this.oldt ) && typeof(force) === "undefined" ) {
    this.updateSelection();
    return false;
  }
  
  this.oldt = t;
  if (t === "") {
	this.tunes = undefined;
	this.warnings = "";
	return true;
  }
  
  var tunebook = new ABCXJS.TuneBook(t);
  
  this.tunes = [];
  this.warnings = [];
  
  if(typeof transpose !== "undefined") {
      if( this.transposer )
        this.transposer.reset(transpose);
      else
        this.transposer = new window.ABCXJS.parse.Transposer( transpose );
  }
  
  for (var i=0; i<tunebook.tunes.length; i++) {
    var abcParser = new window.ABCXJS.parse.Parse( this.transposer, this.accordion );
    abcParser.parse(tunebook.tunes[i].abc, this.parserparams ); //TODO handle multiple tunes
    this.tunes[i] = abcParser.getTune();

    if( this.transposer ) { 
        if( this.transposer.offSet !== 0 ) {
          var lines = abcParser.tuneHouseKeeping(tunebook.tunes[i].abc);
          this.editarea.setString( this.transposer.updateEditor( lines ), "norefresh" );
        }
        if(this.keySelector) 
            this.keySelector.set( this.transposer.keyToNumber( this.transposer.getKeyVoice(0) ) );       
    }

    if( this.accordion ) { 
        // obtem possiveis linhas inferidas para tablatura
        this.editarea.appendString( this.accordion.updateEditor() );
    }

    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
      this.warnings.push(warnings[j]);
    }

    if ( this.midiParser ) {
        this.midiParser.parse( this.tunes[i]);
         var warnings = this.midiParser.getWarnings();
         for (var j=0; j<warnings.length; j++) {
           this.warnings.push(warnings[j]);
         }
    }
    
  }
  return true;
};

window.ABCXJS.Editor.prototype.updateSelection = function() {
  var selection = this.editarea.getSelection();
  try {
    this.printer.rangeHighlight(selection.start, selection.end);
  } catch (e) {} // maybe printer isn't defined yet?
};

window.ABCXJS.Editor.prototype.fireSelectionChanged = function() {
  this.updateSelection();
};

window.ABCXJS.Editor.prototype.setDirtyStyle = function(isDirty) {
	if (this.indicate_changed === undefined)
		return;
  var addClassName = function(element, className) {
    var hasClassName = function(element, className) {
      var elementClassName = element.className;
      return (elementClassName.length > 0 && (elementClassName === className ||
        new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    };

    if (!hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  var removeClassName = function(element, className) {
    element.className = window.ABCXJS.parse.strip(element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };
  
	var readonlyClass = 'abc_textarea_dirty';
	var el = this.editarea.getElem();
	if (isDirty) {
		addClassName(el, readonlyClass);
	} else {
		removeClassName(el, readonlyClass);
    }
};

// call when abc text is changed and needs re-parsing
window.ABCXJS.Editor.prototype.fireChanged = function(transpose, force) {
    
  if( typeof(force) ==="undefined" && this.refreshController && ! this.refreshController.checked ) 
      return;
    
  if (this.bIsPaused)
    return;
  if (this.parseABC(transpose, force)) {
    var self = this;
    if (this.timerId)	// If the user is still typing, cancel the update
      clearTimeout(this.timerId);
    this.timerId = setTimeout(function () {
      self.modelChanged();
    }, 300);	// Is this a good comprimise between responsiveness and not redrawing too much?  
	  var isDirty = this.isDirty();
	  if (this.wasDirty !== isDirty) {
		  this.wasDirty = isDirty;
		  this.setDirtyStyle(isDirty);
	  }
	  if (this.onchangeCallback)
		  this.onchangeCallback(this);
	  }
};

window.ABCXJS.Editor.prototype.setNotDirty = function() {
	this.editarea.initialText = this.editarea.getString();
	this.wasDirty = false;
	this.setDirtyStyle(false);
};

window.ABCXJS.Editor.prototype.isDirty = function() {
	if (this.indicate_changed === undefined)
		return false;
	return this.editarea.initialText !== this.editarea.getString();
};

window.ABCXJS.Editor.prototype.highlight = function(abcelem) {
  this.editarea.setSelection(abcelem.startChar, abcelem.endChar);
};

window.ABCXJS.Editor.prototype.pause = function(shouldPause) {
	this.bIsPaused = shouldPause;
	if (!shouldPause)
		this.updateRendering();
};
