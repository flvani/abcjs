// EditArea is an example of using a ace editor as the control that is shown to the user. As long as
// the same interface is used, ABCXJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(editor_id, listener)
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
// - string initialText
//		Contains the starting text. This can be compared against the current text to see if anything changed.
//

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.EditArea = function (editor_id, callback, options ) {
    
    this.parentCallback = callback;
    this.callback = { listener: this, method: 'editareaCallback' };
    
    this.container = {};
    
    var aToolBotoes = [ 
         'GUTTER|Numeração das Linhas'
        ,'DOWNLOAD|Salvar Local'
        ,'UNDOALL|Dezfazer Tudo'
        ,'UNDO|Dezfazer'
        ,'REDO|Refazer'
        ,'REDOALL|Refazer Tudo'
        ,'REFRESH|Atualizar'
        ,'SEARCH|Localizar e substituir'
        ,'FONTSIZE|Tamanho da fonte'
        ,'DROPDOWN|Tom|selKey'
        ,'OCTAVEDOWN|Oitava|Oitava'
        ,'OCTAVEUP|Oitava|Oitava'
        ,'LIGHTON|Realçar texto'
        ,'READONLY|Bloquear edição' 
    ] ;
    
    options.draggable = typeof( options.draggable ) === 'undefined'? true: options.draggable;
    this.draggagle = options.draggable;
    this.compileOnChange = typeof( options.compileOnChange ) === 'undefined'? false: options.compileOnChange;
    
    var topDiv;
    
    if(typeof editor_id === 'string'  )
        topDiv = document.getElementById( editor_id );
    else 
        topDiv = editor_id;
    
    if(!topDiv) {
        alert( 'this.container: elemento "'+editor_id+'" não encontrado.');
    }
    
    this.container = new DRAGGABLE.ui.Window( 
          topDiv
        , [ 'move|Mover', 'popin|Janela fixa', 'popout|Janela flutuante' , 'maximize|Maximizar janela']
        , options
        , this.callback
        , aToolBotoes
    );
    
    this.keySelector = new ABCXJS.edit.KeySelector( 
        'selKey', this.container.menu['selKey'], this.callback );
        
    this.container.setButtonVisible( 'popout', !this.draggable);
    this.container.setButtonVisible( 'popin', this.draggable );
    this.container.setButtonVisible( 'maximize', this.draggable);
    this.container.setButtonVisible( 'move', this.draggable );
    
    this.currrentFontSize = '15px';
    this.aceEditor = ace.edit(this.container.dataDiv);
    this.aceEditor.setOptions( {highlightActiveLine: true, selectionStyle: "text", cursorStyle: "smooth"/*, maxLines: Infinity*/ } );
    this.aceEditor.setOptions( {fontFamily: "monospace",  fontSize: this.currrentFontSize, fontWeight: "normal" });
    this.aceEditor.renderer.setOptions( {highlightGutterLine: true, showPrintMargin: false, showFoldWidgets: false } );
    this.aceEditor.session.setNewLineMode('unix');
    this.aceEditor.$blockScrolling = Infinity;
    this.Range = require("ace/range").Range;
    this.gutterVisible = true;
    this.syntaxHighLightVisible = true;
    this.selectionEnabled = true;

    this.restartUndoManager();
    this.createStyleSheet();
    
    if(callback.listener)
        this.addChangeListener(callback.listener);
};

ABCXJS.edit.EditArea.prototype.setCompileOnChange = function ( value ) {
    this.compileOnChange = value;
};

ABCXJS.edit.EditArea.prototype.dockWindow = function ( value ) {
    this.draggable = ! value;
    
    this.container.setButtonVisible( 'popout', !this.draggable);
    this.container.setButtonVisible( 'popin', this.draggable );
    this.container.setButtonVisible( 'maximize', this.draggable);
    this.container.setButtonVisible( 'move', this.draggable );
    
    this.container.dockWindow(value);
    
};

