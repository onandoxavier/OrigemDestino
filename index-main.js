//cria um mapa e adiciona as camadas OSM e markercluster
var map = new L.Map('map', {
  center: {lat: -25.4909541, lng: -49.315137},
  zoom: 12
});

//define informações para buscar camada de fotos do OSM
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

//cria camada de imagens do OSM
var camada_OSM = L.tileLayer(osmUrl, {opacity: 1});

//adiciona camada no mapa
map.addLayer(camada_OSM);

//adiciona escala no mapa
L.control.scale({metric: true, imperial: false}).addTo(map);

//cria uma camada de heatmap
var heatmap = L.heatLayer().setOptions({
	max: 1,
	radius: 25,
	blur: 15
});

//cria uma camada de heatmap
var heatmapEmbDesembA = L.heatLayer().setOptions({
	max: 0.5,
	radius: 25,
	blur: 5
});

var heatmapEmbDesembB = L.heatLayer().setOptions({
	max: 0.5,
	radius: 25,
	blur: 5
});

var myMapColor = new Map();
myMapColor.set(0, "#0000FF");
myMapColor.set(1, "#006400");
myMapColor.set(2, "#A020F0");
myMapColor.set(3, "#FF0000");
myMapColor.set(4, "#FFFF00");
myMapColor.set(5, "#FFA500");
myMapColor.set(6, "#10ff33");
myMapColor.set(7, "#0aff84");
myMapColor.set(8, "#05ffd9");
myMapColor.set(9, "#00ccff");


//cria uma camada para o marker clusterer
var markerClusterEmbDesemb = L.markerClusterGroup({
	//número de marcadores para virar um cluster
	maxClusterRadius: 25,
	//permite explorar os clusters até visualizar todos os marcadores que os compõem
	spiderfyOnMaxZoom: true,
	//mostrar área de clusterização
	showCoverageOnHover: false,
	//abre o cluster clicado e ajusta o zoom
	zoomToBoundsOnClick: true,
});

//cria uma camada para o marker clusterer
var markerCluster_pontos = L.markerClusterGroup({
	//número de marcadores para virar um cluster
	maxClusterRadius: 50,
	//permite explorar os clusters até visualizar todos os marcadores que os compõem
	spiderfyOnMaxZoom: true,
	//mostrar área de clusterização
	showCoverageOnHover: false,
	//abre o cluster clicado e ajusta o zoom
	zoomToBoundsOnClick: true,
});

//inicializa variáveis para visualização de polígonos e terminais
var poligonos = [];
var terminais = [];
var marcadores_pontos_onibus = [];

var fluxo = [];
var migrationLayer;

//controla o plot de pontos no mapa - pontos verdes
var pre_pois = [];

//controla selecionados/contorno
var contornoPoisOrigem = [];
var contornoPoisDestino = [];

//armazena a geometria dos pois selecionados para a pesquisa
var geopois = [];

//inicializa variáveis para uso em 'pesquisar' e em gráficos
var sum, origens_selecionadas, destinos_selecionados;//, pois_selecionados;
var grafico;

//cria os vetores que guardarão a lista de pontos de embarques e de desembarque
var ponto;
var pontos_embarque = [];
var pontos_desembarque = [];
var marcadores_embarque = [];
var marcadores_desembarque = [];
var tipoOrigemPois;
var retorno = [];

//inicializa variáveis de sessão
sessionStorage.setItem('origens_selecionadas', '[]');
sessionStorage.setItem('destinos_selecionados', '[]');
sessionStorage.setItem('pois_selecionados', '[]');

//inicializa gráficos
ctx1 = document.getElementById("tres").getContext('2d');
ctx2 = document.getElementById("quatro").getContext('2d');
ctx3 = document.getElementById("um").getContext('2d');
ctx4 = document.getElementById("dois").getContext('2d');
ctx5 = document.getElementById("cinco").getContext('2d');

