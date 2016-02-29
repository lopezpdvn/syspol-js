var util = require('util');

var gulp = require('gulp');
var sh = require('shelljs');

var syspol = require('./');

var pkgJSON = require('./package.json');
var logger = new syspol.util.Logger(pkgJSON.name);

function help() {
    var tasks = ['help', 'publish'];
    var msg = 'Tasks:\n' + tasks.join('\n');
    console.log(msg);
}

gulp.task('default', help);
gulp.task('h', help);
gulp.task('help', help);

gulp.task('publish', function() {
    var git = sh.exec('git push origin master');
    logger.log('Git exit code: ' + git.code);
});