ABCXJS.edit.EditArea.prototype.editareaCallback = function ( action, elem, searchTerm, replaceTerm ) {
    switch(action) {
        case 'UNDO': 
            this.undoManager.hasUndo() && this.undoManager.undo(false);
            break;
        case 'REDO': 
            this.undoManager.hasRedo() && this.undoManager.redo(false);
            break;
        case 'UNDOALL': 
            while( this.undoManager.hasUndo() )
                this.undoManager.undo(false);
            break;
        case 'REDOALL': 
            while( this.undoManager.hasRedo() )
                this.undoManager.redo(false);
            break;
        case 'FONTSIZE': 
            switch(this.currrentFontSize) {
                case '15px': this.currrentFontSize = '18px'; break;
                case '18px': this.currrentFontSize = '22px'; break;
                case '22px': this.currrentFontSize = '15px'; break;
            }
            this.aceEditor.setOptions( { fontSize: this.currrentFontSize });
            break;
        case 'DO-SEARCH': 
            this.searchRange = this.aceEditor.find(searchTerm, {
                wrap: true,
                caseSensitive: true, 
                wholeWord: true,
                regExp: false,
                preventScroll: true // do not change selection
            });
            this.aceEditor.selection.setRange(this.searchRange);
            break;
        case 'DO-REPLACE': 
            if(this.searchRange) {
                this.aceEditor.session.replace(this.searchRange, replaceTerm );
            }
            this.searchRange = this.aceEditor.find(searchTerm, {
                wrap: true,
                caseSensitive: true, 
                wholeWord: true,
                regExp: false,
                preventScroll: true // do not change selection
            });
            this.aceEditor.selection.setRange(this.searchRange);
            break;
        case 'DO-REPLACEALL': 
            this.searchRange = true;
            while(this.searchRange) {
                this.searchRange = this.aceEditor.find(searchTerm, {
                    wrap: true,
                    caseSensitive: true, 
                    wholeWord: true,
                    regExp: false,
                    preventScroll: true // do not change selection
                });
                this.aceEditor.session.replace(this.searchRange, replaceTerm );
            }
            break;
        case 'SEARCH': 
            this.alert = new DRAGGABLE.ui.ReplaceDialog( this.container );
            break;
        case 'GUTTER': // liga/desliga a numeracao de linhas
            this.setGutter();
            break;
        case 'READONLY': // habilita/bloqueia a edição
            if( elem.innerHTML.indexOf('ico-lock-open' ) > 0 ) {
                elem.innerHTML = '<a href="" title="Bloquear edição"><i class="ico-lock ico-black ico-large"></i></a>';
                this.setReadOnly(true);
            } else {
                elem.innerHTML = '<a href="" title="Bloquear edição"><i class="ico-lock-open ico-black ico-large"></i></a>';
                this.setReadOnly(false);
            }
            break;
        case 'LIGHTON': // liga/desliga realce de sintaxe
            if( elem.innerHTML.indexOf('ico-lightbulb-on' ) > 0 )
                elem.innerHTML = '<a href="" title="Realçar texto"><i class="ico-lightbulb-off ico-black ico-large"></i></a>';
            else 
                elem.innerHTML = '<a href="" title="Realçar texto"><i class="ico-lightbulb-on ico-black ico-large"></i></a>';
            this.setSyntaxHighLight();
            break;
        case 'RESIZE':
            this.resize();
            this.parentCallback.listener[this.parentCallback.method](action, elem);
            break;
        default:
            this.parentCallback.listener[this.parentCallback.method](action, elem);
    }
};

// Este css é usado apenas quando o playback da partitura está funcionando
// e então a cor de realce é no edidor fica igual a cor de destaque da partitura.
ABCXJS.edit.EditArea.prototype.createStyleSheet = function () {
    this.style = document.createElement('style');
    this.style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(this.style);        
};

ABCXJS.edit.EditArea.prototype.setEditorHighLightStyle = function () {
    this.style.innerHTML = '.ABCXHighLight { background-color: '+ABCXJS.write.color.highLight+' !important; opacity: 0.15; }';
};

ABCXJS.edit.EditArea.prototype.clearEditorHighLightStyle = function () {
    this.style.innerHTML = '.ABCXHighLight { }';
};

ABCXJS.edit.EditArea.prototype.setGutter = function (visible) {
    if(typeof visible === 'boolean') {
        this.gutterVisible = visible;
    } else {
        this.gutterVisible = ! this.gutterVisible;
    }
    this.aceEditor.renderer.setShowGutter(this.gutterVisible);
};

