var assert = require('assert');
var path = require('path');

// All file-based modules are relative to root of package
var rootPkgPrefix = "..";
var packageJSON = require(path.join(rootPkgPrefix, 'package'));
var syspol = require(path.join(rootPkgPrefix,
    packageJSON.dependencies["syspol-js"]
    .replace(/^file:/, "")));
var checkDir = syspol.fs.checkDir;

describe('checkDir', function () {
    it('misc0', function () {
        assert.strictEqual(typeof checkDir, "function");
    });
});
