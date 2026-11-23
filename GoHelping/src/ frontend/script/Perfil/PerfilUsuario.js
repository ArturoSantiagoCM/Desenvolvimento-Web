// O perfil lê a conta guardada no localStorage (criada nos passos CP_1 a CP_3)
// e lista os locais de ajuda que essa conta registrou. Tudo passa pelo módulo GH.

// Prazo estimado para a verificação dos dados
const HORAS_VERIFICACAO = 24;

const TIPOS_LOCAL = {
    coleta:      { nome: "Centro de Coleta",   emoji: "🏠", pagina: "CentrodeColeta.html" },
    veterinario: { nome: "Centro Veterinário", emoji: "🐾", pagina: "CentroVeterinario.html" },
    medico:      { nome: "Centro Médico",      emoji: "🏥", pagina: "CentroMedico.html" },
    ong:         { nome: "ONG",                emoji: "⛑️", pagina: "ONG.html" }
};

const STATUS_LOCAL = {
    em_analise: "Em análise",
    aprovado: "Aprovado",
    recusado: "Recusado"
};

const $ = (id) => document.getElementById(id);

// ---------- formatação ----------

// Converte AAAA-MM-DD para DD/MM/AAAA
function formatarData(iso) {
    const [ano, mes, dia] = String(iso ?? "").split("-");
    return ano && mes && dia ? `${dia.slice(0, 2)}/${mes}/${ano}` : "-";
}

function formatarDataHora(iso) {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "-";
    return data.toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
}

// CPF vira 000.000.000-00; os outros documentos ficam como foram guardados
function formatarDocumento(tipo, numero) {
    const digitos = String(numero ?? "").replace(/\D/g, "");
    if (tipo === "CPF" && digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return String(numero ?? "-");
}

// Oculta os caracteres do documento, deixando só os dois últimos visíveis
function ocultarDocumento(texto) {
    return texto.replace(/[0-9A-Za-z](?=.*[0-9A-Za-z]{2}$)/g, "•");
}

// Mensagem de acordo com o status da conta
function mensagemStatus(usuario) {
    if (usuario.status === "verificado") {
        return "Status: perfil verificado.";
    }
    if (usuario.status === "recusado") {
        return "Status: não foi possível verificar seus dados. Revise as informações e envie novamente.";
    }

    const limite = new Date(usuario.criadoEm).getTime() + HORAS_VERIFICACAO * 60 * 60 * 1000;
    const horasRestantes = Math.ceil((limite - Date.now()) / (60 * 60 * 1000));

    return horasRestantes > 0
        ? `Status: seus dados foram enviados para verificação. Faltam cerca de ${horasRestantes}h para o prazo de ${HORAS_VERIFICACAO}h.`
        : "Status: a verificação está levando mais que o previsto. Tente novamente mais tarde.";
}

function rotuloSituacao(status) {
    return { pendente: "Aguardando verificação", verificado: "Verificada", recusado: "Recusada" }[status] ?? "-";
}

// ---------- tela de entrar ----------

function mostrarLogin() {
    $("area-conta").hidden = true;
    $("status-verificacao").hidden = true;
    $("area-login").hidden = false;
}

function configurarLogin() {
    const form = $("form-login");
    const campo = $("login-email");
    const erro = $("erro-login");

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();

        // entra pelo ID da conta (GH-XXXXXXXX), não pelo e-mail
        const id = GH.normalizarIdUsuario(campo.value);
        if (!id) {
            campo.setAttribute("aria-invalid", "true");
            erro.hidden = false;
            erro.textContent = campo.value.trim()
                ? "ID inválido. Ele tem o formato GH-XXXXXXXX (8 letras e números)."
                : "Informe o ID da sua conta.";
            campo.focus();
            return;
        }
        campo.value = id;

        const usuario = GH.buscarUsuarioPorId(id);
        if (!usuario) {
            campo.setAttribute("aria-invalid", "true");
            erro.hidden = false;
            erro.textContent = "Não encontramos uma conta com este ID neste navegador.";
            campo.focus();
            return;
        }

        // JWT (futuro): trocar a busca local por GH.requisitar("/auth/login", { body: { id } ... })
        // e passar o que a API devolver: GH.entrar(usuario.id, { token, refreshToken })
        GH.entrar(usuario.id);
        campo.setAttribute("aria-invalid", "false");
        erro.hidden = true;
        campo.value = "";
        iniciarPerfil();
    });
}

// ---------- dados da conta ----------

function preencherConta(usuario) {
    $("id-usuario").textContent = usuario.id;
    $("criada-em").textContent = formatarDataHora(usuario.criadoEm);
    $("situacao").textContent = rotuloSituacao(usuario.status);

    $("nome").textContent = usuario.pessoa?.nome || "-";
    $("nascimento").textContent = formatarData(usuario.pessoa?.nascimento);
    $("pais").textContent = usuario.pessoa?.pais || "-";
    $("email").textContent = usuario.contato?.email || "-";

    $("tipo-documento").textContent = usuario.documento?.tipo || "-";
    $("arquivo-documento").textContent = usuario.documento?.arquivo || "Não informada";
    $("selfie").textContent = usuario.verificacao?.selfie?.enviada
        ? `Enviada (${usuario.verificacao.selfie.arquivo ?? "sem nome"})`
        : "Não enviada";

    const status = $("status-verificacao");
    status.textContent = mensagemStatus(usuario);
    status.hidden = false;
}

