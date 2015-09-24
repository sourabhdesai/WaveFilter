var fs = require("fs");

var chai = require("chai");
var assert = chai.assert;

var AsyncPredFilter = require("../js/filters/async_pred_filter.js");

var falseAsyncPred = function (dummyArg, cb) {
	fs.exists("./some_nonexistent_file.js", function (exists) {
		cb(exists);
	});
};

var falseAsyncPredFilter = new AsyncPredFilter(falseAsyncPred);

var trueAsyncPred = function (dummyArg, cb) {
	// Check that this very file exists....of course it should
	fs.exists("./test/async_pred_filter_tests.js", function (exists) {
		cb(exists);
	});
};

var trueAsyncPredFilter = new AsyncPredFilter(trueAsyncPred);

describe("Check that false async pred returns false value", function () {

	it("Calls false async and checks return value", function (done) {

		falseAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isFalse(boolVal, "Return value of falseAsyncPred was not false");
			done();
		});

	});

});

describe("Check that true async pred returns true value", function () {

	it("Calls true async and checks return value", function (done) {

		trueAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isTrue(boolVal, "Return value of trueAsyncPred was not true");
			done();
		});

	});

});

describe("Checks not function of AsyncPredFilter", function () {

	it("Calls not of trueAsyncPredFilter and checks return value", function (done) {
		notTrueAsyncPredFilter = trueAsyncPredFilter.not();
		
		notTrueAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isFalse(boolVal, "Return value of not of notTrueAsyncPred was not false");
			done();
		});

	});

});

describe("Checks and function of AsyncPredFilter", function () {

	it("Calls and of trueAsyncPredFilter and falseAsyncPredFilter and checks return value", function (done) {
		
		andAsyncPredFilter = trueAsyncPredFilter.and(falseAsyncPredFilter);

		andAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isFalse(boolVal, "Return value of not of andAsyncPred was not false");
			done();
		});

	});

});

describe("Checks or function of AsyncPredFilter", function () {

	it("Calls or of trueAsyncPredFilter and falseAsyncPredFilter and checks return value", function (done) {
		
		orAsyncPredFilter = trueAsyncPredFilter.or(falseAsyncPredFilter);

		orAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isTrue(boolVal, "Return value of not of orAsyncPredFilter was not true");
			done();
		});

	});

});

describe("Checks neither function of AsyncPredFilter", function () {

	it("Calls neither of falseAsyncPredFilter and falseAsyncPredFilter and checks return value", function (done) {
		
		neitherAsyncPredFilter = falseAsyncPredFilter.neither(falseAsyncPredFilter);

		neitherAsyncPredFilter.asyncPredicate("dummyArg", function (boolVal) {
			assert.isTrue(boolVal, "Return value of not of neitherAsyncPredFilter was not true");
			done();
		});

	});

});