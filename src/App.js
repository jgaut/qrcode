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
  Switch,
  withRouter
} from "react-router-dom";

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(...props) {
    super(...props);
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
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/SignInUp" component={SignInUp} />
          </Switch>
        </header>
      </div>
    );
      
  }
}

export default App;
