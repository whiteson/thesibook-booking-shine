/* eslint-disable */
import $ from "jquery";
// import General from './_generalScripts';
import Menu from './_menu';
// import Video from './_video';
import Slider from './_slider';
import Gallery from './_gallery';
import Carousel from './carousel';
// import Portfolios from './_portfolio';
// import Hero from './_hero';
// import zigZagAccordion from './_zig-zag-accordion';
import Visible from './_visible';
// import animations from './animations';
// import Conditions from './_conditions';
import FooterMenu from './_footer';
import NotebookPicker from './_notebook_picker';
import BackToTop from './_back-to-top';
import DeliveryParallax from './_delivery-parallax';
import VideoBackground from './_video-background';
import ScrollMagic from 'scrollmagic';
const controller = new ScrollMagic.Controller();
import objectFitImages from 'object-fit-images';
const $toFitImages = $('.object-fit-cover img');

import { Fancybox } from "@fancyapps/ui/dist/fancybox/";




objectFitImages($toFitImages);


document.addEventListener('DOMContentLoaded', () => {
	// App.init();
	// console.log('doc ready'	);
	new Menu;
	// new Video;
	// new Hero;
	new Slider;
	new Gallery;
	new Visible;
	new FooterMenu;
	new Carousel;
	new NotebookPicker;
	new BackToTop;
	new DeliveryParallax;
	new VideoBackground;

	Fancybox.bind('[data-fancybox^="gallery-"]', {
		// Your custom options
	});
	// new Portfolios;

	// Menu click handler for parent items with children
	document.addEventListener('click', function (e) {
		// Check if clicked element is a menu link inside a parent with children
		const menuLink = e.target.closest('.navbar-nav__link');
		if (!menuLink) return;

		// Check if this link is inside a submenu - more specific detection
		const parentListItem = menuLink.closest('li');
		const parentList = parentListItem ? parentListItem.parentElement : null;
		const isInSubmenu = parentList && parentList.classList.contains('navbar-nav__list--submenu');

		if (isInSubmenu) {
			console.log('Submenu item clicked - allowing normal navigation:', menuLink.textContent.trim());
			return; // Allow submenu links to work normally
		}

		const parentItem = menuLink.closest('.navbar-nav__item--has-children');
		if (!parentItem) return;

		// Check if this is a first-level menu item (direct child of #menu-main)
		const mainMenu = document.getElementById('menu-main');
		if (!mainMenu || !mainMenu.contains(parentItem)) return;

		// Check if this is a direct child of the main menu
		const isFirstLevel = parentItem.parentElement === mainMenu;
		console.log(isFirstLevel);
		if (!isFirstLevel) return;

		const screenWidth = window.innerWidth;

		if (screenWidth >= 1200) {
			// Desktop: Prevent default (don't follow link)
			e.preventDefault();
			console.log('Desktop: Prevented default for menu item:', menuLink.textContent.trim());
		} else {
			// Mobile/Tablet: Prevent default and click the span (toggle submenu)
			e.preventDefault();

			const toggleSpan = parentItem.querySelector('.navbar-nav__item__wrapper > span');
			if (toggleSpan) {
				console.log('Mobile: Clicking toggle for menu item:', menuLink.textContent.trim());
				toggleSpan.click();
			}
		}
	});

	window.addEventListener('resize', function (event) {

	}, true);
});




window.addEventListener('load', (event) => {
	// mainContentAnimations();
});