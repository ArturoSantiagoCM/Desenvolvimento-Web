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