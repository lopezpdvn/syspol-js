var assert = require('assert');
var path = require('path');

var syspol = require('..');

var isDirRW = syspol.fs.isDirRW;
var Logger = syspol.util.Logger;

describe('isDirRW', function () {
    it('misc0', function () {
        assert.strictEqual(typeof isDirRW, "function");
    });
});
