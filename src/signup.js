import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import img from './logo.png';

class SignInUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.signIn = this.signIn.bind(this);

  }

  signIn(){
    this.props.history.push({
          pathname: '/signin'
        });
  }

  handleChange(event) {
    //console.log(event.target);

    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    var name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event){

    var username = this.state.email;
    var password = this.state.password;

    Auth.signUp({username, password, attributes:{email: username}})
    .then((data) => {
      console.log(data);
      this.props.history.push({
        pathname: '/signinconfirm',
        search: '',
        state: { email: username }
      });
    })
    .catch((err) => {
      console.log(err);
      if(err && err.code && typeof err.code != 'undefined' && err.code === 'UsernameExistsException'){

        console.log(err.code);
      }
    });
    event.preventDefault();
  }
 
  render() {
    return ( 
    <div>
    <div className="logo"><img src={img}/></div>
      <div className="container">
      <div style={{"textAlign": "left"}}>
        <h2>Sign up</h2>
      </div>
      <form onSubmit={this.handleSubmit}>
        
        <div className={this.state.error==='' ? 'hidden-label': 'row error-label'}>
          <label>{this.state.error}</label>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="email">Email</label>
          </div>
          <div className="col-75">
            <input type="text" id="email" name="email" placeholder="Your email..." value={this.state.email} onChange={this.handleChange}/>
          </div>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="password">Password</label>
          </div>
          <div className="col-75">
            <input type="password" id="password" name="password" placeholder="Your password..." value={this.state.password} onChange={this.handleChange}/>
          </div>
        </div>
        
        <div className="row">
          <input type="submit" value="Sign Up"/>
        </div>
      </form>
      <div className="row">
        <div>I have an account : <button onClick={this.signIn}>Sign In</button></div>
      </div>
    </div>
    </div>
    );      
  }
}

export default SignInUp;
