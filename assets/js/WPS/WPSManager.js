define([
	'module',
	'jquery',
	'underscore',
	'WPS/WPSServer',
	'WPS/WPSDumper',
	'litteral/LitteralManager',
	'popup/popup'
], function(module, $, _, WPSServer, WPSDumper, LitteralManager, Popup) {
	var $el = $('#list-serveurs'),
		$processDescription = $('#process-description');
	
	var _servers = {};

	// fetch servers known by the application
	var fetchServers = function() {
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
					// fail silently
				}
			});
		}		
	};

	var addServer = function(url) {
		var server = new WPSServer(url),
			hostname = server.getHostname();

		if(_servers[hostname]) {
			Popup.notification("Le serveur " + hostname + " est déjà présent.");
			return;
		}

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

		_servers[hostname] = server;
	};

	var getServer = function(serverName) {
		return _servers[serverName];
	};

	var deleteProcess = function(process) {
		var server = _.find(_servers, function(s, key) {
			return s.getRenderedProcesses()[process.get('uid')];
		});

		if(server) {
			server.deleteProcess(process);
		}
	};

	var save = function() {
		var xml = WPSDumper.dump(_servers);

		console.log(new XMLSerializer().serializeToString());
	};

	return {
		addServer: addServer,
		fetchServers: fetchServers,
		getServer: getServer,
		deleteProcess: deleteProcess,
		save: save
	};	
});