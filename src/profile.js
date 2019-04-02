import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp

openpgp.initWorker({ path:'openpgp.worker.min.js' }) 

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
    super(props);
    this.state = {
      nom: '',
      prenom: '',
      age: '',
    };

    this.code = '';
    this.sub = '';
    this.ischange=false;

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
    
 	}

  Load(){

    var options, encrypted;

options = {
    message: openpgp.message.fromBinary(new Uint8Array([0x01, 0x01, 0x01])), // input as Message object
    passwords: ['secret stuff'],                                             // multiple passwords possible
    armor: false                                                             // don't ASCII armor (for Uint8Array output)
};

openpgp.encrypt(options).then(function(ciphertext) {
    encrypted = ciphertext.message.packets.write(); // get raw encrypted packets as Uint8Array
    console.log(encrypted);
});

    
    if(!Mnemonic.isValid(ls.get(this.sub))){
      console.log("need to generate a new mnemonic");
      //this.props.history.push('/bip39');
      //console.log(code.toString());
      var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());
    }
    this.code = ls.get(this.sub);
    console.log("mnemonic code : " + this.code);

    Storage.get(this.sub+'.json', {level: 'public'})
      .then(result => {
        //console.log('get result'+result);

        fetch(result)
          .then(response => response.json())
            .then(data => {
              console.log("data :" + JSON.stringify(data));
              this.setState({nom:data.nom});
              this.setState({prenom:data.prenom});
              this.setState({age:data.age});
            })
            .catch(error => {console.log(error);
          });
      })
      .catch(err => console.log(err));
  }

	LogOut(){
    Auth.signOut()
    .then((data) => {
        this.props.history.push('/');
      })
      .catch(err => console.log(err));  
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
    var qrcodeValue = "http://qrcode-20190329114756--hostingbucket.s3-website-eu-west-1.amazonaws.com/getinfos/"+encodeURIComponent(this.sub)+"/"+encodeURIComponent(this.code);
    console.log(qrcodeValue);
    var size = 512;
    return (
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<button onClick={this.LogOut}>Logout</button><br></br>
          <QRCode value={qrcodeValue} size={size} />
		</div>
    );
      
  }
}

export default Profile;
