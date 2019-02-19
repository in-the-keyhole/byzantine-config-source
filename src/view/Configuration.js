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
import ImplicitMeta from "./policies/ImplicitMeta.js";


const electron = window.require('electron');
const remote = electron.remote;

const blockservice = remote.getGlobal("blockservice");

const POLICIES = {
UNKNOWN: 0,
SIGNATURE: 1,
MSP: 2,
IMPLICIT_META: 3 };


const SUBPOLICIES = {
  ADMINS: "ADMINS",
  READERS: "READERS",
  WRITERS: "WRITERS"
  };



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
    this.currentordereradminpol = "IMPLICIT_META";
    this.currentordererwriterpol = "IMPLICIT_META";
  

  }


  componentDidMount() {

  
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
    let ordereradminpol = json.data.data[0].payload.data.config.channel_group.groups.Orderer.policies.Admins;
    let ordererwriterpol = json.data.data[0].payload.data.config.channel_group.groups.Orderer.policies.Writers;
    let ordererreaderpol = json.data.data[0].payload.data.config.channel_group.groups.Orderer.policies.Readers;

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

    this.currentordereradminpol = ordereradminpol.policy.type;
    this.currentordererwriterpol = ordererwriterpol.policy.type;
  
    this.setState({ block: block, ordereradminpol: ordereradminpol,ordererwriterpol: ordererwriterpol,  ordererreaderpol: ordererreaderpol, policies: policies, consortium: consortium,orgs: orgs, lastupdate: lastupdate, orderers: ordaddr.toString(), hashingalgorithm: hashingalgo, batchsize: batchsize, consensustype: consensustype, batchtimeout: batchtimeout });
    this.original = { block: block, ordereradminpol:ordereradminpol , ordererwriterpol: ordererwriterpol, ordererreaderpol: ordererreaderpol,  policies: policies, consortium: consortium,orgs: orgs, lastupdate: lastupdate, orderers: ordaddr.toString(), hashingalgorithm: hashingalgo, batchsize: batchsize, consensustype: consensustype, batchtimeout: batchtimeout };
    this.updated = JSON.parse(JSON.stringify(this.original));
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
    if (this.original.batchsize != this.updated.batchsize) {
        global.modifiedConfig.batchsize = this.updated.batchsize;
        changed = true; 
    }

    if (this.original.consensustype != this.updated.consensustype) {
      global.modifiedConfig.consensustype = this.updated.consensustype;
      changed = true; 
    }


    if (this.original.batchtimeout != this.updated.batchtimeout) {
      global.modifiedConfig.batchtimeout = this.updated.batchtimeout;
      changed = true; 
    }


    if (this.original.orderers != this.updated.orderers) {
      global.modifiedConfig.orderers = this.updated.orderers.split(',');
      changed = true; 
    }


    if (this.original.hashingalgo != this.updated.hashingalgo) {
      global.modifiedConfig.hashingalgo = this.updated.hashingalgo;
      changed = true; 
    }


    if (this.original.consortium != this.updated.consortium) {
      global.modifiedConfig.consortium = this.updated.consortium;
      changed = true; 
    }

    
    if (this.updated.ordereradminpolicytype)   {
        global.modifiedConfig.ordererpolicyadmintype = POLICIES[this.updated.ordereradminpolicytype];
        changed = true;
    }

    if (this.updated.ordereradminpolicyrule)   {
      global.modifiedConfig.ordererpolicyadminrule = RULES[this.updated.ordereradminpolicyrule];
      changed = true;
  }



  if (this.updated.ordereradminpolicysubpol)   {
    global.modifiedConfig.ordererpolicyadminsubpol = SUBPOLICIES[this.updated.ordereradminpolicysubpol];
    changed = true;
  }


  
  if (this.updated.ordererwriterspolicysubpol)   {
    global.modifiedConfig.ordererpolicywritersubpol = SUBPOLICIES[this.updated.ordererwriterspolicysubpol];
    changed = true;
  }


  if (this.updated.ordererwriterspolicyrule)   {
    global.modifiedConfig.ordererpolicywriterrule = RULES[this.updated.ordererwriterspolicyrule];
    changed = true;
  }



  if (this.updated.ordererwriterspolicytype)   {
    global.modifiedConfig.ordererpolicywritertype = POLICIES[this.updated.ordererwriterspolicytype];
    changed = true;
  }


   
  if (this.updated.ordererreaderspolicysubpol)   {
    global.modifiedConfig.ordererpolicyreadersubpol = this.updated.ordererreaderspolicysubpol;
    changed = true;
  }


  if (this.updated.ordererreaderspolicyrule)   {
    global.modifiedConfig.ordererpolicyreaderrule = this.updated.ordererreaderspolicyrule;
    changed = true;
  }



  if (this.updated.ordererreaderspolicytype)   {
    global.modifiedConfig.ordererpolicyreadertype = this.updated.ordererreaderstype;
    changed = true;
  }
  

    if (changed) {

      this.props.history.push(('/configupdate'));

    }


  }


  handleChange(event) {
    
    this.updated[event.target.name] = event.target.value;


    if (event.target.name == 'ordererpolicyadmintype' || event.target.name == 'ordereradminpolicytype' ) {
       this.currentordereradminpol = event.target.value; 
       this.setState( { rerender: new Date().getTime() } );
    }


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
     
    let ordereradmintype = null;
    let ordereradminrule = null;
    let ordereradminsubpol = null;

    let ordererwriterstype = null;
    let ordererwritersrule = null;
    let ordererwriterssubpol = null;

    let ordererreaderstype = null;
    let ordererreadersrule = null;
    let ordererreaderssubpol = null;

   
    
    if (this.state.ordereradminpol) {
    
      ordereradmintype = this.state.ordereradminpol.policy.type;
      ordereradminrule = this.state.ordereradminpol.policy.value.rule;
      ordereradminsubpol = this.state.ordereradminpol.policy.value.sub_policy;

      ordererwriterstype = this.state.ordererwriterpol.policy.type;
      ordererwritersrule = this.state.ordererwriterpol.policy.value.rule;
      ordererwriterssubpol = this.state.ordererwriterpol.policy.value.sub_policy;

      ordererreaderstype = this.state.ordererreaderpol.policy.type;
      ordererreadersrule = this.state.ordererreaderpol.policy.value.rule;
      ordererreaderssubpol = this.state.ordererreaderpol.policy.value.sub_policy;




         ordererpolicies.push( <div className="row"> <ImplicitMeta label="Admin Policy" name="ordereradmin" edit={this.state.edit} type={ordereradmintype}  subpolicy={ordereradminsubpol} rule={ordereradminrule} onChange={this.handleChange} /> </div>  );
         ordererpolicies.push( <div className="row"> <ImplicitMeta label="Writers Policy" name="ordererwriters" edit={this.state.edit} type={ordererwriterstype} subpolicy={ordererwriterssubpol} rule={ordererwritersrule} onChange={this.handleChange} /> </div>  );
         ordererpolicies.push( <div className="row"> <ImplicitMeta label="Readers Policy" name="ordererreaders" edit={this.state.edit} type={ordererreaderstype} rule={ordererreadersrule} subpolicy={ordererreaderssubpol} onChange={this.handleChange} /> </div>  );
       

       

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
                        <div class="form-control"><b>Batch Size:</b> <input ref="batchsize" readOnly={this.state.edit == false}  name="batchsize" type="text" onChange={this.handleChange} defaultValue={this.state.batchsize} className="input-xlarge" /></div>
                        <div class="form-control"><b>Consensus Type:</b> <input readOnly={this.state.edit == false}  name="consensustype" type="text" onChange={this.handleChange} defaultValue={this.state.consensustype} placeholder="type" className="input-xlarge" /></div>
                        <div class="form-control"><b>Batch Timeout:</b> <input readOnly={this.state.edit == false}  name="batchtimeout" onChange={this.handleChange} defaultValue={this.state.batchtimeout} className="input-xlarge" /></div>
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
