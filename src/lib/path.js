'use strict'

const fs = require('fs');
const util = require('util');
const path = require('path');
const sh = require('shelljs');

const randomFileName = require('./util').randomFileName;

const randomTempFile = () => path.resolve(
        path.join(sh.tempdir(), randomFileName()));

exports.randomTempFile = randomTempFile;
