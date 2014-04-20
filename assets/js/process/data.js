define([
	'underscore',
	'process/Model'
], function(_, Model) {

	function Data(data) {
		data = data || {};

		this._uid = _.uniqueId('data_');
		this.attributes = {
			uid: this._uid,
			identifier: data.identifier || this._uid,
			displayName: data.displayName || data.identifier || this._uid,
			minOccurs: data.minOccurs || 0,
			maxOccurs: data.maxOccurs || 1,
			type: data.type || '',
			defaultValue: data.defaultValue || '',
			value: data.defaultValue || '',
			allowedValues: data.allowedValues || [],
			links: [],
		};
	}

	Data.prototype = new Model();

	Data.prototype.canReceive = function(dataType) {
		return dataType === this.get('type') && this.get('links').length < this.get('maxOccurs');
	}

	Data.prototype.addLink = function(data, process) {
		var link = {
			data: data.get('uid'),
			process: process.get('uid')
		};	
		this.attributes['links'].push(link);
		this.trigger('add-link', link);		
	};

	return Data;
});