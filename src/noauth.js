import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

class NoAuth extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div></div>
    );
      
  }
}

export default NoAuth;
