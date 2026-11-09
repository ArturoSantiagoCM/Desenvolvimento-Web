
// Enquanto não há API, os dados do perfil são armazenados no localStorage

// Define a chave usada para salvar e buscar o perfil
const CHAVE_PERFIL = "gohelping_perfil";

// Prazo estimado para a verificação dos dados
const HORAS_VERIFICACAO = 24;

// Dados de exemplo usados quando não existe um perfil salvo
const PERFIL_EXEMPLO = {
    nome: "Maria da Silva",
    nascimento: "1990-08-15", // Data no formato ano-mês-dia
    pais: "Brasil",
    tipoDocumento: "CPF",
    numeroDocumento: "12345678900",
    enviadoEm: new Date().toISOString(), // Registra a data e hora atual
    status: "pendente" // Pode ser pendente, verificado ou recusado
};

// Busca os dados do perfil no localStorage
function carregarPerfil() {
    try {
        const salvo = localStorage.getItem(CHAVE_PERFIL);

        // Se houver dados salvos, utiliza eles. Senão, usa o perfil de exemplo
        return salvo ? JSON.parse(salvo) : PERFIL_EXEMPLO;

    } catch (erro) {
        // Se ocorrer algum erro na leitura, utiliza os dados de exemplo
        console.error("Não foi possível ler o perfil salvo:", erro);
        return PERFIL_EXEMPLO;
    }
}

// Converte a data do formato ano-mês-dia para dia/mês/ano
function formatarData(iso) {
    const [ano, mes, dia] = String(iso).split("-");

    // Se a data estiver completa, formata. Senão, mostra um traço
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : "-";
}

// Formata o número do documento de acordo com o tipo
function formatarDocumento(tipo, numero) {

    // Remove todos os caracteres que não sejam números
    const digitos = String(numero).replace(/\D/g, "");

    // Se for CPF com 11 dígitos, adiciona pontos e hífen
    if (tipo === "CPF" && digitos.length === 11) {
        return digitos.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    }

    // Para outros documentos, mantém o formato original
    return numero;
}

// Oculta os números do documento, deixando apenas os dois últimos visíveis
function ocultarDocumento(texto) {
    return texto.replace(/\d(?=.*\d{2}$)/g, "*");
}

// Define a mensagem que será mostrada de acordo com o status do perfil
function mensagemStatus(perfil) {

    // Se o perfil já foi verificado
    if (perfil.status === "verificado") {
        return "Status: perfil verificado.";
    }

    // Se a verificação foi recusada
    if (perfil.status === "recusado") {
        return "Status: não foi possível verificar seus dados. Revise as informações e envie novamente.";
    }

    // Calcula o prazo de 24 horas a partir do envio dos dados
    const limite = new Date(perfil.enviadoEm).getTime()
        + HORAS_VERIFICACAO * 60 * 60 * 1000;

    // Calcula quantas horas ainda faltam para terminar o prazo
    const horasRestantes = Math.ceil(
        (limite - Date.now()) / (60 * 60 * 1000)
    );

    // Mostra o tempo restante ou informa que o prazo foi ultrapassado
    return horasRestantes > 0
        ? `Status: seus dados foram enviados para verificação. Faltam cerca de ${horasRestantes}h para o prazo de ${HORAS_VERIFICACAO}h.`
        : "Status: a verificação está levando mais que o previsto. Tente novamente mais tarde.";
}

// Carrega os dados do perfil e coloca as informações na página
function iniciarPerfil() {

    // Busca o perfil e formata o documento
    const perfil = carregarPerfil();
    const documento = formatarDocumento(perfil.tipoDocumento, perfil.numeroDocumento);

    // O documento começa oculto
    let documentoVisivel = false;

    // Preenche os campos do HTML com os dados do perfil
    // Se algum campo estiver vazio, mostra um traço
    document.getElementById("nome").textContent = perfil.nome || "-";
    document.getElementById("nascimento").textContent = formatarData(perfil.nascimento);
    document.getElementById("pais").textContent = perfil.pais || "-";
    document.getElementById("tipo-documento").textContent = perfil.tipoDocumento || "-";

    // Mostra a mensagem de verificação do perfil
    document.getElementById("status-verificacao").textContent = mensagemStatus(perfil);

    // Pega o campo do documento e o botão de mostrar/ocultar
    const campoDocumento = document.getElementById("numero-documento");
    const botao = document.getElementById("btn-mostrar");

    // Atualiza a exibição do documento e o texto do botão
    function atualizarDocumento() {

        // Mostra o documento completo ou com os números ocultos
        campoDocumento.textContent = documentoVisivel
            ? documento
            : ocultarDocumento(documento);

        // Altera o texto do botão de acordo com o estado atual
        botao.textContent = documentoVisivel ? "Ocultar" : "Mostrar";

        // Informa aos leitores de tela se o botão está ativado
        botao.setAttribute("aria-pressed", String(documentoVisivel));
    }

    // Alterna entre mostrar e ocultar o documento ao clicar no botão
    botao.addEventListener("click", () => {
        documentoVisivel = !documentoVisivel;
        atualizarDocumento();
    });

    // Inicia a página com o documento oculto
    atualizarDocumento();
}

// Executa a função depois que o HTML terminar de carregar
document.addEventListener("DOMContentLoaded", iniciarPerfil);
