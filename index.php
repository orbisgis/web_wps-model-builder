<?php
	$prefix_adresse = '/wps/';
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>WPS</title>
		
		<link href="<?php echo $prefix_adresse ?>assets/css/bootstrap.min.css" rel="stylesheet" media="screen">
		
		<style>
			#svg-container {
				border: 1px solid rgb(202, 202, 202); 
				overflow: hidden; 
				background-color: white; 
				background-image: url(<?php echo $prefix_adresse ?>assets/img/grid.gif); 
				width: 800px; 
				height: 400px;
			};
		</style>
	</head>
	<body>		
		<div class="container-fluid">
			<div class="row-fluid">
				<div class="span2">
					<button id="add-filter">Ajouter un filtre</button>
					<button id="delete-filter">Supprimer un filtre</button>
					<button id="add-link">Ajouter un lien</button>
					<br />
					<span id="selected-box"></span>
					<br />
					<select id="list-process"></select> 
					<br />
					<div id="process-description"></div>
				</div>

				<div id="svg-container" class="span10">
				</div>
			</div>
		</div>

		<div id="splash-screen"></div>
		
		<script data-main="assets/js/main" src="<?php echo $prefix_adresse ?>assets/js/require.js"></script>
		<script>
			requirejs.config({
				paths: {
					'jquery': 'jquery/jquery-2.0.3.min',
					'SVG': 'svg/SVG'
				}
			});
		</script>
	</body>
</html>