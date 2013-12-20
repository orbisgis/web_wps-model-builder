define([
	'litteral/LitteralProcess'
], function(LitteralProcess) {
	var _litterals = {};

	var addLitteral = function(type) {
		var process = new LitteralProcess(type);
		_litterals[process.get('uid')] = process;
		process.render();
	};

	var getLitterals = function() {
		return _litterals;
	};

	return {
		addLitteral: addLitteral, 
		getLitterals: getLitterals 
	};
});