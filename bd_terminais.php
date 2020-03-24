<?php

$requisicao = $_GET['tipoRequisicao'];

$conexao = pg_connect('host=localhost port=5435 dbname=bigsea user=postread password=PostRead');

if($requisicao == "terminaispois"){
	$sql = "select teste.id, teste.nome, teste.lat, teste.lng 
			from (
				select *
				from transporte_dinamico.yp_terminais as origin	
			)teste
			where st_Contains(
				ST_Buffer( ST_MakePoint(-25.438192875583603, -49.268074990671415), 0.004), ST_MakePoint(teste.lat, teste.lng)
			)";
	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) {
		$rows[] = $row;
	}

	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);
}else if ($requisicao == "terminaispoisdwithin"){
	
	
	$sql = "select teste.id, teste.nome, teste.lat, teste.lng 
			from (
				select *
				from transporte_dinamico.yp_terminais as origin	
			)teste
			where ST_DWithin( ST_MakePoint(-25.438192875583603, -49.268074990671415), ST_MakePoint(teste.lat, teste.lng), 0.004
			)";
	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) {
		$rows[] = $row;
	}

	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);	

}else if ($requisicao == "contorno"){
	$sql = "select ST_AsGeoJSON(ST_Buffer( ST_MakePoint(-25.438192875583603, -49.268074990671415), 0.01)) as contorno, ST_Buffer( ST_MakePoint(-25.438192875583603, -49.268074990671415), 0.01) as geometria";
	
	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) {
		$rows[] = $row;
	}

	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);
}else{
	$sql = "select id, nome, lat, lng from transporte_dinamico.yp_terminais";

	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) {
		$rows[] = $row;
	}

	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);
}

?>

