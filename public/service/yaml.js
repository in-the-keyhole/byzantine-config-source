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

var orgYaml = function (json) {

    let jsonyaml = {};

    jsonyaml.PeerOrgs = [{ Name: json.name, Domain: json.domain, EnableNodeOUs: true, Template: { Count: json.peers }, Users: { Count: json.users } }];
    let yaml = yamljs.stringify(jsonyaml);

    logger.debug("Converted to Org Yaml " + yaml);

    // write to file system 

    var fs = require('fs');
    var filepath = config.yaml_dir + "/" + json.name + ".yaml";

    fs.writeFile(filepath, yaml, (err) => {
        if (err) throw err;
        logger.info("The file was succesfully saved!");
    });

    // Exceute crypto 

    const { exec } = require('child_process');
    const testscript = exec('cryptogen generate --config=./' + config.yaml_dir + '/' + json.name + '.yaml');

    testscript.stdout.on('data', function (data) {
       // console.log(data);
        console.log('Cryptogen Executed')
    });

    testscript.stderr.on('data', function (data) {
       // console.log(data);
        console.log('Cryptogen failed... ');
    });



    return;

}


var configTx = function (json) {

    let jsonyaml = {};
    let orgs = [];
    console.log("Name=" + json.domain);
    let org = {};
    org['&' + json.name] = { Name: json.name + "MSP", ID: json.name + 'MSP', MSPDir: 'crypto-config/peerOrganizations/' + json.domain + '/msp', AnchorPeers: [{ Host: "peer0." + json.domain, port: 7051 }] };
    orgs.push(org);
    jsonyaml.Organizations = orgs;
    let yaml = yamljs.stringify(jsonyaml);

    // format label...

    let index = yaml.indexOf('&') + json.name.length;
    yaml = yaml.substr(0, index) + yaml.substr(index + 2);


    logger.debug("Converted to Org ConfigTX Yaml " + yaml);

    // write to file system 

    var fs = require('fs');
    var filepath = "./configtx.yaml";

    fs.writeFile(filepath, yaml, (err) => {
        if (err) throw err;
        logger.info("The file was succesfully saved!");
    });

    // execute config    

    //get update JSON

    // const { exec } = require('child_process');
    // let output = './channel-artifacts/' + json.name + '.json';
    // const testscript = exec('configtxgen -printOrg '+json.name+'MSP > ./channel-artifacts/'+json.name+'.json');

    return new Promise((resolve, reject) => {

        const { exec } = require('child_process');
        let output = './channel-artifacts/' + json.name + '.json';

        const configtxgen = exec('export FABRIC_CFG_PATH=$PWD && configtxgen -printOrg ' + json.name + 'MSP > ' + output,
        (error, stdout, stderr) => {
            
            let contents = fs.readFileSync(output,'utf8');
            return resolve(contents);    
        }
        );
    

    });
}



var convertToPb = function (fileName,pbfileName) {

    // Exceute crypto 

    const { exec } = require('child_process');
    const testscript = exec('configtxlator proto_encode --input '+fileName+' --type common.Config --output '+pbfileName);

    testscript.stdout.on('data', function (data) {
        console.log(data);
        console.log('Converted to PB')
    });

    testscript.stderr.on('data', function (data) {
        console.log(data);
        console.log('PB Converstion failed... ');
    });


    return  "Converted "+fileName+" to Protocol Buffer";

}



var computeUpdateDeltaPb = function (channel,original,modified,updated) {

    // Exceute crypto 

    const { exec } = require('child_process');
    const testscript = exec('configtxlator compute_update --channel_id '+channel+' --original '+original+' --updated '+modified+' --output '+updated);

    testscript.stdout.on('data', function (data) {
        console.log(data);
        console.log('Created Updated PB')
    });

    testscript.stderr.on('data', function (data) {
        console.log(data);
        console.log('PB Updated Converstion failed... ');
    });


    return  "Created Updated PB -"+updated;

}


var decodeToJson = function (input) {

    // Exceute crypto 

    const { exec } = require('child_process');
    const testscript = exec('configtxlator proto_decode --input '+ input+'.pb --type common.ConfigUpdate --output '+input+'.json');

    testscript.stdout.on('data', function (data) {
        console.log(data);
        console.log('Decoded '+input+ ' to JSON');
    });

    testscript.stderr.on('data', function (data) {
        console.log(data);
        console.log('Error decoding to '+input+' to JSON');
    });


    return  "Decoded to JSON -"+input;

}






var recurse = function(obj) {
 

    for (var k in obj)
    {
        
        if (k == 'rules') {
          
            console.log('Deleting '+obj[k][0].Type);
            delete obj[k][0].Type;
        }

        if (k == 'rule') {

              delete obj[k].Type; 
              if (obj[k].n_out_of) {

                  let value = obj[k].n_out_of.N;
                  delete obj[k].n_out_of.N;
                  obj[k].n_out_of.n =  value;

              }

        }


        if (k == 'rule') {

            delete obj[k].Type; 
            if (obj[k].n_out_of) {

                let value = obj[k].n_out_of.N;
                delete obj[k].n_out_of.N;
                obj[k].n_out_of.n =  value;

            }

      }





        if (k == 'identities') {

         let classification = obj[k][0].principal_classification; 
         let msp_identifier = obj[k][0].msp_identifier;
         let role = obj[k][0].Role;   
         
         delete obj[k][0];
          
         obj[k] = [ {principal: { msp_identifier: msp_identifier, role: 'ADMIN' }, principal_classification: 'ROLE'} ];

      
        }    


        if (k == 'root_certs') {

           let cert = obj[k][0];
           let begin =  '-----BEGIN CERTIFICATE-----\n';
           let end = '\n-----END CERTIFICATE-----\n';
           obj[k][0] = cert.replace(begin,'').replace(end,'');

        }



        if (k == 'admins') {

            let admincert = obj[k][0];
            let begin =  '-----BEGIN CERTIFICATE-----\n';
            let end = '\n-----END CERTIFICATE-----\n';
            obj[k][0] = admincert.replace(begin,'').replace(end,'');
 
         }

        



        if (k == 'tls_root_certs') {
        
            let rootcert = obj[k][0];
            let begin =  '-----BEGIN CERTIFICATE-----\n';
            let end = '\n-----END CERTIFICATE-----\n';
            obj[k][0] = rootcert.replace(begin,'').replace(end,'');
 
         }
 


        if (typeof obj[k] == "object" && obj[k] !== null) {
            recurse(obj[k]);
        }    
        else {
            
            if (k == 'root_certs') {
                

                console.log(k);
            }
          

        }  
    }

    

}


var removeRuleType = function(json) {

    let result = JSON.parse( JSON.stringify(json) );

     recurse(result);

    return result;
}


exports.orgYaml = orgYaml;
exports.configTx = configTx;
exports.convertToPb = convertToPb;
exports.removeRuleType =  removeRuleType;
exports.computeUpdateDeltaPb =  computeUpdateDeltaPb;
exports.decodeToJson = decodeToJson;

