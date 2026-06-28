/*eslint-disable*/
import Plyr from 'plyr';
import $ from 'jquery';

class VideoBackground {
	constructor() {
		this.initVideoBackgrounds();
	}

	initVideoBackgrounds() {
		// Find all video background elements
		const videoBackgrounds = document.querySelectorAll('.video-background');
		
		if (videoBackgrounds.length === 0) {
			return;
		}

		videoBackgrounds.forEach((container) => {
			const videoId = container.getAttribute('data-video-id');
			const videoElement = container.querySelector(`#${videoId}`);
			
			if (!videoElement) {
				return;
			}

			// Get settings from data attributes or use defaults
			const autoplay = container.getAttribute('data-autoplay') === 'true' || videoElement.hasAttribute('autoplay');
			const loop = container.getAttribute('data-loop') === 'true' || videoElement.hasAttribute('loop');
			const muted = container.getAttribute('data-muted') === 'true' || videoElement.hasAttribute('muted');
			const hideControls = container.getAttribute('data-hide-controls') === 'true' || container.classList.contains('video-background--hide-controls');

			// Initialize Plyr
			const player = new Plyr(videoElement, {
				enabled: true,
				debug: false,
				settings: ['loop'],
				loadSprite: true,
				autoplay: autoplay,
				volume: muted ? 0 : 1,
				muted: muted,
				clickToPlay: !hideControls,
				hideControls: hideControls,
				resetOnEnd: !loop,
				tooltips: { 
					controls: !hideControls, 
					seek: !hideControls 
				},
				displayDuration: !hideControls,
				loop: { active: loop },
				ads: { enabled: false },
				controls: hideControls ? [] : [
					'play-large',
					'play',
					'progress',
					'current-time',
					'mute',
					'volume',
					'settings',
					'pip',
					'airplay',
					'fullscreen'
				]
			});

			// Handle video ready event
			player.on('ready', (event) => {
				// Fade in video when ready
				$(videoElement).css('opacity', 1);
				
				// Ensure video plays if autoplay is enabled
				if (autoplay && muted) {
					player.play().catch((error) => {
						console.log('Autoplay prevented:', error);
					});
				}
			});

			// Handle play event
			player.on('play', () => {
				container.classList.add('is-playing');
			});

			// Handle pause event
			player.on('pause', () => {
				container.classList.remove('is-playing');
			});

			// Handle ended event
			player.on('ended', () => {
				if (loop) {
					player.restart();
				}
			});

			// Handle errors
			player.on('error', (event) => {
				console.error('Video error:', event);
			});

			// Store player instance on container for potential external access
			container.player = player;
		});
	}
}

export default VideoBackground;

