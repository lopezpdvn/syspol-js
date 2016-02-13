var fs = require('fs');
var util = require('util');
var path = require('path');

var sh = require('shelljs');

var syspol_fs = require('./fs');
var syspol_util = require('./util');

var isDirRW = syspol_fs.isDirRW;
var Logger = syspol_util.Logger;

// App =============================================================
/* Constructor/Prototype pattern */
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

    // Logging
    var ISODateStr = (new Date()).toISOString();
    var year = ISODateStr.slice(0, 4);
    var month = ISODateStr.slice(5, 7);
    var day = ISODateStr.slice(8, 10);
    var logDirPath = path.join(this.rootDirPath, 'var/log', year, month, day);
    if(!isDirRW(logDirPath)) {
        sh.mkdir('-p', logDirPath);
    }
    if(!isDirRW(logDirPath)) {
        throw new Error('Unable to create log directory');
    }
    this.logFileName = path.join(logDirPath, ISODateStr.slice(0, 10) + '_log_'
            + this.appName + '.txt');
    
    if (extraLogDirs && 'filter' in extraLogDirs) {
        extraLogDirs.filter((extraLogDir) => {
            return isDirRW(extraLogDir);
        });
    }

    this.logger = new Logger(this.appName, [this.logFileName]);
}

Object.defineProperty(App.prototype, "constructor", {
    enumerable: false,
    value: App
});
// End App =========================================================

exports.App = App;
