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

  //var operators = /^(?:->|=>|\+[+=]?|-[\-=]?|\*[\*=]?|\/[\/=]?|[=!]=|<[><]?=?|>>?=?|%=?|&=?|\|=?|\^=?|\~|!|\?|(\%\%|or|and|\|\||&&|\?)=)/;
  var operators = "/";
  var delimiters = /^(?:[()\[\]{},:`=;]|\.\.?\.?)/;
  var delimiters = /^(?:[|\!\[\]\'\,\-\^]|\.\.?\.?)/;
  var identifiers = /^( |\n|\r|\t)([ABCDEFGHIJKLMNOPQRSTUVXYZ]\:)()/;
  var identifiers = /^( |\n|\r|\t)([y]\:)()/;
  var atProp = /^%%[_A-Za-z$][_A-Za-z$0-9]*/;
  var atField = /^( |\n|\r|\t)([ABCDEFGHIJKLMNOPQRSTUVXYZ]\:)()/;

  var fieldOperators = wordRegexp(["A\:","B\:","C\:","D\:","E\:","F\:","G\:","H\:","I\:","J\:","K\:","L\:","M\:","N\:","O\:","P\:","Q\:","R\:","S\:","T\:","U\:","V\:","X\:","Y\:","Z\:","W\:","w\:"]);
                              
  var indentKeywords = ["A","B","C","D","E","F","G","z", 'x', '>', '-'];
  var indentKeywords = [];
                    
  var commonKeywords = [
                'accordionTab', 'treble', 'bass', 'tenor', 'alto', 'none' 
               ,'merge', 'up', 'down', 'middle', 'tab', 'tablatura', 'tablature', 'melodia', 'baixo', 'baixos', 'melody' ];

  var keywords = wordRegexpBlank(indentKeywords.concat(commonKeywords));

  //indentKeywords = wordRegexp(indentKeywords);
  
  var commonConstants = ["NaN"];
  var constants = wordRegexp(commonConstants);


  var stringPrefixes = /^('{3}|\"{3}|['\"])/;
  var regexPrefixes = /^(\/{3}|\/)/;

  // Tokenizers
  function tokenBase(stream, state) {
    if (stream.eatSpace()) {
      return null;
    }

    var ch = stream.peek();

    if (stream.match(atProp) || state.prop && stream.match(identifiers)) {
      return "directive";
    }
    
    if (stream.match(fieldOperators) || state.prop && stream.match(identifiers)) {
      return "operator";
    }
    
    if (stream.match(keywords)) {
      return "keyword";
    }
    
    // Single line comment
    if (ch === "%") {
      stream.skipToEnd();
      return "comment";
    }
    
    stream.next();
    return 'string';
    
    
    
    // Handle diretives
    if (stream.match("%%")) {
        
      if(!stream.skipTo('%') ) {
        stream.skipToEnd();
      };
      return "directive";
    }

    // Single line comment
    if (ch === "%") {
      stream.skipToEnd();
      return "comment";
    }
    
    
    // Handle fields 
    if (stream.match(fieldOperators)) {
      return "operator";
    }
    
    
    if (stream.match(keywords)) {
      return "keyword";
    }
    
    // Handle non-detected items
    stream.next();
    return 'string';
    
    if (stream.match(delimiters)) {
      return "punctuation";
    }
    
    
    
    
//    //Handle abcnotes
//    if (stream.match(/^-?[A-G][0-9\.]/, false)) {
//      return "operator";
//    }

    // Handle number literals
    if (stream.match(/^-?[0-9\.]/, false)) {
      var floatLiteral = false;
      // Floats
      if (stream.match(/^-?\d*\.\d+(e[\+\-]?\d+)?/i)) {
        floatLiteral = true;
      }
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
      // Hex
      if (stream.match(/^-?0x[0-9a-f]+/i)) {
        intLiteral = true;
      }
      // Decimal
      if (stream.match(/^-?[1-9]\d*(e[\+\-]?\d+)?/)) {
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

    // Handle strings
    if (stream.match(stringPrefixes)) {
      state.tokenize = tokenFactory(stream.current(), false, "string");
      return state.tokenize(stream, state);
    }
    // Handle regex literals
    if (stream.match(regexPrefixes)) {
      if (stream.current() !== "/" || stream.match(/^.*\//, false)) { // prevent highlight of division
        state.tokenize = tokenFactory(stream.current(), true, "string-2");
        return state.tokenize(stream, state);
      } else {
        stream.backUp(1);
      }
    }

    // Handle operators and delimiters
    if (stream.match(operators)) {
      return "operator";
    }
    if (stream.match(delimiters)) {
      return "punctuation";
    }

    if (stream.match(constants)) {
      return "atom";
    }

    if (stream.match(atProp) || state.prop && stream.match(identifiers)) {
      return "property";
    }

    if (stream.match(keywords)) {
      return "keyword";
    }

    if (stream.match(identifiers)) {
      return "variable";
    }

    // Handle non-detected items
    stream.next();
    return 'string';
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

//  function longComment(stream, state) {
//    while (!stream.eol()) {
//      stream.eatWhile(/[^#]/);
//      if (stream.match("###")) {
//        state.tokenize = tokenBase;
//        break;
//      }
//      stream.eatWhile("#");
//    }
//    return "comment";
//  }

//  function indent(stream, state, type) {
//    type = type || "coffee";
//    var offset = 0, align = false, alignOffset = null;
//    for (var scope = state.scope; scope; scope = scope.prev) {
//      if (scope.type === "coffee" || scope.type == "}") {
//        offset = scope.offset + conf.indentUnit;
//        break;
//      }
//    }
//    if (type !== "coffee") {
//      align = null;
//      alignOffset = stream.column() + stream.current().length;
//    } else if (state.scope.align) {
//      state.scope.align = false;
//    }
//    state.scope = {
//      offset: offset,
//      type: type,
//      prev: state.scope,
//      align: align,
//      alignOffset: alignOffset
//    };
//  }
//
//  function dedent(stream, state) {
//    if (!state.scope.prev) return;
//    if (state.scope.type === "coffee") {
//      var _indent = stream.indentation();
//      var matched = false;
//      for (var scope = state.scope; scope; scope = scope.prev) {
//        if (_indent === scope.offset) {
//          matched = true;
//          break;
//        }
//      }
//      if (!matched) {
//        return true;
//      }
//      while (state.scope.prev && state.scope.offset !== _indent) {
//        state.scope = state.scope.prev;
//      }
//      return false;
//    } else {
//      state.scope = state.scope.prev;
//      return false;
//    }
//  }

  function tokenLexer(stream, state) {
    var style = state.tokenize(stream, state);
    var current = stream.current();

//    // Handle scope changes.
//    if (current === "return") {
//      state.dedent = true;
//    }
//    if (((current === "->" || current === "=>") && stream.eol())
//        || style === "indent") {
//      //indent(stream, state);
//    }
    var delimiter_index = "[({".indexOf(current);
    
//    if (delimiter_index !== -1) {
//      //indent(stream, state, "])}".slice(delimiter_index, delimiter_index+1));
//    }
//    if (indentKeywords.exec(current)){
//      //indent(stream, state);
//    }
//    if (current == "then"){
//      dedent(stream, state);
//    }
//
//
//    if (style === "dedent") {
//      if (dedent(stream, state)) {
//        return ERRORCLASS;
//      }
//    }

    delimiter_index = "])}".indexOf(current);
    
//    if (delimiter_index !== -1) {
//      while (state.scope.type === "coffee" && state.scope.prev)
//        state.scope = state.scope.prev;
//      if (state.scope.type === current)
//        state.scope = state.scope.prev;
//    }
//    if (state.dedent && stream.eol()) {
//      if (state.scope.type == "coffee" && state.scope.prev)
//        state.scope = state.scope.prev;
//      state.dedent = false;
//    }

    return style;
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

      var style = tokenLexer(stream, state);
      if (style && style != "comment") {
        if (fillAlign) fillAlign.align = true;
        state.prop = style == "punctuation" && stream.current() == "."
      }

      return style;
    },

    indent: function(state, text) {
      if (state.tokenize != tokenBase) return 0;
      var scope = state.scope;
      var closer = text && "])}".indexOf(text.charAt(0)) > -1;
      if (closer) while (scope.type == "coffee" && scope.prev) scope = scope.prev;
      var closes = closer && scope.type === text.charAt(0);
      if (scope.align)
        return scope.alignOffset - (closes ? 1 : 0);
      else
        return (closes ? scope.prev : scope).offset;
    },

    lineComment: "#",
    fold: "indent"
  };
  return external;
});

CodeMirror.defineMIME("text/x-abcx", "abcx");
CodeMirror.defineMIME("text/abcx", "abcx");

});
