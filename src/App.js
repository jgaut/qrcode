import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import SignInUp from './signinup';
import SignInConfirm from './signinconfirm';
import NoAuth from './noauth';
import { NavLink,Route, Link, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path="/signinup" component={SignInUp} />
            <Route exact path="/signinconfirm" component={SignInConfirm} />
            <Route path='/' render={() => {
              Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {
      console.log(user);
      //this.props.history.push('/signinup');
      return(<Redirect to="/signinup" />);
      }
    ).catch((err) => {
      console.log(err);
      //this.props.history.push('/signinup');
      return(<Redirect to="/signinup" />);
      }
    )
    
  }}/> 
          </Switch>
        </header>
      </div>
      </Router>
    );
      
  }
}

export default App;
