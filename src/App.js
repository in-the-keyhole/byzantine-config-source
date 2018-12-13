import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Organizations from './view/Organizations.js';
import AddOrganization from './view/AddOrganization.js';
import GenerateArtifacts from './view/GenerateArtifacts.js';
import PeerConnection from './view/PeerConnection.js';

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

    this.read();
    const Main = ({ numberofblocks }) => (
      <main>
    <Switch>
      <Route exact path="/" component={PeerConnection} />
      <Route exact path="/org" component={Organizations} />
      <Route exact path="/addorg" component={AddOrganization} />
      <Route exact path="/genartifacts" component={GenerateArtifacts} />
      <Route exact path="/connection" component={PeerConnection} />
      <Route path='/'>
          <Redirect to="/connection" />
      </Route>
     
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
                        HLF Org Manager
                      </a>
                    </Navbar.Brand>
                  </Navbar.Header>
                  <Navbar.Collapse>
                    <Nav pullRight>
                     
                      <NavItem
                        eventKey={3}
                        href="/"
                        to="/"
                        componentClass={Link}
                      >
                        Connect
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
