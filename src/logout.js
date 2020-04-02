import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class NoAuth extends Component {

  componentWillMount(){
    Auth.signOut()
    .then((data) => {
        this.props.history.push('/');
      })
      .catch(err => console.log(err));  
  }

  render() {

    return (
      <div></div>
    );
      
  }
}

export default NoAuth;
