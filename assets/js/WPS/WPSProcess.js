define(['process/process'], function(Process) {

	function WPSProcess() {
		this._name = process.title;
		this._box;
		this._inputs = process.inputs
	}
	
	WPSProcess.prototype = new Process()

	return ProcessWPS;
});