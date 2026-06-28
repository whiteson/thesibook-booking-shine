/*eslint-disable*/
import Plyr from 'plyr';
import $ from 'jquery';

class Video {
	constructor() {
		this.initVideo();
	}

	initVideo() {
		if ($('#player').length > 0) {
			const player = new Plyr('#player', {
				enabled: true,
				debug: false,
				settings: ['loop'],
				loadSprite: true,
				autoplay: true,
				volume: 0,
				muted: true,
				clickToPlay: true,
				hideControls: true,
				resetOnEnd: true,
				tooltips: { controls: false, seek: false },
				displayDuration: false,
				// speed: { selected: 0.5, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4] },
				// ratio: '1:1',
				loop: { active: true },
				ads: { enabled: false }
			});

			player.on('ready', (event) => {
				// const instance = event.detail.plyr;
				$('#player').css('opacity',1);
			});
			
			// player.play();
			// console.log(player);
		}
	}
}

export default Video;
