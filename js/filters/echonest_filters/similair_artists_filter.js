var levenshtein = require('fast-levenshtein');
var async       = require('async');

var findSimilairArtists = require('./find_similair_artists.js');
var getMP3Details       = require('../../mp3_detail_finder.js').getMP3Details;

var AsyncPredFilter = require('../async_pred_filter.js');
var memoizeSync     = require('../asyncify.js').memoizeSync;

var MAX_EDIT_DISTANCE = 1; // Got a few false positives starting at 2

// Will use edit distance based text matching to determine weather haystack has the needle
function fuzzySearch(needle, haystack) {
	var editDistance = levenshtein.get(needle, haystack);
	return editDistance <= MAX_EDIT_DISTANCE;
}

function similairArtistsFilter(artistName) {
	artistName = artistName.toLowerCase();
	var asyncPred = function (filename, cb) {
		findSimilairArtists(artistName, function (err, similairArtists) {
			if (err) {
				console.log(err);
				return cb(false);
			}

			// Lower case artist names to make search be case insensitive
			similairArtists = similairArtists.map(function (similairArtist) {
				return similairArtist.toLowerCase();
			});

			// Add search artists so their songs aren't filtered out
			similairArtists.push(artistName);

			// Get Song Metadata for file
			getMP3Details(filename, function (err, info) {
				if (err) {
					console.log(err);
					return cb(false);
				}

				if (info == null)
					return cb(false);
				
				if (info.artist == "N/A")
					return cb(false);

				var fileArtist = info.artist.toLowerCase();

				// Check if theres at least one artist similair to the given
				// artist that is the same artist as the one for this song.
				var hasMatch = similairArtists.some(function (similairArtist) {
					return fuzzySearch(fileArtist, similairArtist) || fuzzySearch(similairArtist, fileArtist);
				});

				if (hasMatch) {
					console.log("Match:", info);
				}

				cb(hasMatch);
			});
		});
	};

	return async.memoize(asyncPred);
};

function argHasher(args) {
	return args[0]; // to be used as hasher in memoization
}

module.exports = memoizeSync(function (artistName) {
	var asyncPred = similairArtistsFilter(artistName);
	return new AsyncPredFilter(asyncPred);
}, argHasher);