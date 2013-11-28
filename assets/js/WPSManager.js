(function() {
	var proxyURL = '';

	function WPSManager(url) {
		this._url = url;
		this.isReady = false;

		this._processes;
		this.getCapabilities();
	}

	WPSManager.setProxyURL = function(url) {
		proxyURL = url;
	}

	WPSManager.prototype.getCapabilities = function() {
		if(!this._processes) {
			var url = escape(this._url + '&request=getcapabilities');
			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
				success: function(data, textStatus, jqXHR) {
					var xml = data.firstChild,
						processesOfferings = xml.getElementsByTagName('ProcessOfferings');

					this._processes = {};
					// check if we have almost one ProcessOfferings
					if(processesOfferings.length > 0) {
						var processesOfferings = processesOfferings[0];
						
						for(var i=0, j=processesOfferings.children.length; i<j; i++) {
							var processOfferings = processesOfferings.children[i],
								identifiers = processOfferings.getElementsByTagName('Identifier'), identifier = '',
								titles = processOfferings.getElementsByTagName('Title'), title = ''
							
							if(identifiers.length > 0) {
								identifier = identifiers[0].textContent;

								if(titles.length > 0) {
									title = titles[0].textContent;
								}

								// save the process
								this._processes[identifier] = {
									'name': identifier,
									'title': title,
									'inputs': [],
									'isReady': false
								};

								this.describeProcess(identifier);
							}
						}
					}

					this.isReady = true;
				},
				error: function(e) {
					// fail silently
				}	
			});
		}
	}

	WPSManager.prototype.describeProcess = function(identifier) {
		if(this._processes && this._processes[identifier] && !this._processes[identifier].isReady) {
			var url = escape(this._url + '&request=DescribeProcess&version=1.0.0&identifier=' + identifier);
			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
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
								this._processes[identifier].inputs.push(name[0].textContent);
							}
						}
					}

					this._processes[identifier].isReady = true;
				},
				error: function(e) {
					// fail silently
				}	
			});
		} else {
			// fail silently
		}
	}

	WPSManager.prototype.getProcesses = function() {
		if(this.isReady) {
			return this._processes;
		}
	}

	WPSManager.prototype.getProcess = function(identifier) {
		return this._processes[identifier];
	}

	window.WPSManager = WPSManager;
})(window);