const params = new URLSearchParams(window.location.search);
const latBusca = parseFloat(params.get('lat'));
const lngBusca = parseFloat(params.get('lng'));
const zoomBusca = parseInt(params.get('zoom')) || 5;
const veioDaBusca = !isNaN(latBusca) && !isNaN(lngBusca);

const mapa = L.map('meu-mapa').setView(
    veioDaBusca ? [latBusca, lngBusca] : [-22.834, -47.196],
    veioDaBusca ? zoomBusca : 5
);

// 2. Carrega o visual do mapa (Servidor HOT OSM - Ideal para projetos humanitários)
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',
    maxZoom: 15
}).addTo(mapa);