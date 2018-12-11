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
//const blockservice = remote.getGlobal("blockservice");
//const {dialog} = window.require('electron').remote;
const {dialog} = remote;


class PeerConnection extends Component {

    constructor(props) {
        super(props);
        this.state = { userid: "PeerAdmin", peer: "grpc://localhost:7051", creds: "../hfc-key-store", crypto: "../crypto-config" };

    }


    handleChange = event => {
        this.setState({ [event.target.id]: event.target.value });
    }

   
    connectClick = e => {
        e.preventDefault();
        var ipcRenderer = electron.ipcRenderer;
        var response = ipcRenderer.sendSync('connect', JSON.stringify(this.state));

        if (response.indexOf("ERROR:") >= 0) {

            this.setState( {status: response});

        } else {  

          this.props.history.push("/org");

        }    

  
    }

    dirClick = e => {
        e.preventDefault();
        let dir = dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
        this.setState({creds: dir[0]});

    }

    dirCryptoClick = e => {
        e.preventDefault();
        let dir = dialog.showOpenDialog({properties: ['openFile', 'openDirectory']});
        this.setState({crypto: dir[0]});

    }


    render() {

        let Status = <div></div>;

        if (this.state.status) {

                Status = <div class="alert alert-danger" role="alert">
                    {this.state.status}
                </div>

        }


        return (

    
                <form className="form-horizontal">
                    <fieldset>
                        <legend>Connection to a HLF Peer Node</legend>
                        <div className="control-group">
                            <label className="control-label" for="name">User Id:</label>
                            <div className="controls">
                                <input id="name" name="textinput-0" type="text" onChange={this.handleChange} value={this.state.userid} placeholder="PeerAdmin" className="input-xlarge" />
                                <p className="help-block">HLF User implied</p>
                            </div>
                        </div>

                        <div className="control-group">
                            <label class="control-label" for="peernode">Peer Node URL:</label>
                            <div className="controls">
                                <input id="domain" name="textinput-1" type="text" onChange={this.handleChange} value={this.state.peernode} placeholder="grpc://localhost:7051" className="input-xlarge" />
                                <p className="help-block">Fabric Network Peer Node Address</p>
                            </div>
                        </div>

                        <div className="control-group">
                            <label class="control-label" for="creds">Credential Keystore Path:</label>
                            <div className="controls">
                            <button id="pickdir" onClick={this.dirClick} name="doublebutton-0" className="btn btn-success">Directory</button>   <input id="creds" size="80" name="textinput-1" type="text" onChange={this.handleChange} value={this.state.creds}  className="input-xlarge" />
                                <p className="help-block">Directory path where your Admin Public/Private Key and Userid Digital Cert is located</p>
                            </div>
                        </div>


                        <div className="control-group">
                            <label class="control-label" for="creds">Crypto Config Path:</label>
                            <div className="controls">
                            <button id="pickdir" onClick={this.dirCryptoClick} name="doublebutton-0" className="btn btn-success">Directory</button>   <input id="crypto" size="80" name="textinput-1" type="text" onChange={this.handleChange} value={this.state.crypto}  className="input-xlarge" />
                                <p className="help-block">Directory path where Crypto Config resources will be generared</p>
                            </div>
                        </div>

                     

                        <div className="control-group">
                            <label className="control-label" for="doublebutton-0"></label>
                            <div className="controls">
                                <button id="generate" onClick={this.connectClick} name="doublebutton-0" className="btn btn-success">Connect</button>

                            </div>
                        </div>

                         <div className="control-group">
                            <label className="control-label" for="doublebutton-0"></label>
                            <div className="controls">
                                {Status}
                            </div>
                        </div>

                    </fieldset>
                </form>

        );
    }
}

export default PeerConnection;
