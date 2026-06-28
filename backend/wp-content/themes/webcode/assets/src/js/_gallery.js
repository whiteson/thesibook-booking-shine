/*eslint-disable*/
import $ from 'jquery';
// require('node_modules/lightbox2/dist/js/lightbox.js');
const lightbox = require('lightbox2/dist/js/lightbox.js');

class Gallery {
	constructor() {
		this.initGallery();
	}

	initGallery() {
		if ($('.gallery').length > 0) {
			lightbox.option({
				'resizeDuration': 200,
				'wrapAround': true,
				'alwaysShowNavOnTouchDevices': true,
				'disableScrolling': true,
				// wrapAround

			})
		}
	}
}

export default Gallery;