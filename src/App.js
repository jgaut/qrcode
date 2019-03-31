import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignInUp from './signinup';
import SignInConfirm from './signinconfirm';
import { NavLink,Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){

    this.props.history.push('/');
    
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

    return (
      <Router>
      <div className="App">
        <header className="App-header">
          Loading...
          <NavLink exact activeClassName="active" to="/signinup">
            SignInUp
          </NavLink>
          <NavLink exact activeClassName="active" to="/signinconfirm">
            SignInConfirm
          </NavLink>

          <Redirect to="/signinup"/>
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

export default App;
