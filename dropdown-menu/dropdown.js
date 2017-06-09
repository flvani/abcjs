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
    
//    var c = this.container.getAttribute("class");
//    this.container.setAttribute("class", (c?c+" ":"") + "dropdown-container" );
    
    if( this.title ) {
        var e = document.createElement("h1");
        e.setAttribute( "id", "mTitle" + this.id ); 
        e.setAttribute( "class", 'dropdown-title-font' );
        e.innerHTML = this.title;
        this.container.appendChild(e);
        this.title = e;
    }
    
    for ( var m = 0; m < menu.length; m++ ) {
        var e1 = document.createElement("div");
        e1.setAttribute( "class", 'dropdown' );
        this.container.appendChild(e1);
        
        var e2 = document.createElement("input");
        e2.setAttribute( "id", 'ch'+ this.id  +m );
        e2.setAttribute( "type", "checkbox" );
        e1.appendChild(e2);
        this.headers['ch'+ this.id  +m] = e2;
        
        e2 = document.createElement("button");
        e2.setAttribute( "data-state", 'ch'+ this.id +m );
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
        
        e2 = document.createElement("div");
        e2.setAttribute( "class", "dropdown-menu dropdown-menu-font" );
        e2.setAttribute( "data-toggle", "toggle-menu" );
        if(typeof(menu[m].scroll) !== 'undefined' && !menu[m].scroll ) {
            e2.style = 'overflow-y: hidden;';
        }
        e1.appendChild(e2);
        
        var e3 = document.createElement("ul");
        e2.appendChild(e3);
        
        for ( var i = 0; i < menu[m].itens.length; i++ ) {
            var tags = menu[m].itens[i].split('|'); 
            if( tags[0].substring(0, 3) ===  '---' ) {
                var e4 = document.createElement("hr");
                e3.appendChild(e4);
            } else {
                var e4 = document.createElement("li"); 
                e3.appendChild(e4);
                var e5 = document.createElement("a");
                e5.innerHTML = tags[0].replaceAll( ' ', '&nbsp;' );
                e5.setAttribute( "data-state", 'ch'+ this.id +m );
                e5.setAttribute( "data-value", tags.length > 1 ? tags[1] : tags[0] );
                e5.addEventListener( 'click', function(e) {
                   e.stopPropagation(); 
                   e.preventDefault(); 
                   self.eventsCentral(this.getAttribute("data-state"), this.getAttribute("data-value") );
                }, false);
                e4.appendChild(e5);
            }
        }
    }
};

ABCXJS.edit.DropdownMenu.prototype.eventsCentral = function (state, ev) {
    for( var e in this.headers ) {
        if( e === state ) {
            this.headers[e].checked = ! this.headers[e].checked;
        } else {
            this.headers[e].checked = false;
        }
    }
    
    switch(ev) {
        case 'TUTORIAL':
            w1.setTitle('Tutoriais')
            w1.dataDiv.innerHTML = '<embed src="/abcxjs/html/tutoriais.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'TABS':
            w1.setTitle('Tablaturas para Acordeons')
            w1.dataDiv.innerHTML = '<embed src="/abcxjs/html/tablatura.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'TABSTRANSPORTADA':
            w1.setTitle('Tablaturas para Transportada')
            w1.dataDiv.innerHTML = '<embed src="/abcxjs/html/tablaturaTransportada.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'MAPS':
            w1.setTitle('Mapas para Acordeons')
            w1.dataDiv.innerHTML = '<embed src="/abcxjs/html/mapas.pt_BR.html" height="600" width="1024"></embed>';
            w1.topDiv.style.display = 'inline';
            break;
        case 'ABOUT':
            var e = document.createElement("iframe"); 
            w1.setTitle('Sobre...')
            w1.dataDiv.innerHTML = '';
            w1.dataDiv.appendChild(e);
            e.setAttribute("src", "/abcxjs/html/sobre.html" );
            e.setAttribute("frameborder", "0" );
            e.setAttribute("scrolling", "no" );
            e.setAttribute("height", "440" );
            e.setAttribute("width", "800" );
            e.addEventListener("load", function () { 
                e.style.height = e.contentWindow.document.body.scrollHeight + 'px';  
            } );
            w1.topDiv.style.display = 'inline';
            break;
        default:
            break;
    }
};


//ABCXJS.edit.DropdownMenu.prototype.closeMenu = function (state) {
//    var e = document.getElementById(state);
//    e.checked=false;
//};
