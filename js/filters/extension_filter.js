var AsyncPredFilter = require("./async_pred_filter.js");
var asyncify = require("./asyncify");

var musicDirs = require("../../configs/music_dirs.json");
var musicExtensions = require("../../configs/music_extensions.json");

// get extension for a given filename. Returns null if doesn't have an extension
function getFileExtension(filename) {
	var extensionIdx = filename.lastIndexOf(".");
	if (extensionIdx <= 0)
		return null;
	var extension = filename.substring(extensionIdx + 1);
	return extension;
}

function musicFilter(filename) {
	var fileExt = getFileExtension(filename);
	return musicExtensions.some(function (extension) {
		return fileExt == extension;
	});
}

var asyncMusicFilter = asyncify.predicate(musicFilter);

module.exports = new AsyncPredFilter(asyncMusicFilter);