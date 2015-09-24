function extractAsyncArgs(args) {
	if (args.length == 0)
		throw new Error("args needs to have more at least one argument");
	
	var cbIdx = args.length - 1;
	var cb = args[cbIdx];
	
	delete args[cbIdx];
	
	args.length--;

	return [args, cb];
}

function extendArgs(args, cb) {
	var newArgs = {};
	
	for (var argIdx=0; argIdx < args.length; argIdx++)
		newArgs[argIdx] = args[argIdx];

	newArgs[args.length] = cb;
	newArgs.length = args.length + 1;

	return newArgs;
}

/**
 * NOTE:
 * May need to consider running and/or functions in parallel and then joining their results
 * May be faster to parallelize. Current implementation is sequential but will short-circuit
 */

function andPredicates(firstPred, secondPred) {
	return function () {
		var asyncArgList = extractAsyncArgs(arguments);
		var args = asyncArgList[0];
		var cb = asyncArgList[1];

		firstPred.apply(null, extendArgs(args, function (firstRes) {
			if (!firstRes)
				return cb(false);

			secondPred.apply(null, extendArgs(args, function (secondRes) {
				cb(firstRes && secondRes); // And-ing them at this point is futile, but improves readability
			}));
		}));
	};
}

function orPredicates(firstPred, secondPred) {
	return function () {
		var asyncArgList = extractAsyncArgs(arguments);
		var args = asyncArgList[0];
		var cb = asyncArgList[1];

		firstPred.apply(null, extendArgs(args, function (firstRes) {
			if (firstRes)
				return cb(true);

			secondPred.apply(null, extendArgs(args, function (secondRes) {
				cb(firstRes || secondRes); // Or-ing them at this point is futile, but improves readability
			}));
		}));
	};
}

function notPredicate(pred) {
	return function () {
		var asyncArgList = extractAsyncArgs(arguments);
		var args = asyncArgList[0];
		var cb = asyncArgList[1];

		pred.apply(null, extendArgs(args, function (res) {
			cb(!res);
		}));
	};
}

function shortCircuitPredicates(firstPred, secondPred) {
	return function () {
		var asyncArgList = extractAsyncArgs(arguments);
		var args = asyncArgList[0];
		var cb = asyncArgList[1];

		firstPred.apply(null, extendArgs(args, function (firstRes) {
			if (!firstRes)
				return cb(false); // Short-circuit here

			secondPred.apply(null, extendArgs(args, function (secondRes) {
				cb(secondRes);
			}));
		}));
	};
}

var AsyncPredFilter = function (asyncPredicate) {
	this.asyncPredicate = asyncPredicate;
	
	AsyncPredFilter.prototype.and = function(otherAsyncPredFilter) {
		var andPred = andPredicates(this.asyncPredicate, otherAsyncPredFilter.asyncPredicate);
		return new AsyncPredFilter(andPred);
	};

	AsyncPredFilter.prototype.or = function(otherAsyncPredFilter) {
		var orPred = orPredicates(this.asyncPredicate, otherAsyncPredFilter.asyncPredicate);
		return new AsyncPredFilter(orPred);
	};

	AsyncPredFilter.prototype.not = function() {
		var notPred = notPredicate(this.asyncPredicate);
		return new AsyncPredFilter(notPred);
	};

	AsyncPredFilter.prototype.neither = function(otherAsyncPredFilter) {
		var thisNotFilter = this.not();
		var otherNotFilter = otherAsyncPredFilter.not();
		var neitherFilter = thisNotFilter.and(otherNotFilter);
		return neitherFilter;
	};

	AsyncPredFilter.prototype.filterFor = function(otherAsyncPredFilter) {
		var shortCircuitedPred = shortCircuitPredicates(this.asyncPredicate, otherAsyncPredFilter.asyncPredicate);
		return new AsyncPredFilter(shortCircuitedPred);
	};
};

module.exports = AsyncPredFilter;