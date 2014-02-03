define([
	'module',
	'jquery',
	'underscore',
	'process/Model',
	'WPS/WPSParser',
	'WPS/WPSProcess'
], function(module, $, _, Model, WPSParser, WPSProcess) {
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

	function WPSServer(url) {
		// check the url
		var a = document.createElement('a');
		a.href = url;

		var url = a.protocol + '//' + a.hostname + ':' + a.port + a.pathname,
			args = url.substring(url.length),
			params = getQueryParams(args);

		this.attributes = {
			uid: _.uniqueId('server_'),
			hostname: a.hostname,
			url: url,
			version: params['version'] || DEFAULT_VERSION,
			service: params['service'] || DEFAULT_SERVICE,
			processes: {},
			ready: false
		};
	}

	WPSServer.prototype = new Model();

	WPSServer.prototype.createURL = function(args) {
		var parameters = [];

		_.each(
			_.extend({ 
				version: this.get('version'), 
				service: this.get('service')
			}, args), 
			function(value, key, list) {
				parameters.push(key + "=" + value);
			}
		);

		return proxyURL.replace('{url}', escape(this.get('url') + '?' + parameters.join('&')));
	}

	WPSServer.prototype.getCapabilities = function(callback) {
		if(this.get('ready')) {
			// we dont need to reload the server informations
			callback("", this.get('processes'));
		} else {
			// create the URL
			var url = this.createURL({
				'request': 'GetCapabilities'
			});
			// call the URL and get informations about this server.
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'xml',
				context: this,
				success: function(data) {
					// get processes
					var processes = this.get('processes'),
						capabilities = WPSParser.parseGetCapabilities(data.firstChild);
				
					_.each(capabilities.processOfferings, function(process) {
						if(process && process.identifier) {
							processes[process.identifier] = process;
							process['ready'] = false;
						}
					}, this);

					// the server is ready
					this.set('ready', true);
					// call the callback function
					callback("", processes);
				},
				error: function() {
					callback("Impossible de se connecter au serveur " + this.getDisplayName(true) + " pour avoir des informations.");
				}	
			});
		}		
	}

	WPSServer.prototype.describeProcess = function(identifier, callback) {
		if(!this.get('ready')) {
			callback("Le serveur " + this.getDisplayName(true) + " n'est pas encore près.");
			return;
		}

		if(!this.getProcess(identifier).ready) {
			var url = this.createURL({
				'request': 'DescribeProcess',
				'identifier': identifier
			});

			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'xml',
				context: this,
				success: function(data) {					
					var process = this.getProcess(identifier),
						description = WPSParser.parseDescribeProcess(data.firstChild);

					process.inputData = description.dataInputs;
					process.outputData = description.processOutputs;

					process['ready'] = true;
					callback("", process);
				},
				error: function(e) {
					callback("Impossible d'avoir les information sur <strong>" + identifier + "</strong>");
				}	
			});
		} else {
			callback("", this.getProcess(identifier));
		}
	}

	WPSServer.prototype.getProcess = function(identifier) {
		return this.get('processes')[identifier];
	}

	WPSServer.prototype.createProcess = function(identifier) {
		if(this.getProcess(identifier)) {
			var process = new WPSProcess(this.getProcess(identifier));
			process.set('serverName', this.get('uid'));

			return process; 
		}
	};

	WPSServer.prototype.getDisplayName = function(strong) {
		return (strong ? "<strong>" : "") + this.get('hostname') + (strong ? "</strong>" : "");
	}

	return WPSServer;
});