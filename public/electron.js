const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const hfc = require('fabric-client');
//const blockservice = require('./service/block.js');
//const blockinfo = require('./service/blockinfo.js');
const yaml = require('./service/yaml.js');
var log4js = require('log4js');
var logger = log4js.getLogger('service/electron.js');
var fs = require('fs');
var config = require('./config.js');

let mainWindow;

//global.blockservice = blockservice;

function createWindow() {

  /*
    blockinfo.getBlockInfo('mychannel').then((info) => {
  
      const json = JSON.parse(info);
      const blocks = json.height.low;
      global.blocks = blocks;
  */

  mainWindow = new BrowserWindow({ width: 900, height: 860 });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);

  //const electron = window.require('electron');
  //const remote = electron.remote;
  const { ipcMain } = require('electron');

  ipcMain.on('block', (event, arg) => {

    let blockservice = require('./service/block.js');
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

    event.returnValue = yaml.configTx(json);
    
    
    /*.then((r) => {
      event.returnValue = r;

    }).catch((e) => {
      event.returnValue = "ERROR";
      logger.info("ERROR: Configuration TX , make sure cryptogen binary is in the path. " + e);
      throw e;

    }); */


  });

  ipcMain.on('decodetojson', (event) => {

    let pbfile = './' + global.orginfo.name + '_update';
    yaml.decodeToJson(pbfile);
    event.returnValue = 'pb file decoded to JSON ' + pbfile + '.json';

  });


  ipcMain.on('convertmodified', (event, jsonstring) => {

    let json = JSON.parse(jsonstring);

    // write to file

    fs.writeFile('./modified.json', JSON.stringify(global.modifiedjson), (err) => {
      if (err) throw err;
      logger.info("The file was succesfully saved!");

      event.returnValue = yaml.convertToPb('./modified.json', './modified_config.pb');

    });

  });


  ipcMain.on('convertoriginal', (event, jsonstring) => {

    let json = global.modifiedjson;

    // write to file

    json = yaml.removeRuleType(json);
    fs.writeFile('./config.json', JSON.stringify(json), (err) => {
      if (err) throw err;
      logger.info("The file was succesfully saved!");

      event.returnValue = yaml.convertToPb('./config.json', './config.pb');

    });

  });

  ipcMain.on('strip', (event, jsonstring) => {

    let json = JSON.parse(jsonstring);

    global.modifiedjson = json;

    // Fix policy type
    global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Admins.policy.type = 1;
    global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Writers.policy.type = 1;
    global.modifiedjson.channel_group.groups.Application.groups.Org1MSP.policies.Readers.policy.type = 1;

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
    yaml.removeRuleType(global.modifiedjson);



  });



  ipcMain.on('computedelta', (event) => {
    let updated = global.orginfo.name + '_update.pb';
    yaml.computeUpdateDeltaPb('mychannel', './config.pb', './modified_config.pb', './' + updated);
    event.returnValue = 'Updated ' + updated + ' generated';

  });


  ipcMain.on('createenvelope', (event) => {

    event.returnValue = yaml.createEnvelope(global.orginfo.name);

  });


  ipcMain.on('convertenvelope', (event) => {

    event.returnValue = yaml.convertEnvelope(global.orginfo.name);

  });



  ipcMain.on('connect', (event, jsonstring) => {

    let json = JSON.parse(jsonstring);
    let credspath = json.creds;
    if (json.creds.indexOf('..') >= 0) {
        credspath = path.join(__dirname, json.creds);
    }

    let cryptopath = json.crypto;
    if (json.creds.indexOf('..') >= 0) {
        cryptopath = path.join(__dirname, json.crypto);
    }

    // calc working dir.. 
    let path = cryptopath.split("/");
    let working_dir = path.slice(0, path.length-1).join("/");
  
    global.config = {
      network_url: json.peer,
      user_id: json.userid,
      wallet_path: credspath,
      crypto_config: cryptopath,
      working_dir: working_dir
    };

    let blockinfo = require('./service/blockinfo.js');
    blockinfo.getBlockInfo('mychannel').then((info) => {

      if (info.indexOf("ERROR:") >= 0) {
        return event.returnValue = "Error connecting and receiving block";
      }

      const json = JSON.parse(info);
      const blocks = json.height.low;
      global.blocks = blocks;

      event.returnValue = JSON.stringify(global.config);


    }).catch((err) => {

      event.returnValue = "ERROR: Could not connect, make sure PEER Node URL and KEYSTORE Location is correct...";

    });

  });


  ipcMain.on('mergecrypto', (event, jsonstring) => {

    let json = JSON.parse(jsonstring);

    var filepath = config.channel_artifacts_dir + "/" + global.orginfo.name + ".json";

    let orgjson = fs.readFileSync(filepath, 'utf8');


    console.log("BUG "+filepath+" = "+orgjson);
    // convert string to JSON Object
    var o = JSON.parse(orgjson);

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

    global.modifiedjson = yaml.removeRuleType(global.modifiedjson);

    // console.log("MY JSON + "+JSON.stringify(global.modifiedjson));

    event.returnValue = "JSON Merged";


  });


  //  END  });

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
