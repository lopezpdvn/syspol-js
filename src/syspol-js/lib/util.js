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

    this.stdout = new stream.Writable({
        write: (chunk, encoding, next) => {
            process.stdout.write(chunk);
            this.write2fs(chunk);
            next();
        }
    });

    this.stderr = new stream.Writable({
        write: (chunk, encoding, next) => {
            process.stderr.write(chunk);
            this.write2fs(chunk);
            next();
        }
    });
}

Object.defineProperty(Logger.prototype, "constructor", {
    enumerable: false,
    value: Logger
});

Logger.prototype.outputFormatDefault = "[%s %s] %s %s\n";

Logger.prototype.log = function (msg, severity, origin, filesOnly) {
    origin = origin ? origin : '';
    var ISODTStr = (new Date()).toISOString();
    var msg = util.format(this.outputFormatDefault, ISODTStr, origin,
        severity, msg);
    if (filesOnly) {
        this.write2fs(msg);
    }
    else {
        this.stdout.write(msg);
    }
};

Logger.prototype.write2fs = function (data) {
    data = data.toString();
    this.fpaths.forEach((fpath) => {
        data.toEnd(fpath);
        if (sh.error()) {
            data = util.format(this.outputFormatDefault, ISODTStr, origin,
                severity, sh.error());
            process.stderr.write(data);
        }
    });
};
// End Logger =========================================================

// https://github.com/shelljs/shelljs/blob/0166658597a69a77b4d1343217b12e2a50ee2df3/src/common.js#L164
function randomFileName() {
    function randomHash(count) {
        if (count === 1)
            return parseInt(16*Math.random(), 10).toString(16);
        else {
            var hash = '';
            for (var i=0; i<count; i++)
                hash += randomHash(1);
            return hash;
        }
    }
    
    return 'syspol_'+randomHash(20);
}

exports.Logger = Logger;
exports.randomFileName = randomFileName;