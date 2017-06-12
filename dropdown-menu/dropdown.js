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
    this.container = document.getElementById(topDiv);
    this.title = opts.title || '';
    this.listener = opts.listener || null;
    this.method = opts.method || null;
    
    if (!this.container) {
        console.log('Elemento ' + topDiv + ' não existe!');
        return;
    }
    
    if( this.title ) {
        var e = document.createElement("h1");
        e.setAttribute( "class", 'dropdown-title-font' );
        e.innerHTML = this.title;
        this.container.appendChild(e);
        this.title = e;
    }
    
    for ( var m = 0; m < menu.length; m++ ) {
        
        var ddmId = menu[m].ddmId || ('ddm' +this.id +m );
        
        var e1 = document.createElement("div");
        e1.setAttribute( "class", 'dropdown' );
        this.container.appendChild(e1);
        
        var e2 = document.createElement("input");
        e2.setAttribute( "type", "checkbox" );
        e1.appendChild(e2);
        this.headers[ddmId] = { chk: e2, btn: null, list: null };
        
        e2 = document.createElement("button");
        e2.setAttribute( "data-state", ddmId );
        e2.innerHTML = (menu[m].title.replaceAll( ' ', '&nbsp;' ) || '' ) +'&nbsp;&nbsp;'+'<i class="ico-down-2" data-toggle="toggle"></i>';
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
        e2.setAttribute( "class", "dropdown-menu dropdown-menu-font" );
        e2.setAttribute( "data-toggle", "toggle-menu" );
        if(typeof(menu[m].scroll) !== 'undefined' && !menu[m].scroll ) {
            e2.style = 'overflow-y: hidden;';
        }
        e1.appendChild(e2);
        
        var e3 = document.createElement("ul");
        e2.appendChild(e3);
        this.headers[ddmId].list = e3;
        
        for ( var i = 0; i < menu[m].itens.length; i++ ) {
            this.addItemSubMenu(ddmId, menu[m].itens[i]);
        }
    }
};

ABCXJS.edit.DropdownMenu.prototype.emptySubMenu = function (ddm) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    self.headers[ddm].list.innerHTML = "";
    self.setSubMenuTitle(ddm, '...');
    
};


ABCXJS.edit.DropdownMenu.prototype.setSubMenuTitle = function (ddm, newTitle) {
    
    var self = this;
    
    if( ! self.headers[ddm] ) {
        console.log( 'Menu não encontrado!' );
        return;
    }
    
    self.headers[ddm].btn.innerHTML = (newTitle.replaceAll( ' ', '&nbsp;' ) || '' ) +'&nbsp;&nbsp;'+'<i class="ico-down-2" data-toggle="toggle"></i>';
    
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
        var e5 = document.createElement("a");
        e5.innerHTML = tags[0].replaceAll( ' ', '&nbsp;' );
        e5.setAttribute( "data-state", ddm );
        e5.setAttribute( "data-value", tags.length > 1 ? tags[1] : tags[0] );
        e5.addEventListener( 'click', function(e) {
           e.stopPropagation(); 
           e.preventDefault(); 
           self.eventsCentral(this.getAttribute("data-state"), this.getAttribute("data-value") );
        }, false);
        e4.appendChild(e5);
    }
    if(pos) {
        self.headers[ddm].list.insertBefore(e4, self.headers[ddm].list.children[pos]);
    } else {
        self.headers[ddm].list.appendChild(e4);
    }            
};

ABCXJS.edit.DropdownMenu.prototype.setListener = function (listener, method) {
    this.listener = listener || null;
    this.method = method || 'callback';
};

ABCXJS.edit.DropdownMenu.prototype.eventsCentral = function (state, event) {
    for( var e in this.headers ) {
        if( e === state ) {
            this.headers[e].chk.checked = ! this.headers[e].chk.checked;
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
