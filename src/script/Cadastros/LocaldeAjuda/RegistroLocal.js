// ===== CONTA DO USUÁRIO (ID automático criado no cadastro da pessoa) =====
const avisoConta = document.getElementById("aviso-conta");

// Mostra se o local será ligado a uma conta e, se sim, qual ID
function mostrarAvisoConta() {
    const usuario = GH.usuarioAtual();
    avisoConta.replaceChildren();

    if (usuario) {
        avisoConta.className = "aviso-conta aviso-conta--ok";
        avisoConta.append(
            `Registrando como ${usuario.pessoa?.nome ?? "usuário"} · ID `,
            Object.assign(document.createElement("strong"), { textContent: usuario.id }),
            ". Este local ficará guardado na sua conta e você poderá apagá-lo pelo Perfil."
        );
        return;
    }

    avisoConta.className = "aviso-conta";
    const criar = Object.assign(document.createElement("a"), { href: "../Pessoa/CP_1.html", textContent: "criar uma conta" });
    const entrar = Object.assign(document.createElement("a"), { href: "../../Perfil/PerfilUsuario.html", textContent: "entrar" });
    avisoConta.append("Você não está em uma conta. O local será registrado sem vínculo e você não poderá vê-lo nem apagá-lo depois. Você pode ", criar, " ou ", entrar, " antes de registrar.");
}

// Se há conta, já preenche nome e e-mail (a pessoa ainda pode editar)
function preencherContatoDaConta() {
    const usuario = GH.usuarioAtual();
    if (!usuario) return;
    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    if (!nome.value) nome.value = usuario.pessoa?.nome ?? "";
    if (!email.value) email.value = usuario.contato?.email ?? "";
}

mostrarAvisoConta();
preencherContatoDaConta();

// ===== VALIDAÇÕES DOS CAMPOS (mesmas regras dos cadastros CP_1 e CP_2) =====
// Cada campo é limpo (espaços extras, caracteres de controle) ao sair dele e conferido de novo no envio.
const REGRA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE_CONTADOR = 0.8; // o contador aparece quando chega a 80% do limite

const $ = (id) => document.getElementById(id);

// espaços repetidos viram um só; remove caracteres invisíveis de controle
const limparLinha = (texto) => texto.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
// textarea: mantém quebras de linha, mas no máximo uma linha em branco seguida
const limparTexto = (texto) => texto.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

function mostrarErro(campo, span, texto) {
    campo.setAttribute("aria-invalid", "true");
    if (span) {
        span.style.display = "block";
        span.textContent = texto;
    }
    return false;
}

function limparErro(campo, span) {
    campo.setAttribute("aria-invalid", "false");
    if (span) {
        span.style.display = "none";
        span.textContent = "";
    }
    return true;
}

// Liga o contador "x / máximo" (aparece perto do limite) a um campo
function ligarContador(campo, contador) {
    if (!contador) return;
    const max = Number(campo.maxLength);
    const atualizar = () => {
        const tamanho = campo.value.length;
        contador.textContent = max > 0 && tamanho >= max * LIMITE_CONTADOR ? `${tamanho} / ${max}` : "";
    };
    campo.addEventListener("input", atualizar);
    campo.atualizarContador = atualizar;
}

// Telefone: aceita + ( ) - . e espaços; precisa ter de 8 a 15 dígitos
function telefoneValido(texto) {
    if (!/^[+\d\s().-]+$/.test(texto)) return false;
    const digitos = texto.replace(/\D/g, "");
    return digitos.length >= 8 && digitos.length <= 15;
}

