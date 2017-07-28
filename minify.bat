
@echo "Concatenating all files..."
@echo .

@IF [%1]==[] echo Informe o numero da versao. Formato x.xx
@IF [%1]==[] goto :fim

copy /b/y ace\src\ace.js+ace\src\mode-abcx.js+ace\src\theme-abcx.js tmp\ace4abcx.js

copy /b/y css\menu-group.css+css\dropdown-menu.css+css\tabbed-view.css+css\draggable.css tmp\styles4abcx.css

copy /b/y diatonic\* tmp\diatonic.js
copy /b/y parse\* tmp\parse.js
copy /b/y tablature\* tmp\tablature.js
copy /b/y write\* tmp\write.js
copy /b/y midi\* tmp\midi.js
copy /b/y svg\* tmp\svg.js

copy /b/y draggable\draggable.js+draggable\dropdown.js tmp\abcjs-windows.js

copy /b/y api\abc_tunebook.js+data\abc_tune.js+tmp\parse.js+tmp\write.js+edit\abc_selectors.js+edit\abc_editarea.js tmp\abcjs-nomidi.js

copy /b/y tmp\abcjs-nomidi.js+tmp\midi.js+tmp\abcjs-windows.js tmp\abcjs-all.js

copy /b/y tmp\abcjs-all.js+edit\abc_editor.js tmp\abcjs_editor.js
copy /b/y tmp\abcjs-nomidi.js+edit\abc_editor.js tmp\abcjs_editor-nomidi.js

copy /b/y tmp\abcjs-all.js+tmp\tablature.js+tmp\svg.js tmp\abcxjs.js
copy /b/y tmp\abcjs-nomidi.js+tmp\tablature.js tmp\abcxjs-nomidi.js

@set versao=%1

@echo "Compressing STYLES4ABCX css ..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\styles4abcx_%versao%-min.css tmp\styles4abcx.css

@echo "Compressing ACE4ABCX lib ..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\ace4abcx_%versao%-min.js tmp\ace4abcx.js

@echo "Compressing ABCX %versao% tabeditor lib ..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\abcxjs_%versao%-min.js tmp\abcxjs.js

@echo "Compressing diatonic-map lib..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\diatonic_%versao%-min.js tmp\diatonic.js

@echo "Compressing file manager lib..."
java -Dfile.encoding=utf-8 -jar yuicompressor-2.4.2.jar  --line-break 7000 -o bin\filemanager_%versao%-min.js file\filemanager.js

copy /b/y fontsIco\abcx.* ..\diatonic-map\fontsIco\
copy /b/y jslib\* ..\diatonic-map\jslib\

copy /b/y tmp\abcxjs.js ..\diatonic-map\abcxjs\
copy /b/y tmp\ace4abcx.js ..\diatonic-map\ace4abcx\
copy /b/y tmp\diatonic.js ..\diatonic-map\diatonic\
copy /b/y file\filemanager.js ..\diatonic-map\file\
copy /b/y tmp\styles4abcx.css  ..\diatonic-map\css\

copy /b/y bin\abcxjs_%versao%-min.js ..\diatonic-map\abcxjs\
copy /b/y bin\ace4abcx_%versao%-min.js ..\diatonic-map\ace4abcx\
copy /b/y bin\diatonic_%versao%-min.js ..\diatonic-map\diatonic\
copy /b/y bin\filemanager_%versao%-min.js ..\diatonic-map\file\
copy /b/y bin\styles4abcx_%versao%-min.css  ..\diatonic-map\css\

:fim