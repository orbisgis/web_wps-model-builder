define([
	'process/process',
	'litteral/LitteralBox'
], function(Process, LitteralBox) {
	
	function LitteralProcess(type) {
		Process.call(this, {
			displayName: type,
			inputData: [],
			outputData: [{
                displayName: type,
                minOccurs: 1,
                maxOccurs: 1,
                type: type
            }]
		});
	}

	LitteralProcess.prototype = new Process();

	LitteralProcess.prototype.render = function() {
		this._box = new LitteralBox(20, 20, this);

		return this;
	}
	
	return LitteralProcess;
});