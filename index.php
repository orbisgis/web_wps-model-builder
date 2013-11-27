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
				background-image: url(https://www.draw.io/images/grid.gif); 
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
				</div>

				<div id="svg-container" class="span10">
				</div>
			</div>
		</div>
		
		<script src="<?php echo $prefix_adresse ?>assets/js/jquery-2.0.3.min.js"></script>
		<script src="<?php echo $prefix_adresse ?>assets/js/SVG.js"></script>
		<script src="<?php echo $prefix_adresse ?>assets/js/svg.draggable.js"></script>
		<script src="<?php echo $prefix_adresse ?>assets/js/box.js"></script>
		<script src="<?php echo $prefix_adresse ?>assets/js/main.js"></script>
	</body>
</html>