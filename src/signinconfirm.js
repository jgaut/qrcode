import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class SignInConfirm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      code:''
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleValidateCodeSubmit.bind(this);

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

  }

  handleChange(event) {
    //console.log(event.target);

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleValidateCodeSubmit(event) {
    //alert('A name was submitted: ' + JSON.stringify(this.state));
    //this.setState({value});
    this.props.history.push('/');
  }

  render() {
    console.log(JSON.stringify(this.state));
      return (
        <div className="App">
          <header className="App-header">
            <form onSubmit={this.handleValidateCodeSubmit}>
              <label>
                Validation code <input type="text" name="code" value={this.state.code} onChange={this.handleChange}/>
              </label>               
              <br></br>
              <input type="submit" value="Validate" />
            </form>
          </header>
        </div>
      );
  }
}

export default SignInConfirm;
