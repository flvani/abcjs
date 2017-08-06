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
    //this.minTop = opts.minTop ||  1;
    this.minWidth = opts.minWidth ||  160;
    this.minHeight = opts.minHeight ||  48;
    this.hasStatusBar = opts.statusBar || false;
    this.translate = opts.translate || false;
    this.closeAction = 'CLOSE';
    this.draggable = typeof opts.draggable !== 'undefined' ? opts.draggable : true;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" + (this.draggable? "" : " noShadow") ); 
    this.topDiv = div;
    
    if( opts.zIndex ) {
        this.topDiv.style.zIndex = opts.zIndex;
    }
    
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
            // encontrar um jeito eficiente de limitar a janela filha dentro da principal
            
//            var yPos = 0;
//            var tempEl = this.topDiv;
//
//            while ( tempEl !== null ) 
//            {
//                yPos += tempEl.getBoundingClientRect().top;
//                tempEl = tempEl.parentElement;
//            }              
//                
//            this.minTop = yPos;
//            this.minLeft = childOffset.left;
            
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
    
    this.stopMouse = function (e) {
        e.stopPropagation();
        //e.preventDefault();
    };
    
    if( this.hasStatusBar ) {
        
        this.dataDiv.setAttribute("class", "draggableData withStatusBar" ); ;
        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatus" + this.id ); 
        div.setAttribute("class", "draggableStatus" ); 
        this.topDiv.appendChild( div );
        this.bottomDiv = div;

        div = document.createElement("DIV");
        div.setAttribute("id", "draggableStatusResize" + this.id ); 
        div.setAttribute("class", "draggableStatusResize" ); 
        this.bottomDiv.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
        
        this.divResize = function (e) {
            e.stopPropagation();
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
            window.removeEventListener('touchmove', self.divResize, false);
            window.removeEventListener('touchleave', self.divResize, false);
            window.removeEventListener('mousemove', self.divResize, false);
            window.removeEventListener('mouseout', self.divResize, false);
            self.dataDiv.style.pointerEvents = "auto";
            self.eventsCentral('RESIZE');
        };

        this.mouseResize = function (e) {
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
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('touchleave', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        self.eventsCentral('MOVE');
    };
    
    this.mouseMove = function (e) {
        e.preventDefault();
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
    
    this.closeButton = document.getElementById("dCLOSEButton"+this.id);
    this.closeButton.addEventListener( 'mousedown', function (e) { e.stopPropagation(); }, false);
    this.closeButton.addEventListener( 'touchstart', function (e) { e.stopPropagation(); }, false);
    
};

DRAGGABLE.ui.Window.prototype.move = function( left, top ) {
    this.topDiv.style.left = ( parseInt(left) ? parseInt(left) + 'px' : left );
    this.topDiv.style.top = ( parseInt(top) ? parseInt(top) + 'px' : top );
};

DRAGGABLE.ui.Window.prototype.resize = function( ) {
    
    var h = this.topDiv.clientHeight 
            - (this.menuDiv ? this.menuDiv.clientHeight : 0 ) 
            - (this.toolBar ? this.toolBar.clientHeight : 0 ) 
            - (this.bottomDiv ? this.bottomDiv.clientHeight : 0 );
    
    this.dataDiv.style.height =  (h-2) + 'px';
    
    if(this.parent && !this.draggable) {
        this.topDiv.style.width =  (this.parent.clientWidth-5) + 'px';
    }

};

DRAGGABLE.ui.Window.prototype.defineCallback = function( cb ) {
    this.callback = cb;
};

DRAGGABLE.ui.Window.prototype.modifyCloseAction = function( newAction ) {
    this.closeAction = newAction;
};

DRAGGABLE.ui.Window.prototype.eventsCentral = function (action, elem) {
    if (this.callback) {
        this.callback.listener[this.callback.method](( action === 'CLOSE' ? this.closeAction : action ), elem);
    } else {
        if (action === 'CLOSE') {
            this.close();
        }
    }
};

DRAGGABLE.ui.Window.prototype.isResizable = function(  ) {
    return this.hasStatusBar;
};

DRAGGABLE.ui.Window.prototype.setVisible = function( visible ) {
    this.topDiv.style.display=(visible? 'block':'none');
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
    
    div.innerHTML = '<span id="dSpanTranslatableTitle'+id+'" style="padding-left: 5px;">'+title+'</span><span id="dSpanTitle'+id+'" style="padding-left: 5px;"></span>';
    
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
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'world', ZOOM:'zoom-in', 
                        POPIN: 'popin', POPOUT: 'popout', RESTORE:'restore', MAXIMIZE:'full-screen', APPLY:'tick'  };
    
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
        div.innerHTML = '<a href="" title="'+ rotulo +'"><i class="'+ icon +' ico-white"></i></a>';
        self.menuDiv.appendChild(div);
        div.addEventListener( 'click', function(e) {
            e.preventDefault(); 
            e.stopPropagation(); 
            self.eventsCentral(action, div);
        }, false);
        div.addEventListener( 'touchstart', function(e) {
            e.preventDefault(); 
            e.stopPropagation(); 
            self.eventsCentral(action, div);
        }, false);
        
    });
};

