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

    var username = this.state.email;
    var code = this.state.code;

    Auth.confirmSignUp(
          username,
          code, {
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

    <div>
    <h1 style={{"textAlign": "center"}}>Account validation</h1>
    <table>    
      <tr>
          <td>
            <label>Email</label>
          </td>
          <td>
            {this.props.location.state.email}
          </td>
        </tr>
        <tr>
          <td>
            <label>Validation code</label>
          </td>
          <td>
            <input type="text" name="code" value={this.state.code} onChange={this.handleChange}/>
          </td>
        </tr>
        <tr>
          <td colspan='2'>
            <button onClick={this.onSubmit}>Validate</button>
          </td>
        </tr>
        <tr>
          <td colspan='2'>
            <label>{this.state.err}</label>
          </td>
        </tr>
    
    </table>
    </div> 
    );
  }
}

export default SignInConfirm;
