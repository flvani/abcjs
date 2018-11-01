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
       "cn.1": '<path id="cn.1" transform="scale(0.07)" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M150.026,80.39h-22.84c-6.91,0-10.933,7.044-10.933,13.158c0,5.936,3.209,13.158,10.933,13.158 h7.259v85.36c0,8.734,6.257,13.605,13.176,13.605s13.185-4.881,13.185-13.605V92.771C160.798,85.789,156.945,80.39,150.026,80.39z"/>'
      ,"cn.2": '<path id="cn.2" transform="scale(0.07)" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.022,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M173.232,180.205h-32.038 c15.661-18.459,40.852-39.753,40.852-63.736c0-21.91-16.564-35.882-39.216-35.882c-22.661,0-43.847,17.977-43.847,39.717 c0,6.731,4.604,12.586,13.445,12.586c17.691,0,8.108-28.498,29.294-28.498c7.554,0,13.266,6.204,13.266,13.284 c0,6.204-3.138,11.558-6.454,16.046c-13.999,18.969-30.581,34.496-45.867,51.579c-1.841,2.065-4.246,5.176-4.246,8.796 c0,7.938,6.266,11.38,14.365,11.38h61.528c6.999,0,13.266-4.568,13.266-12.497C187.58,185.05,181.331,180.205,173.232,180.205z"/>'
      ,"cn.3": '<path id="cn.3" transform="scale(0.07)" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M167.717,137.637 c8.966-5.936,13.364-15.277,13.364-25.977c0-13.239-11.254-31.082-34.729-31.082c-18.093,0-35.542,14.276-35.542,27.515 c0,6.284,3.915,12.56,10.602,12.56c11.085,0,8.966-16.636,24.449-16.636c7.339,0,11.737,4.925,11.737,11.371 c0,18.853-23.152,6.794-23.152,24.627c0,20.033,27.72,2.548,27.72,26.317c0,9.002-6.856,15.796-15.331,15.796 c-18.424,0-15.813-19.872-26.898-19.872c-5.873,0-12.551,4.756-12.551,11.38c0,13.418,15,31.922,39.127,31.922 c23.152,0,41.084-17.154,41.084-37.527C187.598,154.621,179.445,143.25,167.717,137.637z"/>'
      ,"cn.4": '<path id="cn.4" transform="scale(0.07)" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M175.065,155.122h-5.042v-52.607 c0-15.59-8.394-21.937-18.933-21.937c-9.449,0-14.535,3.093-18.531,9.94l-40.7,69.565c-1.091,1.707-2.548,3.772-2.548,7.545 c0,4.452,3.817,10.11,12.72,10.11h43.793V192.3c0,9.091,1.85,13.364,11.12,13.364s13.078-4.282,13.078-13.364v-14.562h5.042 c7.089,0,12.72-4.452,12.72-11.317C187.785,159.573,182.154,155.122,175.065,155.122z M146.379,155.122h-24.896l24.529-47.816 h0.367V155.122z"/>'
      ,"cn.5": '<path id="cn.5" transform="scale(0.07)" \nd="M143.027,0C64.04,0,0,64.04,0,143.027c0,78.996,64.04,143.027,143.027,143.027 s143.027-64.031,143.027-143.027C286.054,64.04,222.014,0,143.027,0z M143.027,259.236c-64.183,0-116.209-52.026-116.209-116.209 S78.844,26.818,143.027,26.818s116.209,52.026,116.209,116.209S207.21,259.236,143.027,259.236z M149.678,120.849 c-4.613,0-9.395,0.867-13.811,1.716l2.762-18.325h34.63c3.316,0,12.89-1.037,12.89-12.971c0-6.222-4.979-10.888-13.445-10.888 h-44.401c-8.832,0-12.712,2.941-14.365,16.43l-4.604,36.481c-0.188,1.895-0.554,3.629-0.554,5.873 c0,2.941,3.683,8.126,10.861,8.126c9.395,0,11.049-5.703,21.74-5.703c11.424,0,17.691,7.08,17.691,17.458 c0,10.897-6.633,22.643-19.523,22.643c-12.345,0-21.195-11.058-28.561-11.058c-6.812,0-12.515,5.364-12.515,11.755 c0,15.214,27.443,23.17,40.521,23.17c31.859,0,48.817-19.023,48.817-47.896C187.812,137.44,171.972,120.849,149.678,120.849z"/>'
      ,"n.0": '<path id="n.0" transform="scale(0.95)" \nd="@@"/>'
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
