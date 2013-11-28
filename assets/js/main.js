$(function() {
	var $addFilter = $('#add-filter'),
		$deleteFilter = $('#delete-filter'),
		$addLink = $('#add-link'),
		$selectedBoxSpan = $('#selected-box');
	
	var selectedProcess = '';
	var proxyURL = 'http://localhost/wps/lib/proxy.php?url=';
	var processes = [];
	
	Box.setDraw('svg-container');
	
	$addFilter.click(function(e) {				
		// add the box to the boxes list
		var process = new Process(selectedProcess.identifier);
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
		var url = escape('http://geowww.agrocampus-ouest.fr/cgi-bin/hswps.cgi?service=wps&request=getcapabilities');
		$.ajax({
			type: 'GET',
			url: proxyURL + url,
			dataType: 'xml',
			success: function(data, textStatus, jqXHR) {
				var xml = data.firstChild;
				
				for(var i=0, j=xml.children.length; i<j; i++) {
					var child = xml.children[i];
					
					// we want the process
					if(child.nodeName === "wps:ProcessOfferings") {
						var $listProcess = $('#list-process');
						$listProcess.html('');
						
						for(var k=0, l=child.children.length; k<l; k++) {
							var process = child.children[k],
								identifiers = process.getElementsByTagName('Identifier'), identifier = '',
								titles = process.getElementsByTagName('Title'), title = ''
							
							if(identifiers.length > 0) {
								identifier = identifiers[0].textContent;
							}
							
							if(titles.length > 0) {
								title = titles[0].textContent;
							}
							
							var $li = $('<li>' + identifier + '</li>');

							var p = {
								'identifier': identifier,
								'title': title,
								'$el': $li
							};

							$li.click((function($li, p) {
								return function() {
									var $this = $(this);
									
									if(selectedProcess) {
										selectedProcess.$el.css('color', 'black');
									}
									
									p.$el.css('color', 'red');
									selectedProcess = p;
									
									if(!p.inputs) {
										describeProcess(p);
									}
								}
							})($li, p));
							
							$listProcess.append($li);
							
							processes.push(p);
						}
					}
				}
			},
			error: function(e) {
				// fail silently
			}	
		});
	}
	
	var describeProcess = function(process) {
		var url = escape('http://geowww.agrocampus-ouest.fr/cgi-bin/hswps.cgi?service=wps&request=DescribeProcess&version=1.0.0&identifier=' + process.identifier);
		$.ajax({
			type: 'GET',
			url: proxyURL + url,
			dataType: 'xml',
			success: function(data, textStatus, jqXHR) {
				var xml = data.firstChild
					dataInputs = xml.getElementsByTagName('DataInputs'),
					processOutputs = xml.getElementsByTagName('ProcessOutputs'),
					inputs = [];
				
				if(dataInputs.length > 0) {
					dataInputs = dataInputs[0];
					
					for(var i=0, j=dataInputs.children.length; i<j; i++) {
						var input = dataInputs.children[i],
							name = input.getElementsByTagName('Identifier');
						
						if(name.length > 0) {
							inputs.push(name[0].textContent);
						}
					}
					
					process.inputs;
				}
			},
			error: function(e) {
				// fail silently
			}	
		});
	}
	
	$('#get-capabilities').click(function() {
		getCapabilities();
	});
	
});