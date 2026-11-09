// Define o máximo de caracteres do nome
const MaxCaracteres = 100;

// Pega o contador e o campo de nome no HTML
const CountingCaracters = document.getElementById('nameCounter');
const NomeCompleto = document.getElementById("nome");

// A contagem aparece quando chegar a 80% do limite
const CloseLimit = MaxCaracteres * 0.8;

// Onde vai aparecer o erro do nome
const ErroNomeSpan = document.getElementById("erro-nome");

// Conta os caracteres enquanto a pessoa digita
NomeCompleto.addEventListener('input', () => {
    const CountingValue = NomeCompleto.value.length;

    if (CountingValue >= CloseLimit) {
        CountingCaracters.textContent = `${CountingValue} / ${MaxCaracteres}`;
    } else {
        CountingCaracters.textContent = "";
    }
});

// Quando sai do campo, tira espaços extras e verifica se está vazio
NomeCompleto.addEventListener('blur', () => {
    NomeCompleto.value = NomeCompleto.value.trim().replace(/\s+/g, ' ');

    const NomeLimpo = NomeCompleto.value;

    // Se estiver vazio, mostra o erro
    if (NomeLimpo.length === 0) {
        NomeCompleto.setAttribute("aria-invalid", "true");

        if (ErroNomeSpan) {
            ErroNomeSpan.style.display = "block";
            ErroNomeSpan.textContent = "O nome é obrigatório.";
        }
        return;
    }

    // Se estiver preenchido, tira o erro
    NomeCompleto.setAttribute("aria-invalid", "false");

    if (ErroNomeSpan) {
        ErroNomeSpan.style.display = "none";
        ErroNomeSpan.textContent = "";
    }
});