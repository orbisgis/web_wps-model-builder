define(['process/box'], function(Box) {
	
	var uid = 1;

	function getUniqueProcessIdentifier() {
		return 'process-' + (uid++ + +(new Date)).toString(36);
	}

	function Process(process) {
		this._identifier = process.identifier || getUniqueProcessIdentifier();
		this._displayName = process.displayName || this._identifier;
		this._box;
		this._inputs = [];
		this._outputs = [];
	}

	Process.prototype.getInputs = function() {
		return this._inputs;
	}

	Process.prototype.addInput = function(input) {
		this._inputs.push(input);

		return this;
	}
	
	Process.prototype.getOutputs = function() {
		return this._outputs;
	}

	Process.prototype.addOuput = function(outpout) {
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
		this._box = new Box(20, 20, this);

		return this;
	}

	return Process;
});
