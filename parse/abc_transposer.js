/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

if (!window.ABCXJS.parse)
	window.ABCXJS.parse = {};
    
window.ABCXJS.parse.Transposer = function ( offSet ) {
    
    this.pitches           = window.ABCXJS.parse.pitches;
    this.key2number        = window.ABCXJS.parse.key2number;
    this.number2keyflat    = window.ABCXJS.parse.number2keyflat;
    this.number2keysharp   = window.ABCXJS.parse.number2keysharp;
    this.number2key_br     = window.ABCXJS.parse.number2key_br;
    this.number2staff      = window.ABCXJS.parse.number2staff;
    this.number2staffSharp = window.ABCXJS.parse.number2staffSharp;
    
    this.reset( offSet );
    
};

window.ABCXJS.parse.Transposer.prototype.reset = function( offSet ) {
    this.offSet          = offSet;
    this.currKey         = [];
    this.newKeyAcc       = [];
    this.oldKeyAcc       = [];
    this.changedLines    = [];
    this.newX            =  0;
    this.workingX        =  0;
    this.workingLine     = -1;
    this.workingLineIdx  = -1;
};

window.ABCXJS.parse.Transposer.prototype.numberToStaff = function(number, newKacc) {
    var s ;
    if(newKacc.length > 0 && newKacc[0].acc === 'flat')
        s = this.number2staff[number];
    else
        s = this.number2staffSharp[number];
    
    // octave can be altered below
    s.octVar = 0;
    
    if(s.acc === "" && ("EFBC").indexOf(s.note) >= 0 ) {
        var o ;
        switch(s.note) {
            case 'E':
                //procurar Fflat
                o = {note:'F',acc:'flat', octVar:0};
                break;
            case 'F':
                //procurar Esharp
                o = {note:'E',acc:'sharp', octVar:0};
                break;
            case 'B':
                //procurar Cflat
                o = {note:'C',acc:'flat', octVar:1};
                break;
            case 'C':
                //procurar Bsharp
                o = {note:'B',acc:'sharp', octVar:-1};
                break;
        }
        for( var a = 0; a < newKacc.length; a ++ ) {
            if( newKacc[a].note.toUpperCase() === o.note && newKacc[a].acc === o.acc ){
                s = o;
                break;
            }
        }
    }
    return s;
};

window.ABCXJS.parse.Transposer.prototype.transposeRegularMusicLine = function(str, line, lineNumber) {

    if( str.trim() !== line.trim() ) 
        alert( "window.ABCXJS.parse.Transposer.prototype.TransposeRegularMusicLine: isto não devia acontecer!\nstr.:"+str+".\nline:"+line+".");
    
    var index = 0;
    var found = false;
    var inside = false;
    var state = 0;
    var lastState = 0;
    var xi = -1;
    var xf = -1;
    var accSyms = "^_=";  // state 1
    var pitSyms = "ABCDEFGabcdefg"; // state 2
    var octSyms = ",\'"; // state 3
    var exclusionSyms = '"!+'; 
    
    this.workingLine = line;
    this.workingLineIdx = this.changedLines.length;
    this.changedLines[ this.workingLineIdx ] = { line:lineNumber, text: line };
    this.workingX = 0;
    this.newX =0;
    this.baraccidentals = [];
    this.baraccidentalsNew = [];
    
    while (index < line.length) {
        found = false;
        inside = false;
        lastState = 0;
        while (index < line.length && !found) {
            
            // ignora o conteúdo de accents
            if( exclusionSyms.indexOf(line.charAt(index)) >= 0 ) {
                var nextPos = line.substr( index+1 ).indexOf(line.charAt(index));
                if( nextPos < 0 ) {
                    index = line.length;
                } else {
                    if(line.charAt(index)==='"') {
                        //transpor acorde textual - aqui não está tratando bemois e sustenidos...
                        //alem disso, trata com abc note, ou seja, tem maiusculas e minusculas
                        this.transposeNote(index+1, 1);
                    }
                    index += nextPos + 2;
                }
                continue;
            }
            
            if(line.charAt(index) === '|'){
                this.baraccidentals = [];
                this.baraccidentalsNew = [];
            }
            
            state = 
              accSyms.indexOf(line.charAt(index)) >= 0 ? 1 : 
              pitSyms.indexOf(line.charAt(index)) >= 0 ? 2 :
              octSyms.indexOf(line.charAt(index)) >= 0 ? 3 : 0;
            
            if( ( state < lastState && inside ) || (lastState === 2 && state === 2 && inside ) ) {
               found = true;
               xf = index;
            } else if( state > lastState && !inside) {
              inside = true;
              xi = index;
            }
            
            lastState = state;
            state = 0;
            
            if (found) {
                this.transposeNote(xi, xf - xi);
            } else {
              index++;
            }   
        }
        if(inside && !found)
          this.transposeNote(xi, index - xi);
    }
    return this.changedLines[ this.workingLineIdx ].text;
};

