var chai = require("chai");
var assert = chai.assert;

var findSimilairArtists = require('../js/filters/echonest_filters/find_similair_artists.js');

var artistMatches = [
	{
		'artist': 'The Beatles',
		'matches': ['Echo & The Bunnymen', 'Tubeway Army', 'Killing Joke']
	},
	{
		'artist': 'The Shins',
		'matches': ['The Cure', 'The Smiths', 'The New Order']
	}
];

// Run test for each artistMatches
artistMatches.forEach(function (artistMatch) {

	describe("Will find similair artists to a given artist", function () {
		it("Should check that there are certain similair artists for a given artists", function (done) {
			findSimilairArtists(artistMatch.artist, function (err, similairArtists) {
				console.log(artistMatch.artist,similairArtists);
				assert.isNull(err, "Received error");
				var hasMatches = similairArtists.some(function (similairArtist) {
					return artistMatch.matches.some(function (expectedMatch) {
						similairArtists == expectedMatch;
					});
				});
				assert.isTrue(hasMatches, "Not all matches were found");
				done();
			});
		})
	});

});