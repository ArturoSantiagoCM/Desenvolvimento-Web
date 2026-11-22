// Encontrar os elementos que já existem no HTML
const botao = document.getElementById("botaoDoacoes");
const lista = document.getElementById("listaDoacoes");
const pesquisa = document.getElementById("pesquisaDoacoes");
const mensagem = document.getElementById("mensagemPesquisa");
const categorias = lista.querySelectorAll(":scope > li");

//Guardar se o usuário quer visualizar a lista de doações
let listaAberta = true;

//Atualizar os resultados sempre que houver pesquisa ou clique no botão
function atualizarDoacoes() {
    const texto = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
    let encontrados = 0;

    categorias.forEach(function(categoria) {
        // O texto da categoria inclui seus itens de doação
        const conteudo = categoria.textContent.toLocaleLowerCase("pt-BR");
        const corresponde = conteudo.includes(texto);

        // Só mostrar uma categoria quando ela corresponde à pesquisa
        // E o usuário não escondeu a lista pelo botão
        categoria.style.display = corresponde && listaAberta ? "" : "none";
        if (corresponde) {
            encontrados++;
        }
    });

    botao.textContent = listaAberta ? "Esconder doações" : "Mostrar doações";
    mensagem.textContent = texto !== "" && encontrados === 0
        ? "Nenhuma doação encontrada."
        : "";
}

//Mostrar ou esconder as doações ao clicar no botão
botao.addEventListener("click", function() {
    listaAberta = !listaAberta;
    atualizarDoacoes();
});

//Filtrar as doações enquanto o usuário digita
pesquisa.addEventListener("input", atualizarDoacoes);

//Mostrar o estado inicial da página
atualizarDoacoes();
