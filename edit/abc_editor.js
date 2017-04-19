// abc_editor.js
// ABCXJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
// holding the text of the tune and calling the parser and the rendering engines.
//
// EditArea is an example of using a textarea as the control that is shown to the user. As long as
// the same interface is used, ABCXJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(textareaid)
//		This contains the id of a textarea control that will be used.
// - addChangeListener(listener)
//		A callback class that contains the entry point fireChanged()
// - getSelection()
//		returns the object { start: , end: } with the current selection in characters
// - clearSelection(abcelem)
//		limpa seleção do elemento no texto abc.
// - setSelection(abcelem)
//		seleciona elemento no texto abc.
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

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.AccordionSelector = function(id, accordion) {
  this.selector = document.getElementById(id);
  this.accordion = accordion;
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
        editor.fireChanged( 0, "force" );
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

ABCXJS.edit.KeySelector = function(id) {

    this.selector = document.getElementById(id);
    this.cromaticLength = 12;
    if (this.selector) {
        this.populate(0);
    }
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
    editor.fireChanged( this.value - editor.keySelector.oldValue, "force" );
  };
};

ABCXJS.edit.EditArea = function (textareaid) {
    this.textarea = document.getElementById(textareaid);

    this.aceEditor = ace.edit("textDiv");
    this.aceEditor.setTheme("ace/theme/eclipse");
    this.aceEditor.getSession().setMode("ace/mode/abcx");
    this.aceEditor.setOptions( {highlightActiveLine: false, selectionStyle: "text", cursorStyle: "smooth"} );
    this.aceEditor.renderer.setOptions( {highlightGutterLine: false, showPrintMargin: false, showFoldWidgets: false } );
    this.aceEditor.$blockScrolling = Infinity;
    this.aceEditor.setValue(this.textarea.value);
    this.Range = require("ace/range").Range;

    this.initialText = this.textarea.value;
    this.textChanged = true; // vou usar para recalcular os dados de scroll da textarea
    this.isDragging = false;
    this.changeListener;
};

ABCXJS.edit.EditArea.prototype.addChangeListener = function (listener) {
    var that = this;
    this.changelistener = listener;

//    this.aceEditor.on('mousedown', function (ev) {
//        that.aceEditor.getWrapperElement().onmouseup = function () {
//            that.isDragging = false;
//            listener.updateSelection();
//        };
//        that.isDragging = true;
//    });
//
//    this.aceEditor.on('change', function (ev) {
//        that.textChanged = true; // vou usar para recalcular os dados de scroll da textarea
//        listener.fireChanged();
//    });

};

ABCXJS.edit.EditArea.prototype.getString = function() {
  return this.aceEditor.getValue(); 
};

ABCXJS.edit.EditArea.prototype.setString = function (str, noRefresh) {
    this.textChanged = true; // vou usar para recalcular os dados de scroll da textarea
    this.aceEditor.setValue(str);
    this.aceEditor.clearSelection();

    this.initialText = this.getString();
    
    if (this.changelistener && typeof (noRefresh) === 'undefined') {
        this.changelistener.fireChanged();
    }
};

ABCXJS.edit.EditArea.prototype.getSelection = function() {
    return this.aceEditor.selection.getAllRanges();
};

ABCXJS.edit.EditArea.prototype.setSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        
        var range = new this.Range(abcelem.position.anchor.line, abcelem.position.anchor.ch, abcelem.position.head.line, abcelem.position.head.ch);

        this.aceEditor.selection.addRange(range);
        if(abcelem.position.selectable || !player.playing)
            this.aceEditor.scrollToLine(range.start.row);
    }   
};

ABCXJS.edit.EditArea.prototype.clearSelection = function (abcelem) {
    
    if (abcelem && abcelem.position) {
    //var Range = require("ace/range").Range;

        var range = new this.Range(abcelem.position.anchor.line, abcelem.position.anchor.ch, abcelem.position.head.line, abcelem.position.head.ch);
        var aSel = this.getSelection();
        
        this.aceEditor.selection.toSingleRange(); 
        this.aceEditor.clearSelection(); 
        
        for( var r = 0; r < aSel.length; r ++  ) { // começo em 1 pq parece que codemirror sempre retorna uma posição 0,0 no array[0].
            if( ! aSel[r].isEqual(range) ) {
                this.aceEditor.selection.addRange(aSel[r]);
                //this.aceEditor.scrollToLine(aSel[r].start.row);
            }
        }
    }
};
    
