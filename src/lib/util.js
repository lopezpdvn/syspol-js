﻿'use strict'

const util = require('util');
const path = require('path');
const sh = require('shelljs');
const stream = require('stream');

// https://en.wikipedia.org/wiki/Java_logging_framework
const LogSeverity = {
    FATAL: 'FATAL',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    TRACE: 'TRACE'
};

// Logger =============================================================
function Logger(loggerName, fpaths) {
    if (!loggerName) {
        throw new Error("Logger loggerName must be supplied");
    }
    this.loggerName = loggerName;

    this.fpaths = [];
    if (fpaths && 'filter' in fpaths) {
        this.fpaths = fpaths.filter((fpath) => {
            const fpathDir = path.dirname(fpath);
            if (!require('./fs').isDirRW(fpathDir)) {
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
Logger.prototype.outputDTOpts = {hour12: false };
Logger.prototype.outputDTLocale = 'en-US';

Logger.prototype.log = function (msg, severity, origin, filesOnly) {
    origin = origin ? origin : '';
    severity = severity ? severity : LogSeverity.INFO;
    const LogDateStr = (new Date())
        .toLocaleString(this.outputDTLocale, this.outputDTOpts);
    msg = util.format(this.outputFormatDefault, LogDateStr, origin,
        severity, msg);
    if (filesOnly) {
        this.write2fs(msg);
    }
    else {
        switch (severity) {
            case LogSeverity.FATAL:
            case LogSeverity.ERROR:
            case LogSeverity.WARNING:
                this.stderr.write(msg);
                break;
            case LogSeverity.INFO:
                this.stdout.write(msg);
                break;
            case LogSeverity.DEBUG:
            case LogSeverity.TRACE:
                this.write2fs(msg);
                break;
            default:
                console.error('Invalid logging severity level: ' + severity);
                process.stdout.write(msg);
        }
    }
};

Logger.prototype.write2fs = function (data) {
    data = data.toString();
    this.fpaths.forEach((fpath) => {
        data.toEnd(fpath);
        if (sh.error()) {
            const msg = util.format('Failed to write to log filepath `%s`\n',
                fpath);
            process.stderr.write(msg);
        }
    });
};
// End Logger =========================================================

// https://github.com/shelljs/shelljs/blob/0166658597a69a77b4d1343217b12e2a50ee2df3/src/common.js#L164
const randomFileName = () => {
    const randomHash = function f(count) {
        if (count === 1)
            return parseInt(16*Math.random(), 10).toString(16);
        else {
            var hash = '';
            for (var i=0; i<count; i++)
                hash += f(1);
            return hash;
        }
    };

    return 'syspol_'+randomHash(20);
};

const callThrows = call => {
    try {
       call();
       return null;
    }
    catch(e) {
        return e;
    }
};

const inheritPrototype = (subType, superType) => {
    const prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
};

exports.Logger = Logger;
exports.randomFileName = randomFileName;
exports.LogSeverity = LogSeverity;
exports.callThrows = callThrows;
exports.inheritPrototype = inheritPrototype;
