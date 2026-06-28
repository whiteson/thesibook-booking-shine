var browserSync = require('browser-sync');

// config
var config = require('../config/browser-sync');
var exec = require('child_process').exec;

/**
 * Spin up the browser-sync
 * socket server to listen for
 * and push code changes to the
 * browser
 *
 */
module.exports = function (done) {
  browserSync(config);
//   exec('say Reloading', function (err, stdout, stderr) {
// 		console.log(stdout);
// 		console.log(stderr);
// 	  });
	done();
};