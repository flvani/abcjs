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
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0, oneTimeCloseFunction : null, lastOpen: null };
        
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
        
        e2.setAttribute( "data-ddm", ddmId );
        var spn = this.translate ? '<span data-translate="'+ddmId+'" >' :'<span>';
        e2.innerHTML = spn + (menu[m].title || '' ) + '</span>' + '&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        
        e2.addEventListener( 'click', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, false);
        
        e2.addEventListener( 'touchstart', function(e) { 
            e.stopPropagation(); 
            e.preventDefault(); 
            self.eventsCentral(this.getAttribute("data-ddm")); 
        }, false);
 
        e2.addEventListener("keydown",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
        });
            
        e2.addEventListener("keyup",function(e) {
            e.stopPropagation(); 
            e.preventDefault(); 
            var ddm = this.getAttribute("data-ddm");
            switch( e.keyCode ) {
                case 27:
                    if(DRAGGABLE.ui.oneTimeCloseFunction) {
                        DRAGGABLE.ui.oneTimeCloseFunction();
                    }
                    break;
                case 13:
                    if( DRAGGABLE.ui.lastOpen && self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) {
                       //alert(DRAGGABLE.ui.lastOpen+','+self.headers[DRAGGABLE.ui.lastOpen].highlightItem);
                       self.eventsCentral( DRAGGABLE.ui.lastOpen, self.headers[DRAGGABLE.ui.lastOpen].highlightItem ) ;  
                    }
                    break;
                case 38: // up
                case 40: // down
                    if( DRAGGABLE.ui.lastOpen )
                        self.highlightItem( DRAGGABLE.ui.lastOpen, e.keyCode === 38 ) ;  
                    break;
                case 37: // left
                case 39: // right
                    if( DRAGGABLE.ui.lastOpen )
                        self.openMenu(DRAGGABLE.ui.lastOpen, e.keyCode === 37 ); 
                    break;
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
            if( this.clientHeight > 0 && this.clientHeight < this.scrollHeight ) {
                this.style.cssText = 'overflow-y: scroll;';
            } else {     
                this.style.cssText = 'overflow-y: hidden;';
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
    
};

DRAGGABLE.ui.DropdownMenu.prototype.openMenu = function (ddm, previous ) {
    var toSel, next = false, prev;
    for( var item in this.headers ) {
        if(next) {
            toSel = item;
            break;
        }
        if( !previous && item === ddm) {
            next = true;
        } else if (previous && prev && item === ddm ){
            toSel = prev;
            break;
        }
        prev = item;
    }
    if( ! toSel ) return false;
    this.eventsCentral(toSel);
    
};

DRAGGABLE.ui.DropdownMenu.prototype.unhighlightItem = function (menu) {
    if( menu.highlightItem && (!menu.selectedItem || menu.selectedItem !== menu.actionList[menu.highlightItem]) ) {
        menu.actionList[menu.highlightItem].className = '';
        delete menu.highlightItem;
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.highlightItem = function (ddm, up) {
    // up can be true or false (indicating direction) or it can be a string indicating an item
    var toSel = up, next = false, prev;
    var menu = this.headers[ddm];
    var acts = menu.actionList;
    if( typeof up === "boolean" ) {
        toSel = false;
        for( var item in acts ) {
            if(  acts[item].style.pointerEvents === 'none' ){
                continue;
            }
            if( (! menu.highlightItem) || next ) {
                toSel = item;
                break;
            } else if( !up && menu.highlightItem && menu.highlightItem === item ) {
                next = true;
            } else if (up && prev && menu.highlightItem && menu.highlightItem === item ){
                toSel = prev;
                break;
            }
            prev = item;
        }
    }
    
    if(!toSel) return false;
    
    // sempre limpa e registra o item que seria destacado, mesmo que não veja a marcar (item já selecionado).
    this.unhighlightItem( menu );
    menu.highlightItem = toSel;
    
    if( !menu.selectedItem || menu.selectedItem !== acts[menu.highlightItem] ) {
        acts[toSel].className = 'hover';
        
        if( acts[toSel].offsetTop+acts[toSel].clientHeight >  menu.div.scrollTop + menu.div.clientHeight ) {
            menu.div.scrollTop = acts[toSel].offsetTop+acts[toSel].clientHeight-menu.div.clientHeight;
        }
        if( acts[toSel].offsetTop <  menu.div.scrollTop ) {
            menu.div.scrollTop = acts[toSel].offsetTop;
        }
        return toSel;
    }
    return false;
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

DRAGGABLE.ui.DropdownMenu.prototype.eventsCentral = function (ddm, event) {
    var self = this;
    var e = this.headers[ddm];
    e.chk.checked = ! e.chk.checked;
      
    // close any previously opened menu
    if(DRAGGABLE.ui.oneTimeCloseFunction) {
        DRAGGABLE.ui.oneTimeCloseFunction();
    }

    if( e.chk.checked ) {
        DRAGGABLE.ui.oneTimeCloseFunction = function () { 
            e.chk.checked = false; 
            DRAGGABLE.ui.lastOpen = null;
            self.unhighlightItem( e );
            document.removeEventListener('click', DRAGGABLE.ui.oneTimeCloseFunction, false );
            DRAGGABLE.ui.oneTimeCloseFunction = null;
        };

        document.addEventListener( 'click', DRAGGABLE.ui.oneTimeCloseFunction  );
        DRAGGABLE.ui.lastOpen = ddm;

        if( e.selectedItem )
             e.div.scrollTop = e.selectedItem.offsetTop-115;
    }
    
    if(event && this.listener){
        this.listener[this.method](event);
    }
};

DRAGGABLE.ui.DropdownMenu.prototype.addAction = function( ddm, action, div, self ) {
    
    self.headers[ddm].actionList[action]=div; 
    
    div.setAttribute( "data-ddm", ddm );
    div.setAttribute( "data-value", action );
    
    div.addEventListener( 'click', function (e) {
       e.preventDefault(); 
       e.stopPropagation(); 
       self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
    }, false);
    
    var swiping = function(e) {
        e.preventDefault(); 
        e.stopPropagation(); 
        var newY = e.changedTouches[0].pageY;
        var delta = self.startY - newY;
        
        //var m = self.headers[this.getAttribute("data-ddm")].div;
        var m = self.headers[ddm].div; // será que pega o ddm correto?
        
        if( m.style.overflowY === 'scroll' && Math.abs(delta) > 10) {
           var v = m.scrollTop + delta;
           if( v < 0 )
               m.scrollTop = 0;
           else if ( v > ( m.scrollHeight - m.ClientHeight ) ) {
               m.scrollTop = ( m.scrollHeight - m.ClientHeight );
           } else {
               m.scrollTop = v;
           }
           self.startY = newY;
           self.moved = true;
        }
    };
    
    div.addEventListener( 'touchstart', function (e) {
       self.startY = e.changedTouches[0].pageY;
       this.moved = false;
       div.addEventListener( 'touchmove', swiping, false );
       e.preventDefault(); 
       e.stopPropagation(); 
    }, false);
    
    div.addEventListener( 'touchend', function (e) {
        
        div.removeEventListener( 'touchmove', swiping, false );
        
        swiping(e);
        
        if(! self.moved ) {
            e.preventDefault(); 
            e.stopPropagation(); 
            self.eventsCentral(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
        } else {
            alert( 'moveu' );
        }
        
    }, false);
    
    div.addEventListener( 'mousedown', function(e) { e.preventDefault(); e.stopPropagation(); }, false);
    div.addEventListener( 'mouseout', function(e)  { e.preventDefault(); e.stopPropagation(); }, false); 
    
    div.addEventListener( 'mouseover', function(e) { 
        e.preventDefault(); 
        e.stopPropagation(); 
        self.highlightItem(this.getAttribute("data-ddm"), this.getAttribute("data-value") );
    }, false);
    
};

//DRAGGABLE.ui.DropdownMenu.prototype.closeMenu = function (ddm) {
//    var e = document.getElementById(ddm);
//    e.checked=false;
//};
