/*eslint-disable*/

import {
	Swiper,
	Navigation,
	Pagination,
	Scrollbar
} from 'swiper';

class Carousel {
	constructor() {
		this.initSlidersMain();
	}

	//Main(Home)
	initSlidersMain() {
		let Sliders = document.querySelectorAll('.carousel-element__swiper');
		let prevArrow = document.querySelectorAll('.carousel-element__prev');
		let nextArrow = document.querySelectorAll('.carousel-element__next');
		let pagination = document.querySelectorAll('.carousel-element__pagination');
		Sliders.forEach((slider, index) => {
			const swiper = new Swiper(slider, {
				modules: [Navigation, Pagination, Scrollbar],
				slidesPerView: "auto",
				loop: false,
				effect: 'fade',
				spaceBetween: 0,
				centeredSlides: false,
				// freeMode: true,
				fadeEffect: {
					crossFade: true
				},
				fade: true,
				// spaceBetween: 0,
				direction: 'horizontal',
				loop: false,
				navigation: {
					nextEl: nextArrow[index],
					prevEl: prevArrow[index],
				},
				pagination: {
					el: pagination[index],
					type: 'bullets',
					clickable: true,
					type: 'progressbar',
				},
				// Add breakpoints here
				breakpoints: {
					576: {
						// slidesPerView: auto,
						spaceBetween: 10
					},
					768: {
						// slidesPerView: 2.8,
						spaceBetween: 25
					},
					992: {
						// slidesPerView: 2.8,
						spaceBetween: 25
					},
					1200: {
						// slidesPerView: 2.8,
						spaceBetween: 25
					}
				}
			});

		});
	}

}

export default Carousel;