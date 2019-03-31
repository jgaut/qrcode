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
      this.props.history.push('/profile');
      }
    ).catch((err) => {
      console.log(err);
      this.props.history.push('/signinup');
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
