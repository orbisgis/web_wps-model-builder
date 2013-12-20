define([
	'process/Process',
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
		return this.set('box', new LitteralBox(20, 20, this));
	}

	LitteralProcess.prototype.getType = function() {
		return this.get('outputs')[0].getType();
	}

	LitteralProcess.prototype.setValue = function(value) {
		this.get('outputs')[0].setValue(value);

		return this;
	}

	LitteralProcess.prototype.getValue = function() {
		return this.get('outputs')[0].getValue();
	};
	
	return LitteralProcess;
});