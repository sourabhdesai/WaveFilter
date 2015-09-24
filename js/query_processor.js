var async = require("async");

var AsyncPredFilter  = require("./filters/async_pred_filter.js");
var SearchHitEmitter = require('./search_hit_emitter.js');

// Filters
var musicFileFilter       = require("./filters/extension_filter.js");
var mp3TagFilter          = require("./filters/mp3_tag_filter.js");
var songKeyFilter         = require("./filters/song_key_filter.js");
var sentimentFilter       = require("./filters/sentiment_filter.js");
var similairArtistsFilter = require("./filters/echonest_filters/similair_artists_filter.js");

var searchFs        = require("./filtered_file_emitter.js");
var mp3DetailFinder = require("./mp3_detail_finder.js").getMP3Details;

var directories = require("../configs/music_dirs.json");

var AND_TOKEN = "And";
var OR_TOKEN  = "Or";

var SEARCH_DEPTH = 3;

var filters = {
	"Song Name": mp3TagFilter.TitleFilter,
	"Album": mp3TagFilter.AlbumFilter,
	"Artist": mp3TagFilter.ArtistFilter,
	"Key": songKeyFilter,
	"Lyric Sentiment": sentimentFilter,
	"Similair Artists": similairArtistsFilter
};

function queryToNativeArray(query) {
	var nativeArr = [];
	for (var idx=0; idx< query.length; idx++)
		nativeArr.push(query[idx]);
	return nativeArr;
}

function reduceQuery(query) {
	query = queryToNativeArray(query);
	console.log(query);
	
	var fileFilter = musicFileFilter;

	if (query.length > 0) {
		firstQuery = query.shift();

		if (!firstQuery.type in filters)
			throw new Error("Query type '" + firstQuery.type + "' not a valid type");

		var firstAsyncPredFilter = filters[firstQuery.type](firstQuery.value);

		fileFilter = query.reduce(function (prev, curr, idx) {
			if (typeof prev == 'function' && typeof curr != 'object')
				throw new Error("Invalid query sequence: " + JSON.stringify(query, null, "\t"));

			if (typeof prev == 'object' && typeof curr != 'string')
				throw new Error("Invalid query sequence: " + JSON.stringify(query, null, "\t"));

			if (typeof prev == 'function') {
				if (typeof curr != 'object')
					throw new Error("Error parsing filter query");

				if (! curr.type in filters)
					throw new Error("Filter type '" + curr.type + "' isn't a valid filter type");

				var currAsyncPredFilter = filters[curr.type](curr.value);
				return prev(currAsyncPredFilter);
			}

			if (typeof prev == 'object')
				return function (otherAsyncPredFilter) {
					if (curr == AND_TOKEN)
						return prev.and(otherAsyncPredFilter);
					if (curr == OR_TOKEN)
						return prev.or(otherAsyncPredFilter);
				};
		}, firstAsyncPredFilter);

		fileFilter = musicFileFilter.filterFor(fileFilter);
	}

	return fileFilter;
}

exports.filterTypes = Object.keys(filters);

exports.processQuery = function (query, onQueryHit) {
	var fileFilter = reduceQuery(query);
	
	var hitEmitter = new SearchHitEmitter();
	hitEmitter.onHit(function (filename) {
		mp3DetailFinder(filename, function (err, details) {
			if (err) {
				console.log(err);
				return;
			}

			if (details != null)
				onQueryHit(details);
		});
	});

	searchFs({
		"fileFilter": fileFilter.asyncPredicate,
		"dirs": directories,
		"depth": SEARCH_DEPTH
	}, hitEmitter);
};