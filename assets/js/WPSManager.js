require([], function() {
	var proxyURL = '';

	function WPSManager(url) {
		this._url = url;
		this.isReady = false;

		this._processes;
		this.getCapabilities();
	}

	WPSManager.setProxyURL = function(url) {
		proxyURL = url;
	}

	WPSManager.prototype.getCapabilities = function() {
		if(!this._processes) {
			var url = escape(this._url + '&request=GetCapabilities');
			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
				success: function(data, textStatus, jqXHR) {
					var xml = data.firstChild,
						processesOfferings = xml.getElementsByTagName('ProcessOfferings');

					this._processes = {};
					// check if we have almost one ProcessOfferings
					if(processesOfferings.length > 0) {
						var processesOfferings = processesOfferings[0];
						
						for(var i=0, j=processesOfferings.children.length; i<j; i++) {
							var processOfferings = processesOfferings.children[i],
								identifiers = processOfferings.getElementsByTagName('Identifier'), identifier = '',
								titles = processOfferings.getElementsByTagName('Title'), title = ''
							
							if(identifiers.length > 0) {
								identifier = identifiers[0].textContent;

								if(titles.length > 0) {
									title = titles[0].textContent;
								}

								// save the process
								this._processes[identifier] = {
									'name': identifier,
									'title': title,
									'inputs': [],
									'isReady': false
								};

								this.describeProcess(identifier);
							}
						}
					}

					this.isReady = true;
				},
				error: function(e) {
					// fail silently
				}	
			});
		}
	}

	WPSManager.prototype.describeProcess = function(identifier) {
		if(this._processes && this._processes[identifier] && !this._processes[identifier].isReady) {
			var url = escape(this._url + '&request=DescribeProcess&identifier=' + identifier);
			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
				success: function(data, textStatus, jqXHR) {
					var xml = data.firstChild
						dataInputs = xml.getElementsByTagName('DataInputs'),
						processOutputs = xml.getElementsByTagName('ProcessOutputs'),
						inputs = [];
					
					if(dataInputs.length > 0) {
						dataInputs = dataInputs[0];
						
						for(var i=0, j=dataInputs.children.length; i<j; i++) {
							var input = dataInputs.children[i],
								name = input.getElementsByTagName('Identifier');
							
							if(name.length > 0) {
								var inputData = {
									'name': name[0].textContent,
									'minOccurs': input.attributes['minOccurs'],
									'maxOccurs': input.attributes['maxOccurs']
								};

								// the input data
								var	literalData = input.getElementsByTagName('LiteralData'),
									complexData = input.getElementsByTagName('ComplexData');

								if(literalData.length > 0) {
									literalData = literalData[0];
									inputData['literalData'] = {};

									var dataType = literalData.getElementsByTagName('DataType'),
										defaultValue = literalData.getElementsByTagName('DefaultValue'),
										anyValue = literalData.getElementsByTagName('AnyValue'),
										allowedValues = literalData.getElementsByTagName('AllowedValues');

									if(dataType.length > 0) {
										inputData['literalData']['dataType'] = dataType[0].textContent;
										inputData['literalData']['defaultValue'] = defaultValue.length > 0 ? defaultValue[0].textContent : '';
										inputData['literalData']['anyValue'] = anyValue.length > 0;
										inputData['literalData']['allowedValues'] = [];

										if(allowedValues.length > 0) {
											allowedValues = allowedValues[0].children;

											for(var k=0, l=allowedValues.length; k<l; k++) {
												inputData['literalData']['allowedValues'].push(allowedValues[k].textContent);
											}
										}
									}	
								} else if(complexData.length > 0) {
									complexData = complexData[0];
									inputData['complexData'] = {};

									var Default = complexData.getElementsByTagName('Default'),
										supported = complexData.getElementsByTagName('Supported'),
										parseFormat = function(frmt) {
											var mimeType = frmt.getElementsByTagName('MimeType');

											return mimeType.length > 0 ? mimeType[0].textContent : '';
										};

									if(Default.length > 0) {
										Default = Default[0];

										var formats = Default.getElementsByTagName('Format');
										if(formats.length > 0) {
											inputData['complexData']['default'] = {
												'format': parseFormat(formats[0])
											};
										}
									}

									if(supported.length > 0) {
										supported = supported[0];

										var formats = supported.getElementsByTagName('Format');
										inputData['complexData']['supported'] = [];
										for(var k=0, l=formats.length; k<l; k++) {
											inputData['complexData']['supported'].push({
												'format': parseFormat(formats[k])
											});
										}
									}										
								}
							}

							this._processes[identifier].inputs.push(inputData);
						}
					}

					this._processes[identifier].isReady = true;
				},
				error: function(e) {
					// fail silently
				}	
			});
		} else {
			// fail silently
		}
	}

	WPSManager.prototype.getProcesses = function() {
		if(this.isReady) {
			return this._processes;
		}
	}

	WPSManager.prototype.getProcess = function(identifier) {
		return this._processes[identifier];
	}

	return WPSManager;
});