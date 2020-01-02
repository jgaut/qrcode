import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import * as openpgp from 'openpgp';
import Resizer from 'react-image-file-resizer';
import {gzip, ungzip} from 'node-gzip';
import sha512 from 'sha512';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';

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
      image:''
    };

    openpgp.config.debug = true;

    openpgp.initWorker({ path: 'openpgp.worker.min.js'});

    this.code = '';
    this.copyState={};
    this.sub = '';
    this.ischange=false;
    this.cpt=0;
    this.qrcodeValue = '';
    this.qrcodesize = 350;
    this.dataLink = '';
    this.QRCodeVisibility='none';
    this.err='';
    this.sizePict=350;
    this.hash='';

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);
    this.encodePgp = this.encodePgp.bind(this);
    this.decodePgp = this.decodePgp.bind(this);
    this.waitForSave = this.waitForSave.bind(this);
    this.ChangeMasterKey = this.ChangeMasterKey.bind(this);
    this.processItems = this.processItems.bind(this);
    this.ShowQRCode = this.ShowQRCode.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
    this.DeletePicture = this.DeletePicture.bind(this);

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
    );
    
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
        this.err = "Erreur lors du déchiffrement : Veuillez vérifier votre master key.";
      });
    }

  async Load(){

    if(!Mnemonic.isValid(ls.get(this.sub))){
      console.log("need to generate a new mnemonic");
      var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());
    }

    this.code = ls.get(this.sub);
    var hash = sha512(this.code);
    this.hash = hash.toString('hex');
    console.log('hash : ' + hash);
    console.log("https://"+awsmobile.aws_user_files_s3_bucket+".s3."+awsmobile.aws_user_files_s3_bucket_region+".amazonaws.com/public/"+this.sub+"_____"+this.hash+".json");
    
    await Storage.get(this.sub+"_____"+this.hash+'.json', {level: 'public'})
      .then(result => {
        //console.log("result : " +result.toString());
        fetch(result)
          .then(response =>response)
            .then(data => {
              //Unzip
              data.arrayBuffer()
                .then(data=>{
                  //console.log(arrayBufferToBuffer(data));
                  ungzip(arrayBufferToBuffer(data))
                    .then((data) => {
                      console.log("data :" + data+ " -- "+data.length); 
                      var myData = JSON.parse(data.toString());
                      if(myData.nom!==undefined){
                        for (var key in myData) {
                          var t = myData[key];
                          this.decodePgp(key, t, this.code);
                        }
                      }else{
                        this.state = {
                          nom: '',
                          prenom: '',
                          age: '',
                          gs: '',
                          notes:'',
                        };
                        console.log("NEW data :" + JSON.stringify(this.state) + " -- "+ this.state.length);
                      }
                    });
                });              
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
      console.log("Process to save data...");
      this.copyState = {...this.state};
      //console.log("this.copyState :" + JSON.stringify(this.copyState));
      for (var key in this.state) {
        console.log(key, " => ", this.state[key]);
        this.cpt++;
        var t = this.state[key];
        await this.encodePgp(key, t, this.code)
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
      var compressed = await gzip(JSON.stringify(this.copyState));
      //console.log("compressed : "+compressed);
      Storage.put(this.sub+"_____"+this.hash+".json", compressed, {
        level: 'public',
        contentType: 'text/plain'
      })
      .then (result => {
        console.log("Data saved");
      })
      .catch(err => console.log(err));
      this.ischange=false;
    }
  }

  handleChange(event) {

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value});
    this.ischange=true;
  }

  ChangeMasterKey(){
    this.props.history.push('/bip39');
  }

  DeletePicture(){
    this.setState({['image']: ''}, ()=>{this.ischange=true;this.Save();});
  }
  

  processItems(itemArray) {

    // Create an empty array that will hold the final JSX output.
    let buffer = [];

    for (var key in itemArray) {
      //console.log(key);
      let myKey = key;
      if(key === 'image'){
        buffer.unshift(
          <div className="row" key={myKey} style={{"textAlign": "center"}}>
            <img src={"data:image/png;base64,"+this.state[myKey]} alt="Profile picture" style={this.state[myKey]===''?{visibility: 'hidden' }:{ width: this.sizePict+'px' }}/>
            <br></br>
             <input type="file"
       id="avatar" name="avatar"
       accept="image/png, image/jpeg" onChange={this.handleFiles} />
       <button onClick={this.DeletePicture}>Delete picture</button>
          </div>

        );
      }else{
        buffer.push(
          <div className="row" key={myKey}>
            <div className="col-25">
              <label htmlFor={myKey}>{myKey}</label>
            </div>
            <div className="col-75">
              <input type="text" id={myKey} name={myKey} placeholder={myKey} value={this.state[myKey]} onChange={this.handleChange} onBlur={this.Save}/>
            </div>
          </div>
        );
      }
    }

    // And return the buffer for display inside the render() function
    return (
      <div className="container">
      
      {buffer}

      <div className="row" style={{"textAlign": "center"}}>
        <button onClick={this.LogOut}>Logout</button>
        <button onClick={this.ChangeMasterKey}>ChangeMasterKey</button>
        <button onClick={this.ShowQRCode}>Show/Hide QRCode</button>  
      </div>
      
      <div className="row" style={{"display":this.QRCodeVisibility, "textAlign": "center"}}>
        <QRCode value={this.qrcodeValue} size={this.qrcodesize} includeMargin={true}/>
      </div>

      <div className="row" style={{"textAlign": "center", color:'red'}}>
        <label>{this.err}</label>
      </div>
  
    </div>
    );
  }

  ShowQRCode() {
    if(this.QRCodeVisibility==="none"){
      this.QRCodeVisibility="";
    }else{
      this.QRCodeVisibility="none";
    }
    this.forceUpdate();
  }

  handleFiles(event){
    var fileInput = false
        if(event.target.files[0]) {
            fileInput = true
        }
        if(fileInput) {
          console.log(event.target.files[0]);
          this.err = JSON.stringify(event.target.files[0]);
            Resizer.imageFileResizer(
                event.target.files[0],
                this.sizePict,
                this.sizePict,
                'JPEG',
                100,
                0,
                uri => {
                    //console.log(uri);
                    var img = uri.split("base64,");
                    this.setState({image : img[1]});
                    this.ischange=true;
                    this.Save();
                },
                'base64'
            );
        }
  }


  render() {
    this.qrcodeValue = awsmobile.aws_content_delivery_url+"/getinfos/"+encodeURIComponent(this.sub)+"/"+encodeURIComponent(this.code);
    //this.dataLink = "https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.sub+".json";

    return (
    <div>
    <h1 style={{"textAlign": "center"}}>Profile</h1>

    {this.processItems(this.state)}
    
    
    </div>  
    );
      
  }
}



export default Profile;