grafico_linhas_embarque_sexo_hora = new Chart(ctx1, {
	type: 'line',
	options: {
		title: {
			display: true,
			text: 'EMBARQUES POR SEXO AO LONGO DO PERIODO'
		},
		scales: {
			xAxes: [{
				ticks: {
					callback: function(dataLabel, index) {
						return index % 2 === 0 ? dataLabel : '';
					},
					fontSize: 8
				}
			}],
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});

grafico_linhas_embarque_faixa_etaria_hora = new Chart(ctx5, {
	type: 'line',
	options: {
		title: {
			display: true,
			text: 'EMBARQUES POR FAIXA ETÁRIA AO LONGO DO PERIODO'
		},
		scales: {
			xAxes: [{
				ticks: {
					callback: function(dataLabel, index) {
						return index % 2 === 0 ? dataLabel : '';
					},
					fontSize: 8
				}
			}],
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});

grafico_barras_idade = new Chart(ctx2, {
	type: 'bar',
	options: {
		title: {
			display: true,
			text: 'TOTAL DE EMBARQUES POR IDADE'
		},
		scales: {
			xAxes: [{
				ticks: {
					callback: function(dataLabel, index) {
						return index % 2 === 0 ? dataLabel : '';
					}
				}
			}],
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});;

grafico_barras_faixa_etaria = new Chart(ctx3, {
	type: 'horizontalBar',
	options: {
		title: {
			display: true,
			text: 'TOTAL DE EMBARQUES POR FAIXA ETÁRIA'
		},
		legend: {
			display: false
		},
		scales: {
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});

grafico_barras_sexo = new Chart(ctx4, {
	type: 'horizontalBar',
	options: {
		title: {
			display: true,
			text: 'TOTAL DE EMBARQUES POR SEXO'
		},
		legend: {
			display: false
		},
		scales: {
			yAxes: [{
				ticks: {
					suggestedMin: 0
				}
			}]
		}
	}
});

function mudaPoligonos() {
		
	var tipo_roi = $('#tipo_roi').val();
	
	//se o tipo_roi for equivalente a nenhum, remove todos os polígonos do mapa
	if (tipo_roi == 0){
		removePoligonosDoMapa();
		return 0;
	}
	
	$.ajax({
		type:'get',
		url:'bd_rois.php',
		dataType: 'json',
		contentType: "application/json;charset=utf-8",
		data: {"tipo_roi": tipo_roi},
		success: function(contornos){
			
			//remove poligonos que estejam no mapa
			removePoligonosDoMapa();
			
			//adiciona os poligonos recem retornados do banco
			adicionaPoligonosNoMapa(contornos);
			
			//define acoes para cada poligono
			defineAcoesNosPoligonos();
		}
	});
}

function removePoligonosDoMapa(){
	
	//limpa listas armazenadas na sessão
	sessionStorage.setItem('origens_selecionadas', '[]');
	sessionStorage.setItem('destinos_selecionados', '[]');
	
	//remove rois do mapa
	$.each(poligonos, function (i, poligono) {
		map.removeLayer(poligono);
	});	
	
	//limpa o array
	poligonos = [];
}

function adicionaPoligonosNoMapa(aux_contornos){
	
	var poligono;
					
	//itera a lista de rois
	$.each(aux_contornos, function (i, aux_contorno) {
										
		//cria poligono
		poligono = L.polygon(eval(aux_contorno.contorno),{
			stroke: true,
			color: 'grey',
			opacity: true,
			opacity: 0.8,
			weight: 2,
			fillColor: 'grey',
			fillOpacity: 0.35,
			id: aux_contorno.id,
			descricao: aux_contorno.nome,
			tipo_selecao: 0 //se está selecionado como origem (1), como destino (2) ou como ambos (3)
		});
		
		//adiciona poligono no mapa
		map.addLayer(poligono);
		
		//adiciona o poligono na lista de rois
		poligonos.push(poligono);
	});	
}

function defineAcoesNosPoligonos(){
	
	$.each(poligonos, function (i, poligono) {
		
		//mouse clicando
		poligono.on('click', function (e) {
			
			L.popup().setLatLng(poligono.getBounds().getCenter()).setContent(poligono.options.descricao).openOn(map);
			
			var utm = "+proj=utm +zone=22 +south +ellps=GRS67 +units=m +no_defs";
			var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
			
			//verifica se o usuario deseja selecionar origens ou destinos
			var acao = sessionStorage.getItem('acao');
			
			switch(acao){
				
				case 'origem':
				
					//busca lista da sessão
					var origens_selecionadas = JSON.parse(sessionStorage.getItem('origens_selecionadas'));
					
					//se a origem selecionada já estiver na lista de origens selecionadas
					if($.inArray(this.options.id, origens_selecionadas) >= 0){
						
						//remove o item da lista
						origens_selecionadas.splice($.inArray(this.options.id, origens_selecionadas),1);

						//verifica qual era o status do polígono
						if (this.options.tipo_selecao == '3'){
							
							//seta cor de destino selecionado
							this.setStyle({color: 'red', fillColor: 'red', tipo_selecao: '2'});
							
						}else{
							
							//seta cor de não selecionado
							this.setStyle({color: 'grey', fillColor: 'grey', tipo_selecao: '0'});
						}
															
					}else{
						
						//não está na lista: adicioná-lo
						origens_selecionadas.push(this.options.id);
						
						//verifica qual era o status do polígono
						if (this.options.tipo_selecao == '2'){
							
							//seta cor de destino selecionado
							this.setStyle({color: 'green', fillColor: 'green', tipo_selecao: '3'});
							
						}else{
							
							//seta cor de não selecionado
							this.setStyle({color: 'blue', fillColor: 'blue', tipo_selecao: '1'});
						}
						
					}
					
					sessionStorage.setItem('origens_selecionadas', JSON.stringify(origens_selecionadas));
					
				break;
				
				case 'destino':
				
					//busca lista da sessão
					var destinos_selecionados = JSON.parse(sessionStorage.getItem('destinos_selecionados'));
					
					//se o destino selecionado já estiver na lista de destinos selecionados
					if($.inArray(this.options.id, destinos_selecionados) >= 0){
						
						//remove o item da lista
						destinos_selecionados.splice($.inArray(this.options.id, destinos_selecionados), 1);
						
						//verifica qual era o status do polígono
						if (this.options.tipo_selecao == '3'){
							
							//seta cor de origem selecionada
							this.setStyle({color: 'blue', fillColor: 'blue', tipo_selecao: '1'});
							
						}else{
							
							//seta cor de não selecionado
							this.setStyle({color: 'grey', fillColor: 'grey', tipo_selecao: '0'});
						}
															
					}else{
						
						//não está na lista: adicioná-lo
						destinos_selecionados.push(this.options.id);
						
						//verifica qual era o status do polígono
						if (this.options.tipo_selecao == '1'){
							
							//seta cor de destino selecionado
							this.setStyle({color: 'green', fillColor: 'green', tipo_selecao: '3'});
							
						}else{
							
							//seta cor de não selecionado
							this.setStyle({color: 'red', fillColor: 'red', tipo_selecao: '2'});
						}
						
					}
					
					sessionStorage.setItem('destinos_selecionados', JSON.stringify(destinos_selecionados));	
					
				break;
					
			}
			
		});
	});
}

function limpaMapa(){
							
	//limpa listas armazenadas na sessão
	sessionStorage.setItem('origens_selecionadas', '[]');
	sessionStorage.setItem('destinos_selecionados', '[]');
	
	//itera a lista de itens já selecionados para todos os contornos de bairros do mapa
	$.each(poligonos, function (i, poligono) {
		this.setStyle({color: 'grey', fillColor: 'grey'});
	});
	
}

function mudaTerminais() {
	
	var opcao_terminais = Number($('#opcao_terminais').val());
	//debugger;
	switch(opcao_terminais){
		
		case 0:
			//sem terminais
			removeTerminais();
		break;
		
		case 1:
			//com terminais
			adicionaTerminais();
		break;
	}
}

function adicionaTerminais() {
	
	var ponto;
	
	var icone = L.icon({
					iconUrl: "images/blue.png",
					iconSize: [15, 15]
				});
	
	$.ajax({
		type:'get',
		url:'bd_terminais.php',
		dataType: 'json',
		contentType: "application/json;charset=utf-8",
		data: {
				tipoRequisicao: "terminais"
			},
		success: function(lista_terminais){
			
			$.each(lista_terminais, function (i, terminal) {
			
				//cria o marcador
				ponto = L.marker({lat: terminal.lat, lng: terminal.lng}, {icon: icone}).addTo(map);
				
				//adiciona na lista de terminais
				terminais.push(ponto);
			});	
		}
	});
}

function removeTerminais(){
	
	//itera a lista de terminais
	$.each(terminais, function (i, terminal) {
			
		//remove o terminal do mapa
		map.removeLayer(terminal);
	});	
}

function mudaPontosOnibus() {
		
	//obtém a opção escolhida
	var opcao_pontos_onibus = Number($('#opcao_pontos_onibus').val());
	
	//remove do mapa quaisquer visualizações de pontos de ônibus
	limpaPontosOnibus();
	
	switch(opcao_pontos_onibus){
		
		case 1: 
			//termal
			adicionaHeatmapPontosOnibus();
		break;
		
		case 2: 
			//marker clusterer
			adicionaMarkerClustererPontosOnibus();
		break;
	}
}

function mudaVisualizacaoPontosEmbarquesDesembarques() {
		
	if(migrationLayer != null)
		migrationLayer.hide();	
		
	//remove heatmap
	if(map.hasLayer(heatmapEmbDesembA)){
		map.removeLayer(heatmapEmbDesembA);
	}
	
	if(map.hasLayer(heatmapEmbDesembB)){
		map.removeLayer(heatmapEmbDesembB);
	}
	
	//remove heatmap
	if(map.hasLayer(markerClusterEmbDesemb)){
		//remove os possíveis marcadores do marker cluster
		markerClusterEmbDesemb.removeLayers(marcadores_embarque);
		markerClusterEmbDesemb.removeLayers(marcadores_desembarque);
		
		//remove o marker cluster do mapa
		map.removeLayer(markerClusterEmbDesemb);
	}
		
	//obtém a opção escolhida
	var opcao_embarques_desembarques = parseInt($('#opcao_embarques_desembarques').val());
	
	//executa a solicitação
	switch (opcao_embarques_desembarques) {
		
		//visualizar pontos de embarque termal
		case 1:
			heatmapEmbDesembA.setLatLngs(pontos_embarque);
			heatmapEmbDesembA.addTo(map);
		break;
		
		//visualizar pontos de desembarque termal
		case 2:
			heatmapEmbDesembA.setLatLngs(pontos_desembarque);
			heatmapEmbDesembA.addTo(map);
		break;
		
		//visualizar pontos de embarque e desembarque termal
		case 3:
			heatmapEmbDesembA.setLatLngs(pontos_embarque);
			heatmapEmbDesembA.addTo(map);
			
			heatmapEmbDesembB.setLatLngs(pontos_desembarque);
			heatmapEmbDesembB.addTo(map);
		break;
		
		//visualizar pontos de embarque clusterizados
		case 4:
			markerClusterEmbDesemb.addLayers(marcadores_embarque);						
			map.addLayer(markerClusterEmbDesemb);
		break;
		
		//visualizar pontos de desembarque clusterizados
		case 5:
			markerClusterEmbDesemb.addLayers(marcadores_desembarque);						
			map.addLayer(markerClusterEmbDesemb);
		break;
		
		//visualizar pontos de embarque e desembarque clusterizados
		case 6:
			markerClusterEmbDesemb.addLayers(marcadores_embarque);
			markerClusterEmbDesemb.addLayers(marcadores_desembarque);
			map.addLayer(markerClusterEmbDesemb);
		break;
		
		case 7:
		
			if(migrationLayer != null)
			{
				if (contornoPoisDestino.length > 0)
				{
					markerClusterEmbDesemb.addLayers(marcadores_embarque);						
					map.addLayer(markerClusterEmbDesemb);
				}
				else if (contornoPoisOrigem.length > 0)
				{
					markerClusterEmbDesemb.addLayers(marcadores_desembarque);						
					map.addLayer(markerClusterEmbDesemb);
				}
				migrationLayer.show();
			}			
			else
			{
				var data = []
				
				if (contornoPoisDestino.length > 0)
				{
					markerClusterEmbDesemb.addLayers(marcadores_embarque);						
					map.addLayer(markerClusterEmbDesemb);
				}
				else if (contornoPoisOrigem.length > 0)
				{
					markerClusterEmbDesemb.addLayers(marcadores_desembarque);						
					map.addLayer(markerClusterEmbDesemb);
				}
				else
					alert('Selecione itens para a analise primeiro');			
					
					//este trecho recebe os dados do banco e
					//plota o cluster no mapa
					
					var cor = 0;
					flag = fluxo[0].id;
					print(fluxo);
					
					$.each(fluxo, function (i, poi) 
					{
						if(flag != poi.id)
						{
							cor++;
							flag = poi.id;
						}
						var temp = {
							"from":[poi.origem_lng,poi.origem_lat],
							"to":[poi.destino_lng,poi.destino_lat],
							"labels":["",""],
							//"color":"#05ffd9",
							"color":myMapColor.get(cor),
							"value": 1
							};
						data.push(temp);
						
					});	
					
					
					migrationLayer = new L.migrationLayer({
						map: map,
						data: data,
						pulseRadius:30,
						pulseBorderWidth:0,//3
						arcWidth:1,
						arcLabel:true,
						arcLabelFont:'10px sans-serif',
						maxWidth:10
						}
					);
					
					migrationLayer.addTo(map);
					
					print("cro final" + cor);
					
					function setData(){
						migrationLayer.setData(data2);
					}
					function hide(){
						migrationLayer.hide();
					}
					function show(){
						migrationLayer.show();
					}
					function play(){
						migrationLayer.play();
					}
					function pause(){
						migrationLayer.pause();
					}
					function destroy() {
						migrationLayer.destroy();
					}
					
			}
		break;
		
	}
}

function LimpaVisualizacaoPontosEmbarquesDesembarques(){
	
	//remove heatmap
	if(map.hasLayer(heatmapEmbDesembA)){
		map.removeLayer(heatmapEmbDesembA);
	}
	
	if(map.hasLayer(heatmapEmbDesembB)){
		map.removeLayer(heatmapEmbDesembB);
	}
	
	//remove heatmap
	if(map.hasLayer(markerClusterEmbDesemb)){
		//remove os possíveis marcadores do marker cluster
		markerClusterEmbDesemb.removeLayers(marcadores_embarque);
		markerClusterEmbDesemb.removeLayers(marcadores_desembarque);
		
		//remove o marker cluster do mapa
		map.removeLayer(markerClusterEmbDesemb);
	}
	
	var elem = document.getElementById("opcao_embarques_desembarques");
	elem.value = "0";
	
		
}

function adicionaHeatmapPontosOnibus() {
	
	$.ajax({
		type:'get',
		url:'bd_pontos_onibus.php',
		dataType: 'json',
		contentType: "application/json;charset=utf-8",
		success: function(pontos_onibus){
			
			//console.log(pontos_onibus);
			
			//carrega os dados na camada heatmap
			heatmap.setLatLngs(pontos_onibus);
			
			heatmap.addTo(map);
		}
	});
}

function adicionaMarkerClustererPontosOnibus() {
	
	var marcador;
	marcadores_pontos_onibus = [];	
	
	$.ajax({
		type:'get',
		url:'bd_pontos_onibus.php',
		dataType: 'json',
		contentType: "application/json;charset=utf-8",
		success: function(pontos_onibus){
			
			$.each(pontos_onibus, function (i, ponto_onibus) {
				
				//cria o marcador
				marcador = L.marker({lat: ponto_onibus.lat, lng: ponto_onibus.lng});

				//adiciona o marcador na camada marker cluster
				marcadores_pontos_onibus.push(marcador);
				
			});	
			
			//adiciona marcadores do marker cluster
			markerCluster_pontos.addLayers(marcadores_pontos_onibus);
			
			//adiciona no mapa
			map.addLayer(markerCluster_pontos);
		}
	});
}

function limpaPontosOnibus(){
	
	//remove heatmap
	if(map.hasLayer(heatmap)){
		map.removeLayer(heatmap);
	}
	
	//remove marker cluster
	if(map.hasLayer(markerCluster_pontos)){
		markerCluster_pontos.removeLayers(marcadores_pontos_onibus);
		map.removeLayer(markerCluster_pontos);
	}
}

//Essa funcao é chamada quando vc clica em "Analise Poi" da interface
function pesquisarPoi()
{
	var tipoAnalise;
	var aux_regioes;
	
	LimpaVisualizacaoPontosEmbarquesDesembarques();
	removePoisParaPesquisa();
	
	pontos_embarque = [];
	pontos_desembarque = [];
	
	marcadores_embarque = [];
	marcadores_desembarque = [];
	
	sum = 0;
	histEmbarquesFull = [];	
	
	//busca da sessão a lista de origens e destinos selecionados
	origens_selecionadas = sessionStorage.getItem('origens_selecionadas');	
	destinos_selecionados = sessionStorage.getItem('destinos_selecionados');	
		
	if(geopois.length == 0)
	{		
		alert('Selecione ao menos 01 poi no mapa');		
	}	
	else
	{	
		//verifica se os pois escolhidos são origem ou destino
		if(contornoPoisDestino.length > 0)
		{
			tipoAnalise = "poisDestinos";
			if (origens_selecionadas == "[]")
			{
				var aux_regioes = "all";
			}
			else
			{
				var aux_regioes = origens_selecionadas;
			}
		}
		else
		{
			tipoAnalise = "poisOrigens";
			if (destinos_selecionados == "[]")
			{
				var aux_regioes = "all";
			}
			else
			{
				var aux_regioes = destinos_selecionados;
			}
		}
		
		//define variaveis
		var data, hora, data_inicio, data_fim, hora_inicio, hora_fim;
	
		//ajusta datas
		data_inicio = $('#data_inicio').val().split('/').reverse().join('-');
		data_fim = $('#data_fim').val().split('/').reverse().join('-');
		
		hora_inicio = $('#hora_inicio').val();
		hora_fim = $('#hora_fim').val();
		
		if(!Date.parse(data_inicio) || !Date.parse(data_fim))
		{			
			alert('Selecione um período para efetuar a pesquisa');
			return 0;			
		}
		else
		{			
			if(Date.parse(data_inicio) > Date.parse(data_fim))
			{				
				alert('A data final não pode ser menor que a inicial.');
				return 0;				
			}
			else
			{				
				if(hora_inicio === '' || hora_fim === '')
				{				
					alert('É necessário definir um intervalo de horários para efetuar a consulta.');
					return 0;
				}
			}
		}
		
		var tipo_roi = $('#tipo_roi').val();
		var sexo = $('#sexo').val();
		var idade = $('#idade').val();
		
		grafico = [];
		
		var linhas_fluxo = [];
		
		grafico['sexo'] = [];
		grafico['sexo']['M'] = 0;
		grafico['sexo']['F'] = 0;
		grafico['sexo']['Não Inf.'] = 0;
		
		grafico['sexo_horario_M'] = [];
		grafico['sexo_horario_F'] = [];
		grafico['sexo_horario_NI'] = [];
		
		grafico['idade'] = [];
		
		grafico['faixa_etaria'] = [];
		grafico['faixa_etaria']['De 0 a 5 anos'] = 0;
		grafico['faixa_etaria']['De 5 a 12 anos'] = 0;
		grafico['faixa_etaria']['De 12 a 18 anos'] = 0;
		grafico['faixa_etaria']['De 18 a 65 anos'] = 0;
		grafico['faixa_etaria']['Acima de 65 anos'] = 0;
		grafico['faixa_etaria']['Idade menor que 0'] = 0;
		grafico['faixa_etaria']['Idade não informada'] = 0;
		
		grafico['faixa_etaria_0_5'] = [];
		grafico['faixa_etaria_5_12'] = [];
		grafico['faixa_etaria_12_18'] = [];
		grafico['faixa_etaria_18_65'] = [];
		grafico['faixa_etaria_>65'] = [];
		grafico['faixa_etaria_<0'] = [];
		grafico['faixa_etaria_ninf'] = [];
		
		grafico['embarque'] = [];
		
		$.ajax({
			type:'get',
			url:'bd_movimentacao_pois.php',
			dataType: 'json',
			//dataType: 'text',
			contentType: "application/json;charset=utf-8",
			data: {
				"regioes_selecionadas": aux_regioes, "pois_selecionados": JSON.stringify(geopois), 
				"data_inicio": data_inicio, "data_fim": data_fim, 
				"hora_inicio": hora_inicio, "hora_fim": hora_fim, 
				"tipoAnalise": tipoAnalise, "sexo" : sexo, "idade": idade},
			success: function(movimentacoes){				
				
				migrationLayer = null;
				fluxo = [];
				fluxo = movimentacoes;
				
				//abaixo uma copia do metodo de pesquisa original
				var aux_idx;
				ipo_roi = $('#tipo_roi').val();
				sexo = $('#sexo').val();
				idade = $('#idade').val();
				
				
				$.each(movimentacoes, function (i, movimentacao) 
				{					
					//coleta dados sobre sexo
					switch(movimentacao.cartao_sexo)
					{
						case 'M':
							grafico['sexo']['M'] += 1;
							
							if(grafico['sexo_horario_M'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_M'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_M'][movimentacao.datahora_formatada] += 1;
							}
							
							break;
						
						case 'F':
							grafico['sexo']['F'] += 1;
							
							if(grafico['sexo_horario_F'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_F'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_F'][movimentacao.datahora_formatada] += 1;
							}
							
							break;
							
						default:
							grafico['sexo']['Não Inf.'] += 1;
							
							if(grafico['sexo_horario_NI'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_NI'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_NI'][movimentacao.datahora_formatada] += 1;
							}
					}
						
					//coleta dados sobre idade
					aux_idx = (movimentacao.idade == undefined) ? 'x' : movimentacao.idade;
					if(grafico['idade'][aux_idx] != undefined){
						grafico['idade'][aux_idx] += 1;
					}else{
						grafico['idade'][aux_idx] = 1;
					}
					
					//coleta dados sobre faixa etaria
					if ( ( movimentacao.idade < 0 ) && ( idade == 6 || idade == 0 ) )
					{
						
						grafico['faixa_etaria']['Idade menor que 0'] += 1;
						
						if(grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] == undefined){
							grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] = 1;
						}else{
							grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] += 1;
						}
						
					}
					else
					{
						if ( ( movimentacao.idade == undefined || movimentacao.idade.trim() == '' || movimentacao.idade == null || movimentacao.idade == 0 ) && ( idade == 7 || idade == 0 ) ){
							
							grafico['faixa_etaria']['Idade não informada'] += 1;
							
							if(grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] == undefined){
								grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] += 1;
							}
							
						}else{
							if ( ( movimentacao.idade > 0 && movimentacao.idade < 5 ) && ( idade = 1 || idade == 0 ) ){
								
								grafico['faixa_etaria']['De 0 a 5 anos'] += 1;
								
								if(grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] == undefined){
									grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] = 1;
								}else{
									grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] += 1;
								}
								
							}else{
								if ( ( movimentacao.idade >= 5 && movimentacao.idade < 12 ) && ( idade == 2 || idade == 0 ) ){
									
									grafico['faixa_etaria']['De 5 a 12 anos'] += 1;
									
									if(grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] == undefined){
										grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] = 1;
									}else{
										grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] += 1;
									}
									
								}else{
									if ( ( movimentacao.idade >= 12 && movimentacao.idade < 18 ) && ( idade == 3 || idade == 0 )){
										
										grafico['faixa_etaria']['De 12 a 18 anos'] += 1;
										
										if(grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] == undefined){
											grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] = 1;
										}else{
											grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] += 1;
										}
										
									}else{
										if ( ( movimentacao.idade >= 18 && movimentacao.idade < 65 ) && ( idade == 4 || idade == 0 )){
											
											grafico['faixa_etaria']['De 18 a 65 anos'] += 1;
											
											if(grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] == undefined){
												grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] = 1;
											}else{
												grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] += 1;
											}
											
										}else{
											
											grafico['faixa_etaria']['Acima de 65 anos'] += 1;
											
											if(grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] == undefined){
												grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] = 1;
											}else{
												grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] += 1;
											}
										}
									}
								}
							}
						}
					}
					
					//coleta dados sobre data-hora embarques
					if(grafico['embarque'][movimentacao.datahora_formatada] != undefined){
						grafico['embarque'][movimentacao.datahora_formatada] += 1;
					}else{
						grafico['embarque'][movimentacao.datahora_formatada] = 1;
					}
					
					sum += 1;

					//monta um array de pontos de embarque
					obj = { lat: movimentacao.origem_lat, lng: movimentacao.origem_lng};
					pontos_embarque.push(obj);

					//monta um array de pontos de desembarque
					obj = { lat: movimentacao.destino_lat, lng: movimentacao.destino_lng};
					pontos_desembarque.push(obj);
					
					//monta um array de marcadores de embarque
					marcador = L.marker({lat: movimentacao.origem_lat, lng: movimentacao.origem_lng});
					marcadores_embarque.push(marcador);
					
					//monta um array de marcadores de embarque
					marcador = L.marker({lat: movimentacao.destino_lat, lng: movimentacao.destino_lng});
					marcadores_desembarque.push(marcador);
				});	
				
				pintaGraficos();			
				//acima uma copia do metodo de pesquisa original
			}
		});	
	}	
}
//Metodo chamado pela interface para carregar os subtipos
function tipoPois()
{	
	var tipo = $('#tipo_pois').val();	
	var url = 'bd_pois.php';
		
	if(tipo == 0)
	{
		limpaSubTipo();
		removeTodosPrePois();
	}		
	else
	{		
		limpaSubTipo();
		removeTodosPrePois();
		var sel = document.getElementById('subTipo_pois');
		sel.removeChild( sel.options[0] );

		var option = document.createElement("option");		
		option.setAttribute("value", 0);
		var t = document.createTextNode("Escolha um SubTipo");
		option.appendChild(t);
		document.getElementById("subTipo_pois").appendChild(option);
		
		var option = document.createElement("option");	
		option.setAttribute("value", 1);
		var t = document.createTextNode("Todos");
		option.appendChild(t);
		document.getElementById("subTipo_pois").appendChild(option);		
			
		//requisição no banco recupera apenas id, nome, coord_n, coord_e
		$.ajax({
			type:'get',
			url: url,
			dataType: 'json',
			data: {
				tipoRequisicao: "subtipo",
				tipo: tipo
			},
			contentType: "application/json;charset=utf-8",
			success: function(lista_pois){
				
				//for necessario para converter coords utm em latlng
				$.each(lista_pois, function (i, poi) {
					
					var option = document.createElement("option");
					option.setAttribute("value", i+2);
					var t = document.createTextNode(poi.sub);
					option.appendChild(t);
					document.getElementById("subTipo_pois").appendChild(option);
					
				});				
			}
		});
	}	
}

