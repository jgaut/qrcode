import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import SignInUp from './signinup';
import SignInConfirm from './signinconfirm';
import NoAuth from './noauth';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {
      console.log(user);
      //navigate('AppAuth', {user: user.attributes.email});
      this.props.history.push('/signinconfirm');
      }
    ).catch((err) => {
      console.log(err);
      //navigate('SignInUp');
      this.props.history.push('/signinconfirm');
      }
    )  
  }

  render() {

    return (
      <div></div>
    );
      
  }
}

export default App;
