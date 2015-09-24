var chai = require("chai");
var assert = chai.assert;

var songKeyFilter = require("../js/filters/song_key_filter.js");

var mp3Filepath = "/Users/sourabhdesai/Documents/Node Projects/WaveFilter/test_files/04. Happy Idiot.mp3";

describe("Tests that key filter will not have false negatives", function () {

	it("Should not remove song from list of files", function (done) {
		var keyFilter = songKeyFilter("Bm");
		keyFilter.asyncPredicate(mp3Filepath, function (isInKey) {
			assert.isTrue(isInKey, "Key didn't match up for given song");
			done();
		});
	});

});

describe("Tests memoization of songKeyFilter function for identical calls", function () {

	it("Should check that two calls to songKeyFilter with same key return same value", function (done) {
		var keyFilter1 = songKeyFilter("c");
		var keyFilter2 = songKeyFilter("c");
		assert.equal(keyFilter1, keyFilter2, "Identical calls to songKeyFilter weren't memoized");
		done();
	});

});

describe("Tests memoization of songKeyFilter function for differing calls", function () {

	it("Should check that two calls to songKeyFilter with same key return same value", function (done) {
		var keyFilter1 = songKeyFilter("c");
		var keyFilter2 = songKeyFilter("d");
		assert.notEqual(keyFilter1, keyFilter2, "Differing calls to songKeyFilter have colliding parameter hashes");
		done();
	});

});