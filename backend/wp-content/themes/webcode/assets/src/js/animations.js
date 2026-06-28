/* eslint-disable */
import $ from 'jquery';
import './lettering';
import debounce from 'lodash';
const breakpoint = 600;
let count = 1;
let base = 1;
const factor = 0.015;

function waveDelay(elem) {
	$(elem).find(' > span').each((j, item) => {
		const delay = (factor * count) + base;
		const randomdelay = ((base * (j)) + 0.5 + delay).toFixed(3); //between 0.5 and 2
		$(item).css('transition-delay', `${randomdelay}s`);
		count++;
	});
}

function splitWordsInChars(elem) {
	$(elem).find(' > span').each((i, item) => {
		$(item).lettering();
		waveDelay($(item));
	});
}

function splitText() {
	$('[data-title-animation]').each((i, item) => {
		count = 1;
		base = 0;
		const customDelay = parseInt($(item).attr('data-title-animation'), 10);
		if (customDelay) {
			base = customDelay;
		}
		const trimmedText = $.trim($(item).html());
		$(item).html(trimmedText).lettering('words');
		splitWordsInChars(item);
	});
}

function getWindowWidth() {
	return window.innerWidth;
}

$(document).on('ready', () => {

	let $hassplittext = $(['data-title-animation']);
	if ($hassplittext.length > 0) {

		let currentWindowWidth = getWindowWidth();

		if (currentWindowWidth > breakpoint) {
			splitText();
		}

		$(window).on('resize', debounce(() => {
			currentWindowWidth = getWindowWidth();

			if (currentWindowWidth > breakpoint) {
				splitText();
			}
		}, 400));
	}
});