function subTipoPois()
{		
	var tipo = $('#tipo_pois').val();
	var subTipo = $('#subTipo_pois').val();
	var urltipo = 'bd_pois.php';	
	
	var icone = L.icon({
					iconUrl: "images/green.png",
					iconSize: [15, 15]
				});
	
	//Sem chance de cair aqui
	if(tipo == 0)
		removeTodosPrePois();
	else
	{
		removeTodosPrePois();
		
		$.ajax({
			type:'get',
			url: urltipo,
			dataType: 'json',
			data: {
				tipoRequisicao: "pois",
				tipoPoi: tipo,
				subTipo: subTipo
			},
			contentType: "application/json;charset=utf-8",
			success: function(lista_pois){
					
				//for necessario para converter coords utm em latlng
				$.each(lista_pois, function (i, poi) {
					
					ponto = L.marker({lat: poi.latitude, lng: poi.longitude}, 
					{
						icon: icone, 
						title: poi.nome, 
						id: poi.id,
						contorno: poi.contorno, 
						latitude: poi.latitude,
						longitude: poi.longitude,
					}).addTo(map);
					
					//adiciona na lista de pois
					pre_pois.push(ponto);
				});				
				
				defineAcoesNosPois();
			}
		});
	}	
}

function limpaTipo()
{
	var sel = document.getElementById('tipo_pois').selectedIndex = 0;
}

