/*eslint-disable*/
import Plyr from 'plyr';
import $ from 'jquery';

class Hero {
	constructor() {
		this.breakpoint = 900;
		this.windowWidth = 0;
		this.blockHeight = 0;
		this.safeSpaceForYoutubeTitle = 100;
		this.mobileBlockHeightPerViewHeight = 1;
		this.videoRatio = 16 / 9;
		this.coverVideo = true;
		this.autoplay = true;

		this.initHero();
		this.initYoutube();
	}

	initHero() {
		if ($('#hero').length > 0) {
			const player = new Plyr('#hero', {
				enabled: false,
				debug: true,
				// settings: ['loop'],
				loadSprite: true,
				autoplay: true,
				volume: 0,
				muted: true,
				clickToPlay: false,
				hideControls: true,
				resetOnEnd: true,
				tooltips: { controls: false, seek: false },
				displayDuration: false,
				// ratio: '1:1',
				loop: { active: true },
				// ads: { enabled: false }
			});

			player.on('ready', (event) => {
				// const instance = event.detail.plyr;
				$('#hero').css('opacity', 1);
				player.play();
			});

			// player.play();
			// console.log(player);
		}
	}

	initYoutube() {

		console.log('inityoutube');
		if ($('#player').length > 0) {///
			const player = new Plyr('#player', {
				enabled: true,
				debug: false,
				// settings: ['loop'],
				loadSprite: true,
				autoplay: true,
				volume: 0,
				clickToPlay: true,
				hideControls: true,
				resetOnEnd: true,
				tooltips: { controls: false, seek: false },
				displayDuration: false,
				// ratio: '1:1',
				loop: { active: true },
				// ads: { enabled: false }

				controls: [],
				disableContextMenu: false,
				toggleInvert: false,
				loadSprite: true,
				// hideControls: false,
				muted: true,
				youtube: {
					noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1
				},
				// enabled: true,
				// debug: false,
				// settings: ['loop'],
				// loadSprite: true,
				// autoplay: true,
				// volume: 0,
				// muted: true,
				// clickToPlay: true,
				// hideControls: true,
				// resetOnEnd: true,
				// tooltips: { controls: false, seek: false },
				// displayDuration: false,
				// speed: { selected: 0.5, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4] },
				// ratio: '1:1',
				loop: { active: true },
				ads: { enabled: false }


			});

			player.on('ready', (event) => {
				// const instance = event.detail.pl/yr;
				$('#player').css('opacity', 1);
				// this.setVideoSize();
			});

			player.on('play', () => {
				this.setVideoSize();
				console.log('setvideo size');
				$('body').removeClass('video-hero-paused').addClass('video-hero-playing');
			});

			player.on('pause', () => {
				$('body').removeClass('video-hero-playing').addClass('video-hero-paused');
			});

		}
	}

	getWindowWidth() {
		return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	}

	setVideoSize() {
		console.log('setvideo size');
		let windowWidth = this.getWindowWidth();
		if (windowWidth < this.breakpoint) {
			this.blockHeight = window.innerHeight * this.mobileBlockHeightPerViewHeight;
		} else {
			this.blockHeight = window.innerHeight;
		}
		const blockRatio = this.windowWidth / this.blockHeight;
		// let player = $('.hero > *');

		const player = document.querySelector('.hero').querySelector('.plyr__video-wrapper > *');


		if (blockRatio < this.videoRatio) {

			console.log(player);

			player.style.height = `${this.blockHeight + this.safeSpaceForYoutubeTitle}px`;
			player.style.width = `${Math.ceil(this.blockHeight * this.videoRatio + this.safeSpaceForYoutubeTitle)}px`;
		} else {
			player.style.width = `${window.innerWidth + this.safeSpaceForYoutubeTitle}px`;
			player.style.height = `${Math.ceil(window.innerWidth / this.videoRatio + this.safeSpaceForYoutubeTitle)}px`;
		}
	}



}

export default Hero;
