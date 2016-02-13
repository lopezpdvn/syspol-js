var fs = require('fs');
var util = require('util');
var syspol_fs = require('./fs');

// Logger =============================================================
/* Constructor/Prototype pattern */
function Logger(name, dirpath) {
    if(!name) {
        throw new Error("Logger name must be supplied");
    }
    if (dirpath) {
        if (!syspol_fs.isDirRW(dirpath)) {
            throw new Error(
                util.format("Can't read/write to dir `%s`", dirpath));
        }
    }
    this.name = name;
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