ABCXJS.edit.EditArea.prototype.setSyntaxHighLight = function (visible) {
    if(typeof visible === 'boolean') {
        this.syntaxHighLightVisible = visible;
    } else {
        this.syntaxHighLightVisible = ! this.syntaxHighLightVisible;
    }
    this.aceEditor.getSession().setMode( this.syntaxHighLightVisible?'ace/mode/abcx':'ace/mode/text');
};

ABCXJS.edit.EditArea.prototype.setStatusBarVisible = function (visible) {
    this.container.setStatusBarVisible(visible);
    this.resize();
};

ABCXJS.edit.EditArea.prototype.setToolBarVisible = function (visible) {
    this.container.setToolBarVisible(visible);
    this.resize();
};

ABCXJS.edit.EditArea.prototype.setVisible = function (visible) {
    this.container.topDiv.style.display = visible ? 'block' : 'none';
};

ABCXJS.edit.EditArea.prototype.setReadOnly = function (readOnly) {
    
    this.aceEditor.setOptions({
        readOnly: readOnly,
        highlightActiveLine: !readOnly,
        highlightGutterLine: !readOnly
    });
    
    this.aceEditor.textInput.getElement().disabled=readOnly;  
};

ABCXJS.edit.EditArea.prototype.resize = function () {
    
    this.container.resize();
    this.aceEditor.resize();
    
};

ABCXJS.edit.EditArea.prototype.setOptions = function (editorOptions, rendererOptions ) {
    if(editorOptions) {
        this.aceEditor.setOptions( editorOptions );
    }
    if(rendererOptions) {
        this.aceEditor.renderer.setOptions( rendererOptions );
    }
};

ABCXJS.edit.EditArea.prototype.addChangeListener = function (listener) {
    var that = this;
    
    that.aceEditor.textInput.getElement().addEventListener('keyup', function () {
        if(that.timerId1) clearTimeout(that.timerId1);
        that.timerId1 = setTimeout(function () { listener.updateSelection(); }, 100);	
    });
   
    that.aceEditor.on('dblclick', function () {
        if(that.timerId2) clearTimeout(that.timerId2);
        that.timerId2 = setTimeout(function () { listener.updateSelection(); }, 100);	
    });
    
    that.aceEditor.on('mousedown', function () {
        that.aceEditor.on('mouseup', function () {
            if(that.timerId3) clearTimeout(that.timerId3);
            that.timerId3 = setTimeout(function () { listener.updateSelection(); }, 100);	
        });
    });
    
    that.aceEditor.on('change', function () {
        
        var text  = that.aceEditor.getValue();
        
        if( that.compileOnChange && text !== that.initialText ) {
            that.initialText = text;
            if(that.timerId4) clearTimeout(that.timerId4);
            that.timerId4 = setTimeout(function () { listener.fireChanged( 0, {force:false, showProgress:false} ); }, 300);	
        }
    });
};

ABCXJS.edit.EditArea.prototype.getString = function() {
  return this.aceEditor.getValue(); 
};

ABCXJS.edit.EditArea.prototype.setString = function ( str ) {
    if( str === this.aceEditor.getValue() ) return;
    var cursorPosition = this.aceEditor.getCursorPosition();
    this.aceEditor.setValue(str);
    this.aceEditor.clearSelection();
    this.initialText = this.getString();
    this.aceEditor.moveCursorToPosition(cursorPosition); 
    
};

ABCXJS.edit.EditArea.prototype.restartUndoManager = function ( ) {
    this.aceEditor.getSession().setUndoManager(new ace.UndoManager());
    this.undoManager = this.aceEditor.getSession().getUndoManager();
};

ABCXJS.edit.EditArea.prototype.getSelection = function() {
    return this.aceEditor.selection.getAllRanges();
};

ABCXJS.edit.EditArea.prototype.setSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        this.searchRange = null;
        var range = new this.Range(
            abcelem.position.anchor.line, abcelem.position.anchor.ch, 
            abcelem.position.head.line, abcelem.position.head.ch
        );

        this.aceEditor.selection.addRange(range);
        
        if(abcelem.position.selectable || !this.selectionEnabled)
            this.aceEditor.renderer.scrollCursorIntoView(range.end, 1 );
    }   
};

ABCXJS.edit.EditArea.prototype.clearSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        
        var range = new this.Range(
            abcelem.position.anchor.line, abcelem.position.anchor.ch, 
            abcelem.position.head.line, abcelem.position.head.ch
        );

        this.aceEditor.selection.clearRange(range); 
    }
};
