﻿//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.



if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.misc = {};

window.ABCXJS.misc.isOpera = function() {
    return ( !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 );
};

window.ABCXJS.misc.isChrome= function() {
    var test1 =  (( !!window.chrome && !ABCXJS.misc.isOpera() ) > 0 ); // Chrome 1+
   
    if(!test1) return false;
    
    for (var i=0; i<navigator.plugins.length; i++)
        if (navigator.plugins[i].name == 'Chrome PDF Viewer') return true;
    
    return false;
};

window.ABCXJS.misc.isChromium= function() {
    var test1 =  (( !!window.chrome && !ABCXJS.misc.isOpera() ) > 0 ); // Chrome 1+
   
    if(!test1) return false;
    
    for (var i=0; i<navigator.plugins.length; i++)
        if (navigator.plugins[i].name == 'Chrome PDF Viewer') return false;
    
    return true;
};

window.ABCXJS.misc.isFirefox = function() {
    return ( typeof InstallTrigger !== 'undefined' );  // Firefox 1+ 
};

window.ABCXJS.misc.isSafari = function() {
    return ( Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 ); 
};

window.ABCXJS.misc.isIE = function() {
  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
  // IE 12 / Spartan
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
  // Edge (IE 12+)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';
  
  
    if( /*@cc_on!@*/false || !!document.documentMode  ) { // At least IE6    
      return true;
  }

  if( navigator.appName.indexOf("Internet Explorer")!==-1 ){     //yeah, he's using IE
     return true;
  }
  
  var ua = window.navigator.userAgent;
  
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    //return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    return true;
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    //return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    return true;
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    //return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    return true;
}

  // other browser
  return false;
};

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};

// implemented below a more secure form o copy
window.ABCXJS.parse.clone = function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = window.ABCXJS.parse.clone(obj[i]);
        }
        return copy;
    }
    
    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = window.ABCXJS.parse.clone(obj[attr]);
        }
        return copy;
    }
    
    throw new Error("Unable to copy obj! Its type isn't supported.");
};

window.ABCXJS.parse.normalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])#/g,'$1♯').replace(/([ABCDEFG])b/g,'$1♭');
};

window.ABCXJS.parse.denormalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])♯/g,'$1#').replace(/([ABCDEFG])♭/g,'$1b');
};


window.ABCXJS.parse.gsub = function(source, pattern, replacement) {
	return source.split(pattern).join(replacement);
};

window.ABCXJS.parse.strip = function(str) {
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

window.ABCXJS.parse.startsWith = function(str, pattern) {
	return str.indexOf(pattern) === 0;
};

window.ABCXJS.parse.endsWith = function(str, pattern) {
	var d = str.length - pattern.length;
	return d >= 0 && str.lastIndexOf(pattern) === d;
};

window.ABCXJS.parse.each = function(arr, iterator, context) {
	for (var i = 0, length = arr.length; i < length; i++)
	  iterator.apply(context, [arr[i],i]);
};

window.ABCXJS.parse.last = function(arr) {
	if (arr.length === 0)
		return null;
	return arr[arr.length-1];
};

window.ABCXJS.parse.compact = function(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			output.push(arr[i]);
	}
	return output;
};

window.ABCXJS.parse.detect = function(arr, iterator) {
	for (var i = 0; i < arr.length; i++) {
		if (iterator(arr[i]))
			return true;
	}
	return false;
};

window.ABCXJS.parse.pitches = 
    { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6, 
        c: 7, d: 8, e: 9, f: 10, g: 11, a: 12, b: 13 };

window.ABCXJS.parse.number2keyflat  = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
window.ABCXJS.parse.number2keysharp = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
window.ABCXJS.parse.number2key_br   = ["Dó", "Ré♭", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Lá♭", "Lá", "Si♭", "Si"];

window.ABCXJS.parse.key2number = 
    {"C":0, "C♯":1, "D♭":1, "D":2, "D♯":3, "E♭":3, "E":4, 
     "F":5 ,"F♯":6 ,"G♭":6, "G":7, "G♯":8 ,"A♭":8, "A":9, "A♯":10, "B♭":10, "B":11 };

window.ABCXJS.parse.number2staff   = 
    [    
         {note:"C", acc:""}
        ,{note:"D", acc:"flat"} 
        ,{note:"D", acc:""}
        ,{note:"E", acc:"flat"} 
        ,{note:"E", acc:""} 
        ,{note:"F", acc:""}
        ,{note:"G", acc:"flat"} 
        ,{note:"G", acc:""} 
        ,{note:"A", acc:"flat"} 
        ,{note:"A", acc:""} 
        ,{note:"B", acc:"flat"} 
        ,{note:"B", acc:""}
    ];

window.ABCXJS.parse.number2staffSharp   = 
    [    
        {note:"C", acc:""}
       ,{note:"C", acc:"sharp"}
       ,{note:"D", acc:""} 
       ,{note:"D", acc:"sharp"}
       ,{note:"E", acc:""} 
       ,{note:"F", acc:""} 
       ,{note:"F", acc:"sharp"}
       ,{note:"G", acc:""} 
       ,{note:"G", acc:"sharp"} 
       ,{note:"A", acc:""} 
       ,{note:"A", acc:"sharp"} 
       ,{note:"B", acc:""} 
    ];
