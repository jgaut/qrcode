import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import QRCode from 'qrcode.react';
import ls from 'local-storage';
import Mnemonic from 'bitcore-mnemonic';
import Resizer from 'react-image-file-resizer';
import {gzip, ungzip} from 'node-gzip';
import sha512 from 'sha512';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';
import {encodePgp, decodePgp, initTools} from './tools.js';

Amplify.configure(awsmobile);

class Profile extends Component {

	constructor(props) {
    super(props);
    this.state = {};

    this.minFields = {
      nom: '',
      prenom: '',
      age: '',
      gs:'',
      notes:'',
      image:''
    };

    this.code = '';
    this.copyState={};
    this.sub = '';
    this.ischange=false;
    this.qrcodeValue = '';
    this.qrcodesize = 350;
    this.dataLink = '';
    this.QRCodeVisibility='none';
    this.err='';
    this.sizePict=350;

    this.handleChange = this.handleChange.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.Save = this.Save.bind(this);
    this.Load = this.Load.bind(this);
    this.loadAsync = this.loadAsync.bind(this);
    this.ChangeMasterKey = this.ChangeMasterKey.bind(this);
    this.processItems = this.processItems.bind(this);
    this.ShowQRCode = this.ShowQRCode.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
    this.DeletePicture = this.DeletePicture.bind(this);

    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      //console.log(JSON.stringify(user));
      this.file = 'data.json';
      this.level = 'private' ;
      console.log(user.identityId);
      this.forceUpdate();
      this.Load();
    })
    .catch(err => console.log(err));
    
    initTools();
 	}

  componentDidMount(){
    Auth.currentAuthenticatedUser({bypassCache: false})
    .then((user) => {}
    ).catch((err) => {
      console.log("err : "+ err);
      this.props.history.push('/');
      }
    );
    
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
    //console.log('hash : ' + hash);
    //console.log("https://"+awsmobile.aws_user_files_s3_bucket+".s3."+awsmobile.aws_user_files_s3_bucket_region+".amazonaws.com/public/"+this.sub+"_____"+this.hash+".json");
    
    /*Storage.list('', {level: 'public'})
      .then(result => console.log(result))
      .catch(err => console.log(err));
    */

    await Storage.get(this.file, {level: this.level})
      .then(result => {
        console.log("result : " +result.toString());
        fetch(result)
          .then(response =>
          {
            if (!response.ok) {
              for (var key in this.minFields){
                //console.log('add field : '+key +'==>'+myData[key]);
                if(!this.state[key]){
                  console.log('add field : '+key +'==>'+this.state[key]);
                  this.setState({[key]:''});  
                }
              }
            }
            return response;})
            .then(data => {

              console.log("myData : "+JSON.stringify(data));
              
              if(data===""){
                console.log("data is empty");
              }else{

              }

              //Unzip
              data.arrayBuffer()
                .then(data=>{
                  //console.log(arrayBufferToBuffer(data));
                  ungzip(arrayBufferToBuffer(data))
                    .then((data) => {
                      //console.log("data :" + data+ " -- "+data.length); 
                      var myData = JSON.parse(data.toString());
                      if(myData.nom!==undefined){

                        for (var key in this.minFields){
                          //console.log('add field : '+key +'==>'+myData[key]);
                          if(!myData[key]){
                            //console.log('add field : '+key +'==>'+myData[key]);
                            myData[key]='';  
                          }
                        }

                        for (key in myData) {
                          this.loadAsync(key, myData[key]);
                        }
                      }else{
                        for (key in this.minFields){
                          //console.log('add field : '+key +'==>'+myData[key]);
                          
                            //console.log('add field : '+key +'==>'+myData[key]);
                            this.setState({[key]:''});  
                          
                        }
                        console.log("NEW data :" + JSON.stringify(this.state) + " -- "+ this.state.length);
                      }
                    });
                })
                .catch(error => {console.log(error)});              
            })
            .catch(error => {console.log(error);
          })
          .catch(error=>{console.log(error)});
      })
      .catch(error => console.log(error));
  }

  async loadAsync(key, message){
    //console.log(message);
    this.setState({[key]: await decodePgp(message, this.code)});
  }

	LogOut(){
    Auth.signOut()
    .then((data) => {
        this.props.history.push('/');
      })
      .catch(err => console.log(err));  
  }

  async Save(){

    if(!this.ischange){
      return;
    }
    console.log("Process to save data...");
    this.copyState = {...this.state};
    //console.log("this.copyState :" + JSON.stringify(this.copyState));
    for (var key in this.copyState) {
      //console.log(key, " => ", this.copyState[key]);
      if(this.copyState[key] && this.copyState[key]!==''){
        //console.log(key, " => ", this.copyState[key]);
        this.copyState[key] = await encodePgp(this.copyState[key], this.code);
      }
      
      //console.log(key, " => ", this.copyState[key]);
    }
    //console.log("Save this.copyState :" + JSON.stringify(this.copyState));
    //console.log("compressed : "+compressed);
    Storage.put(this.file, await gzip(JSON.stringify(this.copyState)), {
      level: this.level,
      contentType: 'text/plain'
    })
    .then (result => {
      console.log("Data saved");
      this.ischange=false;
    })
    .catch(err => console.log(err));
  }

  handleChange(event) {

    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value},()=>{this.ischange=true;});
  }

  ChangeMasterKey(){
    this.props.history.push('/bip39');
  }

  DeletePicture(){
    this.setState({['image']: ''}, ()=>{this.ischange=true; this.Save();});
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
            <img src={this.state[myKey] || this.state[myKey]===undefined?"":"data:image/png;base64,"+this.state[myKey]} alt="Profile picture" style={!this.state[myKey] || this.state[myKey]===''?{visibility: 'hidden' }:{ width: this.sizePict+'px' }}/>
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
    this.qrcodeValue = awsmobile.aws_content_delivery_url+"/getinfos?"+encodeURIComponent("uuid=")+encodeURIComponent(this.sub)+encodeURIComponent("&code=")+encodeURIComponent(this.code);
    //this.dataLink = "https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.sub+".json";
    console.log(this.qrcodeValue);

    return (
    <div>
      <div className="row" style={{"textAlign": "center"}}>
        <h1>Profile</h1>
      </div>
      {this.processItems(this.state)}
    </div>  
    );
      
  }
}

export default Profile;
