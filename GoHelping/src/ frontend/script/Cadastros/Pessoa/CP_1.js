
/** NOME COMPLETO JAVASCRIPT **/

// Define o máximo de caracteres e pega os elementos do HTML
const MaxCaracteres = 100;
const CountingCaracters = document.getElementById('nameCounter');
const NomeCompleto = document.getElementById("nome");
const CloseLimit = MaxCaracteres * 0.8;
const ErroNomeSpan = document.getElementById("erro-nome");

// Mostra a contagem quando chegar a 80% do limite
NomeCompleto.addEventListener('input', () => {
    const CountingValue = NomeCompleto.value.length;

    if (CountingValue >= CloseLimit) {
        CountingCaracters.textContent = `${CountingValue} / ${MaxCaracteres}`;
    }
    else {
        CountingCaracters.textContent = "";
    }
});

/** TIRAR ESPAÇOS EM BRANCO **/

// Quando sai do campo, remove espaços extras do nome
NomeCompleto.addEventListener('blur', () => {

    // trim tira os espaços do começo e final
    // replace troca vários espaços seguidos por apenas um
    NomeCompleto.value = NomeCompleto.value.trim().replace(/\s+/g, ' ');

    const NomeLimpo = NomeCompleto.value;

    // Verifica se o usuário deixou o nome vazio
    if (NomeLimpo.length === 0) {

        // Marca o campo como inválido para leitores de tela
        NomeCompleto.setAttribute("aria-invalid", "true");

        if (ErroNomeSpan) {
            ErroNomeSpan.style.display = "block";
            ErroNomeSpan.textContent = "O nome é obrigatório.";
        }
        return;
    }

    // Se o nome estiver preenchido, remove o erro
    NomeCompleto.setAttribute("aria-invalid", "false");

    if (ErroNomeSpan) {
        ErroNomeSpan.style.display = "none";
        ErroNomeSpan.textContent = "";
    }
});

//--------------------------------------------------------------------------------

/** DATA DE NASCIMENTO JAVASCRIPT **/

// Pega o campo de data e o local onde aparece o erro
const InputData = document.getElementById("datan");
const InputError = document.getElementById("dateError");

/*
   Define as datas permitidas:
   - Idade mínima de 16 anos
   - Idade máxima de 120 anos
*/
function setupDateLimits() {

    // Pega a data atual
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // padStart coloca o zero na frente quando necessário
    // Exemplo: mês 5 vira "05"

    // Data mais antiga permitida (120 anos atrás)
    const minDate = `${year - 120}-${month}-${day}`;

    // Data mais recente permitida (16 anos atrás)
    const maxDate = `${year - 16}-${month}-${day}`;

    // Define os limites no campo de data do HTML
    InputData.max = maxDate;
    InputData.min = minDate;
}

// Executa a função para configurar os limites
setupDateLimits();

// Faz a validação quando o usuário sai do campo
InputData.addEventListener("blur", () => {

    // Pega a data digitada
    const valorData = InputData.value;

    // Verifica se a data está dentro do intervalo permitido
    if (valorData >= InputData.min && valorData <= InputData.max) {

        // Se estiver correta, tira o erro
        InputData.setAttribute("aria-invalid", "false");

        if (InputError) {
            InputError.style.display = "none";
            InputError.textContent = "";
        }
        return;
    }

    // Se a data estiver fora do intervalo, mostra o erro
    InputData.setAttribute("aria-invalid", "true");

    if (InputError) {
        InputError.style.display = "block";
        InputError.textContent = "Data inválida. A idade deve estar entre 16 e 120 anos.";
    }
});
