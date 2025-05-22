/* main.js - processo principal do app */

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

/* relacionada ao preload.js */
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clientesModel = require('./src/models/Clientes.js')

// Importação da biblioteca nativa do JS para manipular arquivos
const fs = require("fs");

// Importação do pacote JSPDF (arquivos PDF) npm install jspdf
const { jspdf, default: jsPDF } = require("jspdf");

/* janela principal*/
let win
const createWindow = () => {
	// a linha abaixo define o tema (claro ou escuro)
	nativeTheme.themeSource = 'dark' //(dark ou light)
	win = new BrowserWindow({
		width: 800,
		height: 600,
		//autoHideMenuBar: true,
		//minimizable: false,
		resizable: false,
		//ativação do preload.js
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// menu personalizado
	Menu.setApplicationMenu(Menu.buildFromTemplate(template))

	win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
	nativeTheme.themeSource = 'dark'
	// a linha abaixo obtém a janela principal
	const main = BrowserWindow.getFocusedWindow()
	let about
	// Estabelecer uma relação hierárquica entre janelas
	if (main) {
		// Criar a janela sobre
		about = new BrowserWindow({
			width: 360,
			height: 200,
			autoHideMenuBar: true,
			resizable: false,
			minimizable: false,
			parent: main,
			modal: true
		})
	}
	//carregar o documento html na janela
	about.loadFile('./src/views/sobre.html')
}

// Janela cliente
let client
function clientWindow() {
	nativeTheme.themeSource = 'light'
	const main = BrowserWindow.getFocusedWindow()
	if (main) {
		client = new BrowserWindow({
			width: 1010,
			height: 680,
			//autoHideMenuBar: true,
			//resizable: false,
			parent: main,
			modal: true,
			//ativação do preload.js
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
			}
		})
	}
	client.loadFile('./src/views/cliente.html')
	client.center() //iniciar no centro da tela   
}

// Iniciar a aplicação
app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
	let conectado = await conectar()
	// se conectado for igual a true
	if (conectado) {
		//console.log("Conexão bem-sucedida, executando troca de ícone...")
		// enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s para sincronizar a nuvem
		setTimeout(() => {
			event.reply('db-status', "conectado")
		}, 500) //500ms        
	} /*else {
    console.log("Falha na conexão, ícone não será alterado.")
}*/
})

// IMPORTANTE ! Desconectar do banco de dados quando a aplicação for encerrada.
app.on('before-quit', () => {
	desconectar()
})

//template do menu
const template = [
	{
		label: 'Cadastro',
		submenu: [
			{
				label: 'Clientes',
				click: () => clientWindow()
			},
			{
				type: 'separator'
			},
			{
				label: 'Sair',
				click: () => app.quit(),
				accelerator: 'Alt+F4'
			}
		]
	},
	{
		label: "Relatório",
		submenu: [
			{
				label: "Clientes",
				click: () => relatorioClientes(),
			},
		],
	},
	{
		label: 'Ferramentas',
		submenu: [
			{
				label: 'Aplicar zoom',
				role: 'zoomIn'
			},
			{
				label: 'Reduzir',
				role: 'zoomOut'
			},
			{
				label: 'Restaurar o zoom padrão',
				role: 'resetZoom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Recarregar',
				role: 'reload'
			},
			{
				label: 'Ferramentas do desenvolvedor',
				role: 'toggleDevTools'
			}
		]
	},
	{
		label: 'Ajuda',
		submenu: [
			{
				label: 'Sobre',
				click: () => aboutWindow()
			}
		]
	}
]

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('client-window', () => {
	clientWindow()
})

