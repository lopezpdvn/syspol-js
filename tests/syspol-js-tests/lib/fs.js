var assert = require('assert');
var path = require('path');

// All file-based modules are relative to root of package
var rootPkgPrefix = "..";
var packageJSON = require(path.join(rootPkgPrefix, 'package'));
var syspol = require(path.join(rootPkgPrefix,
    packageJSON.dependencies["syspol-js"]
    .replace(/^file:/, "")));

var isDirRW = syspol.fs.isDirRW;
var Mirrorer = syspol.fs.Mirrorer;
var Logger = syspol.util.Logger;

describe('isDirRW', function () {
    it('misc0', function () {
        assert.strictEqual(typeof isDirRW, "function");
    });
});

describe('Mirrorer', function () {
    var logger = new Logger('mocha-testing-default-logger');

    it('misc tests', function () {
        assert.strictEqual(typeof Mirrorer, "function");
    });

    it('Detect rsync test', function () {
        var mirrorer = new Mirrorer(['src_dir'], ['dst_dir'], 'rsync', {}, logger);
    });

    it('Detect robocopy test', function () {
        var mirrorer = new Mirrorer(['src_dir'], ['dst_dir'], 'robocopy', {}, logger);
    });
});
