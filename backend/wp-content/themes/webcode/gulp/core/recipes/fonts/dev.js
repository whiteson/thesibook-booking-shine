var gulp         = require('gulp');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var browserSync  = require('browser-sync');
var exec = require('child_process').exec;


// utils
var pumped       = require('../../utils/pumped');

// config
var config       = require('../../config/fonts');


/**
 * Move Fonts to
 * the built theme
 *
 */
module.exports = function () {

	return gulp.src(config.paths.src)
		// .pipe(plumber())
		.pipe(gulp.dest(config.paths.dest))
		.on('end', browserSync.reload);
		
};