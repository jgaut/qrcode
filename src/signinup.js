import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class SignInUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      err: '',
      hName: Math.random(),
      hType:'hidden',
      hValue:'',
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
    if(this.state.hValue!==""){
      return;
    }
    
    var username = this.state.email;
    var email = this.state.email;
    var password = this.state.password;

    Auth.signUp({username, password, attributes:{email}})
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
      if(err && err.code && typeof err.code != 'undefined' && err.code === 'UsernameExistsException'){

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
          console.log(err);
          if(err && err.code && typeof err.code != 'undefined' && err.code === 'UserNotConfirmedException'){
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
      <div>
    <h1 style={{"textAlign": "center"}}>Profile</h1>
    <table>    
      <tr>
          <td>
            <label>Email</label>
          </td>
          <td>
            <input type="text" name="email" value={this.state.email} onChange={this.handleChange}/>
          </td>
        </tr>
                <tr>
          <td>
            <label>Password</label>
          </td>
          <td>
            <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
          </td>
        </tr>
        <tr>
          <td colspan='2'>
            <input name={this.state.hName} type={this.state.hType} value={this.state.hValue}/>
          </td>
        </tr>
        <tr>
          <td colspan='2'>
            <button onClick={this.onSubmit}>Sign In - Sign Up</button>
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

export default SignInUp;
