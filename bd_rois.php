<?php

$tipo_roi = explode("_", $_GET['tipo_roi']);

$sql = '';

switch($tipo_roi[0]){
	
	case 'cluster':
		$sql = "select id, nome, contorno from transporte_dinamico.yp_rois where tipo = '" . $tipo_roi[0] . "' and codigo = " . $tipo_roi[1];
	break;
	
	default: //bairro ou regional
		$sql = "select id, nome, contorno from transporte_dinamico.yp_rois where tipo = '" . $tipo_roi[0] . "'";
	break;
	
}
	
$conexao = pg_connect('host=localhost port=5435 dbname=bigsea user=postread password=PostRead');

$resultado = pg_query($conexao, $sql);

$rows = [];		
while ($row = pg_fetch_assoc($resultado)) {
	$rows[] = $row;
}

pg_close($conexao);

header('Content-type:application/json;charset=utf-8');
echo json_encode($rows);
