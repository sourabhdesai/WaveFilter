var async = require('async');
var echo  = require("./echo_instance.js");

var SUCCESS_CODE = 0;

 var NUM_SIMILAIR_ARTISTS = 75;

function getArtistsSimilairTo(artistName, cb) {
	artistName = artistName.replace(" ", "+");
	var query = {
		'name': artistName,
		'results': NUM_SIMILAIR_ARTISTS
	};
	echo("artist/similar").get(query, function (err, result) {
		if (err)
			return cb(err);

		if (result.response.status.code == SUCCESS_CODE) {
			if (result.response.artists.length == 0)
				return cb(new Error("No songs found from Echonest for given mp3 file")); // no songs found

			var similairArtists = result.response.artists.map(function (artistInfo) {
				return artistInfo.name;
			});

			cb(null, similairArtists); // the unique id for the song
		} else {
			cb(new Error(result.response.status.message));
		}
	});
}

module.exports = async.memoize(getArtistsSimilairTo);