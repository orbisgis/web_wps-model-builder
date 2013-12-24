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

		this.set('type', type);
		this.set('value', '');
	}

	LitteralProcess.prototype = new Process();

	LitteralProcess.prototype.render = function() {
		return this.set('box', new LitteralBox(20, 20, this));
	}

	LitteralProcess.prototype.setValue = function(value) {
		this.get('outputs')[0].set('value', value);
		this.set('value', value);

		return this;
	}

	LitteralProcess.prototype.getValue = function() {
		return this.get('value');
	};
	
	return LitteralProcess;
});