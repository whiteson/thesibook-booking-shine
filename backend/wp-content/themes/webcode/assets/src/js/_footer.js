/* eslint-disable */
import $ from 'jquery';

class FooterMenu {
	constructor() {
		// this.testVariable = 'script menu loaded';
		this.initFooter();
	}


	initFooter() {
		const $footerHasChildren = $('.site-footer__menu .menu-item-has-children a');
		$footerHasChildren.on('click', function (e) {
			if ($(this).parent().hasClass('menu-item-has-children')) {
				e.preventDefault();
				$(this).parent().find('.sub-menu').toggle();
				// console.log('hasclass')
				// console.log($(this));
			} else {
				// console.log('else');
				// e.preventDefault();
				// console.log($(this));
			}
		});
	}

}

export default FooterMenu;
