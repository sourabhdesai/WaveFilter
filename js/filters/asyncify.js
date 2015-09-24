// Will turn any normal return based function into an asynchronous function
function normalAsync(func) {
	return function () {
		if (arguments.length == 0)
			throw new Error("Need at least a callback argument");

		var cbIdx = arguments.length - 1;
		var cb = arguments[cbIdx];
		
		// Remove callback
		delete arguments[cbIdx];
		arguments.length--;

		var res = null;
		var error = null;
		
		try {
			res = func.apply(null, arguments);
		} catch (err) {
			error = err;
		} finally {
			process.nextTick(function () {
				cb(error, res);
			});
		}
	};
}

function predicateAsync(func) {
	return function () {
		if (arguments.length == 0)
			throw new Error("Need at least a callback argument");

		var cbIdx = arguments.length - 1;
		var cb = arguments[cbIdx];
		
		// Remove callback
		delete arguments[cbIdx];
		arguments.length--;

		var res = null;
		
		try {
			res = func.apply(null, arguments);
		} catch (err) {
			res = false;
		} finally {
			process.nextTick(function () {
				cb(res);
			});
		}
	};
}

function memoizeSync(func, hasher) {
	var cache = {};
	return function () {
		hasher = hasher || function (x) {
			return JSON.stringify(x);
		};

		var hashed = hasher(arguments);

		if (hashed in cache)
			return cache[hashed];
		
		var val = func.apply(null, arguments);
		
		cache[hashed] = val;

		return val;
	}
}
exports.memoizeSync = memoizeSync;

exports.predicate = predicateAsync;
exports.normal = normalAsync;