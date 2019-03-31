import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class NoAuth extends Component {

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

export default NoAuth;
