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


class ImplicitMeta extends Component {

  
 render() {


   let label = <div className="col-md-3">{this.props.label}</div>;

   let ordererruleadminselect = <div className="col-md-3">Rule: <select disabled={this.props.edit == false} name={this.props.name +"policyrule"} className="form-control" onChange={this.props.onChange}>
   <option value="ANY" selected={this.selected(this.props.rule,"ANY")}>ANY</option>
   <option value="ALL" selected={this.selected(this.props.rule,"ALL")} >ALL</option>
   <option value="MAJORITY" selected={this.selected(this.props.rule,"MAJORITY")} >MAJORITY</option>
   </select></div>;

   let orderersubpolicyselect = <div className="col-md-3">Sub: <select disabled={this.props.edit == false} name={this.props.name+"policysubpol"} className="form-control" onChange={this.props.onChange}>
   <option value="ADMINS" selected={this.selected(this.props.subpolicy,"ADMINS")}>ADMINS</option>
   <option value="READERS" selected={this.selected(this.props.subpolicy,"READERS")} >READERS</option>
   <option value="WRITERS" selected={this.selected(this.props.subpolicy,"WRITERS")} >WRITERS</option>
   </select></div>;

   let typeselect = null;


   if (this.props.type == "IMPLICIT_META") {

   typeselect = <div className="col-md-3"><select disabled={this.props.edit == false} className="form-control"  name={this.props.name+"policytype"} onChange={this.props.onChange}>
   <option value="IMPLICIT_META" selected={this.selected(this.props.type,"IMPLICIT_META")}>IMPLICIT_META</option>
   <option value="SIGNATURE" selected={this.selected(this.props.type,"SIGNATURE")}>SIGNATURE</option>
   </select>  </div>;

   } else {

      typeselect = <div className="col-md-3">Signature</div>;
   
   }


   let ordererpolicyadminselect = <div className="row"> {label} {typeselect} {ordererruleadminselect} {orderersubpolicyselect} </div>;


   return ordererpolicyadminselect;

 }

  
 selected(l,r) {

   return l == r ? " selected " : ""; 

 }
  

}


export default ImplicitMeta;
