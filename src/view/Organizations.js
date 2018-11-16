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
//const block = window.require('../service/block.js');



class Organizations extends Component {

  constructor(props) {
    super(props);
    this.state = { block: "" };

  }


  componentDidMount() {

  // In renderer process (web page).
  //const {ipcRenderer} = require('electron')
  var ipcRenderer = electron.ipcRenderer;
  var block = ipcRenderer.sendSync('block', 'blockargs');
  var json = JSON.parse(block);
  let app = json.data.data[0].payload.data.config.channel_group.groups.Application.groups;

  let orgs = [];
      for (var p in app) {
        let org = {};
        org.name = p;
        orgs.push(org);
    }

    this.setState({orgs:orgs});

/*
    blockservice.getBlock('mychannel', 1).then(function (res) {
      const json = JSON.parse(JSON.stringify(res.data));
      this.state = { block: JSON.stringify(json) };

    });
*/

  }

  clickAddOrg = e => { 
     e.preventDefault();
    this.props.history.push("/addorg");
  
  }


  render() {

    let orgs = [];

    if (this.state.orgs) {
      this.state.orgs.forEach((o) => {
        orgs.push(<div><b>Org:</b> {o.name}</div>);
      }
      );
    }


    return (
      <div className="card">
        <div className="card-block">
          <h3 className="card-title">Orgs</h3> <button onClick={this.clickAddOrg}>Add</button>
        </div>
        <ul className="list-group list-group-flush">{orgs}</ul>
      </div>
    );
  }
}

export default Organizations;
