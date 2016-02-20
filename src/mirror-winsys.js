#! /usr/bin/env shjs

/* Mirrors directories/files on Windows system.
 *
 * - Depends on robocopy
 * - Doesn't support paths that contain the character ';'
*/

var sh = require('shelljs');
var fs = require('fs');
var path = require('path');
var program = {};
var util = require('util');

// All file-based modules are relative to root of package
var rootPkgPrefix = "..";
var packageJSON = require(path.join(rootPkgPrefix, 'package'));
var syspol = require(path.join(rootPkgPrefix,
    packageJSON.dependencies["syspol-js"]
    .replace(/^file:/, "")));
var isDirRW = syspol.fs.isDirRW;

program.programName = "mirrorwinsys";
(function () {
    var dateObj = new Date();
    var dateISOStr = dateObj.toISOString();
    program.year = dateISOStr.slice(0, 4);
    program.month = dateISOStr.slice(5, 7);
    program.day = dateISOStr.slice(8, 10);
    program.logName = program.year + program.month + program.day + "_log_" 
        + program.programName + ".txt";
})();

program
  .version('0.0.1')
  .usage('-c <dirs> -s <dirs> -d <dirs>')
  .option('-c, --config-dirs <items>',
      'List of configuration directories separated by ' + path.delimiter,
      function (val) { return val.split(new RegExp(path.delimiter, "g")) })
  .option("-s, --source-dirs <items>",
      'List of mirror source directories separated by ' + path.delimiter,
      function (val) { return val.split(new RegExp(path.delimiter, "g")) })
  .option("-d, --destination-dirs <items>",
      'List of destination directories separated by ' + path.delimiter,
      function (val) { return val.split(new RegExp(path.delimiter, "g")) })
      .option("-n, --dry-run",
          "list only - don't copy, timestamp or delete anything")
      .option("-m, --mirror",
          "Delete dest files/folders that no longer exist in source")
  .parse(process.argv);

if (typeof program.configDirs === "undefined" ||
    typeof program.sourceDirs === "undefined" ||
    typeof program.destinationDirs === "undefined") {
    throw new Error("Please see usage executing with option -h only");
}

program.configDirs.forEach(isDirRW);
program.logDir = program.configDirs.map(function (configDir) {
    var logDirPath = configDir + "/var/log/" + program.year + "/" 
        + program.month;
    try {
        isDirRW(logDirPath);
    } catch (e) {
        sh.mkdir("-p", logDirPath);
        isDirRW(logDirPath);
    }
    return logDirPath;
});

program.log = function (msg) {
    msg = "[" + (new Date()).toLocaleString('en-US') + "] " + msg + "\n";
    this.logDir.forEach(function (logDir) {
        msg.toEnd(logDir + "/" + program.logName);
    });
};

// Start and end of program.
program.log("========= Start of " + program.programName);
process.on('exit', function (code) {
    if (!code) {
        program.configDirs.forEach(function (configDir) {
            var lockFilePath = path.join(configDir, "var/lock/LCK.." +
                program.programName);
            var msg = util.format("Removing lock file `%s`", lockFilePath);
            sh.rm('-rf', lockFilePath);
        });
    }
    program.log("========= End of " + program.programName);
});

// Lock
program.configDirs.forEach(function (configDir) {
    var lockFilePath = path.join(configDir, "var/lock/LCK.." + program.programName);
    
    // Validate lock.
    try {
        fs.accessSync(lockFilePath, fs.F_OK);
        var msg = util.format("Lock file exists: `%s`", lockFilePath);
        console.error(msg);
        program.log(msg);
        process.exit(1);
    }
    catch (e) {
        var msg = util.format("Lock file doesn't exist, creating lock file `%s`",
            lockFilePath);
        sh.mkdir("-p", path.dirname(lockFilePath));
        process.pid.toString().toEnd(lockFilePath);
        console.log(msg);
        program.log(msg);
    }
});
// End configuration ==========================================================

var paths = [program.sourceDirs, program.destinationDirs];

// Strip double quotes
paths = paths.map(function(item) {
  return item.map(function(item) {
    return item.replace(/"/g, '');
  });
});

// Check dirs
paths.forEach(function (pathArr) {
    pathArr.forEach(function (item) {
        try {
            isDirRW(item);
        }
        catch (e) {
            msg = "I/O error with path: `" + item + "`";
            program.log(msg);
            throw new Error(msg);
        }
    });
});

program.log("Source dirs: " + program.sourceDirs);
program.log("Destination dirs: " + program.destinationDirs);

// Mirror
paths[1].forEach(function(dst) {
  paths[0].forEach(function(src) {
    mirror(src, dst);
  });
});
