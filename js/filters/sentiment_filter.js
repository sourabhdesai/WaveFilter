var sentiment = require('sentiment');
var async     = require('async');

var AsyncPredFilter = require("./async_pred_filter.js");
var memoizeSync     = require('./asyncify.js').memoizeSync;

var getSongLyrics = require('./lyric_finder.js');

function songFilterFunc(sentBoundStr) {
	// Check string format
	var matches = sentBoundStr.match(/-*[0-9]+ to -*[0-9]+/ig) != null;

	if (!matches)
		throw new Error("'" + sentBoundStr + "' isn't in the correct format");

	var boundsStr = sentBoundStr.replace("to", "").split(" ").filter(function (str) {
		return str != '';
	});

	if (boundsStr.length != 2)
		throw new Error("Invalid input: " + sentBoundStr);

	var lowerBound = parseFloat(boundsStr[0]);
	var upperBound = parseFloat(boundsStr[1]);

	if (lowerBound > upperBound)
		throw new Error('Lower bound (' + lowerBound + ') must be greater than upper bound (' + upperBound + ')');

	// Curried function has sentiment bound in scope
	var asyncPred = function (filename, cb) {
		try {
			getSongLyrics(filename, function (err, lyrics) {
				if (err) {
					console.log(err);
					return cb(false);
				}

				sentiment(lyrics, function (err, result) {
					if (err) {
						console.log(err);
						return cb(false);
					}
					
					//console.log("Result: ", result);
					// just that score is within given bounds
					var score = result.score;
					var withinBound = (score >= lowerBound) && (score <= upperBound);
					//console.log("withinBound: ", withinBound);
					cb(withinBound);
				});
			});
		} catch (err) {
			console.log(err);
			return cb(false);
		}
	};

	return async.memoize(asyncPred); // memoize for efficeincy.
}

var argHasher = function (args) {
	return args[0];
};

module.exports = memoizeSync(function (sentBoundStr) {
	var asyncPred = songFilterFunc(sentBoundStr);
	return new AsyncPredFilter(asyncPred);
}, argHasher);