
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

// Recalcula o tamanho do mapa quando a tela gira ou a janela muda de tamanho
window.addEventListener('resize', () => mapa.invalidateSize());
window.addEventListener('orientationchange', () => setTimeout(() => mapa.invalidateSize(), 200));


// ===== LOCAIS DE AJUDA NO MAPA =====
// Cada local cadastrado aparece nas coordenadas em que foi registrado, com o ícone do seu tipo.
// Clicar leva para a página com as informações daquele local.
const TIPOS_NO_MAPA = {
    coleta:      { nome: "Centro de Coleta",   emoji: "🏠", cor: "#7e3fb0", pagina: "CentrodeColeta.html" },
    veterinario: { nome: "Centro Veterinário", emoji: "🐾", cor: "#27ae60", pagina: "CentroVeterinario.html" },
    medico:      { nome: "Centro Médico",      emoji: "🏥", cor: "#e74c3c", pagina: "CentroMedico.html" },
    ong:         { nome: "ONG",                emoji: "⛑️", cor: "#2980b9", pagina: "ONG.html" }
};

const camadaLocais = L.layerGroup().addTo(mapa);

// Monta o ícone com createElement/textContent: nada digitado pelo usuário vira HTML
function criarIconeLocal(tipo, verificado) {
    const raiz = document.createElement("div");
    raiz.className = "marcador-local__icone";
    raiz.style.setProperty("--cor", tipo.cor);
    raiz.textContent = tipo.emoji;

    const estrela = document.createElement("span");
    estrela.className = "marcador-local__estrela";
    estrela.textContent = "★";
    raiz.appendChild(estrela);

    return L.divIcon({
        html: raiz,
        className: "marcador-local" + (verificado ? " marcador-local--verificado" : ""),
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

function desenharLocais() {
    camadaLocais.clearLayers();
    const pontos = [];

    GH.listarLocais().forEach((registro) => {
        const tipo = TIPOS_NO_MAPA[registro.local?.tipo];
        const lat = registro.local?.coordenadas?.latitude;
        const lng = registro.local?.coordenadas?.longitude;
        if (!tipo || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const nome = registro.contato?.organizacao || registro.contato?.nome || "Local de ajuda";
        const verificado = registro.status === "aprovado";
        const pagina = `../TiposdeCentros/${tipo.pagina}?id=${encodeURIComponent(registro.id)}`;

        const marcador = L.marker([lat, lng], {
            icon: criarIconeLocal(tipo, verificado),
            title: `${tipo.nome} — ${nome}`,
            alt: `${tipo.nome}: ${nome}`,
            keyboard: true,
            riseOnHover: true
        });

        // ao passar o mouse mostra o nome; ao clicar abre a página do local
        const dica = document.createElement("span");
        dica.className = "marcador-local__nome";
        dica.textContent = `${tipo.nome} · ${nome}${verificado ? " ★" : ""}`;
        marcador.bindTooltip(dica, { direction: "top", offset: [0, -18] });

        marcador.on("click", () => { window.location.href = pagina; });
        marcador.addTo(camadaLocais);
        pontos.push([lat, lng]);
    });

    return pontos;
}

const pontosCadastrados = desenharLocais();

// Sem busca na URL: enquadra todos os locais cadastrados (o zoom padrão continua se não houver nenhum)
if (!veioDaBusca && pontosCadastrados.length > 0) {
    mapa.fitBounds(pontosCadastrados, { padding: [60, 60], maxZoom: 8 });
}

// um local novo (ou com status novo) em outra aba aparece aqui sem recarregar
window.addEventListener("storage", (evento) => {
    if (evento.key === GH.CHAVES.locais) desenharLocais();
});
