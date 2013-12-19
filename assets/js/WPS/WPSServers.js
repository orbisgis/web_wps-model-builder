define([
	'module',
	'jquery',
	'underscore',
	'WPS/WPSManager',
	'litteral/LitteralManager'
], function(module, $, _, WPSManager, LitteralManager) {
	var wpsServers = module.config()['wps-server'],
		$el = $('#list-serveurs'),
		$processDescription = $('#process-description');
	
	
	function WPSServers() {
		this._servers = {};

		// fetch servers known by the application
		if(wpsServers) {
			$.ajax({
				type: 'GET',
				url: wpsServers,
				context: this,
				dataType: 'json',
				success: function(data) {
					_.each(data, function(serverURL) {
						this.addServer(serverURL);
					}, this);
				},
				error: function() {
					// fail silently
				}
			});
		}
	}

	WPSServers.prototype.addServer = function(url) {
		var server = new WPSManager(url),
			hostname = server.getHostname();

		var $container = $('<div></div>'),
			$title = $('<p>' + hostname + '</p>'),
			$listProcess = $('<select></select>');

		// append elements to the DOM
		$container.append($title).append($listProcess);
		$el.append($container);

		$listProcess.hide();
		$title.click(function() {
			$listProcess.toggle();
		})

		server.getCapabilities(function(processes) {
			if(processes) {
				$listProcess.on('change', function() {
					var identifier = $listProcess.find('option:selected').attr('data-identifier');

					server.describeProcess(identifier, function(process) {
						if(process) {
							$processDescription.html('');
							$processDescription.attr({
								'data-identifier': identifier,
								'data-servername': hostname
							});
							$processDescription.append('<h3>' + process.displayName + '</h3>');

						} else {
							alert("Une erreur est survenue pendant la récupération du processus " + identifier);
						}
					});
				});

				for(var identifier in processes) {
					var process = processes[identifier];

					$listProcess.append(
						'<option data-identifier="' + identifier + '">' + process.displayName + '</option>');
				}	
			} else {
				alert("Une erreur est survenue pendant la récupération des processus");
			}
		});

		this._servers[hostname] = server;
	}

	WPSServers.prototype.getServer = function(serverName) {
		return this._servers[serverName];
	}

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

	WPSServers.prototype.save = function() {
		// save the servers and the rendered boxes
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
			_.find(_.values(this._servers), function(server) { 
				return _.find(_.values(server.getRenderedProcesses()), function(process) {
					data = process.getInput(dataId);
					return data
				});
			});

			return data;
		}, this);

		_.each(this._servers, function(serverManager, key) {
			// create server node
			var server = xmlDoc.createElement(WPSC_SERVER_NODE);
			server.setAttribute(WPSC_SERVER_ID, key);
			server.setAttribute(WPSC_SERVER_VERSION, serverManager._params['version']);
			server.setAttribute(WPSC_SERVER_SERVICE, serverManager._params['service']);
			server.appendChild(xmlDoc.createTextNode(serverManager._url));
			wpsServers.appendChild(server);

			// parse each process rendered to this server
			_.each(serverManager.getRenderedProcesses(), function(processManager, id) {
				var process = xmlDoc.createElement(WPSC_PROCESS_NODE);
				process.setAttribute(WPSC_PROCESS_ID, id);
				process.setAttribute(WPSC_PROCESS_SERVER_ID, key);
				process.setAttribute(WPSC_PROCESS_WPS_ID, processManager._identifier);
				wpsProcesses.appendChild(process);

				// parse each process output
				_.each(processManager.getOutputs(), function(outputData) {
					_.each(outputData.getLinks(), function(outputLink) {
						var inputData = getInputDataFromId(outputLink.data);

						if(inputData) {
							var link = xmlDoc.createElement(WPSC_LINK_NODE);
							link.setAttribute(WPSC_LINK_PROCESS_OUTPUT, id);
							link.setAttribute(WPSC_LINK_PROCESS_INPUT, outputLink.process);
							link.setAttribute(WPSC_LINK_PROCESS_INPUT_ID, inputData.getIndentifier());	
							wpsLinks.appendChild(link);
						}
					});
				});
			});
		});

		_.each(LitteralManager.getLitterals(), function(litteralProcess, id) {
			var litteral = xmlDoc.createElement(WPSC_LITTERAL_NODE);
			litteral.setAttribute(WPSC_SERVER_ID, id);
			litteral.setAttribute(WPSC_LITTERAL_ID, litteralProcess.getUID());
			litteral.setAttribute(WPSC_LITTERAL_TYPE, litteralProcess.getType());
			litteral.appendChild(xmlDoc.createTextNode(litteralProcess.getValue()));
			wpsLitterals.appendChild(litteral);

			_.each(litteralProcess.getOutputs(), function(outputData) {
				_.each(outputData.getLinks(), function(outputLink) {
					var inputData = getInputDataFromId(outputLink.data);

					if(inputData) {
						var link = xmlDoc.createElement(WPSC_LINK_NODE);
						link.setAttribute(WPSC_LINK_PROCESS_OUTPUT, id);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT, outputLink.process);
						link.setAttribute(WPSC_LINK_PROCESS_INPUT_ID, inputData.getIndentifier());	
						wpsLinks.appendChild(link);
					}
				});
			});
		});

		console.log(new XMLSerializer().serializeToString(xmlDoc));
	};

	return WPSServers;
})