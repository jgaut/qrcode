import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      value:''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    //console.log(event.target);
    /*switch(event.target.name){
      case 'email' :
        this.setState({email: event.target.value});
        break;
      case 'password' :
        this.setState({password: event.target.value});
        break;
    }*/

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + JSON.stringify(this.state));
    event.preventDefault();

      Auth.signUp(this.state.email, this.state.password)
      .then((data) => {
        console.log(data);
        navigate('SignUpConfirm', {username: data.user.username});
      })
      .catch((err) => {
        console.log(err);
        if(err && err.code && typeof err.code != 'undefined' && err.code == 'UsernameExistsException'){

          // For advanced usage
          // You can pass an object which has the username, password and validationData which is sent to a PreAuthentication Lambda trigger
          Auth.signIn({
              username, // Required, the username
              password, // Optional, the password
          }).then((user) => {
            console.log(user);
            navigate('App', {number: Math.random()});
            }
          )
          .catch((err) => {
            console.log(err);
            if(err && err.code && typeof err.code != 'undefined' && err.code == 'UserNotConfirmedException'){
              navigate('SignUpConfirm', {username: this.state.email});
            }else{
              this.setState({ err: err.message || err || ''});
              this.setState({errColor: '#000000'}); 
            }
            }
          );
        }else{
            this.setState({errColor: '#000000'}); 
            this.setState({ err: err.message || err || ''});

        }
      }
      );

  }

  render() {


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

    return (
      <div className="App">
        <header className="App-header">
          
          <form onSubmit={this.handleSubmit}>
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
  }
}

export default App;
