'use strict';
/** 
Copyright 2018 Keyhole Software LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var path = require('path');
var hfc = require('fabric-client');
var config = require('../config.js');
var log4js = require('log4js');
var logger = log4js.getLogger('service/yanml.js');
var yamljs = require('json2yaml');
var fs = require('fs');


logger.setLevel(config.loglevel);

var orgYaml = function(json) {

  let jsonyaml = {};
  
   jsonyaml.PeerOrgs = [{Name: json.name, Domain: json.domain, EnableNodeOUs: true, Template: { Count : json.peers}, Users: { Count: json.users}}];
   let yaml = yamljs.stringify(jsonyaml);
   
   logger.debug("Converted to Org Yaml "+yaml);

    // write to file system 

    var fs = require('fs');
    var filepath = config.yaml_dir+"/"+json.name+".yaml";

        fs.writeFile(filepath, yaml, (err) => {
            if (err) throw err;
            logger.info("The file was succesfully saved!");
        });      

   // Exceute crypto 

   const { exec } = require('child_process');
   const testscript = exec('cryptogen generate --config=./'+config.yaml_dir+'/'+json.name+'.yaml');
   
   testscript.stdout.on('data', function(data){
       console.log(data); 
       console.log('Cryptogen Executed')
   });
   
   testscript.stderr.on('data', function(data){
       console.log(data);
       console.log('Cryptogen failed... ');
   });
       


   return;

}


var configTx = function(json) {

   let jsonyaml = {};
   let orgs = [];
   orgs['&'+json.name] = { Name: json.name+"MSP", ID: json.domain+MSP, MSPDir: 'crypto-config/peerOrganizations/'+json.Domain+'/msp', AnchorPeers: [{ Host : "peer0.".json.Domain, port: 7051}]};
   jsonyaml.Organizations = [ orgs ];
   let yaml = yamljs.stringify(jsonyaml);
   
   logger.debug("Converted to Org ConfigTX Yaml "+yaml);

    // write to file system 

    var fs = require('fs');
    var filepath = config.yaml_dir+"/config_tx.yaml";

        fs.writeFile(filepath, yaml, (err) => {
            if (err) throw err;
            logger.info("The file was succesfully saved!");
        });      


   





}

exports.orgYaml = orgYaml;
exports.configTx = configTx;

