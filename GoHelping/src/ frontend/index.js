// A tela inicial usa os locais cadastrados (módulo GH, em script/Comum/Armazenamento.js).
// O cabeçalho (Entrar x Perfil) é decidido só pelo CSS, a partir de <html data-sessao>.
const URL_REGISTRO = "pages/Cadastros/LocaldeAjuda/RegistroLocal.html";

// Como cada tipo cadastrado aparece no site (emoji, cor e página de detalhes)
const TIPOS = {
    coleta:      { nome: "Centro de Coleta",   emoji: "🏠", cor: "#7e3fb0", pagina: "pages/TiposdeCentros/CentrodeColeta.html" },
    veterinario: { nome: "Centro Veterinário", emoji: "🐾", cor: "#27ae60", pagina: "pages/TiposdeCentros/CentroVeterinario.html" },
    medico:      { nome: "Centro Médico",      emoji: "🏥", cor: "#e74c3c", pagina: "pages/TiposdeCentros/CentroMedico.html" },
    ong:         { nome: "ONG",                emoji: "⛑️", cor: "#2980b9", pagina: "pages/TiposdeCentros/ONG.html" }
};

// Status guardado no registro -> estrela do card.
// "aprovado" = verificado (estrela roxa); qualquer outro (em_analise...) = ainda não verificado (cinza).
const ESTADO_VERIFICACAO = {
    verificado:    { estrela: "roxa",  texto: "Estrela roxa: este local já foi verificado." },
    naoVerificado: { estrela: "cinza", texto: "Estrela cinza: este local ainda não foi verificado." }
};

let LOCAIS = [];
let globo = null;
let painel = null; // controle do painel que sobe (preenchido em iniciarPainel)

// Converte os registros guardados para o formato usado pelos cards e pelo globo
function carregarLocais() {
    return GH.listarLocais()
        .filter((r) => TIPOS[r.local?.tipo])
        .map((r) => {
            const tipo = TIPOS[r.local.tipo];
            return {
                id: r.id,
                tipo: tipo.nome,
                emoji: tipo.emoji,
                cor: tipo.cor,
                nome: r.contato?.organizacao || r.contato?.nome || "Local de ajuda",
                regiao: r.local.regiao ?? "",
                pais: r.local.pais ?? "",
                endereco: r.local.endereco ?? "",
                lat: r.local.coordenadas?.latitude ?? null,
                lng: r.local.coordenadas?.longitude ?? null,
                verificado: r.status === "aprovado",
                publicadoEm: r.enviadoEm,
                link: `${tipo.pagina}?id=${encodeURIComponent(r.id)}`
            };
        });
}

// O globo só aceita pontos com coordenadas
function comCoordenadas(locais) {
    return locais.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
}

