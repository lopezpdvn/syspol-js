const util = require('util');

const gulp = require('gulp');
const sh = require('shelljs');
const babel = require('gulp-babel');

const syspol = require('./');

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

gulp.task('build', function() {
    gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});
