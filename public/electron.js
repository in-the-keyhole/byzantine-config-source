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
var fs = require('fs');
var config = require('./config.js');

let mainWindow;

global.blockservice = blockservice;

function createWindow() {


  blockinfo.getBlockInfo('mychannel').then((info) => {

    const json = JSON.parse(info);
    const blocks = json.height.low;
    global.blocks = blocks;


    mainWindow = new BrowserWindow({ width: 900, height: 860 });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => mainWindow = null);

    //const electron = window.require('electron');
    //const remote = electron.remote;
    const { ipcMain } = require('electron');
    ipcMain.on('block', (event, arg) => {
      blockservice.getConfigBlock('mychannel', blocks - 1).then(
        function (res) {

          global.configblock = res;
          event.returnValue = res;
        });
    });

    ipcMain.on('orggen', (event, arg) => {

      let json = JSON.parse(arg);

      try {
        let yamlstring = yaml.orgYaml(json);
        event.returnValue = "SUCCESS: Crypto Material Generated in crypto-config";
        global.orginfo = json;
      } catch (e) {
        event.returnValue = "ERROR";
        logger.info("ERROR: Crytpo Configuration failed, make sure cryptogen binary is in the path. " + e);

      }

    });


    ipcMain.on('addtx', (event, arg) => {

      let json = JSON.parse(arg);

      console.log("ADD TX = " + arg);

      yaml.configTx(json).then((r) => {
        event.returnValue = r;

      }).catch((e) => {
        event.returnValue = "ERROR";
        logger.info("ERROR: Configuration TX , make sure cryptogen binary is in the path. " + e);
        throw e;

      });


    });


    ipcMain.on('convertmodified', (event, jsonstring) => {

      let json = JSON.parse(jsonstring);

      // write to file

        fs.writeFile('./modified.json', JSON.stringify(global.modifiedjson), (err) => {
        if (err) throw err;
        logger.info("The file was succesfully saved!");
     
        event.returnValue = yaml.convertToPb('./modified.json','./modified_config.pb');

      });

    });


    ipcMain.on('convertOriginal', (event, jsonstring) => {

      let json = JSON.parse(global.configblock);

      // write to file

        fs.writeFile('./config.json', JSON.stringify(json), (err) => {
        if (err) throw err;
        logger.info("The file was succesfully saved!");
     
        event.returnValue = yaml.convertToPb(json, './config.json')

      });

    });





    ipcMain.on('mergecrypto', (event, jsonstring) => {

      let json = JSON.parse(jsonstring);

      var filepath = config.channel_artifacts_dir + "/" + global.orginfo.name + ".json";

      let orgjson = fs.readFileSync(filepath, 'utf8');

     // console.log("CONIG BLOCK JSON ="+ JSON.stringify(json) );

      // convert string to integer
      var o = JSON.parse(orgjson);

    
    

   /*   o.version = 0;
      
      o.policies.Admins.version=0;
      o.policies.Writers.version=0;
      o.policies.Readers.version=0;
      o.values.MSP.version=0;
*/
       console.log("MSP version = "+o.values.MSP.version);
   
      global.modifiedjson = json;
      global.modifiedjson.channel_group.groups.Application.groups[global.orginfo.name + "MSP"] = o;
    
      // Fix policy type
      global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Admins.policy.type = 1;
      global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Writers.policy.type = 1;
      global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Readers.policy.type = 1;

      global.modifiedjson.channel_group.groups.Application.groups[global.orginfo.name + "MSP"].policies.Admins.policy.type = 1;
      global.modifiedjson.channel_group.groups.Application.groups[global.orginfo.name + "MSP"].policies.Writers.policy.type = 1;
      global.modifiedjson.channel_group.groups.Application.groups[global.orginfo.name + "MSP"].policies.Readers.policy.type = 1;

      global.modifiedjson.channel_group.groups.Orderer.policies.Admins.policy.type = 3;
      global.modifiedjson.channel_group.groups.Orderer.policies.Readers.policy.type = 3;
      global.modifiedjson.channel_group.groups.Orderer.policies.Writers.policy.type = 3;
      global.modifiedjson.channel_group.groups.Orderer.policies.BlockValidation.policy.type = 3;

      global.modifiedjson.channel_group.groups.Orderer.groups.OrdererOrg.policies.Admins.policy.type = 1;
      global.modifiedjson.channel_group.groups.Orderer.groups.OrdererOrg.policies.Readers.policy.type = 1;
      global.modifiedjson.channel_group.groups.Orderer.groups.OrdererOrg.policies.Writers.policy.type = 1;
   
      global.modifiedjson.channel_group.groups.Application.policies.Admins.policy.type = 3;
      global.modifiedjson.channel_group.groups.Application.policies.Writers.policy.type = 3;
      global.modifiedjson.channel_group.groups.Application.policies.Readers.policy.type = 3;

      global.modifiedjson.channel_group.policies.Admins.policy.type = 3;
      global.modifiedjson.channel_group.policies.Writers.policy.type = 3;
      global.modifiedjson.channel_group.policies.Readers.policy.type = 3;

       global.modifiedjson=  yaml.removeRuleType(global.modifiedjson);

      // console.log("MY JSON + "+JSON.stringify(global.modifiedjson));

      event.returnValue = "JSON Merged";


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
