(function(windows) {
	
	function ProcessWPS(process) {
		this._name = process.name;
		this._box;
		this._inputs = process.inputs
	}
	
	ProcessWPS.prototype = new Process()

	window.ProcessWPS = ProcessWPS;
})(window);