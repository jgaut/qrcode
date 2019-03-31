import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

class NoAuth extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {
      console.log('user : ' + user);
      this.props.history.push('/signinup');
      }
    ).catch((err) => {
      console.log('err : ' + err);
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

export default NoAuth;
