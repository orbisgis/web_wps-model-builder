define([
	'module',
	'jquery',
	'underscore',
	'process/Events',
	'WPS/WPSServer',
	'WPS/WPSDumper',
	'litteral/LitteralManager',
	'popup/popup'
], function(module, $, _, Events, WPSServer, WPSDumper, LitteralManager, Popup) {
	var $el = $('#list-serveurs'),
		$processDescription = $('#process-description');
	
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
						// fail silently
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
				Popup.notification("Le serveur " + hostname + " est déjà présent.");
				delete server;
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
									'data-servername': server.get('uid')
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

			_servers[serverUID] = server;
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

			console.log(new XMLSerializer().serializeToString(xml));
		}		
	}
	
	_.extend(WPSManager, Event);

	return WPSManager;	
});