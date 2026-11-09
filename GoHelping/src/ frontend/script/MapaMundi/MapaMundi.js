
// Pega os parâmetros que foram passados pela URL
const params = new URLSearchParams(window.location.search);

// Pega a latitude e longitude da URL e transforma em números decimais
const latBusca = parseFloat(params.get('lat'));
const lngBusca = parseFloat(params.get('lng'));

// Pega o zoom da URL ou usa 5 como padrão
const zoomBusca = parseInt(params.get('zoom')) || 5;

// Verifica se a URL possui latitude e longitude válidas
const veioDaBusca = !isNaN(latBusca) && !isNaN(lngBusca);

// Cria o mapa e define a localização inicial
const mapa = L.map('meu-mapa').setView(

    // Se tiver coordenadas na URL, usa elas. Senão, usa a localização padrão
    veioDaBusca ? [latBusca, lngBusca] : [-22.834, -47.196],

    // Define o zoom da busca ou mantém o zoom padrão
    veioDaBusca ? zoomBusca : 5
);

// Carrega o visual do mapa usando o OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {

    // Créditos das plataformas utilizadas no mapa
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',

    // Define o zoom máximo permitido
    maxZoom: 15

// Adiciona o mapa visual à página
}).addTo(mapa);
