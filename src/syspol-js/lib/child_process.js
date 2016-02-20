var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');

var sh = require('shelljs');

function spawnSync(command, commandArgs, opts, onStdOutData, onStdErrData) {
    var finished = false;
    var child = child_process.spawn(command, commandArgs, opts);

    child.stdout.on('data', (data) => {
        onStdOutData(data);
    });

    child.stderr.on('data', (data) => {
        onStdErrData(data);
    });

    child.on('close', (code) => {
        this.finished = true;
    });

    while (!finished);
    return child;
 }

exports.spawnSync = spawnSync;