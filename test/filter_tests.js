var chai = require("chai");
var assert = chai.assert;

var fileSearch = require("../js/file_finder.js");
var musicFilter = require("../js/filters/extension_filter.js");

describe("Tests to see that return value of searchForFilesInDirs is array of strings", function () {
	
	it("Should check that all elements in array are strings", function (done) {
		fileSearch({
			"fileFilter": musicFilter.asyncPredicate,
			"dirs": ["~/Music"],
			"depth": 1
		}, function (err, mp3Files) {
			if (err)
				return done(err);

			assert.typeOf(mp3Files, "array", "Returned mp3Files array wasn't an array");

			mp3Files.forEach(function (mp3File, idx) {
				assert.typeOf(mp3File, "string", "Returned mp3 filepath wasn't a string at index: " + idx);
			});

			done();
		});
		
	});

});