DRAGGABLE.ui.Window.prototype.addToolButtons = function( id,  aButtons ) {
    if(!aButtons) return;
    var self = this;
    
    var buttonMap = { GUTTER:'list-numbered', DOWNLAOD:'download', FONTSIZE: 'fontsize', DROPDOWN:'open-down', OCTAVEDOWN:'octave-down', OCTAVEUP:'octave-up', 
                        SEARCH:'find-and-replace', UNDO:'undo', REDO:'redo', LIGHTON:'lightbulb-on', READONLY:'lock-open' };
    
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
            div.addEventListener( 'click', function(e) {
                e.preventDefault(); 
                e.stopPropagation(); 
                self.eventsCentral(action, div);
            }, false);
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
            case 'CANCEL':
                ico = 'ico-circle-error'; 
                claz = 'pushbutton cancel'; 
                break;
        }
        
        new DRAGGABLE.ui.PushButton(button, claz, ico, part[1], part[2], this );
        
    }
};

DRAGGABLE.ui.Alert = function( parent, action, text, description ) {
    
    this.container = new DRAGGABLE.ui.Window(
          null
        , null
        , {title: 'Alerta', translate: false, statusBar: false, top: "100px", left: "300px",  zIndex: 300}
        , parent.callback
    );
    
    this.container.dataDiv.innerHTML = '<div class="alert" >\n\
        <div class="flag"><i class="ico-circle-exclamation"></i></div>\n\
        <div class="text-group">\n\
            <div class="title">'+text+'</div>\n\
            <div class="descrition">'+description+'</div>\n\
        </div>\n\
        <div id="pgAlert" class="pushbutton-group" style="right: 0; bottom: 0;" >\
            <div id="botao1Alert"></div>\n\
            <div id="botao2Alert"></div>\n\
        </div>\n\
    </div>';
    
    this.container.addPushButtons([
        'botao1Alert|'+action+'-YES|Sim',
        'botao2Alert|'+action+'-NO|Não'
    ]);
    
    this.container.modifyCloseAction(action+'-CANCEL');

    this.modalPane = document.getElementById('modalPane');
    
    if( ! this.modalPane ) {
        
        var div = document.createElement("DIV");
        div.id = 'modalPane';
        div.style = "position:absolute; z-index:250; background-color:black; opacity:0.4; top:0; left:0; bottom:0; right:0; pointer-events: block; display:none;";
        document.body.appendChild(div);
        this.modalPane = div;
        
    }    
    
    this.modalPane.style.display = 'block';
    this.container.move( parent.topDiv.offsetLeft + 50, parent.topDiv.offsetTop+ 50 );
        
    this.container.setVisible(true);

};

DRAGGABLE.ui.Alert.prototype.close = function( ) {
    this.modalPane.style.display = 'none';
    this.container.setVisible(false);
    this.container.topDiv.remove();
    this.container = null;
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
            this.container.setVisible(false);
            break;
        case 'CLOSE': 
           this.item.style.backgroundColor = this.item.value = this.originalColor.value;
           this.container.setVisible(false);
   }
};

DRAGGABLE.ui.ColorPicker.prototype.activate = function( parent ) {
    var self = this;
    
    var oneTimeCloseFunction = function () { 
        self.container.setVisible(false); 
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
