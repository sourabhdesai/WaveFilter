var fs = require("graceful-fs");
var mm = require('musicmetadata');
var async = require("async");

var cachedResults = {};

function getMP3Details(filename, cb) {
	if (filename in cachedResults) {
		var result = cachedResults[filename];
		process.nextTick(function () {
			cb(null, result);
		});
		return;
	}
	var readStream = fs.createReadStream(filename);

	var result = {
		"songName": "N/A",
		"artist": "N/A",
		"album": "N/A",
		"key": "N/A",
		"filename": filename
	};

	var receivedData = false;

	var parser = mm(readStream, function (err) {
		// This callback is only called after all data parsing events have been emmitted
		readStream.close();
		if (err) {
			console.log("getMP3Details Error: " + err);
			cb(null, null);
		} else if (receivedData) {
			cachedResults[filename] = result;
			cb(null, result);
		} else {
			cb(null, null);
		}
	});

	parser
		.on('TALB', function (value) {
			receivedData = true;
			result.album = value.trim();
		})
		.on('TPE1', function (value) {
			receivedData = true;
			result.artist = value.trim();
		})
		.on('TIT2', function (value) {
			receivedData = true;
			result.songName = value.trim();
		})
		.on('TKEY', function (value) {
			receivedData = true;
			result.key = value.trim();
		});
};

exports.getMP3Details = getMP3Details;

function invalidateCacheEntry(filename) {
	if (filename in cachedResults)
		delete cachedResults[filename];
}

exports.invalidateCacheEntry = invalidateCacheEntry;