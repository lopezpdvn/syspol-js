var fs = require('fs');
var util = require('util');
var path = require('path');

var syspol_fs = require('./fs');
var isDirRW = syspol_fs.isDirRW;

// Logger =============================================================
/* Constructor/Prototype pattern */
function Logger(loggerName, fpaths) {
    if(!loggerName) {
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
    this.loggerName = loggerName;
    this.createDate = new Date();
}

Logger.prototype.log = function(msg, severity) {
    util.log(msg);
};

Object.defineProperty(Logger.prototype, "constructor", {
    enumerable: false,
    value: Logger
});
// End Logger =========================================================

exports.Logger = Logger;
