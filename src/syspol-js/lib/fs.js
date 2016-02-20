var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

var syspol_child_process = require('./child_process');

function robocopy(src, dst, mirror, dryRun, logger) {
    if (!(logger && 'log' in logger && 'stdout' in logger 
        && 'stderr' in logger)) {
        var msg = 'Logger object must be provided';
        console.error(msg);
        process.exit(1);
    }

    var robocopyExec = sh.which('robocopy');
    if (!robocopyExec) {
        var msg = 'Robocopy program not in path';
        logger.log(msg, 'ERROR');
        process.exit(1);
    }

    // Build whole dst path, including drive letter/id as a subdir.
    var srcSubdirArr = src.split(path.sep);
    var dstSubdirRoot = srcSubdirArr[0].replace(/:$/, '');
    var dstSubdirArr = [dstSubdirRoot].concat(srcSubdirArr.slice(1));
    dst = path.join(dst, dstSubdirArr.join(path.sep));
    
    // Since robocopy doesn't like trailing backslashes, remove them.
    var robocopyArgs = [src, dst].map(function (item) {
        return item.replace(/\\$/, '');
    });
    
    var command = robocopyExec;
    var commandArgs = robocopyArgs.concat(['/E']);
    if (dryRun) {
        robocopyArgs.concat(['/L']);
    }
    if (mirror) {
        robocopyArgs.concat(['/PURGE']);
    }
    var msg = util.format('Executing command %s %s', command, commandArgs);
    logger.log(msg, 'INFO');
    
    var onStdOutData = (data) => { logger.stdout.write(data) };
    var onStdErrData = (data) => { logger.stderr.write(data) };
    
    var robocopyProc = child_process.spawnSync(command, commandArgs,
        { stdio: 'inherit' });
    logger.log('Robocopy exit code: ' + robocopyProc.status, 'INFO');
    logger.log('Robocopy stdout:\n' + robocopyProc.stdout, 'INFO');
    logger.log('Robocopy stderr:\n' + robocopyProc.stderr, 'ERROR');
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