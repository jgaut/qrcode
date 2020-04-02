import React, { Component } from 'react';
import './App.css';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import img from './logo.png';

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

  }


  componentDidMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
      .then(user => {
        console.log(user);
        this.setState({['email']:user.attributes.email});
      })
      .catch((err) => {
        console.log("err : "+ err);
        this.setState({['email']:err});
        this.props.history.push('/');
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

  handleSubmit(){

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
    <div className="logo"><img src={img}/></div>
      <div className="container">
      <div style={{"textAlign": "left"}}>
        <h2>Account validation</h2>
      </div>
      <form onSubmit={this.handleSubmit}>
        
        <div className={this.state.error==='' ? 'hidden-label': 'row error-label'}>
          <label>{this.state.error}</label>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="email">{this.state.email}</label>
          </div>
        </div>
        
        <div className="row">
          <div className="col-25">
            <label htmlFor="password">Code</label>
          </div>
          <div className="col-75">
            <input type="text" id="validationcode" name="validationcode" placeholder="Your validation code..." value={this.state.code} onChange={this.handleChange}/>
          </div>
        </div>
        
        <div className="row">
          <input type="submit" value="Sign Up"/>
        </div>
      </form>
      <div className="row">
       <label>{this.state.err}</label>
      </div>
    </div>
    </div>
    );
  }
}

export default SignInConfirm;
