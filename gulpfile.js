var util = require('util');

var gulp = require('gulp');

var syspol = require('./');

var pkgJSON = require('./package.json');
var logger = new syspol.util.Logger(pkgJSON.name);

function help() {
    var tasks = ['help'];
    var msg = 'Tasks:\n' + tasks.join('\n');
    console.log(msg);
}

gulp.task('default', help);
gulp.task('h', help);
gulp.task('help', help);
