var assert = require('assert');
var path = require('path');

// All file-based modules are relative to root of package
var syspol = require('..');

var Logger = syspol.util.Logger;

describe('Logger', function () {
    it('misc tests', function () {
        assert.strictEqual(typeof Logger, "function");
    });
});



