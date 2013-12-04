define([], function() {
	return function(message, callback) {
		if(confirm(message)) {
			callback();
		}
	}
})