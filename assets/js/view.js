/**
 * Main module
 */
define([
	'jquery', 
	'WPS/WPSManager', 
	'process/Box',
	'process/Tooltip',
	'alertify'
], function($, WPSManager, Box, Tooltip, alertify) {
	return {
		render: function() {
			// DOM elements
			var $addFilter = $('#add-filter'),
				$deleteFilter = $('#delete-filter'),
				$addLink = $('#add-link'),
				$selectedBoxSpan = $('#selected-box'),
				$processDescription = $('#process-description'),
				$addServer = $('#add-server'),
				$saveProcesses = $('#save-processes'),
				$downloadFile = $('#download-file');
		
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
				alertify.prompt('URL du server :', function(e, url) {
					if(e) WPSServer.addServer(url);
				});
			});

			// create the file and show the download button
			$saveProcesses.click(function() {
				alertify.log("Création du fichier d'exportation.");
				var xml = WPSManager.save();
				alertify.success("Cliquer sur le boutton de téléchargement.");

				console.log(xml)
				var file = new Blob([xml], {type : 'text/xml'});
				
				$downloadFile.removeClass('hide').attr({
					href: URL.createObjectURL(file),
					download: 'processes.xml'
				});
			}); 

			// hide the button when we click on it
			$downloadFile.on('click', function() {
				alertify.log("Téléchargement du fichier en cours...");
				$downloadFile.addClass('hide');
			})
		
			Box.on('unselect-box', function(e) {
				$selectedBoxSpan.text('<nothing>');
			});
			
			Box.on('select-box', function(box) {					
				$selectedBoxSpan.text(box.getId());
			});

			// Get capabilities from server. 
			// This event is trigger if the server responds and we can process the result properly
			WPSManager.on('get-capabilities', function(server, processes) {
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
			});

			// Get process informations.
			// This event is trigger if the server responds and we can process the result properly
			WPSManager.on('describe-process', function(server, identifier, process) {
				$processDescription.html('');
				$processDescription.attr({
					'data-identifier': identifier,
					'data-servername': server.get('uid')
				});
				$processDescription.append('<h3>' + process.displayName + '</h3>');
			});
		}
	}
});