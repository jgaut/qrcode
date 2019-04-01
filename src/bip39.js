import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';

Amplify.configure(awsmobile);

class Bip39 extends Component {

	constructor(props) {
    super(props);
    this.state = {
    };

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);

    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      console.log(this.sub);
      this.Load();
    })
    .catch(err => console.log(err));

    var code = new Mnemonic(Mnemonic.Words.FRENCH);
    console.log(code.toString());
    
 	}

  Save(){
    if(this.ischange){
    console.log("Save my data !");
    Storage.put(this.sub+".json", JSON.stringify(this.state), {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {console.log(result);})
      .catch(err => console.log(err));
    this.ischange=false;
    }  
  }

  handleChange(event) {
    //console.log(event.target);

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    this.ischange=true;
  }

  render() {

    return (
    	<div>
    	<h1>Master Key</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<button onClick={this.LogOut}>Logout</button><br></br>
          <QRCode value={qrcodeValue} size={size} />
		</div>
    );
      
  }
}

export default Bip39;
