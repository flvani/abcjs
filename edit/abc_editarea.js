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

ABCXJS.edit.EditArea = function (editor_id, listener) {
    
    if(editor_id) {
        this.container = {};
        this.container.topDiv = document.getElementById( editor_id );
        if(this.container.topDiv) {
            var div = document.createElement("DIV");
            div.setAttribute("id", "editorWindow" + editor_id ); 
            this.container.topDiv.appendChild( div );
            this.container.dataDiv = div;
            this.container.dataDiv.setAttribute("class", "editorText fixedSize"); 
        } else {
            alert( 'this.container: elemento "'+editor_id+'" não encontrado.');
        }
    } else {
        this.container = new DRAGGABLE.Div( 
            null
            , [ 'move|Mover', 'dock|Fixar Janela' ]
            , {translate:false, statusBar:true, width: 600, height: 300 }
            , {listener : listener, method: 'editorCallback' }
            , [ 'gutter|Numeração das Linhas', 'fontsize|Tamanho da fonte', 'down|Tom', 'arrowdn|Oitava|Oitava', 'arrowup|Oitava|Oitava', 'search|Procurar', 'undo|Dezfazer', 'redo|Refazer', 'light|Realçar texto' ] 
        );
        this.container.dataDiv.setAttribute("class", "editorText"); 
    }
    
    this.aceEditor = ace.edit(this.container.dataDiv);
    this.aceEditor.setOptions( {highlightActiveLine: true, selectionStyle: "text", cursorStyle: "smooth"/*, maxLines: Infinity*/ } );
    this.aceEditor.setOptions( {fontFamily: "monospace",  fontSize: "11pt", fontWeight: "normal" });
    this.aceEditor.renderer.setOptions( {highlightGutterLine: true, showPrintMargin: false, showFoldWidgets: false } );
    this.aceEditor.$blockScrolling = Infinity;
    this.Range = require("ace/range").Range;
    
    this.setVisible(true);
    this.resize();
    
    this.gutterVisible = true;
    this.syntaxHighLightVisible = true;
    this.isDragging = false;
    this.selectionEnabled = true;
    
    if(listener)
        this.addChangeListener(listener);
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

ABCXJS.edit.EditArea.prototype.setVisible = function (visible) {
    this.container.topDiv.style.display = visible ? 'block' : 'none';
};

ABCXJS.edit.EditArea.prototype.setReadOnly = function (readOnly) {
    this.aceEditor.setOptions({
        readOnly: readOnly,
        highlightActiveLine: !readOnly,
        highlightGutterLine: !readOnly
    });
    
    this.aceditor.textInput.getElement().disabled=readOnly;  
};

ABCXJS.edit.EditArea.prototype.resize = function () {
    
    if( this.container.isResizable && this.container.isResizable() ) {
        var h = this.container.topDiv.clientHeight -
                (this.container.menuDiv ? this.container.menuDiv.clientHeight : 0 ) -
                (this.container.toolBar ? this.container.toolBar.clientHeight : 0 ) -
                (this.container.bottomDiv ? this.container.bottomDiv.clientHeight : 0 );
        this.container.dataDiv.style.height =  h + 'px';
    }
    
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
    
    that.aceEditor.textInput.getElement().addEventListener('keyup', function (ev) {
        if(that.timerId1) clearTimeout(that.timerId1);
        that.timerId1 = setTimeout(function () { 
            listener.updateSelection(); 
        }, 200);	
    });
   
    that.aceEditor.on('dblclick', function () {
        if(that.timerId2) clearTimeout(that.timerId2);
        that.timerId2 = setTimeout(function () { 
            listener.updateSelection(); 
        }, 200);	
    });
    
    that.aceEditor.on('mousedown', function () {
        that.isDragging = true;
        that.aceEditor.on('mouseup', function () {
            if(that.timerId3) clearTimeout(that.timerId3);
            that.timerId3 = setTimeout(function () { 
                listener.updateSelection(); that.isDragging = false;  
            }, 200);	
        });
    });
    
    that.aceEditor.on('change', function () {
        if(listener.refreshController && listener.refreshController.checked && !listener.parsing ) {
            if(that.timerId4) clearTimeout(that.timerId4);
            that.timerId4 = setTimeout(function () { 
                listener.fireChanged( 0, {force:true} ); 
            }, 300);	
        }
    });
};

ABCXJS.edit.EditArea.prototype.getString = function() {
  return this.aceEditor.getValue(); 
};

ABCXJS.edit.EditArea.prototype.setString = function ( str ) {
    var cursorPosition = this.aceEditor.getCursorPosition();
    this.aceEditor.setValue(str);
    this.aceEditor.clearSelection();
    this.initialText = this.getString();
    this.aceEditor.moveCursorToPosition(cursorPosition); 
    
};

ABCXJS.edit.EditArea.prototype.getSelection = function() {
    return this.aceEditor.selection.getAllRanges();
};

ABCXJS.edit.EditArea.prototype.setSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        
        var range = new this.Range(abcelem.position.anchor.line, abcelem.position.anchor.ch, abcelem.position.head.line, abcelem.position.head.ch);

        this.aceEditor.selection.addRange(range);
        if(abcelem.position.selectable || !this.selectionEnabled)
            this.aceEditor.scrollToLine(range.start.row);
    }   
};

ABCXJS.edit.EditArea.prototype.clearSelection = function (abcelem) {
    if (abcelem && abcelem.position) {
        var range = new this.Range(abcelem.position.anchor.line, abcelem.position.anchor.ch, abcelem.position.head.line, abcelem.position.head.ch);
        var aSel = this.getSelection();
        
        this.aceEditor.selection.toSingleRange(); 
        this.aceEditor.clearSelection(); 
        
        for( var r = 0; r < aSel.length; r ++  ) { 
            if( ! aSel[r].isEqual(range) ) {
                this.aceEditor.selection.addRange(aSel[r], false);
            }
        }
    }
};
    

