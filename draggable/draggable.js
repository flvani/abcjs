/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0 };
        
DRAGGABLE.ui.Window = function( parent, aButtons, options, callback, aToolBarButtons ) {
    
    var self = this;
    var opts = options || {};

    this.id = ++ DRAGGABLE.ui.windowId;
    
    this.title = opts.title || '';
    this.top = opts.top || 0;
    this.left = opts.left || 0;
    this.width = opts.width || '';
    this.height = opts.height || '';
    this.minWidth = opts.minWidth ||  160;
    this.minHeight = opts.minHeight ||  48;
    this.hasStatusBar = opts.statusbar || false;
    this.translate = opts.translate || false;
    this.zIndex  = opts.zIndex? opts.zIndex : 100;
    this.draggable = typeof opts.draggable !== 'undefined' ? opts.draggable : true;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" + (this.draggable? "" : " noShadow") ); 
    this.topDiv = div;
    
    this.topDiv.style.zIndex = this.zIndex;
    
    if(!parent) {
        document.body.appendChild(this.topDiv);
    } else {
        if(typeof parent === 'string') {
            this.parent = document.getElementById(parent);
        } else {
            this.parent = parent;
        }
        this.parent.appendChild(this.topDiv);
    }
    
    if( ! this.draggable ) {
        this.topDiv.style.position = "relative";
        this.topDiv.style.margin = "1px";
    } else {
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1;
        this.minLeft = 1;
    }
    
    if(callback) {
        this.defineCallback(callback);
    }
    
    if( this.translate && DR ) {
        this.translate = function() {
        };
        DR.addAgent(this);
    }
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = this.top;
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = this.left;
    if(this.topDiv.style.height === "" ) this.topDiv.style.height = this.height;
    if(this.topDiv.style.width === "" ) this.topDiv.style.width = this.width;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu gradiente" ); 
    this.topDiv.appendChild( div );
    this.menuDiv = div;

    if( aToolBarButtons ) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "dToolBar" +  this.id ); 
        div.setAttribute("class", "draggableToolBar" ); 
        this.topDiv.appendChild( div );
        this.toolBar = div;
    }
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    if( this.hasStatusBar ) {
        
        this.dataDiv.setAttribute("class", "draggableData withStatusBar" ); ;
        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatus" + this.id ); 
        div.setAttribute("class", "draggableStatus" ); 
        this.topDiv.appendChild( div );
        this.bottomBar = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableStatusResize" ); 
        this.bottomBar.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
        
        this.divResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            var touches = e.changedTouches;
            var p = {x: e.clientX, y: e.clientY};

            if (touches) {
                var l = touches.length - 1;
                p.x = touches[l].clientX;
                p.y = touches[l].clientY;
            }
            e.preventDefault();
            var w = (self.topDiv.clientWidth + p.x - self.x);
            var h = (self.topDiv.clientHeight + p.y - self.y);
            self.topDiv.style.width = ( w < self.minWidth ? self.minWidth : w ) + 'px';
            self.topDiv.style.height = ( h < self.minHeight ? self.minHeight : h ) + 'px';

            self.x = p.x;
            self.y = p.y;
            self.eventsCentral('RESIZE');
        };

        this.mouseEndResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            window.removeEventListener('mouseup', self.mouseEndResize, false);
            window.removeEventListener('touchend', self.mouseEndResize, false);
            window.removeEventListener('touchmove', self.divResize, false);
            window.removeEventListener('touchleave', self.divResize, false);
            window.removeEventListener('mousemove', self.divResize, false);
            window.removeEventListener('mouseout', self.divResize, false);
            self.dataDiv.style.pointerEvents = "auto";
            self.eventsCentral('RESIZE');
        };

        this.mouseResize = function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.dataDiv.style.pointerEvents = "none";
            window.addEventListener('mouseup', self.mouseEndResize, false);
            window.addEventListener('touchend', self.mouseEndResize, false);
            window.addEventListener('touchmove', self.divResize, false);
            window.addEventListener('touchleave', self.divResize, false);
            window.addEventListener('mousemove', self.divResize, false);
            window.addEventListener('mouseout', self.divResize, false);
            self.x = e.clientX;
            self.y = e.clientY;
        };

        this.resizeCorner.addEventListener( 'mouseover', function() { self.resizeCorner.style.cursor='nwse-resize'; }, false);
        this.resizeCorner.addEventListener( 'mousedown', this.mouseResize, false);
        this.resizeCorner.addEventListener('touchstart', this.mouseResize, false);
    }
    
    this.divMove = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var touches = e.changedTouches;
        var p = {x: e.clientX, y: e.clientY};

        if (touches) {
            var l = touches.length - 1;
            p.x = touches[l].clientX;
            p.y = touches[l].clientY;
        }
        e.preventDefault();
        var y = ((p.y - self.y) + parseInt(self.topDiv.style.top));
        var x = ((p.x - self.x) + parseInt(self.topDiv.style.left));
        self.topDiv.style.top = (self.minTop && y < self.minTop ? self.minTop: y) + "px"; //hardcoded top of window
        self.topDiv.style.left = (self.minLeft && x < self.minLeft ? self.minLeft: x) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseEndMove = function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.removeEventListener('mouseup', self.mouseEndMove, false);
        window.removeEventListener('touchend', self.mouseEndMove, false);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('touchleave', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        self.eventsCentral('MOVE');
    };
    
    this.mouseMove = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if(!self.draggable) return;
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('mouseup', self.mouseEndMove, false);
        window.addEventListener('touchend', self.mouseEndMove, false);
        window.addEventListener('touchmove', self.divMove, false);
        window.addEventListener('touchleave', self.divMove, false);
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.clientX;
        self.y = e.clientY;
    };

    this.close = function(e) {
        self.topDiv.style.display='none';
    };
    
    this.addButtons( this.id, aButtons );
    this.addToolButtons( this.id, aToolBarButtons );
    this.addTitle( this.id, this.title );
    
    this.titleSpan = document.getElementById("dSpanTitle"+this.id);
    
};

