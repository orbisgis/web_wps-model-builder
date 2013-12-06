define([
	'jquery',
	'underscore',
	'WPS/WPSParser',
	'popup/SplashScreen', 
	'process/process', 
	'process/data'
], function($, _, WPSParser, splashScreen, Process, ProcessData) {
	var proxyURL = '';

	function WPSManager(url) {
		this._url = url;

		this._processes;
	}

	WPSManager.setProxyURL = function(url) {
		proxyURL = url;
	}

	WPSManager.prototype.getCapabilities = function(callback) {
		if(!this._processes) {
			// show the splash screen 
			splashScreen.show('GetCapabilities: ' + this._url);
			// create the URL
			var url = escape(this._url + '&request=GetCapabilities');
			// call the URL
			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
				success: function(data) {
					// get processes
					var capabilities = WPSParser.parseGetCapabilities(data.firstChild);
				
					this._processes = {};
					_.each(capabilities.processOfferings, function(process) {
						if(process && process.identifier) {
							this._processes[process.identifier] = new Process(process);
						}
					}, this);

					// hide the splash screen
					splashScreen.hide();
					// call the callback function
					callback(this._processes);
				},
				error: function() {
					callback();
				}	
			});
		}
	}

	WPSManager.prototype.describeProcess = function(identifier, callback) {
		if(this._processes && this._processes[identifier] && !this._processes[identifier].isReady) {
			splashScreen.show('DescribeProcess: ' + identifier);
			var url = escape(this._url + '&request=DescribeProcess&identifier=' + identifier);

			$.ajax({
				type: 'GET',
				url: proxyURL + url,
				dataType: 'xml',
				context: this,
				success: function(data) {					
					var description = WPSParser.parseDescribeProcess(data.firstChild);

					_.each(description.dataInputs, function(inputData) {
						this._processes[identifier].addInput(new ProcessData(inputData));
					}, this);

					_.each(description.processOutputs, function(outputData) {
						this._processes[identifier].addOutput(new ProcessData(outputData));
					}, this);

					splashScreen.hide();
					callback(this._processes[identifier]);
				},
				error: function(e) {
					callback();
				}	
			});
		} else {
			callback();
		}
	}

	WPSManager.prototype.getProcesses = function() {
		return this._processes;
	}

	WPSManager.prototype.getProcess = function(identifier) {
		return this._processes[identifier];
	}

	return WPSManager;
});