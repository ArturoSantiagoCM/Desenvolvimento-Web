// Preenche as páginas de detalhes com o local guardado no localStorage (?id=...).
// Ele só troca textos e links dos elementos que JÁ existem na página,
// por isso o visual de cada tipo de centro continua exatamente o mesmo.
// IMPORTANTE: precisa vir ANTES do script da própria página (CentrodeColeta.js etc.)
(() => {
    const CHAVE_REGISTROS = "locaisDeAjuda";

    const PAGINAS = {
        coleta: "CentrodeColeta.html",
        veterinario: "CentroVeterinario.html",
        medico: "CentroMedico.html",
        ong: "ONG.html"
    };

    function lerRegistros() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_REGISTROS)) ?? [];
        } catch {
            return [];
        }
    }

    // textContent evita que HTML digitado no formulário quebre a página
    function el(tag, texto = "") {
        const elemento = document.createElement(tag);
        elemento.textContent = texto;
        return elemento;
    }

    // Só aceita http/https (evita links "javascript:" vindos do formulário)
    function urlSegura(texto) {
        try {
            const url = new URL(/^https?:\/\//i.test(texto) ? texto : "https://" + texto);
            return ["http:", "https:"].includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    }

    // Troca o valor de um <p> mantendo o <strong> do rótulo (ex.: "Telefone / WhatsApp:")
    function definirValor(p, ...conteudo) {
        if (!p) return;
        const rotulo = p.querySelector("strong");
        [...p.childNodes].forEach((no) => {
            if (no !== rotulo) no.remove();
        });
        p.append(" ", ...conteudo);
    }

    // Reaproveita o estilo da 1ª seção (cartão + botão verde)
    function mostrarNaoEncontrado() {
        const secao = document.createElement("section");
        const voltar = el("a", "Voltar para a tela inicial");
        voltar.href = "../../index.html";
        secao.append(
            el("h2", "Ponto de ajuda"),
            el("p", "Local não encontrado"),
            el("p", "Ele pode ter sido removido ou foi cadastrado em outro navegador."),
            voltar
        );
        document.querySelector("main").replaceChildren(secao);
    }

    // 1ª seção: cartão (estado — país + endereço), mapa e botão do Google Maps
    function preencherEndereco(secao, registro) {
        const { latitude, longitude } = registro.local.coordenadas ?? {};
        const temPonto = Number.isFinite(latitude) && Number.isFinite(longitude);
        const nome = registro.contato.organizacao || registro.contato.nome;
        const lugar = [registro.local.regiao, registro.local.pais].filter(Boolean).join(" — ");

        const [pLugar, pEndereco] = secao.querySelectorAll(":scope > p");

        // parte de cima do cartão: estado — país (ou o nome, se não foi descoberto)
        if (pLugar) pLugar.textContent = lugar || nome;

        // parte de baixo do cartão: endereço e, em texto menor, a descrição do local
        if (pEndereco) {
            pEndereco.textContent = registro.local.endereco || "Endereço não informado";
            if (registro.local.descricao) {
                const descricao = el("span", registro.local.descricao);
                descricao.style.cssText = "display: block; margin-top: 8px; opacity: 0.8;";
                pEndereco.appendChild(descricao);
            }
        }

        let link = secao.querySelector(":scope > a");

        // sem coordenadas (registros antigos): sem mapa e sem botão
        if (!temPonto) {
            if (link) link.remove();
            return;
        }

        // a página de ONG não tinha o botão: cria no mesmo lugar
        if (!link) {
            link = document.createElement("a");
            secao.appendChild(link);
        }

        // botão verde: Google Maps com as coordenadas guardadas
        link.textContent = "Ver no Google Maps";
        link.href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        // mapa com o marcador no ponto escolhido no cadastro
        const margem = 0.003; // ~300 m ao redor do ponto
        const mapa = document.createElement("iframe");
        mapa.title = "Mapa com a localização do ponto de ajuda";
        mapa.loading = "lazy";
        mapa.src = "https://www.openstreetmap.org/export/embed.html?bbox="
            + [longitude - margem, latitude - margem, longitude + margem, latitude + margem].join(",")
            + `&layer=mapnik&marker=${latitude},${longitude}`;
        mapa.style.cssText = "display: block; width: 100%; height: 240px; margin-top: 12px;"
            + " border: 1px solid var(--cor-borda, #d8d8d8); border-radius: 12px;";
        link.before(mapa);
    }

    // 2ª seção: mantém a estrutura ol > li > ul > li que o script da página usa na pesquisa
    function preencherDoacoes(necessidades) {
        const lista = document.getElementById("listaDoacoes");
        if (!lista) return;
        lista.replaceChildren();

        if (necessidades.length === 0) {
            ["botaoDoacoes", "pesquisaDoacoes", "controlesDoacoes"].forEach((id) => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.style.display = "none";
            });
            lista.style.display = "none";
            const aviso = el("p", "Nenhuma necessidade informada.");
            aviso.style.cssText = "font-size: 0.9rem; opacity: 0.8;";
            lista.insertAdjacentElement("afterend", aviso);
            return;
        }

        const categoria = document.createElement("li");
        categoria.appendChild(el("strong", "Itens necessários"));

        const ul = document.createElement("ul");
        necessidades.forEach((item) => ul.appendChild(el("li", item)));
        categoria.appendChild(ul);

        lista.appendChild(categoria);
    }

    // 3ª seção: as 4 caixinhas (Telefone, E-mail, Responsável, Site), na mesma ordem de antes
    function preencherContato(secao, registro) {
        const c = registro.contato;
        const [pTelefone, pEmail, pResponsavel, pSite] = secao.querySelectorAll(":scope > p");

        const tel = el("a", c.telefone);
        tel.href = `tel:${c.telefone.replace(/[^\d+]/g, "")}`;
        definirValor(pTelefone, tel);

        const mail = el("a", c.email);
        mail.href = `mailto:${c.email}`;
        definirValor(pEmail, mail);

        // organização (se houver) e o nome de quem cadastrou
        definirValor(pResponsavel, c.organizacao ? `${c.organizacao} (${c.nome})` : c.nome);

        const href = c.site ? urlSegura(c.site) : null;
        if (href) {
            const site = el("a", "Acessar site oficial");
            site.href = href;
            site.target = "_blank";
            site.rel = "noopener noreferrer";
            definirValor(pSite, site);
        } else {
            const vazio = el("span", "Não informado");
            vazio.className = "contato-pendente";
            definirValor(pSite, vazio);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const id = Number(new URLSearchParams(location.search).get("id"));
        const registro = lerRegistros().find((r) => r.id === id);

        if (!registro) {
            mostrarNaoEncontrado();
            return;
        }

        // se o id é de outro tipo de centro, leva para a página certa
        const pagina = PAGINAS[registro.local?.tipo];
        if (pagina && !location.pathname.toLowerCase().endsWith("/" + pagina.toLowerCase())) {
            location.replace(`${pagina}?id=${id}`);
            return;
        }

        document.title = `GoHelping - ${registro.contato.organizacao || registro.contato.nome}`;

        const secoes = document.querySelectorAll("main > section");
        preencherEndereco(secoes[0], registro);
        preencherDoacoes(registro.necessidades ?? []);
        preencherContato(secoes[secoes.length - 1], registro);
    });
})();