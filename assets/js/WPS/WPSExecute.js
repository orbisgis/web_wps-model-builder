define([
	'module',
	'underscore',
	'litteral/LitteralManager',
	'alertify'
], function(module, _, LitteralManager, alertify) {
	var length = function(links){
		var l = 0;
		for (link in links) {l += 1;}
		return l;
	}

	var check = function(processes){
		var nbOutputs = 0;
		var bool = true;
		_.each(processes, function(process){
			_.each(process.get('inputs'), function(inputData) {
				var l = length(inputData.get('links'));
				if (l > inputData.get('maxOccurs')) {alertify.log("Le paramètre " + inputData.get('displayName') + ' du process ' + process.get('identifier') + ' est limitée à ' + inputData.get('maxOccurs') + " entrée(s)"); bool = false;}
				if (l < inputData.get('minOccurs')) {alertify.log("Le paramètre " + inputData.get('displayName') + ' du process ' + process.get('identifier') + ' doit avoir au moins ' + inputData.get('minOccurs') + " entrée(s)"); bool = false;}
			});
			
			_.each(process.get('outputs'), function(outputData) {
				if  (length(outputData.get('links')) == 0) {nbOutputs += 1;}
			});
		});
		
		_.each(LitteralManager.getLitterals(), function(litteral){
			if (litteral.get('value') === '') {alertify.log("Le littéral " + litteral.get('type') + " n'a pas de valeur"); bool = false;}
			if (litteral.get('type') === 'xs:int'){
				if (isNaN(parseInt(litteral.get('value'))) || parseInt(litteral.get('value')) != parseFloat(litteral.get('value'))) {alertify.log("Le littéral xs:int n'est pas un entier"); bool = false;}
			}			
			if (litteral.get('type') === 'xs:double'){
				if (isNaN(parseFloat(litteral.get('value')))) {alertify.log("Le littéral xs:double n'est pas un réel"); bool = false;}
			}
			
			if (litteral.get('type') === 'string-choice'){
				var b = false;
				_.each(litteral.get('outputs'), function(output) {
					_.each(output.get('links'), function(outputLink){
						var nextProcess = processes[outputLink.process];
						_.each(nextProcess.get('inputs'), function(inputsData){
							if (inputsData.get('type') === 'string-choice'){
								_.each(inputsData.get('allowedValues'), function(allow){
									
									if (allow === litteral.get('value')){
										b = true;
									}
								});
							}
						});
					});
				});
				
				if (!b)  {alertify.log("La valeur du littéral string-choice n'est pas autorisée"); bool = false;}
			}
			
			var litteralNbOutputs = 0;
			_.each(litteral.get('outputs'), function(outputData) {
				if  (length(outputData.get('links')) != 0) {litteralNbOutputs += 1;}
			});
			if (litteralNbOutputs == 0) {alertify.log('Le littéral ' + litteral.get('type') + " n'est pas relié"); bool = false;}
		});
		
		if (nbOutputs != 1) {alertify.log('Le processus global doit avoir une unique sortie'); bool = false;}
		return bool;
	}
	
	var setOrder = function(processes){
		var nextStep = function(process, ord){
			if (process.get('order')) {if (ord > process.get('order')) {process.set('order', ord);}}
			else {process.set('order', ord);}
			_.each(process.get('outputs'), function(output){
				_.each(output.get('links'), function(outputLink){
					var nextProcess = processes[outputLink.process];
					nextStep(nextProcess, ord + 1);
				});
			});
		}
		_.each(LitteralManager.getLitterals(), function(litteral){
			_.each(litteral.get('outputs'), function(output) {
				_.each(output.get('links'), function(outputLink){
					var nextProcess = processes[outputLink.process];
					nextStep(nextProcess, 1);
				});
			});
		});
	}
	
	var maxOrder = function(processes){
		var max = 0;
		_.each(processes, function(process){
			if (process.get('order') > max) {max = process.get('order');}
		});
		return max;
	}
	
	var execute = function(servers, processes){
		var m = maxOrder(processes);
		for (i = 1 ; i <= m ; i++){
			_.each(processes, function(process){
				if (process.get('order') == i) {executeProcess(servers, processes, process);}
			});
		}
		var finalProcess = _.find(processes, function(proc) {return proc.get('order') == m});
		return finalProcess.get('computeValue');
	}
		
	var executeProcess = function(servers, processes, process){
		
		var serv = servers[process.get('serverName')];
		var tagRoot = '<wps:Execute version="' + serv.get('version') + '" service="' + serv.get('service') + '" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd"></wps:Execute>';
		var tagIdentifier = 'ows:Identifier';
		var tagDataInputs = 'wps:DataInputs';
		var tagResponseForm = 'wps:ResponseForm';
		var tagInput = 'wps:Input';
		var tagData = 'wps:Data';
		var tagRawDataOutput = 'wps:RawDataOutput';

		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(tagRoot, "text/xml");
		root = xmlDoc.children[0];
		
		var owsIdentifier = xmlDoc.createElement(tagIdentifier),
			wpsDataInputs = xmlDoc.createElement(tagDataInputs);
				
		owsIdentifier.appendChild(xmlDoc.createTextNode(process.get('identifier')));
		root.appendChild(owsIdentifier);
		root.appendChild(wpsDataInputs);

		var wpsInput, wpsData, wpsDataType;
		
		_.each(process.get('inputs'), function(inputData){
			_.each(inputData.get('links'), function(inputLink){
				var input = (LitteralManager.getLitterals())[inputLink.process];
				if (input){
					inputType = input.get('type');
					inputValue = input.get('value');
				}
				else{
					input = processes[inputLink.process];
					inputValue = input.get('computeValue');
					if (isNaN(parseFloat(inputValue ))) {inputType = "ComplexData";}
					else {inputType = "LiteralData";};
				}
				
				var tagType = 'wps:';
				wpsInput = xmlDoc.createElement(tagInput);
				wpsDataInputs.appendChild(wpsInput);

				owsDataIdentifier = xmlDoc.createElement(tagIdentifier);
				owsDataIdentifier.appendChild(xmlDoc.createTextNode(inputData.get('displayName')));
				wpsInput.appendChild(owsDataIdentifier);

				wpsData = xmlDoc.createElement(tagData);
				wpsInput.appendChild(wpsData);

				
				if(inputType === "ComplexData"){
					tagType = tagType + 'ComplexData';
					wpsDataType = xmlDoc.createElement(tagType);
					wpsDataType.setAttribute('mimeType','application/wkt');
					wpsDataType.appendChild(xmlDoc.createTextNode("<![CDATA[" + inputValue + "]]>"));
					wpsData.appendChild(wpsDataType);
				}
				else {
					tagType = tagType + 'LiteralData'
					wpsDataType = xmlDoc.createElement(tagType);
					wpsDataType.appendChild(xmlDoc.createTextNode(inputValue));
					wpsData.appendChild(wpsDataType);
				}
			});
		});

		wpsResponseForm = xmlDoc.createElement(tagResponseForm);
		root.appendChild(wpsResponseForm);

		wpsRawDataOutput = xmlDoc.createElement(tagRawDataOutput);
		wpsRawDataOutput.setAttribute('mimeType', 'application/wkt');
		wpsResponseForm.appendChild(wpsRawDataOutput);

		owsOutputIdentifier=xmlDoc.createElement(tagIdentifier);
		owsOutputIdentifier.appendChild(xmlDoc.createTextNode('result'));
		wpsRawDataOutput.appendChild(owsOutputIdentifier);

		var proxyURL = module.config()['proxy'];
		
		$.ajax({
			method: "POST",
			async: false,
			url: proxyURL,
			data: {'url': serv.get('url'), 'data': new XMLSerializer().serializeToString(xmlDoc).replace(new RegExp("&lt;", "g"),"<").replace(new RegExp("&gt;", "g"),">")},
			success: function(dat) {process.set('computeValue', dat)},
			error: function() {console.log("problem " + process.get('identifier'));}
		});
	}
	
	return {
		execute: execute,
		check: check,
		setOrder: setOrder
	}

})