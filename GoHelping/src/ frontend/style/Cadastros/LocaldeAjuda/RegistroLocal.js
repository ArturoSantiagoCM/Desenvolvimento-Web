/**NOME COMPLETO JAVASCRIPT*/

/**MÁXIMO DE CARACTERES*/
const MaxCaracteres = 100;
const CountingCaracters = document.getElementById('nameCounter');
const NomeCompleto = document.getElementById("nome");
const CloseLimit = MaxCaracteres * 0.8;
const ErroNomeSpan = document.getElementById("erro-nome");

NomeCompleto.addEventListener('input', () => {
    const CountingValue = NomeCompleto.value.length;

    if (CountingValue >= CloseLimit){
        CountingCaracters.textContent = `${CountingValue} / ${MaxCaracteres}`;
    }
    else {
        CountingCaracters.textContent = "";
    }

});

/**Tirar Espaços em Branco no comça e final*/

NomeCompleto.addEventListener('blur', () => {
    NomeCompleto.value = NomeCompleto.value.trim().replace(/\s+/g, ' ');
 /*uma veriricação para retornar um erro que possa ser lido pelo google para deficientes visuais**/
    const NomeLimpo = NomeCompleto.value

if (NomeLimpo.length === 0) {
       
        NomeCompleto.setAttribute("aria-invalid", "true");
        if (ErroNomeSpan) {
            ErroNomeSpan.style.display = "block";
            ErroNomeSpan.textContent = "O nome é obrigatório."; 
        }
        return; 
    }

    
    NomeCompleto.setAttribute("aria-invalid", "false");
    if (ErroNomeSpan) {
        ErroNomeSpan.style.display = "none";
        ErroNomeSpan.textContent = "";
    }
});

//--------------------------------------------------------------------------------

/**Validar Telefone brasileiro*/

const InputTelefone = document.getElementById('telefone');
const ErroTelefoneSpan = document.getElementById('erro-telefone');


InputTelefone.addEventListener('blur', (e) => {
   
   let valor = e.target.value.trim();
    e.target.value = valor;
    valor = e.target.value.replace(/\D/g, '');
/**Verificar se está vazio */
   if (valor.length === 0) {
        InputTelefone.setAttribute("aria-invalid", "true");
        if (ErroTelefoneSpan) {
            ErroTelefoneSpan.style.display = "block";
            ErroTelefoneSpan.textContent = "O telefone é obrigatório.";
        }
        return;
                        }
    
    else{

    /**Verificar Tamanho*/
    if(valor.length > 11 || valor.length < 10) {
        InputTelefone.setAttribute("aria-invalid", "true");
        if (ErroTelefoneSpan) {
            ErroTelefoneSpan.style.display = "block";
            ErroTelefoneSpan.textContent = "Número invalido";
        }
        return;
        }

    else{
        InputTelefone.setAttribute("aria-invalid", "false");
        if (ErroTelefoneSpan) {
            ErroTelefoneSpan.style.display = "none";
            ErroTelefoneSpan.textContent = "";
                              }
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    
        valor = valor.replace(/(\d)(\d{4})$/, '$1-$2'); 

 
        e.target.value = valor;
    

    }
    }
    
});

//--------------------------------------------------------------------------------

/**Validar Mail*/

const InputEmail = document.getElementById('email');
const ErroEmailSpan = document.getElementById('erro-email');

InputEmail.addEventListener('blur', (e) => {
    //tirar espaços em branco do começo e do final
    let valor = e.target.value.trim();
    e.target.value = valor;
   
    //veriricar que nao esteja basio
    if (valor.length === 0) {
        InputEmail.setAttribute("aria-invalid", "true");
        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "block";
            ErroEmailSpan.textContent = "O e-mail é obrigatório.";
        }
        return;
                            }

    //verificar a existencia de @ e . e tirar espaços
     const regraEmailBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

     if (!regraEmailBasico.test(valor)) {
        InputEmail.setAttribute("aria-invalid", "true");
        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "block";
            ErroEmailSpan.textContent = "Insira um e-mail válido (ex: nome@dominio.com).";
        }
        return;
    }

    else {
        InputEmail.setAttribute("aria-invalid", "false");
        if (ErroEmailSpan) {
            ErroEmailSpan.style.display = "none";
            ErroEmailSpan.textContent = "";
                        }
        } 
        
});