// Remove acentos e caixa para a busca
function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ex.: "21 ago., 16:38"
function formatarPublicacao(iso) {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "";
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = data.toLocaleDateString("pt-BR", { month: "short" });
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${dia} ${mes}, ${hora}`;
}

function textoBuscavel(local) {
    return normalizar([local.tipo, local.nome, local.regiao, local.pais, local.endereco].join(" "));
}

function el(tag, texto = "", classe = "") {
    const elemento = document.createElement(tag);
    if (texto) elemento.textContent = texto;
    if (classe) elemento.className = classe;
    return elemento;
}

// ---------- cards ----------
function criarCard(local) {
    const estado = local.verificado ? ESTADO_VERIFICACAO.verificado : ESTADO_VERIFICACAO.naoVerificado;

    const card = el("article", "", "card" + (local.verificado ? " card--verificado" : ""));
    card.id = "card-" + local.id;
    card.style.setProperty("--cor", local.cor);

    const topo = el("div", "", "card__topo");
    topo.append(
        el("span", `${local.emoji} ${local.tipo}`, "card__tag"),
        el("span", formatarPublicacao(local.publicadoEm), "card__data")
    );

    const lugar = [local.regiao, local.pais].filter(Boolean).join(" — ");
    const titulo = el("h4", lugar || local.nome);
    const endereco = el("p", local.endereco || "Endereço não informado", "card__endereco");

    // dentro de cada card: a estrela e o que a cor dela significa
    const rodape = el("div", "", "card__rodape");
    const explicacao = el("span", estado.texto, "card__verificacao");
    const estrela = el("span", "★", "card__estrela");
    estrela.setAttribute("role", "img");
    estrela.setAttribute("aria-label", local.verificado ? "Local verificado" : "Local ainda não verificado");
    rodape.append(explicacao, estrela);

    const link = el("a", "Ver detalhes", "card__link");
    link.href = local.link;

    card.append(topo, titulo, endereco, rodape, link);
    return card;
}

function renderizarCards(locais) {
    const lista = document.getElementById("lista-locais");
    lista.replaceChildren();

    // nenhum local cadastrado ainda
    if (LOCAIS.length === 0) {
        const vazio = el("p", "", "lista-vazia");
        vazio.append("Nenhum ponto de ajuda cadastrado ainda. ");
        const link = el("a", "Registrar o primeiro local");
        link.href = URL_REGISTRO;
        vazio.appendChild(link);
        lista.appendChild(vazio);
        return;
    }

    // mais recentes primeiro
    [...locais]
        .sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm))
        .forEach((local) => lista.appendChild(criarCard(local)));
}

function destacarCard(id) {
    document.querySelectorAll("#lista-locais .card--destaque").forEach((c) => c.classList.remove("card--destaque"));
    const card = document.getElementById("card-" + id);
    if (!card) return;
    card.classList.add("card--destaque");
    // espera o painel terminar de subir para rolar até o card
    setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 320);
}

// ---------- globo ----------
function iniciarGlobo(locais) {
    const container = document.getElementById("globo-3d");

    // largura e altura vêm do container (o CSS muda conforme a tela)
    const medidas = () => ({
        largura: container.clientWidth || 300,
        altura: container.clientHeight || 320
    });
    const inicial = medidas();

    globo = Globe()(container)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png")
        .atmosphereColor("#6ea8ff")
        .pointsData(comCoordenadas(locais))
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("cor")
        .pointRadius(0.8)
        .pointAltitude(0.03)
        .pointLabel((l) => `${l.emoji} ${l.tipo} — ${l.pais || l.nome}`)
        .onPointClick((l) => {
            painel?.abrir();
            destacarCard(l.id);
        })
        .width(inicial.largura)
        .height(inicial.altura);

    globo.controls().autoRotate = true;
    globo.controls().autoRotateSpeed = 1.2;
    globo.pointOfView({ lat: 8, lng: -62, altitude: 2.3 });

    // acompanha qualquer mudança: girar o celular, redimensionar a janela, mudar de breakpoint
    const ajustar = () => {
        const { largura, altura } = medidas();
        globo.width(largura).height(altura);
    };

    if ("ResizeObserver" in window) {
        new ResizeObserver(ajustar).observe(container);
    } else {
        window.addEventListener("resize", ajustar);
        window.addEventListener("orientationchange", ajustar);
    }
}

function focarNoGlobo(locais) {
    const pontos = comCoordenadas(locais);
    if (!globo || pontos.length === 0) return;
    const lat = pontos.reduce((s, l) => s + l.lat, 0) / pontos.length;
    const lng = pontos.reduce((s, l) => s + l.lng, 0) / pontos.length;
    globo.controls().autoRotate = false;
    globo.pointOfView({ lat, lng, altitude: 1.6 }, 1200);
}

// ---------- painel que sobe (arrastar para cima mostra os cards) ----------
function iniciarPainel() {
    const elPainel = document.getElementById("painel");
    const alca = document.getElementById("painel-alca");
    const botao = document.getElementById("painel-botao");
    const lista = document.getElementById("lista-locais");

    const LIMITE_ARRASTO = 6;      // px de movimento até contar como arrasto (e não como toque)
    const VELOCIDADE_FLICK = 0.35; // px/ms: um "empurrão" rápido decide sozinho abrir/fechar

    // no computador (1024px+) a lista é uma coluna fixa: não há o que arrastar
    const modoPainel = () => window.matchMedia("(max-width: 1023.98px)").matches;

    let aberto = false;
    let arrastando = false;
    let moveu = false;
    let suprimirClique = false;
    let y0 = 0, base = 0, ultimoY = 0, ultimoT = 0, velocidade = 0;

    // distância (px) que o painel desce quando fechado
    const alturaFechado = () => Math.max(0, elPainel.offsetHeight - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--peek")));

    function definir(valor) {
        aberto = valor;
        elPainel.dataset.estado = valor ? "aberto" : "fechado";
        elPainel.style.transform = "";
        elPainel.classList.remove("arrastando");
        botao.setAttribute("aria-expanded", String(valor));
        botao.setAttribute("aria-label", valor ? "Esconder pontos de ajuda" : "Mostrar pontos de ajuda");
        if (!valor) lista.scrollTop = 0;
    }

    // Durante o arrasto os eventos são ouvidos na janela inteira: o dedo sai de cima do painel
    // quando sobe, e mesmo assim o movimento e a soltura precisam chegar aqui.
    function aoMover(e) {
        if (!arrastando) return;
        const dy = e.clientY - y0;

        if (!moveu) {
            if (Math.abs(dy) < LIMITE_ARRASTO) return;
            moveu = true;
            elPainel.classList.add("arrastando");
        }

        const dt = e.timeStamp - ultimoT;
        if (dt > 0) velocidade = (e.clientY - ultimoY) / dt;
        ultimoY = e.clientY;
        ultimoT = e.timeStamp;

        const y = Math.min(alturaFechado(), Math.max(0, base + dy));
        elPainel.style.transform = `translateY(${y}px)`;
    }

    function encerrar() {
        window.removeEventListener("pointermove", aoMover);
        window.removeEventListener("pointerup", aoSoltar);
        window.removeEventListener("pointercancel", aoCancelar);
        arrastando = false;
    }

    function aoSoltar(e) {
        const foiArrasto = arrastando && moveu;
        encerrar();
        if (!foiArrasto) return; // foi só um toque

        suprimirClique = true;
        setTimeout(() => { suprimirClique = false; }, 80);

        const y = Math.min(alturaFechado(), Math.max(0, base + (e.clientY - y0)));
        if (Math.abs(velocidade) > VELOCIDADE_FLICK) {
            definir(velocidade < 0);        // empurrão para cima abre, para baixo fecha
        } else {
            definir(y < alturaFechado() / 2);
        }
    }

    function aoCancelar() {
        const foiArrasto = arrastando && moveu;
        encerrar();
        if (foiArrasto) definir(aberto);    // volta para onde estava
    }

    elPainel.addEventListener("pointerdown", (e) => {
        if (!modoPainel() || (e.pointerType === "mouse" && e.button !== 0)) return;
        // aberto: arrastar dentro da lista é rolar a lista; só a alça fecha
        if (aberto && lista.contains(e.target)) return;

        arrastando = true;
        moveu = false;
        y0 = ultimoY = e.clientY;
        ultimoT = e.timeStamp;
        velocidade = 0;
        base = aberto ? 0 : alturaFechado();

        window.addEventListener("pointermove", aoMover);
        window.addEventListener("pointerup", aoSoltar);
        window.addEventListener("pointercancel", aoCancelar);
    });

    // depois de um arrasto, o "clique" que o navegador gera não deve abrir o card nem alternar o painel
    elPainel.addEventListener("click", (e) => {
        if (suprimirClique) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    botao.addEventListener("click", () => definir(!aberto));
    // tocar na barrinha também alterna (arrastar já foi tratado acima)
    alca.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        if (modoPainel()) definir(!aberto);
    });

    window.addEventListener("resize", () => { if (!modoPainel()) definir(false); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && aberto) definir(false); });

    painel = { abrir: () => definir(true), fechar: () => definir(false) };
}

// ---------- menu (gaveta) ----------
function iniciarMenu() {
    const menu = document.getElementById("menu");
    const fundo = document.getElementById("menu-fundo");
    const abrir = document.getElementById("btn-menu");
    const fechar = document.getElementById("btn-fechar-menu");

    function definir(valor) {
        menu.classList.toggle("aberto", valor);
        fundo.hidden = !valor;
        abrir.setAttribute("aria-expanded", String(valor));
        document.body.style.overflow = valor ? "hidden" : "";
        if (valor) {
            menu.querySelector("a:not([hidden])")?.focus();
        } else {
            abrir.focus({ preventScroll: true });
        }
    }

    abrir.addEventListener("click", () => definir(true));
    fechar.addEventListener("click", () => definir(false));
    fundo.addEventListener("click", () => definir(false));
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("aberto")) definir(false);
    });
    // se a tela virar "computador" com a gaveta aberta, fecha
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
        if (e.matches && menu.classList.contains("aberto")) definir(false);
    });
}

// ---------- busca ----------
function buscar(termo) {
    const msg = document.getElementById("msg-busca");
    const consulta = normalizar(termo);

    if (!consulta) {
        renderizarCards(LOCAIS);
        globo?.pointsData(comCoordenadas(LOCAIS));
        if (globo) globo.controls().autoRotate = true;
        msg.textContent = "";
        return;
    }

    const resultados = LOCAIS.filter((l) => textoBuscavel(l).includes(consulta));
    renderizarCards(resultados);
    globo?.pointsData(comCoordenadas(resultados));
    painel?.abrir(); // mostra os cards encontrados

    if (resultados.length === 0) {
        msg.textContent = `Nenhum ponto de ajuda encontrado para "${termo.trim()}". Tente outro país ou região.`;
    } else {
        msg.textContent = `${resultados.length} ponto(s) de ajuda encontrado(s).`;
        focarNoGlobo(resultados);
    }
}

// recarrega quando um local novo é cadastrado (ou muda de status) em outra aba
window.addEventListener("storage", (evento) => {
    if (evento.key !== GH.CHAVES.locais) return;
    LOCAIS = carregarLocais();
    buscar(document.getElementById("busca").value);
});

// ---------- início ----------
window.addEventListener("DOMContentLoaded", () => {
    LOCAIS = carregarLocais();
    renderizarCards(LOCAIS);

    iniciarMenu();
    iniciarPainel();

    document.getElementById("form-busca").addEventListener("submit", (evento) => {
        evento.preventDefault();
        buscar(document.getElementById("busca").value);
        document.getElementById("busca").blur(); // fecha o teclado no celular
    });

    try {
        iniciarGlobo(LOCAIS);
    } catch (erro) {
        console.error("Não foi possível iniciar o globo:", erro);
    }
});
