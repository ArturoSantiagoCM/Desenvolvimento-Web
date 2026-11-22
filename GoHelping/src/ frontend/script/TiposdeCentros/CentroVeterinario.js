 
document.addEventListener("DOMContentLoaded", function () {
    // Elementos do HTML
    const botao = document.getElementById("botaoDoacoes");
    const lista = document.getElementById("listaDoacoes");
    const pesquisa = document.getElementById("pesquisaDoacoes");
    const mensagem = document.getElementById("mensagemPesquisa");

    if (!botao || !lista || !pesquisa || !mensagem) {
        console.error("GoHelping: não foi possível encontrar os elementos da pesquisa.");
        return;
    }

    // Categorias e controle da visibilidade
    const categorias = lista.querySelectorAll(":scope > li");
    let listaAberta = true;

    // Permite pesquisar com ou sem acentos (ex.: racao = ração).
    function normalizar(texto) {
        return texto.toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Pesquisar os itens de cada categoria
    function pesquisarDoacoes() {
        const texto = normalizar(pesquisa.value.trim());
        let encontrados = 0;

        categorias.forEach(function (categoria) {
            const titulo = categoria.querySelector("strong");
            const correspondeTitulo = titulo && normalizar(titulo.textContent).includes(texto);
            const itens = categoria.querySelectorAll("ul > li");
            let itensEncontrados = 0;

            itens.forEach(function (item) {
                const corresponde = correspondeTitulo || normalizar(item.textContent).includes(texto);
                item.hidden = !corresponde;

                if (corresponde) {
                    itensEncontrados++;
                    encontrados++;
                }
            });

            categoria.hidden = !listaAberta || itensEncontrados === 0;
        });

        mensagem.textContent = texto && encontrados === 0
            ? "Nenhuma doação encontrada."
            : "";
    }

    //Mostrar e esconder as doações
    botao.addEventListener("click", function () {
        listaAberta = !listaAberta;
        botao.textContent = listaAberta ? "Esconder doações" : "Mostrar doações";
        botao.setAttribute("aria-expanded", String(listaAberta));
        pesquisarDoacoes();
    });

    // Filtrar enquanto o usuário digita
    pesquisa.addEventListener("input", function () {
        listaAberta = true;
        botao.textContent = "Esconder doações";
        botao.setAttribute("aria-expanded", "true");
        pesquisarDoacoes();
    });

    //Estado inicial
    pesquisarDoacoes();
});