// =================================================================
// == CRUD Create ==================================================
ipcMain.on('new-client', async (event, cadCliente) => {
	// Importante! Teste de recebimento dos dados do cliente
	console.log(cadCliente)
	// Cadastrar a estrutura de dados no banco de dados MongoDB
	//Atenção! Os atributos precisam ser idênticos ao modelo de dados Clientes.js e os valores são definidos pelo conteúdo do objeto cliente
	try {
		const newCliente = new clientesModel({
			nomeCli: cadCliente.cadNome,
			telCli: cadCliente.cadTel,
			cpfCli: cadCliente.cadCpf,
			nascCli: cadCliente.cadNasc,
			emailCli: cadCliente.cadEmail,
			cepCli: cadCliente.cadCep,
			ruaCli: cadCliente.cadLogradouro,
			NumCli: cadCliente.cadNumero,
			complementoCli: cadCliente.cadComplemento,
			bairroCli: cadCliente.cadBairro,
			cidadeCli: cadCliente.cadCidade,
			ufCli: cadCliente.cadUf

		})
		await newCliente.save()
		//confirmação de cliente adicionado no banco
		dialog.showMessageBox({
			type: 'info',
			title: "Aviso",
			message: "Cliente adicionado com sucesso",
			buttons: ['OK']
		}).then((result) => {
			if (result.response === 0) {
				event.reply('reset-form')
			}
		})
	} catch (error) {

		//tratamento da escessão cpf duplicado
		if (error.code === 11000) {
			dialog.showMessageBox({
				type: 'error',
				title: "Atenção!",
				message: "CPF Já cadastrado.//\nVerifique o número digitado",
				buttons: ['OK']
			}).then((result) => {
				//se o botão OK for pressionado
				if (result.response === 0) {
					event.reply('cpf-duplicate')
				}
			})

		} else {
			console.log(error)
		}
	}
})

// =================================================================
// == FIM CRUD Create ==============================================

// =================================================================
// ================= CRUD READ =====================================
ipcMain.on('validate-search', () => {
	dialog.showMessageBox({
		type: 'warning',
		title: 'Atenção',
		message: 'Preencha o campo de busca',
		buttons: ['OK']
	})
})


ipcMain.on('search-cli', async (event, buscaCli) => {
	console.log(buscaCli)
	try {
		/* // Inicializa 'cliente' como um array vazio por segurança.
		// Mesmo que nenhuma busca seja feita (ou falhe), 'cliente' ainda existirá como array.
		// Isso evita erros ao fazer JSON.stringify(cliente) ou ao usar .forEach no renderer.
		// O método .find() sempre retorna um array, então manter esse padrão evita problemas.
		let cliente = [] */
		let cliente = await buscarCliente(buscaCli) // Chama a função de busca e aguarda o retorno

		if (cliente.length === 0) {
			// Se não encontrou cliente, pergunta se quer cadastrar
			await perguntarCadastro(event, buscaCli)
		} else {
			// Se encontrou, envia os dados para o renderer
			await enviarCliente(event, cliente)
		}
	} catch (error) {
		console.log(error)
	}
})

async function buscarCliente(buscaCli) {
	const valorLimpo = buscaCli.replace(/\D/g, '')
	// O método .replace(/\D/g, '') remove qualquer caractere que não seja um número.
	let cliente = []
	if (/^\d{11}$/.test(valorLimpo)) {
		// É um CPF válido (11 dígitos numéricos)
		cliente = await clientesModel.find({
			cpfCli: valorLimpo
		})
	} else {
		//RegExp (expressão regular; 'i' insensitivi - ignorar letras maiusculas ou minusculas)
		cliente = await clientesModel.find({
			nomeCli: new RegExp(buscaCli, 'i')
		})
	} 
	return cliente
}

async function enviarCliente(event, cliente) {
	//Teste de busca do cliente pelo nome
	console.log(cliente)
	// enviar ao renderizador (rendererCliente) os dados do cliente (passo 5)
	//OBS: Não esquecer de converter de JSON par String (usar JSON.stringfy)
	event.reply('renderer-client', JSON.stringify(cliente))
}

async function perguntarCadastro(event, buscaCli) {
	const valorLimpo = buscaCli.replace(/\D/g, '')
  
	const result = await dialog.showMessageBox({
	  type: 'warning',
	  title: 'Aviso',
	  message: 'Cliente Não Cadastrado. \nDeseja Cadastra-lo',
	  defaultId: 0,
	  buttons: ['Sim', 'Não'] // 0 = Sim
	})
  
	if (result.response === 0) { // Usuário clicou "Sim"
	  if (/^\d{11}$/.test(valorLimpo)) {
		event.reply('set-cpf', valorLimpo)
	  } else {
		event.reply('set-name', buscaCli)
	  }
	} else {
	  event.reply('reset-form')
	}
  }



//=======================================================================

// ============================================================
// == Crud Update =============================================

