var chai = require('chai');
var assert = chai.assert;

var getSentimentFilter = require('../js/filters/sentiment_filter.js');

var mp3Path = "/Users/sourabhdesai/Documents/Node Projects/WaveFilter/test_files/04. Happy Idiot.mp3";

var sentRange = [-3, -2]; // sentiment rage

describe("Will check that sentiment of song is correct", function () {

	it('Should say that the sentiment of Happy Idiot is between ' + sentRange[0] + '-' + sentRange[1], function (done) {

		var sentimentFilter = getSentimentFilter(sentRange[0] + ' to ' + sentRange[1]);
		sentimentFilter.asyncPredicate(mp3Path, function (inRange) {
			assert.isTrue(inRange, "Song wasn't in given range");
			done();
		});

	});

});