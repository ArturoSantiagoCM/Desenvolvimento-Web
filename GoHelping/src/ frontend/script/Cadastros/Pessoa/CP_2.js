
/** VALIDAR E-MAIL **/

// Pega o campo de e-mail e o elemento que mostra os erros
const InputEmail = document.getElementById('email');
const ErroEmailSpan = document.getElementById('erro-email');

// Faz a validação quando o usuário sai do campo
InputEmail.addEventListener('blur', (e) => {

    // Remove os espaços em branco do começo e do final
    let valor = e.target.value.trim();
    e.target.value = valor;

    // Verifica se o campo está vazio
    if (valor.length === 0) {

        // Marca o campo como inválido para leitores de tela
        InputEmail.setAttribute("aria-invalid", "true");

        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "block";
            ErroEmailSpan.textContent = "O e-mail é obrigatório.";
        }
        return;
    }

    /*
       Verifica se o e-mail possui um formato válido.
       A expressão exige um texto antes do @,
       um domínio e um ponto seguido de uma extensão.
       Exemplo: nome@dominio.com
    */
    const regraEmailBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Se o formato estiver incorreto, mostra uma mensagem
    if (!regraEmailBasico.test(valor)) {

        InputEmail.setAttribute("aria-invalid", "true");

        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "block";
            ErroEmailSpan.textContent =
                "Insira um e-mail válido (ex: nome@dominio.com).";
        }
        return;
    }

    else {

        // Se o e-mail estiver válido, remove a mensagem de erro
        InputEmail.setAttribute("aria-invalid", "false");

        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "none";
            ErroEmailSpan.textContent = "";
        }
    }
});
