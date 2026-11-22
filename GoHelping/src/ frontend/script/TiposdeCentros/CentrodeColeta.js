
document.addEventListener("DOMContentLoaded", function() {

    //Encontrar os elementos do HTML
    const botao = document.getElementById("botaoDoacoes");
    const lista = document.getElementById("listaDoacoes");
    const pesquisa = document.getElementById("pesquisaDoacoes");
    const mensagem = document.getElementById("mensagemPesquisa");

    // Verificar se os elementos existem
    if (!botao || !lista || !pesquisa || !mensagem) {
        console.error("Erro: elementos do HTML não encontrados!");
        return;
    }

    //Selecionar as categorias de doações
    const categorias = lista.querySelectorAll(":scope > li");

    let listaAberta = true;

    //Função para pesquisar as doações
    function pesquisarDoacoes() {

        const texto = pesquisa.value.trim().toLowerCase();
        let encontrados = 0;

        categorias.forEach(function(categoria) {

            // Selecionar os itens dentro de cada categoria
            const itens = categoria.querySelectorAll("ul > li");
            let itensEncontrados = 0;

            itens.forEach(function(item) {

                const nomeItem = item.textContent.toLowerCase();

                if (nomeItem.includes(texto)) {
                    item.style.display = "";
                    itensEncontrados++;
                    encontrados++;
                } else {
                    item.style.display = "none";
                }

            });

            // Mostrar a categoria somente se tiver resultados
            if (itensEncontrados > 0 && listaAberta) {
                categoria.style.display = "";
            } else {
                categoria.style.display = "none";
            }

        });

        // Mensagem caso a pesquisa não encontre nada
        if (texto !== "" && encontrados === 0) {
            mensagem.textContent = "Nenhuma doação encontrada.";
        } else {
            mensagem.textContent = "";
        }
    }

    //Botão mostrar/esconder
    botao.addEventListener("click", function() {

        listaAberta = !listaAberta;

        if (listaAberta) {
            botao.textContent = "Esconder doações";
        } else {
            botao.textContent = "Mostrar doações";
        }

        pesquisarDoacoes();

    });

    //Atualizar a pesquisa enquanto digita
    pesquisa.addEventListener("input", function() {
        listaAberta = true;
        botao.textContent = "Esconder doações";
        pesquisarDoacoes();
    });

    //Iniciar a página com todas as doações visíveis
    pesquisarDoacoes();

});
