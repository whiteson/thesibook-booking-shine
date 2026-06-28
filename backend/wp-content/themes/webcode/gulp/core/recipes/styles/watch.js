var gulp   = require('gulp');
var browserSync  = require('browser-sync');
var exec = require('child_process').exec;

// config
var config = require('../../config/styles');


/**
 * Watch style files
 * for changes
 *
 * @param done
 */
module.exports = function (done) {

	gulp.watch(config.paths.watch, gulp.parallel('styles:dev'));
	// browserSync.reload()
	// exec('say css reloaded', function (err, stdout, stderr) {
	// 	console.log(stdout);
	// 	console.log(stderr);
	//   });
	done();
};
