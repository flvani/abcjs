/* abc_editor.js
 ABCXJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
 holding the text of the tune and calling the parser and the rendering engines.
*/


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
//		parser_options: options to send to the parser engine.
//		midi_options: options to send to the midi engine.
//		render_options: options to send to the render engine.
//		indicate_changed: the dirty flag is set if this is true.
//
// - renderTune(abc, parserparams, div)
//		Immediately renders the tune. (Useful for creating the SVG output behind the scenes, if div is hidden)
//		string abc: the ABC text
//		parserparams: params to send to the parser
//		div: the HTML id to render to.
// - parseABC()
//		Called internally by fireChanged()
//		returns true if there has been a change since last call.
// - updateSelection()
//		Called when the user has changed the selection. This calls the printer to show the selection.
// - highlight(abcelem)
//		Called by the printer to highlight an area.
// - fireChanged()
//		Called by the textarea object when the user has changed something.
// - paramChanged(printerparams)
//		Called to signal that the printer params have changed, so re-rendering should occur.

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.Editor = function (params) {

    var self = this;
    this.fireTime = 0;
    this.printTimeStart = 0;
    this.printTimeEnd = 0;
    this.endTime = 0;

    this.bReentry = false;
    this.accordion = null;
    this.accordionSelector = null;
    this.keySelector = null;
    this.indicate_changed = params.indicate_changed;

    this.parserparams = params.parser_options || {};
    this.printerparams = params.render_options || {};

    if (params.onchange)
        this.onchangeCallback = params.onchange;

    this.studio = new DRAGGABLE.Div(
            params.studio_id
            , ['restore|RESTORE']
            , {translate: false, statusBar: false, draggable: false, top: "3px", left: "1px", width: '100%', height: "100%", title: 'Estúdio ABCX'}
    , {listener: this, method: 'studioCallback'}
    );

    this.resize();
    this.studio.setVisible(true);

    this.editareaFixa = new ABCXJS.edit.EditArea(this.studio.dataDiv, this);

    this.editareaMovel = new ABCXJS.edit.EditArea(null, this);
    this.editareaMovel.setVisible(false);

    this.editarea = this.editareaFixa;

    this.editarea.setVisible(true);
    this.editarea.setToolBarVisible(false);
    this.editarea.resize(true);

    this.controldiv = document.createElement("DIV");
    this.controldiv.setAttribute("id", 'internalControlDiv');
    this.studio.dataDiv.appendChild(this.controldiv);
    this.controldiv.innerHTML = document.getElementById(params.control_id).innerHTML;
    document.getElementById(params.control_id).innerHTML = "";


    var canvas_id = 'internalCanvasDiv';
    var warnings_id = 'internalWarningsDiv';

    if (params.generate_warnings) {
        if (params.warnings_id) {
            warnings_id = params.warnings_id;
        }
        this.warningsdiv = document.createElement("DIV");
        this.warningsdiv.setAttribute("id", warnings_id);
        this.studio.dataDiv.appendChild(this.warningsdiv);
    }

    if (params.canvas_id) {
        canvas_id = params.canvas_id;
    } else if (params.paper_id) {
        canvas_id = params.paper_id;
    }

    this.div = document.createElement("DIV");
    this.div.setAttribute("id", canvas_id);
    this.studio.dataDiv.appendChild(this.div);

    if (params.refreshController_id)
        this.refreshController = document.getElementById(params.refreshController_id);

    if (params.generate_tablature) {
        if (params.generate_tablature === 'accordion') {
            this.accordion = new ABCXJS.tablature.Accordion(params.accordion_options);

            if (params.accordionSelector_id) {
                this.accordionSelector = new ABCXJS.edit.AccordionSelector(params.accordionSelector_id, this);
                this.accordionSelector.populate();
                this.accordionSelector.set(this.accordion.selected);
            } else {
                if (params.accordionNameSpan) {
                    this.accordionNameSpan = document.getElementById(params.accordionNameSpan);
                    this.accordionNameSpan.innerHTML = this.accordion.getName();
                }
            }

            this.keyboardWindow = params.keyboardWindow;
            this.keyboardWindow.defineCallback({listener: this, method: 'keyboardCallback'});

            //this.accordion.printKeyboard(this.keyboardWindow.dataDiv , {fillColor:'yellow', openColor:'navy', closeColor:'purple', backgroundColor:'gray' } );
            this.accordion.printKeyboard(this.keyboardWindow.dataDiv);

        } else {
            throw new Error('Tablatura para ' + params.generate_tablature + ' não suportada!');
        }
    }

    if (params.keySelector_id) {
        this.keySelector = new ABCXJS.edit.KeySelector(params.keySelector_id, this);
    }

    if (params.generate_midi) {
        this.midiParser = new ABCXJS.midi.Parse(params.midi_options);
    }

    printButton = document.getElementById("printBtn");
    playButton = document.getElementById("playBtn");
    pauseButton = document.getElementById("pauseBtn");
    stopButton = document.getElementById("stopBtn");
    textButton = document.getElementById("textBtn");
    roButton = document.getElementById("roBtn");
    showMapButton = document.getElementById("showMapBtn");
    switchSourceButton = document.getElementById("switch_source");
    cpt = document.getElementById("currentPlayTime");

    switchSourceButton.addEventListener("click", function () {
        return;
        a = document.getElementById('abc');
        s = document.getElementById('svg_source');
        if (s.style.display === 'inline') {
            s.style.display = 'none';
            a.style.display = 'inline';
        } else {
            s.value = document.getElementById('canvasDiv').innerHTML;
            s.style.display = 'inline';
            a.style.display = 'none';
        }
    }, false);

    printButton.addEventListener("click", function (e) {
        e.preventDefault();

        //document.getElementById("keyboardDiv").style.display = 'none';
        document.getElementById("editorDiv").style.display = "none";
        document.getElementById("warningsDiv").style.display = "none";
        document.body.style.paddingTop = '0px';

        window.print();

        document.body.style.paddingTop = '240px';
        document.getElementById("warningsDiv").style.display = "inline";
        document.getElementById("editorDiv").style.display = "inline";
        //document.getElementById("keyboardDiv").style.display = kd;
    }, false);

    playButton.addEventListener("click", function (e) {
        e.preventDefault();
        myEditor.accordion.clearKeyboard();
        //myEditor.editarea.cmEditor.setOption("readOnly", true);
        player.startPlay(myEditor.tunes[0].midi);
        //player.startDidacticPlay(myEditor.tunes[0].midi, 'note');
        //player.startDidacticPlay(myEditor.tunes[0].midi, 'measure', 2 );
        //player.startDidacticPlay(myEditor.tunes[0].midi, 'repeat', 1, 4);
    }, false);
    
    var visible = true;
    textButton.addEventListener("click", function (e) {
        e.preventDefault();
        visible = ! visible;
        self.editarea.setVisible(visible);
    }, false);
    
    var readOnly = false;
    roButton.addEventListener("click", function (e) {
        readOnly = !readOnly;
        self.editarea.setReadOnly(readOnly);
    }, false);

    pauseButton.addEventListener("click", function (e) {
        e.preventDefault();
        player.pausePlay();
    }, false);
    
    stopButton.addEventListener("click", function (e) {
        e.preventDefault();
        myEditor.accordion.clearKeyboard();
        player.stopPlay();
    }, false);
    
    showMapButton.addEventListener("click", function (e) {
        e.preventDefault();
        myEditor.switchMap();
        this.value = myEditor.accordion.render_keyboard_opts.show ? 'Hide Map' : 'Show Map';
    }, false);

    this.addClassName = function (element, className) {
        var hasClassName = function (element, className) {
            var elementClassName = element.className;
            return (elementClassName.length > 0 && (elementClassName === className ||
                    new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
        };

        if (!hasClassName(element, className))
            element.className += (element.className ? ' ' : '') + className;
        return element;
    };

    this.removeClassName = function (element, className) {
        element.className = ABCXJS.parse.strip(element.className.replace(
                new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
        return element;
    };
};
  
ABCXJS.Editor.prototype.resize = function( ) {
    
    // redimensiona a workspace
    var winH = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;

    var winW = window.innerWidth
            || document.documentElement.clientWidth
            || daocument.body.clientWidth;

    // -paddingTop 75
    var h = (winH -75 - 10 ); 
    var w = (winW - 10 ); 
    
    this.studio.topDiv.style.height = Math.max(h,200) +"px";
    this.studio.topDiv.style.width = Math.max(w,400) +"px";
    this.studio.dataDiv.style.height = "100%";
  
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

ABCXJS.Editor.prototype.getString = function() {
    return this.editarea.getString();
};

ABCXJS.Editor.prototype.setString = function( text ) {
    this.editarea.setString( text );
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
	this.fireChanged( 0, {force: true} );
};

// return true if the model has changed
ABCXJS.Editor.prototype.parseABC = function(transpose, force ) {
  var t = this.getString();
  if ( (t.length === 0 || t===this.initialText ) && !force ) {
    this.updateSelection();
    return false;
  }
  
  this.initialText = t;
  
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
    this.parsing = true; // tratar melhor essa forma de inibir evento change da editarea durante a atualização da string
    this.setString( abcParser.getStrTune() );
    delete this.parsing;
    
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

//ABCXJS.Editor.prototype.updateSelection = function () {
//    var that = this;
//    var selection = that.editarea.getSelection();
//    try {
//        that.printer.rangeHighlight(selection);
//    } catch (e) {
//    } // maybe printer isn't defined yet?
//};

ABCXJS.Editor.prototype.updateSelection = function (force) {
    var that = this;
    if( force ) {
        var selection = that.editarea.getSelection();
        try {
            that.printer.rangeHighlight(selection);
        } catch (e) {
        } // maybe printer isn't defined yet?
        delete this.updating;
    } else {
        if( this.updating ) return;
        this.updating = true;
        setTimeout( that.updateSelection(true), 300 );
    }
};

ABCXJS.Editor.prototype.switchMap = function() {
    this.accordion.render_keyboard_opts.show = !this.accordion.render_keyboard_opts.show;
    this.keyboardWindow.topDiv.style.display = this.accordion.render_keyboard_opts.show? 'block': 'none';
    this.accordion.printKeyboard(this.keyboardWindow.dataDiv);
};

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
  } catch( e ) {
      // Firefox: aborta se a area não estiver visivel
  } 
};

// call when abc text is changed and needs re-parsing
ABCXJS.Editor.prototype.fireChanged = function (transpose, _opts) {
    var opts = _opts || {};
    var force = opts.force || false;
 
    if ( !force )
        return;

    if (this.parseABC(transpose, force)) {
        
        var self = this;
        if (this.timerId)	// If the user is still typing, cancel the update
            clearTimeout(this.timerId);
        this.timerId = setTimeout(function () { self.modelChanged(); }, 300);	// Is this a good comprimise between responsiveness and not redrawing too much?  
        
    }
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

ABCXJS.Editor.prototype.studioCallback = function (e) {
    switch(e) {
        case 'CLOSE':
            this.studio.setVisible(false);
            break;
        case 'RESTORE':
            break;
    }
};

ABCXJS.Editor.prototype.keyboardCallback = function (e) {
    switch(e) {
        case 'MOVE':
            break;
        case 'CLOSE':
            this.switchMap();
            break;
        case 'ROTATE':
            this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM':
            this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            this.accordion.changeNotation();
            break;
        case 'RESIZE':
            //this.accordion.changeNotation();
            break;
        default:
            alert(e);
    }
};
            
ABCXJS.Editor.prototype.editorCallback = function (e) {
    switch(e) {
        case 'GUTTER': // liga/desliga a numeracao de linhas
            this.editarea.setGutter();
            break;
        case 'LIGHT': // liga/desliga realce de sintaxe
            this.editarea.setSyntaxHighLight();
            break;
        case 'DOCK':
            this.editarea.setVisible(false);
            this.editarea = this.editareaFixa;
            this.editarea.setString(this.editareaMovel.getString());
            this.editarea.setVisible(true);
            break;
        case 'POPOUT':
            this.editarea.setVisible(false);
            this.editarea = this.editareaMovel;
            this.editarea.setString(this.editareaFixa.getString());
            this.editarea.setVisible(true);
            break;
        case 'MOVE':
            break;
        case 'CLOSE':
            this.editarea.setVisible(false);
            //this.editarea = this.editareaFixa;
            //this.editarea.setString(this.editareaMovel.getString());
            //this.editarea.setVisible(true);
            break;
        case 'ROTATE':
            //this.accordion.rotateKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'ZOOM':
            //this.accordion.scaleKeyboard(this.keyboardWindow.dataDiv);
            break;
        case 'GLOBE':
            //this.accordion.changeNotation();
            break;
        case 'RESIZE':
            this.editarea.resize();
            break;
        default:
            alert(e);
    }
};
