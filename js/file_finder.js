var path = require("path-extra");
var fs = require("fs");
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
	"dir": <Directory from which to start search>
	"depth": <Number of sub-directories to search through>
 }
 * cb = callback function - takes err value, and list of pathnames to matching files
 */
function searchForFiles(paramsObj, cb) {
	// Check params
	if (!"fileFilter" in paramsObj)
		throw new Error("Didn't specify file extension");
	if (!"dir" in paramsObj)
		throw new Error("Didn't specify directories");
	if (!"depth" in paramsObj)
		throw new Error("Didn't specify depth");

	if (paramsObj.depth < 0)
		return cb(null, []);

	getFilesInDirectory(paramsObj.dir, function (err, files) {
		if (err)
			return cb(err);

		async.filter(files, paramsObj.fileFilter, function (matchedFiles) {			
			var subDirs = files.filter(fileIsDirectory);

			// To be passed into async.map
			var subDirSearchFunc = function (subDir, cb) {
				searchForFiles({
					"fileFilter": paramsObj.fileFilter,
					"dir": subDir,
					"depth": paramsObj.depth - 1
				}, cb);
			};

			async.map(subDirs, subDirSearchFunc, function (err, matchedSubFiles) {
				if (err) {
					console.log(err);
					return cb(err);
				}

				var allMatchedFiles = matchedSubFiles.reduce(function (prevFileArr, currFileArr) {
					return prevFileArr.concat(currFileArr);
				}, matchedFiles);
				
				cb(null, allMatchedFiles);
			});

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
 * cb = callback function - takes err value, and list of pathnames to found files
 */
function searchForFilesInDirs(paramsObj, cb) {
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

	// To be passed into async.map
	var dirSearchFunc = function (dir, cb) {
		searchForFiles({
			"fileFilter": paramsObj.fileFilter,
			"dir": dir,
			"depth": paramsObj.depth
		}, cb);
	};

	async.map(osPaths, dirSearchFunc, function (err, matchedFilePaths) {
		if (err)
			return cb(err);

		var joinedMatchedFiles = matchedFilePaths.reduce(function (prevFileArr, currFileArr) {
			return prevFileArr.concat(currFileArr);
		}, []);

		cb(null, joinedMatchedFiles);
	});
};

module.exports = searchForFilesInDirs;