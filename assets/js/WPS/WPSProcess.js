define([
	'process/Process',
	'WPS/WPSBox'
], function(Process, WPSBox) {

	function WPSProcess() {
		Process.apply(this, arguments);
	}
	
	WPSProcess.prototype = new Process();

	WPSProcess.prototype.render = function() {
		return this.set('box', new WPSBox(20, 20, this));
	}

	return WPSProcess;
});