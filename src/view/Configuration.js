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

const POLICIES = {
UNKNOWN: 0,
SIGNATURE: 1,
MSP: 2,
IMPLICIT_META: 3 };


const RULES = {
 ANY: 0,      // Requires any of the sub-policies be satisfied, if no sub-policies exist, always returns true
 ALL: 1,      // Requires all of the sub-policies be satisfied
 MAJORITY: 2}; // Requires a strict majority (greater than half) of the sub-policies be satisfied
 

class Configuration extends Component {

  constructor(props) {
    super(props);
    this.state = { block: "", edit: false };
    this.orginal = {};
    this.updated = {};
    this.handleChange = this.handleChange.bind(this);

  }


  componentDidMount() {

    // In renderer process (web page).
    //const {ipcRenderer} = require('electron')
    var ipcRenderer = electron.ipcRenderer;
    var block = ipcRenderer.sendSync('block', 'blockargs');
    var json = JSON.parse(block);

    this.getConfigData(json);

    if (this.state.edit) {



    }



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
    let ordererpol = json.data.data[0].payload.data.config.channel_group.groups.Orderer.policies;
    let ordereradminpol = json.data.data[0].payload.data.config.channel_group.groups.Orderer.policies.Admins;


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


    let ordererpolicies = [];
    for (var poly in ordererpol) {
      ordererpol[poly].name = poly;
      ordererpolicies.push(ordererpol[poly]);
    }

    this.setState({ block: block, ordereradminpol: ordereradminpol, ordererpolicies: ordererpolicies, policies: policies, consortium: consortium, orgs: orgs, lastupdate: lastupdate, orderers: ordaddr, hashingalgorithm: hashingalgo, batchsize: batchsize, consensustype: consensustype, batchtimeout: batchtimeout });
    this.orginal = { block: block, ordereradminpol: ordereradminpol, ordererpolicies: ordererpolicies, policies: policies, consortium: consortium, orgs: orgs, lastupdate: lastupdate, orderers: ordaddr, hashingalgorithm: hashingalgo, batchsize: batchsize, consensustype: consensustype, batchtimeout: batchtimeout };

  }

  clickAddOrg = e => {
    e.preventDefault();
    this.props.history.push("/addorg");

  }

  clickEditPolicy = e => {
    e.preventDefault();
    this.props.history.push("/editpolicy");
  }


  clickEdit = e => {
    e.preventDefault();
    this.setState({ "edit": true });
  }

  clickSave = e => {
    e.preventDefault();
    this.setState({ "edit": false });

    global.originalConfig = this.original;
    global.modifiedConfig = {};
    let changed = false;
    if (this.orginal.batchsize != this.updated.batchsize) {
      global.modifiedConfig.batchsize = this.updated.batchsize;
      changed = true;
    }

    if (this.orginal.consensustype != this.updated.consensustype) {
      global.modifiedConfig.consensustype = this.updated.consensustype;
      changed = true;
    }


    if (this.orginal.batchtimeout != this.updated.batchtimeout) {
      global.modifiedConfig.batchtimeout = this.updated.batchtimeout;
      changed = true;
    }


    if (this.orginal.orderers != this.updated.orderers) {
      global.modifiedConfig.orderers = this.updated.orderers;
      changed = true;
    }


    if (this.orginal.hashingalgo != this.updated.hashingalgo) {
      global.modifiedConfig.hashingalgo = this.updated.hashingalgo;
      changed = true;
    }


    if (this.orginal.consortium != this.updated.consortium) {
      global.modifiedConfig.consortium = this.updated.consortium;
      changed = true;
    }

    
      if (this.updated.ordererpolicyadmintype)   {

        
        global.modifiedConfig.ordererpolicy.admin.type = this.updated.ordererpolicyadmintype;
        changed = true;
      


    }


    if (changed) {

      this.props.history.push(('/configupdate'));

    }


  }


  handleChange(event) {
    //this.setState({ [event.target.name]: event.target.value });
    this.updated[event.target.name] = event.target.value;
  }

  selected(l,r) {

    return l == r ? " selected " : ""; 

  }
      

