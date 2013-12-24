/**
 * Main module
 */
define([
	'module',
	'jquery', 
	'WPS/WPSManager', 
	'process/Box',
	'process/Tooltip',
	'popup/popup'
], function(module, $, WPSManager, Box, Tooltip, Popup) {
	return {
		render: function() {
			// DOM elements
			var $addFilter = $('#add-filter'),
				$deleteFilter = $('#delete-filter'),
				$addLink = $('#add-link'),
				$selectedBoxSpan = $('#selected-box'),
				$processDescription = $('#process-description'),
				$addServer = $('#add-server'),
				$saveProcesses = $('#save-processes');
		
			var $listServers = $('#list-serveurs'),
				$processDescription = $('#process-description');

			// set constants for objects
			Box.setDraw('svg-container');
			WPSManager.fetchServers();
			Tooltip.setDraw(Box.getDraw());

			$addFilter.click(function(e) {
				var identifier = $processDescription.attr('data-identifier'),
					serverName = $processDescription.attr('data-servername');

				WPSManager.createProcess(serverName, identifier);
			});
			
			$deleteFilter.click(function() {
				var process = Box.getSelectedBox().getProcess();

				if(process) {
					WPSManager.deleteProcess(process);
				}
			});
			
			$addLink.click(function(e) {
				Box.getSelectedBox().startLine();
			});

			$addServer.click(function() {
				var url = Popup.input('URL du server :');

				if(url) {
					WPSServer.addServer(url);
				}
			});

			$saveProcesses.click(function() {
				WPSManager.save();
			})
			
			Box.on('unselect-box', function(e) {
				$selectedBoxSpan.text('<nothing>');
			});
			
			Box.on('select-box', function(box) {					
				$selectedBoxSpan.text(box.getId());
			});

			WPSManager.on('get-capabilities', function(server, processes) {
				if(processes) {
					var $container = $('<div></div>'),
						$title = $('<p>' + server.get('hostname') + '</p>'),
						$listProcess = $('<select></select>');

					// append elements to the DOM
					$container.append($title).append($listProcess);
					$listServers.append($container);

					$listProcess.hide();
					$title.click(function() {
						$listProcess.toggle();
					})		

					$listProcess.on('change', function() {
						var identifier = $listProcess.find('option:selected').attr('data-identifier');

						WPSManager.getProcessInfos(server.get('uid'), identifier);
					});

					for(var identifier in processes) {
						var process = processes[identifier];

						$listProcess.append(
							'<option data-identifier="' + identifier + '">' + process.displayName + '</option>');
					}	
				} else {
					Popup.notification("Une erreur est survenue pendant la récupération des processus");
				}
			});

			WPSManager.on('describe-process', function(server, identifier, process) {
				if(process) {
					$processDescription.html('');
					$processDescription.attr({
						'data-identifier': identifier,
						'data-servername': server.get('uid')
					});
					$processDescription.append('<h3>' + process.displayName + '</h3>');
				} else {
					Popup.notification("Une erreur est survenue pendant la récupération du processus " + identifier);
				}
			});
		}
	}
});