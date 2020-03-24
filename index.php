<!DOCTYPE html>
<html>
    <head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
        <meta charset="utf-8">
        <title>Origem Destino</title>
		
		<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
		
		<link rel="stylesheet" type="text/css" href="css/bootstrap-datepicker.css">
		<link rel="stylesheet" type="text/css" href="css/bootstrap-timepicker.css">
		
		<link rel="stylesheet" type="text/css" href="css/leaflet.css"/>
		<link rel="stylesheet" type="text/css" href="css/MarkerCluster.css" />
		<link rel="stylesheet" type="text/css" href="css/MarkerCluster.Default.css" />
				
		<script src="js/jquery-3.3.1.min.js" charset="UTF-8"></script>
		<script src="js/bootstrap.min.js"></script>
		
		<script src="js/bootstrap-timepicker.js" charset="UTF-8"></script>
		<script src="js/bootstrap-datepicker.js" charset="UTF-8"></script>
		<script src="js/locales/bootstrap-datepicker.pt-BR.min.js" charset="UTF-8"></script>
		
		<script src="js/Chart.bundle.js"></script>
		<script src="js/utils.js"></script>
		
		<script src="js/proj4.js"></script>
		
		<link href="css/new_estilos.css" rel="stylesheet">
    </head>
	<body>
	
		<div class="modal">
			<div class="center">
				<img src="images/loader.gif" />
			</div>
		</div>
	
		<div id="all">
			<div id="left">
				<?php include 'tela_painel.php'; ?>
				<div id="map"></div>
			</div>
			
			<div id="right">
				<div class="row row-custom">  
					<div class="col-xs-6">
						<canvas id="um" width="100" height="35"></canvas>
					</div>
					<div class="col-xs-6">
						<canvas id="dois" width="100" height="35"></canvas>
					</div>
				</div>
				
				<div class="row row-custom">
					<div class="col-xs-12">
						<canvas id="tres" width="200" height="60"></canvas>
					</div>
				</div>
				
				<div class="row row-custom">
					<div class="col-xs-12">
						<canvas id="quatro" width="200" height="45"></canvas>
					</div>
				</div>
				
				<div class="row row-custom">
					<div class="col-xs-12">
						<canvas id="cinco" width="200" height="60"></canvas>
					</div>
				</div>			
				
			</div>
		
		<script src="js/leaflet.js"></script>
		<!--<script src="./lib/leaflet.js"></script>-->
		<!--<script src="leaflet/leaflet.js"></script>-->
		
		<script src="js/leaflet-heat.js"></script>
		
		<script src='js/leaflet.markercluster.js'></script>
		
		<script src='./src/src.js'></script>

		<script src='index-main.js'></script>
		
		<script>
			
			//por padrão, deixa o painel escondido
			$("#todo").hide();
			
			$("#floating-panel-toggle").click(function() {
				$("#todo").slideToggle( "slow", function() {});
			});			
			
		</script>
  </body>
</html>