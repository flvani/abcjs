#!/bin/sh
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "Call with a version number argument in the form x.y"
echo $1 | grep -E -q '^[1-9]\.[0-9]+$' || die "Version number argument required (x.y), $1 provided"
echo "Concatenating all files..."

cat parse/abc_common.js parse/abc_parse.js parse/abc_parse_directive.js \
    parse/abc_parse_header.js parse/abc_parse_key_voice.js \
    parse/abc_tokenizer.js parse/abc_transposer.js > tmp/parse.js

cat tablature/accordion_map.js tablature/accordion_parse.js \
    tablature/accordion_infer.js tablature/accordion_layout.js > tmp/tablature.js

cat write/abc_glyphs.js write/abc_graphelements.js write/abc_layout.js \
    write/abc_write.js write/sprintf.js > tmp/write.js

cat api/abc_tunebook.js data/abc_tune.js tmp/parse.js tmp/write.js > tmp/abcjs-noraphael-nomidi.js
cat tmp/abcjs-noraphael-nomidi.js midi/midiparser.js  midi/midiplayer.js > tmp/abcjs-noraphael.js
cat write/raphael.js tmp/abcjs-noraphael-nomidi.js > tmp/abcjs_nomidi.js
cat write/raphael.js tmp/abcjs-noraphael.js > tmp/abcjs_all.js

cat tmp/abcjs_all.js edit/abc_editor.js > tmp/abcjs_editor.js
cat tmp/abcjs_nomidi.js edit/abc_editor.js > tmp/abcjs_editor-nomidi.js
cat tmp/abcjs-noraphael.js edit/abc_editor.js > tmp/abcjs_editor-noraphael.js
cat tmp/abcjs-noraphael-nomidi.js edit/abc_editor.js > tmp/abcjs_editor-noraphael-nomidi.js

cat tmp/abcjs_editor.js tmp/tablature.js > tmp/abcxjs.js
cat tmp/abcjs_editor-nomidi.js tmp/tablature.js > tmp/abcxjs-nomidi.js
cat tmp/abcjs_editor-noraphael.js tmp/tablature.js > tmp/abcxjs-noraphael.js
cat tmp/abcjs_editor-noraphael-nomidi.js tmp/tablature.js > tmp/abcxjs-noraphael-nomidi.js

#echo "Compressing basic..."
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_basic_$1-min.js tmp/abcjs_all.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_basic_nomidi_$1-min.js tmp/abcjs_nomidi.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_basic_noraphael_$1-min.js tmp/abcjs-noraphael.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_basic_noraphael_nomdidi_$1-min.js tmp/abcjs-noraphael-nomidi.js
#echo "Compressing editor..."
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_editor_$1-min.js tmp/abcjs_editor.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_editor_nomidi_$1-min.js tmp/abcjs_editor-nomidi.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_editor_noraphael_$1-min.js tmp/abcjs_editor-noraphael.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcjs_editor_noraphael_nomidi_$1-min.js tmp/abcjs_editor-noraphael-nomidi.js

echo "Compressing tabeditor..."
java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcxjs_$1-min.js tmp/abcxjs.js

#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcxjs_nomidi_$1-min.js tmp/abcxjs-nomidi.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcxjs_noraphael_$1-min.js tmp/abcxjs-noraphael.js
#java -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin/abcxjs_noraphael_nomidi_$1-min.js tmp/abcxjs-noraphael-nomidi.js

echo "Removing temporary files..."
rm tmp/*

