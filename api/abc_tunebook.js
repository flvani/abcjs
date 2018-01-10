//    abc_tunebook.js: splits a string representing ABC Music Notation into individual tunes.
//    Copyright (C) 2010 Paul Rosen (paul at paulrosen dot net)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

/*global document, Raphael */
/*global window */

if (!window.ABCXJS)
	window.ABCXJS = {};

(function() {
ABCXJS.numberOfTunes = function(abc) {
	var tunes = abc.split("\nX:");
	var num = tunes.length;
	if (num === 0) num = 1;
	return num;
};

ABCXJS.TuneBook = function(book) {
	var This = this;
	var directives = "";
	book = window.ABCXJS.parse.strip(book);
	var tunes = book.split("\nX:");
	for (var i = 1; i < tunes.length; i++)	// Put back the X: that we lost when splitting the tunes.
		tunes[i] = "X:" + tunes[i];
	// Keep track of the character position each tune starts with.
	var pos = 0;
	This.tunes = [];
	window.ABCXJS.parse.each(tunes, function(tune) {
		This.tunes.push({ abc: tune, startPos: pos});
		pos += tune.length;
	});
	if (This.tunes.length > 1 && !window.ABCXJS.parse.startsWith(This.tunes[0].abc, 'X:')) {	// If there is only one tune, the X: might be missing, otherwise assume the top of the file is "intertune"
		// There could be file-wide directives in this, if so, we need to insert it into each tune. We can probably get away with
		// just looking for file-wide directives here (before the first tune) and inserting them at the bottom of each tune, since
		// the tune is parsed all at once. The directives will be seen before the printer begins processing.
		var dir = This.tunes.shift();
		var arrDir = dir.abc.split('\n');
		window.ABCXJS.parse.each(arrDir, function(line) {
			if (window.ABCXJS.parse.startsWith(line, '%%'))
				directives += line + '\n';
		});
	}
	This.header = directives;

	// Now, the tune ends at a blank line, so truncate it if needed. There may be "intertune" stuff.
	window.ABCXJS.parse.each(This.tunes, function(tune) {
		var end = tune.abc.indexOf('\n\n');
		if (end > 0)
			tune.abc = tune.abc.substring(0, end);
		tune.pure = tune.abc;
		tune.abc = directives + tune.abc;

		// for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n
		var title = tune.pure.split("T:");
		if (title.length > 1) {
			title = title[1].split("\n");
			tune.title = title[0].replace(/^\s+|\s+$/g, '');;
		} else
			tune.title = "";

		// for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n
		var comps = tune.pure.split("C:");
                tune.composer = "";
                for( var c = 1; c <  comps.length; c ++ ) {
                    var aux = comps[c].split("\n");
                    tune.composer += (c>1?'<br>':'') + aux[0].replace(/^\s+|\s+$/g, '');
		} 

		// for the user's convenience, parse and store the id separately. The id is between the first X: and the next \n
		var id = tune.pure.substring(2,tune.pure.indexOf("\n"));
		tune.id = id.replace(/^\s+|\s+$/g, '');
	});
};

ABCXJS.TuneBook.prototype.getTuneById = function (id) {
	for (var i = 0; i < this.tunes.length; i++) {
		if (this.tunes[i].id === id)
			return this.tunes[i];
	}
	return null;
};

ABCXJS.TuneBook.prototype.getTuneByTitle = function (title) {
	for (var i = 0; i < this.tunes.length; i++) {
		if (this.tunes[i].title === title)
			return this.tunes[i];
	}
	return null;
};

function renderEngine(callback, output, abc, parserParams, renderParams) {
	var isArray = function(testObject) {
		return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
	};

	// check and normalize input parameters
	if (output === undefined || abc === undefined)
		return;
	if (!isArray(output))
		output = [ output ];
	if (parserParams === undefined)
		parserParams = {};
	if (renderParams === undefined)
		renderParams = {};
	var currentTune = renderParams.startingTune ? renderParams.startingTune : 0;

	// parse the abc string
	var book = new ABCXJS.TuneBook(abc);
	var abcParser = new window.ABCXJS.parse.Parse();

	// output each tune, if it exists. Otherwise clear the div.
	for (var i = 0; i < output.length; i++) {
		var div = output[i];
		if (typeof(div) === "string")
			div = document.getElementById(div);
		if (div) {
			div.innerHTML = "";
			if (currentTune < book.tunes.length) {
				abcParser.parse(book.tunes[currentTune].abc, parserParams);
				var tune = abcParser.getTune();
				callback(div, tune);
			}
		}
		currentTune++;
	}
}

})();
