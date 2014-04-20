/**
 * Config file for requireJs
 */
requirejs.config({
	paths: {
		'underscore': 'vendor/underscore-min',
		'jquery': 'vendor/jquery-2.1.0.min',
		'SVG': 'svg/SVG',
		'alertify': 'vendor/alertify'
	},
	config: {
		// proxy : {url} will be replace by the distant url.
		'WPS/WPSServer': {
			'url-proxy': 'http://localhost/wps/lib/getProxy.php?url={url}',
		},
		// proxy used for POST request
		'WPS/WPSExecute': {
			'proxy': 'http://localhost/wps/lib/postProxy.php',
		},
		// pre-loading servers : must be json array of urls	
		'WPS/WPSManager': {
			'wps-server': 'http://localhost/wps/lib/serveurs.json'
		}
	}
});

/**
 * Main module. Call the render methode from the view.
 */
require(['view'], function(view) {
	view.render();
})