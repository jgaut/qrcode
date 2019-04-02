import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import * as openpgp from 'openpgp'

//const openpgp = require('openpgp');

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
    this.sub = '';
    this.ischange=false;

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);


    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      //console.log(this.sub);
      this.Load();
    })
    .catch(err => console.log(err));
    
 	}

  async encodePgp(message, code){

    var options, encrypted;

    options = {
        message: openpgp.message.fromText(message),
        passwords: [code],
        armor: false
    };

    openpgp.encrypt(options).then(async function(ciphertext) {
        encrypted = ciphertext.message.packets.write();
        console.log(encrypted); // get raw encrypted packets as Uint8Array
        var string = new TextDecoder("utf-8").decode(encrypted);
        console.log(string);
        return string;
    });

  }

    async decodePgp(message, code){

    
      var uint8array = new TextEncoder("utf-8").encode(message);
      var options;

      options = {
        message: await openpgp.message.read(uint8array), // parse encrypted bytes
        passwords: [code],              // decrypt with password
        format: 'binary'                          // output as Uint8Array
      };

      openpgp.decrypt(options).then(function(plaintext) {
          console.log(plaintext.data); // Uint8Array([0x01, 0x01, 0x01])
          var string = new TextDecoder("utf-8").decode(plaintext.data);
          console.log(string);
          return string;
      });

  }

  Load(){
    
    /*var tmp = this.encodePgp("la maison est belle et oui !", this.code);
    console.log(tmp);

    tmp = this.decodePgp(tmp, this.code);
    console.log(tmp);*/

    if(!Mnemonic.isValid(ls.get(this.sub))){
      console.log("need to generate a new mnemonic");
      //this.props.history.push('/bip39');
      //console.log(code.toString());
      var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());
    }
    this.code = ls.get(this.sub);
    //console.log("mnemonic code : " + this.code);

    Storage.get(this.sub+'.json', {level: 'public'})
      .then(result => {
        //console.log('get result'+result);

        fetch(result)
          .then(response => response.json())
            .then(data => {
              //console.log("data :" + JSON.stringify(data));
              for (var key in data) {
                this.setState({
                  [key]: this.decodePgp(data[key], this.code)
                });
              }
              /*
              this.setState({nom:data.nom});
              this.setState({prenom:data.prenom});
              this.setState({age:data.age});
              this.setState({notes:data.notes});
              */
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

  async Save(){
    if(this.ischange){
    //console.log("Save my data !");
    var dataTmp = {...this.state};
    for (var key in dataTmp) {
      var tmp = dataTmp[key];
      dataTmp[key] = await this.encodePgp(tmp, this.code);
    }
    console.log(dataTmp);
    console.log(this.state);

    Storage.put(this.sub+".json", JSON.stringify(dataTmp), {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {console.log(result);})
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
    //console.log(qrcodeValue);
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