DRAGGABLE.ui.Window.prototype.formatStyleParam = function ( p ) {
    p = (isNaN(p)===false) ? ''+p : p;
    return (p === ''+parseInt(p)? p + 'px' : p );
};

DRAGGABLE.ui.Window.prototype.move = function( left, top ) {
    this.topDiv.style.left = this.formatStyleParam( left );
    this.topDiv.style.top = this.formatStyleParam( top );
};

DRAGGABLE.ui.Window.prototype.setSize = function( width, height ) {
    this.topDiv.style.width = this.formatStyleParam( width ); 
    this.topDiv.style.height = this.formatStyleParam( height ); 
};


DRAGGABLE.ui.Window.prototype.setVisible = function( visible ) {
    this.topDiv.style.display=(visible? 'block':'none');
};

DRAGGABLE.ui.Window.prototype.setToolBarVisible = function (visible) {
    if( this.toolBar ) {
        this.toolBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setStatusBarVisible = function (visible) {
    if( this.bottomBar ) {
        this.bottomBar.style.display = visible ? 'block' : 'none';
        this.resize();
    }
};

DRAGGABLE.ui.Window.prototype.setButtonVisible = function( action, visible ) {
    var b = this.actionList[action.toUpperCase()];
    if( b ) {
        b.style.display = visible? '' : 'none';
    }
};

DRAGGABLE.ui.Window.prototype.setFloating = function (floating) {
    this.draggable = floating;
    
    this.topDiv.style.zIndex = this.draggable? this.zIndex+1: this.zIndex;

    if( this.draggable ) {
        this.topDiv.className = "draggableWindow";
        if(this.parent) {
            this.topDiv.style.position = "absolute";
        }
        this.minTop = 1; // ver isso
        this.minLeft = 1; // ver isso
    } else {
        this.topDiv.className = "draggableWindow noShadow";
        this.topDiv.style.position = "relative";
        this.topDiv.style.margin = "1px";
    }
};

DRAGGABLE.ui.Window.prototype.resize = function() {
    var h = this.topDiv.clientHeight 
            - (this.menuDiv ? this.menuDiv.clientHeight : 0 ) 
            - (this.toolBar && this.toolBar.style.display !== 'none' ? this.toolBar.clientHeight : 0 ) 
            - (this.bottomBar && this.bottomBar.style.display !== 'none' ? this.bottomBar.clientHeight : 0 );
    
    this.dataDiv.style.height =  (h-2) + 'px';
    this.dataDiv.style.width = "100%";
};

DRAGGABLE.ui.Window.prototype.defineCallback = function( cb ) {
    this.callback = cb;
};

DRAGGABLE.ui.Window.prototype.eventsCentral = function (action, elem) {
    if (this.callback) {
        this.callback.listener[this.callback.method]( action, elem);
    } else {
        if (action === 'CLOSE') {
            this.close();
        }
    }
};

DRAGGABLE.ui.Window.prototype.setTitle = function( title ) {
    this.titleSpan.innerHTML = title;
};

DRAGGABLE.ui.Window.prototype.addTitle = function( id, title  ) {
    var self = this;
    
    var div = document.createElement("DIV");
    div.setAttribute("class", "dTitle" ); 
    
    if( title ) {
        if( this.translate ) {
            DR.forcedResource("dSpanTranslatableTitle"+id, title); 
        }
    }
    
    div.innerHTML = '<span id="dSpanTranslatableTitle'+id+'" style="padding-left: 5px;">'+title+
                        '</span><span id="dSpanTitle'+id+'" style="padding-left: 5px; white-space: nowrap;"></span>';
    
    self.menuDiv.appendChild(div);
    
    if(self.draggable && self.menuDiv) {
        self.menuDiv.addEventListener( 'mouseover', function() { self.menuDiv.style.cursor='move'; }, false);
    }
    self.menuDiv.addEventListener( 'mousedown', self.mouseMove, false);
    self.menuDiv.addEventListener('touchstart', self.mouseMove, false);
    
};

DRAGGABLE.ui.Window.prototype.addButtons = function( id,  aButtons ) {
    var defaultButtons = ['close|Fechar'];
    var self = this;
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'world', ZOOM:'zoom-in', HELP:'circle-question', 
                        POPIN: 'popin', POPOUT: 'popout', RESTORE:'restore', MAXIMIZE:'full-screen', APPLY:'tick', PRINT:'printer'  };
    
    if(aButtons)
        defaultButtons = defaultButtons.concat(aButtons);
    
    defaultButtons.forEach( function (label) {
        label = label.split('|');
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var icon = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
        
        if( self.translate ) {
            DR.forcedResource('d'+ action +'ButtonA', rotulo, id, 'd'+ action +'ButtonA'+id); 
        }
        
        var div = document.createElement("DIV");
        div.setAttribute("id", 'd'+ action +'Button'+id ); 
        div.setAttribute("class", "dButton" ); 
        
        if(action === 'MOVE') {
            div.innerHTML = '<i class="'+ icon +' ico-white"></i>';
        } else {
            div.innerHTML = '<a href="" title="'+ rotulo +'"><i class="'+ icon +' ico-white"></i></a>';
        }
        
        self.addAction( action, div, self );
        self.menuDiv.appendChild(div);
        
    });
};

DRAGGABLE.ui.Window.prototype.addAction = function( action, div, self ) {
        
    if(! this.actionList ) {
        this.actionList = {};
    }
    
    this.actionList[action] = div; // salva a lista de acões 
    
    if( action === 'MOVE' ) return; // apenas registra na lista de ações 
    
    var f = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        self.eventsCentral(action, div);
    };
    
    div.addEventListener( 'click', f, false);
    div.addEventListener( 'touchstart', f, false);
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
};

