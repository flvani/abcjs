// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

/**
 * Link to the project's GitHub page:
 * https://github.com/pickhardt/coffeescript-codemirror-mode
 */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("abcx", function(conf, parserConf) {
 
  var ERRORCLASS = "error";

  function wordRegexp(words) {
    return new RegExp("^((" + words.join(")|(") + "))");
  }
  function wordRegexpBlank(words) {
    return new RegExp("^((" + words.join(")|(") + "))\\b");
  }

  var stringPrefixes = /^('{3}|\"{3}|['\"])/;
  var delimiters = /^(?:[()\!\[\]\'\,\-\+\^\_\=\{\}]|\.\.?\.?)/;
  var identifiers = /^( |\n|\r|\t)([y]\:)()/;
  var directives = /^%%[_A-Za-z$][_A-Za-z$0-9]*/;

  var barDelimiters = wordRegexp([ "\\:", "\\|", "\\[\\|", "\\|\\]" ]);
    
  var fields = wordRegexp([
        "A:","B:","C:","D:","E:","F:","G:","H:","I:","J:","K:","L:","M:","N:","O:","P:","Q:","R:","S:","T:","U:","V:","X:","Y:","Z:"]);
                              
  var attributes = wordRegexpBlank([
        "clef", "stem", 'class', 'href', 'fref', 'target', 'nm', 'name' ]);
                    
  var keyValues = wordRegexpBlank([
        "accordionTab", 'treble', 'bass', 'tenor', 'alto', 'none', 'A4', 'letter', 'legal',  "http",  "https", 'nf', '_blank'  
       ,"merge", 'up', 'down', 'middle', 'tab', 'tablatura', 'tablature', 'melodia', 'baixo', 'baixos', 'melody'
       ,"segno", "dacapo", "dacoda",  "dasegno",  "coda",  "dsalfine",  "dcalfine",  "dsalcoda",  "dcalcoda",  "fine", "D.C",  "D.S" ]);


  // Tokenizers
  function tokenBase(stream, state) {
      
    if (stream.eatSpace()) {
      return null;
    }

    var ch = stream.peek();

    if (stream.match(directives) || state.prop && stream.match(identifiers)) {
      return "directive";
    }
    
    if (stream.match(fields) || state.prop && stream.match(identifiers)) {
      return "operator";
    }
    
    if (stream.match(attributes)) {
      return "attribute";
    }
    
    if (stream.match(keyValues)) {
      return "keyword";
    }
    
    // Single line comment
    if (ch === "%") {
      stream.skipToEnd();
      return "comment";
    }
    
    // Handle words
    if (stream.match("W:") || stream.match("w:") ) {
      stream.skipToEnd();
      return "string-2";
    }
    
    if (stream.match(barDelimiters)) {
      return "punctuation-2";
    }
    
    if (stream.match(delimiters)) {
      return "punctuation";
    }
    
    // Handle strings
    if (stream.match(stringPrefixes)) {
      state.tokenize = tokenFactory(stream.current(), false, "string");
      return state.tokenize(stream, state);
    }

    // Handle number literals
    if (stream.match(/^-?[0-9\.]/, false)) {
      var floatLiteral = false;
      // Floats
      if (stream.match(/^-?\d+\.\d*/)) {
        floatLiteral = true;
      }
      if (stream.match(/^-?\.\d+/)) {
        floatLiteral = true;
      }

      if (floatLiteral) {
        // prevent from getting extra . on 1..
        if (stream.peek() === "."){
          stream.backUp(1);
        }
        return "number";
      }
      // Integers
      var intLiteral = false;
      // Decimal
      if (stream.match(/^-?[1-9]\d*(\/[\+\-]?\d+)?/)) {
        intLiteral = true;
      }
      // Zero by itself with no other piece of number.
      if (stream.match(/^-?0(?![\dx])/i)) {
        intLiteral = true;
      }
      if (intLiteral) {
        return "number";
      }
    }
    
    stream.next();
    return 'identifier';
    
  }

  function tokenFactory(delimiter, singleline, outclass) {
    return function(stream, state) {
      while (!stream.eol()) {
        stream.eatWhile(/[^'"\/\\]/);
        if (stream.eat("\\")) {
          stream.next();
          if (singleline && stream.eol()) {
            return outclass;
          }
        } else if (stream.match(delimiter)) {
          state.tokenize = tokenBase;
          return outclass;
        } else {
          stream.eat(/['"\/]/);
        }
      }
      if (singleline) {
        if (parserConf.singleLineStringErrors) {
          outclass = ERRORCLASS;
        } else {
          state.tokenize = tokenBase;
        }
      }
      return outclass;
    };
  }

  var external = {
    startState: function(basecolumn) {
      return {
        tokenize: tokenBase,
        scope: {offset:basecolumn || 0, type:"coffee", prev: null, align: false},
        prop: false,
        dedent: 0
      };
    },

    token: function(stream, state) {
      var fillAlign = state.scope.align === null && state.scope;
      if (fillAlign && stream.sol()) fillAlign.align = false;

      var style = state.tokenize(stream, state);
      if (style && style !== "comment") {
        if (fillAlign) fillAlign.align = true;
        state.prop = style === "punctuation" && stream.current() === ".";
      }

      return style;
    }

  };
  return external;
});

CodeMirror.defineMIME("text/x-abcx", "abcx");
CodeMirror.defineMIME("text/abcx", "abcx");

});
