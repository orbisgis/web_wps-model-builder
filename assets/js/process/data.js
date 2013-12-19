define([], function() {

	var uid = 1;
	function getUniqueProcessIdentifier() {
		return 'data-' + (uid++).toString(36);
	}

	function Data(data) {
		this._uid = getUniqueProcessIdentifier();
		this._identifier = data.identifier || this._uid;
		this._displayName = data.displayName || data.identifier;
		this._minOccurs = data.minOccurs || 0;
		this._maxOccurs = data.maxOccurs || 1;
		this._type = data.type || '';
		this._defaultValue = data.defaultValue || '';
		this._value = this._defaultValue;

		// if this is empty then all values are availables
		this._allowedValues =  data.allowedValues || [];

		this._links = [];
	}

	Data.prototype.getIndentifier = function() {
		return this._identifier;
	}
	
	Data.prototype.getDisplayName = function() {
		return this._displayName;
	}

	Data.prototype.getType = function() {
		return this._type;
	}

	Data.prototype.getAllowedValues = function() {
		return this._allowedValues;
	}

	Data.prototype.setValue = function(value) {
		this._value = value;

		return this;
	}

	Data.prototype.getValue = function() {
		return this._value;
	}

	Data.prototype.addLink = function(data, process) {
		this._links.push({
			data: data.getUID(),
			process: process.getUID()
		});
	};

	Data.prototype.getLinks = function() {
		return this._links;
	}

	Data.prototype.getUID = function() {
		return this._uid;
	}

	Data.prototype.toString = function() {
		var str = this._displayName;

		if(this._minOccurs === 0 && this._maxOccurs === 1) {
			str += '*';
		} else if(this._minOccurs === 0 && this._maxOccurs > 1) {
			str += '+';
		}

		str += ' [' + this._type;

		if(this._defaultValue) {
			str += ': ' + this._defaultValue;
		}

		str += ']';

		return str;
	}

	return Data;
});