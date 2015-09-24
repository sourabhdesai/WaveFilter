var async = require('async');
var echo  = require("./filters/echonest_filters/echo_instance.js");

var SUCCESS_CODE = 0;

function getArtistPic(artist, cb) {
	artist = artist.replace(" ", "+");
	
	var query = {
		"results": 1,
		"start": 0,
		"name": artist
	};
	
	// Make echonest api request
	echo("artist/images").get(query, function (err, result) {
		if (err)
			return cb(err);
		
		if (result.response.status.code == SUCCESS_CODE) {
			if (result.response.images.length == 0)
				return cb(new Error("No images found from Echonest for given artist: " + artist)); // no images found

			var imgUrls = result.response.images.map(function (imageInfo) {
				return imageInfo.url;
			});

			cb(null, imgUrls[0]); // only give one url, the very top most
		} else {
			cb(new Error(result.response.status.message));
		}
	});
}

module.exports = getArtistPic;