//--------------------------------------------------------------------------------
/**Organização / ONG*/
/**MÁXIMO DE CARACTERES*/
const MaxCaracteresONG = 50;
const ONG = document.getElementById("ong");
const CloseLimitONG = MaxCaracteresONG * 0.8;
const ErroONGSpan = document.getElementById("erro-ong");

ONG.addEventListener('input', () => {
    const CountingValueONG = ONG.value.length;

    if (CountingValueONG >= CloseLimitONG){
        CountingCaracters.textContent = `${CountingValueONG} / ${MaxCaracteresONG}`;
    }
    else {
        CountingCaracters.textContent = "";
    }

});

//--------------------------------------------------------------------------------
/**Site/Red Social(opcional)*/

const RedSocial = document.getElementById("site");

ONG.addEventListener('blur', () => {
    const RedSocialSite = RedSocial;
});

//--------------------------------------------------------------------------------
/**Tipo de emergência*/

const Tipo = document.getElementById("site");

ONG.addEventListener('blur', () => {
    const tipofix = Tipo;
});

//--------------------------------------------------------------------------------
/**País:*/
/** MAPA INTERATIVO GLOBAL (Leaflet + OpenStreetMap) */

// 1. Inicializa o mapa. Coordenadas configuradas para Campinas/SP como padrão para o MVP
const mapa = L.map('meu-mapa').setView([-22.834, -47.196], 5);

// 2. Carrega o visual do mapa (Servidor HOT OSM - Ideal para projetos humanitários)
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',
    maxZoom: 15
}).addTo(mapa);

// 3. Cria o pino ARRASTÁVEL (draggable: true)
const pino = L.marker([-22, -47], { draggable: true }).addTo(mapa);

// Referências dos campos ocultos no HTML
const inputLat = document.getElementById('latitude');
const inputLng = document.getElementById('longitude');

// Função para salvar as coordenadas nos campos invisíveis do HTML
function atualizarCoordenadas(lat, lng) {
    inputLat.value = lat;
    inputLng.value = lng;
}

// Salva a posição inicial padrão
atualizarCoordenadas(-22, -47);

// ---------------------------------------------------------
// AÇÃO A: O QUE ACONTECE QUANDO A PESSOA ARRASTA O PINO?
// ---------------------------------------------------------
pino.on('dragend', function () {
    const posicao = pino.getLatLng(); // Pega a nova posição exata onde soltaram o dedo/mouse
    atualizarCoordenadas(posicao.lat, posicao.lng);
});

