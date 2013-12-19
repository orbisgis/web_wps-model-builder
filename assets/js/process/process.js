define([
	'process/data'
], function(ProcessData) {
	
	var uid = 1;

	function getUniqueProcessIdentifier() {
		return 'process-' + (uid++).toString(36);
	}

	function Process(process) {
		process = process || {};

		this._uid = getUniqueProcessIdentifier();
		this._identifier = process.identifier || this._uid;
		this._displayName = process.displayName || this._identifier;
		this._inputs = [];
		this._outputs = [];

		if(process.inputData) {
			_.each(process.inputData, function(inputData) {
				this._inputs.push(new ProcessData(inputData));
			}, this);
		}

		if(process.outputData) {
			_.each(process.outputData, function(outputData) {
				this._outputs.push(new ProcessData(outputData));
			}, this);
		}		
	}

	Process.prototype.getUID = function() {
		return this._uid;
	};

	Process.prototype.getInputs = function() {
		return this._inputs;
	};

	Process.prototype.addInput = function(input) {
		this._inputs.push(input);

		return this;
	};
	
	Process.prototype.getOutputs = function() {
		return this._outputs;
	}

	Process.prototype.addOutput = function(outpout) {
		this._outputs.push(outpout);

		return this;
	}
	
	Process.prototype.getDisplayName = function() {
		return this._displayName;
	}

	Process.prototype.setDisplayName = function(displayName) {
		this._displayName = displayName;

		return this;
	}

	Process.prototype.render = function() {
		return this;
	}

	return Process;
});
