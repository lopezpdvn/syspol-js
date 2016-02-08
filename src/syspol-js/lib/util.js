var fs = require('fs');
var util = require('util');

// Logger =============================================================
/* Constructor/Prototype pattern */
function Logger(name) {
    if(!name) {
        throw new Error("Logger name must be supplied");
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
