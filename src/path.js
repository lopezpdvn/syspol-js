var fs = require('fs');
var util = require('util');
var path = require('path');
var sh = require('shelljs');

var randomFileName = require('./util').randomFileName;

function randomTempFile() {
    return path.resolve(path.join(sh.tempdir(), randomFileName()));
}

exports.randomTempFile = randomTempFile;