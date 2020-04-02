import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignIn from './signin';
import SignUp from './signup';
import SignInConfirm from './signinconfirm';
import NoAuth from './noauth';
import LogOut from './logout';
import Profile from './profile';
import Bip39 from './bip39';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  render() {

    return (
      <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/signinconfirm" component={SignInConfirm} />
            <Route exact path="/noauth" component={NoAuth} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/bip39" component={Bip39} />
            <Route exact path="/logout" component={LogOut} />
            <Route path='/' render={() => (<Redirect to="/noauth" />)}/> 
          </Switch>
        </header>
      </div>
      </Router>
    );
      
  }
}

export default App;