ABCXJS.edit.EditArea.prototype.scrollTo = function(start)
{
  var found = false;  
  var l = 0;
  this.computeScrollData();
  while(!found &&  l < this.totalLines ) {
      if( start > this.lineLimits[l].i+this.lineLimits[l].f ) {
          l ++;
      } else {
          found = true;
      }
  }
  if(!found) return;
  var x =  (start - this.lineLimits[l].i) / this.maxLine;
  
  var top = ((l  / this.totalLines) * this.textarea.scrollHeight)-this.textarea.clientHeight/2;
  
  var left = ( (x<0.33?0:x<0.66?0.33:0.66) ) * this.textarea.scrollWidth;
  
  this.textarea.scrollTop = top;
  this.textarea.scrollLeft = left ;
};

ABCXJS.edit.EditArea.prototype.computeScrollData = function () {
   if ( !this.textChanged ) return;
   var lines = this.textarea.value.split('\n');    
   this.textChanged=false;
   this.totalLines = lines.length;
   this.lineLimits = [];
   this.maxLine = 0;

   var size = 0;
   for( var l=0; l< lines.length; l++ ) {
       this.lineLimits[l] = { i: size, f: lines[l].length };
       size += lines[l].length + 1;
       this.maxLine = Math.max( lines[l].length, this.maxLine );
   }
};

ABCXJS.edit.EditArea.prototype.getElem = function() {
  return this.textarea;
};

//
// ABCXJS.Editor:
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

ABCXJS.Editor = function(editarea, params) {
    
  this.fireTime =0;
  this.printTimeStart =0;
  this.printTimeEnd =0;
  this.endTime =0;
    
  this.oldt = "";
  this.bReentry = false;
  this.accordion = null;
  this.accordionSelector = null;
  this.keySelector = null;
  this.indicate_changed = params.indicate_changed;

  this.parserparams = params.parser_options || {};
  this.printerparams = params.render_options || {};
  
  this.defineOnChangeCallback( params.onchange );

  if (typeof editarea === "string") {
    this.editarea = new ABCXJS.edit.EditArea(editarea);
  } else {
    this.editarea = editarea;
  }

  if (params.abcText && typeof params.abcText === "string") {
    if(params.abcText !== "demo") 
        this.editarea.setString(params.abcText, "noRefresh" ) ;
  } else {
    this.editarea.setString("", "noRefresh" ) ;
  }
  
  if(params.refreshController_id)  
    this.refreshController = document.getElementById(params.refreshController_id);

  if( params.generate_tablature ) {
    if(params.generate_tablature === 'accordion')  {
        this.accordion = new ABCXJS.tablature.Accordion(params.accordion_options);
        
        if( params.accordionSelector_id ) {
            this.accordionSelector = new ABCXJS.edit.AccordionSelector(params.accordionSelector_id, this.accordion);
            this.accordionSelector.populate();
            this.accordionSelector.addChangeListener(this);
            this.accordionSelector.set(this.accordion.selected);
        } else {
            if( params.accordionNameSpan ) {
                this.accordionNameSpan = document.getElementById(params.accordionNameSpan);
                this.accordionNameSpan.innerHTML = this.accordion.getName();
            }
        }
    } else {
        throw new Error( 'Tablatura para '+params.generate_tablature+' não suportada!');
    }
    
    
  }

  if(params.keySelector_id) {  
    this.keySelector = new ABCXJS.edit.KeySelector(params.keySelector_id);
    this.keySelector.addChangeListener(this);
  }  

  //this.editarea.addSelectionListener(this);
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
      this.midiParser = new ABCXJS.midi.Parse( params.midi_options );
  }
  
  if (params.gui) {
    this.target = document.getElementById(editarea);
    this.printerparams.editable = true;
  } 
  
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
    element.className = ABCXJS.parse.strip(element.className.replace(
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
      this.modelChanged();
  }

};

ABCXJS.Editor.prototype.selectAccordionById = function( id ) {
    if( this.accordion ) {
        this.accordion.loadById(id);
        this.doSelAccordion();
    }    
};
ABCXJS.Editor.prototype.selectAccordion = function( n ) {
    if( this.accordion ) {
        this.accordion.load(n);
        this.doSelAccordion();
    }    
};

