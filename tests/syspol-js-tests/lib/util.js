var assert = require('assert');
var path = require('path');

// All file-based modules are relative to root of package
var rootPkgPrefix = "..";
var packageJSON = require(path.join(rootPkgPrefix, 'package'));
var syspol = require(path.join(rootPkgPrefix,
    packageJSON.dependencies["syspol-js"]
    .replace(/^file:/, "")));

var Logger = syspol.util.Logger;

describe('Logger', function () {
    it('misc tests', function () {
        assert.strictEqual(typeof Logger, "function");
    });
});
