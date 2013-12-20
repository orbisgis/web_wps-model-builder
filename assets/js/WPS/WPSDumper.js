define([
	'litteral/LitteralManager'
], function(LitteralManager) {
	var WPSC_ROOT_NODE = "<wpschaining></wpschaining>",
		
		WPSC_SERVER_LIST = "wpsservers",
		WPSC_SERVER_NODE = "server",
		WPSC_SERVER_ID = 'id',
		WPSC_SERVER_VERSION = "version",
		WPSC_SERVER_SERVICE = "service",

		WPSC_PROCESS_LIST = "wpsprocesses",
		WPSC_PROCESS_NODE = "process",
		WPSC_PROCESS_ID = "id",
		WPSC_PROCESS_WPS_ID = "identifier",
		WPSC_PROCESS_SERVER_ID = "serverid",

		WPSC_LITTERAL_LIST = "wpslitterals",
		WPSC_LITTERAL_NODE = "litteral",
		WPSC_LITTERAL_ID = "id",
		WPSC_LITTERAL_TYPE = "type",
		
		WPSC_LINK_LIST = "wpslinks",
		WPSC_LINK_NODE = "link",
		WPSC_LINK_ID = "id",
		WPSC_LINK_PROCESS_INPUT = "processinput",
		WPSC_LINK_PROCESS_INPUT_ID = "processinputidentifier",
		WPSC_LINK_PROCESS_OUTPUT = "processoutput";

	var dump = function(servers, processes) {
		var parser = new DOMParser(),
			xmlDoc = parser.parseFromString(WPSC_ROOT_NODE, "text/xml"),
			root = xmlDoc.children[0];

		var wpsServers = xmlDoc.createElement(WPSC_SERVER_LIST),
			wpsProcesses = xmlDoc.createElement(WPSC_PROCESS_LIST),
			wpsLitterals = xmlDoc.createElement(WPSC_LITTERAL_LIST),
			wpsLinks = xmlDoc.createElement(WPSC_LINK_LIST);

		root.appendChild(wpsServers);
		root.appendChild(wpsProcesses);
		root.appendChild(wpsLitterals);
		root.appendChild(wpsLinks);

		var getInputDataFromId = _.bind(function(dataId) {
			var data;
			_.find(_.values(processes), function(process) {
				data = process.getInput(dataId);
				return data
			});

			return data;
		}, this);

		_.each(servers, function(server, key) {
			// create server node
			var serverNode = xmlDoc.createElement(WPSC_SERVER_NODE);
			serverNode.setAttribute(WPSC_SERVER_ID, server.get('uid')); 
			serverNode.setAttribute(WPSC_SERVER_VERSION, server.get('version'));
			serverNode.setAttribute(WPSC_SERVER_SERVICE, server.get('service'));
			serverNode.appendChild(xmlDoc.createTextNode(server.get('url')));
			wpsServers.appendChild(serverNode);
		});

		// parse each process rendered to this server
		_.each(processes, function(process, id) {
			var processNode = xmlDoc.createElement(WPSC_PROCESS_NODE);
			processNode.setAttribute(WPSC_PROCESS_ID, id);
			processNode.setAttribute(WPSC_PROCESS_SERVER_ID, process.get('serverName'));
			processNode.setAttribute(WPSC_PROCESS_WPS_ID, process.get('identifier'));
			wpsProcesses.appendChild(processNode);

			// parse each process output
			_.each(process.get('outputs'), function(outputData) {
				_.each(outputData.get('links'), function(outputLink) {
					var inputData = getInputDataFromId(outputLink.data);

					if(inputData) {
						var link = xmlDoc.createElement(WPSC_LINK_NODE);
						link.setAttribute(WPSC_LINK_PROCESS_OUTPUT, id);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT, outputLink.process);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT_ID, inputData.get('identifier'));	
						wpsLinks.appendChild(link);
					}
				});
			});
		});

		_.each(LitteralManager.getLitterals(), function(litteral, id) {
			var litteralNode = xmlDoc.createElement(WPSC_LITTERAL_NODE);
			litteralNode.setAttribute(WPSC_SERVER_ID, id);
			litteralNode.setAttribute(WPSC_LITTERAL_ID, litteral.get('uid'));
			litteralNode.setAttribute(WPSC_LITTERAL_TYPE, litteral.get('type'));
			litteralNode.appendChild(xmlDoc.createTextNode(litteral.get('value')));
			wpsLitterals.appendChild(litteralNode);

			_.each(litteral.getOutputs(), function(outputData) {
				_.each(outputData.getLinks(), function(outputLink) {
					var inputData = getInputDataFromId(outputLink.data);

					if(inputData) {
						var link = xmlDoc.createElement(WPSC_LINK_NODE);
						link.setAttribute(WPSC_LINK_PROCESS_OUTPUT, id);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT, outputLink.process);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT_ID, inputData.get('identifier'));	
						wpsLinks.appendChild(link);
					}
				});
			});
		});

		return xmlDoc;
	}

	return {
		dump: dump
	}
});