  render() {

    let orgs = [];
    let EditSave = () => <button class="btn btn-link" onClick={this.clickEdit}>Edit</button>;

    if (this.state.edit) {

      EditSave = () => <button class="btn btn-link" onClick={this.clickSave}>Save</button>;
      this.refs.consortium.focus();

    }


    orgs.push(<div><b>Channel:</b> {global.config.channelid} </div>);

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


    let ordererpolicies = [];

    /*if (this.state.ordererpolicies) {

      this.state.ordererpolicies.forEach((p) => {
        ordererpolicies.push(<div><b>Policy:</b> {p.name} <b>Type:</b> <input onChange={this.handleChange} readOnly={this.state.edit == false} type="text" id={'ordererpolicy' + p.name + 'type'} name={'ordererpolicy' + p.name + 'type'} defaultValue={p.policy.type} /> <b>Rule:</b> <input onChange={this.handleChange} readOnly={this.state.edit == false} type="text" id={p.policy.rule} name={p.policy.rule} defaultValue={p.policy.value.rule} /> </div>);
      }
      );

    } */

  
    
    if (this.state.ordereradminpol) {
    let ordereradmintype = this.state.ordereradminpol.policy.type;
    let ordereradminrule = this.state.ordereradminpol.policy.value.rule;
    let ordereradminsubpol = this.state.ordereradminpol.policy.value.sub_policy;


       let ordererpolicyadminselect = <div> Policy Admin <select name="ordererpolicyadmintype" onChange={this.handleChange}>
          <option value="IMPLICIT_META" selected={this.selected(ordereradmintype,"IMPLICIT_META")}>IMPLICIT_META</option>
          <option value="SIGNATURE">SIGNATURE</option>
        </select></div>;

      ordererpolicies.push(ordererpolicyadminselect);


    }

    return (
      <div>
        <legend>Orgs and Configuration  <button class="btn btn-link" onClick={this.clickAddOrg}>Add Org</button> <EditSave /> </legend>

        <ul className="list-group list-group-flush">{orgs}</ul>

        <div className="container">

          <div className="row bg-info">
            <div className="col-md-12"> <h3><b>Current Configuration as of:</b> {this.state.lastupdate}</h3> </div>
          </div>

          <div className="row">
            <div className="col-md-10"> <h3><b>Consortium:</b> <input name="consortium" ref="consortium" defaultValue={this.state.consortium} type="text" onChange={this.handleChange} className="input-xlarge" /></h3> </div>
            <div className="col-md-2"> <h3><b>Block:</b> {this.state.block} </h3></div>
          </div>

          <div className="row">


            <div className="col-md-12">

              <div className="card">
                <div className="card-block">
                  <h4 className="card-title">Organizations</h4>
                </div>
                <div className="col-md-12">
                  {orgs}
                </div>
              </div>
            </div>

          </div>

          <div className="row">


            <div className="col-md-10">

              <div className="card">
                <div className="card-block">
                  <h4 className="card-title">Orderer</h4>
                </div>
                <div className="col-md-12">
                  <form className="form-horizontal">
                    <div className="control-group">
                      <fieldset>
                        <div class="controls"><b>Batch Size:</b> <input ref="batchsize" readOnly={this.state.edit == false}  name="batchsize" type="text" onChange={this.handleChange} defaultValue={this.state.batchsize} className="input-xlarge" /></div>
                        <div class="controls"><b>Consensus Type:</b> <input readOnly={this.state.edit == false}  name="consensustype" type="text" onChange={this.handleChange} defaultValue={this.state.consensustype} placeholder="type" className="input-xlarge" /></div>
                        <div class="controls"><b>Batch Timeout:</b> <input readOnly={this.state.edit == false}  name="batchtimeout" onChange={this.handleChange} defaultValue={this.state.batchtimeout} className="input-xlarge" /></div>
                        <div><b>Orderers:</b> <input readOnly={this.state.edit == false}  name="orderers" type="text" onChange={this.handleChange} defaultValue={this.state.orderers} className="input-xlarge" /></div>
                        {ordererpolicies}

                      </fieldset>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">

              <div className="card">
                <div className="card-block">
                  <h4 className="card-title">Channel</h4>
                </div>
                <div className="col-md-12">

                  <div>
                    <div class="controls"><b>Hashing Algorithm:</b> <input readOnly={this.state.edit == false} id="hashingalgo_" name="hashingalgo" onChange={this.handleChange} defaultValue={this.state.hashingalgorithm} className="input-xlarge" /></div>
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

export default Configuration;
