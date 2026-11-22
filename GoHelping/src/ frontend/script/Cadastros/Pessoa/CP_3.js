
document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.querySelector("form");
    const foto = document.getElementById("foto");

    if (!formulario || !foto) return;

    // Criar mensagem para informar o usuário
    const aviso = document.createElement("p");
    aviso.id = "avisoSelfie";
    aviso.setAttribute("role", "status");
    aviso.style.marginTop = "12px";

    foto.insertAdjacentElement("afterend", aviso);

    // Tamanho máximo permitido: 5 MB
    const tamanhoMaximo = 5 * 1024 * 1024;

    // Função que valida a selfie
    function validarFoto() {

        const arquivo = foto.files[0];

        aviso.textContent = "";
        foto.setCustomValidity("");

        // Verificar se uma foto foi selecionada
        if (!arquivo) {
            foto.setCustomValidity(
                "Selecione uma selfie para continuar."
            );
            return false;
        }

        // Verificar formato e tamanho
        if (!arquivo.type.startsWith("image/")) {
            foto.setCustomValidity(
                "Selecione um arquivo de imagem."
            );
        } else if (arquivo.size > tamanhoMaximo) {
            foto.setCustomValidity(
                "A foto deve ter no máximo 5 MB."
            );
        } else if (arquivo.size === 0) {
            foto.setCustomValidity(
                "A foto está vazia."
            );
        }

        // Mostrar erro, se existir
        if (!foto.checkValidity()) {
            aviso.textContent = foto.validationMessage;
            aviso.style.color = "#b42318";
            return false;
        }

        // Mostrar confirmação
        aviso.textContent = "Imagem selecionada: " + arquivo.name;
        aviso.style.color = "#216e35";

        return true;
    }

    // Verificar foto quando o usuário selecioná-la
    foto.addEventListener("change", validarFoto);

    // Verificar formulário ao clicar em Continuar
    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        if (!validarFoto()) {
            foto.reportValidity();
            return;
        }

        // Registrar conclusão local, sem salvar a selfie
        sessionStorage.setItem(
            "gohelping_cp3_concluido",
            "sim"
        );

        // Ir para a próxima página
        window.location.href = "CP_4.html";
    });

});
