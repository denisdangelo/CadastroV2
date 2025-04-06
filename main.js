/* main.js - processo principal do app */

const { app, BrowserWindow } = require('electron')


/* janela principal*/
let = win
const createWindow = () => {
  const win = new BrowserWindow({
    //tema
    nativeTheme.themeSource = 'system'
    width: 800,
    height: 600
  })

  win.loadFile('./src/views/index.html')
}

app.whenReady().then(() => {
  createWindow()
})  

