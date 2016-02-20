var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

function spawnSync(command, commandArgs, opts, onStdOutData, onStdErrData) {
    this.finishedDummyFile = path.join(sh.tempdir(), process.pid + 'finished');

    this.ioDummyFile = path.join(sh.tempdir(), process.pid + 'iodummy');

    var child = child_process.spawn(command, commandArgs, opts);

    child.stdout.on('data', (data) => {
        onStdOutData(data);
    });

    child.stderr.on('data', (data) => {
        onStdErrData(data);
    });

    child.on('close', (code) => {
        'finished'.to(this.finishedDummyFile);
        console.log('Finished child process, created dummy file');
        console.log(sh.error());
    });

    while(true) {
        'a'.toEnd(this.ioDummyFile);
        try {
            //console.log(util.format('Testing if `%s` exists...', this.finishedDummyFile));
            fs.accessSync(this.finishedDummyFile, fs.F_OK);
            break;
        }
        catch (e) {
            //console.log('It doesnt!!!!!!!');
            continue;
        }
    }

    sh.rm('-f', this.ioDummyFile);
    sh.rm('-f', this.finishedDummyFile);
    console.log('Removed dummy file ' + sh.error());

    return child;
}

exports.spawnSync = spawnSync;