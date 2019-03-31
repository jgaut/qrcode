import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class SignInUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };
    
    this.handleChange = this.handleChange.bind(this);

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

    /*this.setState({
      [name]: value
    });*/
  }

  onSubmit(event) {
    //alert('A name was submitted: ' + JSON.stringify(this.state));
    //this.setState({value});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <form>
            <label>
              Email <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
            </label>
            <br></br>
              <label>
              Password <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
            </label>
            <br></br>
            <button onClick={this.onSubmit}>Validate</button>
          </form>
        </header>
      </div>
    );      
  }
}

export default SignInUp;
