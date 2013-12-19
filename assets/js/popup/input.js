define([], function() {
	return function(message, defaultValue, callback) {
		var value = prompt(message, defaultValue);
		
		if(value && callback) {
			callback(value);
		}

		return value;
	}
})