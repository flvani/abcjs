/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {};

if (!window.DIATONIC.map)
    window.DIATONIC.map = {};

DIATONIC.map.accordionMaps = [];

DIATONIC.map.key2number = 
    {"C":0, "C♯":1, "D♭":1, "D":2, "D♯":3, "E♭":3, "E":4, 
     "F":5 ,"F♯":6 ,"G♭":6, "G":7, "G♯":8 ,"A♭":8, "A":9, "A♯":10, "B♭":10, "B":11 };

DIATONIC.map.number2key    = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
DIATONIC.map.number2key_br = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];

DIATONIC.map.loadAccordionMaps = function ( files, cb )  {
    var toLoad = 0;
    for( var f = 0; f <  files.length; f ++ ) {
        toLoad ++;
        FILEMANAGER.register('MAP');

        $.getJSON( files[f], {  format: "json"  })
            .done(function( data ) {
                FILEMANAGER.deregister('MAP', true);
                DIATONIC.map.accordionMaps.push( new DIATONIC.map.AccordionMap(data) );
            })
            .fail(function( data, textStatus, error ) {
                FILEMANAGER.deregister('MAP', false);
                var err = textStatus + ", " + error;
                console.log( "Accordion Load Failed:\nLoading: " + data.responseText.substr(1,40) + '...\nError:\n ' + err );
            })
            .always(function() {
                toLoad --; 
                if(toLoad === 0 ) {
                    DIATONIC.map.accordionMaps.sort( function(a,b) { 
                        return a.menuOrder > b.menuOrder;
                    });
                }
                if( toLoad === 0 && cb ) {
                    cb();
                }
            });
    }
};

