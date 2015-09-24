var chai = require("chai");
var assert = chai.assert;

var getMP3Details = require("../js/mp3_detail_finder.js").getMP3Details;


var metadata = {
	"songName": "Happy Idiot",
	"artist": "TV On The Radio",
	"album": "Seeds",
	"filename": "/Users/sourabhdesai/Documents/Node Projects/WaveFilter/test_files/04. Happy Idiot.mp3"
};

describe("Tests that mp3DetailFinder extracts the right metadata from an mp3 file", function () {

	it("Should extract the correct metadata from a known mp3 file", function (done) {

		getMP3Details(metadata.filename, function (err, result) {
			if (err)
				done(err);

			assert.isNotNull(result, "getMP3Details return null result value");
			assert.equal(metadata.songName, result.songName, "Song names didnt match");
			assert.equal(metadata.artist, result.artist, "Artists didnt match");
			assert.equal(metadata.album, result.album, "Album didnt match");
			
			done();
		});

	});

});