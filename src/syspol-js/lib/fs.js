var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

// Mirrorer =============================================================
/* Constructor/Prototype pattern */
function Mirrorer(src, dst, mainExternalProgram, opts, logger) {
    //this.opts = opts;

    // If logger not supplied, create dummy logger.
    if(!logger) {
        logger = {};
        logger.log = function() {};
    }

    if(!mainExternalProgram) {
        var msg = "Must supply one of `rsync` or `robocopy`";
        logger.log(msg);
        throw new Error(msg);
    }

    this.mainExternalProgram = mainExternalProgram;

    // Detect executables in path
    try {
        if (this.mainExternalProgram === 'rsync') {
            var testExecPrg = child_process.spawnSync(
                'whereis', [this.mainExternalProgram]);
            if (testExecPrg.status !== 0) {
                throw new Error();
            }
        }
        else if (this.mainExternalProgram === 'robocopy') {
            var testExecPrg = child_process.spawnSync(
                'where', [this.mainExternalProgram, '/q']);
            if (testExecPrg.status !== 0) {
                throw new Error();
            }
        }
    }
    catch (e) {
        logger.log("Error testing mainExternalProgram", 1);
        throw e;
    }

    //if(!opts.src) {
        //this.src = opts.src;
    //}
    //if(!opts.dst) {
        //this.dst = opts.dst;
    //}
    this.createDate = new Date();
    //this._runLevel = 4;
}

Mirrorer.prototype = {
    //version: 8.2,
    //releaseDate: new Date(2015, 8, 5, 0, 0, 0, 0),
}

Object.defineProperty(Mirrorer.prototype, "constructor", {
    enumerable: false,
    value: Mirrorer
});

// End Mirrorer =========================================================

function robocopy(src, dst, mirror, dryRun, log) {
    // Build whole dst path
    dstSubdirArr = src.split(path.sep);
    dstSubdirRoot = dstSubdirArr[0].replace(/:$/, '');
    dstSubdirArr = [dstSubdirRoot].concat(dstSubdirArr.slice(1));
    dst = path.join(dst, dstSubdirArr.join(path.sep));
    
    // Since robocopy doesn't like trailing backslashes, remove them.
    // Also enclose in double quotes.
    args = [src, dst].map(function (item) {
        return ['"', item.replace(/\\$/, ''), '"'].join('');
    });
    
    //var commandStr = "robocopy " + args[0] + " " + args[1] + " /E";
    var commandStr = util.format("robocopy %s %s /E", src, dst);
    if (dryRun) {
        commandStr += " /L";
    }
    if (mirror) {
        commandStr += " /PURGE";
    }
    log("Executing command: " + commandStr, 'INFO');
    sh.exec(commandStr, { silent: false }, function (code, output) {
        log('Robocopy exit code: ' + code, 'INFO');
        log('Robocopy output:\n' + output), 'INFO';
    });
}

function isDirRW(dirPath) {
    try {
        // fs.accessSync(fpath, fs.R_OK | fs.W_OK);
        fs.accessSync(dirPath, fs.R_OK);
        
        // Test write permissions
        var fname = path.join(dirPath, '/dummy_file_name_ASDFFGAJSDFASDFASDF');
        fs.appendFileSync(fname, "DUMMY CONTENT");
        fs.unlinkSync(fname);
    }
    catch (e) {
        return false;
    }
    return true;
}

exports.isDirRW = isDirRW;
exports.Mirrorer = Mirrorer;
exports.robocopy = robocopy;