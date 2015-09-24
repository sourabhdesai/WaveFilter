var async = require("async");
var echo = require("./echo_instance.js");
var getMP3Details = require("../../mp3_detail_finder.js").getMP3Details;

var SUCCESS_CODE = 0;

var getSongEchoID = async.memoize(function(filename, cb) {
	
	getMP3Details(filename, function (err, songInfo) {
		if (err)
			return cb(err);
		if (songInfo == null)
			return cb(new Error("Couldn't retrieve song info for \"" + filename + "\""));

		var query = {};

		if (songInfo.songName != "N/A")
			query.title = songInfo.songName;
		if (songInfo.artist != "N/A")
			query.artist = songInfo.artist;
		
		query.combined = filename; // Works for most filenames since theyll have the artist and song name

		echo("song/search").get(query, function (err, result) {
			if (err)
				return cb(err);

			if (result.response.status.code == SUCCESS_CODE) {
				
				if (result.response.songs.length == 0)
					return cb(new Error("No songs found from Echonest for given mp3 file")); // no songs found

				var song = result.response.songs[0];

				cb(null, song.id); // the unique id for the song
			} else {
				cb(new Error(result.response.status.message));
			}
		});
	});

});

module.exports = getSongEchoID;