DRAGGABLE.ui.Window.prototype.dispatchAction = function( action ) {
    this.eventsCentral(action, this.actionList[action] );
};

DRAGGABLE.ui.Window.prototype.addToolButtons = function( id,  aButtons ) {
    if(!aButtons) return;
    var self = this;
    
    var buttonMap = { 
        GUTTER:'list-numbered', REFRESH:'bolt', DOWNLOAD:'download', FONTSIZE: 'fontsize', 
        DROPDOWN:'open-down', OCTAVEDOWN:'octave-down', OCTAVEUP:'octave-up', 
        SEARCH:'find-and-replace', 
        UNDO:'undo', UNDOALL:'undo-all', REDO:'redo', REDOALL:'redo-all', LIGHTON:'lightbulb-on', READONLY:'lock-open' };
    
    aButtons.forEach( function (label) {
        label = label.split('|');
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        
        if( self.translate ) {
            DR.forcedResource('d'+ action +'ButtonA', rotulo, id, 'd'+ action +'ButtonA'+id); 
        }
        
        var div = document.createElement("DIV");
        div.id =  'd'+ action +'Button'+id ; 
        self.toolBar.appendChild(div);
        
        if( action === 'DROPDOWN' ) {
            
            div.className = "dButton topMenu";
            
            if( typeof self.menu === "undefined" ) {
                self.menu = {};
            }
                    
            var ddmId = label[2];
            self.menu[ddmId] = new DRAGGABLE.ui.DropdownMenu(
                   div
                ,  self.callback
                ,  [{title: '...', ddmId: ddmId, itens: []}]
            );
    
        } else {
            
            div.className = "dButton";
            
            var icon = 'ico-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
            div.innerHTML = '<a href="" title="'+ rotulo +'"><i class="'+ icon +' ico-black ico-large"></i></a>';
            self.addAction( action, div, self );
            
        }
        
        
    });
};

