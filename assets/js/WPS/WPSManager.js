define([
	'popup/SplashScreen', 
	'process/process', 
	'process/data'
], function(splashScreen, Process, ProcessData) {
	var proxyURL = '';

	function WPSManager(url) {
		this._url = url;
		this.isReady = false;

		this._processes;
	}

	WPSManager.setProxyURL = function(url) {
		proxyURL = url;
	}

	WPSManager.prototype.getCapabilities = function(callback) {
		if(!this._processes) {
			splashScreen.show('GetCapabilities: ' + this._url);
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

								var process = new Process({
									'identifier': identifier,
									'displayName': title
								});

								// save the process
								this._processes[identifier] = process;
							}
						}
					}

					callback(this._processes);
					splashScreen.hide();
					this.isReady = true;
				},
				error: function(e) {
					callback();
				}	
			});
		}
	}

	var parseFormatLiteral = function(literal) {
		return literal.substring(literal.indexOf(':') + 1);
	}

	var parseFormatMimeType = function(frmt) {
		var mimeType = frmt.getElementsByTagName('MimeType');

		return mimeType.length > 0 ? mimeType[0].textContent : '';
	};

	WPSManager.prototype.describeProcess = function(identifier, callback) {
		if(this._processes && this._processes[identifier] && !this._processes[identifier].isReady) {
			splashScreen.show('DescribeProcess: ' + identifier);
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
								dataIdentifier = input.getElementsByTagName('Identifier'),
								displayName = input.getElementsByTagName('Title'),
								abstract = input.getElementsByTagName('Abstract');
							
							if(dataIdentifier.length > 0) {
								var inputData = {
									'identifier': dataIdentifier[0].textContent,
									'displayName': displayName.length > 0 ? displayName[0].textContent : dataIdentifier[0].textContent,
									'minOccurs': parseInt(input.attributes['minOccurs'].nodeValue),
									'maxOccurs': parseInt(input.attributes['maxOccurs'].nodeValue),
									'type': '',
									'defaultValue': '',
									'allowedValues': []
								};

								// the input data
								var	literalData = input.getElementsByTagName('LiteralData'),
									complexData = input.getElementsByTagName('ComplexData');

								if(literalData.length > 0) {
									literalData = literalData[0];

									var dataType = literalData.getElementsByTagName('DataType'),
										defaultValue = literalData.getElementsByTagName('DefaultValue'),
										//anyValue = literalData.getElementsByTagName('AnyValue'),
										allowedValues = literalData.getElementsByTagName('AllowedValues');

									inputData['type'] = dataType.length > 0 ? parseFormatLiteral(dataType[0].textContent) : '';
									inputData['defaultValue'] = defaultValue.length > 0 ? defaultValue[0].textContent : '';
										
									if(allowedValues.length > 0) {
										allowedValues = allowedValues[0].children;
										inputData['type'] = 'string-choice';

										for(var k=0, l=allowedValues.length; k<l; k++) {
											inputData['allowedValues'].push(allowedValues[k].textContent);
										}
									}
								} else if(complexData.length > 0) {
									complexData = complexData[0];

									var Default = complexData.getElementsByTagName('Default'),
										supported = complexData.getElementsByTagName('Supported');

									inputData['type'] = 'ComplexData';
									if(Default.length > 0) {
										Default = Default[0];

										var formats = Default.getElementsByTagName('Format');
										if(formats.length > 0) {
											inputData['defaultValue'] = parseFormatMimeType(formats[0])
										}
									}

									if(supported.length > 0) {
										supported = supported[0];

										var formats = supported.getElementsByTagName('Format');
										for(var k=0, l=formats.length; k<l; k++) {
											inputData['allowedValues'].push(parseFormatMimeType(formats[k]));
										}
									}										
								}
							}

							this._processes[identifier].addInput(new ProcessData(inputData));
						}
					}

					if(processOutputs.length > 0) {
						processOutputs = processOutputs[0];
						
						for(var i=0, j=processOutputs.children.length; i<j; i++) {
							var output = processOutputs.children[i],
								dataIdentifier = output.getElementsByTagName('Identifier'),
								displayName = output.getElementsByTagName('Title'),
								abstract = output.getElementsByTagName('Abstract');
							
							if(dataIdentifier.length > 0) {
								var outputData = {
									'identifier': dataIdentifier[0].textContent,
									'displayName': displayName.length > 0 ? displayName[0].textContent : dataIdentifier[0].textContent,
									'minOccurs': 1,
									'maxOccurs': 1,
									'type': '',
									'defaultValue': '',
									'allowedValues': []
								};

								// the output data
								var	complexOutput = output.getElementsByTagName('ComplexOutput');

								if(complexOutput.length > 0) {
									complexOutput = complexOutput[0];

									var Default = complexOutput.getElementsByTagName('Default'),
										supported = complexOutput.getElementsByTagName('Supported');
										
									outputData['type'] = 'ComplexData';
									if(Default.length > 0) {
										Default = Default[0];

										var formats = Default.getElementsByTagName('Format');
										if(formats.length > 0) {
											outputData['defaultValue'] = parseFormatMimeType(formats[0])
										}
									}

									if(supported.length > 0) {
										supported = supported[0];

										var formats = supported.getElementsByTagName('Format');
										for(var k=0, l=formats.length; k<l; k++) {
											outputData['allowedValues'].push(parseFormatMimeType(formats[k]));
										}
									}										
								}
							}

							this._processes[identifier].addOuput(new ProcessData(outputData));
						}
					}

					splashScreen.hide();
					this._processes[identifier].isReady = true;
					callback(this._processes[identifier]);
				},
				error: function(e) {
					callback();
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