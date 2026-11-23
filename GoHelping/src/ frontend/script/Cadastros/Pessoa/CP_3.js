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

        // Junta o que foi preenchido nos passos 1 e 2
        const rascunho = GH.lerRascunho();

        if (!rascunho.pessoa) {
            window.location.href = "CP_1.html";
            return;
        }
        if (!rascunho.contato || !rascunho.documento) {
            window.location.href = "CP_2.html";
            return;
        }

        // Cria a conta: o ID do usuário (GH-XXXXXXXX) é gerado automaticamente aqui.
        // A selfie NÃO é salva, só o nome do arquivo e a confirmação de envio.
        const resultado = GH.criarUsuario({
            pessoa: {
                nome: rascunho.pessoa.nome,
                nascimento: rascunho.pessoa.nascimento,
                pais: rascunho.pessoa.pais
            },
            contato: { email: rascunho.contato.email },
            documento: {
                tipo: rascunho.documento.tipo,
                numero: rascunho.documento.numero,
                arquivo: rascunho.documento.arquivo ?? null
            },
            verificacao: {
                selfie: { enviada: true, arquivo: foto.files[0].name }
            }
        });

        if (!resultado.ok) {
            aviso.style.color = "#b42318";
            aviso.textContent = resultado.motivo === "email_duplicado"
                ? "Já existe uma conta com este e-mail. Volte ao passo 2 ou entre pelo Perfil."
                : "Não foi possível salvar a conta no navegador. Verifique se o armazenamento local está liberado.";
            return;
        }

        // Cadastro concluído: o rascunho não é mais necessário
        GH.limparRascunho();

        // Ir para a próxima página
        window.location.href = "CP_4.html";
    });

});
