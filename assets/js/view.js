/**
 * Main module
 */
define([
	'module',
	'jquery', 
	'WPS/WPSServers', 
	'process/box',
	'popup/popup'
], function(module, $, WPSServers, Box, Popup) {
	return {
		render: function() {
			// DOM elements
			var $addFilter = $('#add-filter'),
				$deleteFilter = $('#delete-filter'),
				$addLink = $('#add-link'),
				$selectedBoxSpan = $('#selected-box'),
				$processDescription = $('#process-description'),
				$addServer = $('#add-server');

			// set constants for objects
			Box.setDraw('svg-container');

			// set URLs from module config
			//WPSManager.setProxyURL();
			var servers = new WPSServers();

			$addFilter.click(function(e) {	
				var identifier = $processDescription.attr('data-identifier'),
					serverName = $processDescription.attr('data-servername'),
					server = servers.getServer(serverName);
				
				if(server) {
					// add the box to the boxes list
					server.getProcess(identifier).render();
				}
			});
			
			$deleteFilter.click(function() {
				Box.getSelectedBox().remove();
			});
			
			$addLink.click(function(e) {
				Box.getSelectedBox().startLine();
			});

			$addServer.click(function() {
				var url = Popup.input('URL du server :');

				if(url) {
					servers.addServer(url);
				}
			});
			
			$(window).on('unselect-box', function(e) {
				$selectedBoxSpan.text('<nothing>');
			});
			
			$(window).on('select-box', function(e) {					
				$selectedBoxSpan.text(Box.getSelectedBox().getId());
			});
		}
	}
});