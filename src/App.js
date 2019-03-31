import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignInUp from './signinup';
import SignInConfirm from './signinconfirm';
import {
  Route,
  NavLink,
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import { withRouter } from 'react-router';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    Auth.currentAuthenticatedUser({bypassCache: false})
      .then((user) => {
        console.log(user);
        //navigate('AppAuth', {user: user.attributes.email});
        }
      ).catch((err) => {
        console.log(err);
        //navigate('SignInUp');
        
        }
      );
    //this.props.history.push('SignInUp');
    return (
      <Router>
      <div className="App">
        <header className="App-header">
          dzadzeafdzefezffz
          
          <NavLink exact activeClassName="active" to="/signinup">
            SignInUp
          </NavLink>
          <NavLink exact activeClassName="active" to="/signinconfirm">
            SignInConfirm
          </NavLink>
          <Switch>
        <Route exact path="/signinup" component={SignInUp} />
        <Route exact path="/signinconfirm" component={SignInConfirm} />
      </Switch>
          
        </header>
      </div>
      </Router>
    );
      
  }
}

export default withRouter(App);
