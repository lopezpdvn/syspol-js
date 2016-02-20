var fs = require('fs');
var util = require('util');
var path = require('path');
var sh = require('shelljs');
var stream = require('stream');

var syspol_fs = require('./fs');
var isDirRW = syspol_fs.isDirRW;

// Logger =============================================================
function Logger(loggerName, fpaths) {
    if (!loggerName) {
        throw new Error("Logger loggerName must be supplied");
    }
    this.loggerName = loggerName;
    
    this.fpaths = [];
    if (fpaths && 'filter' in fpaths) {
        this.fpaths = fpaths.filter((fpath) => {
            var fpathDir = path.dirname(fpath);
            if (!isDirRW(fpathDir)) {
                console.error(util.format("No RW to dir `%s`", fpathDir));
                return false;
            }
            console.log(util.format('Logging to `%s`', fpath));
            return true;
        });
    }

    this.createDate = new Date();

    var writableStreamStdOut = new stream.Writable({
        write: (chunk, encoding, next) => {
        process.stdout.write(chunk);
            next();
        }
    });
}

Object.defineProperty(Logger.prototype, "constructor", {
    enumerable: false,
    value: Logger
});

Logger.prototype.outputFormatDefault = "[%s %s] %s %s\n";

Logger.prototype.log = function (msg, severity, origin) {
    origin = origin ? origin : '';
    var ISODTStr = (new Date()).toISOString();
    var msg = util.format(this.outputFormatDefault, ISODTStr, origin,
        severity, msg);
    process.stdout.write(msg);
    this.fpaths.forEach((fpath) => {
        msg.toEnd(fpath);
        if (sh.error()) {
            msg = util.format(this.outputFormatDefault, ISODTStr, origin,
                severity, sh.error());
            process.stderr.write(msg);
        }
    });
};
// End Logger =========================================================

exports.Logger = Logger;
