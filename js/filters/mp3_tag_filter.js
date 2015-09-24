var fs = require("fs");
var mp3DetailFinder = require("../mp3_detail_finder.js").getMP3Details;
var async = require('async');

var AsyncPredFilter = require("./async_pred_filter.js");
var memoizeSync = require("./asyncify.js").memoizeSync;

var levenshtein = require('fast-levenshtein');

var MAX_EDIT_DISTANCE = 1; // Got a few false positives starting at 3

// Will use edit distance based text matching to determine weather haystack has the needle
function fuzzySearch(needle, haystack) {
	var editDistance = levenshtein.get(needle, haystack);
	return editDistance <= MAX_EDIT_DISTANCE;
}

/*
	From here: http://id3.org/id3v2.3.0#Text_information_frames
	"Album"      <-> "TALB"
	"LeadArtist" <-> "TPE1" (A / separated list)
	"Title"      <-> "TIT2"
*/

function fromAlbumFunc(albumTitle) {
	albumTitle = albumTitle.toLowerCase();
	var asyncPred = function (filename, cb) {
		mp3DetailFinder(filename, function (err, info) {
			if (err) {
				console.log(err);
				return cb(false);
			}

			if (info == null)
				return cb(false);

			if (info.album == "N/A")
				return cb(false);
			
			var matched = fuzzySearch(albumTitle, info.album.toLowerCase());
			
			cb(matched);
		});
	};

	var memoizedFunc = async.memoize(asyncPred);
	return memoizedFunc;
}

function argHasher(args) {
	return args[0]; // to be used as hasher in memoization
}

exports.AlbumFilter = memoizeSync(function (albumTitle) {
	var asyncPred = fromAlbumFunc(albumTitle);
	return new AsyncPredFilter(asyncPred);
}, argHasher);

function fromArtistFunc(artistName) {
	artistName = artistName.toLowerCase();
	var asyncPred = function (filename, cb) {
		mp3DetailFinder(filename, function (err, info) {
			if (err) {
				console.log(err);
				return cb(false);
			}

			if (info == null)
				return cb(false);

			if (info.artist == "N/A")
				return cb(false);
			
			var matched = fuzzySearch(artistName, info.artist.toLowerCase());
			
			cb(matched);
		});
	};

	var memoizedFunc = async.memoize(asyncPred);
	return memoizedFunc;
}

exports.ArtistFilter = memoizeSync(function (artistName) {
	var asyncPred = fromArtistFunc(artistName);
	return new AsyncPredFilter(asyncPred);
}, argHasher);

function hasTitleFunc(songTitle) {
	songTitle = songTitle.toLowerCase();
	var asyncPred = function (filename, cb) {
		mp3DetailFinder(filename, function (err, info) {
			if (err) {
				console.log(err);
				return cb(false);
			}

			if (info == null)
				return cb(false);

			if (info.songName == "N/A")
				return cb(false);
			
			var matched = fuzzySearch(songTitle, info.songName.toLowerCase());
			
			cb(matched);
		});
	};

	var memoizedFunc = async.memoize(asyncPred);
	return memoizedFunc;
}

exports.TitleFilter = memoizeSync(function (songTitle) {
	var asyncPred = hasTitleFunc(songTitle);
	return new AsyncPredFilter(asyncPred);
}, argHasher);