// Site/rede social: opcional; aceita "exemplo.org", "https://..." ou "instagram.com/perfil"
function siteValido(texto) {
    try {
        const url = new URL(/^https?:\/\//i.test(texto) ? texto : "https://" + texto);
        return ["http:", "https:"].includes(url.protocol) && /^[^.\s]+(\.[^.\s]+)+$/.test(url.hostname);
    } catch {
        return false;
    }
}

// Regras de cada campo. "validar" devolve a mensagem de erro, ou "" se estiver tudo certo.
const CAMPOS = [
    {
        id: "nome", erro: "erro-nome", contador: "nameCounter", limpar: limparLinha,
        validar: (v) => {
            if (!v) return "O nome é obrigatório.";
            if (v.length < 3 || !v.includes(" ")) return "Informe o nome completo, como no documento.";
            return "";
        }
    },
    {
        id: "email", erro: "erro-email", limpar: (v) => v.trim(),
        validar: (v) => {
            if (!v) return "O e-mail é obrigatório.";
            return REGRA_EMAIL.test(v) ? "" : "Insira um e-mail válido (ex: nome@dominio.com).";
        }
    },
    {
        id: "telefone", erro: "erro-telefone", limpar: limparLinha,
        validar: (v) => {
            if (!v) return "O telefone é obrigatório.";
            return telefoneValido(v) ? "" : "Telefone inválido. Use de 8 a 15 números (ex: (19) 99999-9999).";
        }
    },
    {
        id: "ong", erro: "erro-ong", contador: "ongCounter", limpar: limparLinha,
        validar: (v) => (v && v.length < 2 ? "O nome da organização deve ter pelo menos 2 caracteres." : "")
    },
    {
        id: "site", erro: "erro-site", limpar: (v) => v.trim(),
        validar: (v) => (v && !siteValido(v) ? "Site ou rede social inválido (ex: www.exemplo.org)." : "")
    },
    {
        id: "tipo", erro: "erro-tipo", limpar: (v) => v,
        validar: (v) => (v ? "" : "Selecione o tipo de local.")
    },
    {
        id: "endereço", erro: "endereçoError", contador: "endereçoCounter", limpar: limparTexto,
        validar: (v) => {
            if (!v) return "O endereço é obrigatório.";
            return v.length < 5 ? "Informe o endereço completo (rua, número, cidade)." : "";
        }
    },
    {
        id: "descricao", erro: "descricaoError", contador: "descricaoCounter", limpar: limparTexto,
        validar: (v) => (v && v.length < 10 ? "Descreva melhor o local (mínimo de 10 caracteres)." : "")
    }
];

// Garante que cada campo tenha um lugar para a mensagem de erro (alguns não tinham no HTML)
CAMPOS.forEach((regra) => {
    regra.campo = $(regra.id);
    regra.span = $(regra.erro);
    if (!regra.span) {
        regra.span = document.createElement("span");
        regra.span.id = regra.erro;
        regra.span.className = "msg-erro";
        regra.span.setAttribute("role", "alert");
        regra.span.style.cssText = "display: none; color: #d93025; font-size: 0.875rem; margin-top: 4px;";
        // vem logo depois do campo (antes dos <br> que o seguem)
        regra.campo.insertAdjacentElement("afterend", regra.span);
    }
    regra.campo.setAttribute("aria-describedby", [regra.contador, regra.erro].filter(Boolean).join(" "));
    ligarContador(regra.campo, $(regra.contador));

    // ao sair do campo: limpa o texto e mostra o erro (se houver)
    regra.campo.addEventListener("blur", () => validarCampo(regra));
    // depois de um erro, some assim que a pessoa corrige
    regra.campo.addEventListener("input", () => {
        if (regra.campo.getAttribute("aria-invalid") === "true" && !regra.validar(regra.limpar(regra.campo.value))) {
            limparErro(regra.campo, regra.span);
        }
    });
});

function validarCampo(regra) {
    regra.campo.value = regra.limpar(regra.campo.value);
    regra.campo.atualizarContador?.();
    const mensagem = regra.validar(regra.campo.value);
    return mensagem ? mostrarErro(regra.campo, regra.span, mensagem) : limparErro(regra.campo, regra.span);
}

// Confere o formulário todo; devolve o primeiro campo com problema (ou null)
function validarFormulario() {
    let primeiroErro = null;
    CAMPOS.forEach((regra) => {
        if (!validarCampo(regra) && !primeiroErro) primeiroErro = regra.campo;
    });
    return primeiroErro;
}

function limparTodosOsErros() {
    CAMPOS.forEach((regra) => {
        limparErro(regra.campo, regra.span);
        if (regra.contador && $(regra.contador)) $(regra.contador).textContent = "";
    });
}

// ===== PASSO 2: MAPA ESTILO UBER (PIN FIXO NO CENTRO) =====
const inputLat = document.getElementById("latitude");
const inputLng = document.getElementById("longitude");
const inputBusca = document.getElementById("busca-endereco");
const botaoBuscar = document.getElementById("btn-buscar");

const VISTA_INICIAL = { centro: [-14.235, -51.925], zoom: 4 }; // Brasil
const TEXTO_DICA = "Arraste o mapa para posicionar o pin no ponto exato";

const mapa = L.map("meu-mapa").setView(VISTA_INICIAL.centro, VISTA_INICIAL.zoom);

// Mesmo servidor de mapa do Mapa Mundial (HOT). O servidor padrão do OpenStreetMap bloqueia
// páginas abertas sem "referer" (como arquivo no computador), e o mapa ficava em branco.
const TILES_HOT = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
const TILES_OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const camadaBase = L.tileLayer(TILES_HOT, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>'
}).addTo(mapa);

