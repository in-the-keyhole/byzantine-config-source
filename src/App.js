import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Organizations from './view/Organizations.js';
import AddOrganization from './view/AddOrganization.js';
import AddArtifacts from './view/AddArtifacts.js';

import { BrowserRouter, Switch, Route, Link, Redirect } from "react-router-dom";


import {
  Navbar,
  Nav,
  NavItem,
  FormGroup,
  FormControl,
  Button
} from "react-bootstrap";


const electron = window.require('electron');
const fs = electron.remote.require('fs');
//const fs = require('fs');

class App extends Component {

  read() {
    fs.readFile('./src/App.css', (err, data) => {
      if (err) throw err;
         console.log(data);
         this.state = {file: "file has been read "+data};
    });

      this.state = {file: "Reading"};
  }


  render() {

   // var blockservice = electron.remote.getGlobal('blockservice');
   // const res =  global.blockservice;

    this.read();
    const Main = ({ numberofblocks }) => (
      <main>
    <Switch>
      <Route exact path="/" component={Organizations} />
      <Route exact path="/org" component={Organizations} />
      <Route exact path="/addorg" component={AddOrganization} />
      <Route exact path="/addartifacts" component={AddArtifacts} />
     
    </Switch>
      </main>
    );

    return (
    

        <div>
          <BrowserRouter>
            <div>
              <div>
                <Navbar inverse>
                  <Navbar.Header>
                    <Navbar.Brand>
                      <a href="/">
                        KHS Org Manager
                      </a>
                    </Navbar.Brand>
                  </Navbar.Header>
                  <Navbar.Collapse>
                    <Nav pullRight>
                     
                      <NavItem
                        eventKey={3}
                        href="/org"
                        to="/org"
                        componentClass={Link}
                      >
                        Organizations
                      </NavItem>
                      <NavItem
                        eventKey={3}
                        href="/channel"
                        to="/channel"
                        componentClass={Link}
                      >
                        Blocks
                      </NavItem>
                      <NavItem
                        eventKey={5}
                        href="/metrics"
                        to="/metrics"
                        componentClass={Link}
                      >
                        Metrics
                      </NavItem>
                    </Nav>
                  </Navbar.Collapse>
                </Navbar>
              </div>
              <div className="container">
                <div className="row">
                  <div>
                    <Main />
                  </div>
                </div>
              </div>
            </div>
          </BrowserRouter>
        </div>
      );
      
  }
}

export default App;
