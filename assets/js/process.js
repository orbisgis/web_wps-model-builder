(function(windows) {
	
	function Process(name) {
		this._name = name;
		this._box;
		this._inputs = [];
	}
	
	Process.prototype.getInputs = function() {
		return this._inputs;
	}
	
	Process.prototype.getOutputs = function() {
		return 1;
	}
	
	Process.prototype.getName = function() {
		return this._name;
	}
	
	Process.prototype.render = function() {
		this._box = new Box(Math.random() * 800, Math.random() * 400, this);
	}

	window.Process = Process;
})(window);
