<?php

//busca datas selecionadas
$data_inicio = $_GET['data_inicio'];
$data_fim = $_GET['data_fim'];

//busca as horas selecionadas
$hora_inicio = $_GET['hora_inicio'];
$hora_fim = $_GET['hora_fim'];

//busca tipo de poligonos utilizados
$tipo_roi = explode('_', $_GET['tipo_roi'])[1];

//busca origens selecionadas
$aux_origens_selecionadas = $_GET['origens_selecionadas'];
$origens = str_replace("]", ")", str_replace("[", "(", str_replace("\"", "", $aux_origens_selecionadas)));

//busca destinos selecionados
$aux_destinos_selecionados = $_GET['destinos_selecionados'];
$destinos = str_replace("]", ")", str_replace("[", "(",  str_replace("\"", "", $aux_destinos_selecionados)));

//busca sexo
$sexo = $_GET['sexo'];
$sql_sexo = '';

switch($sexo){
	
	case 1:
		//feminino
		$sql_sexo = " and upper(cartao_sexo) = 'F' ";
	break;
	
	case 2:
		//masculino
		$sql_sexo = " and upper(cartao_sexo) = 'M' ";
	break;
	
	case 3:
		//nao informado
		$sql_sexo = " and cartao_sexo is null or trim(cartao_sexo) = '' ";
	break;
}

//busca idade
$idade = $_GET['idade'];
$sql_idade = '';

switch($idade){
	
	case 1:
		//menores de 5 anos
		$sql_idade = " and idade >= 0 and idade < 5 ";
	break;
	
	case 2:
		//de 5 até 12 anos
		$sql_idade = " and idade >= 5 and idade < 12 ";
	break;
	
	case 3:
		//de 12 até 18 anos
		$sql_idade = " and idade >= 12 and idade < 18 ";
	break;
	
	case 4:
		//de 18 até 65 anos
		$sql_idade = " and idade >= 18 and idade < 65 ";
	break;
	
	case 5:
		//de 65 em diante
		$sql_idade = " and idade >= 65 ";
	break;
	
	case 6:
		//idade menor que zero
		$sql_idade = " and idade < 0 ";
	break;
	
	case 7:
		//idade não informada
		$sql_idade = " and idade is null ";
	break;
}

//monta o sql
$sql = 	"select movimentacoes.cartao_sexo, 
				movimentacoes.idade, 
				movimentacoes.cartao_data, 
				to_char(movimentacoes.cartao_datahora, 'DD/MM/YYYY, HH24h') as datahora_formatada, 
			    movimentacoes.origem_lat, movimentacoes.origem_lng,
				movimentacoes.destino_lat, movimentacoes.destino_lng
		from
		(
			select id, roi as contornoPg 
			from transporte_dinamico.yp_rois
			where id in " . $origens ."
		) origens,
		(
			select  id, roi as contornoPg
			from transporte_dinamico.yp_rois
			where id in " . $destinos .
		") destinos,
		(
			select *
			from transporte_dinamico.np_movimentacao
			where cartao_data between '" . $data_inicio . "' and '" . $data_fim . "'
				and cartao_hora between '" . $hora_inicio . "' and '" . $hora_fim . "' " .
				$sql_sexo . $sql_idade . "
		) movimentacoes
		where st_Contains(origens.contornoPg, movimentacoes.origem) 
		and st_Contains(destinos.contornoPg, movimentacoes.destino) 
		order by 1 asc";


$conexao = pg_connect('host=localhost port=5435 dbname=bigsea user=postread password=PostRead');

$resultado = pg_query($conexao, $sql);

$rows = [];		
while ($row = pg_fetch_assoc($resultado)) {
	$rows[] = $row;
}

pg_close($conexao);

header('Content-type:application/json;charset=utf-8');
echo json_encode($rows);
//echo $sql;
