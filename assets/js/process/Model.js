define([
	'underscore',
	'process/Events'
], function(_, Events) {
	function Model() {
		this._uid = _.uniqueId('c')
		this.attributes = {
			uid: this._uid
		};

		this.initialize.apply(this, arguments);
	}

	_.extend(Model.prototype, Events);

	Model.prototype.initialize = function() {
		return this;
	};

	Model.prototype.get = function(attr) {
		return this.attributes[attr];
	};

	Model.prototype.set = function(attr, value) {
		if(attr !== 'uid') {
			var oldValue = this.attributes[attr] 
			this.attributes[attr] = value;
			this.trigger('change:' + attr, value, oldValue);
		}

		return this;
	};

	Model.prototype.clear = function() {
		for (var key in this.attributes) this.attributes[key] = void 0;
		this.trigger('clear');
	};

	return Model;
});