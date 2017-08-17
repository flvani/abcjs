/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
*/

if (! window.DRAGGABLE )
    window.DRAGGABLE  = {};

if (! window.DRAGGABLE.ui )
    window.DRAGGABLE.ui  = { windowId: 0, menuId: 0 };
        
DRAGGABLE.ui.DropdownMenu = function (topDiv, options, menu) {
    var self = this;
    var opts = options || {};
    this.headers = {};
    
    this.id = ++ DRAGGABLE.ui.menuId;
    
    this.container = ( typeof topDiv === 'object' ) ? topDiv : document.getElementById(topDiv);
    this.listener = opts.listener || null;
    this.method = opts.method || null;
    
    if (!this.container) {
        console.log('Elemento ' + topDiv + ' não existe!');
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
        e2.setAttribute( "data-state", ddmId );
        e2.innerHTML = (menu[m].title || '' ) +'&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        e2.addEventListener( 'click', function(e) {
           e.stopPropagation(); 
           e.preventDefault(); 
           self.eventsCentral(this.getAttribute("data-state"));
        }, false);
        e1.appendChild(e2);
        this.headers[ddmId].btn = e2;
        e2 = document.createElement("div");
        e2.setAttribute( "class", "dropdown-menu customScrollBar" );
        e2.setAttribute( "data-toggle", "toggle-menu" );
        e1.appendChild(e2);
        this.headers[ddmId].div = e2;
        
        e2.addEventListener( 'transitionend', function(e) {
            if( e2.clientHeight > 0 && e2.clientHeight < e2.scrollHeight ) {
                e2.style = 'overflow-y: auto;';
            } else {     
                e2.style = 'overflow-y: hidden;';
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

DRAGGABLE.ui.DropdownMenu.prototype.disableSubMenu = function (ddm) {
    
    if( ! this.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = 'none';
    this.headers[ddm].btn.style.opacity = '0.5';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.enableSubMenu = function (ddm) {
    
    if( ! this.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    this.headers[ddm].chk.checked = false;
    this.headers[ddm].btn.style.pointerEvents = '';
    this.headers[ddm].btn.style.opacity = '';
    
};

DRAGGABLE.ui.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    if( ! this.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    this.headers[ddm].list.innerHTML = "";
    //self.setSubMenuTitle(ddm, '...');
    
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
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    var title = newTitle;
    if(  typeof title !== "string" ) {
        title = newTitle.getElementsByTagName('a')[0].innerHTML;
    } 
    
    if( ! title ) {
        console.log( 'Título não encontrado!' );
        return false;
    }
        
    this.headers[ddm].btn.innerHTML = (title || '' ) +'&#160;<i class="ico-open-down" data-toggle="toggle"></i>';
    
};
    
DRAGGABLE.ui.DropdownMenu.prototype.addItemSubMenu = function (ddm, newItem, pos) {
    
    var self = this;
    var tags = newItem.split('|'); 
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    if( tags[0].substring(0, 3) ===  '---' ) {
        var e4 = document.createElement("hr");
    } else {
        var e4 = document.createElement("li"); 
        var action = tags.length > 1 ? tags[1] : tags[0];
        e4.setAttribute( "id",  action );
        
        var e5 = document.createElement("a");
        e5.innerHTML = tags[0];
        e5.setAttribute( "data-state", ddm );
        e5.setAttribute( "data-value", action );
        e5.addEventListener( 'click', function(e) {
           e.stopPropagation(); 
           e.preventDefault(); 
           self.eventsCentral(this.getAttribute("data-state"), this.getAttribute("data-value") );
        }, false);
        e4.appendChild(e5);
    }
    
    self.headers[ddm].actionList[action]=e4;
    
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
    for( var e in this.headers ) {
        if( e === state ) {
            
            this.headers[e].chk.checked = ! this.headers[e].chk.checked;
            
            if( this.headers[e].chk.checked ) {
                
                var menu = e;
                var self = this;
                var oneTimeCloseFunction = function () { 
                    self.headers[menu].chk.checked = false; 
                    this.removeEventListener('click', oneTimeCloseFunction, false );
                };
                
                document.addEventListener( 'click', oneTimeCloseFunction  );
                
                if( this.headers[e].selectedItem )
                     this.headers[e].div.scrollTop = this.headers[e].selectedItem.offsetTop-115;

            }
            
        } else {
            this.headers[e].chk.checked = false;
        }
    }
    if(event && this.listener){
        this.listener[this.method](event);
    }
};


//DRAGGABLE.ui.DropdownMenu.prototype.closeMenu = function (state) {
//    var e = document.getElementById(state);
//    e.checked=false;
//};
