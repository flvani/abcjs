/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Implements: 
*   - DRAGGABLE.ui.DropdownMenu
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, oneTimeCloseFunction : null };
        
DRAGGABLE.ui.DropdownMenu = function (topDiv, options, menu) {
    var self = this;
    var opts = options || {};
    this.headers = {};
    
    this.id = ++ DRAGGABLE.ui.menuId;
    
    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.listener = opts.listener || null;
    this.method = opts.method || null;
    this.translate = opts.translate || false;
    
    if (!this.container) {
        waterbug.log('Elemento ' + topDiv + ' não existe!');
        return;
    } else {
        this.container.innerHTML = "";
    }
    
    for ( var m = 0; m < menu.length; m++ ) {
        
        var ddmId = menu[m].ddmId || ('ddm' +this.id +m );
        
        var e1 = document.createElement("div");
        e1.setAttribute( "class", 'dropdown' );
        this.container.appendChild(e1);
        
        var e2 = document.createElement("input");
        e2.setAttribute( "type", "checkbox" );
        e1.appendChild(e2);
        this.headers[ddmId] = { div: null, chk: e2, btn: null, list: null, actionList: {} };
        
        e2 = document.createElement("button");
        
        if( menu[m].tip ) {
            e2.setAttribute( "data-translate", ddmId );
            e2.setAttribute( "title", menu[m].tip );
        }
        
        e2.setAttribute( "data-state", ddmId );
        var spn = this.translate ? '<span data-translate="'+ddmId+'" >' :'<span>';
        e2.innerHTML = spn + (menu[m].title || '' ) + '</span>' + '&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        
        e2.addEventListener( 'click', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-state")); 
        }, false);
        
        e2.addEventListener( 'touchstart', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-state")); 
        }, false);
 
        e2.addEventListener("keydown",function(e) {
            if(e.keyCode===13) {
                e.stopPropagation(); 
                e.preventDefault(); 
            }
        });
            
        e2.addEventListener("keyup",function(e) {
            var ddm = this.getAttribute("data-state");
            e.stopPropagation(); 
            e.preventDefault(); 
            switch( e.keyCode ) {
                case 13:
                    if( self.headers[ddm].highlightItem ) {
                       //self.selectItem( ddm, self.headers[ddm].actionList[self.headers[ddm].highlightItem] ) ;  
                       self.eventsCentral( ddm, self.headers[ddm].highlightItem ) ;  
                    }
                    break;
                case 38:
                    self.highlightItem( ddm, true ) ;  
                    break;
                case 40:
                    self.highlightItem( ddm, false ) ;  
                    break
            }
        });
        
        e1.appendChild(e2);
        this.headers[ddmId].btn = e2;
        e2 = document.createElement("div");
        e2.setAttribute( "class", "dropdown-menu customScrollBar" );
        e2.setAttribute( "data-toggle", "toggle-menu" );
        e1.appendChild(e2);
        this.headers[ddmId].div = e2;
        
        e2.addEventListener( 'transitionend', function(e) {
            if( e2.clientHeight > 0 && e2.clientHeight < e2.scrollHeight ) {
                e2.style.cssText = 'overflow-y: scroll;';
            } else {     
                e2.style.cssText = 'overflow-y: hidden;';
            }
        }, false);

        var e3 = document.createElement("ul");
        e2.appendChild(e3);
        this.headers[ddmId].list = e3;
        
        for ( var i = 0; i < menu[m].itens.length; i++ ) {
            this.addItemSubMenu(ddmId, menu[m].itens[i]);
        }
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.dispatchAction = function( ddm, action ) {
    this.headers[ddm].actionList[action].getElementsByTagName('a')[0].click();
};

DRAGGABLE.ui.DropdownMenu.prototype.setVisible = function (visible) {
    this.container.style.display = visible? '' : 'none' ;
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubMenu = function (ddm) {
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return false;
    }
    return this.headers[ddm];
};

