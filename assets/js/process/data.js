define([], function() {

	var uid = 1;
	function getUniqueProcessIdentifier() {
		return 'data-' + (uid++ + +(new Date)).toString(36);
	}

	function Data(data) {
		this._displayName = data.displayName || data.identifier;
		this._identifier = data.identifier || getUniqueProcessIdentifier();
		this._minOccurs = data.minOccurs || 0;
		this._maxOccurs = data.maxOccurs || 1;
		this._type = data.type || '';
		this._defaultValue = data.defaultValue || '';

		// if this is empty then all values are availables
		this._allowedValues =  data.allowedValues || [];
	}

	Data.prototype.getDisplayName = function() {
		return this._displayName;
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