import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import * as openpgp from 'openpgp'

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
    super(props);
    this.state = {
      nom: '',
      prenom: '',
      age: '',
      notes:'',
    };

    openpgp.initWorker({ path: 'openpgp/dist/compat/openpgp.worker.js'});

    this.code = '';
    this.copyState={};
    this.sub = '';
    this.ischange=false;

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);
    this.encodePgp = this.encodePgp.bind(this);
    this.decodePgp = this.decodePgp.bind(this);

    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      this.Load();
    })
    .catch(err => console.log(err));
    
 	}

  async encodePgp(key, message, code){

    if(message==""){
      return;
    }
    var options, encrypted;

    options = {
        message: openpgp.message.fromText(message),
        passwords: [code],
        armor: false
    };

    openpgp.encrypt(options).then((ciphertext)=> {
        encrypted = ciphertext.message.packets.write();
        var string = new TextDecoder("utf-8").decode(encrypted);
        this.copyState[key]=string;
    });

  }

    async decodePgp(key, message, code){

      if(message==""){
        return;
      }
    
      var uint8array = new TextEncoder("utf-8").encode(message);
      var options;

      options = {
        message: await openpgp.message.read(uint8array),
        passwords: [code],
        format: 'binary'
      };

      openpgp.decrypt(options).then((plaintext)=> {
          var string = new TextDecoder("utf-8").decode(plaintext.data);
          console.log("decode string : " + string);
          this.setState({
            [key]: string
          });
      });
  }

  Load(){

    if(!Mnemonic.isValid(ls.get(this.sub))){
      console.log("need to generate a new mnemonic");
      var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());
    }
    this.code = ls.get(this.sub);

    Storage.get(this.sub+'.json', {level: 'public'})
      .then(result => {
        fetch(result)
          .then(response => response.json())
            .then(data => {
              console.log("data :" + JSON.stringify(data) + " -- "+data.length);
              if(data.nom!=undefined){
                for (var key in data) {
                  var t = data[key];
                  this.decodePgp(key, t, this.code);
                }
              }else{
                this.state = {
                  nom: '',
                  prenom: '',
                  age: '',
                  notes:'',
                };
                console.log("data :" + JSON.stringify(this.state) + " -- "+this.state.length);
              }
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
    //console.log("Save my data !");
    this.copyState = {...this.state};
    console.log("copyState :" + JSON.stringify(copyState));
    for (var key in this.state) {
      var t = this.state[key];
      this.encodePgp(key, t, this.code)
    }

    console.log("this.state :" + JSON.stringify(this.copyState));
    Storage.put(this.sub+".json", JSON.stringify(this.copyState), {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {
        console.log(result);
      })
      .catch(err => console.log(err));
    this.ischange=false;
    }  
  }

  handleChange(event) {

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
    var size = 512;

    return (
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange} onBlur={this.Save}/><br></br>
      		<label>Age</label> <input type="text" name="age" value={this.state.age} onChange={this.handleChange} onBlur={this.Save}/><br></br>
          <label>Notes</label> <textarea name="notes" rows="5" value={this.state.notes} onChange={this.handleChange} onBlur={this.Save}/><br></br>
          <button onClick={this.LogOut}>Logout</button><br></br>
          <QRCode value={qrcodeValue} size={size} includeMargin={true}/>
		</div>
    );
      
  }
}

export default Profile;
