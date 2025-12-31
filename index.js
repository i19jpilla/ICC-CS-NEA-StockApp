const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('frontend/index.html')
}

let pyprocess
function startBackend() {
  pyprocess = spawn('python', ['backend/main.py'])
  
  pyprocess.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data}`)
  })

  pyprocess.stderr.on('data', (data) => {
    console.error(`[SERVER] ${data}`)
  })
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  if (pyprocess) {
    pyprocess.kill()
  }

  app.quit()
});