import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignInUp from './signinup';
import SignInConfirm from './signinconfirm';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path="/signinup" component={SignInUp} />
            <Route exact path="/signinconfirm" component={SignInConfirm} />
            <Route path='/' render={() => (<Redirect to="/signinup" />)}/> 
          </Switch>
        </header>
      </div>
      </Router>
    );
      
  }
}

export default App;
