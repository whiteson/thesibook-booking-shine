/*eslint-disable*/
// import $ from 'jquery';
import {
	Swiper,
	Navigation,
	Pagination,
	Scrollbar
} from 'swiper';

class Slider {
	constructor() {
		this.initSlidersMain();
	}

	//Main(Home)
	initSlidersMain() {
		let Sliders = document.querySelectorAll('.main-swiper');
		let prevArrow = document.querySelectorAll('.hero-slider__swiper__navigation__prev');
		let nextArrow = document.querySelectorAll('.hero-slider__swiper__navigation__next');
		let pagination = document.querySelectorAll('.hero-slider__swiper__pagination');
		Sliders.forEach((slider, index) => {
			const swiper = new Swiper(slider, {
				modules: [Navigation, Pagination, Scrollbar],
				slidesPerView: 1,
				loop: false,
				effect: 'fade',
				// freeMode: true,
				fadeEffect: {
					crossFade: true
				},
				fade: true,
				// spaceBetween: 0,
				direction: 'horizontal',
				loop: true,
				navigation: {
					nextEl: nextArrow[index],
					prevEl: prevArrow[index],
				},
				pagination: {
					el: pagination[index],
					type: 'bullets',
					clickable: true
					// type: 'progressbar',
				}
			});

		});
	}

}

export default Slider;