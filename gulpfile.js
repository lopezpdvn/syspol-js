var util = require('util');

var syspol = require('./');

var Logger = syspol.util.Logger;

var gulp = require('gulp');

var project = {
    name: 'audio configdir',
    version: '0.0.0'
}

var logger = new Logger(project.name);

gulp.task('default', function() {
    logger.log('From default function');
});

gulp.task('h', function() {
    //logger.log(msg);
    logger.log('From help function');
});
