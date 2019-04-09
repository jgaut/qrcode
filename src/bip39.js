import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';

Amplify.configure(awsmobile);

class Bip39 extends Component {

	constructor(props) {
    super(props);
    this.state = {
      actualKey:'',
      newKey:''
    };

    this.sub='';

    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      this.state.actualKey=ls.get(this.sub);
    })
    .catch(err => console.log(err));

    this.handleChange = this.handleChange.bind(this);
    this.Generate = this.Generate.bind(this);
    this.Validate = this.Validate.bind(this);
    this.Cancel = this.Cancel.bind(this);

 	}

  componentWillMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {}
    ).catch((err) => {
      console.log("err : "+ err);
      this.props.history.push('/signinup');
      }
    )  
  }

  Cancel(){
    this.props.history.push('/');
  }

  Validate(){
    console.log("Change my master key");
    ls.set(this.sub, this.state.newKey);
    this.props.history.push('/');
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

  Generate(){
    console.log("need to generate a new mnemonic");
    this.setState({newKey: new Mnemonic(Mnemonic.Words.FRENCH)});
  }

  render() {

    return (
    	<div>
    	<h1>Master Key</h1><br></br>
      		<label>Actual key</label> <label>{this.state.actualKey}</label><br></br>
      		<label>New key</label> <input type="text" name="newKey" value={this.state.newKey} onChange={this.handleChange}/><br></br>
          <button onClick={this.Generate}>Generate</button><br></br>
      		<button onClick={this.Validate}>Validate</button><br></br>
          <button onClick={this.Cancel}>Cancel</button><br></br>

		</div>
    );
      
  }
}

export default Bip39;
