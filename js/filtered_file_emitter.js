var path  = require("path-extra");
var fs    = require("graceful-fs");
var async = require("async");

// get extension for a given filename. Returns null if doesn't have an extension
function getFileExtension(filename) {
	var extensionIdx = filename.lastIndexOf(".");
	
	if (extensionIdx <= 0)
		return null;
	
	var extension = filename.substring(extensionIdx + 1);
	
	return extension;
}

// Returns true if the given filename is pointing to a directory
function fileIsDirectory(filename) {
	return getFileExtension(filename) == null;
}

// Replaces ~ with home directory
function replaceHomeDir(filepath) {
	if (filepath.charAt(0) == "~")
		filepath = path.join(path.homedir(), filepath.substring(1));
	
	return filepath;
}

/*
 * Returns array of files that match given file extensions in specified directory through given cb
 * dir = directory to get files from
 * cb = callback function - takes err value, and an array of pathnames to files in directory
 */
function getFilesInDirectory(dir, cb) {
	fs.readdir(dir, function (err, files) {
		if (err)
			return cb(err);

		files = files.map(function (filename) {
			return path.join(dir, filename);
		});

		cb(null, files);
	});
}

/*
 * Recursively searches directory and finds files that match given file extension
 * paramsObj = {
	"fileFilter": <Predicate Function that receives filename>,
	"dir": <Directory from which to start search>,
	"depth": <Number of sub-directories to search through>,
	"hitEmitter": <A SearchHitEmitter object to emit the search hits>
 }
 * cb = <Callback that takes no arguments>
 */
function searchForFiles(paramsObj, cb) {
	// Check params
	if (!"fileFilter" in paramsObj)
		throw new Error("Didn't specify file extension");
	if (!"dir" in paramsObj)
		throw new Error("Didn't specify directories");
	if (!"depth" in paramsObj)
		throw new Error("Didn't specify depth");
	if (!"hitEmitter" in paramsObj)
		throw new Error("Didn't specify hitEmitter");

	if (paramsObj.depth < 0)
		return cb();

	getFilesInDirectory(paramsObj.dir, function (err, files) {
		if (err)
			return cb(err);

		var subDirs = files.filter(function (file) {
			return fileIsDirectory(file);
		});

		files = files.filter(function (file) {
			return !fileIsDirectory(file);
		});

		files.forEach(function (file) {
			paramsObj.fileFilter(file, function (passedFilter) {
				if (passedFilter)
					paramsObj.hitEmitter.emitHit(file);
			});
		});

		var searchSubDirFuncs = subDirs.map(function (dir) {
			return function (callback) {
				searchForFiles({
					"fileFilter": paramsObj.fileFilter,
					"dir": dir,
					"depth": paramsObj.depth - 1,
					"hitEmitter": paramsObj.hitEmitter
				}, callback);
			};
		});

		async.parallel(searchSubDirFuncs, function () {
			cb();
		});
	});

}

/*
 * Recursively searches all given directories and finds files that match given file extension
 * paramsObj = {
	"fileFilter": <Asynchronous Predicate Function that receives filename>,
	"dirs": <Array of Directories from which to start search>,
	"depth": <Number of sub-directories to search through>
 }
 * hitEmitter = <A SearchHitEmitter object to emit the search hits>
 */
function searchForFilesInDirs(paramsObj, hitEmitter) {
	// Check params
	if (!"fileFilter" in paramsObj)
		throw new Error("Didn't specify file extension");
	if (!"dirs" in paramsObj)
		throw new Error("Didn't specify directories");
	if (!"depth" in paramsObj)
		throw new Error("Didn't specify depth");

	var allPathsAreDirs = paramsObj.dirs.every(fileIsDirectory);

	if (!allPathsAreDirs)
		throw new Error("Not All the Paths are directories");

	var osPaths = paramsObj.dirs.map(replaceHomeDir); // Replaces ~ with os home directory

	var recursionRoots = osPaths.map(function (osPath) {
		return function (callback) {
			searchForFiles({
				"fileFilter": paramsObj.fileFilter,
				"dir": osPath,
				"depth": paramsObj.depth,
				"hitEmitter": hitEmitter
			}, callback);
		};
	});

	async.parallel(recursionRoots, function () {
		console.log("Directories have been traversed");	
	});
};

module.exports = searchForFilesInDirs;