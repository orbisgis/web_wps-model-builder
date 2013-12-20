/**
 * Main module
 */
define([
	'module',
	'jquery', 
	'WPS/WPSManager', 
	'process/Box',
	'popup/popup'
], function(module, $, WPSManager, Box, Popup) {
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

			// set constants for objects
			Box.setDraw('svg-container');
			WPSManager.fetchServers();

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
		}
	}
});