ipcMain.on('update-client', async (event, cadCliente) => {
	//importante! teste de recebimento dos dados do cliente 
	console.log(cadCliente)

	// Alterar a estrutura de dados no banco de dados MongoDB
	try {
		//Alterar uma nova estrurura de dados usando a classe modelo. Atenção! Os atributos precisam ser identicos ao modelo de dados Cliente.js e os valores são definidos pelo conteúdo do objeto cliente

		const updateClient = await clientesModel.findByIdAndUpdate(
			cadCliente.idCli, //isso vem do update, lado esquerdo do cadCliente
			{
			nomeCli: cadCliente.cadNome,
            telCli: cadCliente.cadTel,
            nascCli: cadCliente.cadNasc,
            emailCli: cadCliente.cadEmail,
            cpfCli: cadCliente.cadCpf,
            cepCli: cadCliente.cadCep,
            ruaCli: cadCliente.cadLogradouro,
            NumCli: cadCliente.cadNumero,
            complementoCli: cadCliente.cadComplemento,
            bairroCli: cadCliente.cadBairro,
            cidadeCli: cadCliente.cadCidade,
            ufCli: cadCliente.cadUf
			},
			{
				new: true
			}
		)
		//mensagem de confirmação
		dialog.showMessageBox({
			type:'info',
			title:"Aviso",
			message: "Dados do cliente alterados com sucesso",
			buttons: ['OK']
		}).then((result) => {
			if (result.response === 0) {
				event.reply('reset-form')
			}
		})
	} catch (error) {
		//tratamento da excessão "CPF duplicado"
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já cadastrado.\nVerifique o número digitado.",
                buttons: ['OK']
            }).then((result) => {
                // se o botão OK for pressionado
                if (result.response === 0) {
                    //Limpar o campo CPF, foco e borda em vermelho
                }
            })
        } else {
            console.log(error)
        }
	}
})

// ============================================================
// == FIM Crud Update =========================================


async function relatorioClientes() {
	try {
		// ===========================================
		//        Confiuração do document PDF
		// ===========================================
		// p (portrait), l (landscape)
		// mm = milimiters
		// a4 = tamanho
		// sempre projetar conforme um documento impresso
		const doc = new jsPDF("p", "mm", "a4");

		// inserir data atual no documento
		const dataAtual = new Date().toLocaleDateString("pt-BR");

		// diminuir texto doc.setFontSize() tamanho da fonte em ponto ( = word) pt
		doc.setFontSize(10);
		// a linha abaixo escreve um texto no documento
		doc.text(`Data: ${dataAtual}`, 170, 15); // (x,y (mm))
		doc.setFontSize(18);
		doc.text("Relatório de clientes", 15, 30);
		doc.setFontSize(12);
		let y = 50; // variável de apoio

		// Cabeçalho da tabela
		doc.text("Nome", 14, y);
		doc.text("Telefone", 85, y);
		doc.text("E-mail", 130, y);
		y += 5;

		//desenhar uma linha
		doc.setLineWidth(0.5);
		doc.line(10, y, 200, y); // (10 (inicio)___________200 (fim))
		y += 10;

		// ===============================================
		// Obter a listagem de clientes (ordem alfabética)
		// ===============================================

		const clientes = await clientesModel.find().sort({ nomeCli: 1 });

		//    console.log(clientes)
		// popular o documento pdf com os clientes cadastrados
		clientes.forEach((c) => {
			// criar uma nova pagina se Y > 280mm (A4 = 297mm)
			if (y > 280) {
				doc.addPage();
				y = 20; // margem

				// Cabeçalho
				doc.text("Nome", 14, y);
				doc.text("Telefone", 85, y);
				doc.text("E-mail", 130, y);
				y += 5;
			}
			doc.text(c.nomeCli, 14, y);
			doc.text(c.telCli, 85, y);
			doc.text(c.emailCli, 130, y);
			y += 10;
		});

		// ============================================
		//        Numeração automática de páginas
		// ============================================

		const pages = doc.internal.getNumberOfPages();
		for (let i = 1; i <= pages; i++) {
			doc.setPage(i);
			doc.setFontSize(10);
			doc.text(`Página ${i} de ${pages}`, 105, 290, { align: "center" });
		}

		// ============================================
		// Abrir o arquivo pdf no sistema operacional
		// ============================================

		// Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (!!! Importante !!!)
		const tempDir = app.getPath("temp");
		const filePath = path.join(tempDir, "clientes.pdf");
		// salvar temporariamente o arquivo
		doc.save(filePath);
		// abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
		shell.openPath(filePath);
	} catch (error) {
		console.log(error);
	}
}

// ========= FIM RELATÓRIO DE CLIENTES ===========
// ===============================================






