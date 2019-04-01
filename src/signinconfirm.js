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
    //this.handleSubmit = this.handleValidateCodeSubmit.bind(this);

  }

  componentWillMount(){
    //this.props.history.push('/');
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
    this.props.history.push('/')
  }

  render() {
    console.log(JSON.stringify(this.state));
      return (
        <div className="App">
          <header className="App-header">
              {this.props.location.state.email}
              <label>
                Validation code <input type="text" name="code" value={this.state.code} onChange={this.handleChange}/>
              </label>               
              <br></br>
              <button onClick={this.onSubmit}>Validate</button>
          
          </header>
        </div>
      );
  }
}

export default SignInConfirm;
