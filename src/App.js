import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';

// retrieve temporary AWS credentials and sign requests
Auth.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      value:0,
      code:'',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleLoginSubmit.bind(this);
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

  handleLoginSubmit(event) {
    //alert('A name was submitted: ' + JSON.stringify(this.state));
    event.preventDefault();
    this.state.value=1;
    this.forceUpdate();
  }

  handleValidateCodeSubmit(event) {
    //alert('A name was submitted: ' + JSON.stringify(this.state));
    event.preventDefault();
    this.state.value=0;
    this.forceUpdate();
  }

  render() {
    console.log(this.state.value);
    switch(this.state.value){
      case 0:
        return (
          <div className="App">
            <header className="App-header">
              <form onSubmit={this.handleLoginSubmit}>
                <label>
                  Email <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
                </label>
                <br></br>
                  <label>
                  Password <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
                </label>
                <br></br>
                <input type="submit" value="Login / Sign Up" />
              </form>
            </header>
          </div>
        );
        break;

      case 1:
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
        break;

      case 2:
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
        break;
    }
  }
}

export default App;
