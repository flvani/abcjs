echo "Concatenating all files..."

copy /b/y diatonic\* tmp\diatonic.js
copy /b/y parse\* tmp\parse.js
copy /b/y tablature\* tmp\tablature.js
copy /b/y write\* tmp\write.js
copy /b/y midi\* tmp\midi.js

copy /b/y api\abc_tunebook.js+data\abc_tune.js+tmp\parse.js+tmp\write.js tmp\abcjs-noraphael-nomidi.js

copy /b/y tmp\abcjs-noraphael-nomidi.js+tmp\midi.js tmp\abcjs-noraphael.js
copy /b/y tmp\abcjs-noraphael-nomidi.js tmp\abcjs_nomidi.js
copy /b/y tmp\abcjs-noraphael.js tmp\abcjs_all.js

copy /b/y tmp\abcjs_all.js+edit\abc_editor.js tmp\abcjs_editor.js
copy /b/y tmp\abcjs_nomidi.js+edit\abc_editor.js tmp\abcjs_editor-nomidi.js
copy /b/y tmp\abcjs-noraphael.js+edit\abc_editor.js tmp\abcjs_editor-noraphael.js
copy /b/y tmp\abcjs-noraphael-nomidi.js+edit\abc_editor.js tmp\abcjs_editor-noraphael-nomidi.js

copy /b/y tmp\abcjs_editor.js+tmp\tablature.js tmp\abcxjs.js
copy /b/y tmp\abcjs_editor-nomidi.js+tmp\tablature.js tmp\abcxjs-nomidi.js
copy /b/y tmp\abcjs_editor-noraphael.js+tmp\tablature.js tmp\abcxjs-noraphael.js
copy /b/y tmp\abcjs_editor-noraphael-nomidi.js+tmp\tablature.js tmp\abcxjs-noraphael-nomidi.js

set versao=3.20

echo Compressing ABCX %versao% tabeditor lib ...
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\abcxjs_%versao%-min.js tmp/abcxjs.js

echo "Compressing diatonic-map lib..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\diatonic_%versao%-min.js tmp/diatonic.js

echo "Compressing file manager lib..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\filemanager_%versao%-min.js file/filemanager.js

#echo "Removing temporary files..."
#rm tmp\*

