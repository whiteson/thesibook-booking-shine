/*eslint-disable*/
import $ from 'jquery';
// import Swiper, { Navigation, Pagination, EffectFade } from '/node_modules/swiper/swiper-bundle.min';
import '/node_modules/swiper/swiper-bundle.min';

import gsap from 'gsap';
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);

class Portfolios {
	constructor() {
		this.initPortfolios();
		this.initPortfoliosItems();
		this.initCorePagination();
		this.openFirstItem();
	}

	initCorePagination() {
		const $prev = $('.swiper-core-pagination__prev');
		const $next = $('.swiper-core-pagination__next');
		$prev.on('click', function () {
			const $swiper = document.querySelector('.swiper.active').swiper;
			console.log('prev');
			console.log('next');
			$swiper.slidePrev();
		});

		$next.on('click', function () {
			const $swiper = document.querySelector('.swiper.active').swiper;
			console.log('next');
			$swiper.slideNext();
		});
	}
	initPortfolios() {
		let Sliders = document.querySelectorAll('.swiper');
		let prevArrow = document.querySelectorAll('.swiper-button-prev');
		let nextArrow = document.querySelectorAll('.swiper-button-next');


		let Thumbs = document.querySelectorAll('.swiper-thumbs');
		let prevArrowThumbs = document.querySelectorAll('.swiper-button-prev--thumbs');
		let nextArrowThumbs = document.querySelectorAll('.swiper-button-next--thumbs');
		console.log(Thumbs);

		Sliders.forEach((slider, index) => {
			let sliderLength = slider.children[0].children.length
			let result = (sliderLength > 1) ? true : false
			result = false
			const swiper = new Swiper(slider, {
				effect: 'fade',
				fadeEffect: {
					crossFade: true
				},
				direction: 'horizontal',
				loop: false,
				navigation: {
					nextEl: nextArrow[index],
					prevEl: prevArrow[index],
				},
				speed: 1000,
				 slideToClickedSlide: true,

				// on: {
				// 	realIndexChange: function () {
				// 		let index = this.realIndex + 1; /* slide 1 => slides[1] */
				// 		let current_data = this.slides[index].dataset.title;
				// 		console.log(current_data);
				// 	}}
			});

			////init swipers thumbs
			const swiperThumbs = new Swiper(Thumbs[index], {
				// effect: 'fade',
				// effect: 'freeMode',
				// fadeEffect: {
				// 	crossFade: true
				// },
				direction: 'horizontal',
				slidesPerView: 2,
				spaceBetween: 10,
				scrub: true,
				centeredSlides: true,
				loop: false,
				slideToClickedSlide: true,
				centerInsufficientSlides: false,
				pagination: true,
				navigation: {
					prevEl: prevArrowThumbs[index],
					nextEl: nextArrowThumbs[index],
				},
				breakpoints: {
					// when window width is >= 320px
					320: {
						slidesPerView: 2
					 
					},
					// when window width is >= 480px
					480: {
						slidesPerView: 3
 					},
					// when window width is >= 640px
					640: {
						slidesPerView: 4
					}
				}
			});

			swiper.controller.control = swiperThumbs;
			swiperThumbs.controller.control = swiper;


			swiper.on('realIndexChange', function () {
				let index = this.realIndex;
				let slides = $(this.slides);
				let current_data = $(this.slides[index]).data('title');
				$('.portfolio-hero__technologies-description__container__row__item__title').empty();
				$('.portfolio-hero__technologies-description__container__row__item__title').html(current_data);


				// if(current_data == 'undefined'){
				// 	current_data = $(this.slides[index]).data('title');
				// }
				// console.log(index);
				// console.log(slides);
				// console.log(current_data);
			});

		});
	}

