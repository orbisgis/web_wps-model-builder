define(['jquery'], function($) {
	var $splash = $('#splash-screen');

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
	}

	var hide = function() {
		$splash.text('').hide();
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