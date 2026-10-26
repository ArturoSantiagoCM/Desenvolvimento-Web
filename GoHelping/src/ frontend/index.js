// Uma única lista de dados alimenta os cards, a busca e os pontos do globo.
//as coordenadas abaixo são aproximadas para região de Caracas.
const LOCAIS = [
    {
        id: "coleta-1",
        tipo: "Centro de Coleta", emoji: "🏠", cor: "#e67e22",
        regiao: "Estado Miranda", pais: "Venezuela",
        endereco: "Las Mercedes, Caracas, Iglesia Nuestra Señora de Las Mercedes",
        lat: 10.483, lng: -66.867,
        publicadoEm: "2026-09-13T16:30:00",
        link: "pages/TiposdeCentros/CentrodeColeta.html"
    },
    {
        id: "vet-1",
        tipo: "Centro Veterinário", emoji: "🐾", cor: "#27ae60",
        regiao: "Estado Miranda", pais: "Venezuela",
        endereco: "Av. González Rincones, Caracas 1080",
        lat: 10.495, lng: -66.84,
        publicadoEm: "2026-09-17T04:25:00",
        link: "pages/TiposdeCentros/CentroVeterinario.html"
    },
    {
        id: "medico-1",
        tipo: "Centro Médico", emoji: "🏥", cor: "#e74c3c",
        regiao: "Estado Miranda", pais: "Venezuela",
        endereco: "Av. Eraso, Plaza El Estanque Urb, Caracas 1011",
        lat: 10.49, lng: -66.855,
        publicadoEm: "2026-09-17T22:45:00",
        link: "pages/TiposdeCentros/CentroMédico.html"
    },
    {
        id: "ong-1",
        tipo: "ONG", emoji: "⛑️", cor: "#2980b9",
        regiao: "Estado Miranda", pais: "Venezuela",
        endereco: "Monumento a la Paz, Bello Monte, Caracas",
        lat: 10.475, lng: -66.89,
        publicadoEm: "2026-09-20T12:06:00",
        link: "pages/TiposdeCentros/ONG.html"
    }
];

let globo = null;

// Remove acentos e caixa para a busca 
function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatarPublicacao(iso) {
    const data = new Date(iso);
    return "Publicado em: " + data.toLocaleString("pt-BR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
}

function textoBuscavel(local) {
    return normalizar([local.tipo, local.regiao, local.pais, local.endereco].join(" "));
}

// cards
function criarCard(local) {
    const card = document.createElement("article");
    card.id = "card-" + local.id;

    const titulo = document.createElement("h4");
    titulo.textContent = `[${local.tipo} ${local.emoji}] ${local.regiao} — ${local.pais}`;

    const endereco = document.createElement("p");
    endereco.textContent = local.endereco;

    const data = document.createElement("p");
    const small = document.createElement("small");
    small.textContent = formatarPublicacao(local.publicadoEm);
    data.appendChild(small);

    const link = document.createElement("a");
    link.href = local.link;
    link.textContent = "Ver detalhes";

    card.append(titulo, endereco, data, link);
    return card;
}

function renderizarCards(locais) {
    const lista = document.getElementById("lista-locais");
    lista.replaceChildren();
    // mais recentes primeiro
    [...locais]
        .sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm))
        .forEach((local) => {
            lista.appendChild(criarCard(local));
            lista.appendChild(document.createElement("br"));
        });
}

function destacarCard(id) {
    document.querySelectorAll("#lista-locais article").forEach((c) => (c.style.outline = ""));
    const card = document.getElementById("card-" + id);
    if (card) {
        card.style.outline = "3px solid #2980b9";
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// globo
function iniciarGlobo(locais) {
    const container = document.getElementById("globo-3d");

    globo = Globe()(container)
        .globeImageUrl("https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg")
        .pointsData(locais)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("cor")
        .pointRadius(0.8)
        .pointAltitude(0.03)
        .pointLabel((l) => `${l.emoji} ${l.tipo} — ${l.pais}`)
        .onPointClick((l) => destacarCard(l.id))
        .width(container.clientWidth || 400)
        .height(350);

    globo.controls().autoRotate = true;
    globo.controls().autoRotateSpeed = 1.5;

    // Caso a janela mude de tamanho o globo se ajusta
    window.addEventListener("resize", () => {
        globo.width(container.clientWidth || 400);
    });
}

function focarNoGlobo(locais) {
    if (!globo || locais.length === 0) return;
    // média simples das coordenadas dos resultados
    const lat = locais.reduce((s, l) => s + l.lat, 0) / locais.length;
    const lng = locais.reduce((s, l) => s + l.lng, 0) / locais.length;
    globo.controls().autoRotate = false;
    globo.pointOfView({ lat, lng, altitude: 1.6 }, 1200);
}

// busca
function buscar(termo) {
    const msg = document.getElementById("msg-busca");
    const consulta = normalizar(termo);

    if (!consulta) {
        renderizarCards(LOCAIS);
        globo.pointsData(LOCAIS);
        globo.controls().autoRotate = true;
        msg.textContent = "";
        return;
    }

    const resultados = LOCAIS.filter((l) => textoBuscavel(l).includes(consulta));
    renderizarCards(resultados);
    globo.pointsData(resultados);

    if (resultados.length === 0) {
        msg.textContent = `Nenhum ponto de ajuda encontrado para "${termo.trim()}". Tente outro país ou região.`;
    } else {
        msg.textContent = `${resultados.length} ponto(s) de ajuda encontrado(s).`;
        focarNoGlobo(resultados);
    }
}

// início
window.addEventListener("DOMContentLoaded", () => {
    renderizarCards(LOCAIS);
    iniciarGlobo(LOCAIS);

    document.getElementById("form-busca").addEventListener("submit", (evento) => {
        evento.preventDefault(); // evita recarregar a página
        buscar(document.getElementById("busca").value);
    });
});