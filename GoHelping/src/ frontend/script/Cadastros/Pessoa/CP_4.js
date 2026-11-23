document.addEventListener("DOMContentLoaded", function () {

    // Encontrar os textos do HTML
    const titulo = document.querySelector("main h2");
    const descricao = document.querySelector("main h3");
    const blocoId = document.getElementById("id-usuario");
    const valorId = document.getElementById("id-usuario-valor");
    const botaoPerfil = document.getElementById("ver-perfil");

    if (!titulo || !descricao) return;

    // A conta criada no passo 3 fica salva no localStorage e já está "logada"
    const usuario = GH.usuarioAtual();

    if (usuario) {

        titulo.textContent = "Conta criada!";

        descricao.textContent =
            "Seus dados foram salvos neste navegador e a conta está " +
            "aguardando verificação. Guarde o seu ID: ele aparece " +
            "nos locais de ajuda que você registrar.";

        valorId.textContent = usuario.id;
        blocoId.hidden = false;
        botaoPerfil.hidden = false;

    } else {

        titulo.textContent = "Verificação não iniciada";

        descricao.textContent =
            "Conclua as etapas do cadastro para chegar " +
            "a esta tela. Nenhuma conta foi criada.";

    }

});
