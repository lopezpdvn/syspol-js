'use strict'

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const util = require('util');

const sh = require('shelljs');

const LogSeverity = require('./util').LogSeverity;
const callThrows = require('./util').callThrows;

const FILE_DEFAULT_ENCODING = 'utf-8';

const robocopy = (src, dst, mirror, dryRun, logger, logFilePath) => {
    if (!(logger && 'log' in logger && 'stdout' in logger 
        && 'stderr' in logger)) {
        const msg = 'Logger object must be provided';
        console.error(msg);
        process.exit(1);
    }

    var robocopyExec = sh.which('robocopy');
    if (!robocopyExec) {
        const msg = 'Robocopy program not in path';
        logger.log(msg, LogSeverity.ERROR);
        process.exit(1);
    }

    // Build whole dst path, including drive letter/id as a subdir.
    const srcSubdirArr = src.split(path.sep);
    const dstSubdirRoot = srcSubdirArr[0].replace(/:$/, '');
    const dstSubdirArr = [dstSubdirRoot].concat(srcSubdirArr.slice(1));
    dst = path.join(dst, dstSubdirArr.join(path.sep));
    
    // Since robocopy doesn't like trailing backslashes, remove them.
    const robocopyArgs = [src, dst].map(function (item) {
        return item.replace(/\\$/, '');
    });
    
    const command = robocopyExec;
    let commandArgs = robocopyArgs.concat(['/E']);
    if (dryRun) {
        commandArgs = commandArgs.concat(['/L']);
    }
    if (mirror) {
        commandArgs = commandArgs.concat(['/PURGE']);
    }
    if (logFilePath) {
        commandArgs = commandArgs.concat(['/LOG:'+logFilePath, '/TEE']);
    }
    const msg = util.format('Executing command %s %s', command, commandArgs);
    logger.log(msg, LogSeverity.INFO);
    
    const robocopyProc = child_process.spawnSync(command, commandArgs,
        { stdio: 'inherit' });
    logger.log('Robocopy exit code: ' + robocopyProc.status, LogSeverity.INFO);

    if (logFilePath) {
        const msg = util.format('Robocopy output:\n%s', sh.cat(logFilePath));
        logger.log(msg, LogSeverity.INFO, 'Robocopy log File', true);
    }
};

const isDirRW = dirPath => {
    try {
        // fs.accessSync(fpath, fs.R_OK | fs.W_OK);
        fs.accessSync(dirPath, fs.R_OK);
        
        // Test write permissions
        const fname = path.join(dirPath, '/dummy_file_name_ASDFFGAJSDFASDFASDF');
        fs.appendFileSync(fname, "DUMMY CONTENT");
        fs.unlinkSync(fname);
    }
    catch (e) {
        return false;
    }
    return true;
};

const fileLines2Array = (fpath, encoding) => {
    encoding = encoding ? encoding : FILE_DEFAULT_ENCODING;
    const fileBuff = fs.readFileSync(fpath, {encoding: encoding});
    const fileLinesArr = fileBuff.split('\n');
    return fileLinesArr.filter(
            // Filter out last and empty lines.
            (line, index, arr) => !(line === '' && index === arr.length - 1));
};

const isReadable = fpath => !callThrows(() => fs.accessSync(fpath, fs.R_OK));

exports.isDirRW = isDirRW;
exports.robocopy = robocopy;
exports.fileLines2Array = fileLines2Array;
exports.isReadable = isReadable;
