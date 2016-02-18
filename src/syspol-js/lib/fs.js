var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

function robocopy(src, dst, mirror, dryRun, log) {
    var robocopyExec = sh.which('robocopy');
    if (!robocopyExec) {
        var msg = 'Robocopy program not in path';
        log(msg);
        console.error(msg);
        process.exit(1);
    }

    // Build whole dst path, including drive letter/id as a subdir.
    var srcSubdirArr = src.split(path.sep);
    var dstSubdirRoot = srcSubdirArr[0].replace(/:$/, '');
    var dstSubdirArr = [dstSubdirRoot].concat(srcSubdirArr.slice(1));
    dst = path.join(dst, dstSubdirArr.join(path.sep));
    
    // Since robocopy doesn't like trailing backslashes, remove them.
    // Also enclose in double quotes.
    var robocopyArgs = [src, dst].map(function (item) {
        return ['"', item.replace(/\\$/, ''), '"'].join('');
    });
    
    var commandStr = util.format('%s %s %s /E', robocopyExec, robocopyArgs[0],
        robocopyArgs[1]);
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