//Altera o HTML da pagina para ajustar as opções
function limpaSubTipo()
{
	var i;
	var sel = document.getElementById('subTipo_pois');
	var tam = sel.options.length - 1;
	//debugger;
	for (i = tam; i >= 0; i--)
	{
		var elem = sel.options[i];
		sel.removeChild(elem);		
	}
	var option = document.createElement("option");
					
	option.setAttribute("value", -1);
	var t = document.createTextNode("Escolha um poi");
	option.appendChild(t);
	document.getElementById("subTipo_pois").appendChild(option);
	
	removeTodosPrePois();	
}

//remove todos os pontos de pois
function removeTodosPrePois()
{	
	//prepois controlam os pontos plotados no mapa
	//itera a lista de prepois
	$.each(pre_pois, function (i, poi) {
			
		//remove o poi do mapa
		map.removeLayer(poi);		 
	});	
	pre_pois = [];
	retiraTodosContornos();
}

function retiraTodosContornos()
{
	var i;
	var tam = contornoPoisOrigem.length
	for(i=0;i<tam;i++)
	{
		map.removeLayer(contornoPoisOrigem[i]);		
	}
	contornoPoisOrigem = [];
	tam = contornoPoisDestino.length
	for(i=0;i<tam;i++)
	{
		map.removeLayer(contornoPoisDestino[i]);		
	}
	contornoPoisDestino = [];
	geopois = [];
}