	initPortfoliosItems() {
		let $portfolioItems = ['portfolio-wind', 'portfolio-solar', 'portfolio-storage1'];

		$('.portfolio-hero__technologies__item').on('click', function () {
			if ($(this).hasClass('active')) {
				$(this).addClass('deactive');
				$(this).removeClass('active');

				$('.portfolio-hero__technologies__row__item').removeClass('active');
				$('.portfolio-hero__technologies__row__item').removeClass('deactive');
				// $(this).parent().removeClass('deactive');
				$('.portfolio-hero__technologies__sliders__slider').removeClass('active');
				$('.portfolio-hero__technologies__sliders__slider__thumbs').removeClass('active'); // add thumbs support
				$('body').removeClass('portfolio-active');
				$('.portfolio-hero__technologies__row').removeClass('deactive'); // 
				$('.portfolio-hero__technologies__row').removeClass('active'); // 
				$('.portfolio-hero__technologies__item').removeClass('deactive');
				// $('.portfolio-hero__technologies__item').removeClass('active');
				$('.portfolio-hero__technologies-description__container__row__item__title').empty();
				$('.portfolio-hero__technologies-description__container__row__item__title').html('SELECT THE TYPE OF PROJECT YOU ARE INTERSTED IN');
			} else {
				$('.portfolio-hero__technologies__item').removeClass('active');
				$(this).toggleClass('active');
				//get data atrtibute and enable sliders
				let $slider = $(this).data('slider');
				let $coreslider = $(`[data-slideropen=` + $slider + `]`);
				let $coresliderThumbs = $(`[data-slideropenthumbs=` + $slider + `]`);
				$('.portfolio-hero__technologies__sliders__slider').removeClass('active');
				$('.portfolio-hero__technologies__sliders__slider__thumbs').removeClass('active');
				$portfolioItems.forEach(function (value) {
					let $othercoreslider = $(`[data-slider=` + value + `]`);
					let $othercoresliderThumbs = $(`[data-sliderthumbs=` + value + `]`);
					if (value !== $slider) {
						$othercoreslider.addClass('deactive');
						$othercoreslider.parent().addClass('deactive');

						$othercoresliderThumbs.addClass('deactive');
						$othercoresliderThumbs.parent().addClass('deactive');

					} else {
						$othercoreslider.parent().removeClass('deactive');
						$othercoreslider.parent().addClass('active');
						$othercoreslider.removeClass('deactive');

						$othercoresliderThumbs.parent().removeClass('deactive');
						$othercoresliderThumbs.parent().addClass('active');
						$othercoresliderThumbs.removeClass('deactive');


					}
				});
				$coreslider.toggleClass('active');
				$coresliderThumbs.toggleClass('active');

				if ($coreslider.hasClass('active')) {
					// const activeSwiper = $(`[data-slideropen=` + $slider + `]`);
					const $swiper = document.querySelector('.swiper.active').swiper;
					let current_data = $($swiper.slides[0]).data('title');
					$('.portfolio-hero__technologies-description__container__row__item__title').empty();
					$('.portfolio-hero__technologies-description__container__row__item__title').html(current_data);
				}
				// if(!$coreslider.parent().hasClass('active')){
				// 	$coreslider.parent().toggleClass('active')
				// }
				// $coreslider.parent().toggleClass('active');
				if (!$('body').hasClass('portfolio-active')) {
					$('body').toggleClass('portfolio-active');
				}
				// $('.body').removeClass('portfolio-active');
				// gsap.to($(window), { duration: 0.5, scrollTo: '.portfolio-hero__wrapper', ease: 'ease-in' });
				// gsap.to($(window), { duration: 0.5, scrollTo: { y: 0 }, ease: 'ease-in' });
				// $('html, body').animate({ scrollTop: $('body').offset().top }, 300,'linear');
			}
		});
	}

	// initPortfolio() {
	// 	if ($('.swiper').length > 0) {
	// 		const swiper = new Swiper('.swiper', {
	// 			loop: true,
	// 			grab: true,
	// 			navigation: {
	// 				nextEl: '.swiper-button-next',
	// 				prevEl: '.swiper-button-prev',
	// 			}
	// 		});
	// 	}
	// }

	openFirstItem() {
		$(window).on('load', function () {
			$('.portfolio-hero__technologies__item__title').first().trigger('click');
			// console.log('click');
			// console.log($('.portfolio-hero__technologies__item').first());
		});
	}
}

export default Portfolios;
