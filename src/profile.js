import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import * as openpgp from 'openpgp';

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
    super(props);
    this.state = {
      nom: '',
      prenom: '',
      age: '',
      gs:'',
      notes:'',
    };

    openpgp.config.debug = true;

    openpgp.initWorker({ path: '/openpgp/dist/compat/openpgp.worker.min.js'});

    this.code = '';
    this.copyState={};
    this.sub = '';
    this.ischange=false;
    this.cpt=0;
    this.XX='';

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);
    this.encodePgp = this.encodePgp.bind(this);
    this.decodePgp = this.decodePgp.bind(this);
    this.waitForSave = this.waitForSave.bind(this);
    this.ChangeMasterKey = this.ChangeMasterKey.bind(this);
    this.processItems = this.processItems.bind(this);


    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      this.forceUpdate();
      this.Load();
    })
    .catch(err => console.log(err));
    
 	}

  componentWillMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {}
    ).catch((err) => {
      console.log("err : "+ err);
      this.props.history.push('/');
      }
    )  
  }

  async encodePgp(key, message, code){

    if(message===""){
      this.cpt=this.cpt-1;
      return;
    }
    var options, encrypted;
    var uint8array = new TextEncoder("utf-8").encode(message);

    //console.log(key, message, code);

    options = {
        message: await openpgp.message.fromBinary(uint8array),
        passwords: [code],
        armor: false
    };

    openpgp.encrypt(options).then(
      async (ciphertext) => {
        encrypted = ciphertext.message.packets.write();
        var b64encoded = btoa(String.fromCharCode.apply(null, encrypted));
        this.copyState[key]=b64encoded;
        this.cpt=this.cpt-1;
      }
    );

  }

    async decodePgp(key, message, code){

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
      }).catch(err => {
        console.log("erreur lors du déchiffrement : " +err);
      });
    }

  Load(){

    if(!Mnemonic.isValid(ls.get(this.sub))){
      console.log("need to generate a new mnemonic");
      var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());
    }

    this.code = ls.get(this.sub);
    //this.setState({code:this.code});

    Storage.get(this.sub+'.json', {level: 'public'})
      .then(result => {
        fetch(result)
          .then(response => response.json())
            .then(data => {
              //console.log("data :" + JSON.stringify(data) + " -- "+data.length);
              if(data.nom!==undefined){
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
                //console.log("data :" + JSON.stringify(this.state) + " -- "+this.state.length);
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

  async Save(){
    if(this.ischange){
      console.log("Save my data !");
      this.copyState = {...this.state};
      //console.log("this.copyState :" + JSON.stringify(this.copyState));
      for (var key in this.state) {
        console.log(key, this.state[key]);
        this.cpt++;
        var t = this.state[key];
        this.encodePgp(key, t, this.code)
      }
      this.waitForSave();
    }
  }

  async waitForSave(){
    if (this.cpt>0){
      //console.log("wait for cpt : " + this.cpt);
      setTimeout(this.waitForSave, 100);
    } else {
      //console.log("Save this.copyState :" + JSON.stringify(this.copyState));
      Storage.put(this.sub+".json", JSON.stringify(this.copyState), {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {
        //console.log(result);
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

  ChangeMasterKey(){
    this.props.history.push('/bip39');
  }

  processItems(itemArray) {
    // Create an empty array that will hold the final JSX output.
    let buffer = []

    for (var key in itemArray) {
      buffer.push(<div>{key} :: itemArray[key]</div>);
    }

    // And return the buffer for display inside the render() function
    return (
        <div className="container flex center">
            {buffer}
        </div>
    );
  }

  render() {
    var qrcodeValue = "http://qrcode-20190329114756--hostingbucket.s3-website-eu-west-1.amazonaws.com/getinfos/"+encodeURIComponent(this.sub)+"/"+encodeURIComponent(this.code);
    var size = 512;
    var dataLink = "https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.sub+".json";

    return (
    	<div>
    	<h1>My profile</h1><br></br>
      <tr>
        <td valign="top" align="center" width="50%">

    		<tr>
        <td align="left">
        <label>Nom</label> 
        </td>
        <td>
        <input type="text" name="nom" value={this.state.nom} onChange={this.handleChange} onBlur={this.Save}/>
    		</td>
        </tr>

        <tr>
        <td align="left">
        <label>Prénom</label> 
        </td>
        <td>
        <input type="text" name="prenom" value={this.state.prenom} onChange={this.handleChange} onBlur={this.Save}/>
    		</td>
        </tr>

        <tr>
        <td align="left">
        <label>Age</label> 
        </td>
        <td>
        <input type="text" name="age" value={this.state.age} onChange={this.handleChange} onBlur={this.Save}/>
        </td>
        </tr>

        <tr>
        <td align="left">
        <label>Groupe sangin</label> 
        </td>
        <td>
        <input type="text" name="gs" value={this.state.gs} onChange={this.handleChange} onBlur={this.Save}/>
        </td>
        </tr>

        <tr>
        <td align="left">
        <label>Notes</label>
        </td>
        <td>
        <textarea name="notes" rows="5" value={this.state.notes} onChange={this.handleChange} onBlur={this.Save}/>
        </td>
        </tr>

        <tr>
        <td>
        <button onClick={this.LogOut}>Logout</button>
        </td>
        <td>
        <button onClick={this.ChangeMasterKey}>ChangeMasterKey</button>
        </td>
        </tr>

        </td>
        <td valign="top" align="center" width="50%">

        <QRCode value={qrcodeValue} size={size} includeMargin={true}/><br></br>
        <label>{this.code}</label><br></br>
        <a target="_BLANK" title="QRCode link" href={qrcodeValue}>
          Lien contenu dans le QRCode ci-dessus
        </a><br></br>
        <a target="_BLANK" title="Data link" href={dataLink}>
          Lien vers le fichier de données
        </a><br></br>

        </td>
      </tr>
      {this.processItems(this.state)}
		</div>
    );
      
  }
}

export default Profile;
