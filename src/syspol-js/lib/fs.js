var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

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
    
    var commandStr = "robocopy " + args[0] + " " + args[1] + " /E";
    //var commandStr = util.format("robocopy %s %s /E", src, dst);
    if (dryRun) {
        commandStr += " /L";
    }
    if (mirror) {
        commandStr += " /PURGE";
    }
    log("Executing command: " + commandStr, 'INFO');
    var commandObj = sh.exec(commandStr, { silent: true });
    log('Robocopy exit code: ' + commandObj.code, 'INFO');
    log('Robocopy output:\n' + commandObj.stdout, 'INFO');
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
exports.robocopy = robocopy;