function removePoisParaPesquisa()
{	
	var count = 0;
	var temp = []
	var flag = false;
		
	//itera a lista de terminais
	$.each(pre_pois, function (i, poi) {
		
		$.each(geopois, function (j, geo) {
			
			if(poi.options.id == geo){
				flag = true;
			}
		});
		
		//remove o poi do mapa
		if(flag == false){
			map.removeLayer(poi);		
		}
		else{
			temp.push(poi);
			flag = false;
		}
	});
		
	pre_pois = [];	
	pre_pois = temp;
}

//torna os pois clicaveis e faz um circulo quando clicados e tira quando desselecionados
function defineAcoesNosPois(){
	
	$.each(pre_pois, function (i, poi) {
		
		//mouse clicando
		poi.on('click', function (e) {
			
			L.popup().setLatLng(poi._latlng).setContent(poi.options.title).openOn(map);
			
			var acao = sessionStorage.getItem('acao');
			
			//busca lista da sessão
			//var pois_selecionados = JSON.parse(sessionStorage.getItem('pois_selecionados'));
			
			if(acao  == 'origem' )
			{
				//if(contornoPoisDestino.length > 0)
					//limpaContorno(acao);
				
				var pois_selecionados = contornoPoisOrigem;
			}
			else
			{
				//if(contornoPoisOrigem.length > 0)
					//limpaContorno(acao);
				
				var pois_selecionados = contornoPoisDestino;
			}
			
			//se o poi selecionado ja esta na lista de pois selecionados	
			if(verifica(this.options.id, pois_selecionados)){
				
				//retira valor do vetor de pois
				retiraContorno(this.options.id, acao);
				
			}else{
				
				//plota desenho no mapa e retira o poi do vetor de pois selecionados
				insereContorno(this, acao);				
			}
			
			//sessionStorage.setItem('pois_selecionados', JSON.stringify(pois_selecionados));		
			
		});
	});
}

