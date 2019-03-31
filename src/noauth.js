import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

class NoAuth extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {
      console.log(user);
      //this.props.history.push('/signinup');
      }
    ).catch((err) => {
      console.log(err);
      //this.props.history.push('/signinup');
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
