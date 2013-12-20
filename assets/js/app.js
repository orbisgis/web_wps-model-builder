/**
 * Config file for requireJs
 */
requirejs.config({
	paths: {
		'underscore': 'vendor/underscore-min',
		'jquery': 'vendor/jquery-2.0.3.min',
		'SVG': 'svg/SVG'
	},
	config: {
		'WPS/WPSServer': {
			'url-proxy': 'http://localhost/wps/lib/proxy.php?url={url}',
		},
		'WPS/WPSManager': {
			'wps-server': 'http://localhost/wps/lib/serveurs.json'
		}
	}

});

/**
 TODO: 
 [x] Ajouter des serveurs
 [x] Export vers un fichier XML
 [ ] Hover sur le titre du input pour afficher le type
 [ ] afficher info du point de sortie
 [x] Bug buffer x2
 [ ] Meilleur gestion des littéraux (string-choice, xs:...)
 [x] Vérifier le minOccurs/maxOccurs
 [x] Supprimer process et pas que les box!
 [ ] Supprimer les litteraux
 [x] Vérifier qu'un serveur n'apparait pas deux fois dans la liste
 [ ] Enlever la dépendance DOM dans WPSManager
 [ ] Dépendance de SVG problématique
 [x] Utiliser les Events Backbone
*/

/**
 * Main module. Call the render methode from the view.
 */
require(['view'], function(view) {
	view.render();
})