DRAGGABLE.ui.DropdownMenu.prototype.getSubItem = function (ddm, item) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    var toSel = item;
    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    return (toSel ?  toSel: false );
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubItem = function (ddm, action) {
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = 'none';
    item.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubItem = function (ddm, action) {
    
    var item = this.getSubItem(ddm,action);
    
    if( ! item ) {
        return false;
    }
    
    item.style.pointerEvents = '';
    item.style.opacity = '';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.disableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = 'none';
    this.headers[ddm].btn.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = '';
    this.headers[ddm].btn.style.opacity = '';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    if( ! this.getSubMenu(ddm) ) {
        return false;
    }
    
    this.headers[ddm].list.innerHTML = "";
    //self.setSubMenuTitle(ddm, '...');
    
};

DRAGGABLE.ui.DropdownMenu.prototype.highlightItem = function (ddm, up) {
    
    var toSel, next = false, prev;
    for( var item in this.headers[ddm].actionList ) {
        if(  this.headers[ddm].actionList[item].style.pointerEvents === 'none' ){
            continue;
        }
        if( (! this.headers[ddm].highlightItem) || next ) {
            toSel = item;
            break;
        } else {
            if( !up && this.headers[ddm].highlightItem && this.headers[ddm].highlightItem === item ) {
                next = true;
            } else if (up && prev && this.headers[ddm].highlightItem && this.headers[ddm].highlightItem === item ){
                toSel = prev;
                break;
            }
        }
        prev = item;
    }
    
    if( ! toSel ) return false;
    
    if( this.headers[ddm].highlightItem && 
            (!this.headers[ddm].selectedItem || this.headers[ddm].selectedItem !== this.headers[ddm].actionList[this.headers[ddm].highlightItem]) ) {
        this.headers[ddm].actionList[this.headers[ddm].highlightItem].className = '';
        delete this.headers[ddm].highlightItem;
    }
    
    if(this.headers[ddm].selectedItem && this.headers[ddm].selectedItem === this.headers[ddm].actionList[toSel] ) {
        
    } else {
        this.headers[ddm].actionList[toSel].className = 'hover';
    }
    
    this.headers[ddm].highlightItem = toSel;
    return toSel;
};

DRAGGABLE.ui.DropdownMenu.prototype.selectItem = function (ddm, item) {
    var toSel = item;
    if(  typeof item === "string" ) {
        toSel = this.headers[ddm].actionList[item];
    } 
    
    if( ! toSel ) return false;
    
    if( this.headers[ddm].selectedItem ) {
        this.headers[ddm].selectedItem.className = '';
    }
    
    toSel.className = 'selected';
    this.headers[ddm].selectedItem = toSel;
    return toSel;
};
    
DRAGGABLE.ui.DropdownMenu.prototype.setSubMenuTitle = function (ddm, newTitle) {
    
    if( ! this.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    var title = newTitle;
    if(  typeof title !== "string" ) {
        title = newTitle.getElementsByTagName('a')[0].innerHTML;
    } 
    
    if( ! title ) {
        waterbug.log( 'Título não encontrado!' );
        return false;
    }
        
    this.headers[ddm].btn.innerHTML = (title || '' ) +'&#160;<i class="ico-open-down" data-toggle="toggle"></i>';
    
};
    
DRAGGABLE.ui.DropdownMenu.prototype.addItemSubMenu = function (ddm, newItem, pos) {
    
    var self = this;
    var tags = newItem.split('|'); 
    
    if( ! self.headers[ddm] ) {
        waterbug.log( 'Menu não encontrado!' );
        return;
    }
    
    if( tags[0].substring(0, 3) ===  '---' ) {
        var e4 = document.createElement("hr");
    } else {
        var e4 = document.createElement("li"); 
        var action = tags.length > 1 ? tags[1] : tags[0];
        e4.setAttribute( "id",  action );
        
        var e5 = document.createElement("a");
        var spn = this.translate ? '<span data-translate="'+action+'" >' :'<span>';
        
        e5.innerHTML = spn + tags[0] + '</span>';
        e4.appendChild(e5);
        
        this.addAction( ddm, action, e4, this);
        
    }
    
    if(pos>=0) {
        self.headers[ddm].list.insertBefore(e4, self.headers[ddm].list.children[pos]);
    } else {
        self.headers[ddm].list.appendChild(e4);
    }  
    
    // added li element
    return e4;
};

DRAGGABLE.ui.DropdownMenu.prototype.setListener = function (listener, method) {
    this.listener = listener || null;
    this.method = method || 'callback';
};

DRAGGABLE.ui.DropdownMenu.prototype.eventsCentral = function (state, event) {
    
    var e = this.headers[state];
    e.chk.checked = ! e.chk.checked;
      
    // close any previously opened menu
    if(DRAGGABLE.ui.oneTimeCloseFunction) {
        DRAGGABLE.ui.oneTimeCloseFunction();
    }

    if( e.chk.checked ) {

        DRAGGABLE.ui.oneTimeCloseFunction = function () { 
            e.chk.checked = false; 
            
            if( e.highlightItem && 
                    (!e.selectedItem || e.selectedItem !== e.actionList[e.highlightItem]) ) {
                                e.actionList[e.highlightItem].className =  '';
                                delete e.highlightItem;
            }
            
            document.removeEventListener('click', DRAGGABLE.ui.oneTimeCloseFunction, false );
            DRAGGABLE.ui.oneTimeCloseFunction = null;
        };

        document.addEventListener( 'click', DRAGGABLE.ui.oneTimeCloseFunction  );

        if( e.selectedItem )
             e.div.scrollTop = e.selectedItem.offsetTop-115;
      
    }
    
    if(event && this.listener){
        this.listener[this.method](event);
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.addAction = function( ddm, action, div, self ) {
    
    self.headers[ddm].actionList[action]=div; 
    
    var f = function(e) {
       e.preventDefault(); 
       e.stopPropagation(); 
       self.eventsCentral(this.getAttribute("data-state"), this.getAttribute("data-value") );
    };
    
    div.setAttribute( "data-state", ddm );
    div.setAttribute( "data-value", action );
    
    div.addEventListener( 'click', f, false);
    div.addEventListener( 'touchstart', f, false);
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
    div.addEventListener( 'mousemove', function(e) { 
        e.preventDefault(); 
        e.stopPropagation();
        if( self.headers[ddm].highlightItem && 
                (!self.headers[ddm].selectedItem || self.headers[ddm].selectedItem !== self.headers[ddm].actionList[self.headers[ddm].highlightItem]) ) {
            self.headers[ddm].actionList[self.headers[ddm].highlightItem].className = '';
            delete self.headers[ddm].highlightItem;
        }
    }, false);
    
};

//DRAGGABLE.ui.DropdownMenu.prototype.closeMenu = function (state) {
//    var e = document.getElementById(state);
//    e.checked=false;
//};
