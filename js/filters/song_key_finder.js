var childProcess = require('child_process');
var async        = require('async');

var spawn = childProcess.spawn;

var binaryPath = "cli_tools/osx/keyfinder/MacOS/KeyFinder";
var programCwd = "cli_tools/osx/keyfinder/MacOS/";

/*
 * Find limit to number of open file descriptors allowed
 */
function findUlimitN() {
	var procOutput = childProcess.spawnSync("ulimit", ["-n"]);
	
	var openFDLimitStr = String(procOutput.stdout);
	var openFDLimit = parseInt(openFDLimitStr);
	
	return openFDLimit;
}


function buildArgs(filename) {
	filename = filename.replace(' ', '\ ');
	return ["-f", filename, "-w"];
}

function getMP3Key(filename, cb) {
	var opts = {
		"cwd": programCwd
	};

	var args = buildArgs(filename);
	keyFinderProc = spawn("./" + binaryPath, args);

	var lineCount = 0;
	var key = null;

	keyFinderProc.stdout.on('data', function (line) {
		console.log("data:", String(line));
		if (++lineCount == 2)
			key = String(line).replace('Could not write to tags', '').trim();
	});

	keyFinderProc.on('close', function (exitCode) {
		// Only for debugging purposes
		var err = null;
		
		if (key == null)
			err = new Error("Didn't receive any key. Exit Code: " + exitCode + "; File: " + filename);
		else if (exitCode != 0 && exitCode != 2)
			err = new Error("Key Finder process exited with code " + exitCode + " for file " + filename);

		cb(err, key);
	});
}

var ulimitN = findUlimitN();
console.log("ulimitN:", ulimitN);

var queueLimit = Math.round(ulimitN * 0.125);

var spawnQueue = async.queue(function (filename, cb) {
	getMP3Key(filename, cb);
}, queueLimit);

module.exports = function (filename, cb) {
	spawnQueue.push(filename, cb);
};