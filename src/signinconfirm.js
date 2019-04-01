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
      email:'',
      code:''
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state.email = this.props.location.state.email;

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

  onSubmit(){
    Auth.confirmSignUp(
          this.state.username,
          this.state.code, {
          // Optional. Force user confirmation irrespective of existing alias. By default set to True.
          forceAliasCreation: true
        }).then((data) => {
          console.log('data');
          console.log(data);
          this.props.history.push('/');
        }).catch((err) => {
          console.log('err');
            console.log(err);
            this.setState({ err: err.message || err || ''});
        });
    }

  render() {
    //console.log(JSON.stringify(this.state));
    return (
      <div className="App">
        <header className="App-header">
          {this.props.location.state.email}
          <label>
            Validation code <input type="text" name="code" value={this.state.code} onChange={this.handleChange}/>
          </label>               
          <br></br>
          <button onClick={this.onSubmit}>Validate</button>
          <label>{this.state.err}</label>
        </header>
      </div>
    );
  }
}

export default SignInConfirm;
