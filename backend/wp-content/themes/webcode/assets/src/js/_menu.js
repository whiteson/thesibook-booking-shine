/* eslint-disable */
import $ from 'jquery';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
class Menu {
	constructor() {
		// this.testVariable = 'script menu loaded';
		this.initBurger();
		this.closeMenuEsc();
		//  this.stickyMenu();
		this.mobileMenu();
	}


	init() {
		// for tests purposes only
		// console.log(this.testVariable);
	}

	isHovered(element) {
		return $(element).is(':hover'); // returns true or false
	}

	mobileMenu() {
		const subMenu = $('.navbar-nav__item__wrapper span');
		subMenu.on('click', function (e) {
			// e.preventDefault();
			// toggleCLass();
			// $('body').toggleClass('menu-open');
			$(this).parent().toggleClass('submenu-open');
			$(this).parent().parent().find('.navbar-nav__list--submenu').toggleClass('open');
		});


		// 		subMenu.on('mouseenter',function(e){
		// 			// e.preventDefault();
		// 			// toggleCLass();
		// 			$(this).find('.sub-menu').toggleClass('');
		// 		});
		// 
		// 
		// 		subMenu.on('mouseleave',function(e){
		// 			// e.preventDefault();
		// 			// toggleCLass();
		// 			$(this).find('.sub-menu').toggleClass('');
		// 		});




	}

	initBurger() {
		const $body = $('body');
		const $burgerOpen = $('.site-header__wrapper__menu-btn--open,.site-header__wrapper__menu-btn--close');
		// const $burgerClose = $('.site-header__wrapper__menu-btn--close');
		const $mainMenu = $('.site-header__navigation');
		$burgerOpen.on('click', function () {
			// $burgerOpen.toggle();
			// $body.addClass('menu-open');
			// $mainMenu.addClass('open');
			$burgerOpen.toggleClass('open');
			$mainMenu.toggleClass('open');
			$('body').toggleClass('menu-open');
		});

		// $burgerClose.on('click', function () {
		// 	$burgerOpen.toggle();
		// 	$body.removeClass('menu-open');
		// 	$mainMenu.removeClass('open');
		// 	$burgerClose.toggle();
		// });
	}

	closeMenuEsc() {
		const $body = $('body');
		const $burgerOpen = $('.site-header__wrapper__menu-btn--open');
		const $burgerClose = $('.site-header__wrapper__menu-btn--close');
		const $mainMenu = $('.site-header__navigation');
		// $('body').toggleClass('menu-open');

		$body.on('keyup', function (e) {
			if (e.keyCode === 27) {
				clearOpenedSubMenu();
				$burgerBtn.removeClass('open');
				$body.removeClass('menu-open');
				$mainMenu.removeClass('open');
			}
		});
	}

	// clearOpenedSubMenu() {
	// 	const $submenuContent = $('.menu--main').find('.menu__list--submenu');
	// 	$submenuContent.each(function () { // eslint-disable-line
	// 		if ($(this).hasClass('open')) {
	// 			$(this).stop().animate({
	// 				height: 0
	// 			}, 400);
	// 			$(this).removeClass('open');
	// 		}
	// 	});
	// }

	stickyMenu() {
		var actionNav = gsap.to('.site-header', { y: '-=120', duration: 0.5, ease: 'power2.in', paused: true });

		ScrollTrigger.create({
			trigger: ".site-header",
			start: "120px top",
			end: 'bottom',
			onUpdate: ({ progress, direction, isActive }) => {
				if (direction == -1) {
					actionNav.reverse();
				} if (direction == 1) {
					actionNav.play();
					if ($('.site-header__navigation').hasClass('open')) {
						$('.site-header__navigation').removeClass('open');
						$('body').removeClass('menu-open');
						$('.site-header__wrapper__menu-btn--open').toggleClass('open');
						// $('.site-header__wrapper__menu-btn--close').hide();
					}
				} else if (direction == 1 && isActive == true) {
					actionNav.play()
				}
			}
		});


		// 		var actionFade = gsap.utils.toArray("img").forEach(function (elem) {
		// 
		// 			ScrollTrigger.create({
		// 				trigger: elem,
		// 				start: "top 80%",
		// 				end: "top -100px",
		// 
		// 				onEnter: () => gsap.timeline()
		// 					.to(elem, { autoAlpha: 1 })
		// 					.from(elem, { y: '+=50' }, 0),
		// 
		// 				onEnterBack: () => gsap.timeline()
		// 					.to(elem, { autoAlpha: 1, y: 0 }),
		// 
		// 				onLeave: () => gsap.timeline()
		// 					.to(elem, { autoAlpha: 0, y: '-=50' }),
		// 
		// 				onLeaveBack: () => gsap.timeline()
		// 					.set(elem, { autoAlpha: 0, y: 0 }),
		// 
		// 				markers: true
		// 			})
		// 		});

	}

}

export default Menu;