//Metodos Auxiliares para Pois

function trocaAcao()
{
	print("entrou no troca acao");
	
	var acao = sessionStorage.getItem('acao');
			
	//busca lista da sessão
	//var pois_selecionados = JSON.parse(sessionStorage.getItem('pois_selecionados'));
	
	if(acao  == 'origem' )
	{
		if(contornoPoisDestino.length > 0)
			limpaContorno(acao);
		
	}
	else
	{
		if(contornoPoisOrigem.length > 0)
			limpaContorno(acao);
		
	}
	
}

//metodo insere um circulo em volta do poi selecionado
function insereContorno(objeto, acao){	
	
	print("acao = " + acao);
	
	if(acao == 'origem')
		var cor = 'blue';
	else
		var cor = 'red';
	
	var poligono;
	var latlng = JSON.stringify(objeto._latlng.lat) + ", " + JSON.stringify(objeto._latlng.lng);
		
	poligono = L.polygon(eval(objeto.options.contorno),{
		stroke: true,
		color: cor,
		opacity: true,
		opacity: 0.8,
		weight: 2,
		fillColor: cor,
		fillOpacity: 0.35,
		id: objeto.options.id,
		latlng: objeto._latlng
	});

	//adiciona poligono no mapa
	map.addLayer(poligono);	

	//array pois controla contornos que sao visiveis no mapa
	if(acao == 'origem')
		contornoPoisOrigem.push(poligono);
	else
		contornoPoisDestino.push(poligono);
	
	//array geopois controla objetos geo que sao usados na query do banco
	geopois.push(objeto.options.id);

	print("insere " + geopois);
}

//metodo auxiliar para printar mais rapido
function print(a){
	console.log(a);
}

//metodo auxiliar para printar obj 
function result(a){
	
	console.log("resultado do teste");
	console.log(a)
}

function verifica(valor, vetor){
	//debugger;
	var i = 0;
	var tam = vetor.length;
	
	for(i = 0; i < tam; i++){
		if(valor == vetor[i].options.id){
			return true;
		}
	}
	return false;
}

function retiraContorno(id, acao){
	var i = 0;
	if(acao == 'origem')
	{		
		var tam = contornoPoisOrigem.length;
		
		for(i = 0; i < tam; i++){
			if(id == contornoPoisOrigem[i].options.id){
				map.removeLayer(contornoPoisOrigem[i]);
				contornoPoisOrigem.splice(i,1);
				geopois.splice(i,1);
				break;
			}
		}	
	} 
	else 
	{		
		var tam = contornoPoisDestino.length;
		
		for(i = 0; i < tam; i++){
			if(id == contornoPoisDestino[i].options.id){
				map.removeLayer(contornoPoisDestino[i]);
				contornoPoisDestino.splice(i,1);
				geopois.splice(i,1);
				break;
			}
		}	
	}
	print("retirou " + geopois);
}

function limpaContorno(acao){
	var i = 0;
	if(acao == 'destino')
	{		
		var tam = contornoPoisOrigem.length;
		
		for(i = 0; i < tam; i++){
			
			map.removeLayer(contornoPoisOrigem[i]);		
			
		}	
		
		contornoPoisOrigem = [];
		geopois = [];
	} 
	else 
	{		
		var tam = contornoPoisDestino.length;
		
		for(i = 0; i < tam; i++){
			
			map.removeLayer(contornoPoisDestino[i]);
			
		}	
		
		contornoPoisDestino = [];
		geopois = [];
	}	
}

function limpar()
{
	removePoligonosDoMapa();
	LimpaVisualizacaoPontosEmbarquesDesembarques();
	limpaPontosOnibus();
	limpaSubTipo();
	limpaTipo();
	if(migrationLayer != null){
		fluxo = [];
		migrationLayer.destroy();		
	}
}

