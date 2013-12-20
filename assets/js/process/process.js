define([
	'underscore',
	'process/Model',
	'process/Data'
], function(_, Model, Data) {
	
	function Process(process) {
		process = process || {};
		
		this._uid = _.uniqueId('process_');
		this.attributes = {
			uid: this._uid,
			identifier: process.identifier || this._uid,
			displayName: process.displayName || process.identifier || this._uid,
			inputs: [],
			outputs: []
		}

		if(process.inputData) {
			_.each(process.inputData, function(inputData) {
				this.attributes.inputs.push(new Data(inputData));
			}, this);
		}

		if(process.outputData) {
			_.each(process.outputData, function(outputData) {
				this.attributes.outputs.push(new Data(outputData));
			}, this);
		}		
	}

	Process.prototype = new Model();

	Process.prototype.getInput = function(dataId) {
		return _.find(this._inputs, function(data) { return data.get('uid') === dataId});
	}

	Process.prototype.addInput = function(input) {
		this._inputs.push(input);

		return this;
	};
	
	Process.prototype.getOutput = function(dataId) {
		return _.find(this._outputs, function(data) { return data.get('uid') === dataId});
	}

	Process.prototype.addOutput = function(outpout) {
		this._outputs.push(outpout);

		return this;
	}

	Process.prototype.render = function() {
		return this;
	}

	return Process;
});
