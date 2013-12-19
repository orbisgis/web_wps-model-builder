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

	LitteralProcess.prototype.getType = function() {
		return this.getOutputs()[0].getType();
	}
	
	LitteralProcess.prototype.setValue = function(value) {
		this.getOutputs()[0].setValue(value);

		return this;
	}

	LitteralProcess.prototype.getValue = function() {
		return this.getOutputs()[0].getValue();
	};
	
	return LitteralProcess;
});