function pesquisar(){
	
	pontos_embarque = [];
	pontos_desembarque = [];
	
	marcadores_embarque = [];
	marcadores_desembarque = [];
					
	//busca da sessão a lista de origens e destinos selecionados
	origens_selecionadas = sessionStorage.getItem('origens_selecionadas');
	destinos_selecionados = sessionStorage.getItem('destinos_selecionados');
	
	//inicializa variáveis
	sum = 0;
	histEmbarquesFull = [];
	
	var aux_origens = JSON.parse(origens_selecionadas);
	var aux_destinos = JSON.parse(destinos_selecionados);
	
	if((aux_origens.length == 0) || (aux_destinos.length == 0)){
		
		alert('Selecione ao menos 01 origem e 01 destino no mapa ou um pointo de interesse');
		
	}else{
		
		//define variaveis
		var data, hora, data_inicio, data_fim, hora_inicio, hora_fim;
	
		//ajusta datas
		data_inicio = $('#data_inicio').val().split('/').reverse().join('-');
		data_fim = $('#data_fim').val().split('/').reverse().join('-');
		
		hora_inicio = $('#hora_inicio').val();
		hora_fim = $('#hora_fim').val();
		
		if(!Date.parse(data_inicio) || !Date.parse(data_fim)){
			
			alert('Selecione um período para efetuar a pesquisa');
			return 0;
			
		}else{
			
			if(Date.parse(data_inicio) > Date.parse(data_fim)){
				
				alert('A data final não pode ser menor que a inicial.');
				return 0;
				
			}else{
				
				if(hora_inicio === '' || hora_fim === ''){
				
					alert('É necessário definir um intervalo de horários para efetuar a consulta.');
					return 0;
					
				}
			}
		}
		
		var tipo_roi = $('#tipo_roi').val();
		var sexo = $('#sexo').val();
		var idade = $('#idade').val();
		
		grafico = [];
		
		var linhas_fluxo = [];
		
		grafico['sexo'] = [];
		grafico['sexo']['M'] = 0;
		grafico['sexo']['F'] = 0;
		grafico['sexo']['Não Inf.'] = 0;
		
		grafico['sexo_horario_M'] = [];
		grafico['sexo_horario_F'] = [];
		grafico['sexo_horario_NI'] = [];
		
		grafico['idade'] = [];
		
		grafico['faixa_etaria'] = [];
		grafico['faixa_etaria']['De 0 a 5 anos'] = 0;
		grafico['faixa_etaria']['De 5 a 12 anos'] = 0;
		grafico['faixa_etaria']['De 12 a 18 anos'] = 0;
		grafico['faixa_etaria']['De 18 a 65 anos'] = 0;
		grafico['faixa_etaria']['Acima de 65 anos'] = 0;
		grafico['faixa_etaria']['Idade menor que 0'] = 0;
		grafico['faixa_etaria']['Idade não informada'] = 0;
		
		grafico['faixa_etaria_0_5'] = [];
		grafico['faixa_etaria_5_12'] = [];
		grafico['faixa_etaria_12_18'] = [];
		grafico['faixa_etaria_18_65'] = [];
		grafico['faixa_etaria_>65'] = [];
		grafico['faixa_etaria_<0'] = [];
		grafico['faixa_etaria_ninf'] = [];
		
		grafico['embarque'] = [];
		
		$.ajax({
			type:'get',
			url:'bd_movimentacao.php',
			dataType: 'json',
			//dataType: 'text',
			contentType: "application/json;charset=utf-8",
			data: {
				"origens_selecionadas": origens_selecionadas, "destinos_selecionados": destinos_selecionados, 
				"data_inicio": data_inicio, "data_fim": data_fim, 
				"hora_inicio": hora_inicio, "hora_fim": hora_fim, 
				"tipo_roi": tipo_roi, "sexo" : sexo, "idade": idade},
			success: function(movimentacoes){
				
				//console.log(movimentacoes);
				
				var aux_idx;
				
				//cria o ícone do marcador de embarque
				var icone_embarque = L.icon({
					iconUrl: "images/blue.png",
					iconSize: [10, 10]
				});
				
				//cria o ícone do marcador de embarque
				var icone_desembarque = L.icon({
					iconUrl: "images/red.png",
					iconSize: [10, 10]
				});
				
				tipo_roi = $('#tipo_roi').val();
				sexo = $('#sexo').val();
				idade = $('#idade').val();
				
				$.each(movimentacoes, function (i, movimentacao) {
					
					//coleta dados sobre sexo
					switch(movimentacao.cartao_sexo){
						case 'M':
							grafico['sexo']['M'] += 1;
							
							if(grafico['sexo_horario_M'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_M'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_M'][movimentacao.datahora_formatada] += 1;
							}
							
							break;
						
						case 'F':
							grafico['sexo']['F'] += 1;
							
							if(grafico['sexo_horario_F'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_F'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_F'][movimentacao.datahora_formatada] += 1;
							}
							
							break;
							
						default:
							grafico['sexo']['Não Inf.'] += 1;
							
							if(grafico['sexo_horario_NI'][movimentacao.datahora_formatada] == undefined){
								grafico['sexo_horario_NI'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['sexo_horario_NI'][movimentacao.datahora_formatada] += 1;
							}
					}
						
					//coleta dados sobre idade
					aux_idx = (movimentacao.idade == undefined) ? 'x' : movimentacao.idade;
					if(grafico['idade'][aux_idx] != undefined){
						grafico['idade'][aux_idx] += 1;
					}else{
						grafico['idade'][aux_idx] = 1;
					}
					
					//coleta dados sobre faixa etaria
					if ( ( movimentacao.idade < 0 ) && ( idade == 6 || idade == 0 ) ){
						
						grafico['faixa_etaria']['Idade menor que 0'] += 1;
						
						if(grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] == undefined){
							grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] = 1;
						}else{
							grafico['faixa_etaria_<0'][movimentacao.datahora_formatada] += 1;
						}
						
					}else{
						if ( ( movimentacao.idade == undefined || movimentacao.idade.trim() == '' || movimentacao.idade == null || movimentacao.idade == 0 ) && ( idade == 7 || idade == 0 ) ){
							
							grafico['faixa_etaria']['Idade não informada'] += 1;
							
							if(grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] == undefined){
								grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] = 1;
							}else{
								grafico['faixa_etaria_ninf'][movimentacao.datahora_formatada] += 1;
							}
							
						}else{
							if ( ( movimentacao.idade > 0 && movimentacao.idade < 5 ) && ( idade = 1 || idade == 0 ) ){
								
								grafico['faixa_etaria']['De 0 a 5 anos'] += 1;
								
								if(grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] == undefined){
									grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] = 1;
								}else{
									grafico['faixa_etaria_0_5'][movimentacao.datahora_formatada] += 1;
								}
								
							}else{
								if ( ( movimentacao.idade >= 5 && movimentacao.idade < 12 ) && ( idade == 2 || idade == 0 ) ){
									
									grafico['faixa_etaria']['De 5 a 12 anos'] += 1;
									
									if(grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] == undefined){
										grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] = 1;
									}else{
										grafico['faixa_etaria_5_12'][movimentacao.datahora_formatada] += 1;
									}
									
								}else{
									if ( ( movimentacao.idade >= 12 && movimentacao.idade < 18 ) && ( idade == 3 || idade == 0 )){
										
										grafico['faixa_etaria']['De 12 a 18 anos'] += 1;
										
										if(grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] == undefined){
											grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] = 1;
										}else{
											grafico['faixa_etaria_12_18'][movimentacao.datahora_formatada] += 1;
										}
										
									}else{
										if ( ( movimentacao.idade >= 18 && movimentacao.idade < 65 ) && ( idade == 4 || idade == 0 )){
											
											grafico['faixa_etaria']['De 18 a 65 anos'] += 1;
											
											if(grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] == undefined){
												grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] = 1;
											}else{
												grafico['faixa_etaria_18_65'][movimentacao.datahora_formatada] += 1;
											}
											
										}else{
											
											grafico['faixa_etaria']['Acima de 65 anos'] += 1;
											
											if(grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] == undefined){
												grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] = 1;
											}else{
												grafico['faixa_etaria_>65'][movimentacao.datahora_formatada] += 1;
											}
										}
									}
								}
							}
						}
					}
					
					//coleta dados sobre data-hora embarques
					if(grafico['embarque'][movimentacao.datahora_formatada] != undefined){
						grafico['embarque'][movimentacao.datahora_formatada] += 1;
					}else{
						grafico['embarque'][movimentacao.datahora_formatada] = 1;
					}
					
					sum += 1;

					//monta um array de pontos de embarque
					obj = { lat: movimentacao.origem_lat, lng: movimentacao.origem_lng};
					pontos_embarque.push(obj);

					//monta um array de pontos de desembarque
					obj = { lat: movimentacao.destino_lat, lng: movimentacao.destino_lng};
					pontos_desembarque.push(obj);
					
					//monta um array de marcadores de embarque
					marcador = L.marker({lat: movimentacao.origem_lat, lng: movimentacao.origem_lng});
					marcadores_embarque.push(marcador);
					
					//monta um array de marcadores de embarque
					marcador = L.marker({lat: movimentacao.destino_lat, lng: movimentacao.destino_lng});
					marcadores_desembarque.push(marcador);
				});	
				
				pintaGraficos();
				
			}
		});
	}
}