DRAGGABLE.ui.Window.prototype.addPushButtons = function( aButtons ) {
    for( var p = 0; p < aButtons.length; p ++ ) {
        var ico, claz;
        var part = aButtons[p].split('|');
        var button = document.getElementById(part[0]);
        
        var action = part[1].split('-');

        switch( action[action.length-1] ) {
            case 'SEARCH': 
                ico = 'ico-search';  
                claz = 'pushbutton';  
                break;
            case 'REPLACE': 
                ico = 'ico-redo';  
                claz = 'pushbutton';  
                break;
            case 'REPLACEALL': 
                ico = 'ico-redo-all';  
                claz = 'pushbutton';  
                break;
            case 'YES': 
            case 'APPLY': 
                ico = 'ico-circle-tick';  
                claz = 'pushbutton';  
                break;
            case 'RESET': 
                ico = 'ico-circle-r';     
                claz = 'pushbutton';  
                break;
            case 'NO': 
            case 'CLOSE': 
            case 'CANCEL':
                ico = 'ico-circle-error'; 
                claz = 'pushbutton cancel'; 
                break;
        }
        
        new DRAGGABLE.ui.PushButton(button, claz, ico, part[1], part[2], this );
        
    }
};

DRAGGABLE.ui.Alert = function( parent, action, text, description, options ) {
    
    var x, y, w, h, callback;
    
    options = options? options : {};
    
    this.callback = { listener: this, method: 'alertCallback' };
    
    if(!parent) {
        
        this.parentCallback = null;
        
        // redimensiona a workspace
        var winH = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;

        var winW = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;
        
        x = winW/2-350;
        y = winH/2-150;
        
    } else {
        this.parentCallback = parent.callback;
        x = parent.topDiv.offsetLeft + 50;
        y = parent.topDiv.offsetTop + 50;
    }
    
    var w = ( action ? "500px" : "700px" );
    var h = "auto";
    
    x = options.x !== undefined ? options.x : x;
    y = options.y !== undefined ? options.y : y;
    w = options.w !== undefined ? options.w : w;
    h = options.h !== undefined ? options.h : h;
    
    this.container = new DRAGGABLE.ui.Window(
          null
        , null
        , {title: 'Alerta', translate: false, statusbar: false, top: y+"px", left: x+"px", width: w, height: h, zIndex: 300}
        , this.callback
    );
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-circle-'+(action? 'question' : 'exclamation')+'"></i></div>\n\
        <div class="text-group'+(action? '' : ' wide')+'">\n\
            <div class="title">'+text+'</div>\n\
            <div class="description">'+description+'</div>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Alert"></div>\n\
            <div id="botao2Alert"></div>\n\
        </div>\n\
    </div>';
    
    if( action ) {
    
        this.container.addPushButtons([
            'botao1Alert|'+action+'-YES|Sim',
            'botao2Alert|'+action+'-NO|Não'
        ]);

    } else {
        
        this.container.addPushButtons([
            'botao1Alert|CLOSE|Ok'
        ]);
        
    }   
    this.modalPane = document.getElementById('modalPane');
    
    if( ! this.modalPane ) {
        
        var div = document.createElement("DIV");
        div.id = 'modalPane';
        div.style = "position:absolute; z-index:250; background-color:black; opacity:0.4; top:0; left:0; bottom:0; right:0; pointer-events: block; display:none;";
        document.body.appendChild(div);
        this.modalPane = div;
        
    }    
    
    this.modalPane.style.display = 'block';
        
    this.container.setVisible(true);

};

DRAGGABLE.ui.Alert.prototype.close = function( ) {
    this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.Alert.prototype.alertCallback = function ( action, elem ) {
    switch(action) {
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            if( this.parentCallback )
                this.parentCallback.listener[this.parentCallback.method](action, elem);
    }
};


DRAGGABLE.ui.PushButton = function( item, claz, ico, act, text, janela) {
    this.item = item;
    this.item.className = claz;
    this.item.innerHTML = '<i class="'+ico+'" ></i>'+text+'</div>' ;
    this.item.addEventListener('click', function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        janela.eventsCentral(act, item);
    }, false );
};

