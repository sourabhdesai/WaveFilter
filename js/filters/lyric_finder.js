var async   = require('async');
var request = require("request");

var getMP3Details = require('../mp3_detail_finder.js').getMP3Details;

function getLyricsEndpoint(artist, songName) {
	// Example: http://lyrics.wikia.com/api.php?artist=Flake%20Music&song=The%20Shins&fmt=realjson
	// make text URL friendly
	artist = artist.replace(" ", "%20").trim();
	songName = songName.replace(" ", "%20").trim();
	
	var urlBase   = "http://lyrics.wikia.com/api.php?";
	var urlParams = [
		"artist=" + artist,
		"song=" + songName,
		"fmt=realjson"
	].join('&');

	return urlBase + urlParams;
}

function getSongLyrics(filename, cb) {
	getMP3Details(filename, function (err, info) {
		if (err)
			return cb(err);

		if (info == null)
			return cb(new Error("Couldn't find MP3 Metdata Details for '" + filename + "'"));

		if (info.songName == "N/A" || info.artist == "N/A")
			return cb(new Error("Not Sufficient data to grab lyrics"));

		var endpoint = getLyricsEndpoint(info.artist, info.songName);
		// make request to lyric wikia
		request(endpoint, function (err, response, body) {
			if (err)
				return cb(err);

			var jsonRes = JSON.parse(body);
			var lyrics = jsonRes.lyrics;
			lyrics = lyrics.replace("[...]", ""); // get rid of [...]
			
			cb(null, lyrics);
		});
	});
}

module.exports = async.memoize(getSongLyrics);