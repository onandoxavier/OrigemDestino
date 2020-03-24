<?php

//a unidade de medida inserida em ST_Buffer e ST_DWithin é
//0.01 -> 1km
//0.004 -> 400m
//0.001 -> 100m

$requisicao = $_GET['tipoRequisicao'];

$conexao = pg_connect('host=localhost port=5435 dbname=bigsea user=postread password=PostRead');

if($requisicao == "pois")
{
	$tipo = $_GET['tipoPoi'];
	$subTipo = $_GET['subTipo'];
	
	if($tipo == 1)
		$tipoValue = "'EDUCAÇÃO'";
	else if($tipo == 2)
		$tipoValue = "'SAÚDE'";
	else if($tipo == 3)
		$tipoValue = "'TRANSPORTE'";
	
	$filtro = 'a';
	
	//tipo 1 escola 2 saude
	if($tipo == 1)	
	{
		if($subTipo == 1)
		{	
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois"	where tipo = '. $tipoValue .'';
			
			$resultado = pg_query($conexao, $sql);
		}
		else
		{
			switch ($subTipo) 
			{
				case 2:
					$filtro = "'Educação Básica'";
					break;
				case 3:
					$filtro = "'Educação de Jovens e Adultos'";
					break;
				case 4:
					$filtro = "'Educação Especial'";
					break;
				case 5:
					$filtro = "'Educação Infantil'";
					break;
				case 6:
					$filtro = "'Educação Profissional Técnica'";
					break;
				case 7:
					$filtro = "'Educação superior'";
					break;
				case 8:
					$filtro = "'Educação Superior'";
					break;
				case 9:
					$filtro = "'Ensino Fundamental'";
					break;
				case 10:
					$filtro = "'Ensino Médio Total'";
					break;
				case 11:
					$filtro = "'Regional Administrativa'";
					break;
				case 12:
					$filtro = "'Vinculado à Escola'";
					break;
			}
			
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois" where sub_tipo = '. $filtro .'';
			
			//$resultado = pg_query($conexao, $sql);
		}
	}
	else if($tipo == 2)	
	{
		if($subTipo == 1)
		{	
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois" where tipo = '. $tipoValue .'';
			$resultado = pg_query($conexao, $sql);
		}
		else
		{
			switch ($subTipo) 
			{
				case 2:
					$filtro = "'Álcool e Drogas'";
					break;
				case 3:
					$filtro = "'Distrito Sanitário de Saúde'";
					break;
				case 4:
					$filtro = "'Especializada em Saúde Mental'";
					break;
			}
			
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois" where sub_tipo = '. $filtro .'';
			
			//$resultado = pg_query($conexao, $sql);
		}
	}
	else if($tipo == 3)	
	{
		if($subTipo == 1)
		{	
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois" where tipo = '. $tipoValue .'';
			$resultado = pg_query($conexao, $sql);
		}
		else
		{
			switch ($subTipo) 
			{
				case 2:
					$filtro = "'Estação de Ônibus'";
					break;
				case 3:
					$filtro = "'Terminal Rodoferroviário'";
					break;			
			}
			
			$sql = 'select id, nome, contorno, latitude, longitude from public."1656155pois" where sub_tipo = '. $filtro .'';
			
			//$resultado = pg_query($conexao, $sql);
		}
	}	
	
	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) {
		$rows[] = $row;
	}
	
	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);
	//echo json_encode($sql);
}
else if ($requisicao == "subtipo")
{
	$tipo = $_GET['tipo'];
	$tipoValue = '';
	
	if($tipo == 1)
		$tipoValue = "'EDUCAÇÃO'";
	else if($tipo == 2)
		$tipoValue = "'SAÚDE'";
	else if($tipo == 3)
		$tipoValue = "'TRANSPORTE'";
	
	$sql = 'select distinct sub_tipo as sub from public."1656155pois" where tipo = '. $tipoValue .'  order by sub_tipo';
	//$sql = 'select distinct sub_tipo as sub from public."1656155pois" order by sub_tipo';
	$resultado = pg_query($conexao, $sql);

	$rows = [];		
	while ($row = pg_fetch_assoc($resultado)) 
	{
		$rows[] = $row;
	}
	
	pg_close($conexao);

	header('Content-type:application/json;charset=utf-8');
	echo json_encode($rows);
}
else{
	
	pg_close($conexao);
	echo json_encode($requisicao);
}