ABCXJS.Editor.prototype.doSelAccordion = function( ) {
    if( this.accordionSelector ) {
        this.accordionSelector.set(this.accordion.selected);
    } else {
        if( this.accordionNameSpan ) {
            this.accordionNameSpan.innerHTML = this.accordion.getName();
        }
    }
};

ABCXJS.Editor.prototype.defineOnChangeCallback = function( cb ) {
    this.onchangeCallback = cb;
};

ABCXJS.Editor.prototype.getString = function() {
    return this.editarea.getString();
};

ABCXJS.Editor.prototype.setString = function(text, noRefresh) {
    this.editarea.setString( text, noRefresh );
};

ABCXJS.Editor.prototype.renderTune = function (abc, params, div) {

    var tunebook = new ABCXJS.TuneBook(abc);
    var abcParser = new ABCXJS.parse.Parse(this.transposer, this.accordion);
    abcParser.parse(tunebook.tunes[0].abc, params); //TODO handle multiple tunes
    var tune = abcParser.getTune();
    var paper = Raphael(div, 800, 400);
    var printer = new ABCXJS.write.Printer(paper, {});// TODO: handle printer params
    //printer.printABC(tune, {color:'green'} );
    printer.printABC(tune);

};

ABCXJS.Editor.prototype.modelChanged = function() {
    var self = this;
    var loader = this.startLoader( "ModelChanged" );
    this.warningsdiv.innerHTML = '<hr>Aguarde...' ;
    loader.start(  function() { self.modelChanged2(loader); }, '<br>&nbsp;&nbsp;&nbsp;Gerando partitura...<br><br>' );
};

ABCXJS.Editor.prototype.modelChanged2 = function(loader) {
    var self = this;
    
    MIDI.loader = new widgets.Loader();
    
    this.fireTime = new Date();
    
    if (this.tunes === undefined) {
        this.div.innerHTML = "";
        return;
    }

    if (this.bReentry)
        return; // TODO is this likely? maybe, if we rewrite abc immediately w/ abc2abc
    
    this.bReentry = true;
    this.timerId = null;
    this.div.innerHTML = "";
    var paper = new SVG.Printer( this.div );
    this.printer = new ABCXJS.write.Printer(paper, this.printerparams );
    this.printTimeStart = new Date();
    //this.printer.printABC(this.tunes, {color:'red', baseColor:'green'} );
    this.printer.printABC(this.tunes);
    this.printTimeEnd = new Date();
    this.warnings.push('Tempo da impressão: ' + ( (this.printTimeEnd.getTime() -this.printTimeStart.getTime()) /1000).toFixed(2)  + 's');
    
    if (this.target) {
        var textprinter = new ABCXJS.transform.TextPrinter(this.target, true);
        textprinter.printABC(this.tunes[0]); //TODO handle multiple tunes
    }
    
    this.printer.addSelectListener(this);
    this.updateSelection();
    this.bReentry = false;
    
    if (this.onchangeCallback)
        this.onchangeCallback(this);
    
   loader.update( false, '<br>&nbsp;&nbsp;&nbsp;Gerando tablatura...<br><br>' );
   loader.stop();
    
    window.setTimeout(function() {
            self.printWarnings();
    }, 1);
    
    
};

ABCXJS.Editor.prototype.callback = function()  {
    window.scrollTo( 0, window.lastYpos );
};

ABCXJS.Editor.prototype.printWarnings = function()  {
    this.endTime = new Date();
    this.warnings.push('Tempo total: ' + ( (this.endTime.getTime() -this.fireTime.getTime()) /1000).toFixed(2)  + 's');
    
    if (this.warningsdiv) {
        this.warningsdiv.style.color = this.warnings.length > 0 ? "red" : "green";
        this.warningsdiv.innerHTML = '<hr>' + (this.warnings.length > 0 ? this.warnings.join("<br>") : "No warnings or errors.") + '<hr>';
    }
};

ABCXJS.Editor.prototype.startLoader = function(id, start, stop) {

    var loader = new window.widgets.Loader({
         id: id
        ,bars: 0
        ,radius: 0
        ,lineWidth: 20
        ,lineHeight: 70
        ,timeout: 1 // maximum timeout in seconds.
        ,background: "rgba(0,0,0,0.5)"
        ,container: document.body
        ,oncomplete: stop // call function once loader has started	
        ,onstart: start // call function once loader has started	
    });
    return loader;
};


