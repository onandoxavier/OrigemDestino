<?php

$sql = "select lat, lng from transporte_dinamico.yp_pontos_onibus";
	
$conexao = pg_connect('host=localhost port=5435 dbname=bigsea user=postread password=PostRead');

$resultado = pg_query($conexao, $sql);

$rows = [];		
while ($row = pg_fetch_assoc($resultado)) {
	$rows[] = $row;
}

pg_close($conexao);

header('Content-type:application/json;charset=utf-8');
echo json_encode($rows);
