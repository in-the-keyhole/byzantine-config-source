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
   
    this.getConfigData(json);


  }


  getConfigData(json) {

    let block = parseInt(json.header.number) + 1;
    let ordaddr = json.data.data[0].payload.data.config.channel_group.values.OrdererAddresses.value.addresses;
    let hashingalgo = json.data.data[0].payload.data.config.channel_group.values.HashingAlgorithm.value.name;
    let consortium = json.data.data[0].payload.data.config.channel_group.values.Consortium.value.name;
    let batchsize = json.data.data[0].payload.data.config.channel_group.groups.Orderer.values.BatchSize.value.max_message_count;
    let batchtimeout = json.data.data[0].payload.data.config.channel_group.groups.Orderer.values.BatchTimeout.value.timeout;
    let consensustype = json.data.data[0].payload.data.config.channel_group.groups.Orderer.values.ConsensusType.value.type;
    let lastupdate = json.data.data[0].payload.header.channel_header.timestamp;
    let app = json.data.data[0].payload.data.config.channel_group.groups.Application.groups;
    let pol = json.data.data[0].payload.data.config.channel_group.policies;
  
    let orgs = [];
    for (var p in app) {
      let org = {};
      org.name = p;
      orgs.push(org);
    }

    let policies = [];
    for (var poly in pol) {
      pol[poly].name = poly;
      policies.push(pol[poly]);
    }


    this.setState({ block: block, policies: policies, consortium: consortium,orgs: orgs, lastupdate: lastupdate, orderers: ordaddr, hashingalgorithm: hashingalgo, batchsize: batchsize, consensustype: consensustype, batchtimeout: batchtimeout });

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


    let policies = [];

    if (this.state.policies) {

      this.state.policies.forEach((p) => {
        policies.push(<div><b> {p.name}  Policy</b>: {p.policy.type}, {p.policy.value.rule} </div>);
      }
      );

    }


    return (
      <div>
        <legend>Orgs and Configuration  <button onClick={this.clickAddOrg}>Add</button></legend>
      
        <ul className="list-group list-group-flush">{orgs}</ul>
  
      <div className="container">

        <div className="row bg-info">
          <div className="col-md-12"> <h3><b>Current Configuration as of:</b> {this.state.lastupdate}</h3> </div>
        </div>

        <div className="row">
          <div className="col-md-10"> <h3><b>Consortium:</b> {this.state.consortium}</h3> </div>
          <div className="col-md-2"> <h3><b>Block:</b> {this.state.block} </h3></div>
        </div>

        <div className="row">


          <div className="col-md-4">

            <div className="card">
              <div className="card-block">
                <h4 className="card-title">Organizations</h4>
              </div>
              <div className="col-md-12">
                {orgs}
              </div>
            </div>
          </div>


          <div className="col-md-4">

            <div className="card">
              <div className="card-block">
                <h4 className="card-title">Orderer</h4>
              </div>
              <div className="col-md-12">
                <div><b>Orderers:</b> {this.state.orderers}</div>
                <div><b>Consensus Type:</b> {this.state.consensustype}</div>
                <div><b>Batch Size:</b> {this.state.batchsize}</div>
                <div><b>Batch Timeout:</b> {this.state.batchtimeout}</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">

            <div className="card">
              <div className="card-block">
                <h4 className="card-title">Channel</h4>
              </div>
              <div className="col-md-12">

                <div>
                  <b>Hashing Algorithm:</b> {this.state.hashingalgorithm}
                </div>
                <div>
                  <b>Batch Size:</b> {this.state.batchsize}
                </div>
                {policies}
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>);


  }
}

export default Organizations;
