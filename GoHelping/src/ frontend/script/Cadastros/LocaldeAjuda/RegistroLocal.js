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

/**Descricao JAVASCRIPT*/

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