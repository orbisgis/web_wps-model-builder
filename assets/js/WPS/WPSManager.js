define([
	'module',
	'jquery',
	'underscore',
	'WPS/WPSParser',
	'popup/SplashScreen', 
	'process/process', 
	'process/data'
], function(module, $, _, WPSParser, splashScreen, Process, ProcessData) {
	var proxyURL = module.config()['url-proxy'];
	var DEFAULT_VERSION = '1.0.0';
	var DEFAULT_SERVICE = 'WPS';

	function getQueryParams(qs) {
	    qs = qs.split("+").join(" ");

	    var params = {}, 
	    	tokens,
	        re = /[?&]?([^=]+)=([^&]*)/g;

	    while (tokens = re.exec(qs)) {
	        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	    }

	    return params;
	}

	function WPSManager(url) {
		// check the url
		var a = document.createElement('a');
		a.href = url;

		this._hostname = a.hostname;

		// create the correct url
		this._url = a.protocol + '//' + a.hostname + ':' + a.port + a.pathname;

		// get parameters from url
		var args = url.substring(this._url.length),
			params = getQueryParams(args);

		// get parameters we need
		this._params = {
			'version': params['version'] || DEFAULT_VERSION,
			'service': params['service'] || DEFAULT_SERVICE
		};

		this._processes;
	}

	WPSManager.prototype.getHostname = function() {
		return this._hostname;
	}

	WPSManager.prototype.getURL = function(args) {
		var url = [];

		_.each(_.extend(this._params, args), function(value, key, list) {
			url.push(key + "=" + value);
		});

		return proxyURL.replace('{url}', escape(this._url + '?' + url.join('&')));
	}

	WPSManager.prototype.getCapabilities = function(callback) {
		if(!this._processes) {
			// show the splash screen 
			splashScreen.show('GetCapabilities: ' + this._url);
			// create the URL
			var url = this.getURL({
				'request': 'GetCapabilities'
			});
			// call the URL
			$.ajax({
				type: 'GET',
				url: url,
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
		if(this._processes && this._processes[identifier]) {
			splashScreen.show('DescribeProcess: ' + identifier);
			var url = this.getURL({
				'request': 'DescribeProcess',
				'identifier': identifier
			});

			$.ajax({
				type: 'GET',
				url: url,
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