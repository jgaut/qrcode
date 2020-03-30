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

    /*this.minFields = {
      nom: '',
      prenom: '',
      age: '',
      gs:'',
      notes:'',
      image:''
    };*/

    this.minFields = [
      {'l':'nom', 'v': '', 'p':0},
      {'l':'prenom', 'v': '', 'p':1},
      {'l':'age', 'v': '', 'p':2},
      {'l':'gs', 'v': '', 'p':3},
      {'l':'notes', 'v': '', 'p':4},
      {'l':'image', 'v': '', 'p':5}
    ];

    this.code = '';
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
    this.Reset = this.Reset.bind(this);
    this.ShowState = this.ShowState.bind(this);

    Auth.currentAuthenticatedUser({bypassCache: false})
    .then(user => {
      this.sub = user.attributes.sub;
      //console.log(JSON.stringify(user));
      this.file = this.sub+'.json';
      this.level = 'public' ;
      console.log(user.identityId);
      this.forceUpdate();
      this.Load();
    })
    .catch(err => console.log(err));
    

    initTools();
 	}

  Reset(){
    for(var k in this.state){
      var tmp = this.state[k];
      tmp.v=""
      this.setState({[k]: tmp}, ()=>{this.ischange=true;this.Save();});
    }
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
      /*var tmpCode = new Mnemonic(Mnemonic.Words.FRENCH);
      ls.set(this.sub, tmpCode.toString());*/
      this.props.history.push('/bip39');
    }

    this.code = ls.get(this.sub);
    var hash = sha512(this.code);
    this.hash = hash.toString('hex');

    await Storage.get(this.file, {level: this.level})
      .then(result => {
        //console.log("result : " +result.toString());
        fetch(result)
          .then(response =>
          {
            if (!response.ok) {
              for (var key in this.minFields){
                //console.log('add field : '+key +'==>'+myData[key]);
                if(!this.state[key]){
                  //console.log('add field : '+key +'==>'+this.state[key]);
                  this.setState({[key]:''});  
                }
              }
            }
            return response;})
            .then(data => {

              //console.log("myData : "+JSON.stringify(data));
              
              if(data===""){
                console.log("data is empty");
              }else{

              }

              //Unzip
              data.arrayBuffer()
                .then(data=>{
                  ungzip(arrayBufferToBuffer(data))
                    .then((data) => {

                      //Init with minimum fileds
                      var myData = this.minFields;
                      //console.log(this.minFields);

                      //Add storaged fields
                      var tmpData = JSON.parse(data.toString());
                      //tmpData['10']={'prenom':{'v':'X', 'p':10}};
                      //console.log(tmpData);
                      for (var key in tmpData){
                        //console.log("Storaged fields => "+key+" : "+tmpData[key].v +" in "+tmpData[key].p);
                        if(tmpData[key].v){
                          for(var key2 in myData){
                            //console.log("Actual table => " + key + " + " +myData[key]);
                            if(myData[key2].l===tmpData[key].l){
                              myData[key2].v=tmpData[key].v;
                              myData[key2].p=tmpData[key].p;
                            }
                          }
                          //myData[key]=tmpData[key];
                        }
                      }
                      
                      //console.log("uncrypt");
                      for (key in myData) {
                        //console.log(key + " : " + JSON.stringify(myData[key]));
                        this.loadAsync(key, myData[key]);
                      }

                      //console.log(myData);
                      
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

  async loadAsync(key, obj){
    //console.log(key+" : " +obj.l+" : "+obj.v+" : "+obj.p);
    obj.v = await decodePgp(obj.v, this.code);
    //console.log("decrypt : " +obj.v);
    this.setState({[key]: obj});
    //console.log(this.state);
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
    //console.log(this.state);
    var copyState=JSON.parse(JSON.stringify(this.state));

    //console.log("this.copyState :" + JSON.stringify(this.copyState));
    for (var key in copyState) {
      //console.log(key, " => ", this.copyState[key]);
      if(copyState[key] && copyState[key].v!==''){
        //console.log(key, " => ", copyState[key].v);
        copyState[key].v = await encodePgp(copyState[key].v, this.code);
        //console.log(key, " => ", copyState[key].v);
      }
      
      //console.log(key, " => ", this.copyState[key]);
    }
    //console.log("Save this.copyState :" + JSON.stringify(this.copyState));
    //console.log("compressed : "+compressed);
    console.log(JSON.stringify(copyState));
    Storage.put(this.file, await gzip(JSON.stringify(copyState)), {
      level: this.level,
      contentType: 'text/plain'
    })
    .then (result => {
      console.log("Data saved");
      this.ischange=false;
    })
    .catch(err => console.log(err));
    //console.log(this.state);
  }

  handleChange(event) {
    //console.log('handleChange');
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const id = target.id;
    //console.log(target);
    //console.log(this.state[id]);
    //console.log(this.state);
    var tmp=this.state[id];
    tmp.v=value;
    //console.log(tmp);
    this.setState({[id] : tmp},()=>{this.ischange=true;});
    //console.log(this.state);
  }

  ChangeMasterKey(){
    this.props.history.push('/bip39');
  }

  DeletePicture(){
    for(var k in this.state){
      if(this.state[k].l==='image'){
        var tmp = this.state[k];
        tmp.v="";
        this.setState({[k]: tmp}, ()=>{this.ischange=true; this.Save();});
      }
    }
  }
  

  processItems(itemArray) {

    // Create an empty array that will hold the final JSX output.
    let buffer = [];

    //console.log(this.state);
    //console.log("Process graphics");
    for (var key in itemArray) {
      //console.log(key);
      ///console.log(itemArray[key]);
      let obj = itemArray[key];
      if(obj.l === 'image'){
        //console.log(obj.v);
          buffer.unshift(
            <div className="row" key={key} style={{"textAlign": "center"}}>
              <img src={obj.v==="" || obj.v===undefined?"":"data:image/png;base64,"+obj.v} alt="Profile picture" style={!obj.v || obj.v===''?{visibility: 'hidden' }:{ width: this.sizePict+'px' }}/>
              <br></br>
               <input type="file"
                      id="avatar" name="avatar"
                      accept="image/png, image/jpeg" onChange={this.handleFiles} />
         <button onClick={this.DeletePicture}>Delete picture</button>
            </div>

          );
        
      }else{
        buffer.push(
          <div className="row" key={key+":"+obj.l}>
            <div className="col-25">
              <label htmlFor={obj.l}>{obj.l}</label>
            </div>
            <div className="col-75">
              <input type="text" id={key} name={obj.l} placeholder={obj.l} value={this.state[key].v} onChange={this.handleChange} onBlur={this.Save}/>
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
        <button onClick={this.Reset}>Reset</button>  
        <button onClick={this.ShowState}>ShowState</button>  
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

  ShowState(){
    console.log(this.state);
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
          //console.log(event.target.files[0]);
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
                    for(var k in this.state){
                      if(this.state[k].l==='image'){
                        var tmp = this.state[k];
                        tmp.v=img[1];
                        this.setState({[k]: tmp}, ()=>{this.ischange=true; this.Save();});
                      }
                    }
                },
                'base64'
            );
        }
  }


  render() {
    this.qrcodeValue = awsmobile.aws_content_delivery_url+"/getinfos/"+encodeURIComponent(this.sub)+encodeURIComponent(this.code);
    //this.qrcodeValue = "http://localhost:3000"+"/getinfos/"+encodeURIComponent(this.sub)+"/"+encodeURIComponent(this.code);
    //this.dataLink = "https://s3-eu-west-1.amazonaws.com/qrcodebbae64624e2c4eaa95c85650b48ffb6c/public/"+this.sub+".json";
    //console.log(this.qrcodeValue);

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
