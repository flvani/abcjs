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
       "1": '<path id="1" transform="scale(0.95)" \nd="@@"/>'
      ,"2": '<path id="2" transform="scale(0.95)" \nd="@@"/>'
      ,"3": '<path id="3" transform="scale(0.95)" \nd="@@"/>'
      ,"4": '<path id="4" transform="scale(0.95)" \nd="@@"/>'
      ,"5": '<path id="5" transform="scale(0.95)" \nd="@@"/>'
      ,"6": '<path id="6" transform="scale(0.95)" \nd="@@"/>'
      ,"7": '<path id="7" transform="scale(0.95)" \nd="@@"/>'
      ,"8": '<path id="8" transform="scale(0.95)" \nd="@@"/>'
      ,"9": '<path id="9" transform="scale(0.95)" \nd="@@"/>'
      ,"clefs.G": '<path id="clefs.G" \nd="@@"/>'
      ,"clefs.F": '<path id="clefs.F" \nd="@@"/>'
      ,"clefs.C": '<path id="clefs.C" \nd="@@"/>'
      ,"clefs.tab": '<path id="clefs.tab" class="abcr" transform="scale(0.9)" \nd="@@"/>'
      ,"timesig.common": '<path id="timesig.common" \nd="@@"/>'
      ,"dots.dot": '<path id="dots.dot" \nd="@@"/>'
      ,"accidentals.nat": '<path id="accidentals.nat" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.sharp": '<path id="accidentals.sharp" transform="scale(0.8)" \nd="@@"/>'
      ,"accidentals.flat": '<path id="accidentals.flat" transform="scale(0.8)" \nd="@@"/>'
      ,"graceheads.quarter": '<g id="graceheads.quarter" transform="scale(0.6)" ><use xlink:href="#noteheads.quarter" /></g>'
      ,"noteheads.quarter": '<path id="noteheads.quarter" \nd="@@"/>'
      ,"noteheads.half": '<path id="noteheads.half" \nd="@@"/>'
      ,"noteheads.whole": '<path id="noteheads.whole" \nd="@@"/>'
      ,"notehesad.dbl": '<g id="notehesad.dbl">\n<use xlink:href="#noteheads.whole"/>\n<path d="m-6 -4v8m12 0v-8" />\n</g>'
      ,"rests.quarter": '<path id="rests.quarter" \nd="@@"/>'
      ,"rests.half": '<path id="rests.half" \nd="@@"/>'
      ,"rests.8th": '<path id="rests.8th" \nd="@@"/>'
      ,"rests.16th": '<path id="rests.16th" \nd="@@"/>'
      ,"flags.d8th": '<path id="flags.d8th" \nd="@@"/>'
      ,"flags.d16th": '<path id="flags.d16th" \nd="@@"/>'
      ,"flags.u8th": '<path id="flags.u8th" \nd="@@"/>'
      ,"flags.u16th": '<path id="flags.u16th" \nd="@@"/>'
      ,"graceflags.d8th": '<g id="graceflags.d8th" transform="scale(0.6)" ><use xlink:href="#flags.d8th" /></g>'
      ,"graceflags.u8th": '<g id="graceflags.u8th" transform="scale(0.6)" ><use xlink:href="#flags.u8th" /></g>'
      ,"scripts.segno": '<path id="scripts.segno" \nd="@@"/>'
      ,"scripts.lbrace": '<path id="scripts.lbrace" \nd="@@"/>'
      ,"button": '<symbol id="button" viewBox= "0 0 56 56">\n\
    <circle cx="28" cy="28" r="26" style="fill: var(--fill-color, white); stroke=: var(--fill-color, white); stroke-width=0;" ></circle>\n\
    <path d="M 2 34 a26 26 0 0 1 52 -12" style="fill: var(--close-color, none)" stroke="none" stroke-width="0"></path>\n\
    <path d="M 54 22 a26 26 0 0 1 -52 12" style="fill: var(--open-color, none)" stroke-width="0"></path>\n\
    <circle cx="28" cy="28" r="26" style="fill:none; stroke: var(--border-color, black ); stroke-width: var(--border-width, 1);" ></circle>\n\
    <path d="m 2 34 l 52 -12" style="stroke: var(--border-color, black); stroke-width: var(--border-width, 1);" ></path>\n\</symbol>\n'
    };
    
    this.getDefinition = function (gl) {
        
        
        var g = glyphs[gl];
        
        if (!g) {
            return "";
        }
        
        // expande path se houver, buscando a definicao do original do ABCJS.
        g = g.replace('@@', abc_glyphs.getTextSymbol(gl) );
        
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
