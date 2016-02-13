var fs = require('fs');
var util = require('util');
var syspol_fs = require('./fs');
var syspol_util = require('./util');

var isDirRW = syspol_fs.isDirRW;

// App =============================================================
/* Constructor/Prototype pattern */
function App(name, rootDirPath) {
    if(!name) {
        throw new Error("App name must be supplied");
    }
    this.name = name;

    if (!isDirRW(rootDirPath)) {
        throw new Error(
            util.format("Can't read/write to dir `%s`", rootDirPath));
    }
    this.createDate = new Date();

    // Logging
    var ISODateStr = (new Date()).toISOString();
    var year = ISODateStr.slice(0, 4);
    var month = ISODateStr.slice(5, 7);
    var day = ISODateStr.slice(8, 10);
    var logDirPath = path.join(this.dirPath, 'var/log', year, month, day);
    if(!isDirRW(logDirPath)) {
        sh.mkdir('-p', logDirPath);
    }
    if(!isDirRW(logDirPath)) {
        throw new Error('Unable to create log directory');
    }
    this.logFileName = path.join(logDirPath, ISODateStr.slice(0, 10) + '_log_'
            + this.appName + '.txt');
}

Object.defineProperty(App.prototype, "constructor", {
    enumerable: false,
    value: App
});
// End App =========================================================

exports.App = App;
