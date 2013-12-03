define(['jquery'], function($) {
	var $splash = $('#splash-screen'),
		lastHide, timeOut, 
		MIN_TIME = 1000;

	$splash.css({
		'position': 'absolute', 
		'top': 0,
		'left': 0,
		'height': '100%',
		'width': '100%',
		'background-color': '#000',
		'background-repeat': 'no-repeat',
		'text-align': 'center',
		'color': 'white',
		'opacity': '0.6'
	}).hide();

	var show = function(text) {
		$splash.text(text ? text : 'Wait...').show();
		lastHide = +(new Date);
		clearTimeout(timeOut);
	}

	var hide = function() {
		var current = +(new Date);

		if(current > lastHide + MIN_TIME) {
			$splash.text('').hide();
		} else {
			setTimeout(hide, MIN_TIME - current - lastHide)
		}
	}

	$(window).on('splash-screen-wait', function(e) {
		show('Event: wait-response');
	});

	$(window).on('splash-screen-end', function(e) {
		hide();
	});

	return {
		'show': show,
		'hide': hide
	}
});