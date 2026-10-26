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
 /**DATA DE NASCIMENTO JAVASCRIPT*/

 const InputData = getElementById("datan")
 const InputError = getElementById("dateError")

 function setupDateLimits() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const minDate = `${year - 120}-${month}-${day}`;
  const maxDate =  `${year - 16}-${month}-${day}`;

  dateInput.max = maxDate;
  dateInput.min = minDate;
    }

setupDateLimits();

InputData.addEventListener("blur",() => {
    const valorData = InputData.value;

    if(valorData >= dateInput.min && valorData <= dateInput.max){
        
            InputData.setAttribute("aria-invalid", "false");
        if (InputError) {
            InputError.style.display = "none";
            InputError.textContent = "";      
                        }
        return;

                                                                }
        InputData.setAttribute("aria-invalid", "true");
        if (InputError) {
            InputError.style.display = "block";
            InputError.textContent = "Data Invalida, verifique que seja maior a 16 anos.";       
 
             }
    
    });