var fs = require('fs');
var util = require('util');
var path = require('path');
var sh = require('shelljs');

var syspol_fs = require('./fs');
var isDirRW = syspol_fs.isDirRW;

// Logger =============================================================
/* Constructor/Prototype pattern */
function Logger(loggerName, fpaths) {
    if (!loggerName) {
        throw new Error("Logger loggerName must be supplied");
    }
    
    if (fpaths) {
        fpaths.filter((fpath) => {
            var fpathDir = path.dirname(fpath);
            if (!isDirRW(fpathDir)) {
                console.error(util.format("No RW to dir `%s`", fpathDir));
                return false;
            }
            return true;
        });
    }
    this.fpaths = fpaths;
    this.loggerName = loggerName;
    this.createDate = new Date();
}

Object.defineProperty(Logger.prototype, "constructor", {
    enumerable: false,
    value: Logger
});

Logger.prototype.outputFormatDefault = "[%s %s] %s %s";

Logger.prototype.log = function (msg, severity) {
    var ISODTStr = (new Date()).toISOString();
    var msg = util.format(this.outputFormatDefault, ISODTStr, "ORIGIN",
        severity, msg);
    console.log(msg);
    this.fpaths.forEach((fpath) => {
        msg.toEnd(fpath);
    });
};
// End Logger =========================================================

exports.Logger = Logger;
