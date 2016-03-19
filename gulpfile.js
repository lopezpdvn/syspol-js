const util = require('util');

const gulp = require('gulp');
const sh = require('shelljs');
const babel = require('gulp-babel');

const syspol = require('./');

const pkgJSON = require('./package.json');
const logger = new syspol.util.Logger(pkgJSON.name);

const help = () => {
    const tasks = ['help'];
    const msg = 'Tasks:\n' + tasks.join('\n');
    console.log(msg);
};

gulp.task('default', help);
gulp.task('h', help);
gulp.task('help', help);
