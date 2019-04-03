import React, { Component } from 'react';
import './App.css';
import * as openpgp from 'openpgp'

class Profile extends Component {

	constructor(props) {
	    super(props);
	    this.state = {
	      nom: '',
	      prenom: '',
	      age: '',
	    };

  const { params } = this.props.match;
  this.uuid = params.uuid;
  this.key = params.key;

  //console.log("uuid : " + this.uuid);
  //console.log("key : " + this.key);
  
  openpgp.config.debug = true;

  openpgp.initWorker({ path: '/openpgp/dist/compat/openpgp.worker.js'});

  this.Load();
 	}

  async Load(){
    fetch("https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.uuid+".json")
    .then(response => response.json())
      .then(data => {
        //console.log("data :" + JSON.stringify(data));
        for (var k in data) {
          this.decodePgp(k, data[k], this.key);
        }
      })
      .catch(error => {console.log(error);});
  }

  async decodePgp(key, message, code){
    //console.log(message);
    if(message===""){
      return;
    }
    var u8_2 = new Uint8Array(atob(message).split("").map(function(c) {return c.charCodeAt(0); }));
    var options;
    
    options = {
      message: await openpgp.message.read(u8_2),
      passwords: [code],
      format: 'binary'
    };

    openpgp.decrypt(options).then((plaintext)=> {
        var string = new TextDecoder("utf-8").decode(plaintext.data);
        //console.log("decode string : " + string);
        this.setState({
          [key]: string
        });
    });
  }

  render() {
    return (
    	<div>
    	<h1>My profile</h1><br></br>
      		<label>Nom</label> <input type="text" name="nom" value={this.state.nom} readOnly/><br></br>
          <label>Prénom</label> <input type="text" name="prenom" value={this.state.prenom} readOnly/><br></br>
          <label>Age</label> <input type="text" name="age" value={this.state.age} readOnly/><br></br>
          <label>Notes</label> <textarea name="notes" rows="5" value={this.state.notes} readOnly/><br></br>
		</div>
    );
      
  }
}

export default Profile;
