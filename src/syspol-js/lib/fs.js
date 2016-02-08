var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

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
    if(this.mainExternalProgram === 'rsync'
            || this.mainExternalProgram === 'robocopy') {

        // Test executable
        try {
            var testExecPrgArgs = this.mainExternalProgram === 'rsync'
                ? ['-h'] : ['/?'];
            var testExecPrg = child_process.spawnSync(
                    this.mainExternalProgram, testExecPrgArgs);
            if(testExecPrg.status !== 0) {
                throw new Error();
            }
        }
        catch(e) {
            logger.log("Error testing mainExternalProgram", 1);
            throw e;
        }
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

function isDirRW(dirPath) {
    // fs.accessSync(fpath, fs.R_OK | fs.W_OK);
    fs.accessSync(dirPath, fs.R_OK);

    // Test write permissions
    var fname = path.join(dirPath, '/dummy_file_name_ASDFFGAJSDFASDFASDF');
    fs.appendFileSync(fname, "DUMMY CONTENT");
    fs.unlinkSync(fname);
}

exports.isDirRW = isDirRW;
exports.Mirrorer = Mirrorer;
