/**
 * Config file for requireJs
 */
requirejs.config({
	paths: {
		'underscore': 'vendor/underscore',
		'jquery': 'vendor/jquery-2.0.3.min',
		'SVG': 'svg/SVG'
	}
});

/**
 * Main module
 */
require(['jquery', 'WPS/WPSManager', 'process/box'], function($, WPSManager, Box) {
	// DOM elements
	var $addFilter = $('#add-filter'),
		$deleteFilter = $('#delete-filter'),
		$addLink = $('#add-link'),
		$selectedBoxSpan = $('#selected-box'),
		$listProcess = $('#list-process'),
		$processDescription = $('#process-description');

	// set constants for objects
	Box.setDraw('svg-container');
	WPSManager.setProxyURL('http://localhost/wps/lib/proxy.php?url=');

	var WPSManagerAgroCampus = new WPSManager('http://localhost:8080/geoserver/ows?service=WPS&version=1.0.0');

	$addFilter.click(function(e) {	
		var identifier = $listProcess.find('option:selected').attr('data-identifier');
		
		// add the box to the boxes list
		WPSManagerAgroCampus.getProcess(identifier).render();
	});
	
	$deleteFilter.click(function() {
		Box.getSelectedBox().remove();
	});
	
	$addLink.click(function(e) {
		Box.getSelectedBox().startLine();
	});
	
	$(window).on('unselect-box', function(e) {
		$selectedBoxSpan.text('<nothing>');
	});
	
	$(window).on('select-box', function(e) {					
		$selectedBoxSpan.text(Box.getSelectedBox().getId());
	});

	WPSManagerAgroCampus.getCapabilities(function(processes) {
		if(processes) {
			$listProcess.on('change', function() {
				var identifier = $listProcess.find('option:selected').attr('data-identifier');

				WPSManagerAgroCampus.describeProcess(identifier, function(process) {
					if(process) {
						$processDescription.html('');
						$processDescription.append('<h3>' + process.getDisplayName() + '</h3>');
						var $ul = $processDescription.append('<ul></ul>').find('ul'),
							inputs = process.getInputs();

						for(var i=0, j=inputs.length; i<j; i++) {
							$ul.append('<li>' + inputs[i].toString() + '</li>');
						}
					} else {
						alert("Une erreur est survenue pendant la récupération du processus " + identifier);
					}
				});
			});

			for(var identifier in processes) {
				var process = processes[identifier];

				$listProcess.append('<option data-identifier="' + identifier + '">' + process.getDisplayName() + '</option>');
			}	
		} else {
			alert("Une erreur est survenue pendant la récupération des processus");
		}
	});
});