// O número do documento começa oculto; o botão alterna
function configurarDocumento(usuario) {
    const texto = formatarDocumento(usuario.documento?.tipo, usuario.documento?.numero);
    const campo = $("numero-documento");
    const botao = $("btn-mostrar");
    let visivel = false;

    function atualizar() {
        campo.textContent = visivel ? texto : ocultarDocumento(texto);
        botao.textContent = visivel ? "Ocultar" : "Mostrar";
        botao.setAttribute("aria-pressed", String(visivel));
    }

    botao.onclick = () => {
        visivel = !visivel;
        atualizar();
    };
    atualizar();
}

function configurarBotoesConta(usuario) {
    $("btn-sair").onclick = () => {
        GH.sair();
        iniciarPerfil();
    };

    $("btn-copiar").onclick = async () => {
        const botao = $("btn-copiar");
        try {
            await navigator.clipboard.writeText(usuario.id);
            botao.textContent = "Copiado!";
        } catch {
            botao.textContent = "Selecione e copie";
        }
        setTimeout(() => { botao.textContent = "Copiar"; }, 2000);
    };
}

// ---------- locais registrados pela conta ----------

function el(tag, texto = "", classe = "") {
    const elemento = document.createElement(tag);
    if (texto) elemento.textContent = texto;
    if (classe) elemento.className = classe;
    return elemento;
}

function criarItemLocal(local, usuario) {
    const tipo = TIPOS_LOCAL[local.local?.tipo];
    const nome = local.contato?.organizacao || local.contato?.nome || "Local de ajuda";
    const lugar = [local.local?.regiao, local.local?.pais].filter(Boolean).join(" — ");

    const item = el("li", "", "local");
    item.dataset.id = local.id;

    const topo = el("div", "", "local__topo");
    topo.append(
        el("strong", `${tipo?.emoji ?? "📍"} ${nome}`, "local__nome"),
        el("span", STATUS_LOCAL[local.status] ?? "Em análise", "etiqueta")
    );

    const linhas = el("div", "", "local__dados");
    linhas.append(
        el("span", [tipo?.nome, lugar].filter(Boolean).join(" · ")),
        el("span", local.local?.endereco || "Endereço não informado"),
        el("span", `Registrado em ${formatarDataHora(local.enviadoEm)}`, "local__data"),
        el("span", `ID do usuário: ${local.usuarioId}`, "local__data")
    );

    const acoes = el("div", "", "local__acoes");
    if (tipo) {
        const ver = el("a", "Ver detalhes", "botao botao--contorno botao--mini");
        ver.href = `../TiposdeCentros/${tipo.pagina}?id=${encodeURIComponent(local.id)}`;
        acoes.appendChild(ver);
    }

    const apagar = el("button", "Apagar", "botao botao--perigo botao--mini");
    apagar.type = "button";
    apagar.setAttribute("aria-label", `Apagar o local ${nome}`);
    apagar.addEventListener("click", () => {
        const confirmou = confirm(`Apagar "${nome}"? Ele será removido deste navegador e não poderá ser recuperado.`);
        if (!confirmou) return;

        if (!GH.apagarLocal(local.id, usuario.id)) {
            alert("Não foi possível apagar este local.");
            return;
        }
        renderizarLocais(usuario);
    });
    acoes.appendChild(apagar);

    item.append(topo, linhas, acoes);
    return item;
}

// Locais cadastrados com o e-mail da conta, mas antes de ela existir (sem usuarioId)
function locaisSemDono(usuario) {
    const email = String(usuario.contato?.email ?? "").trim().toLowerCase();
    return GH.listarLocais().filter((l) =>
        !l.usuarioId && String(l.contato?.email ?? "").trim().toLowerCase() === email
    );
}

function renderizarLocais(usuario) {
    const lista = $("lista-locais");
    const meus = GH.locaisDoUsuario(usuario.id)
        .sort((a, b) => new Date(b.enviadoEm) - new Date(a.enviadoEm));

    lista.replaceChildren(...meus.map((l) => criarItemLocal(l, usuario)));
    $("contador-locais").textContent = meus.length ? `(${meus.length})` : "";
    $("locais-vazio").hidden = meus.length > 0;

    const orfaos = locaisSemDono(usuario);
    $("aviso-vinculo").hidden = orfaos.length === 0;
    if (orfaos.length) {
        $("texto-vinculo").textContent = orfaos.length === 1
            ? "Encontramos 1 local registrado com o seu e-mail antes de você criar a conta."
            : `Encontramos ${orfaos.length} locais registrados com o seu e-mail antes de você criar a conta.`;
    }

    $("btn-vincular").onclick = () => {
        const ids = new Set(locaisSemDono(usuario).map((l) => l.id));
        const atualizados = GH.listarLocais().map((l) => ids.has(l.id) ? { ...l, usuarioId: usuario.id } : l);
        if (!GH.gravarLocais(atualizados)) {
            alert("Não foi possível salvar no navegador.");
            return;
        }
        renderizarLocais(usuario);
    };
}

// ---------- início ----------

function iniciarPerfil() {
    const usuario = GH.usuarioAtual();

    if (!usuario) {
        mostrarLogin();
        return;
    }

    $("area-login").hidden = true;
    $("area-conta").hidden = false;

    preencherConta(usuario);
    configurarDocumento(usuario);
    configurarBotoesConta(usuario);
    renderizarLocais(usuario);
}

document.addEventListener("DOMContentLoaded", () => {
    configurarLogin();
    iniciarPerfil();
});

// se algo mudar em outra aba (novo local, conta, saída), atualiza esta
window.addEventListener("storage", (evento) => {
    if ([GH.CHAVES.locais, GH.CHAVES.usuarios, GH.CHAVES.sessao].includes(evento.key)) {
        iniciarPerfil();
    }
});
