define(['underscore'], function(_) {
	/**
	 * Return the first element, if exist, with the tag name.
	 */
	var getFirstElementByTagName = function(xml, tagName, defaultValue) {
		var elements = xml.getElementsByTagName(tagName);

		return elements.length > 0 ? elements[0] : defaultValue;
	};

	/**
	 * Return the text content of the first node with the tag name.
	 */
	var getTextContent = function(xml, tagName, defaultValue) {
		var node = getFirstElementByTagName(xml, tagName);

		return node ? node.textContent : defaultValue;
	};

	/**
	 * parse the occurence of a data.
	 */
	var parseOccurenceValue = function(node, tagName, defaultValue) {
		var value;
		if (tagName === 'minOccurs') {value = node.attributes['minOccurs'];}
		if (tagName === 'maxOccurs') {value = node.attributes['maxOccurs'];}
		
		if(value) {
			value = value.nodeValue;

			if(value) {
				try {
					value = parseInt(value, 10);
				} catch(e) {
					value = defaultValue;
				}
			}
		}

		return value || defaultValue || 0;
	};

	/**
	 * shortcut to get the MimeType value
	 */
	var parseFormatMimeType = function(frmt) {
		return getTextContent(frmt, 'MimeType', '');
	};

	/**
	 * parse the DataInputs node.
	 */
	var parseDataInputs = function(dataInputs) {
		var inputs = [];

		_.each(dataInputs.children, function(input) {
			var identifier = getTextContent(input, 'Identifier'),
				title = getTextContent(input, 'Title', identifier),
				abs = getTextContent(input, 'Abstract', title);
			
			if(identifier) {
				var inputData = {
					'identifier': identifier,
					'displayName': title,
					'abstract': abs,
					'minOccurs': parseOccurenceValue(input, 'minOccurs', 0),
					'maxOccurs': parseOccurenceValue(input, 'maxOccurs', 1),
					'type': '',
					'defaultValue': '',
					'allowedValues': []
				};

				// the input data
				var	literalData = getFirstElementByTagName(input, 'LiteralData'),
					complexData = getFirstElementByTagName(input, 'ComplexData');

				if(literalData) {
					var dataType = getTextContent(literalData, 'DataType', ''),
						defaultValue = getTextContent(literalData, 'DefaultValue', ''),
						allowedValues = getFirstElementByTagName(literalData, 'AllowedValues');

					inputData['type'] = dataType;
					inputData['defaultValue'] = defaultValue;
						
					if(allowedValues) {
						// we override the type because we choose between strings
						inputData['type'] = 'string-choice';

						_.each(allowedValues.childNodes, function(allowedValue) {
							inputData['allowedValues'].push(allowedValue.textContent);
						});
					}
				} else if(complexData) {
					var dfault = getFirstElementByTagName(complexData, 'Default'),
						supported = getFirstElementByTagName(complexData, 'Supported');

					// we override the type because this is not a litteral
					inputData['type'] = 'ComplexData';
					if(dfault) {
						var format = getFirstElementByTagName(dfault, 'Format');
						if(format) {
							inputData['defaultValue'] = parseFormatMimeType(format)
						}
					}

					if(supported) {
						var formats = supported.getElementsByTagName('Format');
						_.each(formats, function(format) {
							format = parseFormatMimeType(format);

							if(format) {
								inputData['allowedValues'].push(format);
							}
						})
					}										
				}
			}

			inputs.push(inputData);
		});

		return inputs;
	};

	/**
	 * parse the ProcessOutputs node.
	 */
	var parseProcessOutputs = function(processOutputs) {
		var outputs = [];

		_.each(processOutputs.children, function(output) { 
			var identifier = getTextContent(output, 'Identifier'),
				title = getTextContent(output, 'Title', identifier),
				abs = getTextContent(output, 'Abstract', title);
			
			if(identifier) {
				var outputData = {
					'identifier': identifier,
					'displayName': title,
					'abstract': abs,
					'minOccurs': parseOccurenceValue(output, 'minOccurs', 1),
					'maxOccurs': parseOccurenceValue(output, 'maxOccurs', 1),
					'type': '',
					'defaultValue': '',
					'allowedValues': []
				};

				// the output data
				var	literalOutput = getFirstElementByTagName(output, 'LiteralOutput'),
					complexOutput = getFirstElementByTagName(output, 'ComplexOutput');

				if(complexOutput) {
					var dfault = getFirstElementByTagName(complexOutput, 'Default'),
						supported = getFirstElementByTagName(complexOutput, 'Supported');
					
					// override the type to match with the input type when we have ComplexData.
					outputData['type'] = 'ComplexData';
					if(dfault) {
						var format = getFirstElementByTagName(dfault, 'Format');
						if(format) {
							outputData['defaultValue'] = parseFormatMimeType(format)
						}
					}

					if(supported) {
						var formats = supported.getElementsByTagName('Format');
						_.each(formats, function(format) {
							format = parseFormatMimeType(format);

							if(format) {
								outputData['allowedValues'].push(format);
							}
						})
					}										
				}
				else if (literalOutput) {
					var dataType = getTextContent(literalOutput, 'DataType', ''),
						defaultValue = getTextContent(literalOutput, 'DefaultValue', ''),
						allowedValues = getFirstElementByTagName(literalOutput, 'AllowedValues');

					outputData['defaultValue'] = defaultValue;
					outputData['type'] = dataType;
					if (dataType === 'double') {outputData['type'] = 'xs:double';}
					if (dataType === 'int') {outputData['type'] = 'xs:int';}
						
					if(allowedValues) {
						// we override the type because we choose between strings
						outputData['type'] = 'string-choice';

						_.each(allowedValues.childNodes, function(allowedValue) {
							inputData['allowedValues'].push(allowedValue.textContent);
						});
					}
				}
			}

			outputs.push(outputData);
		});

		return outputs;
	};

	/**
	 * parse the response to a GetCapabilities call
	 */
	var parseGetCapabilities = function(xml) {
		var processOfferings = getFirstElementByTagName(xml, 'ProcessOfferings'),
			capabilities = {};
		
		// we parse only the ProcessOfferings node.
		// we can parse the others nodes.
		// check if we have almost one ProcessOfferings
		if(processOfferings) {
			capabilities.processOfferings = [];
			_.each(processOfferings.children, function(process) {
				var identifier = getTextContent(process, 'Identifier', ''),
					title = getTextContent(process, 'Title', '');

				// save the process
				capabilities.processOfferings.push({
					'identifier': identifier,
					'displayName': title
				});
			});
		}

		return capabilities;
	};

	/**
	 * parse the response to a DescribeProcess call
	 */
	var parseDescribeProcess = function(xml) {
		var dataInputs = getFirstElementByTagName(xml, 'DataInputs'),
			processOutputs = getFirstElementByTagName(xml, 'ProcessOutputs'),
			inputs = [], 
			outputs = [];
		
		// parse the input datas	
		if(dataInputs) {
			inputs = parseDataInputs(dataInputs);
		}

		// parse the output datas
		if(processOutputs) {			
			outputs = parseProcessOutputs(processOutputs);
		}

		return {
			'dataInputs': inputs, 
			'processOutputs': outputs
		};
	};

	return {
		parseGetCapabilities: parseGetCapabilities,
		parseDescribeProcess: parseDescribeProcess
	}
});