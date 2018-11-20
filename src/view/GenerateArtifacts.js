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
        this.setState({current:""});

    }

    componentDidMount() {

        let current = "";
        var ipcRenderer = electron.ipcRenderer;

        var response = ipcRenderer.sendSync('addtx', JSON.stringify(this.state));

        if (response.indexOf("ERROR:") >= 0) {
            current = "ERROR generations Organization JSON Update...";
            this.operations.push(current);
            this.set.setState({ current: current });
        } else {
            global.orgjson = response;
            current = "Organization JSON Update Created...";
            this.operations.push(current);
            this.setState({current: current });
        }


    }


   getConfigBlock() {

    let current = "";
    var ipcRenderer = electron.ipcRenderer;       

    var response = ipcRenderer.sendSync('getconfig', JSON.stringify(this.state));

    if (response.indexOf("ERROR:") >= 0) {
        current = "ERROR generations Organization JSON Update...";
        this.operations.push(current);
        this.set.setState({ current: current });
    } else {
        global.orgjson = response;
        current = "Organization JSON Update Created...";
        this.operations.push(current);
        this.setState({current: current });
    }


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