DRAGGABLE.ui.ColorPicker = function( itens ) {
    this.container = new DRAGGABLE.ui.Window( 
          null
        , [ 'apply|Selecionar' ]
        , {translate:false, draggable:true, width: "auto", height: "auto", title: 'Selecionar cor', zIndex:"200" }
        , {listener : this, method: 'pickerCallBack' }
    );

    this.container.dataDiv.innerHTML = '\
<div class="picker-group">\
    <canvas id="colorPickerCanvas"></canvas><br>\
    <input id="originalColor"></input>\
    <input id="newColor"></input>\
</div>';
   
    this.originalColor = document.getElementById( 'originalColor' );
    this.newColor = document.getElementById( 'newColor' );
    
    this.cp = new KellyColorPicker({
        place : 'colorPickerCanvas', 
        size : 190, 
        input : 'newColor'  
    });
    
    var self = this;
    
    for( var i = 0; i < itens.length; i++ ) {
        document.getElementById(itens[i]).addEventListener('click', function( e ) { self.activate(this); e.stopPropagation(); } );
    }
};

DRAGGABLE.ui.ColorPicker.prototype.pickerCallBack = function( action, elem ) {
    switch(action) {
        case 'MOVE': 
            break;
        case 'APPLY': 
            this.item.style.backgroundColor = this.item.value = this.newColor.value;
            this.close();
            break;
        case 'CLOSE': 
           this.item.style.backgroundColor = this.item.value = this.originalColor.value;
           this.close();
   }
};

DRAGGABLE.ui.ColorPicker.prototype.close = function( ) {
    this.container.setVisible(false);
};

DRAGGABLE.ui.ColorPicker.prototype.activate = function( parent ) {
    var self = this;
    
    var oneTimeCloseFunction = function () { 
        self.close(); 
        this.removeEventListener('click', oneTimeCloseFunction, false );
    };
    
    document.addEventListener( 'click', oneTimeCloseFunction  );
    
    this.item = parent;
    this.container.topDiv.addEventListener( 'click', function (e) { e.stopPropagation(); } );
    
    this.newColor.value = this.originalColor.value = this.item.value;
    this.originalColor.style.backgroundColor = this.item.value;
    this.cp.setColorByHex(this.item.value);
    
    var bounds = this.item.getBoundingClientRect();
    
    this.container.topDiv.style.top = ( bounds.top + bounds.height/2  -120 ) + "px";
    this.container.topDiv.style.left = bounds.left + bounds.width + 5 + "px";
    this.container.setVisible(true);
};


DRAGGABLE.ui.ReplaceDialog = function( parent ) {
    
    var x, y;
    
    this.parentCallback = parent.callback;
    this.callback = { listener: this, method: 'dialogCallback' };
    x = Math.min( parent.dataDiv.clientWidth/2 - 250, 200);
    y = 20;
    
    this.container = new DRAGGABLE.ui.Window(
          parent.dataDiv
        , null
        , {title: 'Procurar e substituir', translate: false, statusbar: false, top: y+"px", left: x+"px", width: "500px", height:"auto", zIndex: 300}
        , this.callback
    );
    
    this.container.dataDiv.innerHTML = '<div class="dialog" >\n\
        <div class="flag"><i class="ico-find-and-replace"></i></div>\n\
        <div class="text-group">\n\
            <br>Localizar:<input id="searchTerm" type="text" value="nós"></input>\n\
            <br><br>Substituir por: <input id="replaceTerm" type="text" value="vós"></input>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Replace"></div>\n\
            <div id="botao2Replace"></div>\n\
            <div id="botao3Replace"></div>\n\
            <div id="botao4Replace"></div>\n\
        </div>\n\
    </div>';
    
        this.container.addPushButtons([
            'botao1Replace|SEARCH|Localizar',
            'botao2Replace|REPLACE|Substituir',
            'botao3Replace|REPLACEALL|Substituir Tudo',
            'botao4Replace|CANCEL|Cancelar'
        ]);
        
        this.searchTerm = document.getElementById("searchTerm");
        this.replaceTerm = document.getElementById("replaceTerm");
        
    this.container.setVisible(true);

};

DRAGGABLE.ui.ReplaceDialog.prototype.close = function( ) {
    //this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
};

DRAGGABLE.ui.ReplaceDialog.prototype.dialogCallback = function ( action, elem ) {
    switch(action) {
        case 'MOVE': 
           break;
        case 'CLOSE': 
        case 'CANCEL': 
           this.close();
           break;
        default:
            this.parentCallback.listener[this.parentCallback.method]('DO-'+action, elem, this.searchTerm.value, this.replaceTerm.value);
    }
};

