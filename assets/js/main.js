$(function() {
	// DOM elements
	var $addFilter = $('#add-filter'),
		$deleteFilter = $('#delete-filter'),
		$addLink = $('#add-link'),
		$selectedBoxSpan = $('#selected-box');
	
	// set constants for objects
	Box.setDraw('svg-container');
	WPSManager.setProxyURL('http://localhost/wps/lib/proxy.php?url=');

	var WPSManagerAgroCampus = new WPSManager('http://geowww.agrocampus-ouest.fr/cgi-bin/hswps.cgi?service=wps');
	var _selectedProcess = '';

	$addFilter.click(function(e) {				
		// add the box to the boxes list
		var process = new ProcessWPS(WPSManagerAgroCampus.getProcess(_selectedProcess));
		process.render();
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
	
	var getCapabilities = function() {
		if(WPSManagerAgroCampus.isReady) {
			var processes = WPSManagerAgroCampus.getProcesses(),
				$listProcess = $('#list-process');

			$listProcess.html('');

			for(var identifier in processes) {
				var process = processes[identifier];
				
				var $li = $('<li data-identifier="' + identifier + '">' + identifier + '</li>');

				$li.click(function() {
					var $this = $(this);
					
					if(_selectedProcess) {
						$listProcess.find('[data-identifier=' + _selectedProcess + ']').css('color', 'black');
					}
					
					$this.css('color', 'red');
					_selectedProcess = $this.attr('data-identifier');
				});
				
				$listProcess.append($li);
			}
		} else {
			alert("L'objet n'est pas encore initialisé!");
		}		
	}
	
	$('#get-capabilities').click(function() {
		getCapabilities();
	});
});