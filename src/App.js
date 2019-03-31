import React, { Component } from 'react';
import ReactDOM from "react-dom";
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignInUp from './signinup'
import SignInConfirm from './signinconfirm'

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
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
        this.props.history.push('SignInUp');
        }
      );

    return (
      <div className="App">
        <header className="App-header">
        </header>
      </div>
    );
      
  }
}

export default App;