// Call this to reparse in response to the printing parameters changing
ABCXJS.Editor.prototype.paramChanged = function(printerparams) {
	this.printerparams = printerparams;
	this.oldt = "";
	this.fireChanged();
};

// return true if the model has changed
ABCXJS.Editor.prototype.parseABC = function(transpose, force ) {
  var t = this.editarea.getString();
  if ( (t.length === 0 || t===this.oldt ) && typeof(force) === "undefined" ) {
    this.updateSelection();
    return false;
  }
  
  this.oldt = t;
  if (t === "") {
	this.tunes = undefined;
	this.warnings = [];
	return true;
  }
  
  var tunebook = new ABCXJS.TuneBook(t);
  
  this.tunes = [];
  this.warnings = [];
  
  if(typeof transpose !== "undefined") {
      if( this.transposer )
        this.transposer.reset(transpose);
      else
        this.transposer = new ABCXJS.parse.Transposer( transpose );
  }
  
  for (var i=0; i<tunebook.tunes.length; i++) {
    var abcParser = new ABCXJS.parse.Parse( this.transposer, this.accordion );
    abcParser.parse(tunebook.tunes[i].abc, this.parserparams ); //TODO handle multiple tunes
    this.tunes[i] = abcParser.getTune();

    // transposição e geracao de tablatura podem ter alterado o texto ABC
    this.editarea.setString( abcParser.getStrTune(), "noRefresh" );
    
    if( this.transposer && this.keySelector ) {
        this.keySelector.set( this.transposer.keyToNumber( this.transposer.getKeyVoice(0) ) );       
    }

    var warnings = abcParser.getWarnings() || [];
    for (var j=0; j<warnings.length; j++) {
      this.warnings.push(warnings[j]);
    }

    if ( this.midiParser ) {
        this.midiParser.parse( this.tunes[i], this.accordion.getKeyboard() );
         var warnings = this.midiParser.getWarnings();
         for (var j=0; j<warnings.length; j++) {
           this.warnings.push(warnings[j]);
         }
    }
    
  }
  return true;
};

ABCXJS.Editor.prototype.updateSelection = function() {
  var selection = this.editarea.getSelection();
  try {
    this.printer.rangeHighlight(selection);
  } catch (e) {} // maybe printer isn't defined yet?
};

ABCXJS.Editor.prototype.setDirtyStyle = function(isDirty) {
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
    element.className = ABCXJS.parse.strip(element.className.replace(
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
ABCXJS.Editor.prototype.fireChanged = function (transpose, force) {

    if (typeof (force) === "undefined" && this.refreshController && !this.refreshController.checked)
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
//        if (this.onchangeCallback)
//            this.onchangeCallback(this);
    }
};

ABCXJS.Editor.prototype.setNotDirty = function() {
	this.editarea.initialText = this.editarea.getString();
	this.wasDirty = false;
	this.setDirtyStyle(false);
};

ABCXJS.Editor.prototype.isDirty = function() {
	if (this.indicate_changed === undefined)
		return false;
	return this.editarea.initialText !== this.editarea.getString();
};

// seleciona os obo
ABCXJS.Editor.prototype.highlight = function(abcelem) {
  try {
        this.editarea.setSelection(abcelem);
        if(this.accordion.render_keyboard_opts.show && !player.playing) {
            this.accordion.clearKeyboard(true);
            this.midiParser.setSelection(abcelem);
        }    
  } catch( e ) {
      // Firefox: aborta se a area não estiver visivel
  } 
};

// limpa apenas a janela de texto. Os demais elementos são controlados por tempo 
ABCXJS.Editor.prototype.unhighlight = function(abcelem) {
  try {
        this.editarea.clearSelection(abcelem);
//        if(this.accordion.render_keyboard_opts.show && !player.playing) {
//            this.accordion.clearKeyboard(true);
//            this.midiParser.setSelection(abcelem);
//        }    
  } catch( e ) {
      // Firefox: aborta se a area não estiver visivel
  } 
};

ABCXJS.Editor.prototype.pause = function(shouldPause) {
	this.bIsPaused = shouldPause;
	if (!shouldPause)
            this.updateRendering();
};
