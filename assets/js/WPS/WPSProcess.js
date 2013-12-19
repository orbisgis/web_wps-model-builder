define([
	'process/process',
	'WPS/WPSBox'
], function(Process, WPSBox) {

	function WPSProcess() {
		Process.apply(this, arguments)
	}
	
	WPSProcess.prototype = new Process();

	WPSProcess.prototype.render = function() {
		this._box = new WPSBox(20, 20, this);

		return this;
	}

	return WPSProcess;
});