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
    this.signUp = this.signUp.bind(this);

  }

  signUp(){
    this.props.history.push({
          pathname: '/signup'
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

    console.log(event);
    console.log(event.target);
    var username = this.state.email;
    var password = this.state.password;

    // For advanced usage
    // You can pass an object which has the username, password and validationData which is sent to a PreAuthentication Lambda trigger
    Auth.signIn({
        username, // Required, the username
        password,// Optional, the password
        
    }).then((user) => {
      console.log(user);
      this.props.history.push('/', {p:this.state.password});
      }
    )
    .catch((err) => {
      console.log(err.message);
      this.setState({ error: err.message || err || ''});
      if(err && err.code && typeof err.code != 'undefined' && err.code === 'UserNotConfirmedException'){
        this.props.history.push({
          pathname: '/signinconfirm',
          search: '',
          state: { email: username }
        });
      }else{
        this.setState({ error: err.message || err || ''});
        //this.setState({errColor: '#000000'}); 
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
        <h2>Sign in</h2>
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
          <input type="submit" value="Sign In"/>
        </div>
      </form>
      <div className="row">
        <div>Create a new account<button onClick={this.signUp}>Sign Up</button></div>
      </div>
    </div>
    </div>



    

    );      
  }
}

export default SignInUp;
