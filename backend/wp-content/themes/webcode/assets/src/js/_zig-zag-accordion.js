/* eslint-disable */
import $ from 'jquery';
const $accordionTitle = $('[data-accordion-title]');
const $accordionBox = $('[data-accordion-title]').next();
class zigZagAccordion {
	constructor() {

		this.initAccordion();
	}

	initAccordion() {
		$accordionTitle.on('click', function () {
			$(this).toggleClass('active');
			$(this).next().toggleClass('active');
			// console.log($(this).next());
		})
		// console.log($('[data-accordion-title]').next('.zig-zag-accordion__wrapper__repeater__item__accordion__box'));
	}

}

export default zigZagAccordion;