// Se o servidor HOT falhar (fora do ar), troca sozinho pelo padrão do OpenStreetMap
let trocouCamada = false;
camadaBase.on("tileerror", () => {
    if (trocouCamada) return;
    trocouCamada = true;
    camadaBase.setUrl(TILES_OSM);
});

// O Leaflet mede o tamanho do mapa quando ele nasce; depois que a página termina de montar, mede de novo
window.addEventListener("load", () => mapa.invalidateSize());
setTimeout(() => mapa.invalidateSize(), 300);

// O mapa precisa recalcular o tamanho quando a tela gira ou muda de tamanho
window.addEventListener("resize", () => mapa.invalidateSize());
window.addEventListener("orientationchange", () => setTimeout(() => mapa.invalidateSize(), 200));

// Pin fixo no centro (não é um marcador do Leaflet: é um elemento por cima do mapa)
const containerMapa = mapa.getContainer();

const pin = document.createElement("div");
pin.className = "pin-central";
pin.innerHTML = `
    <div class="pin-sombra"></div>
    <svg class="pin-corpo" viewBox="0 0 24 36" width="32" height="48" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#d93025"/>
        <circle cx="12" cy="12" r="4.5" fill="#fff"/>
    </svg>`;
containerMapa.appendChild(pin);

const dica = document.createElement("div");
dica.className = "dica-mapa";
dica.textContent = TEXTO_DICA;
containerMapa.appendChild(dica);

let resetando = false;

// Guarda no formulário as coordenadas do centro do mapa (onde está a ponta do pin)
function atualizarPonto() {
    const centro = mapa.getCenter().wrap();
    inputLat.value = centro.lat.toFixed(6);
    inputLng.value = centro.lng.toFixed(6);
    dica.textContent = `Ponto selecionado: ${inputLat.value}, ${inputLng.value}`;
}

mapa.on("movestart", () => pin.classList.add("levantado"));

mapa.on("moveend", () => {
    pin.classList.remove("levantado");
    if (!resetando) atualizarPonto();
});

// Volta o mapa ao estado inicial (usado depois do envio)
function resetarMapa() {
    resetando = true;
    inputLat.value = "";
    inputLng.value = "";
    mapa.setView(VISTA_INICIAL.centro, VISTA_INICIAL.zoom, { animate: false });
    resetando = false;
    dica.textContent = TEXTO_DICA;
}

// Ao entrar, leva o mapa para onde a pessoa está (se ela permitir); senão fica na vista inicial
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (posicao) => mapa.setView([posicao.coords.latitude, posicao.coords.longitude], 15),
        () => { /* recusou ou indisponível: continua na vista inicial */ },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Busca por país/cidade: leva o mapa até a região e você ajusta arrastando
async function buscarEndereco() {
    const consulta = inputBusca.value.trim();
    if (!consulta) return;

    botaoBuscar.disabled = true;

    try {
        const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q="
            + encodeURIComponent(consulta);
        const resposta = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
        const resultados = await resposta.json();

        if (resultados.length === 0) {
            alert("Local não encontrado. Tente outro nome.");
            return;
        }

        mapa.setView([parseFloat(resultados[0].lat), parseFloat(resultados[0].lon)], 17);
    } catch {
        alert("Não foi possível buscar agora. Verifique sua conexão.");
    } finally {
        botaoBuscar.disabled = false;
    }
}

botaoBuscar.addEventListener("click", buscarEndereco);

inputBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        buscarEndereco();
    }
});
// ===== PASSO 3: LISTA DE NECESSIDADES =====
const listaUl = document.getElementById("lista");
const inputNovo = document.getElementById("novo");
const botaoAdd = document.getElementById("add");
const itensFormatados = document.getElementById("itens-formatados");

