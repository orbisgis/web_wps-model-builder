define([], function() {
	return function(defaultValue, callback) {
		var value = prompt("Entrer votre valeur", defaultValue);
		
		callback(value);
	}
})