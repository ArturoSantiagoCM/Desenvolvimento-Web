
document.addEventListener("DOMContentLoaded", function () {

    // Encontrar os textos do HTML
    const titulo = document.querySelector("main h2");
    const descricao = document.querySelector("main h3");

    if (!titulo || !descricao) return;

    // Verificar se a etapa 3 foi concluída
    const concluido = sessionStorage.getItem(
        "gohelping_cp3_concluido"
    ) === "sim";

    if (concluido) {

        titulo.textContent = "Etapas preenchidas!";

        descricao.textContent =
            "Sua selfie foi validada neste navegador. " +
            "Para enviar os dados e solicitar verificação " +
            "da conta, ainda é necessário conectar " +
            "o cadastro a um servidor.";

    } else {

        titulo.textContent = "Verificação não iniciada";

        descricao.textContent =
            "Conclua as etapas do cadastro para chegar " +
            "a esta tela. Nenhum documento foi enviado " +
            "para verificação.";

    }

});
