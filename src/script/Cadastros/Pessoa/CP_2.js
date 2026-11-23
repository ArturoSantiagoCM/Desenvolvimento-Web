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


//--------------------------------------------------------------------------------

/** SALVAR OS DADOS DO PASSO 2 (localStorage) E IR PARA O PASSO 3 **/

const FormCP2 = document.getElementById("form-cp2");
const SelectTipoDoc = document.getElementById("Tdocumento");
const InputDocumento = document.getElementById("CPF");
const ErroDocumentoSpan = document.getElementById("erro-documento");
const InputArquivoDoc = document.getElementById("Fcpf");
const AvisoArquivo = document.getElementById("aviso-arquivo");

const TAMANHO_MAXIMO_DOC = 10 * 1024 * 1024; // 10 MB

// Sem o passo 1 não há o que continuar: volta para o início do cadastro
const rascunhoCP2 = GH.lerRascunho();
if (!rascunhoCP2.pessoa) {
    window.location.replace("CP_1.html");
}

// Se a pessoa voltou do passo 3, preenche de novo (o arquivo em si não é guardado)
(function preencherRascunho() {
    const doc = rascunhoCP2.documento;
    if (rascunhoCP2.contato?.email) InputEmail.value = rascunhoCP2.contato.email;
    if (doc?.tipo) SelectTipoDoc.value = doc.tipo;
    if (doc?.numero) InputDocumento.value = doc.numero;
    if (doc?.arquivo) {
        InputArquivoDoc.required = false;
        AvisoArquivo.style.display = "block";
        AvisoArquivo.textContent = `Arquivo já informado: ${doc.arquivo}. Escolha outro só se quiser trocar.`;
    }
})();

// Confere os dígitos verificadores do CPF
function cpfValido(digitos) {
    if (!/^\d{11}$/.test(digitos) || /^(\d)\1{10}$/.test(digitos)) return false;
    const calcular = (base) => {
        const soma = base.split("").reduce((total, d, i) => total + Number(d) * (base.length + 1 - i), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    return calcular(digitos.slice(0, 9)) === Number(digitos[9])
        && calcular(digitos.slice(0, 10)) === Number(digitos[10]);
}

// Devolve { numero } já limpo ou { erro } com a mensagem para a pessoa
function validarDocumento(tipo, textoBruto) {
    const texto = textoBruto.trim();

    if (tipo === "CPF") {
        const digitos = texto.replace(/\D/g, "");
        return cpfValido(digitos) ? { numero: digitos } : { erro: "CPF inválido. Confira os 11 números." };
    }
    if (tipo === "RG") {
        const limpo = texto.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
        return limpo.length >= 5 && limpo.length <= 14 ? { numero: limpo } : { erro: "RG inválido. Confira o número." };
    }
    const limpo = texto.replace(/\s+/g, "").toUpperCase();
    return /^[A-Z0-9]{6,9}$/.test(limpo) ? { numero: limpo } : { erro: "Passaporte inválido. Use de 6 a 9 letras e números." };
}

FormCP2.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // e-mail (a mesma regra usada ao sair do campo)
    InputEmail.value = InputEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(InputEmail.value)) {
        InputEmail.setAttribute("aria-invalid", "true");
        ErroEmailSpan.style.display = "block";
        ErroEmailSpan.textContent = "Insira um e-mail válido (ex: nome@dominio.com).";
        InputEmail.focus();
        return;
    }

    // já existe conta com esse e-mail neste navegador
    if (GH.buscarUsuarioPorEmail(InputEmail.value)) {
        InputEmail.setAttribute("aria-invalid", "true");
        ErroEmailSpan.style.display = "block";
        ErroEmailSpan.textContent = "Já existe uma conta com este e-mail. Entre pelo Perfil.";
        InputEmail.focus();
        return;
    }

    // número do documento
    const documento = validarDocumento(SelectTipoDoc.value, InputDocumento.value);
    if (documento.erro) {
        InputDocumento.setAttribute("aria-invalid", "true");
        ErroDocumentoSpan.style.display = "block";
        ErroDocumentoSpan.textContent = documento.erro;
        InputDocumento.focus();
        return;
    }
    InputDocumento.setAttribute("aria-invalid", "false");
    ErroDocumentoSpan.style.display = "none";

    // foto do documento (só o nome é guardado, nunca o arquivo)
    const arquivo = InputArquivoDoc.files[0];
    if (arquivo && arquivo.size > TAMANHO_MAXIMO_DOC) {
        AvisoArquivo.style.display = "block";
        AvisoArquivo.style.color = "#d93025";
        AvisoArquivo.textContent = "O arquivo deve ter no máximo 10 MB.";
        InputArquivoDoc.focus();
        return;
    }

    const salvou = GH.salvarRascunho({
        contato: { email: InputEmail.value },
        documento: {
            tipo: SelectTipoDoc.value,
            numero: documento.numero,
            arquivo: arquivo ? arquivo.name : (rascunhoCP2.documento?.arquivo ?? null)
        }
    });

    if (!salvou) {
        alert("Não foi possível salvar no navegador. Verifique se o armazenamento local está liberado.");
        return;
    }

    window.location.href = "CP_3.html";
});
