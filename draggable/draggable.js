/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DRAGGABLE)
    window.DRAGGABLE= { id: 0 };

DRAGGABLE.Div = function( parent, aButtons, options, callback, aToolBarButtons ) {
    
    this.id = ++ DRAGGABLE.id ;
    
    var self = this;
    var opts = options || {};

    this.title = opts.title || '';
    this.top = opts.top || 100;
    this.left = opts.left || 100;
    this.width = opts.width || '';
    this.height = opts.height || '';
    this.minTop = opts.minTop ||  1;
    this.minWidth = opts.minWidth ||  160;
    this.minHeight = opts.minHeight ||  48;
    this.hasStatusBar = opts.statusBar || false;
    this.translate = opts.translate || false;

    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" ); 
    this.topDiv = div;
    
    if( opts.zIndex ) {
        this.topDiv.style.zIndex = opts.zIndex;
    }
    
    if(!parent) {
        document.body.appendChild(this.topDiv);
    }else{
        document.getElementById(parent).appendChild(this.topDiv);
    }
    
    if(callback) {
        this.defineCallback(callback);
    }
    
    if( this.translate && DR ) {
        this.translate = function() {
        };
        DR.addAgent(this);
    }
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = this.top+"px";
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = this.left+"px";
    if(this.topDiv.style.height === "" ) this.topDiv.style.height = this.height+"px";
    if(this.topDiv.style.width === "" ) this.topDiv.style.width = this.width+"px";
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu" ); 
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
        this.topDiv.appendChild( div );
        this.resizeCorner = div;
        this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
        
        this.divResize = function (e) {
            self.stopMouse(e);
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
            e.stopPropagation();
            e.preventDefault();
            self.eventsCentral('RESIZE');
        };

        this.mouseResize = function (e) {
            window.addEventListener('mouseup', self.mouseEndResize, false);
            window.addEventListener('touchend', self.mouseEndResize, false);
            self.stopMouse(e);
            self.dataDiv.style.pointerEvents = "none";
            window.addEventListener('touchmove', self.divResize, false);
            window.addEventListener('touchleave', self.divResize, false);
            window.addEventListener('mousemove', self.divResize, false);
            window.addEventListener('mouseout', self.divResize, false);
            self.x = e.clientX;
            self.y = e.clientY;
        };

        this.resizeCorner.addEventListener( 'mouseover', this.resizeCorner.style.cursor='nwse-resize', false);
        this.resizeCorner.addEventListener( 'mousedown', this.mouseResize, false);
        this.resizeCorner.addEventListener('touchstart', this.mouseResize, false);
    }
    
    this.divMove = function (e) {
        self.stopMouse(e);
        var touches = e.changedTouches;
        var p = {x: e.clientX, y: e.clientY};

        if (touches) {
            var l = touches.length - 1;
            p.x = touches[l].clientX;
            p.y = touches[l].clientY;
        }
        e.preventDefault();
        var y = ((p.y - self.y) + parseInt(self.topDiv.style.top));
        self.topDiv.style.top = (self.minTop && y < self.minTop ? self.minTop: y) + "px"; //hardcoded top of window
        self.topDiv.style.left = ((p.x - self.x) + parseInt(self.topDiv.style.left)) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseEndMove = function (e) {
        self.stopMouse(e);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('touchleave', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        self.eventsCentral('MOVE');
    };
    
    this.mouseMove = function (e) {
        window.addEventListener('mouseup', self.mouseEndMove, false);
        window.addEventListener('touchend', self.mouseEndMove, false);
        self.stopMouse(e);
        self.dataDiv.style.pointerEvents = "none";
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
    this.closeButton.addEventListener( 'mousedown', self.stopMouse, false);
    this.closeButton.addEventListener( 'touchstart', self.stopMouse, false);
    
};

DRAGGABLE.Div.prototype.defineCallback = function( cb ) {
    this.callback = cb;
};

DRAGGABLE.Div.prototype.eventsCentral = function (ev) {
    if (this.callback) {
        this.callback.listener[this.callback.method](ev);
    } else {
        if (ev === 'CLOSE') {
            this.close();
        }
    }
};

DRAGGABLE.Div.prototype.isResizable = function(  ) {
    return this.hasStatusBar;
};

DRAGGABLE.Div.prototype.setTitle = function( title ) {
    this.titleSpan.innerHTML = title;
};

DRAGGABLE.Div.prototype.addTitle = function( id, title  ) {
    var self = this;
    
    var div = document.createElement("DIV");
    div.setAttribute("class", "dTitle" ); 
    
    if( title ) {
        if( this.translate ) {
            DR.forcedResource("dSpanTranslatableTitle"+id, title); 
        }
        div.innerHTML = '<span id="dSpanTranslatableTitle'+id+'" style="padding-left: 5px;">'+title+'</span><span id="dSpanTitle'+id+'" style="padding-left: 5px;"></span>';
    }
    self.menuDiv.appendChild(div);
    
    self.menuDiv.addEventListener( 'mousedown', self.mouseMove, false);
    self.menuDiv.addEventListener('touchstart', self.mouseMove, false);
    
};

DRAGGABLE.Div.prototype.addButtons = function( id,  aButtons ) {
    var defaultButtons = ['close|Fechar'];
    var self = this;
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'globe-1', ZOOM:'search-plus', DOCK: 'arrow-down-left' };
    
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
        div.innerHTML = '<a href="" title="'+ rotulo +'"><i class="'+ icon +' ico-lightblue"></i></a>';
        self.menuDiv.appendChild(div);
        div.addEventListener( 'click', function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(action);
        }, false);
        
    });
};

DRAGGABLE.Div.prototype.addToolButtons = function( id,  aButtons ) {
    if(!aButtons) return;
    var self = this;
    
    var buttonMap = { GUTTER:'list-numbered', FONTSIZE: 'fontsize', DOWN:'down-2', ARROWDN:'long-arrow-down', ARROWUP:'long-arrow-up', SEARCH:'search', UNDO:'undo', REDO:'redo', LIGHT:'lightbulb-2' };
    
    aButtons.forEach( function (label) {
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
        div.innerHTML = '<a href="" title="'+ rotulo +'"><i class="'+ icon +' ico-lightblue ico-large"></i></a>';
        self.toolBar.appendChild(div);
        div.addEventListener( 'click', function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(action);
        }, false);
        
    });
};
