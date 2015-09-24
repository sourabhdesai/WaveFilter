var EventEmitter = require('events').EventEmitter;

var HIT_EVENT_NAME = 'hit';

var SearchHitEmitter = function () {
	this.emitter = new EventEmitter();

	SearchHitEmitter.prototype.onHit = function(listener) {
		this.emitter.on(HIT_EVENT_NAME, listener);
	};

	SearchHitEmitter.prototype.stopListening = function() {
		this.emitter.removeAllListeners();
	};

	SearchHitEmitter.prototype.emitHit = function(searchHit) {
		this.emitter.emit(HIT_EVENT_NAME, searchHit);
	};
};

module.exports = SearchHitEmitter;