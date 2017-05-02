/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DRAGGABLE)
    window.DRAGGABLE= {};

DRAGGABLE.Div = function(id, parent, title, aButtons, callBack, translate ) {
    var self = this;
    this.id = id;
    
    this.translate = false;
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "draggableWindow" +  this.id ); 
    div.setAttribute("class", "draggableWindow" ); 
    this.topDiv = div;
    this.minTop = 1;
    this.minWidth = 160;
    this.minHeight = 48;
    
    if(!parent) {
        document.body.appendChild(this.topDiv);
    }else{
        document.getElementById(parent).appendChild(this.topDiv);
    }
    
    if( translate && DR ) {
        this.translate = function() {
        };
        DR.addAgent(this);
    }
    
    //self.topDiv.style.position = "fixed";
    
    if(this.topDiv.style.top === "" ) this.topDiv.style.top = "100px";
    if(this.topDiv.style.left === "" ) this.topDiv.style.left = "100px";
    
    this.marginTop  = this.topDiv.offsetTop - parseInt(this.topDiv.style.top) ;
    this.marginLeft = this.topDiv.offsetLeft - parseInt(this.topDiv.style.left);
    
    var div = document.createElement("DIV");
    div.setAttribute("id", "dMenu" +  this.id ); 
    div.setAttribute("class", "draggableMenu" ); 
    div.innerHTML = this.addButtons(this.id, aButtons, callBack ) + this.addTitle(this.id, title );
    this.topDiv.appendChild( div );
    this.menuDiv = div;
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableData" + this.id ); 
    div.setAttribute("class", "draggableData" ); 
    this.topDiv.appendChild( div );
    this.dataDiv = div;
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableStatus" + this.id ); 
    div.setAttribute("class", "draggableStatus" ); 
    this.topDiv.appendChild( div );
    this.bottomDiv = div;
    //this.bottomDiv.innerHTML = 'ISTO É UM TESTE!!!!';
    
    div = document.createElement("DIV");
    div.setAttribute("id", "draggableStatusResize" + this.id ); 
    div.setAttribute("class", "draggableStatusResize" ); 
    this.topDiv.appendChild( div );
    this.resizeCorner = div;
    this.resizeCorner.innerHTML = '<img src="images/statusbar_resize.gif">';
    
    this.titleSpan = document.getElementById("dSpanTitle"+this.id);
    this.moveButton = document.getElementById("dMenu"+this.id);
    this.closeButton = document.getElementById("dCLOSEButton"+this.id);
    

    /*
	el.addEventListener('touchstart', touchEvent.startEv, false);
	el.addEventListener('mousedown', touchEvent.startEv, false);

	// TouchMove or MouseMove
	el.addEventListener('touchmove', touchEvent.moveEv, false);
	el.addEventListener('mousemove', touchEvent.moveEv, false);

	// TouchEnd or MouseUp
	el.addEventListener('touchend', touchEvent.endEv, false);
	el.addEventListener('mouseup', touchEvent.endEv, false);
    
    */
    
    //TODO: tratar todos os botões da janela com stopMouse
    this.closeButton.addEventListener( 'mousedown', this.stopMouse, false);
    this.closeButton.addEventListener( 'touchstart', this.stopMouse, false);
    
    this.stopMouse = function (e) {
        e.stopPropagation();
        //e.preventDefault();
    };
    
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
        if(callBack) {
            window[callBack]('MOVE');
        }
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

    this.moveButton.addEventListener( 'mousedown', this.mouseMove, false);
    this.moveButton.addEventListener('touchstart', this.mouseMove, false);
    
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
    };

    this.mouseEndResize = function (e) {
        window.removeEventListener('touchmove', self.divResize, false);
        window.removeEventListener('touchleave', self.divResize, false);
        window.removeEventListener('mousemove', self.divResize, false);
        window.removeEventListener('mouseout', self.divResize, false);
        self.dataDiv.style.pointerEvents = "auto";
        e.stopPropagation();
        e.preventDefault();
        if(callBack) {
            window[callBack]('RESIZE');
        }
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
    
    
    this.resizeCorner.addEventListener( 'mousedown', this.mouseResize, false);
    this.resizeCorner.addEventListener('touchstart', this.mouseResize, false);
    
    this.close = function(e) {
        self.topDiv.style.display='none';
    };
    
    if(!callBack) {
        this.closeButton.addEventListener( 'click', this.close, false);
    }
    
};

DRAGGABLE.Div.prototype.setTitle = function( title ) {
    this.titleSpan.innerHTML = title;
};

DRAGGABLE.Div.prototype.addTitle = function( id, title  ) {
    if( this.translate ) {
        DR.forcedResource("dSpanTranslatableTitle"+id, title); 
    }
    return '<div class="dTitle"><span id="dSpanTranslatableTitle'+id+'" style="padding-left: 5px;">'+title+'</span><span id="dSpanTitle'+id+'" style="padding-left: 5px;"></span></div>';
};

DRAGGABLE.Div.prototype.addButtons = function( id,  aButtons, callBack ) {
    var defaultButtons = ['close|Fechar'];
    var txt = "";
    var self = this;
    var txtCallback;
    
    var buttonMap = { CLOSE: 'close', MOVE: 'move', ROTATE: 'rotate', GLOBE: 'globe-1', ZOOM:'search-plus' };
    
    if(aButtons)
        defaultButtons = defaultButtons.concat(aButtons);
    
    defaultButtons.forEach( function (label) {
        label = label.split('|');
        var action = label[0].toUpperCase();
        var rotulo = label.length > 1 ? label[1] : "";
        var icon = 'icon-' + (buttonMap[action] ? buttonMap[action] : action.toLowerCase());
        
        if( self.translate ) {
            DR.forcedResource('d'+ action +'ButtonA', rotulo, id, 'd'+ action +'ButtonA'+id); 
        }
        if( callBack ) {
            txtCallback = callBack+'(\''+action+'\');';
        }

        txt += '<div id="d'+ action +'Button'+id+
                '" class="dButton"><a href="#" id="d'+ action +'ButtonA'+id+'" title="'+ rotulo +
                '" onclick="'+txtCallback+'"><i class="'+ icon + ' icon-lightblue"></i></a></div>';
    });
    return txt;
};
