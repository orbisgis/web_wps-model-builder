/**
 * Config file for requireJs
 */
requirejs.config({
	paths: {
		'underscore': 'vendor/underscore-min',
		'jquery': 'vendor/jquery-2.0.3.min',
		'SVG': 'svg/SVG',
		'alertify': 'vendor/alertify'
	},
	config: {
		// proxy : {url} will be replace by the distant url.
		'WPS/WPSServer': {
			'url-proxy': 'http://localhost/wps/lib/proxy.php?url={url}',
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