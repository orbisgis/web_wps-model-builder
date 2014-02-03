define([
	'module',
	'jquery',
	'underscore',
	'process/Events',
	'WPS/WPSServer',
	'WPS/WPSDumper',
	'litteral/LitteralManager',
	'alertify'
], function(module, $, _, Events, WPSServer, WPSDumper, LitteralManager, alertify) {
	var _servers = {};
	var _renderedProcesses = {};

	var WPSManager = {
		// fetch servers known by the application
		fetchServers: function() {
			var wpsServers = module.config()['wps-server'];

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
						alertify.error("Impossible de télécharger la liste des serveurs existants. " + wpsServers)
					}
				});
			}		
		},

		addServer: function(url) {
			var server = new WPSServer(url),
				hostname = server.get('hostname')
				serverUID = server.get('uid');

			// check if the server is already in the list
			if(_.find(_servers, function(s) { return s.get('hostname') === hostname })) {
				alertify.success("Le serveur " + hostname + " est déjà présent.")
				delete server;
				return;
			}

			alertify.log("Récupération des informations du serveur " + server.getDisplayName(true));
			server.getCapabilities(function(error, processes) {
				if(error) {
					alertify.error(error);
				} else {
					alertify.success("Informations correctement reçues du server " + server.getDisplayName(true));
					WPSManager.trigger('get-capabilities', server, processes);
				}
			});

			_servers[serverUID] = server;
		},

		getProcessInfos: function(serverName, identifier) {
			var server = _servers[serverName];

			if(server) {
				alertify.log("Récupération les informations du processus <strong>" + identifier + "</strong>");
				server.describeProcess(identifier, function(error, process) {
					if(error) {
						alertify.error(error);
					} else {
						alertify.success("Informations correctement reçues du processus <strong>" + identifier + "</strong>");
						WPSManager.trigger('describe-process', server, identifier, process);
					}
				});		
			}
		},

		createProcess: function(serverName, identifier) {
			var server = _servers[serverName];

			if(server) {
				// add the box to the boxes list
				var process = server.createProcess(identifier);

				if(process) {
					_renderedProcesses[process.get('uid')] = process;
					process.render();
				}
			}
		},

		deleteProcess: function(process) {
			if(process) {
				if(_renderedProcesses[process.get('uid')]) {
					var box = process.get('box'),
						uid = process.get('uid');

					box.remove();
					process.clear();
					delete _renderedProcesses[uid];
				}
			}
		},

		save: function() {
			var xml = WPSDumper.dump(_servers, _renderedProcesses);

			return new XMLSerializer().serializeToString(xml);
		}		
	}
	
	_.extend(WPSManager, Events);

	return WPSManager;	
});