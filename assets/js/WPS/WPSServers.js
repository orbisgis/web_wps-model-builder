define([
	'module',
	'jquery',
	'underscore',
	'WPS/WPSManager'
], function(module, $, _, WPSManager) {
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
							$processDescription.append('<h3>' + process.getDisplayName() + '</h3>');

						} else {
							alert("Une erreur est survenue pendant la récupération du processus " + identifier);
						}
					});
				});

				for(var identifier in processes) {
					var process = processes[identifier];

					$listProcess.append(
						'<option data-identifier="' + identifier + '">' + process.getDisplayName() + '</option>');
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

	return WPSServers;
})