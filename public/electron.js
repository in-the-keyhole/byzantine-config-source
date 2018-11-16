const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const hfc = require('fabric-client');
const blockservice = require('./service/block.js');
const blockinfo = require('./service/blockinfo.js');
const yaml = require('./service/yaml.js');
var log4js = require('log4js');
var logger = log4js.getLogger('service/electron.js');

let mainWindow;

global.blockservice = blockservice;

function createWindow() {


  blockinfo.getBlockInfo('mychannel').then((info) => {

    const json = JSON.parse(info);
    const blocks = json.height.low;

    mainWindow = new BrowserWindow({ width: 900, height: 860 });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => mainWindow = null);

    //const electron = window.require('electron');
    //const remote = electron.remote;
    const { ipcMain } = require('electron');
    ipcMain.on('block', (event, arg) => {
      blockservice.getConfigBlock('mychannel', blocks - 1).then(
        function (res) {

          console.log(" Results = " + res); // prints "ping"
          event.returnValue = res;
        });
    });

    ipcMain.on('orggen', (event, arg) => {

      let json = JSON.parse(arg);

      try {
        let yamlstring = yaml.orgYaml(json);
        event.returnValue = "SUCCESS: Crypto Material Generated in crypto-config";
      } catch (e) {
        event.returnValue = "ERROR";
        logger.info("ERROR: Crytpo Configuration failed, make sure cryptogen binary is in the path. " + e);
      }

    });

  });

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (mainWindow === null) {
    createWindow();
  }
});
