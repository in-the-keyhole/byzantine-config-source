/*
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

import React, { Component } from "react";
import axios from "axios";
const electron = window.require('electron');
const remote = electron.remote;
const blockservice = remote.getGlobal("blockservice");


class AddConfigTx extends Component {

    constructor(props) {
        super(props);
        this.state = global.orgyaml;
        this.operations = [];
        this.setState({ current: "" });
        this.configblock = null;
        this.orgjson = null;
        this.modifiedjson = null;

    }

    componentDidMount() {

        let current = "";
        var ipcRenderer = electron.ipcRenderer;

        var response = ipcRenderer.sendSync('addtx', JSON.stringify(this.state));

        if (response.indexOf("ERROR:") >= 0) {
            current = "ERROR generations Organization JSON Update...";

        } else {
            global.orgjson = response;
            current = "Organization JSON Update Created...";

        }

        this.operations.push(current);
        this.setState({ current: current });

        this.getConfigBlock();
        this.convertAndTrim();
        this.mergeCrypto();
        this.convertModified();



    }


    getConfigBlock() {

        let current = "";
        var ipcRenderer = electron.ipcRenderer;

        var response = ipcRenderer.sendSync('block', JSON.stringify(this.state));

        if (response.indexOf("ERROR:") >= 0) {
            current = "ERROR Getting Config Block";

        } else {
            this.configblock = JSON.parse(response);
            current = "Configuration Block retrrieved...";
            console.log("Config Block " + this.configblock);

        }

        this.operations.push(current);
        this.setState({ current: current });


    }


    convertAndTrim() {

        this.configblock = this.configblock.data.data[0].payload.data.config;
       // let tempblock = this.configblock.data.data[0].payload.data.config;
       // this.configblock = { data: { data: [ { payload: { data: { config: tempblock  }     }   } ]}};

        let current = "Trimmed Configuration Block...";
        this.operations.push(current);
        this.setState({ current: current });


    }

    mergeCrypto() {

        this.modifiedjson = JSON.parse(JSON.stringify(this.configblock));
        // this.modifiedjson.channel_group.groups.Application.groups[this.state.name + "MSP"] = this.orgjson;

        var ipcRenderer = electron.ipcRenderer;
        let current = null;
        var response = ipcRenderer.sendSync('mergecrypto', JSON.stringify(this.modifiedjson));

        if (response.indexOf("ERROR:") >= 0) {
            current = "ERROR merging Crypto JSON";

        } else {

            current = "Org Crypto Merged...";

        }

        this.operations.push(current);
        this.setState({ current: current });

    }


    convertModified() {

        var ipcRenderer = electron.ipcRenderer;
        let current = null;
        var response = ipcRenderer.sendSync('convertmodified', JSON.stringify(this.modifiedjson));
        if (response.indexOf("ERROR:") >= 0) {
            current = "ERROR Converting modified JSON";

        } else {

            current = "Converted Modified Block to Protocol Buffer...";

        }

        this.operations.push(current);
        this.setState({ current: current });

    }




    render() {

        let opslist = [];

        if (this.operations) {
            this.operations.forEach((s) => {
                opslist.push(<li>{s}</li>);
            }
            );
        }


        return (

            <div>
                <div> Generating Artifacts for new Organization : {this.state.name} </div>
                <div> <ul> {opslist} </ul>  </div>
            </div>
        );
    }
}

export default AddConfigTx;
