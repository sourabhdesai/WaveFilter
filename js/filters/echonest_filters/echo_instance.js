var API_KEY = require("../../../configs/creds.json").echonest_key;

var echojs = require('echojs');

var echo = new echojs({
	"key": API_KEY
});

module.exports = echo;