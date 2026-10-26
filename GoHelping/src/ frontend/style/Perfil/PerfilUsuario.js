// Enquanto não há API os dados vem do local storage

const CHAVE_PERFIL = "gohelping_perfil";
const HORAS_VERIFICACAO = 24;

// Dados de exemplo
const PERFIL_EXEMPLO = {
    nome: "Maria da Silva",
    nascimento: "1990-08-15", // formato ISO 
    pais: "Brasil",
    tipoDocumento: "CPF",
    numeroDocumento: "12345678900",
    enviadoEm: new Date().toISOString(),
    status: "pendente" // "pendente", "verificado", "recusado"
};

function carregarPerfil() {
    try {
        const salvo = localStorage.getItem(CHAVE_PERFIL);
        return salvo ? JSON.parse(salvo) : PERFIL_EXEMPLO;
    } catch (erro) {
        console.error("Não foi possível ler o perfil salvo:", erro);
        return PERFIL_EXEMPLO;
    }
}

function formatarData(iso) {
    const [ano, mes, dia] = String(iso).split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : "-";
}

function formatarDocumento(tipo, numero) {
    const digitos = String(numero).replace(/\D/g, "");
    if (tipo === "CPF" && digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return numero;
}

// Esconde tudo, exceto os 2 últimos caracteres
function ocultarDocumento(texto) {
    return texto.replace(/\d(?=.*\d{2}$)/g, "*");
}

function mensagemStatus(perfil) {
    if (perfil.status === "verificado") {
        return "Status: perfil verificado.";
    }
    if (perfil.status === "recusado") {
        return "Status: não foi possível verificar seus dados. Revise as informações e envie novamente.";
    }
    const limite = new Date(perfil.enviadoEm).getTime() + HORAS_VERIFICACAO * 60 * 60 * 1000;
    const horasRestantes = Math.ceil((limite - Date.now()) / (60 * 60 * 1000));
    return horasRestantes > 0
        ? `Status: seus dados foram enviados para verificação. Faltam cerca de ${horasRestantes}h para o prazo de ${HORAS_VERIFICACAO}h.`
        : "Status: a verificação está levando mais que o previsto. Tente novamente mais tarde.";
}

function iniciarPerfil() {
    const perfil = carregarPerfil();
    const documento = formatarDocumento(perfil.tipoDocumento, perfil.numeroDocumento);
    let documentoVisivel = false;
    
    document.getElementById("nome").textContent = perfil.nome || "-";
    document.getElementById("nascimento").textContent = formatarData(perfil.nascimento);
    document.getElementById("pais").textContent = perfil.pais || "-";
    document.getElementById("tipo-documento").textContent = perfil.tipoDocumento || "-";
    document.getElementById("status-verificacao").textContent = mensagemStatus(perfil);

    const campoDocumento = document.getElementById("numero-documento");
    const botao = document.getElementById("btn-mostrar");

    function atualizarDocumento() {
        campoDocumento.textContent = documentoVisivel ? documento : ocultarDocumento(documento);
        botao.textContent = documentoVisivel ? "Ocultar" : "Mostrar";
        botao.setAttribute("aria-pressed", String(documentoVisivel));
    }

    botao.addEventListener("click", () => {
        documentoVisivel = !documentoVisivel;
        atualizarDocumento();
    });

    atualizarDocumento();
}

document.addEventListener("DOMContentLoaded", iniciarPerfil);