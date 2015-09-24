/*
Better source for song keys:
https://github.com/ibsh/is_KeyFinder/wiki
*/
var SUCCESS_CODE = 0;

var memoizeSync = require("../asyncify.js").memoizeSync;
var async = require("async");
var AsyncPredFilter = require("../async_pred_filter.js");

var echo = require("./echo_instance.js");
var getSongEchoID = require("./song_identifier.js");
var getMP3Details = require('../../mp3_detail_finder.js').getMP3Details;
var id3_write = require("id3_reader").write;

/*
 * From echonest documentation:
 * Keys have following mappings
 * (c, c-sharp, d, e-flat, e, f, f-sharp, g, a-flat, a, b-flat, b) = 0 - 11
 * No e-sharp & no b-sharp, no c-flat & no f-flat
 */
var ECHO_KEY_MAPPINGS = {
	'c': 0,
	'c-sharp': 1,
	'c#': 1,
	'd-flat': 1,
	'db': 1,
	'd': 2,
	'd-sharp': 3,
	'd#': 3,
	'e-flat': 3,
	'eb': 3,
	'e': 4,
	'f': 5,
	'f-sharp': 6,
	'f#': 7,
	'g-flat': 6,
	'gb': 6,
	'g': 7,
	'g-sharp': 8,
	'g#': 8,
	'a-flat': 8,
	'ab': 8,
	'a': 9,
	'a-sharp': 10,
	'a#': 10,
	'b-flat': 10,
	'bb': 10,
	'b': 11
};

function getSongKeyCode(keyString) {
	keyString = keyString.replace(" ", "-").toLowerCase();
	if (! keyString in ECHO_KEY_MAPPINGS)
		throw new Error(keyString + " is not a valid key");

	return ECHO_KEY_MAPPINGS[keyString];
}

var ECHO_TO_ID3_MAPPINGS = {
	'c': 'C',
	'c-sharp': 'C#',
	'c#': 'C#',
	'd-flat': 'Db',
	'db': 'Db',
	'd': 'D',
	'd-sharp': 'D#',
	'd#': 'D#',
	'e-flat': 'Eb',
	'eb': 'Eb',
	'e': 'E',
	'f': 'F',
	'f-sharp': 'F#',
	'f#': 'F#',
	'g-flat': 'Gb',
	'gb': 'Gb',
	'g': 'G',
	'g-sharp': 'G#',
	'g#': 'G#',
	'a-flat': 'Ab',
	'ab': 'Ab',
	'a': 'A',
	'a-sharp': 'A#',
	'a#': 'A#',
	'b-flat': 'Bb',
	'bb': 'Bb',
	'b': 'B'
};

function convertKeyCodeToID3(keyCode) {
	var matchingKeys = Object.keys(ECHO_KEY_MAPPINGS).filter(function (key) {
		return ECHO_KEY_MAPPINGS[key] == keyCode;
	});

	if (matchingKeys.length == 0)
		throw new Error("Not a valid key code input: " + keyCode);

	var matchingKey = matchingKeys[0];

	return ECHO_TO_ID3_MAPPINGS[matchingKey];
}

function songKeyFilter(key) {
	var keyCode = getSongKeyCode(key);
	var asyncPred = function (filename, cb) {
		getMP3Details(filename, function (err, info) {
			if (err == null && info != null && info.key != "N/A") {
				return cb(key == info.key);
			}

			getSongEchoID(filename, function (err, id) {
				if (err) {
					console.log("Error from echonest getSongEchoID: ", err);
					return cb(false);
				}

				echo("song/profile").get({
					"id": id,
					"bucket": "audio_summary"
				}, function (err, result) {
					if (err) {
						console.log("Error from echonest song/profile: ", err);
						return cb(false);
					}

					if (result.response.status.code == SUCCESS_CODE) {
						if (result.response.songs.length == 0) {
							console.log("Retrieved no songs under id=" + id);
							return cb(false);
						}

						var song = result.response.songs[0];
						cb(song.audio_summary.key == keyCode);

						// Write the key to the mp3 file so that it can be stored locally
						var id3Key = convertKeyCodeToID3(song.audio_summary.key);
						var params = {
							"path": filename,
							"tags": {
								"initial_key": id3Key
							}
						};

						id3_write(params, function (err) {
							if (err)
								console.log(err);
						});
					} else {
						console.log(new Error(result.response.status.message));
						return cb(false);
					}
				});
			});
		});

	};

	var memoizedPred = async.memoize(asyncPred);
	return memoizedPred;
}

var argHasher = function (args) {
	return args[0];
};

module.exports = memoizeSync(function (key) {
	var asyncPred = songKeyFilter(key);
	return new AsyncPredFilter(asyncPred);
}, argHasher);