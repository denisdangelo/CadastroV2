/**
 * Arquivo de pré carregamento(mais desempenho) e reforço de segurança na comunicação entre processos (IPC)
 */

// importação dos recursos do framework electron
// contextBridge (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

// Enviar ao main um pedido para conexão com o banco de dados e troca do ícone no processo de rendirzação (index.html - renderer.html)
ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),   
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    createCliente: (cadCliente) => ipcRenderer.send('new-client', cadCliente),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
	searchCliente: (buscaCli) => ipcRenderer.send('search-cli', buscaCli),
    renderCli: (cliente) => ipcRenderer.on ('renderer-client', cliente),
	cpfDuplicate: (args) => ipcRenderer.on('cpf-duplicate', args),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (args) => ipcRenderer.on('set-name', args),
    updateClient: (cadCliente) => ipcRenderer.send('update-client', cadCliente),
    setCPF: (args) => ipcRenderer.on('set-cpf', args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    aboutExit: () => ipcRenderer.send('about-exit'),
})
