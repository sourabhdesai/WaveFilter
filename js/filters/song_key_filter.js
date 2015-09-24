var AsyncPredFilter = require('./async_pred_filter.js');
var async           = require('async');
var asyncify        = require('./asyncify.js');

var findSongKey = require("./song_key_finder.js");
var mp3DetailFinder = require('../mp3_detail_finder.js');

function getSongKey(keyString) {
	var keyString = keyString.toLowerCase().trim();
	
	var asyncPred = function (filename, cb) {
		mp3DetailFinder.getMP3Details(filename, function (err, info) {
			if (err == null && info != null && info.key != "N/A") {
				return cb(keyString == info.key.toLowerCase());
			}

			findSongKey(filename, function (err, songKey) {
				if (err) {
					console.log(err);
					return cb(false);
				}

				// Updated the MP3's metdata. Invalidate the cached metadata
				mp3DetailFinder.invalidateCacheEntry(filename);

				songKey = songKey.toLowerCase();

				cb(keyString == songKey);
			});
		});
	};

	return async.memoize(asyncPred);
}

function argHasher(args) {
	return args[0];
}

module.exports = asyncify.memoizeSync(function (keyString) {
	var asyncPred = getSongKey(keyString);
	return new AsyncPredFilter(asyncPred);
}, argHasher);