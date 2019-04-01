import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class SignInUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      err: ''
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

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

    var email = this.state.email;
    var password = this.state.password;

    Auth.signUp(email, password)
    .then((data) => {
      console.log(data);
      this.props.history.push({
        pathname: '/signinconfirm',
        search: '',
        state: { email: email }
      });
    })
    .catch((err) => {
      console.log(err);
      if(err && err.code && typeof err.code != 'undefined' && err.code == 'UsernameExistsException'){

        // For advanced usage
        // You can pass an object which has the username, password and validationData which is sent to a PreAuthentication Lambda trigger
        Auth.signIn({
            email, // Required, the username
            password,// Optional, the password
            attributes: {
              email: email,
            },
        }).then((user) => {
          console.log(user);
          this.props.history.push('/');
          }
        )
        .catch((err) => {
          console.log(err);
          if(err && err.code && typeof err.code != 'undefined' && err.code == 'UserNotConfirmedException'){
            this.props.history.push({
              pathname: '/signinconfirm',
              search: '',
              state: { email: email }
            });
          }else{
            this.setState({ err: err.message || err || ''});
            //this.setState({errColor: '#000000'}); 
          }
        });
      }else{
          //this.setState({errColor: '#000000'}); 
          this.setState({ err: err.message || err || ''});

      }
    });

  }
 
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <label>
            Email <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
          </label>
          <br></br>
            <label>
            Password <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
          </label>
          <br></br>
          <button onClick={this.onSubmit}>Validate</button>
          <label>{this.state.err}</label>
        </header>
      </div>
    );      
  }
}

export default SignInUp;