window.ABCXJS.parse.Transposer.prototype.transposeNote = function(xi, size )
{
    var abcNote = this.workingLine.substr(xi, size);
    var elem = this.makeElem(abcNote);
    var pitch = elem.pitch;
    var oct = this.extractStaffOctave(pitch);
    var crom = this.staffNoteToCromatic(this.extractStaffNote(pitch));

    var txtAcc = elem.accidental;
    var dAcc = this.getAccOffset(txtAcc);
    
    if(elem.accidental) {
        this.baraccidentals[pitch] = dAcc;
    }

    var dKi = this.getKeyAccOffset(this.numberToKey(crom), this.oldKeyAcc);

    var newNote = 0;
    if (this.baraccidentals[pitch] !== undefined) {
        newNote = crom + this.baraccidentals[pitch] + this.offSet;
    } else { // use normal accidentals
        newNote = crom + dKi + this.offSet;
    }

    var newOct = this.extractCromaticOctave(newNote);
    var newNote = this.extractCromaticNote(newNote);

    var newStaff = this.numberToStaff(newNote, this.newKeyAcc);
    var dKf = this.getKeyAccOffset(newStaff.note, this.newKeyAcc);

    pitch = this.getPitch(newStaff.note, oct + newOct + newStaff.octVar );
    dAcc = this.getAccOffset(newStaff.acc);

    var newElem = {};
    newElem.pitch = pitch;
    if(newStaff.acc !== '' ) newElem.accidental = newStaff.acc;
    
    // se a nota sair com um acidente (inclusive natural) registrar acidente na barra para o pitch.
    var dBarAcc = this.getAccOffset( this.baraccidentalsNew[newElem.pitch] );
    if(dAcc === 0) {
        if( dBarAcc && dBarAcc !==0 || dKf !== 0) {
          newElem.accidental = 'natural';
        }
    } else {
        if( dBarAcc && dBarAcc !== 0 ) {
           if(dBarAcc === dAcc ) delete newElem.accidental;
        } else if(dKf !== 0) {
           if(dKf === dAcc ) delete newElem.accidental;
        }
    }
    
    if( newElem.accidental ) {
      this.baraccidentalsNew[newElem.pitch] = newElem.accidental;
    }

    oct = this.extractStaffOctave(pitch);
    var key = this.numberToKey(this.staffNoteToCromatic(this.extractStaffNote(pitch)));
    txtAcc = newElem.accidental;
    abcNote = this.getAbcNote(key, txtAcc, oct);
    var p0 = this.changedLines[this.workingLineIdx].text.substr(0, this.newX);
    var p1 = this.workingLine.substr(this.workingX, xi - this.workingX);
    var p2 = this.workingLine.substr(xi + size);
    this.workingX = xi + size;
    this.changedLines[this.workingLineIdx].text = p0 + p1 + abcNote;
    this.newX = this.changedLines[this.workingLineIdx].text.length;
    this.changedLines[this.workingLineIdx].text += p2;
    return newElem;

};

window.ABCXJS.parse.Transposer.prototype.getAbcNote = function( key, txtAcc, oct) {
   var cOct = "";
   if( oct >= 5 ) {
       key = key.toLowerCase();  
       cOct = Array(oct-4).join("'");
   }  else {
       key = key.toUpperCase();  
       cOct = Array(4-(oct-1)).join(",");
   }
   return this.accNameToABC(txtAcc) + key + cOct;
};

window.ABCXJS.parse.Transposer.prototype.registerKey = function ( tokenizer, str ) {
    var cKey = "C";
    var tokens = tokenizer.tokenize(str, 0, str.length);
    var retPitch = tokenizer.getKeyPitch(tokens[0].token);

    if (retPitch.len > 0) {
        // The accidental and mode might be attached to the pitch, so we might want to just remove the first character.
        cKey = retPitch.token;
        if (tokens[0].token.length > 1)
            tokens[0].token = tokens[0].token.substring(1);
        else
            tokens.shift();
        // We got a pitch to start with, so we might also have an accidental and a mode
        if (tokens.length > 0) {
            var retAcc = tokenizer.getSharpFlat(tokens[0].token);
            if (retAcc.len > 0) {
                cKey += retAcc.token;
            }
        }
    }
    
    this.currKey[this.currKey.length] = cKey;
    
    return cKey;
};

window.ABCXJS.parse.Transposer.prototype.transposeKey = function ( tokenizer, str, line, lineNumber ) {
    
    var cKey = this.registerKey( tokenizer, str );
    var newKey = this.keyToNumber( cKey );
    var cNewKey = this.denormalizeAcc( this.numberToKey(newKey + this.offSet ));
    
    this.currKey[this.currKey.length-1] = cNewKey;

    var newStr  = str.replace(cKey, cNewKey );
    var newLine = line.substr( 0, line.indexOf(str) ) + newStr;
    
    this.changedLines[ this.changedLines.length ] = { line:lineNumber, text: newLine };

    this.oldKeyAcc = window.ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(cKey));
    this.newKeyAcc = window.ABCXJS.parse.parseKeyVoice.standardKey(this.denormalizeAcc(cNewKey));
    
    return tokenizer.tokenize(newStr, 0, newStr.length);
};

