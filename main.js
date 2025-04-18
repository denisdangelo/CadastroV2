/* main.js - processo principal do app */

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

/* relacionada ao preload.js */
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clienteModel = require('./src/models/Clientes.js')

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
ipcMain.on('new-client', async (event, client) => {
  // Importante! Teste de recebimento dos dados do cliente
  console.log(client)
// Cadastrar a estrutura de dados no banco de dados MongoDB
try {
  const newCliente = new clienteModel({
    nome: cadCliente.cadNome,
    nasc: cadCliente.cadNasc,
    email: cadCliente.cadEmail,
    cpf: cadCliente.cadCpf,
    cep: cadCliente.cadCep,
    rua: cadCliente.cadLogradouro,
    Num: cadCliente.cadNumero,
    complemento: cadCliente.cadComplemento,
    bairro: cadCliente.cadBairro,
    cidade: cadCliente.cadCidade,
    uf: cadCliente.cadUf
  
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
    }).them((result) => {
      //se o botão OK for pressionado
      if (result.response === 0) {
        //...
      }
    })

  } else {
    console.log(error)
  }
}
})

// =================================================================
// == FIM CRUD Create ==============================================





