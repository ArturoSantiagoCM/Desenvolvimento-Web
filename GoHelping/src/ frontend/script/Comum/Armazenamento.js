// Módulo compartilhado: tudo que é salvo no localStorage passa por aqui.
// Precisa ser carregado ANTES dos scripts de cada página.
//
// Chaves usadas no localStorage:
//   gohelping_usuarios           -> lista (JSON) de contas criadas neste navegador
//   gohelping_sessao             -> { usuarioId, entrouEm, token, refreshToken } da conta que está "logada"
//                                   (token/refreshToken ficam null até o backend com JWT existir)
//   gohelping_cadastro_rascunho  -> dados parciais enquanto a pessoa passa pelos passos CP_1..CP_3
//   locaisDeAjuda                -> lista (JSON) de locais de ajuda (cada um guarda o usuarioId de quem registrou)
(() => {
    const CHAVES = {
        usuarios: "gohelping_usuarios",
        sessao: "gohelping_sessao",
        rascunho: "gohelping_cadastro_rascunho",
        locais: "locaisDeAjuda"
    };

    // ---------- CONFIGURAÇÃO DA API / JWT (preparado para o futuro) ----------
    // Hoje tudo roda só no navegador (localStorage). Quando existir um backend:
    //   1. preencha API_URL (ex.: "https://api.gohelping.org");
    //   2. o login deve chamar GH.entrar(usuarioId, { token, refreshToken }) com o que a API devolver;
    //   3. use GH.requisitar("/locais") para falar com a API: o cabeçalho
    //      "Authorization: Bearer <token>" é enviado sozinho e o token é renovado se expirar.
    // Nenhuma outra tela precisa mudar: todas só perguntam GH.estaLogado() / GH.usuarioAtual().
    const CONFIG = {
        API_URL: null,                 // null = modo local (sem backend)
        ROTA_RENOVAR_TOKEN: "/auth/refresh",
        FOLGA_EXPIRACAO_SEG: 10        // considera expirado alguns segundos antes, para não falhar no meio da requisição
    };

    // ---------- leitura e escrita seguras ----------
    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto === null ? padrao : (JSON.parse(bruto) ?? padrao);
        } catch {
            return padrao;
        }
    }

    // devolve true/false para a página poder avisar quando o navegador não deixa salvar
    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch {
            return false;
        }
    }

    function remover(chave) {
        try { localStorage.removeItem(chave); } catch { /* sem localStorage: nada a fazer */ }
    }

    // ---------- ID do usuário ----------
    // Formato GH-XXXXXXXX (sem 0, O, 1, I, L para não confundir quando alguém lê em voz alta)
    const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

    function sortearTrecho(tamanho) {
        const bytes = new Uint8Array(tamanho);
        if (window.crypto?.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else {
            bytes.forEach((_, i) => { bytes[i] = Math.floor(Math.random() * 256); });
        }
        return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
    }

    function gerarIdUsuario() {
        const usados = new Set(listarUsuarios().map((u) => u.id));
        let id;
        do {
            id = "GH-" + sortearTrecho(8);
        } while (usados.has(id));
        return id;
    }

    // ---------- usuários ----------
    function listarUsuarios() {
        const lista = ler(CHAVES.usuarios, []);
        return Array.isArray(lista) ? lista : [];
    }

    function normalizarEmail(email) {
        return String(email ?? "").trim().toLowerCase();
    }

    function buscarUsuarioPorEmail(email) {
        const alvo = normalizarEmail(email);
        return listarUsuarios().find((u) => normalizarEmail(u.contato?.email) === alvo) ?? null;
    }

    // Aceita "gh-ab12cd34", "AB12CD34", com espaços ou hífens soltos... e devolve "GH-AB12CD34"
    // (ou null se não tiver o formato de um ID).
    function normalizarIdUsuario(texto) {
        const limpo = String(texto ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^GH/, "");
        return new RegExp(`^[${ALFABETO}]{8}$`).test(limpo) ? "GH-" + limpo : null;
    }

    function buscarUsuarioPorId(id) {
        const alvo = normalizarIdUsuario(id);
        return alvo ? listarUsuarios().find((u) => u.id === alvo) ?? null : null;
    }

    // Cria a conta (com ID automático) e já deixa a pessoa logada.
    // Retorna { ok: true, usuario } ou { ok: false, motivo }
    function criarUsuario({ pessoa, contato, documento, verificacao }) {
        if (buscarUsuarioPorEmail(contato.email)) {
            return { ok: false, motivo: "email_duplicado" };
        }

        const usuario = {
            id: gerarIdUsuario(),
            criadoEm: new Date().toISOString(),
            status: "pendente", // pendente | verificado | recusado
            pessoa,       // { nome, nascimento, pais }
            contato,      // { email }
            documento,    // { tipo, numero, arquivo }
            verificacao   // { selfie: { enviada, arquivo } }
        };

        const lista = listarUsuarios();
        lista.push(usuario);

        if (!gravar(CHAVES.usuarios, lista)) {
            return { ok: false, motivo: "sem_espaco" };
        }
        entrar(usuario.id);
        return { ok: true, usuario };
    }

    // ---------- JWT: leitura do token (sem verificar assinatura: isso é trabalho do backend) ----------
    function decodificarToken(token) {
        try {
            const corpo = String(token).split(".")[1];
            if (!corpo) return null;
            const base64 = corpo.replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
                atob(base64).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
            );
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    function tokenExpirado(token) {
        const dados = decodificarToken(token);
        if (!dados?.exp) return false; // sem "exp" o backend é quem decide
        return dados.exp * 1000 <= Date.now() + CONFIG.FOLGA_EXPIRACAO_SEG * 1000;
    }

    // ---------- sessão ----------
    // A sessão guarda o ID da conta e, no futuro, o par de tokens JWT.
    // Ex.: entrar("GH-AB12CD34")  ou  entrar("GH-AB12CD34", { token: "...", refreshToken: "..." })
    function entrar(usuarioId, tokens = {}) {
        const salvou = gravar(CHAVES.sessao, {
            usuarioId,
            entrouEm: new Date().toISOString(),
            token: tokens.token ?? null,
            refreshToken: tokens.refreshToken ?? null
        });
        aplicarEstadoSessao();
        return salvou;
    }

    function sair() {
        remover(CHAVES.sessao);
        aplicarEstadoSessao();
    }

    function lerSessao() {
        const sessao = ler(CHAVES.sessao, null);
        return sessao?.usuarioId ? sessao : null;
    }

    function obterToken() {
        return lerSessao()?.token ?? null;
    }

    function obterRefreshToken() {
        return lerSessao()?.refreshToken ?? null;
    }

    // Troca só os tokens (usado depois de renovar), mantendo a conta logada
    function definirTokens({ token, refreshToken }) {
        const sessao = lerSessao();
        if (!sessao) return false;
        return gravar(CHAVES.sessao, { ...sessao, token: token ?? null, refreshToken: refreshToken ?? sessao.refreshToken ?? null });
    }

    // Conta logada neste dispositivo (ou null). Se houver um token JWT já vencido
    // e nenhum refresh token para renová-lo, a sessão é encerrada.
    function usuarioAtual() {
        const sessao = lerSessao();
        if (!sessao) return null;

        if (sessao.token && tokenExpirado(sessao.token) && !sessao.refreshToken) {
            remover(CHAVES.sessao);
            return null;
        }
        return listarUsuarios().find((u) => u.id === sessao.usuarioId) ?? null;
    }

    // Ponto único para as telas perguntarem "tem conta neste dispositivo?"
    function estaLogado() {
        return usuarioAtual() !== null;
    }

    // Deixa <html data-sessao="logado|visitante"> para o CSS esconder/mostrar
    // (ex.: botão Entrar x ícone de perfil) sem piscar na tela.
    function aplicarEstadoSessao() {
        document.documentElement.dataset.sessao = estaLogado() ? "logado" : "visitante";
    }

    // ---------- chamadas à API (desligadas enquanto CONFIG.API_URL for null) ----------
    async function renovarToken() {
        const refreshToken = obterRefreshToken();
        if (!CONFIG.API_URL || !refreshToken) return false;
        try {
            const resposta = await fetch(CONFIG.API_URL + CONFIG.ROTA_RENOVAR_TOKEN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken })
            });
            if (!resposta.ok) return false;
            const dados = await resposta.json();
            return dados.token ? definirTokens(dados) : false;
        } catch {
            return false;
        }
    }

    // fetch que já manda "Authorization: Bearer <token>" e tenta renovar o token se vier 401
    async function requisitar(caminho, opcoes = {}, jaRenovou = false) {
        if (!CONFIG.API_URL) {
            throw new Error("API não configurada: defina GH.CONFIG.API_URL quando o backend existir.");
        }

        let token = obterToken();
        if (token && tokenExpirado(token) && !jaRenovou && await renovarToken()) {
            token = obterToken();
        }

        const cabecalhos = { "Content-Type": "application/json", ...(opcoes.headers ?? {}) };
        if (token) cabecalhos.Authorization = `Bearer ${token}`;

        const resposta = await fetch(CONFIG.API_URL + caminho, { ...opcoes, headers: cabecalhos });

        if (resposta.status === 401 && !jaRenovou) {
            if (await renovarToken()) return requisitar(caminho, opcoes, true);
            sair();
        }
        return resposta;
    }

    // ---------- rascunho do cadastro (entre os passos) ----------
    function lerRascunho() {
        const r = ler(CHAVES.rascunho, {});
        return r && typeof r === "object" ? r : {};
    }

    function salvarRascunho(parcial) {
        return gravar(CHAVES.rascunho, { ...lerRascunho(), ...parcial });
    }

    function limparRascunho() {
        remover(CHAVES.rascunho);
    }

    // ---------- locais de ajuda ----------
    function listarLocais() {
        const lista = ler(CHAVES.locais, []);
        return Array.isArray(lista) ? lista : [];
    }

    function gravarLocais(lista) {
        return gravar(CHAVES.locais, lista);
    }

    function locaisDoUsuario(usuarioId) {
        if (!usuarioId) return [];
        return listarLocais().filter((l) => l.usuarioId === usuarioId);
    }

    // Só apaga se o local pertence mesmo a essa conta
    function apagarLocal(localId, usuarioId) {
        const lista = listarLocais();
        const alvo = lista.find((l) => l.id === localId);
        if (!alvo || !usuarioId || alvo.usuarioId !== usuarioId) return false;
        return gravarLocais(lista.filter((l) => l.id !== localId));
    }

    window.GH = {
        CHAVES,
        gerarIdUsuario,
        listarUsuarios,
        buscarUsuarioPorEmail,
        normalizarIdUsuario,
        buscarUsuarioPorId,
        criarUsuario,
        entrar,
        sair,
        usuarioAtual,
        estaLogado,
        aplicarEstadoSessao,
        CONFIG,
        obterToken,
        obterRefreshToken,
        definirTokens,
        decodificarToken,
        tokenExpirado,
        requisitar,
        lerRascunho,
        salvarRascunho,
        limparRascunho,
        listarLocais,
        gravarLocais,
        locaisDoUsuario,
        apagarLocal
    };

    // marca o estado da sessão assim que o script carrega e sempre que ela muda em outra aba
    aplicarEstadoSessao();
    window.addEventListener("storage", (evento) => {
        if (evento.key === CHAVES.sessao || evento.key === CHAVES.usuarios) aplicarEstadoSessao();
    });
})();
