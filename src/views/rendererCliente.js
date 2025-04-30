function buscarEndereco() {
    // Obtém o valor do CEP, removendo qualquer caractere não numérico
    var campoCEP = document.getElementById('ccep')
    var mensagemErro = document.getElementById('cepErro');
    var cep = campoCEP.value.replace(/\D/g, '');

    // Verifica se o CEP tem 8 dígitos
    if (cep.length === 8) {
        var url = `https://viacep.com.br/ws/${cep}/json/`;

        // Faz a requisição ao ViaCEP
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    // CEP não encontrado na API
                    mensagemErro.style.display = 'inline'; // Exibe a mensagem de erro
                    campoCEP.value = ""; // Limpa o campo
                    campoCEP.focus(); // Retorna o foco para o campo do CEP
                } else {
                    // Preenche os campos com os dados retornados
                    document.getElementById('clogradouro').value = data.logradouro;
                    document.getElementById('cbairro').value = data.bairro;
                    document.getElementById('ccidade').value = data.localidade;
                    document.getElementById('cuf').value = data.uf;
                    mensagemErro.style.display = 'none'; // Oculta a mensagem de erro
                }
            })
            .catch(error => {
                mensagemErro.style.display = 'inline';
                campoCEP.value = ""; // Limpa o campo
                campoCEP.focus(); // Retorna o foco para o campo do CEP
            });
    } else {
        mensagemErro.style.display = 'inline';
        campoCEP.value = ""; // Limpa o campo
        campoCEP.focus(); // Retorna o foco para o campo do CEP
    }
}

/* Função de validação do CPF para depois de terminar 

function validarCPF() {
    var campo = document.getElementById('ccpf');
    var mensagemErro = document.getElementById('cpfErro');
    var strCPF = campo.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (!TestaCPF(strCPF)) {
        console.log("CPF inválido!");
        mensagemErro.style.display = 'inline'; // Exibe a mensagem de erro
        campo.value = ""; // Limpa o campo
        campo.focus(); // Volta o foco para o campo do CPF
        
        return false; // Retorna false para indicar que o CPF é inválido
    } else {
        console.log("CPF válido!");
        mensagemErro.style.display = 'none'; // Oculta a mensagem de erro
        return true; // Retorna true para indicar que o CPF é válido
    }
}

function TestaCPF(strCPF) {
    var Soma = 0;
    var Resto;

    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false; // Verifica se são 11 dígitos e se não são repetidos

    for (var i = 1; i <= 9; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(9))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(10))) return false;

    return true;
}
*/

// capturar o foco na busca pelo nome do cliente
// a constante foco obtem o elemento html (input) identificado como 'searchClient'
const foco = document.getElementById('searchClient')

//criar um vetor global para extrair os dados do cliente 9Manipulação de dados)
let arrayClient = []

// evento para retirar a opção de ativar o botão antes de preencher os campos
// Iniciar a janela de clientes alterando as propriedades de alguns elementos:
document.addEventListener('DOMContentLoaded', () => {
    // Desativar os botões
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    foco.focus()
})



//criando as variaveis para capturar as informaçãoes do html renderer cliente

let cnome = document.getElementById("cnome")
let ctel = document.getElementById("ctel")
let cnasc = document.getElementById("cnasc")
let cemail = document.getElementById("cemail")
let ccpf = document.getElementById("ccpf")
let ccep = document.getElementById("ccep")
let clogradouro = document.getElementById("clogradouro")
let cnumero = document.getElementById("cnumero")
let ccomplemento = document.getElementById("ccomplemento")
let cbairro = document.getElementById("cbairro")
let ccidade = document.getElementById("ccidade")
let cuf = document.getElementById("cuf")


// ========================================
// CRUD create =============================
frmCliente.addEventListener('submit', async (event) => {
    // evitar o comportamento padrão (recarregar a página)
    event.preventDefault()
    // IMPORTANTE! (teste de recebimento dos dados do form - Passo 1)
    console.log(cnome.value, ctel.value, cnasc.value, cemail.value, ccpf.value, ccpf.value, clogradouro.value, cnumero.value, ccomplemento.value, cbairro.value, ccidade.value, cuf.value)
    //criar um objeto para enviar ao main os dados da nota
    const cadCliente = {
        cadNome: cnome.value,
        cadTel: ctel.value,
        cadNasc: cnasc.value,
        cadEmail: cemail.value,
        cadCpf: ccpf.value,
        cadCep: ccep.value,
        cadLogradouro: clogradouro.value,
        cadNumero: cnumero.value,
        cadComplemento: ccomplemento.value,
        cadBairro: cbairro.value,
        cadCidade: ccidade.value,
        cadUf: cuf.value
    }
    //teste de comunicação envio
    console.log('Enviando para main process:', cadCliente)
    // Enviar o objeto para o main (Passo 2: fluxo)
    api.createCliente(cadCliente)
})


// == Crud Read  ==============================================
//=============================================================

function searchNome() {
    //teste do botão buscar
    //console.log('teste do botão de buscar')
    let nomeCli = document.getElementById('searchClient').value
    console.log(nomeCli)
    api.searchNome(nomeCli)
    //receber os dados do cliente (passo 5)
    api.renderCli((event, cliente) => {
        console.log(cliente)
        //passo 6 renderização dos dados do cliente (prencher os inputs do form) - 
        //Não esquecer de converter os dados do cliente para JSON
        const dadosCli = JSON.parse(cliente)
        arrayClient = dadosCli
        //uso do forEach para percorer o vetor e extrair os dados
        arrayClient.forEach((c) => {
            cnome.value = c.nomeCli
            ctel.value = c.telCli
            cnasc.value = c.nascCli
            cemail.value = c.emailCli
            ccpf.value = c.cpfCli
            ccep.value = c.cepCli
            clogradouro.value = c.ruaCli
            cnumero.value = c.NumCli
            ccomplemento.value = c.complementoCli
            cbairro.value = c.bairroCli
            ccidade.value = c.cidadeCli
            cuf.value = c.ufCli

        });

    })
}
// == Fim Crud Read  ==========================================
//=============================================================


// ============================================================
// == Reset Form ==============================================
function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})
// == Fim Reset Form ==========================================
// ============================================================

// ============================
// ====== CPF duplicado =======

function cpfDuplicate(cadCliente) {
	cnome.value = "";
    ctel.value = "";
    cnasc.value = "";
    cemail.value = "";
    ccpf.value = "";
    ccep.value = "";
    clogradouro.value = "";
    cnumero.value = "";
    ccomplemento.value = "";
    cbairro.value = "";
    ccidade.value = "";
    cuf.value = "";	
	ccpf.focus();
	ccpf.classList.add("is-invalid"); //adição da classe do bootstrap que altera a tag para borda vermelha.
  }
  
  api.cpfDuplicate((args) => {
	cpfDuplicate();
  });
  
  // ==== FIM CPF duplicado =====
  // ============================