window.ABCXJS.parse.Transposer.prototype.updateEditor = function ( lines ) {
    for( i = 0; i < this.changedLines.length; i++ ){
        lines[this.changedLines[i].line] = this.changedLines[i].text;
    }
    var newStr = lines[0];
    for( i = 1; i < lines.length; i++ ){
        newStr += '\n' + lines[i];
    }
    this.changedLines = [];
    return newStr;
};

window.ABCXJS.parse.Transposer.prototype.getKeyVoice = function ( idx ) {
return (this.currKey[idx]?this.currKey[idx]:"C");
};

window.ABCXJS.parse.Transposer.prototype.normalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])#/g,'$1♯').replace(/([ABCDEFG])b/g,'$1♭');
};

window.ABCXJS.parse.Transposer.prototype.denormalizeAcc = function ( cKey ) {
    return cKey.replace(/([ABCDEFG])♯/g,'$1#').replace(/([ABCDEFG])♭/g,'$1b');
};

window.ABCXJS.parse.Transposer.prototype.getKeyAccOffset = function(note, keyAcc)
// recupera os acidentes da clave e retorna um offset no modelo cromatico
{
  for( var a = 0; a < keyAcc.length; a ++) {
      if( keyAcc[a].note.toLowerCase() === note.toLowerCase() ) {
          return this.getAccOffset(keyAcc[a].acc);
      }
  }
  return 0;    
};
               
window.ABCXJS.parse.Transposer.prototype.staffNoteToCromatic = function (note) {
  return note*2 + (note>2?-1:0);
};

//window.ABCXJS.parse.Transposer.prototype.cromaticToStaffNote = function (note) {
//  return (note>5?note+1:note)/2;
//};

window.ABCXJS.parse.Transposer.prototype.extractStaffNote = function(pitch) {
    pitch = pitch % 7;
    return pitch<0? pitch+=7:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticOctave = function(pitch) {
    return Math.floor(pitch/12) ;
};

window.ABCXJS.parse.Transposer.prototype.extractCromaticNote = function(pitch) {
    pitch = pitch % 12;
    return pitch<0? pitch+=12:pitch;
};

window.ABCXJS.parse.Transposer.prototype.extractStaffOctave = function(pitch) {
    return Math.floor((28 + pitch) / 7);
};

window.ABCXJS.parse.Transposer.prototype.numberToKey = function(number) {
    number %= this.number2keyflat.length;
    if( number < 0 ) number += this.number2keyflat.length;
    return this.number2keyflat[number];
};

window.ABCXJS.parse.Transposer.prototype.keyToNumber = function(key) {
    key = this.normalizeAcc(key);
    return this.key2number[key];
};

window.ABCXJS.parse.Transposer.prototype.getAccOffset = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = 0;

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = 2;
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = 1;
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = 0;
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = -1;
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = -2;
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accNameToABC = function(txtAcc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (txtAcc) {
        case 'accidentals.dblsharp':
        case 'dblsharp':
            ret = "^^";
            break;
        case 'accidentals.sharp':
        case 'sharp':
            ret = '^';
            break;
        case 'accidentals.nat':
        case 'nat':
        case 'natural':
            ret = "=";
            break;
        case 'accidentals.flat':
        case 'flat':
            ret = '_';
            break;
        case 'accidentals.dblflat':
        case 'dblflat':
            ret = '__';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.accAbcToName = function(abc)
// a partir do nome do acidente, retorna o offset no modelo cromatico
{
    var ret = "";

    switch (abc) {
        case '^^':
            ret = "dblsharp";
            break;
        case '^':
            ret = 'sharp';
            break;
        case '=':
            ret = "natural";
            break;
        case '_':
            ret = 'flat';
            break;
        case '__':
            ret = 'dblflat';
            break;
    }
    return ret;
};

window.ABCXJS.parse.Transposer.prototype.getAccName = function(offset)
{
    var names = ['dblflat','flat','natural','sharp','dblsharp'];
    return names[offset+2];
};

window.ABCXJS.parse.Transposer.prototype.getPitch = function( staff, octave) {
   return this.pitches[staff] + (octave - 4) * 7; 
};

window.ABCXJS.parse.Transposer.prototype.makeElem = function(abcNote){
   var pitSyms = "ABCDEFGabcdefg"; // 2
   var i = 0;
   while( pitSyms.indexOf(abcNote.charAt(i)) === -1 ) {
       i++;
   }
   var acc = this.accAbcToName(abcNote.substr(0,i));
   var pitch = this.pitches[abcNote.charAt(i)];
   while( i < abcNote.length ) {
      switch ( abcNote.charAt(i) ) {
          case "'": pitch +=7; break;
          case "," : pitch -=7; break;
      }
      i++;
   }
   return ( acc ? { pitch: pitch, accidental: acc } : { pitch: pitch } );
};
