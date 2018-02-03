/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.SVG)
    window.SVG = {};

if (!window.SVG.Glyphs )
    window.SVG.Glyphs = {};

SVG.Glyphs = function () {
    
    var abc_glyphs = new ABCXJS.write.Glyphs();

    var glyphs = { // the @@ will be replaced by the abc_glyph contents.
       "n.0": '<path id="n.0" transform="scale(0.95)" \nd="@@"/>'
      ,"n.1": '<path id="n.1" transform="scale(0.95)" \nd="@@"/>'
      ,"n.2": '<path id="n.2" transform="scale(0.95)" \nd="@@"/>'
      ,"n.3": '<path id="n.3" transform="scale(0.95)" \nd="@@"/>'
      ,"n.4": '<path id="n.4" transform="scale(0.95)" \nd="@@"/>'
      ,"n.5": '<path id="n.5" transform="scale(0.95)" \nd="@@"/>'
      ,"n.6": '<path id="n.6" transform="scale(0.95)" \nd="@@"/>'
      ,"n.7": '<path id="n.7" transform="scale(0.95)" \nd="@@"/>'
      ,"n.8": '<path id="n.8" transform="scale(0.95)" \nd="@@"/>'
      ,"n.9": '<path id="n.9" transform="scale(0.95)" \nd="@@"/>'
      ,"f": '<path id="n.f" transform="scale(0.95)" \nd="@@"/>'
      ,"m": '<path id="n.m" transform="scale(0.95)" \nd="@@"/>'
      ,"p": '<path id="n.p" transform="scale(0.95)" \nd="@@"/>'
      ,"r": '<path id="n.r" transform="scale(0.95)" \nd="@@"/>'
      ,"s": '<path id="n.s" transform="scale(0.95)" \nd="@@"/>'
      ,"z": '<path id="n.z" transform="scale(0.95)" \nd="@@"/>'
      ,"+": '<path id="+" transform="scale(0.95)" \nd="@@"/>'
      ,",": '<path id="," transform="scale(0.95)" \nd="@@"/>'
      ,"-": '<path id="-" transform="scale(0.95)" \nd="@@"/>'
      ,".": '<path id="." transform="scale(0.95)" \nd="@@"/>'
      ,"accidentals.nat": '<path id="accidentals.nat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.sharp": '<path id="accidentals.sharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.flat": '<path id="accidentals.flat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfsharp": '<path id="accidentals.halfsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblsharp": '<path id="accidentals.dblsharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.halfflat": '<path id="accidentals.halfflat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.dblflat": '<path id="accidentals.dblflat" transform="scale(0.8)" \nd="@@"/>'
      ,"clefs.C": '<path id="clefs.C" \nd="@@"/>'
      ,"clefs.F": '<path id="clefs.F" \nd="@@"/>'
      ,"clefs.G": '<path id="clefs.G" \nd="@@"/>'
      ,"clefs.perc": '<path id="clefs.perc" \nd="@@"/>'
      ,"clefs.tab": '<path id="clefs.tab" transform="scale(0.9)" \nd="@@"/>'
      ,"dots.dot": '<path id="dots.dot" \nd="@@"/>'
      ,"flags.d8th": '<path id="flags.d8th" \nd="@@"/>'
      ,"flags.d16th": '<path id="flags.d16th" \nd="@@"/>'
      ,"flags.d32nd": '<path id="flags.d32nd" \nd="@@"/>'
      ,"flags.d64th": '<path id="flags.d64th" \nd="@@"/>'
      ,"flags.dgrace": '<path id="flags.dgrace" \nd="@@"/>'
      ,"flags.u8th": '<path id="flags.u8th" \nd="@@"/>'
      ,"flags.u16th": '<path id="flags.u16th" \nd="@@"/>'
      ,"flags.u32nd": '<path id="flags.u32nd" \nd="@@"/>'
      ,"flags.u64th": '<path id="flags.u64th" \nd="@@"/>'
      ,"flags.ugrace": '<path id="flags.ugrace" \nd="@@"/>'
      ,"graceheads.quarter": '<g id="graceheads.quarter" transform="scale(0.6)" ><use xlink:href="#noteheads.quarter" /></g>'
      ,"graceflags.d8th": '<g id="graceflags.d8th" transform="scale(0.6)" ><use xlink:href="#flags.d8th" /></g>'
      ,"graceflags.u8th": '<g id="graceflags.u8th" transform="scale(0.6)" ><use xlink:href="#flags.u8th" /></g>'
      ,"noteheads.quarter": '<path id="noteheads.quarter" \nd="@@"/>'
      ,"noteheads.whole": '<path id="noteheads.whole" \nd="@@"/>'
      ,"notehesad.dbl": '<path id="noteheads.dbl" \nd="@@"/>'
      ,"noteheads.half": '<path id="noteheads.half" \nd="@@"/>'
      ,"rests.whole": '<path id="rests.whole" \nd="@@"/>'
      ,"rests.half": '<path id="rests.half" \nd="@@"/>'
      ,"rests.quarter": '<path id="rests.quarter" \nd="@@"/>'
      ,"rests.8th": '<path id="rests.8th" \nd="@@"/>'
      ,"rests.16th": '<path id="rests.16th" \nd="@@"/>'
      ,"rests.32nd": '<path id="rests.32nd" \nd="@@"/>'
      ,"rests.64th": '<path id="rests.64th" \nd="@@"/>'
      ,"rests.128th": '<path id="rests.128th" \nd="@@"/>'
      ,"scripts.rarrow": '<path id="scripts.rarrow" \nd="M -6 -5 h 8 v -3 l 4 4 l -4 4 v -3 h -8 z"/>'
      ,"scripts.tabrest": '<path id="scripts.tabrest" \nd="M -5 5 h 10 v 2 h -10 z"/>'
      ,"scripts.lbrace": '<path id="scripts.lbrace" \nd="@@"/>'
      ,"scripts.ufermata": '<path id="scripts.ufermata" \nd="@@"/>'
      ,"scripts.dfermata": '<path id="scripts.dfermata" \nd="@@"/>'
      ,"scripts.sforzato": '<path id="scripts.sforzato" \nd="@@"/>'
      ,"scripts.staccato": '<path id="scripts.staccato" \nd="@@"/>'
      ,"scripts.tenuto": '<path id="scripts.tenuto" \nd="@@"/>'
      ,"scripts.umarcato": '<path id="scripts.umarcato" \nd="@@"/>'
      ,"scripts.dmarcato": '<path id="scripts.dmarcato" \nd="@@"/>'
      ,"scripts.stopped": '<path id="scripts.stopped" \nd="@@"/>'
      ,"scripts.upbow": '<path id="scripts.upbow" \nd="@@"/>'
      ,"scripts.downbow": '<path id="scripts.downbow" \nd="@@"/>'
      ,"scripts.turn": '<path id="scripts.turn" \nd="@@"/>'
      ,"scripts.trill": '<path id="scripts.trill" \nd="@@"/>'
      ,"scripts.segno": '<path id="scripts.segno" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.coda": '<path id="scripts.coda" transform="scale(0.8)" \nd="@@"/>'
      ,"scripts.comma": '<path id="scripts.comma" \nd="@@"/>'
      ,"scripts.roll": '<path id="scripts.roll" \nd="@@"/>'
      ,"scripts.prall": '<path id="scripts.prall" \nd="@@"/>'
      ,"scripts.mordent": '<path id="scripts.mordent" \nd="@@"/>'
      ,"timesig.common": '<path id="timesig.common" \nd="@@"/>'
      ,"timesig.cut": '<path id="timesig.cut" \nd="@@"/>'
      ,"it.punto": '<path id="it.punto" \nd="@@"/>'
      ,"it.l": '<path id="it.l" \nd="@@"/>'
      ,"it.f": '<path id="it.f" \nd="@@"/>'
      ,"it.F": '<path id="it.F" \nd="@@"/>'
      ,"it.i": '<path id="it.i" \nd="@@"/>'
      ,"it.n": '<path id="it.n" \nd="@@"/>'
      ,"it.e": '<path id="it.e" \nd="@@"/>'
      ,"it.D": '<path id="it.D" \nd="@@"/>'
      ,"it.d": '<path id="it.d" \nd="@@"/>'
      ,"it.a": '<path id="it.a" \nd="@@"/>'
      ,"it.C": '<path id="it.C" \nd="@@"/>'
      ,"it.c": '<path id="it.c" \nd="@@"/>'
      ,"it.p": '<path id="it.p" \nd="@@"/>'
      ,"it.o": '<path id="it.o" \nd="@@"/>'
      ,"it.S": '<path id="it.S" \nd="@@"/>'
      ,"it.s": '<path id="it.s" \nd="@@"/>'
      ,"it.Fine": '<g id="it.Fine" ><use xlink:href="#it.F" x="0" y="3" /><use xlink:href="#it.i" x="12" y="3" /><use xlink:href="#it.n" x="17.5" y="3" /><use xlink:href="#it.e" x="27" y="3" /></g>'
      ,"it.Coda": '<g id="it.Coda" ><use xlink:href="#it.C" x="0" y="3" /><use xlink:href="#it.o" x="12" y="3" /><use xlink:href="#it.d" x="20" y="3" /><use xlink:href="#it.a" x="30" y="3" /></g>'
      ,"it.Da": '<g id="it.Da"><use xlink:href="#it.D" x="0" y="3" /><use xlink:href="#it.a" x="14" y="3" /></g>'
      ,"it.DaCoda": '<g id="it.DaCoda"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.coda" x="32" y="0" /></g>'
      ,"it.DaSegno": '<g id="it.DaSegno"><use xlink:href="#it.Da" x="0" y="0" /><use xlink:href="#scripts.segno" x="32" y="-3" /></g>'
      ,"it.DC": '<g id="it.DC"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.C" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.DS": '<g id="it.DS"><use xlink:href="#it.D" x="0" y="1" /><use xlink:href="#it.punto" x="12" y="2" /><use xlink:href="#it.S" x="18" y="1" /><use xlink:href="#it.punto" x="29" y="2" /></g>'
      ,"it.al": '<g id="it.al"><use xlink:href="#it.a" x="0" y="2" /><use xlink:href="#it.l" x="10" y="2" /></g>'
      ,"it.DCalFine": '<g id="it.DCalFine"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DCalCoda": '<g id="it.DCalCoda"><use xlink:href="#it.DC" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
      ,"it.DSalFine": '<g id="it.DSalFine"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Fine" x="46" y="-1" /></g>'
      ,"it.DSalCoda": '<g id="it.DSalCoda"><use xlink:href="#it.DS" x="-14" y="1" /><use xlink:href="#it.al" x="25" y="1" /><use xlink:href="#it.Coda" x="46" y="-1" /></g>'
    };
    
    this.getDefinition = function (gl) {
        
        
        var g = glyphs[gl];
        
        if (!g) {
            return "";
        }
        
        // expande path se houver, buscando a definicao do original do ABCJS.
        g = g.replace('@@', abc_glyphs.getSymbolPathTxt(gl) );
        
        var i = 0, j = 0;

        while (i>=0) {
            i = g.indexOf('xlink:href="#', j );
            if (i < 0) continue;
            i += 13;
            j = g.indexOf('"', i);
            g += this.getDefinition(g.slice(i, j));
        }

        return '\n' +  g;
    };
};
