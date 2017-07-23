/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!ABCXJS.edit)
	ABCXJS.edit = {};

ABCXJS.edit.element = {id:0};

ABCXJS.edit.DropdownMenu = function (topDiv, options, menu) {
    var self = this;
    var opts = options || {};
    this.headers = {};
    
    this.id = ++ ABCXJS.edit.element.id;
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
        this.headers[ddmId] = { div: null, chk: e2, btn: null, list: null };
        
        e2 = document.createElement("button");
        e2.setAttribute( "data-state", ddmId );
        e2.innerHTML = (menu[m].title || '' ) +'&#160;'+'<i class="ico-open-down" data-toggle="toggle"></i>';
        e2.addEventListener( 'click', function(e) {
           e.stopPropagation(); 
           e.preventDefault(); 
           self.eventsCentral(this.getAttribute("data-state"));
        }, false);
//        e2.addEventListener( 'mouseout', function(e) {
//           e.stopPropagation(); 
//           e.preventDefault(); 
//           self.closeMenu(this.getAttribute("data-state"));
//        }, false);
        e1.appendChild(e2);
        this.headers[ddmId].btn = e2;
        e2 = document.createElement("div");
        e2.setAttribute( "class", "dropdown-menu customScrollBar" );
        e2.setAttribute( "data-toggle", "toggle-menu" );
        e1.appendChild(e2);
        this.headers[ddmId].div = e2;
        
        //element.addEventListener("msTransitionEnd", callfunction,false);
        //element.addEventListener("oTransitionEnd", callfunction,false);
        //element.addEventListener("webkitTransitionEnd", callfunction,false);        
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

ABCXJS.edit.DropdownMenu.prototype.disableSubMenu = function (ddm) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    self.headers[ddm].chk.checked = false;
    self.headers[ddm].btn.style.pointerEvents = 'none';
    self.headers[ddm].btn.style.opacity = '0.5';
    
};

ABCXJS.edit.DropdownMenu.prototype.enableSubMenu = function (ddm) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    self.headers[ddm].chk.checked = false;
    self.headers[ddm].btn.style.pointerEvents = '';
    self.headers[ddm].btn.style.opacity = '';
    
};


ABCXJS.edit.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    self.headers[ddm].list.innerHTML = "";
    //self.setSubMenuTitle(ddm, '...');
    
};

ABCXJS.edit.DropdownMenu.prototype.getItemByName = function (ddm, item) {
    
    var a_elements = this.headers[ddm].list.getElementsByTagName("a");

    for (var i = 0, len = a_elements.length; i < len; i++ ) {
        if( item === a_elements[ i ].innerHTML ) {
            return a_elements[ i ].parentElement;
        }
    }        
    return undefined;
};

//    if( tab.menu.selectItem(tab.ddmId, tab.title) ) {
ABCXJS.edit.DropdownMenu.prototype.selectItem = function (ddm, item) {
    var toSel = item;
    if(  typeof item === "string" ) {
        toSel = this.getItemByName(ddm, item);
    } 
    
    if( ! toSel ) return false;
    
    if( this.headers[ddm].selectedItem ) {
        this.headers[ddm].selectedItem.className = '';
    }
    
    toSel.className = 'selected';
    this.headers[ddm].selectedItem = toSel;
    return true;
};
    
ABCXJS.edit.DropdownMenu.prototype.setSubMenuTitle = function (ddm, newTitle) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    self.headers[ddm].btn.innerHTML = (newTitle || '' ) +'&#160;<i class="ico-open-down" data-toggle="toggle"></i>';
    
};
    
ABCXJS.edit.DropdownMenu.prototype.addItemSubMenu = function (ddm, newItem, pos) {
    
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
    if(pos>=0) {
        self.headers[ddm].list.insertBefore(e4, self.headers[ddm].list.children[pos]);
    } else {
        self.headers[ddm].list.appendChild(e4);
    }  
    
    // added li element
    return e4;
};

ABCXJS.edit.DropdownMenu.prototype.setListener = function (listener, method) {
    this.listener = listener || null;
    this.method = method || 'callback';
};

ABCXJS.edit.DropdownMenu.prototype.eventsCentral = function (state, event) {
    for( var e in this.headers ) {
        if( e === state ) {
            this.headers[e].chk.checked = ! this.headers[e].chk.checked;
            if( this.headers[e].chk.checked && this.headers[e].selectedItem ){
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


//ABCXJS.edit.DropdownMenu.prototype.closeMenu = function (state) {
//    var e = document.getElementById(state);
//    e.checked=false;
//};