let necessidades = [];

function renderizarLista() {
    listaUl.innerHTML = "";

    necessidades.forEach((item, posicao) => {
        const li = document.createElement("li");

        const texto = document.createElement("span");
        texto.textContent = item;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.textContent = "Remover";
        remover.addEventListener("click", () => {
            necessidades.splice(posicao, 1);
            renderizarLista();
        });

        li.append(texto, " ", remover);
        listaUl.appendChild(li);
    });

    // campo invisível com os itens separados por "|"
    itensFormatados.value = necessidades.join("|");
}

function adicionarItem() {
    const item = inputNovo.value.trim().replace(/\s+/g, " ");
    if (!item) return;

    const repetido = necessidades.some(n => n.toLowerCase() === item.toLowerCase());
    if (!repetido) {
        necessidades.push(item);
        renderizarLista();
    }

    inputNovo.value = "";
    inputNovo.focus();
}

botaoAdd.addEventListener("click", adicionarItem);

// Enter no campo adiciona o item (e não envia o formulário)
inputNovo.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        adicionarItem();
    }
});

// ===== ENVIO DO FORMULÁRIO → LOCAL STORAGE =====
const formulario = document.querySelector("form");
const CHAVE_REGISTROS = "locaisDeAjuda";

function lerRegistros() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) ?? [];
    } catch {
        return [];
    }
}

function montarRegistro(id) {
    const valor = (campo) => document.getElementById(campo).value.trim();
    const lat = parseFloat(valor("latitude"));
    const lng = parseFloat(valor("longitude"));

    return {
        id,
        usuarioId: GH.usuarioAtual()?.id ?? null, // ID da conta que registrou (null se não havia conta)
        enviadoEm: new Date().toISOString(),
        status: "em_analise",
        contato: {
            nome: valor("nome"),
            email: valor("email"),
            telefone: valor("telefone"),
            organizacao: valor("ong") || null,
            site: valor("site") || null
        },
        local: {
            tipo: valor("tipo"),
            endereco: valor("endereço"),
            descricao: valor("descricao"),
            coordenadas: {
                latitude: isNaN(lat) ? null : lat,
                longitude: isNaN(lng) ? null : lng
            }
        },
        necessidades: [...necessidades]
    };
}
// Descobre estado e país do ponto escolhido (usado nos cards e na busca da tela inicial)
async function descobrirRegiao(lat, lng) {
    try {
        const url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=5&accept-language=pt-BR"
            + `&lat=${lat}&lon=${lng}`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        return {
            regiao: dados.address?.state ?? dados.address?.region ?? null,
            pais: dados.address?.country ?? null
        };
    } catch {
        return { regiao: null, pais: null };
    }
}
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // dados limpos e válidos antes de qualquer coisa
    const campoComErro = validarFormulario();
    if (campoComErro) {
        campoComErro.focus();
        campoComErro.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    if (!inputLat.value || !inputLng.value) {
        alert("Arraste o mapa até o ponto exato do local.");
        document.getElementById("meu-mapa").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const botaoEnviar = formulario.querySelector('button[type="submit"]');
    botaoEnviar.disabled = true;

    // estado e país a partir do ponto escolhido (se falhar, ficam null)
    const { regiao, pais } = await descobrirRegiao(inputLat.value, inputLng.value);

    const registros = lerRegistros();
    const novoId = registros.length ? Math.max(...registros.map(r => r.id)) + 1 : 1;
    const registro = montarRegistro(novoId);
    registro.local.regiao = regiao;
    registro.local.pais = pais;

    registros.push(registro);

    try {
        localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
    } catch {
        alert("Não foi possível salvar no navegador.");
        botaoEnviar.disabled = false;
        return;
    }

    formulario.reset();
    necessidades = [];
    renderizarLista();
    resetarMapa();

    limparTodosOsErros();

    // o reset limpou nome e e-mail: preenche de novo se houver conta
    mostrarAvisoConta();
    preencherContatoDaConta();

    botaoEnviar.disabled = false;
    alert(registro.usuarioId
        ? `Local enviado para análise! Ele está na sua conta (${registro.usuarioId}).`
        : "Local enviado para análise!");
});