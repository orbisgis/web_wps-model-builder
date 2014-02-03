WPS
===

Enchaînement de processus à l'aide d'un navigateur Web. Cette enchainement est appliqué au format WPS.

# Utilisation

Création d'un process à l'aide la classe `process/Process.js`. Création d'une box personnaliser à l'aide de la classe `process/Box.js`. 

# WPS

Utilisation du logiciel GeoServer afin de développer en local
http://geoserver.org/display/GEOS/Stable

Utilisation d'un proxy (en PHP) afin de pouvoir effectuer des requêtes AJAX sur les serveurs WPS distants. Ensuite le parseur WPS (`WPS/WPSParser.js`) convertie le format XML en un objet Javascript.

# Librairies annexes

 - jQuery (version 2.0.3) : manipulation du DOM, Events et Ajax
 - Bootstrap (version 2.3.2) : CSS de base pour développer
 - Backbone (version 1.0.0) : utilisation des classes Events et Model
 - SVG.JS (version 0.32-6-g74614e0) : manipulation des objets SVG
 - alertify (version 0.3.11) : système de notification
