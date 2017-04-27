/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


if (!window.DRAGGABLE)
    window.DRAGGABLE= {};

DRAGGABLE.Div = function(id, topDiv, title, aButtons, callBack, translate ) {
    var self = this;
    this.translate = false;
    this.topDiv = document.getElementById(topDiv);
    
    if(!this.topDiv) {
        // criar uma div
        return;
    }    
    
    if( translate && DR ) {
        this.translate = function() {
        };
        DR.addAgent(this);
    }
    
    this.id = id;
    
    self.topDiv.style.position = "fixed";
    
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
        self.topDiv.style.top = (y < 43 ? 43 : y) + "px"; //hardcoded top of window
        self.topDiv.style.left = ((p.x - self.x) + parseInt(self.topDiv.style.left)) + "px";
        self.x = p.x;
        self.y = p.y;
    };

    this.mouseUp = function (e) {
        self.stopMouse(e);
        window.removeEventListener('touchmove', self.divMove, false);
        window.removeEventListener('mousemove', self.divMove, false);
        window.removeEventListener('mouseout', self.divMove, false);
        self.dataDiv.style.pointerEvents = "auto";
        if(callBack) {
            window[callBack]('MOVE');
        }
    };

    this.mouseDown = function (e) {
        window.addEventListener('mouseup', self.mouseUp, false);
        window.addEventListener('touchend', self.mouseUp, false);
        self.stopMouse(e);
        self.dataDiv.style.pointerEvents = "none";
        window.addEventListener('touchmove', self.divMove, false);
        window.addEventListener('touchleave', self.divMove, false);
        window.addEventListener('mousemove', self.divMove, false);
        window.addEventListener('mouseout', self.divMove, false);
        self.x = e.clientX;
        self.y = e.clientY;
    };
    
    //TODO: tratar todos os botões da janela com stopMouse
    this.closeButton.addEventListener( 'mousedown', this.stopMouse, false);
    this.closeButton.addEventListener( 'touchstart', this.stopMouse, false);
    this.moveButton.addEventListener( 'mousedown', this.mouseDown, false);
    this.moveButton.addEventListener('touchstart', this.mouseDown, false);
    
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
    
    var buttonMap = { CLOSE: 'window-close', MOVE: 'move', ROTATE: 'retweet-3', GLOBE: 'globe-2', ZOOM:'zoom-in-1' };
    
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
                '" onclick="'+txtCallback+'"><i class="'+ icon + '"></i></a></div>';
    });
    return txt;
};
