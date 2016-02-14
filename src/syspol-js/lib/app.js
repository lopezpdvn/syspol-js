var fs = require('fs');
var util = require('util');
var path = require('path');

var sh = require('shelljs');

var syspol_fs = require('./fs');
var syspol_util = require('./util');

var isDirRW = syspol_fs.isDirRW;
var Logger = syspol_util.Logger;

// App =============================================================
function App(appName, rootDirPath, extraLogDirs) {
    if(!appName) {
        throw new Error("App appName must be supplied");
    }
    this.appName = appName;

    if (!isDirRW(rootDirPath)) {
        throw new Error(
            util.format("Can't read/write to dir `%s`", rootDirPath));
    }
    
    this.rootDirPath = rootDirPath;
    this.createDate = new Date();
    
    // Locking
    this.lockFilePath = path.join(this.rootDirPath,
        "var/lock/LCK.." + this.appName);
        
    // Validate lock.
    try {
        fs.accessSync(lockFilePath, fs.F_OK);
        var msg = util.format(
            "Lock file exists: `%s`\nTerminating application `%s`",
            this.lockFilePath, this.appName);
        console.error(msg);
        process.exit(1);
    }
    catch (e) {
        try {
            var msg = util.format(
                "Lock file doesn't exist, creating lock file `%s`",
                this.lockFilePath);
            sh.mkdir("-p", path.dirname(this.lockFilePath));
            process.pid.toString().toEnd(this.lockFilePath);
            console.log(msg);
        }
        catch (e) {
            throw new Error(
                "Unable to create lock file " + this.lockFilePath);
        }
    }
    process.on('exit', (code) => {
        if (!code) {
            var msg =
                util.format("Removing lock file `%s`", this.lockFilePath);
            sh.rm('-rf', this.lockFilePath);
            if (sh.error()) {
                throw new Error("Unable to remove lock file " 
                    + this.lockFilePath);
            }
        }
    });

    // Logging
    var ISODateStr = this.createDate.toISOString();
    var year = ISODateStr.slice(0, 4);
    var month = ISODateStr.slice(5, 7);
    var day = ISODateStr.slice(8, 10);
    var logDirPath = path.join(this.rootDirPath, 'var/log', year, month, day);
    this.logDirPaths = [logDirPath];
    
    if (extraLogDirs && 'filter' in extraLogDirs) {
        extraLogDirs.filter((extraLogDir) => {
            return isDirRW(extraLogDir);
        });
        this.logDirPaths = this.logDirPaths.concat(extralogDirs);
    }
    
    this.logFilePaths = this.logDirPaths.map( (logDirPath) => {
        if (!isDirRW(logDirPath)) {
            sh.mkdir('-p', logDirPath);
        }
        if (sh.error()) {
            throw new Error('Unable to create log directory');
        }
        return path.join(logDirPath, ISODateStr.slice(0, 10) + '_log_' 
            + this.appName + '.txt');
    });

    this.logger = new Logger(this.appName, this.logFilePaths);
}

Object.defineProperty(App.prototype, "constructor", {
    enumerable: false,
    value: App
});
// End App =========================================================

exports.App = App;
