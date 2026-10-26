/** MAPA INTERATIVO GLOBAL (Leaflet + OpenStreetMap) */

// 1. Inicializa o mapa. Coordenadas configuradas para Campinas/SP como padrão para o MVP
const mapa = L.map('meu-mapa').setView([-22, -47], 5);

// 2. Carrega o visual do mapa (Servidor HOT OSM - Ideal para projetos humanitários)
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OSM France</a>',
    maxZoom: 19 // Ajustado para 19 para permitir zoom nas ruas. (O 9 bloqueava a visão de perto)
}).addTo(mapa);

// 3. Cria o pino ARRASTÁVEL (draggable: true)
const pino = L.marker([-22.9068, -47.0616], { draggable: true }).addTo(mapa);

// Referências dos campos ocultos no HTML
const inputLat = document.getElementById('latitude');
const inputLng = document.getElementById('longitude');

// Função para salvar as coordenadas nos campos invisíveis do HTML
function atualizarCoordenadas(lat, lng) {
    inputLat.value = lat;
    inputLng.value = lng;
}

// Salva a posição inicial padrão
atualizarCoordenadas(-22.9068, -47.0616);

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
            mapa.setView([latUsuario, lngUsuario], 15);
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
            timeout: 10000 // Tempo máximo de espera para achar o local (10 segundos)
        }
    );
} else {
    console.warn("Geolocalização não é suportada por este navegador.");
}