function pintaGraficos(){
					
	//embarques por sexo
	grafico_barras_sexo.data = {
		labels: Object.keys(grafico['sexo']),
		datasets: [
			{
				label: 'Embarques por sexo',
				data: Object.values(grafico['sexo']),
				backgroundColor:["rgba(255,0,0, 0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,0, 0.5)"],
				borderColor:["rgb(255,0,0)", "rgb(0,0,255)", "rgb(0,255,0)"],
				borderWidth:1,
				fill: false
			}
		]
	};
	
	grafico_barras_sexo.update();
	
	//embarques por faixa etaria
	grafico_barras_faixa_etaria.data = {
		labels: Object.keys(grafico['faixa_etaria']),
		datasets: [
			{
				data: Object.values(grafico['faixa_etaria']),
				backgroundColor: ["rgba(255, 99, 132, 0.5)","rgba(255, 159, 64, 0.5)","rgba(255, 205, 86, 0.5)","rgba(75, 192, 192, 0.5)","rgba(54, 162, 235, 0.5)","rgba(153, 102, 255, 0.5)", "rgba(201, 203, 207, 0.5)"],
				borderColor: ["rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(75, 192, 192)","rgb(54, 162, 235)","rgb(153, 102, 255)", "rgb(201, 203, 207)"],
				borderWidth:1,
				fill: false
			}
		]
	};
	
	grafico_barras_faixa_etaria.update();
	
	
	//embarques por idade
	grafico_barras_idade.data = {
		labels: Object.keys(grafico['idade']),
		datasets: [
			{
				label: 'Embarques por idade',
				data: Object.values(grafico['idade']),
				backgroundColor: "rgba(0, 0, 255, 0.5)",
				borderColor: "rgb(0, 0, 255)",
			}
		]
	};
	
	grafico_barras_idade.update();
	
	
	//embarques por sexo ao longo do período
	var rotulos = Object.keys(grafico['embarque']);;
	var aux = [];
	var i;
	
	var average = Number(sum / rotulos.length).toFixed(2);
	
	for(i = 0; i < rotulos.length; i++){
		aux.push(average);
	}
						
	grafico_linhas_embarque_sexo_hora.data = {
		labels: rotulos,
		datasets: [
			{
				label: 'Média',
				data: aux,
				backgroundColor: "rgba(75, 192, 192, 0.5)",
				borderColor: "rgb(75, 192, 192)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: 'Total',
				data: Object.values(grafico['embarque']),
				backgroundColor: "rgba(255, 0, 0, 0.5)",
				borderColor: "rgb(255, 0, 0)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: 'Masculino',
				data: Object.values(grafico['sexo_horario_M']),
				backgroundColor: "rgba(0,0,255,0.5)", 
				borderColor: "rgb(0, 0, 255)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: 'Feminino',
				data: Object.values(grafico['sexo_horario_F']),
				backgroundColor: "rgba(255, 99, 132, 0.5)",
				borderColor: "rgb(255, 99, 132)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: 'Não Informado',
				data: Object.values(grafico['sexo_horario_NI']),
				backgroundColor: "rgba(0, 255, 0, 0.5)",
				borderColor: "rgb(0, 255, 0)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			
		]
	};
	
	grafico_linhas_embarque_sexo_hora.update();
	
	
	//embarques por faixa etária ao longo do período
	var rotulos = Object.keys(grafico['embarque']);;
	var aux = [];
	var i;
	
	var average = Number(sum / rotulos.length).toFixed(2);
	
	for(i = 0; i < rotulos.length; i++){
		aux.push(average);
	}
						
	grafico_linhas_embarque_faixa_etaria_hora.data = {
		labels: rotulos,
		datasets: [
			{
				label: 'Média',
				data: aux,
				backgroundColor: "rgba(255, 0, 0, 0.5)",
				borderColor: "rgb(255, 0, 0)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: '0<x<5',
				data: Object.values(grafico['faixa_etaria_0_5']),
				backgroundColor: "rgba(255, 99, 132, 0.5)",
				borderColor: "rgb(255, 99, 132)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: '5<=x<12',
				data: Object.values(grafico['faixa_etaria_5_12']),
				backgroundColor: "rgba(255, 159, 64, 0.5)",
				borderColor: "rgb(255, 159, 64)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: '12<=x<18',
				data: Object.values(grafico['faixa_etaria_12_18']),
				backgroundColor: "rgba(255, 205, 86, 0.5)",
				borderColor: "rgb(255, 205, 86)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: '18<=x<65',
				data: Object.values(grafico['faixa_etaria_18_65']),
				backgroundColor: "rgba(75, 192, 192, 0.5)",
				borderColor: "rgb(75, 192, 192)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			
			{
				label: '>=65',
				data: Object.values(grafico['faixa_etaria_>65']),
				backgroundColor: "rgba(54, 162, 235, 0.5)",
				borderColor: "rgb(54, 162, 235)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			{
				label: '<0',
				data: Object.values(grafico['faixa_etaria_<0']),
				backgroundColor: "rgba(153, 102, 255, 0.5)", 
				borderColor: "rgb(153, 102, 255)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			
			{
				label: 'Não Informada',
				data: Object.values(grafico['faixa_etaria_ninf']),
				backgroundColor: "rgba(201, 203, 207, 0.5)",
				borderColor: "rgb(201, 203, 207)",
				cubicInterpolationMode: 'default',
				fill: false
			},
			
		]
	};
	
	grafico_linhas_embarque_faixa_etaria_hora.update();
}