// ---------------------------------------------------------
// AÇÃO B: O QUE ACONTECE QUANDO A PESSOA CLICA EM "BUSCAR"?
// ---------------------------------------------------------
document.getElementById('btn-buscar').addEventListener('click', () => {
    const enderecoDigitado = document.getElementById('busca-endereco').value;
    
    if (!enderecoDigitado) return; // Se estiver vazio, não faz nada

    // Chama a API gratuita do Nominatim para transformar texto em coordenadas
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${enderecoDigitado}`)
        .then(resposta => resposta.json())
        .then(dados => {
            if (dados.length > 0) {
                // Se achou, pega as coordenadas do primeiro resultado
                const latEncontrada = dados[0].lat;
                const lngEncontrada = dados[0].lon;

                // Voa com o mapa e move o pino para o local encontrado
                mapa.setView([latEncontrada, lngEncontrada], 16);
                pino.setLatLng([latEncontrada, lngEncontrada]);
                
                // Atualiza nossos campos escondidos
                atualizarCoordenadas(latEncontrada, lngEncontrada);
            } else {
                alert("Endereço não encontrado pelo texto. Por favor, aproxime o mapa e arraste o pino até o local.");
            }
        })
        .catch(erro => console.error("Erro na busca de endereço:", erro));
});

// ---------------------------------------------------------
// AÇÃO C: PUXAR A LOCALIZAÇÃO DO USUÁRIO AO ENTRAR NA PÁGINA
// ---------------------------------------------------------
if ('geolocation' in navigator) {
    // Pede a localização para o navegador
    navigator.geolocation.getCurrentPosition(
        function(posicao) {
            const latUsuario = posicao.coords.latitude;
            const lngUsuario = posicao.coords.longitude;

            // Voa com o mapa e move o pino para a localização exata do GPS da pessoa
            mapa.setView([latUsuario, lngUsuario], 5);
            pino.setLatLng([latUsuario, lngUsuario]);
            
            // Salva as novas coordenadas nos campos escondidos
            atualizarCoordenadas(latUsuario, lngUsuario);
        },
        function(erro) {
            // Se a pessoa recusar ou der erro, o mapa simplesmente continua no local padrão (Campinas)
            console.warn("Localização negada ou indisponível. Mantendo no local padrão. Erro:", erro.message);
        },
        {
            enableHighAccuracy: true, // Força o uso do GPS (melhor precisão)
            timeout: 5000 // Tempo máximo de espera para achar o local (10 segundos)
        }
    );
} else {
    console.warn("Geolocalização não é suportada por este navegador.");
}
/** Carregar lista de Países da API */
const DataListPaises = document.getElementById('lista-paises');

// Fazemos a requisição para a API (pedindo apenas o campo de traduções para ficar mais rápido)
fetch('https://restcountries.com/v3.1/all?fields=translations') 
    .then(resposta => resposta.json())
    .then(dados => {
        // 1. Extraímos o nome em português de cada país
        let nomesPaises = dados.map(pais => pais.translations.por.common);

        // 2. Colocamos em ordem alfabética (A-Z)
        nomesPaises.sort();

        // 3. Criamos as <option> e colocamos dentro do <datalist>
        nomesPaises.forEach(nome => {
            const opcao = document.createElement('option');
            opcao.value = nome;
            DataListPaises.appendChild(opcao);
        });
    })
    .catch(erro => {
        console.error("Erro ao carregar a lista de países:", erro);
        // Fallback básico caso a API falhe por falta de internet
        DataListPaises.innerHTML = `
            <option value="Brasil">
            <option value="Venezuela">
            <option value="Colômbia">
            <option value="Argentina">
        `;
    });

//--------------------------------------------------------------------------------
/**Validar Descrição*/

/**MÁXIMO DE CARACTERES*/

const MaxCarDes = 500;
const MinCarDes = 15;
const CountingCaractersDes = document.getElementById('descricaoCounter');
const descricao = document.getElementById("descricao");
const ErroDesSpan = document.getElementById("descricaoError");

descricao.addEventListener('input', () => {
    const CountingValue = descricao.value.length;

    if(CountingValue > 0){
       CountingCaractersDes.textContent = `${CountingValue} / ${MaxCarDes}`;
                         }
    else {
        CountingCaractersDes.textContent = "";
        ErroDesSpan.textContent = ""; 
        descricao.setAttribute('aria-invalid', 'false');
    }
});

/**Tirar Espaços em Branco no comça e final*/

descricao.addEventListener('blur', () => {
    descricao.value = descricao.value.trim().replace(/\n{3,}/g, '\n\n');
 /*uma veriricação para retornar um erro que possa ser lido pelo google para deficientes visuais**/
    const DesLimpo = descricao.value;

if (DesLimpo.length !== 0) {
       
    if (DesLimpo.length < MinCarDes || DesLimpo.length > MaxCarDes) {

        descricao.setAttribute("aria-invalid", "true");
        if (ErroDesSpan) {
            ErroDesSpan.style.display = "block";
            ErroDesSpan.textContent = "Numero de caracteres invalido, deve ser maior a 15 e menor a 500"; 
        }
        return; 
    }

    }
    else{    
     descricao.setAttribute("aria-invalid", "false");
    if (ErroDesSpan) {
        ErroDesSpan.style.display = "none";
        ErroDesSpan.textContent = ""; }
         }
});

//--------------------------------------------------------------------------------
/**endereço*/

const MaxCarEnd = 100;
const MinCarEnd = 6;
const CountingCaractersEnd = document.getElementById('endereçoCounter');
const endereço = document.getElementById("endereço");
const ErroEndSpan = document.getElementById("endereço");

endereço.addEventListener('input', () => {
    const CountingValue = endereço.value.length;

    if(CountingValue > 0){
       CountingCaractersEnd.textContent = `${CountingValue} / ${MaxCarEnd}`;
                         }
    else {
        CountingCaractersEnd.textContent = "";
        ErroEndSpan.textContent = ""; 
        endereço.setAttribute('aria-invalid', 'false');
    }
});

/**Tirar Espaços em Branco no comça e final*/

endereço.addEventListener('blur', () => {
    endereço.value = endereço.value.trim().replace(/\n{3,}/g, '\n\n');
 /*uma veriricação para retornar um erro que possa ser lido pelo google para deficientes visuais**/
    const EndLimpo = endereço.value;

if (EndLimpo.length !== 0) {
       
    if (EndLimpo.length < MinCarEnd || EndLimpo.length > MaxCarEnd) {

        endereço.setAttribute("aria-invalid", "true");
        if (ErroEndSpan) {
            ErroEndSpan.style.display = "block";
            ErroEndSpan.textContent = "Numero de caracteres invalido, deve ser maior a 7 e menor a 100"; 
        }
        return; 
    }

    }
    else{    
     endereço.setAttribute("aria-invalid", "false");
    if (ErroEndSpan) {
        ErroEndSpan.style.display = "none";
        ErroEndSpan.textContent = ""; }
         }
});

//--------------------------------------------------------------------------------
/**Necessidades*/
const lista = document.getElementById("lista");
const novo = document.getElementById("novo");
const add = document.getElementById("add");
const inputOculto = document.getElementById("itens-formatados");

// A marca que diferencia cada palavra na string final
const separador = "|"; 

// [2] Função nova: Lê a lista visual e cria a string formatada
function atualizarStringParaLocalStorage() {
    // Procura todos os <span> dentro da lista
    const spans = lista.querySelectorAll("span");
    
    // Transforma os spans em uma lista apenas com os textos
    const textos = Array.from(spans).map(span => span.textContent);
    
    // Junta tudo usando o separador (Ex: "Água|Roupas|Leite") e salva no input oculto
    inputOculto.value = textos.join(separador);
}

// [3] Cria <li> com botão remover
function criarItem(texto) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span>${texto}</span>
        <button type="button" class="remover">Remover</button>
    `;
    return li;
}

// [4] Adiciona novo item
add.addEventListener("click", () => {
    const v = novo.value.trim();
    if (!v) return; // Não faz nada se estiver vazio
    
    lista.appendChild(criarItem(v)); // Coloca na tela
    novo.value = ""; // Limpa o campo para a próxima digitação
    
    atualizarStringParaLocalStorage(); // Atualiza a string invisível!
});

// [5] Delegação: ouve cliques no <ul> e decide pelo target (Remover)
lista.addEventListener("click", (e) => {
    if (e.target.matches("button.remover")) {
        e.target.closest("li").remove(); // Tira da tela
        
        atualizarStringParaLocalStorage(); // Atualiza a string invisível!
    }
});